import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listarMaquinas, listarTodasManutencoes, listarProblemasAbertos } from '../services/maquinas';
import { STATUS_COLORS } from '../utils/status';

export default function Relatorios() {
  const { empresa } = useAuth();
  const [maquinas, setMaquinas] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [problemas, setProblemas] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroMaquina, setFiltroMaquina] = useState('todas');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!empresa) return;
      const maqs = await listarMaquinas(empresa.id);
      setMaquinas(maqs);

      const mans = await listarTodasManutencoes(empresa.id);
      setManutencoes(mans);

      const probs = await listarProblemasAbertos(empresa.id);
      setProblemas(probs);

      setCarregando(false);
    }
    carregar();
  }, [empresa]);


  // Cálculos de KPIs da Frota
  const totalMaquinas = maquinas.length;
  const emDia = maquinas.filter((m) => m.status_calculado === 'verde').length;
  const proximas = maquinas.filter((m) => m.status_calculado === 'amarelo').length;
  const atrasadas = maquinas.filter((m) => m.status_calculado === 'vermelho').length;
  const emManutencao = maquinas.filter((m) => m.status_calculado === 'azul').length;

  const totalHorasFrota = maquinas.reduce((acc, m) => acc + (Number(m.horimetro_atual) || 0), 0);
  const disponibilidade = totalMaquinas > 0 ? (((totalMaquinas - emManutencao) / totalMaquinas) * 100).toFixed(1) : 100;

  const totalPreventivas = manutencoes.filter((m) => m.tipo_manutencao === 'preventiva').length;
  const totalCorretivas = manutencoes.filter((m) => m.tipo_manutencao === 'corretiva').length;

  // Filtragem da tabela de manutenções
  const manutencoesFiltradas = manutencoes.filter((m) => {
    if (filtroTipo !== 'todos' && m.tipo_manutencao !== filtroTipo) return false;
    if (filtroMaquina !== 'todas' && String(m.maquina_id) !== String(filtroMaquina)) return false;
    return true;
  });

  // Exportar para CSV
  function exportarCSV() {
    if (manutencoesFiltradas.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    const cabecalho = ['Data', 'Máquina', 'Tipo', 'Horímetro', 'Resumo', 'Peças Utilizadas', 'Observações'];
    const linhas = manutencoesFiltradas.map((m) => [
      new Date(m.data).toLocaleDateString('pt-BR'),
      `"${m.maquina_apelido || ''}"`,
      m.tipo_manutencao === 'preventiva' ? 'Preventiva' : 'Corretiva',
      m.horimetro_realizado || m.horimetro_no_momento || '',
      `"${(m.resumo || '').replace(/"/g, '""')}"`,
      `"${(m.pecas_utilizadas || []).join(', ').replace(/"/g, '""')}"`,
      `"${(m.observacoes || '').replace(/"/g, '""')}"`,
    ]);

    const conteudoCSV = '\uFEFF' + [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\n');
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_manutencoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function imprimirRelatorio() {
    window.print();
  }

  if (carregando) return <div className="page"><p>Carregando relatórios...</p></div>;

  return (
    <div className="page relatorios-page">
      <header className="header no-print">
        <Link to="/" className="btn btn-sm btn-secondary">← Início</Link>
        <h1>Relatórios & Indicadores</h1>
        <span />
      </header>

      {/* Cabeçalho de Impressão */}
      <div className="print-only" style={{ display: 'none', marginBottom: 20 }}>
        <h2>{empresa?.nome_propriedade || 'Propriedade Agrícola'}</h2>
        <p>Relatório Geral de Manutenção de Máquinas • Emitido em: {new Date().toLocaleString('pt-BR')}</p>
        <hr style={{ margin: '8px 0' }} />
      </div>

      {/* Botões de Ação / Exportação */}
      <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-sm" onClick={imprimirRelatorio} style={{ flex: 1, background: '#37474F' }}>
          🖨️ Imprimir / Salvar PDF
        </button>
        <button className="btn btn-sm" onClick={exportarCSV} style={{ flex: 1, background: 'var(--verde)' }}>
          📥 Exportar Planilha (CSV)
        </button>
      </div>

      {/* Dashboard Executivo de KPIs */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Indicadores de Disponibilidade da Frota</h2>
        <div className="status-cards">
          <div className="status-card" style={{ borderLeftColor: 'var(--verde)' }}>
            <span className="status-numero">{disponibilidade}%</span>
            <span className="status-label">Disponibilidade Física</span>
          </div>
          <div className="status-card" style={{ borderLeftColor: 'var(--azul)' }}>
            <span className="status-numero">{totalMaquinas}</span>
            <span className="status-label">Máquinas na Frota</span>
          </div>
          <div className="status-card" style={{ borderLeftColor: 'var(--amarelo)' }}>
            <span className="status-numero">{totalPreventivas}</span>
            <span className="status-label">Revisões Preventivas</span>
          </div>
          <div className="status-card" style={{ borderLeftColor: 'var(--vermelho)' }}>
            <span className="status-numero">{totalCorretivas}</span>
            <span className="status-label">Reparos Corretivos</span>
          </div>
        </div>

        <div className="card" style={{ marginTop: 8 }}>
          <p className="text-sm">
            Total de Horas Acumuladas da Frota: <strong>{totalHorasFrota.toLocaleString('pt-BR')} horas</strong>
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ color: STATUS_COLORS.verde, fontWeight: 600, fontSize: 13 }}>● {emDia} em dia</span>
            <span style={{ color: STATUS_COLORS.amarelo, fontWeight: 600, fontSize: 13 }}>● {proximas} próximas</span>
            <span style={{ color: STATUS_COLORS.vermelho, fontWeight: 600, fontSize: 13 }}>● {atrasadas} atrasadas</span>
            <span style={{ color: STATUS_COLORS.azul, fontWeight: 600, fontSize: 13 }}>● {emManutencao} em manutenção</span>
          </div>
        </div>
      </section>

      {/* Filtros da Tabela */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16 }}>Histórico Analítico de Manutenções</h2>
          <span className="text-sm text-muted">({manutencoesFiltradas.length} registros)</span>
        </div>

        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div>
            <label className="label" style={{ fontSize: 12 }}>Tipo</label>
            <select
              className="input"
              style={{ marginBottom: 0 }}
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos os tipos</option>
              <option value="preventiva">Preventivas</option>
              <option value="corretiva">Corretivas</option>
            </select>
          </div>
          <div>
            <label className="label" style={{ fontSize: 12 }}>Máquina</label>
            <select
              className="input"
              style={{ marginBottom: 0 }}
              value={filtroMaquina}
              onChange={(e) => setFiltroMaquina(e.target.value)}
            >
              <option value="todas">Todas as máquinas</option>
              {maquinas.map((m) => (
                <option key={m.id} value={m.id}>{m.apelido}</option>
              ))}
            </select>
          </div>
        </div>

        {manutencoesFiltradas.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
            Nenhuma manutenção encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="card-list">
            {manutencoesFiltradas.map((m, idx) => (
              <div
                key={m.id || idx}
                className="maquina-card"
                style={{
                  borderLeft: `4px solid ${m.tipo_manutencao === 'preventiva' ? 'var(--verde)' : 'var(--azul)'}`,
                }}
              >
                <div className="maquina-card-header">
                  <strong>{m.maquina_apelido}</strong>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: m.tipo_manutencao === 'preventiva' ? '#E8F5E9' : '#E3F2FD',
                      color: m.tipo_manutencao === 'preventiva' ? 'var(--verde)' : 'var(--azul)',
                    }}
                  >
                    {m.tipo_manutencao === 'preventiva' ? 'PREVENTIVA' : 'CORRETIVA'}
                  </span>
                </div>

                <p className="text-sm" style={{ fontWeight: 500 }}>{m.resumo}</p>

                {m.pecas_utilizadas && m.pecas_utilizadas.length > 0 && (
                  <p className="text-sm text-muted" style={{ marginTop: 2 }}>
                    Peças: {m.pecas_utilizadas.join(', ')}
                  </p>
                )}

                {m.observacoes && (
                  <p className="text-sm text-muted" style={{ fontStyle: 'italic', marginTop: 2 }}>
                    Obs: {m.observacoes}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span className="text-sm text-muted">
                    {new Date(m.data).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-sm" style={{ fontWeight: 600 }}>
                    {m.horimetro_realizado || m.horimetro_no_momento}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Relatório de Falhas e Chamados Abertos */}
      {problemas.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: 'var(--vermelho)' }}>
            ⚠️ Chamados e Falhas em Aberto ({problemas.length})
          </h2>
          <div className="card-list">
            {problemas.map((p) => (
              <div key={p.id} className="card" style={{ borderLeft: '4px solid var(--vermelho)' }}>
                <strong>Tipo de problema: {p.tipo}</strong>
                {p.descricao && <p className="text-sm">"{p.descricao}"</p>}
                <p className="text-sm text-muted" style={{ marginTop: 4 }}>
                  Data: {new Date(p.data_hora).toLocaleString('pt-BR')} • Status: {p.status}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
