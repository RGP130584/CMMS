import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import db from '../db/database';
import { useAuth } from '../contexts/AuthContext';
import { listarOperadores, listarOperacoes, registrarOperacao, salvarOperador } from '../services/operadores';

const FUNCOES = [
  'Tratorista',
  'Operador de máquinas agrícolas',
  'Motorista de caminhão',
  'Operador de máquinas pesadas',
  'Multifuncional',
];

export default function Operadores() {
  const { empresa } = useAuth();
  const [operadores, setOperadores] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [operacoes, setOperacoes] = useState([]);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [funcao, setFuncao] = useState(FUNCOES[0]);
  const [possuiCnh, setPossuiCnh] = useState(false);
  const [categoriaCnh, setCategoriaCnh] = useState('');
  const [validadeCnh, setValidadeCnh] = useState('');
  const [maquinasIds, setMaquinasIds] = useState([]);
  const [observacoes, setObservacoes] = useState('');

  const [operadorId, setOperadorId] = useState('');
  const [maquinaId, setMaquinaId] = useState('');
  const [dataOperacao, setDataOperacao] = useState(new Date().toISOString().slice(0, 10));
  const [horimetroInicial, setHorimetroInicial] = useState('');
  const [horimetroFinal, setHorimetroFinal] = useState('');
  const [observacaoOperacao, setObservacaoOperacao] = useState('');

  async function carregar() {
    if (!empresa) return;
    const [ops, ms, hist] = await Promise.all([
      listarOperadores(empresa.id),
      db.maquina.where('empresa_id').equals(empresa.id).toArray(),
      listarOperacoes(empresa.id),
    ]);
    setOperadores(ops.sort((a, b) => a.nome.localeCompare(b.nome)));
    setMaquinas(ms);
    setOperacoes(hist);
  }

  useEffect(() => { carregar(); }, [empresa]);

  const maquinasDoOperador = useMemo(() => {
    const op = operadores.find((o) => o.id === Number(operadorId));
    return maquinas.filter((m) => (op?.maquinas_ids || []).includes(m.id));
  }, [operadores, maquinas, operadorId]);

  const totalHoras = operacoes.reduce((s, r) => s + Number(r.horas_operadas || 0), 0);
  const diasOperados = new Set(operacoes.map((r) => `${r.operador_id}:${r.data_operacao}`)).size;

  function limparCadastro() {
    setNome(''); setCpf(''); setTelefone(''); setFuncao(FUNCOES[0]);
    setPossuiCnh(false); setCategoriaCnh(''); setValidadeCnh('');
    setMaquinasIds([]); setObservacoes('');
  }

  async function handleSalvarOperador(e) {
    e.preventDefault(); setErro(''); setSucesso('');
    setSalvando(true);
    try {
      await salvarOperador({
        empresa_id: empresa.id, nome, cpf, telefone, funcao,
        possui_cnh: possuiCnh, categoria_cnh: categoriaCnh, validade_cnh: validadeCnh,
        maquinas_ids: maquinasIds, observacoes, status: 'ativo',
      });
      limparCadastro(); setMostrarCadastro(false);
      setSucesso('Operador cadastrado.');
      await carregar();
    } catch (err) { setErro(err.message || 'Não foi possível salvar o operador.'); }
    finally { setSalvando(false); }
  }

  async function handleRegistrarOperacao(e) {
    e.preventDefault(); setErro(''); setSucesso(''); setSalvando(true);
    try {
      const resultado = await registrarOperacao({
        empresa_id: empresa.id, operador_id: operadorId, maquina_id: maquinaId,
        data_operacao: dataOperacao, horimetro_inicial: horimetroInicial,
        horimetro_final: horimetroFinal, observacoes: observacaoOperacao,
      });
      setSucesso(`Operação registrada: ${resultado.horas_operadas} horas calculadas.`);
      setHorimetroInicial(horimetroFinal); setHorimetroFinal(''); setObservacaoOperacao('');
      await carregar();
    } catch (err) { setErro(err.message || 'Não foi possível registrar a operação.'); }
    finally { setSalvando(false); }
  }

  function selecionarOperador(value) {
    setOperadorId(value); setMaquinaId(''); setHorimetroInicial(''); setHorimetroFinal('');
  }

  const horasPreview = Number(horimetroFinal) - Number(horimetroInicial);

  return (
    <div className="page" style={{ maxWidth: 980, margin: '0 auto', paddingBottom: '3rem' }}>
      <header className="header">
        <Link to="/" className="btn btn-sm btn-secondary">← Início</Link>
        <h1>Operadores</h1>
        <button className="btn btn-sm btn-primary" onClick={() => { setMostrarCadastro(!mostrarCadastro); setErro(''); }}>
          {mostrarCadastro ? 'Fechar' : '+ Novo operador'}
        </button>
      </header>

      <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
        Cadastre motoristas e operadores, autorize máquinas da frota e registre as horas pelo horímetro.
      </p>

      {erro && <p className="erro" role="alert">{erro}</p>}
      {sucesso && <div className="sucesso" role="status"><p>{sucesso}</p></div>}

      {mostrarCadastro && (
        <section className="card" style={{ marginBottom: 20 }}>
          <h2>Novo operador</h2>
          <form onSubmit={handleSalvarOperador}>
            <div className="form-group">
              <label className="label">Nome completo *</label>
              <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div className="form-group">
                <label className="label">CPF (opcional)</label>
                <input className="input" value={cpf} onChange={(e) => setCpf(e.target.value)} inputMode="numeric" />
              </div>
              <div className="form-group">
                <label className="label">Telefone</label>
                <input className="input" value={telefone} onChange={(e) => setTelefone(e.target.value)} inputMode="tel" />
              </div>
              <div className="form-group">
                <label className="label">Função</label>
                <select className="input" value={funcao} onChange={(e) => setFuncao(e.target.value)}>
                  {FUNCOES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Possui CNH?</label>
              <select className="input" value={possuiCnh ? 'sim' : 'nao'} onChange={(e) => setPossuiCnh(e.target.value === 'sim')}>
                <option value="nao">Não / não se aplica</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            {possuiCnh && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div className="form-group">
                  <label className="label">Categoria</label>
                  <select className="input" value={categoriaCnh} onChange={(e) => setCategoriaCnh(e.target.value)}>
                    <option value="">Selecione</option>
                    {['A','B','C','D','E','AB','AC','AD','AE'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Validade</label>
                  <input className="input" type="date" value={validadeCnh} onChange={(e) => setValidadeCnh(e.target.value)} />
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="label">Máquinas autorizadas *</label>
              {maquinas.length === 0 ? <p className="text-muted">Cadastre máquinas antes de associar operadores.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                  {maquinas.map((m) => (
                    <label key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 10, border: '1px solid var(--borda)', borderRadius: 8 }}>
                      <input type="checkbox" checked={maquinasIds.includes(m.id)} onChange={(e) => setMaquinasIds((old) => e.target.checked ? [...old, m.id] : old.filter((id) => id !== m.id))} />
                      <span>{m.apelido} <small className="text-muted">({m.tipo} · {m.modelo || m.fabricante || 'Sem modelo'})</small></span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="label">Observações</label>
              <textarea className="input" rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" type="submit" disabled={salvando || maquinasIds.length === 0}>{salvando ? 'Salvando...' : 'Salvar operador'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarCadastro(false); limparCadastro(); }}>Cancelar</button>
            </div>
          </form>
        </section>
      )}

      <section className="card" style={{ marginBottom: 20 }}>
        <h2>Registrar operação</h2>
        <form onSubmit={handleRegistrarOperacao}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
            <div className="form-group">
              <label className="label">Operador *</label>
              <select className="input" value={operadorId} onChange={(e) => selecionarOperador(e.target.value)} required>
                <option value="">Selecione</option>
                {operadores.filter((o) => o.status === 'ativo' && o.maquinas_ids?.length).map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Máquina autorizada *</label>
              <select className="input" value={maquinaId} onChange={(e) => { setMaquinaId(e.target.value); setHorimetroInicial(''); setHorimetroFinal(''); }} required>
                <option value="">Selecione</option>
                {maquinasDoOperador.map((m) => <option key={m.id} value={m.id}>{m.apelido}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Data da operação *</label>
              <input className="input" type="date" value={dataOperacao} onChange={(e) => setDataOperacao(e.target.value)} required />
            </div>
          </div>
          {maquinaId && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div className="form-group">
                <label className="label">Horímetro inicial *</label>
                <input className="input" type="number" min="0" step="0.1" value={horimetroInicial} onChange={(e) => setHorimetroInicial(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">Horímetro final *</label>
                <input className="input" type="number" min="0" step="0.1" value={horimetroFinal} onChange={(e) => setHorimetroFinal(e.target.value)} required />
              </div>
            </div>
          )}
          {horimetroInicial !== '' && horimetroFinal !== '' && Number.isFinite(horasPreview) && horasPreview > 0 && (
            <p style={{ fontWeight: 700, margin: '8px 0 14px' }}>Horas calculadas: {horasPreview.toFixed(1)} h</p>
          )}
          <div className="form-group">
            <label className="label">Observações</label>
            <textarea className="input" rows={2} value={observacaoOperacao} onChange={(e) => setObservacaoOperacao(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={salvando || !maquinaId}>{salvando ? 'Salvando...' : 'Registrar operação'}</button>
        </form>
      </section>

      <section className="card" style={{ marginBottom: 20 }}>
        <h2>Resumo operacional</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div><p className="text-muted">Operadores ativos</p><strong style={{ fontSize: 24 }}>{operadores.filter((o) => o.status === 'ativo').length}</strong></div>
          <div><p className="text-muted">Dias-operador registrados</p><strong style={{ fontSize: 24 }}>{diasOperados}</strong></div>
          <div><p className="text-muted">Horas registradas</p><strong style={{ fontSize: 24 }}>{totalHoras.toFixed(1)} h</strong></div>
        </div>
      </section>

      <section>
        <h2>Histórico de operações</h2>
        {operacoes.length === 0 ? <div className="vazio"><p>Nenhuma operação registrada.</p></div> : (
          <div className="card-list">
            {operacoes.map((r) => (
              <article key={r.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <strong>{r.operador_nome}</strong><strong>{Number(r.horas_operadas).toFixed(1)} h</strong>
                </div>
                <p className="text-sm text-muted">{r.maquina_nome} · {new Date(`${r.data_operacao}T12:00:00`).toLocaleDateString('pt-BR')}</p>
                <p className="text-sm">Horímetro: {r.horimetro_inicial} → {r.horimetro_final}</p>
                {r.observacoes && <p className="text-sm text-muted">{r.observacoes}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
