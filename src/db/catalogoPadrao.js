import db from './database';

export const FABRICANTES_PADRAO = [
  { nome: 'John Deere', pais: 'Estados Unidos / Brasil', site: 'https://www.deere.com.br' },
  { nome: 'Massey Ferguson', pais: 'Estados Unidos / Brasil', site: 'https://www.masseyferguson.com.br' },
  { nome: 'Case IH', pais: 'Estados Unidos', site: 'https://www.caseih.com.br' },
  { nome: 'New Holland', pais: 'Itália / Brasil', site: 'https://www.newholland.com.br' },
  { nome: 'Valtra', pais: 'Finlândia / Brasil', site: 'https://www.valtra.com.br' },
  { nome: 'Stara', pais: 'Brasil (Não-Me-Toque / RS)', site: 'https://www.stara.com.br' },
  { nome: 'Jacto', pais: 'Brasil (Pompeia / SP)', site: 'https://www.jacto.com' },
  { nome: 'Agrale', pais: 'Brasil (Caxias do Sul / RS)', site: 'https://www.agrale.com.br' },
  { nome: 'Kuhn', pais: 'França / Brasil (Passo Fundo / RS)', site: 'https://www.kuhn.com.br' },
  { nome: 'Marchesan (Tatu)', pais: 'Brasil (Matão / SP)', site: 'https://www.marchesan.com.br' },
  { nome: 'Baldan', pais: 'Brasil (Matão / SP)', site: 'https://www.baldan.com.br' },
];

