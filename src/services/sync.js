import db from '../db/database';

export async function enqueue(tipoAcao, payload) {
  return db.filaSincronizacao.add({
    tipo_acao: tipoAcao,
    payload,
    timestamp_criacao: new Date().toISOString(),
    status: 'pendente',
    tentativas: 0,
  });
}

export async function processarFila() {
  if (!navigator.onLine) return;

  const pendentes = await db.filaSincronizacao
    .where('status')
    .equals('pendente')
    .sortBy('timestamp_criacao');

  for (const item of pendentes) {
    try {
      const response = await fetch(`/api/${item.tipo_acao}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        await db.filaSincronizacao.update(item.id_local, {
          status: 'sincronizado',
        });
      } else {
        await incrementarTentativa(item.id_local);
      }
    } catch {
      await incrementarTentativa(item.id_local);
    }
  }
}

async function incrementarTentativa(id) {
  const item = await db.filaSincronizacao.get(id);
  if (!item) return;

  if (item.tentativas >= 5) {
    await db.filaSincronizacao.update(id, { status: 'erro' });
  } else {
    await db.filaSincronizacao.update(id, {
      tentativas: item.tentativas + 1,
    });
  }
}

export function iniciarSyncAutomatico() {
  window.addEventListener('online', processarFila);
  setInterval(() => {
    if (navigator.onLine) processarFila();
  }, 30000);
}

export function getStatusConexao() {
  if (!navigator.onLine) return 'offline';
  return 'online';
}
