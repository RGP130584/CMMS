export function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let digito = 11 - (soma % 11);
  if (digito >= 10) digito = 0;
  if (parseInt(cpf[9]) !== digito) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  digito = 11 - (soma % 11);
  if (digito >= 10) digito = 0;
  if (parseInt(cpf[10]) !== digito) return false;

  return true;
}

export function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let soma = 0;
  for (let i = 0; i < 12; i++) soma += parseInt(cnpj[i]) * pesos1[i];
  let digito = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (parseInt(cnpj[12]) !== digito) return false;

  soma = 0;
  for (let i = 0; i < 13; i++) soma += parseInt(cnpj[i]) * pesos2[i];
  digito = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (parseInt(cnpj[13]) !== digito) return false;

  return true;
}

export function formatarDocumento(doc) {
  const d = doc.replace(/\D/g, '');
  if (d.length === 11) {
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (d.length === 14) {
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return doc;
}

export function formatarHorimetro(valor) {
  return `${Number(valor).toLocaleString('pt-BR')}h`;
}

export function validarEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const limpo = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpo);
}

