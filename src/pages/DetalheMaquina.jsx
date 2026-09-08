import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import db from '../db/database';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/status';
import { formatarHorimetro } from '../utils/validadores';
import { processarFoto } from '../utils/imagemHelper';

export default function DetalheMaquina() {
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [maquina, setMaquina] = useState(null);
  const [plano, setPlano] = useState(null);
  const [itensPlano, setItensPlano] = useState([]);
  const [problemas, setProblemas] = useState([]);
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState('');

  useEffect(() => {
    carregar();
  }, [id]);

  async function carregar() {
    const m = await db.maquina.get(Number(id));
    setMaquina(m);

    if (m) {
      const p = await db.planoManutencao
        .where('maquina_id')
        .equals(m.id)
        .and((pl) => pl.ativo)
        .first();
      setPlano(p || null);

      if (p) {
        const itens = await db.itemPlano.where('plano_id').equals(p.id).toArray();
        setItensPlano(itens);
      }

      const probs = await db.problema
        .where('maquina_id')
        .equals(m.id)
        .and((pr) => pr.status !== 'resolvido')
        .toArray();
      setProblemas(probs);
    }
  }

  async function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessandoFoto(true);
      const dataUrl = await processarFoto(file);
      await db.maquina.update(Number(id), { foto_url: dataUrl });
      await carregar();
    } catch (err) {
      console.error('Erro ao atualizar foto:', err);
    } finally {
      setProcessandoFoto(false);
    }
  }

  async function handleAlterarStatusOperacional(novoStatus) {
    let statusCalculado = maquina.status_calculado;
    if (novoStatus === 'em_manutencao') {
      statusCalculado = 'vermelho';
    } else if (novoStatus === 'operacional' && statusCalculado === 'vermelho' && (!plano || plano.proximoHorimetro > maquina.horimetro_atual)) {
      statusCalculado = 'verde';
    }

    await db.maquina.update(Number(id), {
      status_operacional: novoStatus,
      status_calculado: statusCalculado,
    });

    setMensagemStatus(
      novoStatus === 'em_manutencao'
        ? '🚨 Máquina colocada EM MANUTENÇÃO (Parada na Oficina)'
        : novoStatus === 'aguardando_pecas'
        ? '🟡 Status alterado para AGUARDANDO PEÇAS'
        : '✅ Máquina LIBERADA PARA OPERAÇÃO'
    );
    setTimeout(() => setMensagemStatus(''), 4000);
    await carregar();
  }

  if (!maquina) {
    return (
      <div className="page">
        <header className="header">
          <Link to="/maquinas" className="btn btn-sm btn-secondary">← Máquinas</Link>
          <h1>Equipamento</h1>
          <span />
        </header>
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <p className="text-muted" style={{ marginBottom: 16 }}>Equipamento não encontrado ou ainda carregando.</p>
          <Link to="/maquinas" className="btn btn-sm">← Voltar para a lista de máquinas</Link>
        </div>
      </div>
    );
  }

  const faltamHoras = plano?.proximoHorimetro
    ? plano.proximoHorimetro - maquina.horimetro_atual
    : null;

  const statusOperacional = maquina.status_operacional || 'operacional';

  return (
    <div className="page">
      <header className="header">
        <Link to="/maquinas" className="btn btn-sm btn-secondary">← Máquinas</Link>
        <h1>{maquina.apelido}</h1>
        <span />
      </header>

      <div className="maquina-detalhe">
        {/* Banner de Foto e Ação de Troca de Imagem */}
        <div
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
            marginBottom: 16,
            position: 'relative',
            background: '#1e293b',
            textAlign: 'center',
          }}
        >
          {maquina.foto_url ? (
            <div style={{ position: 'relative' }}>
              <img
                src={maquina.foto_url}
                alt={maquina.apelido}
                style={{
                  width: '100%',
                  maxHeight: 280,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <button
                type="button"
                className="btn btn-sm btn-secondary no-print"
                onClick={() => fileInputRef.current?.click()}
                disabled={processandoFoto}
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  background: 'rgba(0, 0, 0, 0.75)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {processandoFoto ? 'Salvando...' : '📷 Trocar Foto'}
              </button>
            </div>
          ) : (
            <div style={{ padding: '24px 16px', color: '#94a3b8' }}>
              <span style={{ fontSize: 42, display: 'block', marginBottom: 8 }}>📷</span>
              <p className="text-sm" style={{ marginBottom: 12 }}>Nenhuma foto adicionada para esta máquina</p>
              <button
                type="button"
                className="btn btn-sm btn-secondary no-print"
                onClick={() => fileInputRef.current?.click()}
                disabled={processandoFoto}
              >
                {processandoFoto ? 'Processando...' : '📷 Tirar Foto / Adicionar'}
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFotoChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Notificação de mudança de status */}
        {mensagemStatus && (
          <div
            className="card"
            style={{
              marginBottom: 12,
              padding: 10,
              background: '#e0f2fe',
              border: '1px solid #7dd3fc',
              color: '#0369a1',
              fontWeight: 600,
              textAlign: 'center',
              fontSize: 14,
            }}
          >
            {mensagemStatus}
          </div>
        )}

        {/* Status de Oficina / Operação */}
        <div
          className="card no-print"
          style={{
            marginBottom: 16,
            background: statusOperacional === 'em_manutencao' ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${statusOperacional === 'em_manutencao' ? '#FCA5A5' : '#86EFAC'}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="info-label" style={{ fontWeight: 600 }}>Controle de Oficina / Frota:</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '4px 8px',
                borderRadius: 6,
                backgroundColor:
                  statusOperacional === 'em_manutencao'
                    ? '#EF4444'
                    : statusOperacional === 'aguardando_pecas'
                    ? '#F59E0B'
                    : '#10B981',
                color: '#fff',
              }}
            >
              {statusOperacional === 'em_manutencao'
                ? '🚨 Em Manutenção (Oficina)'
                : statusOperacional === 'aguardando_pecas'
                ? '🟡 Aguardando Peças'
                : '🟢 Em Operação'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {statusOperacional !== 'em_manutencao' ? (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleAlterarStatusOperacional('em_manutencao')}
                style={{ background: '#DC2626', color: '#fff', borderColor: '#DC2626' }}
              >
                🚨 Colocar em Manutenção
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleAlterarStatusOperacional('operacional')}
                style={{ background: '#16A34A', color: '#fff', borderColor: '#16A34A' }}
              >
                ✅ Liberar para Operação
              </button>
            )}

            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() =>
                handleAlterarStatusOperacional(
                  statusOperacional === 'aguardando_pecas' ? 'operacional' : 'aguardando_pecas'
                )
              }
            >
              {statusOperacional === 'aguardando_pecas' ? 'Remover espera' : '🟡 Aguardar Peças'}
            </button>
          </div>
        </div>

        <div
          className="status-banner"
          style={{ backgroundColor: STATUS_COLORS[maquina.status_calculado] }}
        >
          {STATUS_LABELS[maquina.status_calculado]}
          {faltamHoras !== null && (
            <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 8 }}>
              ({faltamHoras > 0 ? `Faltam ${faltamHoras}h para revisão` : `Atrasada por ${Math.abs(faltamHoras)}h`})
            </span>
          )}
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Tipo</span>
            <span>{maquina.tipo}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Fabricante</span>
            <span>{maquina.fabricante}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Modelo</span>
            <span>{maquina.modelo}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Ano</span>
            <span>{maquina.ano || 'Não informado'}</span>
          </div>
          <div className="info-item highlight">
            <span className="info-label">Horímetro atual</span>
            <span style={{ fontSize: 24, fontWeight: 700 }}>{formatarHorimetro(maquina.horimetro_atual)}</span>
          </div>
        </div>

        {/* Card do Plano de Manutenção */}
        {plano ? (
          <div className="card" style={{ marginBottom: 16, borderLeft: '5px solid var(--verde)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span className="info-label">Plano de Manutenção Monitorado</span>
                <strong style={{ fontSize: 16 }}>{plano.nome}</strong>
              </div>
              <Link to={`/maquina/${id}/plano`} className="btn btn-sm btn-secondary">
                Ajustar Plano
              </Link>
            </div>

            <div style={{ padding: '10px 12px', background: '#F1F8E9', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-sm" style={{ fontWeight: 600, color: 'var(--verde)' }}>
                  🎯 Próxima Revisão: {formatarHorimetro(plano.proximoHorimetro)}
                </span>
                <span className="text-sm" style={{ fontWeight: 700 }}>
                  {faltamHoras > 0 ? `Faltam ${faltamHoras}h` : `Atrasada por ${Math.abs(faltamHoras)}h`}
                </span>
              </div>
            </div>

            {itensPlano.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <strong className="text-sm" style={{ display: 'block', marginBottom: 4 }}>
                  Checklist Obrigatório ({itensPlano.length} itens):
                </strong>
                <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text)' }}>
                  {itensPlano.map((i, idx) => (
                    <li key={idx} style={{ marginBottom: 2 }}>{i.descricao}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div
            className="card"
            style={{
              marginBottom: 16,
              background: '#FFF8E1',
              border: '1px solid #FFE082',
              textAlign: 'center',
              padding: 16,
            }}
          >
            <span style={{ fontSize: 28 }}>⚙️</span>
            <h3 style={{ margin: '6px 0', fontSize: 16 }}>Plano de Manutenção não configurado</h3>
            <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
              Gere o plano automático escalonado (250h/500h/1000h) para controlar as revisões.
            </p>
            <Link to={`/maquina/${id}/plano`} className="btn btn-sm">
              + Configurar Plano de Manutenção
            </Link>
          </div>
        )}

        {/* Alertas de problemas abertos da máquina */}
        {problemas.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 8, color: 'var(--vermelho)' }}>
              ⚠️ Problemas Abertos Nesta Máquina ({problemas.length})
            </h3>
            {problemas.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  marginBottom: 8,
                  borderLeft: '4px solid var(--vermelho)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{p.tipo}</strong>
                  {p.descricao && <p className="text-sm">"{p.descricao}"</p>}
                </div>
                <Link to={`/problema/${p.id}/atender`} className="btn btn-sm" style={{ padding: '6px 12px' }}>
                  Atender →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* 4 Ações Principais da Máquina */}
        <nav className="acoes-grid no-print">
          <Link to={`/maquina/${id}/horimetro`} className="acao-btn">
            <span className="acao-icon">⏱</span>
            <span>Atualizar horímetro</span>
          </Link>
          <Link to={`/maquina/${id}/problema`} className="acao-btn">
            <span className="acao-icon">⚠️</span>
            <span>Informar problema</span>
          </Link>
          <Link to={`/maquina/${id}/revisao`} className="acao-btn">
            <span className="acao-icon">🔧</span>
            <span>Fazer revisão</span>
          </Link>
          <Link to={`/maquina/${id}/historico`} className="acao-btn">
            <span className="acao-icon">📋</span>
            <span>Ver histórico</span>
          </Link>
        </nav>

        {/* Impressão de Ficha / OS */}
        <div className="no-print" style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => window.print()}
            style={{ width: '100%', padding: '12px' }}
          >
            🖨️ Imprimir Ficha Técnica / Ordem de Manutenção
          </button>
        </div>
      </div>
    </div>
  );
}