export const PECAS_PADRAO = [
  // John Deere
  {
    codigo_oem: 'RE504836',
    descricao: 'Filtro de Óleo do Motor Lubrificante',
    grupo: 'Filtro',
    secao: 'Motor',
    modelos: ['6145J', '6115J', '6125J', '7200J', '7215J', 'S770'],
    texto_original: 'John Deere RE504836 Oil Filter High Efficiency',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: 'RE522878',
    descricao: 'Filtro de Combustível Secundário / Separador de Água',
    grupo: 'Filtro',
    secao: 'Alimentação',
    modelos: ['6145J', '6125J', '7200J', '8370R', 'S770'],
    texto_original: 'John Deere RE522878 Fuel Filter Secondary',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: 'RE541922',
    descricao: 'Filtro de Ar Primário do Motor Radial Seal',
    grupo: 'Filtro',
    secao: 'Admissão',
    modelos: ['6145J', '6175M', '6195M', '7200J'],
    texto_original: 'John Deere RE541922 Primary Air Filter',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: 'RE541925',
    descricao: 'Filtro de Ar Secundário de Segurança',
    grupo: 'Filtro',
    secao: 'Admissão',
    modelos: ['6145J', '6175M', '6195M'],
    texto_original: 'John Deere RE541925 Secondary Air Filter',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: 'AL172780',
    descricao: 'Filtro de Óleo Hidráulico e Transmissão PowerQuad',
    grupo: 'Hidráulica',
    secao: 'Transmissão',
    modelos: ['6145J', '6115J', '6125J', '6130J'],
    texto_original: 'John Deere AL172780 Hydraulic Transmission Filter',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: 'R502340',
    descricao: 'Correia Poly-V do Alternador e Ventilador',
    grupo: 'Correia',
    secao: 'Motor',
    modelos: ['6145J', '6125J', '6115J'],
    texto_original: 'John Deere R502340 Fan Belt Poly-V',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: 'AH128449',
    descricao: 'Lâmina do Picador de Palha com Tungstênio',
    grupo: 'Colheitadeira',
    secao: 'Rotor/Picador',
    modelos: ['S770', 'S680', 'S780', '9770 STS'],
    texto_original: 'John Deere AH128449 Straw Chopper Blade',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: 'TY26674',
    descricao: 'Óleo Lubrificante Motor Plus-50 II 15W-40 (Balde 20L)',
    grupo: 'Motor',
    secao: 'Lubrificantes',
    modelos: ['Todos John Deere Tratores e Colhedoras'],
    texto_original: 'John Deere TY26674 Plus-50 II Engine Oil 15W-40',
    status: 'publicado',
    revisado: true,
  },

  // Massey Ferguson
  {
    codigo_oem: '3619554M1',
    descricao: 'Filtro de Óleo do Motor Perkins / AGCO Power',
    grupo: 'Filtro',
    secao: 'Motor',
    modelos: ['MF 4292', 'MF 4297', 'MF 4299', 'MF 4707', 'MF 4708'],
    texto_original: 'Massey Ferguson 3619554M1 Engine Oil Filter',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: '837079726',
    descricao: 'Filtro de Combustível Sedimentador com Dreno',
    grupo: 'Filtro',
    secao: 'Alimentação',
    modelos: ['MF 4292', 'MF 7719', 'MF 7725'],
    texto_original: 'Massey Ferguson 837079726 Fuel Pre-Filter',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: '3905873M91',
    descricao: 'Elemento Filtrante de Ar do Motor',
    grupo: 'Filtro',
    secao: 'Admissão',
    modelos: ['MF 4292', 'MF 4290', 'MF 4283'],
    texto_original: 'Massey Ferguson 3905873M91 Air Filter Element',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: '3595175M1',
    descricao: 'Correia do Ventilador e Bomba d Água',
    grupo: 'Correia',
    secao: 'Arrefecimento',
    modelos: ['MF 4292', 'MF 4297'],
    texto_original: 'Massey Ferguson 3595175M1 V-Belt',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: '4271842M1',
    descricao: 'Retentor da Tomada de Força Traseira (TDP)',
    grupo: 'Retentor',
    secao: 'Transmissão',
    modelos: ['MF 4292', 'MF 4275', 'MF 4290'],
    texto_original: 'Massey Ferguson 4271842M1 PTO Oil Seal',
    status: 'publicado',
    revisado: true,
  },

  // Case IH & New Holland (CNH Industrial)
  {
    codigo_oem: '84217229',
    descricao: 'Filtro de Óleo do Motor FPT Cursor / NEF',
    grupo: 'Filtro',
    secao: 'Motor',
    modelos: ['Patriot 350', 'Puma 185', 'Puma 215', 'Magnum 340', 'CR 7.90'],
    texto_original: 'Case IH 84217229 Engine Oil Filter',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: '87409203',
    descricao: 'Filtro de Combustível Primário com Sensor',
    grupo: 'Filtro',
    secao: 'Alimentação',
    modelos: ['Patriot 350', 'Patriot 250', 'Puma 155'],
    texto_original: 'Case IH 87409203 Fuel Filter Element',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: '87682998',
    descricao: 'Filtro de Ar Primário de Alta Eficiência',
    grupo: 'Filtro',
    secao: 'Admissão',
    modelos: ['Patriot 350', 'Maxxum 135', 'Puma 200'],
    texto_original: 'Case IH 87682998 Primary Air Filter',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: '84178556',
    descricao: 'Filtro Hidráulico do Circuito de Pulverização',
    grupo: 'Hidráulica',
    secao: 'Pulverização',
    modelos: ['Patriot 350', 'Patriot 250'],
    texto_original: 'Case IH 84178556 Hydraulic Pressure Filter',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: '84565884',
    descricao: 'Bico de Pulverização Cerâmica Anti-Deriva Cone Vazio',
    grupo: 'Pulverizador',
    secao: 'Barras',
    modelos: ['Patriot 350', 'Patriot 250', 'Spartan'],
    texto_original: 'Case IH 84565884 Spray Nozzle Tip',
    status: 'publicado',
    revisado: true,
  },

  // Valtra
  {
    codigo_oem: 'V837079728',
    descricao: 'Filtro de Combustível Principal Valtra AGCO',
    grupo: 'Filtro',
    secao: 'Alimentação',
    modelos: ['BH 180', 'BH 194', 'A990', 'T230', 'T250'],
    texto_original: 'Valtra V837079728 Fuel Filter',
    status: 'publicado',
    revisado: true,
  },
  {
    codigo_oem: 'V836862582',
    descricao: 'Filtro de Óleo Lubrificante Motor Sisu Power',
    grupo: 'Filtro',
    secao: 'Motor',
    modelos: ['BH 180', 'BH 194', 'BM 125', 'A950'],
    texto_original: 'Valtra V836862582 Sisu Oil Filter',
    status: 'publicado',
    revisado: true,
  },
];

