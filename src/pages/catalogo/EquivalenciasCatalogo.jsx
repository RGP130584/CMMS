import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import db from '../../db/database';

const MARCAS_SUGERIDAS = [
  'Donaldson',
  'Mann Filter',
  'Fleetguard',
  'Tecfil',
  'Mahle',
  'Parker',
  'Bosch',
  'Wega',
  'Baldwin',
  'Sachs',
  'Hengst',
];

export default function EquivalenciasCatalogo() {
  const [equivalencias, setEquivalencias] = useState([]);
  const [pecas, setPecas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todas'); // todas | paralela | substituicao | filtro | motor | hidraulica

  // Form State
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipoRegistro, setTipoRegistro] = useState('paralela'); // paralela | substituicao
  const [buscaPecaForm, setBuscaPecaForm] = useState('');
  const [pecaSelecionada, setPecaSelecionada] = useState(null);
  const [marcaParalela, setMarcaParalela] = useState('');
  const [codigoEquivalente, setCodigoEquivalente] = useState('');
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [copiadoId, setCopiadoId] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const eqs = await db.catalogoSubstituicao.toArray();
    setEquivalencias(eqs);

    const pecasPub = await db.catalogoPeca
      .where('status')
      .equals('publicado')
      .toArray();
    setPecas(pecasPub);
  }

  // Peças filtradas para a busca de autocomplete do formulário
  const pecasFiltradasAutocomplete = useMemo(() => {
    if (!buscaPecaForm.trim()) return pecas.slice(0, 8);
    const termo = buscaPecaForm.toLowerCase();
    return pecas
      .filter(
        (p) =>
          p.codigo_oem?.toLowerCase().includes(termo) ||
          p.descricao?.toLowerCase().includes(termo) ||
          p.grupo?.toLowerCase().includes(termo) ||
          p.modelos?.some((m) => m.toLowerCase().includes(termo))
      )
      .slice(0, 10);
  }, [pecas, buscaPecaForm]);

  // Lista filtrada de equivalências registradas
  const equivalenciasFiltradas = useMemo(() => {
    return equivalencias.filter((eq) => {
      const peca = pecas.find((p) => p.id === eq.catalogo_peca_id);
      const textoCompleto = `${eq.codigo_anterior || ''} ${eq.codigo_novo || ''} ${eq.motivo || ''} ${
        peca?.codigo_oem || ''
      } ${peca?.descricao || ''} ${peca?.grupo || ''} ${peca?.modelos?.join(' ') || ''}`.toLowerCase();

      if (termoBusca.trim() && !textoCompleto.includes(termoBusca.toLowerCase())) {
        return false;
      }

      if (filtroTipo === 'paralela') {
        return (
          eq.codigo_anterior?.includes('(') ||
          eq.motivo?.toLowerCase().includes('cruzada') ||
          eq.motivo?.toLowerCase().includes('donaldson') ||
          eq.motivo?.toLowerCase().includes('mann') ||
          eq.motivo?.toLowerCase().includes('fleetguard') ||
          eq.motivo?.toLowerCase().includes('tecfil')
        );
      }
      if (filtroTipo === 'substituicao') {
        return (
          !eq.codigo_anterior?.includes('(') &&
          (eq.motivo?.toLowerCase().includes('substitu') ||
            eq.motivo?.toLowerCase().includes('atualiza') ||
            eq.motivo?.toLowerCase().includes('engenharia'))
        );
      }
      if (filtroTipo === 'filtro') {
        return peca?.grupo?.toLowerCase().includes('filtro') || peca?.descricao?.toLowerCase().includes('filtro');
      }
      if (filtroTipo === 'motor') {
        return (
          peca?.secao?.toLowerCase().includes('motor') ||
          peca?.grupo?.toLowerCase().includes('motor') ||
          peca?.descricao?.toLowerCase().includes('óleo') ||
          peca?.descricao?.toLowerCase().includes('correia')
        );
      }
      if (filtroTipo === 'hidraulica') {
        return peca?.secao?.toLowerCase().includes('hidr') || peca?.grupo?.toLowerCase().includes('hidr');
      }

      return true;
    });
  }, [equivalencias, pecas, termoBusca, filtroTipo]);

  function selecionarPeca(p) {
    setPecaSelecionada(p);
    setBuscaPecaForm('');
    setErro('');
  }

  async function adicionar(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!pecaSelecionada) {
      setErro('Por favor, selecione uma peça original do catálogo.');
      return;
    }

    if (!codigoEquivalente.trim()) {
      setErro('Digite o código equivalente ou paralelo.');
      return;
    }

    let codAnterior = '';
    let codNovo = pecaSelecionada.codigo_oem;
    let motivoFinal = motivo.trim();

    if (tipoRegistro === 'paralela') {
      const marca = marcaParalela.trim() || 'Marca Paralela';
      codAnterior = `${codigoEquivalente.trim()} (${marca})`;
      motivoFinal =
        motivoFinal || `Equivalência de reposição com a marca ${marca} para código OEM ${pecaSelecionada.codigo_oem}`;
    } else {
      codAnterior = codigoEquivalente.trim();
      codNovo = pecaSelecionada.codigo_oem;
      motivoFinal = motivoFinal || 'Substituição técnica de código de fábrica OEM';
    }

    const duplicada = equivalencias.find(
      (eq) =>
        eq.catalogo_peca_id === pecaSelecionada.id &&
        eq.codigo_anterior?.toLowerCase() === codAnterior.toLowerCase()
    );

    if (duplicada) {
      setErro('Esta equivalência já está cadastrada para esta peça.');
      return;
    }

    await db.catalogoSubstituicao.add({
      catalogo_peca_id: pecaSelecionada.id,
      codigo_anterior: codAnterior,
      codigo_novo: codNovo,
      motivo: motivoFinal,
      criado_em: new Date().toISOString(),
    });

    setCodigoEquivalente('');
    setMarcaParalela('');
    setMotivo('');
    setPecaSelecionada(null);
    setMostrarForm(false);
    setSucesso('Equivalência registrada com sucesso!');
    await carregar();
    setTimeout(() => setSucesso(''), 4000);
  }

  async function excluir(id) {
    if (!confirm('Deseja realmente remover este registro de equivalência?')) return;
    await db.catalogoSubstituicao.delete(id);
    await carregar();
  }

  function copiarCodigo(codigo, id) {
    const limpo = codigo.replace(/\(.*?\)/g, '').trim();
    navigator.clipboard?.writeText(limpo);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  function obterPeca(pecaId) {
    return pecas.find((p) => p.id === pecaId);
  }

  return (
    <div className="page" style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header className="header" style={{ marginBottom: '1rem' }}>
        <Link to="/catalogos" className="btn btn-sm btn-secondary">
          ← Catálogo
        </Link>
        <h1>Equivalências de Peças</h1>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => {
            setMostrarForm(!mostrarForm);
            setErro('');
          }}
        >
          {mostrarForm ? '✕ Fechar' : '➕ Nova Equivalência'}
        </button>
      </header>

      {sucesso && (
        <div
          style={{
            background: '#e8f5e9',
            color: '#1b5e20',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: 600,
            border: '1px solid #a5d6a7',
          }}
        >
          ✅ {sucesso}
        </div>
      )}

      {/* Formulário Interativo de Cadastro */}
      {mostrarForm && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            background: '#ffffff',
            border: '2px solid #2e7d32',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '1.15rem' }}>
              📝 Registrar Nova Equivalência / Peça Paralela
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Passo a passo rápido</span>
          </div>

          {/* Seletor de Tipo */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setTipoRegistro('paralela')}
              style={{
                flex: 1,
                background: tipoRegistro === 'paralela' ? '#1b5e20' : '#f1f5f9',
                color: tipoRegistro === 'paralela' ? '#ffffff' : '#334155',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
              }}
            >
              🔄 Marca Paralela / Linha do Mercado (Mann, Donaldson, Tecfil...)
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setTipoRegistro('substituicao')}
              style={{
                flex: 1,
                background: tipoRegistro === 'substituicao' ? '#1b5e20' : '#f1f5f9',
                color: tipoRegistro === 'substituicao' ? '#ffffff' : '#334155',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
              }}
            >
              🏷️ Substituição de Código de Fábrica (OEM Antigo ➔ Novo)
            </button>
          </div>

          <form onSubmit={adicionar}>
            {/* 1. Seleção da Peça Original */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, color: '#1e293b' }}>
                1. Peça Original no Catálogo (OEM) *
              </label>

              {pecaSelecionada ? (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        background: '#1b5e20',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        marginRight: '8px',
                      }}
                    >
                      {pecaSelecionada.codigo_oem}
                    </span>
                    <strong style={{ color: '#166534' }}>{pecaSelecionada.descricao}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Grupo: {pecaSelecionada.grupo || 'Geral'} • Aplicação:{' '}
                      {pecaSelecionada.modelos?.join(', ') || 'Multiuso'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setPecaSelecionada(null)}
                  >
                    Trocar Peça
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    className="input"
                    placeholder="🔍 Digite o código ou nome da peça (ex: RE504836, Filtro, Correia...)"
                    value={buscaPecaForm}
                    onChange={(e) => setBuscaPecaForm(e.target.value)}
                    style={{ marginBottom: '6px' }}
                  />
                  <div
                    style={{
                      maxHeight: '180px',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#fafafa',
                    }}
                  >
                    {pecasFiltradasAutocomplete.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => selecionarPeca(p)}
                        style={{
                          padding: '0.55rem 0.75rem',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.88rem',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <strong style={{ color: '#1b5e20', fontFamily: 'monospace', marginRight: '8px' }}>
                            {p.codigo_oem}
                          </strong>
                          <span>{p.descricao}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                          {p.grupo || 'Geral'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Marca e Código da Peça Equivalente */}
            {tipoRegistro === 'paralela' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    2. Marca / Fabricante Alternativo *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ex: Donaldson, Mann Filter, Tecfil"
                    value={marcaParalela}
                    onChange={(e) => setMarcaParalela(e.target.value)}
                    required
                  />
                  {/* Pills de marcas sugeridas */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {MARCAS_SUGERIDAS.slice(0, 6).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMarcaParalela(m)}
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          background: marcaParalela === m ? '#e0f2fe' : '#fff',
                          color: marcaParalela === m ? '#0369a1' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    3. Código da Peça Paralela *
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Ex: P550388, W940, LF16015"
                    value={codigoEquivalente}
                    onChange={(e) => setCodigoEquivalente(e.target.value)}
                    required
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  2. Código Anterior / Antigo Substituído *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: RE59754, 87409202, 3611274M1"
                  value={codigoEquivalente}
                  onChange={(e) => setCodigoEquivalente(e.target.value)}
                  required
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
                />
              </div>
            )}

            {/* 3. Motivo / Observação Técnica */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Observação Técnica / Detalhe da Aplicação (Opcional)
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Filtro blindado alta eficiência 20 micras, excelente custo-benefício para plantio"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>

            {erro && <p className="erro" style={{ marginBottom: '0.75rem' }}>{erro}</p>}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.65rem' }}>
                💾 Salvar Equivalência
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setMostrarForm(false);
                  setPecaSelecionada(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Barra de Busca e Filtros de Visualização */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '1rem',
          background: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
          <input
            type="search"
            className="input"
            placeholder="🔍 Buscar por código original, código paralelo (Mann, Donaldson...), marca ou modelo..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ flex: 1, fontSize: '0.95rem' }}
          />
          {termoBusca && (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setTermoBusca('')}
            >
              Limpar
            </button>
          )}
        </div>

        {/* Chips de Filtro Rápido */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { id: 'todas', rotulo: `Todas (${equivalencias.length})` },
            { id: 'paralela', rotulo: '🔄 Marcas Paralelas (Aftermarket)' },
            { id: 'substituicao', rotulo: '🏷️ Substituições OEM' },
            { id: 'filtro', rotulo: '🛢️ Filtros' },
            { id: 'motor', rotulo: '⚙️ Motor & Correias' },
            { id: 'hidraulica', rotulo: '💧 Hidráulica' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltroTipo(f.id)}
              style={{
                fontSize: '0.8rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filtroTipo === f.id ? '#1b5e20' : '#e2e8f0',
                background: filtroTipo === f.id ? '#1b5e20' : '#f8fafc',
                color: filtroTipo === f.id ? '#ffffff' : '#475569',
                fontWeight: filtroTipo === f.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* Contagem e Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          fontSize: '0.85rem',
          color: '#64748b',
        }}
      >
        <span>
          Mostrando <strong>{equivalenciasFiltradas.length}</strong> de {equivalencias.length} equivalência(s)
        </span>
        <span>💡 Toque em um código para copiar</span>
      </div>

      {/* Lista de Cards de Equivalências */}
      {equivalenciasFiltradas.length === 0 ? (
        <div className="empty-state" style={{ padding: '2.5rem 1rem', background: '#fff', borderRadius: '12px' }}>
          <span style={{ fontSize: '2rem' }}>🔍</span>
          <p style={{ marginTop: '0.5rem', fontWeight: 600, color: '#334155' }}>
            Nenhuma equivalência encontrada com os filtros atuais.
          </p>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setMostrarForm(true)}
            style={{ marginTop: '0.75rem' }}
          >
            ➕ Cadastrar Nova Equivalência
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
          {equivalenciasFiltradas.map((eq) => {
            const peca = obterPeca(eq.catalogo_peca_id);
            const ehParalela = eq.codigo_anterior?.includes('(') || eq.motivo?.toLowerCase().includes('cruzada');

            return (
              <div
                key={eq.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  padding: '1rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Cabeçalho do Card com Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: ehParalela ? '#eff6ff' : '#fef3c7',
                        color: ehParalela ? '#1d4ed8' : '#b45309',
                        border: `1px solid ${ehParalela ? '#bfdbfe' : '#fde68a'}`,
                      }}
                    >
                      {ehParalela ? '🔄 Marca Paralela / Cruzada' : '🏷️ Substituição de Fábrica'}
                    </span>

                    <button
                      type="button"
                      onClick={() => excluir(eq.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '2px 4px',
                      }}
                      title="Excluir equivalência"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Comparador Visual de Códigos */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '0.65rem 0.75rem',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    {/* Código Equivalente / Paralelo */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        {ehParalela ? 'Equivalente / Alternativo' : 'Código Anterior'}
                      </div>
                      <div
                        onClick={() => copiarCodigo(eq.codigo_anterior, `ant-${eq.id}`)}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#0f766e',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Clique para copiar"
                      >
                        {eq.codigo_anterior}
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                          {copiadoId === `ant-${eq.id}` ? '✓ Copiado' : '📋'}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '1.2rem', color: '#94a3b8', padding: '0 8px' }}>➔</div>

                    {/* Código OEM Original */}
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        Código OEM Atual
                      </div>
                      <div
                        onClick={() => copiarCodigo(eq.codigo_novo, `nov-${eq.id}`)}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#1b5e20',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          justifyContent: 'flex-end',
                        }}
                        title="Clique para copiar"
                      >
                        {copiadoId === `nov-${eq.id}` ? '✓ Copiado' : '📋'}
                        {eq.codigo_novo}
                      </div>
                    </div>
                  </div>

                  {/* Nome e Descrição da Peça */}
                  <div style={{ marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                      {peca?.descricao || `Peça #${eq.catalogo_peca_id}`}
                    </strong>
                    {peca?.modelos?.length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        🚜 Modelos: {peca.modelos.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Motivo ou Detalhe Técnico */}
                {eq.motivo && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: '#475569',
                      background: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginTop: '6px',
                      borderLeft: '3px solid #0284c7',
                    }}
                  >
                    💬 {eq.motivo}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
