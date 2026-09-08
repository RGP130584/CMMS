import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import db from '../../db/database';
import { extrairImagensDoPDF, deduplicarImagens, filtrarImagensGrandes } from '../../services/imagens';
import { formatarTamanho } from '../../services/catalogo';
import { redimensionarEComprimirImagem } from '../../utils/imagemHelper';
import { DIAGRAMAS_PADRAO } from '../../db/catalogoPadrao';

export default function DiagramasCatalogo() {
  const [diagramas, setDiagramas] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  const [filtroSistema, setFiltroSistema] = useState('todos');
  const [termoBusca, setTermoBusca] = useState('');

  // Modal de Visualização Expandida / Zoom
  const [diagramaZoom, setDiagramaZoom] = useState(null);

  // Modal / Form de Upload Manual de Diagrama
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [nomeNovoDiagrama, setNomeNovoDiagrama] = useState('');
  const [sistemaNovoDiagrama, setSistemaNovoDiagrama] = useState('hidraulica');
  const [imagemPreview, setImagemPreview] = useState(null);
  const [descricaoNovoDiagrama, setDescricaoNovoDiagrama] = useState('');
  const [salvandoManual, setSalvandoManual] = useState(false);

  // Extração de PDF
  const [mostrarExtracaoPDF, setMostrarExtracaoPDF] = useState(false);
  const [arquivoSel, setArquivoSel] = useState('');
  const [processandoPDF, setProcessandoPDF] = useState(false);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const carregar = useCallback(async () => {
    let d = await db.catalogoDiagrama.toArray();

    // Se estiver vazio, popula com os diagramas padrão
    if (d.length === 0) {
      for (const diag of DIAGRAMAS_PADRAO) {
        await db.catalogoDiagrama.add({
          numero: diag.numero,
          pagina: diag.pagina,
          indice: diag.indice,
          nome: diag.nome,
          sistema: diag.sistema || 'geral',
          largura: diag.largura,
          altura: diag.altura,
          imagem: diag.imagem,
          componentes: diag.componentes || [],
          criado_em: new Date().toISOString(),
        });
      }
      d = await db.catalogoDiagrama.toArray();
    }

    setDiagramas(d);
    const a = await db.catalogoArquivo.toArray();
    setArquivos(a);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Diagramas filtrados
  const diagramasFiltrados = useMemo(() => {
    return diagramas.filter((d) => {
      const termo = termoBusca.toLowerCase();
      const compTexto = d.componentes?.map((c) => `${c.nome} ${c.codigo}`).join(' ') || '';
      const texto = `${d.nome || ''} ${d.sistema || ''} ${compTexto}`.toLowerCase();

      if (termoBusca.trim() && !texto.includes(termo)) {
        return false;
      }

      if (filtroSistema !== 'todos' && d.sistema !== filtroSistema) {
        return false;
      }

      return true;
    });
  }, [diagramas, termoBusca, filtroSistema]);

  async function handleSelecionarImagem(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await redimensionarEComprimirImagem(file, 1200, 900, 0.85);
      setImagemPreview(dataUrl);
      if (!nomeNovoDiagrama) {
        setNomeNovoDiagrama(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err) {
      setErro('Erro ao carregar a imagem: ' + err.message);
    }
  }

  async function salvarDiagramaManual(e) {
    e.preventDefault();
    setErro('');
    if (!imagemPreview) {
      setErro('Selecione uma imagem ou tire uma foto do esquema/diagrama');
      return;
    }
    if (!nomeNovoDiagrama.trim()) {
      setErro('Informe um nome para o diagrama');
      return;
    }

    setSalvandoManual(true);
    try {
      await db.catalogoDiagrama.add({
        nome: nomeNovoDiagrama.trim(),
        sistema: sistemaNovoDiagrama,
        imagem: imagemPreview,
        pagina: 1,
        numero: diagramas.length + 1,
        indice: diagramas.length,
        descricao: descricaoNovoDiagrama.trim() || null,
        componentes: [],
        criado_em: new Date().toISOString(),
      });

      setNomeNovoDiagrama('');
      setImagemPreview(null);
      setDescricaoNovoDiagrama('');
      setMostrarUpload(false);
      setSucesso('Diagrama adicionado com sucesso!');
      await carregar();
      setTimeout(() => setSucesso(''), 4000);
    } catch (err) {
      setErro('Erro ao salvar diagrama: ' + err.message);
    } finally {
      setSalvandoManual(false);
    }
  }

  async function extrairDiagramasPDF() {
    if (!arquivoSel) return;
    setProcessandoPDF(true);
    setErro('');
    setSucesso('');

    try {
      const arquivo = await db.catalogoArquivo.get(Number(arquivoSel));
      if (!arquivo || !arquivo.blob) {
        throw new Error('Arquivo selecionado não possui conteúdo PDF armazenado localmente');
      }

      const file = new File([arquivo.blob], arquivo.arquivo_nome || 'catalogo.pdf', {
        type: arquivo.arquivo_tipo || 'application/pdf',
      });
      let imagens = await extrairImagensDoPDF(file);
      imagens = deduplicarImagens(imagens);
      imagens = filtrarImagensGrandes(imagens);

      if (imagens.length === 0) {
        setErro('Nenhuma imagem ou esquema técnico foi detectado neste PDF.');
      } else {
        for (const img of imagens) {
          await db.catalogoDiagrama.add({
            catalogo_arquivo_id: Number(arquivoSel),
            pagina: img.pagina,
            indice: img.indice,
            imagem: img.dataUrl,
            largura: img.largura,
            altura: img.altura,
            nome: img.nome || `Diagrama Técnico Pág. ${img.pagina}`,
            sistema: 'geral',
            numero: img.indice + 1,
            componentes: [],
            criado_em: new Date().toISOString(),
          });
        }
        setSucesso(`${imagens.length} diagrama(s) extraído(s) com sucesso!`);
        await carregar();
      }
    } catch (e) {
      console.error('Erro ao extrair diagramas:', e);
      setErro(e.message || 'Erro ao processar diagramas do PDF');
    } finally {
      setProcessandoPDF(false);
    }
  }

  async function excluirDiagrama(id) {
    if (!confirm('Deseja realmente excluir este diagrama técnico?')) return;
    await db.catalogoDiagrama.delete(id);
    await carregar();
  }

  return (
    <div className="page" style={{ maxWidth: '1024px', margin: '0 auto', paddingBottom: '3rem' }}>
      <header className="header" style={{ marginBottom: '1rem' }}>
        <Link to="/catalogos" className="btn btn-sm btn-secondary">
          ← Catálogo
        </Link>
        <h1>Diagramas & Esquemas Técnicos</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => {
              setMostrarUpload(!mostrarUpload);
              setMostrarExtracaoPDF(false);
              setErro('');
            }}
          >
            {mostrarUpload ? '✕ Fechar' : '📷 Adicionar Foto/Esquema'}
          </button>
        </div>
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

      {/* Formulário de Upload Manual / Câmera */}
      {mostrarUpload && (
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
          <h3 style={{ margin: '0 0 1rem 0', color: '#1b5e20', fontSize: '1.15rem' }}>
            📷 Adicionar Novo Esquema ou Diagrama Técnico
          </h3>

          <form onSubmit={salvarDiagramaManual}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Nome do Diagrama / Esquema *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Esquema Hidráulico do Comando SCV"
                  value={nomeNovoDiagrama}
                  onChange={(e) => setNomeNovoDiagrama(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Sistema / Categoria *</label>
                <select
                  className="input"
                  value={sistemaNovoDiagrama}
                  onChange={(e) => setSistemaNovoDiagrama(e.target.value)}
                >
                  <option value="hidraulica">💧 Hidráulica & SCV</option>
                  <option value="motor">⚙️ Motor & Arrefecimento</option>
                  <option value="pulverizacao">🌱 Pulverização & Barras</option>
                  <option value="pneumatico">🚛 Freios Pneumáticos & APU (Caminhões)</option>
                  <option value="transmissao">🚜 Transmissão & Eixos</option>
                  <option value="eletrica">⚡ Elétrica & Chicote</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Foto ou Imagem do Esquema Técnico *</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelecionarImagem}
                  className="input"
                  style={{ flex: 1 }}
                />
              </div>

              {imagemPreview && (
                <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                  <img
                    src={imagemPreview}
                    alt="Preview"
                    style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Observações / Instruções de Montagem (Opcional)</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Ponto de teste com manômetro na saída SCV 1"
                value={descricaoNovoDiagrama}
                onChange={(e) => setDescricaoNovoDiagrama(e.target.value)}
              />
            </div>

            {erro && <p className="erro" style={{ marginBottom: '0.75rem' }}>{erro}</p>}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvandoManual}
                style={{ flex: 1 }}
              >
                {salvandoManual ? 'Salvando...' : '💾 Salvar Diagrama'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMostrarUpload(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Extração de PDF Opcional */}
      {mostrarExtracaoPDF && (
        <div className="card" style={{ marginBottom: '1.25rem', background: '#f8fafc', border: '1px dashed #94a3b8' }}>
          <h4>📄 Extração Automática de Imagens via PDF</h4>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Selecione um manual PDF importado para extrair automaticamente imagens de diagramas.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <select
              className="input"
              value={arquivoSel}
              onChange={(e) => setArquivoSel(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Selecione o catálogo PDF...</option>
              {arquivos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.arquivo_nome} ({formatarTamanho(a.arquivo_tamanho)})
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={extrairDiagramasPDF}
              disabled={!arquivoSel || processandoPDF}
            >
              {processandoPDF ? 'Extraindo...' : 'Extrair'}
            </button>
          </div>
        </div>
      )}

      {/* Barra de Pesquisa e Filtros */}
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
            placeholder="🔍 Buscar diagramas por sistema, peça, código (ex: SCV, APU, AL172780, Freios...)"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => setMostrarExtracaoPDF(!mostrarExtracaoPDF)}
            title="Opções de PDF"
          >
            📄 Extrair de PDF
          </button>
        </div>

        {/* Chips de Filtro por Sistema */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { id: 'todos', rotulo: `Todos (${diagramas.length})` },
            { id: 'hidraulica', rotulo: '💧 Hidráulica & SCV' },
            { id: 'motor', rotulo: '⚙️ Motor & Arrefecimento' },
            { id: 'pulverizacao', rotulo: '🌱 Pulverização' },
            { id: 'pneumatico', rotulo: '🚛 Freios & APU (Caminhões)' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltroSistema(f.id)}
              style={{
                fontSize: '0.8rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filtroSistema === f.id ? '#1b5e20' : '#e2e8f0',
                background: filtroSistema === f.id ? '#1b5e20' : '#f8fafc',
                color: filtroSistema === f.id ? '#ffffff' : '#475569',
                fontWeight: filtroSistema === f.id ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Diagramas */}
      {diagramasFiltrados.length === 0 ? (
        <div className="empty-state" style={{ padding: '2.5rem 1rem', background: '#fff', borderRadius: '12px' }}>
          <span style={{ fontSize: '2rem' }}>📐</span>
          <p style={{ marginTop: '0.5rem', fontWeight: 600, color: '#334155' }}>
            Nenhum diagrama encontrado para os filtros selecionados.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {diagramasFiltrados.map((d) => (
            <div
              key={d.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Header do Card */}
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1b5e20', fontWeight: 700 }}>
                    {d.nome || `Diagrama Técnico #${d.numero || d.indice + 1}`}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {d.sistema ? `Sistema: ${d.sistema.toUpperCase()}` : 'Diagrama Técnico'}
                    {d.pagina ? ` • Pág. ${d.pagina}` : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setDiagramaZoom(d)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    🔍 <span>Ampliar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => excluirDiagrama(d.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: '4px',
                    }}
                    title="Excluir diagrama"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Imagem / Esquema SVG com cursor de zoom */}
              {d.imagem && (
                <div
                  onClick={() => setDiagramaZoom(d)}
                  style={{
                    padding: '10px',
                    background: '#090d16',
                    cursor: 'zoom-in',
                    textAlign: 'center',
                    minHeight: '220px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={d.imagem}
                    alt={d.nome}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '380px',
                      borderRadius: '6px',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              )}

              {/* Lista de Componentes / Peças Vinculadas ao Diagrama */}
              {d.componentes && d.componentes.length > 0 && (
                <div style={{ padding: '1rem 1.25rem', background: '#fafafa', borderTop: '1px solid #e2e8f0' }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#475569',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    📑 Componentes Numerados no Diagrama:
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {d.componentes.map((c) => (
                      <div
                        key={c.item}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.82rem',
                        }}
                      >
                        <span
                          style={{
                            background: '#1b5e20',
                            color: '#fff',
                            fontWeight: 700,
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            flexShrink: 0,
                          }}
                        >
                          {c.item}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.nome}
                          </div>
                          <div style={{ color: '#0f766e', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                            Cód: {c.codigo}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Zoom em Tela Cheia */}
      {diagramaZoom && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.92)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
          }}
          onClick={() => setDiagramaZoom(null)}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#ffffff',
              marginBottom: '0.75rem',
            }}
          >
            <div>
              <strong style={{ fontSize: '1.1rem' }}>{diagramaZoom.nome}</strong>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Toque no X ou fora da imagem para fechar
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDiagramaZoom(null)}
              style={{ fontSize: '1rem', padding: '0.4rem 0.8rem', borderRadius: '8px' }}
            >
              ✕ Fechar
            </button>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={diagramaZoom.imagem}
              alt={diagramaZoom.nome}
              style={{
                maxWidth: '96vw',
                maxHeight: '82vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