// Peças pendentes de revisão para a tela /catalogo/revisao
export const PECAS_REVISAO_PADRAO = [
  {
    codigo_oem: 'RE51630',
    descricao: 'Sensor de Pressão de Óleo do Bloco do Motor',
    grupo: 'Motor',
    secao: 'Elétrica / Sensores',
    modelos: ['6145J', '7200J', '8370R'],
    referencia_pagina: 'Página 14, Linha 3',
    texto_original: 'Ref: RE51630 - Oil Pressure Sensor switch M14x1.5',
    status: 'revisao_necessaria',
    revisado: false,
    erros: ['sem_modelo'],
  },
  {
    codigo_oem: '3782570M1',
    descricao: 'Válvula Termostática Dupla 82°C com Junta',
    grupo: 'Motor',
    secao: 'Arrefecimento',
    modelos: ['MF 4292', 'MF 4297', 'MF 7719'],
    referencia_pagina: 'Página 22, Linha 8',
    texto_original: 'MF P/N 3782570M1 Thermostat assembly 82C with O-ring',
    status: 'revisao_necessaria',
    revisado: false,
    erros: ['descricao_curta'],
  },
  {
    codigo_oem: '87356194',
    descricao: 'Rolamento Cônico do Eixo de Tração Dianteira 4WD',
    grupo: 'Rolamento',
    secao: 'Eixo Dianteiro',
    modelos: ['Patriot 350', 'Puma 185', 'Maxxum 135'],
    referencia_pagina: 'Página 35, Linha 12',
    texto_original: 'Case IH P/N 87356194 Tapered Roller Bearing Front Axle',
    status: 'revisao_necessaria',
    revisado: false,
    erros: ['sem_modelo'],
  },
  {
    codigo_oem: 'V837079730',
    descricao: 'Junta da Tampa de Válvulas Motor Sisu 6 Cilindros',
    grupo: 'Junta',
    secao: 'Cabeçote / Motor',
    modelos: ['BH 180', 'BH 194', 'T230'],
    referencia_pagina: 'Página 41, Linha 5',
    texto_original: 'Valtra Valve Cover Gasket V837079730 6-Cylinder Sisu',
    status: 'revisao_necessaria',
    revisado: false,
    erros: ['sem_modelo'],
  },
  {
    codigo_oem: 'ST-84920',
    descricao: 'Barra Articulada de Transmissão Hidrostática',
    grupo: 'Pulverizador',
    secao: 'Transmissão / Barras',
    modelos: ['Imperador 3.0', 'Imperador 4000'],
    referencia_pagina: 'Página 18, Linha 9',
    texto_original: 'Stara ST-84920 Linkage Bar Hydrostatic Drive',
    status: 'revisao_necessaria',
    revisado: false,
    erros: ['sem_modelo'],
  },
  {
    codigo_oem: 'JC-11928',
    descricao: 'Manômetro com Glicerina 0-300 PSI para Barra',
    grupo: 'Pulverizador',
    secao: 'Circuito de Pulverização',
    modelos: ['Uniport 3030', 'Uniport 2500', 'Condor 800'],
    referencia_pagina: 'Página 9, Linha 4',
    texto_original: 'Jacto P/N 11928 Glycerin Pressure Gauge 0-300 PSI 1/4 NPT',
    status: 'revisao_necessaria',
    revisado: false,
    erros: ['sem_modelo'],
  },
];

// Peças aprovadas prontas para a tela /catalogo/publicar
export const PECAS_APROVADAS_PADRAO = [
  {
    codigo_oem: 'RE504838',
    descricao: 'Elemento Filtrante de Combustível Primário 30 Micron',
    grupo: 'Filtro',
    secao: 'Alimentação',
    modelos: ['6145J', '6175M', '7200J'],
    referencia_pagina: 'Página 12, Linha 6',
    texto_original: 'John Deere RE504838 Primary Fuel Filter 30u',
    status: 'aprovado',
    revisado: true,
  },
  {
    codigo_oem: '84217230',
    descricao: 'Sensor de Temperatura do Líquido de Arrefecimento',
    grupo: 'Motor',
    secao: 'Elétrica / Sensores',
    modelos: ['Patriot 350', 'Puma 185'],
    referencia_pagina: 'Página 28, Linha 14',
    texto_original: 'Case IH 84217230 Coolant Temperature Sensor',
    status: 'aprovado',
    revisado: true,
  },
  {
    codigo_oem: '3905874M92',
    descricao: 'Filtro de Ar Secundário de Segurança Radial Seal',
    grupo: 'Filtro',
    secao: 'Admissão',
    modelos: ['MF 4292', 'MF 4299', 'MF 7719'],
    referencia_pagina: 'Página 16, Linha 2',
    texto_original: 'Massey Ferguson 3905874M92 Secondary Safety Air Filter',
    status: 'aprovado',
    revisado: true,
  },
];

// SVG Schematics para Diagramas Técnicos
function gerarSvgDataUrl(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

const SVG_DIAGRAMA_HIDRAULICO = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="800" height="500" rx="12" fill="url(#bg)" stroke="#334155" stroke-width="2"/>
  <text x="400" y="38" fill="#f8fafc" font-size="18" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">ESQUEMA TÉCNICO: CIRCUITO HIDRÁULICO DE LEVANTE E VÁLVULAS SCV</text>
  <text x="400" y="60" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif" text-anchor="middle">Tratores Agrícolas de Alta Potência (Pressão Nominal: 210 bar)</text>

  <!-- Linha de Sucção / Retorno (Azul) -->
  <path d="M 120 400 L 120 250 L 220 250" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="6,4"/>
  <path d="M 440 330 L 440 400 L 120 400" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <text x="170" y="420" fill="#38bdf8" font-size="11" font-family="system-ui, sans-serif">Linha de Retorno ao Reservatório (Baixa Pressão)</text>

  <!-- Linha de Alta Pressão (Vermelho) -->
  <path d="M 280 250 L 360 250" fill="none" stroke="#ef4444" stroke-width="6"/>
  <path d="M 440 250 L 520 250 L 520 180 L 620 180" fill="none" stroke="#ef4444" stroke-width="5"/>
  <path d="M 520 250 L 520 320 L 620 320" fill="none" stroke="#10b981" stroke-width="4"/>

  <!-- Reservatório de Óleo -->
  <rect x="60" y="320" width="100" height="90" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="110" y="355" fill="#f8fafc" font-size="12" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">RESERVATÓRIO</text>
  <text x="110" y="375" fill="#94a3b8" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">Cap: 85 Litros</text>
  <circle cx="110" cy="330" r="14" fill="#38bdf8" fill-opacity="0.2"/>
  <text x="110" y="335" fill="#38bdf8" font-weight="bold" font-size="12" text-anchor="middle">1</text>

  <!-- Bomba Hidráulica -->
  <rect x="220" y="215" width="70" height="70" rx="35" fill="#334155" stroke="#f59e0b" stroke-width="3"/>
  <polygon points="245,240 265,250 245,260" fill="#f59e0b"/>
  <text x="255" y="305" fill="#f8fafc" font-size="12" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">BOMBA TANDEM</text>
  <text x="255" y="320" fill="#94a3b8" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">120 L/min - 210 bar</text>
  <circle cx="255" cy="205" r="14" fill="#f59e0b" fill-opacity="0.2"/>
  <text x="255" y="210" fill="#f59e0b" font-weight="bold" font-size="12" text-anchor="middle">2</text>

  <!-- Filtro de Pressão / Válvula Alívio -->
  <rect x="360" y="220" width="80" height="60" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="2"/>
  <text x="400" y="248" fill="#f8fafc" font-size="11" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">BLOCO VÁLVULA</text>
  <text x="400" y="265" fill="#ef4444" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">SCV Eletro-Hidr.</text>
  <circle cx="400" cy="210" r="14" fill="#ef4444" fill-opacity="0.2"/>
  <text x="400" y="215" fill="#ef4444" font-weight="bold" font-size="12" text-anchor="middle">3</text>

  <!-- Cilindro de Levante 3 Pontos -->
  <rect x="620" y="150" width="120" height="50" rx="6" fill="#334155" stroke="#10b981" stroke-width="2"/>
  <rect x="710" y="165" width="40" height="20" fill="#64748b"/>
  <text x="680" y="175" fill="#f8fafc" font-size="11" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">CILINDRO LEVANTE</text>
  <text x="680" y="190" fill="#10b981" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">3 Pontos Traseiro</text>
  <circle cx="680" cy="138" r="14" fill="#10b981" fill-opacity="0.2"/>
  <text x="680" y="143" fill="#10b981" font-weight="bold" font-size="12" text-anchor="middle">4</text>

  <!-- Engates Rápidos Remotos SCV -->
  <rect x="620" y="295" width="120" height="50" rx="6" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="650" cy="320" r="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <circle cx="690" cy="320" r="10" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="680" y="360" fill="#f8fafc" font-size="11" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">ENGATES RÁPIDOS SCV</text>
  <circle cx="680" cy="283" r="14" fill="#38bdf8" fill-opacity="0.2"/>
  <text x="680" y="288" fill="#38bdf8" font-weight="bold" font-size="12" text-anchor="middle">5</text>

  <!-- Legenda -->
  <rect x="40" y="445" width="720" height="40" rx="6" fill="#0b1329" stroke="#1e293b"/>
  <text x="55" y="470" fill="#94a3b8" font-size="11" font-family="system-ui, sans-serif">
    <tspan fill="#f59e0b" font-weight="bold">Peças Chave:</tspan> Filtro Hidr. AL172780 | Válvula Alívio 84178556 | Retentor 4271842M1 | Óleo ISO VG 68
  </text>
</svg>
`;

const SVG_DIAGRAMA_ARREFECIMENTO = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <rect width="800" height="500" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <text x="400" y="38" fill="#f8fafc" font-size="18" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">DIAGRAMA TÉCNICO: ARREFECIMENTO DO MOTOR E CORREIAS POLY-V</text>
  <text x="400" y="60" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif" text-anchor="middle">Circuito Térmico Fechado com Válvula Termostática e Ventilação Viscosa</text>

  <!-- Radiador -->
  <rect x="80" y="140" width="120" height="230" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
  <line x1="95" y1="170" x2="185" y2="170" stroke="#38bdf8" stroke-dasharray="4,4"/>
  <line x1="95" y1="200" x2="185" y2="200" stroke="#38bdf8" stroke-dasharray="4,4"/>
  <line x1="95" y1="230" x2="185" y2="230" stroke="#38bdf8" stroke-dasharray="4,4"/>
  <line x1="95" y1="260" x2="185" y2="260" stroke="#38bdf8" stroke-width="2"/>
  <line x1="95" y1="290" x2="185" y2="290" stroke="#38bdf8" stroke-dasharray="4,4"/>
  <line x1="95" y1="320" x2="185" y2="320" stroke="#38bdf8" stroke-dasharray="4,4"/>
  <text x="140" y="388" fill="#38bdf8" font-size="12" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">RADIADOR PRINCIPAL</text>

  <!-- Mangueiras Superior (Quente) e Inferior (Fria) -->
  <path d="M 180 160 L 380 160" fill="none" stroke="#ef4444" stroke-width="8"/>
  <path d="M 380 340 L 180 340" fill="none" stroke="#38bdf8" stroke-width="8"/>
  <text x="270" y="150" fill="#ef4444" font-size="11" font-weight="bold">Líquido Quente (90°C)</text>
  <text x="270" y="330" fill="#38bdf8" font-size="11" font-weight="bold">Líquido Frio (75°C)</text>

  <!-- Bloco do Motor -->
  <rect x="380" y="120" width="220" height="260" rx="12" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <text x="490" y="150" fill="#f8fafc" font-size="14" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">BLOCO DO MOTOR 6 CIL</text>
  
  <!-- Válvula Termostática -->
  <circle cx="380" cy="160" r="18" fill="#ef4444"/>
  <text x="380" y="164" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">82°C</text>
  <text x="380" y="195" fill="#fca5a5" font-size="10" text-anchor="middle">Termostato</text>

  <!-- Bomba d'Água -->
  <circle cx="380" cy="340" r="22" fill="#38bdf8"/>
  <text x="380" y="344" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">BOMBA</text>
  <text x="380" y="375" fill="#7dd3fc" font-size="10" text-anchor="middle">Bomba d'Água</text>

  <!-- Polias e Correia Poly-V -->
  <circle cx="680" cy="170" r="30" fill="#334155" stroke="#f59e0b" stroke-width="3"/>
  <text x="680" y="174" fill="#fff" font-size="10" text-anchor="middle">ALTERNADOR</text>
  <circle cx="680" cy="270" r="22" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
  <text x="680" y="274" fill="#fff" font-size="9" text-anchor="middle">TENSOR</text>
  <circle cx="680" cy="360" r="40" fill="#334155" stroke="#f59e0b" stroke-width="3"/>
  <text x="680" y="364" fill="#fff" font-size="10" text-anchor="middle">VIRABREQUIM</text>

  <!-- Correia -->
  <path d="M 680 140 L 710 170 L 702 270 L 720 360 L 640 360 L 650 170 Z" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="6,4"/>
  <text x="735" y="235" fill="#f59e0b" font-size="11" font-weight="bold">Correia R502340</text>

  <!-- Rodapé -->
  <rect x="40" y="445" width="720" height="40" rx="6" fill="#0b1329" stroke="#1e293b"/>
  <text x="55" y="470" fill="#94a3b8" font-size="11" font-family="system-ui, sans-serif">
    <tspan fill="#38bdf8" font-weight="bold">Subconjuntos:</tspan> Correia Poly-V R502340 / 3595175M1 | Termostato 3782570M1 | Filtro Óleo RE504836
  </text>
</svg>
`;

const SVG_DIAGRAMA_PULVERIZACAO = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <rect width="800" height="500" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <text x="400" y="38" fill="#f8fafc" font-size="18" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">FLUXOGRAMA HIDRÁULICO: CIRCUITO DE PULVERIZAÇÃO DE BARRAS</text>
  <text x="400" y="60" fill="#94a3b8" font-size="12" font-family="system-ui, sans-serif" text-anchor="middle">Pulverizador Autopropelido (36 metros de barra com corte de 9 seções)</text>

  <!-- Tanque de Calda -->
  <rect x="60" y="160" width="130" height="180" rx="16" fill="#1e293b" stroke="#10b981" stroke-width="3"/>
  <text x="125" y="240" fill="#10b981" font-size="14" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle">TANQUE CALDA</text>
  <text x="125" y="260" fill="#94a3b8" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">Volume: 3.500 L</text>

  <!-- Filtro de Sucção -->
  <rect x="230" y="225" width="60" height="50" rx="6" fill="#334155" stroke="#38bdf8" stroke-width="2"/>
  <text x="260" y="255" fill="#38bdf8" font-size="10" font-weight="bold" text-anchor="middle">FILTRO 50#</text>

  <!-- Linha de Sucção -->
  <path d="M 190 250 L 230 250" fill="none" stroke="#10b981" stroke-width="5"/>
  <path d="M 290 250 L 330 250" fill="none" stroke="#10b981" stroke-width="5"/>

  <!-- Bomba Centrífuga de Inox -->
  <circle cx="360" cy="250" r="30" fill="#1e293b" stroke="#f59e0b" stroke-width="3"/>
  <text x="360" y="245" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="middle">BOMBA</text>
  <text x="360" y="260" fill="#f8fafc" font-size="9" text-anchor="middle">Centrífuga Inox</text>

  <!-- Fluxômetro e Válvula Reguladora -->
  <path d="M 390 250 L 450 250" fill="none" stroke="#38bdf8" stroke-width="5"/>
  <rect x="450" y="225" width="70" height="50" rx="6" fill="#334155" stroke="#ef4444" stroke-width="2"/>
  <text x="485" y="245" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="middle">COMANDO</text>
  <text x="485" y="260" fill="#fff" font-size="9" text-anchor="middle">9 Válvulas</text>

  <!-- Barras Esquerda, Centro, Direita -->
  <path d="M 520 250 L 580 160 L 740 160" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <path d="M 520 250 L 580 250 L 740 250" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <path d="M 520 250 L 580 340 L 740 340" fill="none" stroke="#38bdf8" stroke-width="3"/>

  <text x="660" y="145" fill="#38bdf8" font-size="11" font-weight="bold">Barra Esquerda (Seções 1 a 4)</text>
  <text x="660" y="235" fill="#38bdf8" font-size="11" font-weight="bold">Barra Central (Seção 5)</text>
  <text x="660" y="325" fill="#38bdf8" font-size="11" font-weight="bold">Barra Direita (Seções 6 a 9)</text>

  <!-- Bicos de Pulverização -->
  <circle cx="610" cy="160" r="5" fill="#10b981"/>
  <circle cx="650" cy="160" r="5" fill="#10b981"/>
  <circle cx="690" cy="160" r="5" fill="#10b981"/>
  <circle cx="730" cy="160" r="5" fill="#10b981"/>
  <circle cx="610" cy="340" r="5" fill="#10b981"/>
  <circle cx="650" cy="340" r="5" fill="#10b981"/>
  <circle cx="690" cy="340" r="5" fill="#10b981"/>
  <circle cx="730" cy="340" r="5" fill="#10b981"/>

  <!-- Rodapé -->
  <rect x="40" y="445" width="720" height="40" rx="6" fill="#0b1329" stroke="#1e293b"/>
  <text x="55" y="470" fill="#94a3b8" font-size="11" font-family="system-ui, sans-serif">
    <tspan fill="#10b981" font-weight="bold">Peças Homologadas:</tspan> Pontas Cerâmicas 84565884 | Filtro de Linha 84178556 | Manômetro JC-11928
  </text>
</svg>
`;

export const DIAGRAMAS_PADRAO = [
  {
    numero: 1,
    pagina: 1,
    indice: 0,
    nome: 'Esquema Hidráulico do Levante Traseiro e Válvulas SCV',
    largura: 800,
    altura: 500,
    imagem: gerarSvgDataUrl(SVG_DIAGRAMA_HIDRAULICO),
  },
  {
    numero: 2,
    pagina: 8,
    indice: 1,
    nome: 'Circuito de Arrefecimento e Rotação de Correias Poly-V',
    largura: 800,
    altura: 500,
    imagem: gerarSvgDataUrl(SVG_DIAGRAMA_ARREFECIMENTO),
  },
  {
    numero: 3,
    pagina: 15,
    indice: 2,
    nome: 'Fluxograma Hidráulico do Circuito de Pulverização de Barras',
    largura: 800,
    altura: 500,
    imagem: gerarSvgDataUrl(SVG_DIAGRAMA_PULVERIZACAO),
  },
];

export const EQUIVALENCIAS_PADRAO = [
  {
    codigo_anterior: 'RE59754',
    codigo_novo: 'RE504836',
    motivo: 'Atualização de engenharia John Deere para maior vazão e eficiência de retenção 20u',
    oem_referencia: 'RE504836',
  },
  {
    codigo_anterior: '87409202',
    codigo_novo: '87409203',
    motivo: 'Substituição pelo novo elemento CNH com sensor d’água integrado no dreno inferior',
    oem_referencia: '87409203',
  },
  {
    codigo_anterior: '3611274M1',
    codigo_novo: '3619554M1',
    motivo: 'Nova especificação AGCO Power para óleos sintéticos e semi-sintéticos',
    oem_referencia: '3619554M1',
  },
  {
    codigo_anterior: '836640162',
    codigo_novo: 'V836862582',
    motivo: 'Substituição do código antigo de fábrica Valtra / Sisu Diesel',
    oem_referencia: 'V836862582',
  },
  {
    codigo_anterior: 'AR101580',
    codigo_novo: 'AL172780',
    motivo: 'Atualização para sistema hidráulico PowerQuad de alto fluxo',
    oem_referencia: 'AL172780',
  },
  {
    codigo_anterior: '84178550',
    codigo_novo: '84178556',
    motivo: 'Filtro hidráulico reforçado com carcaça em alumínio para pulverizadores Patriot',
    oem_referencia: '84178556',
  },
  {
    codigo_anterior: 'LF16015 (Fleetguard)',
    codigo_novo: 'RE504836',
    motivo: 'Equivalência cruzada Fleetguard para código OEM John Deere',
    oem_referencia: 'RE504836',
  },
  {
    codigo_anterior: 'P550388 (Donaldson)',
    codigo_novo: '84217229',
    motivo: 'Equivalência cruzada Donaldson para motores FPT Case IH',
    oem_referencia: '84217229',
  },
];

export async function inicializarCatalogoPadraoSeVazio() {
  // 1. Garantir Fabricantes
  const totalFabricantes = await db.fabricante.count();
  const mapaFabricantes = {};

  if (totalFabricantes === 0) {
    for (const fab of FABRICANTES_PADRAO) {
      const id = await db.fabricante.add({
        nome: fab.nome,
        pais: fab.pais,
        site: fab.site,
        criado_em: new Date().toISOString(),
      });
      mapaFabricantes[fab.nome] = id;
    }
  } else {
    const fabs = await db.fabricante.toArray();
    for (const f of fabs) {
      mapaFabricantes[f.nome] = f.id;
    }
  }

  // 2. Garantir Fontes de Catálogo
  let totalFontes = await db.fonteCatalogo.count();
  let f1 = 1, f2 = 2, f3 = 3;

  if (totalFontes === 0) {
    f1 = await db.fonteCatalogo.add({
      fabricante_id: mapaFabricantes['John Deere'] || 1,
      nome: 'Catálogo Oficial John Deere Parts',
      tipo: 'catalogo_online',
      url: 'https://partscatalog.deere.com',
      status: 'ativo',
      criado_em: new Date().toISOString(),
    });

    f2 = await db.fonteCatalogo.add({
      fabricante_id: mapaFabricantes['Massey Ferguson'] || 2,
      nome: 'Catálogo AGCO Parts Massey Ferguson',
      tipo: 'catalogo_online',
      url: 'https://parts.agcocorp.com',
      status: 'ativo',
      criado_em: new Date().toISOString(),
    });

    f3 = await db.fonteCatalogo.add({
      fabricante_id: mapaFabricantes['Case IH'] || 3,
      nome: 'Catálogo CNH Industrial Case IH / New Holland',
      tipo: 'catalogo_online',
      url: 'https://www.mycnhistore.com',
      status: 'ativo',
      criado_em: new Date().toISOString(),
    });
  }

  // 3. Garantir Catálogo de Arquivos (PDFs/Manuais)
  let totalArquivos = await db.catalogoArquivo.count();
  let arqId = 1;
  if (totalArquivos === 0) {
    arqId = await db.catalogoArquivo.add({
      fonte_id: f1,
      arquivo_nome: 'Manual_Tecnico_Sistemas_Agricolas_2026.pdf',
      arquivo_tamanho: 4892010,
      arquivo_tipo: 'application/pdf',
      hash: 'manual-tecnico-oficial-padrao-2026',
      total_paginas: 48,
      total_pecas_extraidas: 32,
      total_revisao: 6,
      status: 'extraido',
      criado_em: new Date().toISOString(),
    });
  } else {
    const arq = await db.catalogoArquivo.first();
    if (arq) arqId = arq.id;
  }

  // 4. Garantir Peças (Publicadas, Em Revisão e Aprovadas)
  const totalPecas = await db.catalogoPeca.count();
  if (totalPecas === 0) {
    // 4.1 Peças Publicadas
    for (const p of PECAS_PADRAO) {
      let fonteId = f1;
      if (p.codigo_oem.startsWith('3') || p.codigo_oem.startsWith('83') || p.codigo_oem.startsWith('42')) {
        fonteId = f2;
      } else if (p.codigo_oem.startsWith('84') || p.codigo_oem.startsWith('87')) {
        fonteId = f3;
      }

      await db.catalogoPeca.add({
        catalogo_arquivo_id: arqId || fonteId,
        codigo_oem: p.codigo_oem,
        codigo_oem_todos: [p.codigo_oem],
        descricao: p.descricao,
        grupo: p.grupo,
        secao: p.secao,
        modelos: p.modelos,
        texto_original: p.texto_original,
        referencia_pagina: 'Manual de Peças de Fábrica',
        status: p.status || 'publicado',
        revisado: p.revisado ?? true,
        criado_em: new Date().toISOString(),
      });
    }

    // 4.2 Peças Pendentes de Revisão
    for (const p of PECAS_REVISAO_PADRAO) {
      await db.catalogoPeca.add({
        catalogo_arquivo_id: arqId,
        codigo_oem: p.codigo_oem,
        codigo_oem_todos: [p.codigo_oem],
        descricao: p.descricao,
        grupo: p.grupo,
        secao: p.secao,
        modelos: p.modelos,
        referencia_pagina: p.referencia_pagina,
        texto_original: p.texto_original,
        status: 'revisao_necessaria',
        revisado: false,
        erros: p.erros || ['sem_modelo'],
        criado_em: new Date().toISOString(),
      });
    }

    // 4.3 Peças Aprovadas (Prontas para Publicar)
    for (const p of PECAS_APROVADAS_PADRAO) {
      await db.catalogoPeca.add({
        catalogo_arquivo_id: arqId,
        codigo_oem: p.codigo_oem,
        codigo_oem_todos: [p.codigo_oem],
        descricao: p.descricao,
        grupo: p.grupo,
        secao: p.secao,
        modelos: p.modelos,
        referencia_pagina: p.referencia_pagina,
        texto_original: p.texto_original,
        status: 'aprovado',
        revisado: true,
        criado_em: new Date().toISOString(),
      });
    }
  }

  // 5. Garantir Diagramas Técnicos
  const totalDiagramas = await db.catalogoDiagrama.count();
  if (totalDiagramas === 0) {
    for (const d of DIAGRAMAS_PADRAO) {
      await db.catalogoDiagrama.add({
        catalogo_arquivo_id: arqId,
        numero: d.numero,
        pagina: d.pagina,
        indice: d.indice,
        nome: d.nome,
        largura: d.largura,
        altura: d.altura,
        imagem: d.imagem,
        criado_em: new Date().toISOString(),
      });
    }
  }

  // 6. Garantir Equivalências de Peças
  const totalEquivalencias = await db.catalogoSubstituicao.count();
  if (totalEquivalencias === 0) {
    const pecasPublicadas = await db.catalogoPeca.where('status').equals('publicado').toArray();
    const mapaPecasPorOem = {};
    for (const p of pecasPublicadas) {
      mapaPecasPorOem[p.codigo_oem] = p.id;
    }

    for (const eq of EQUIVALENCIAS_PADRAO) {
      const pecaId = mapaPecasPorOem[eq.oem_referencia] || pecasPublicadas[0]?.id || 1;
      await db.catalogoSubstituicao.add({
        catalogo_peca_id: pecaId,
        codigo_anterior: eq.codigo_anterior,
        codigo_novo: eq.codigo_novo,
        motivo: eq.motivo,
        criado_em: new Date().toISOString(),
      });
    }
  }
}

