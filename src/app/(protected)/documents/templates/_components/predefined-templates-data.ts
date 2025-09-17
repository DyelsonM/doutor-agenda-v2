export const predefinedTemplates = [
  // ANAMNESE TEMPLATES

  {
    id: "other-pcd",
    type: "other" as const,
    title: "Laudo Médico PCD2",
    description: "Template padrão para laudo médico PCD2",
    content: `LAUDO MÉDICO

Eu, Dr(a). [Nome do médico], CRM [ ], atesto que o(a) paciente [Nome do paciente], portador(a) do CPF [ ], foi avaliado(a) em consulta e apresenta diagnóstico de [ ] conforme descrito na Classificação Internacional de Doenças.

(CID-10): [ ]

Observações:

Tal condição enquadra-se nos critérios estabelecidos pelo Decreto nº 3.298/1999 e pela Lei nº 13.146/2015 (Estatuto da Pessoa com Deficiência) para caracterização de pessoa com deficiência (PCD).

Este laudo destina-se exclusivamente à comprovação da condição de Pessoa com Deficiência (PCD) para fins de cumprimento da Lei de Cotas (Art. 93 da Lei nº 8.213/1991), que determina a inclusão de PCDs no mercado de trabalho.

Local e data: [Cidade], [ ] de [ ] de 20[ ]

Assinatura e carimbo do médico: [ ]`,
  },
  {
    id: "other-pcd",
    type: "other" as const,
    title: "Laudo Caracterizador de Deficiência",
    description: "Template padrão para laudo caracterizador de deficiência",
    content: `LAUDO CARACTERIZADOR DE DEFICIÊNCIA

De acordo com os dispositivos da Convenção sobre os Direitos das Pessoas com Deficiência, Lei Brasileira de Inclusão – Estatuto da Pessoa com Deficiência – Lei 13.146/2015, Lei 12.764/12, Decreto 3.298/1999 e da Instrução Normativa SIT/MTE n.º 98 de 15/08/2012.

Nome: [ ]
CPF: [ ]
CID: [ ]

Origem da deficiência:
( [ ] Congênita )
( [ ] Acidente / Doença do trabalho )
( [ ] Acidente comum )
( [ ] Doença comum )
( [ ] Adquirida pós-operatório )

Descrição detalhada dos impedimentos (alterações)

[Descrever alterações nas funções e estruturas do corpo – física, auditiva, visual, intelectual e mental-psicossocial. Incluir exames complementares.]

Descrição das limitações nas atividades da vida diária

[Descrever limitações, restrições de participação social e se necessita de apoios – órteses, próteses, softwares, ajudas técnicas, cuidador etc.]

TIPOS DE DEFICIÊNCIA

I – Deficiência Física

( [ ] Paraplegia ) ( [ ] Paraparesia )

( [ ] Monoplegia ) ( [ ] Monoparesia )

( [ ] Tetraplegia ) ( [ ] Tetraparesia )

( [ ] Triplegia ) ( [ ] Triparesia )

( [ ] Hemiplegia ) ( [ ] Hemiparesia )

( [ ] Ostomia ) ( [ ] Amputação ou ausência de membro )

( [ ] Paralisia cerebral )

( [ ] Membros com deformidade congênita ou adquirida )

( [ ] Nanismo – altura: [ ] )

( [ ] Outras – especificar: [ ] )

II – Deficiência Auditiva
Perda bilateral, parcial ou total, de 41 dB ou mais, aferida por audiograma nas frequências de 500Hz, 1.000Hz, 2.000Hz e 3.000Hz.
Obs: Anexar audiograma.

III – Deficiência Visual

( [ ] Cegueira – acuidade visual ≤ 0,05 (20/400) no melhor olho, com a melhor correção óptica )

( [ ] Baixa visão – acuidade visual entre 0,3 (20/60) e 0,05 (20/400) no melhor olho, com a melhor correção óptica )

( [ ] Somatória do campo visual em ambos os olhos ≤ 60° )
Obs: Anexar laudo oftalmológico.

III a – Visão Monocular
Cegueira legal em um olho, acuidade visual ≤ 0,05 (20/400) com melhor correção óptica.
Obs: Anexar laudo oftalmológico.

IV – Deficiência Intelectual
Funcionamento intelectual significativamente inferior à média com limitações em pelo menos 2 habilidades adaptativas:
( Comunicação, Cuidado pessoal, Habilidades sociais, Utilização de recursos da comunidade, Saúde e segurança, Habilidades acadêmicas, Lazer, Trabalho )
Obs: Anexar laudo do especialista.

IV a – Deficiência Mental – Psicossocial
(Esquizofrenia, Transtornos psicóticos, outras limitações psicossociais que impeçam participação plena).
Obs: Anexar laudo do especialista.

IV b – Deficiência Mental – Lei 12.764/2012 – Espectro Autista
Obs: Anexar laudo do especialista.

V – Deficiência Múltipla
( [ ] Associação de duas ou mais deficiências acima )

CONCLUSÃO

A pessoa está enquadrada nas definições do Art. 2º da Lei nº 13.146/2015 – Lei Brasileira de Inclusão, dos artigos 3º e 4º do Decreto nº 3.298/1999, com alterações do Decreto nº 5.296/2004, do Art. 1º §2º da Lei nº 12.764/2012, Parecer CONJUR 444/11, das recomendações da IN 98/SIT/2012 e da Convenção sobre os Direitos das Pessoas com Deficiência (Decreto nº 6.949/2009).

Assinatura e carimbo do profissional de saúde (Especialidade): [ ]
Data: [ / / ]

Declaração do empregado:
Estou ciente de que estou sendo enquadrado na cota de pessoas com deficiência/reabilitados da empresa. Autorizo a apresentação deste Laudo e exames ao Ministério do Trabalho.

Assinatura do empregado: [ ]`,
  },
  {
    id: "anamnesis-fisio",
    type: "anamnesis" as const,
    title: "Avaliação Fisioterapia Respiratória",
    description: "Template padrão para avaliação fisioterapia respiratória",
    content: `AVALIAÇÃO FISIOTERAPIA

Data: [ / / ]

Nome: [ ]
Endereço: [ ]
Data de nascimento: [ / / ]
Idade: [ ] anos
Sexo: ( [ ] Masculino ) ( [ ] Feminino )
Contato: (81) [ ]
CPF: [ ]
RG: [ ]
Profissão: [ ]

2. Diagnóstico Clínico

[ ]

3. História da Doença Atual (HDA)

[ ]
[ ]
[ ]
[ ]
[ ]

4. Doenças Associadas

[ ]
[ ]

5. Doenças Pregressas

[ ]
[ ]

6. História Familiar

[ ]
[ ]

7. Hábitos de Vida

[ ]
[ ]

8. Queixa Principal

[ ]
[ ]

9. Exame Físico

Inspeção:

Posicionamento no leito: [ ]

Estado de Consciência: [ ]

Pele e Mucosas: [ ]

Vias de Acesso: [ ]

Formato do Tórax: ( [ ] Normal ) ( [ ] Tonel ) ( [ ] Carinatum ) ( [ ] Scavatum ) ( [ ] Sinus ) ( [ ] Outros: [ ] )

Tipo de Ventilação: ( [ ] Nasal ) ( [ ] Oral ) ( [ ] Ar ambiente ) ( [ ] Traqueostomia ) ( [ ] Oxigenoterapia: [ ] )

Padrão Muscular Ventilatório: ( [ ] Apical ) ( [ ] Diafragmático ) ( [ ] Misto ) ( [ ] Paradoxal )

Ritmo Ventilatório: ( [ ] Regular ) ( [ ] Irregular )

Musculatura Acessória: Grau [ ]

Abdome: [ ]

Sinais: ( [ ] Tiragem ) ( [ ] Batimento da Asa do Nariz ) ( [ ] Cianose ) ( [ ] Outros: [ ] )

Sintomas: ( [ ] Dispneia ) ( [ ] Tontura ) ( [ ] Dor ) ( [ ] Outros: [ ] )

Palpação: [ ]
Mobilidade Torácica: [ ]
Expansibilidade Pulmonar:

Preservada ( [ ] )

Diminuída: [ ]

Sinais Vitais

FR: [ ] ipm

FC: [ ] bpm

SpO₂: [ ] %

PA: [ ] mmHg

T: [ ] ºC

Ausculta Pulmonar

[ ]

Tosse:
( [ ] Improdutiva ) ( [ ] Produtiva – Eficaz ) ( [ ] Produtiva – Ineficaz )

Secreção:
( [ ] Mucóide ) ( [ ] Mucopurulenta ) ( [ ] Purulenta ) ( [ ] Hemática ) ( [ ] Outros: [ ] )

10. Exames Complementares

( [ ] Sim ) ( [ ] Não )
[ ]
[ ]

11. Plano Terapêutico (Objetivos e Conduta)

[ ]
[ ]
[ ]

12. Observações

[ ]
[ ]

Nome do profissional / Carimbo: [ ]`,
  },
  {
    id: "anamnesis-psychological",
    type: "anamnesis" as const,
    title: "Anamnese Psicologica",
    description: "Template padrão para anamnese psicológica",
    content: `IDENTIFICAÇÃO DO PACIENTE

Nome: [Nome do paciente]
Data de nascimento: [ / / ]
Religião: [Religião]
Idade: [Idade]
Estado Civil: [Estado Civil]
Cidade natal: [Cidade natal]
Estado natal: [Estado natal]
CEP: [CEP]
Endereço: [Endereço]
Contato: [Telefone]
WhatsApp: [WhatsApp]
Email: [Email]
Quem sabe que está em terapia: [Descrever]
Contato em emergência: [Nome/Telefone]
Escolaridade: [Escolaridade]
Empresa em que trabalha: [Empresa]
Horário: [Horário]
Função: [Função]
Encaminhamento: [Encaminhamento]
Profissional responsável: [Profissional]

DADOS DE IDENTIFICAÇÃO DOS PAIS

Nome do pai: [Nome] – Idade: [Idade] – Profissão: [Profissão] – Empresa: [Empresa] – Grau de instrução: [Grau]
Nome da mãe: [Nome] – Idade: [Idade] – Profissão: [Profissão] – Empresa: [Empresa] – Grau de instrução: [Grau]
Endereço: [Endereço]

FILHOS

Nome: [Nome]
Idades: [Idade(s)]
Profissão: [Profissão]
Escolaridade: [Escolaridade]

CÔNJUGE

Nome: [Nome]
Idade: [Idade]
Profissão: [Profissão]
Escolaridade: [Escolaridade]

QUEIXA PRINCIPAL

[Descrever queixa principal]

EVOLUÇÃO

Prioridade: [Prioridade]
Início da queixa: [Data/Período]
Súbita ou progressiva: [Descrever]
Mudanças que ocorreram / O que afetou: [Descrever]
Fez terapia anteriormente (citar qual e quando): [Descrever]
Expectativas e objetivos do paciente: [Descrever]

SINTOMAS APRESENTADOS

[Listar sintomas]

DOENÇAS FÍSICAS

[Listar]

ESTRESSORES PSICOSSOCIAIS

[Listar]

FUNCIONAMENTO GLOBAL

[Descrever]`,
  },
  {
    id: "anamnesis-podological",
    type: "anamnesis" as const,
    title: "Anamnese Podológica",
    description: "Template padrão para anamnese podológica",
    content: `IDENTIFICAÇÃO DO PACIENTE

Nome: [Nome do paciente]
Endereço: [Endereço]
Bairro: [Bairro]
Cidade: [Cidade]
CEP: [CEP]
Data de Nascimento: [ / / ]
Estado Civil: [Estado Civil]
Profissão: [Profissão]

Tipo de meia que mais usa: ( [ ] Algodão ) ( [ ] Poliéster )
Tipo de calçado que mais usa:
( [ ] Tênis ) ( [ ] Sapa tênis ) ( [ ] Coturno ) ( [ ] Bota de borracha )
( [ ] Chinelo ) ( [ ] Precatas ) ( [ ] Escarpam )

QUEIXA PRINCIPAL

[Descrever queixa principal]

HISTÓRIA DA DOENÇA ATUAL

[Descrever detalhadamente os sintomas, início, evolução, fatores que melhoram ou pioram]

ANTECEDENTES PESSOAIS

- Doenças anteriores: [Listar]
- Cirurgias: [Listar]
- Alergias: [Listar]
- Medicamentos em uso: [Listar]
- Hábitos: [Tabagismo, etilismo, exercícios físicos]

ANTECEDENTES FAMILIARES

- Doenças hereditárias: [Listar]
- Causa mortis dos pais: [Se aplicável]

EXAME FÍSICO

- Estado geral: [Bom/Regular/Ruim]
- Sinais vitais: [PA, FC, FR, T]
- Exame físico específico: [Descrever achados]

HIPÓTESE DIAGNÓSTICA

[Diagnóstico provável]

PLANO TERAPÊUTICO

[Tratamento proposto]

ORIENTAÇÕES

[Orientações gerais ao paciente]`,
  },
  {
    id: "anamnesis-functional-pilates",
    type: "anamnesis" as const,
    title: "Ficha de Avaliação Funcional - Pilates",
    description: "Template padrão para ficha de avaliação funcional - pilates",
    content: `FICHA DE AVALIAÇÃO FUNCIONAL - PILATES

IDENTIFICAÇÃO DO PACIENTE

Nome: [Nome do paciente]
Data de nascimento: [ / / ]
Idade: [Idade]
Sexo: [M/F]
Profissão: [Profissão]
Endereço: [Endereço]
Telefone: [Telefone]
Email: [Email]

HISTÓRIA CLÍNICA

Queixa principal: [Descrever queixa principal]
História da doença atual: [Descrever detalhadamente os sintomas, início, evolução, fatores que melhoram ou pioram]
Medicamentos em uso: [Listar medicamentos]
Alergias conhecidas: [Listar alergias]
Cirurgias anteriores: [Listar cirurgias]
Internações anteriores: [Listar internações]

ANTECEDENTES PESSOAIS

Doenças anteriores: [Listar]
Medicamentos em uso: [Listar]
Alergias: [Listar]
Tabagismo: [Sim/Não] - Quantidade: [Quantidade]
Etilismo: [Sim/Não] - Quantidade: [Quantidade]
Exercícios físicos: [Sim/Não] - Tipo: [Tipo]
Alimentação: [Descrever hábitos alimentares]

ANTECEDENTES FAMILIARES

Doenças hereditárias: [Listar]
Causa mortis dos pais: [Se aplicável]
Doenças na família: [Listar]

EXAME FÍSICO

Estado geral: [Bom/Regular/Ruim]
Sinais vitais:
- Pressão arterial: [PA] mmHg
- Frequência cardíaca: [FC] bpm
- Frequência respiratória: [FR] rpm
- Temperatura: [T] °C
- Peso: [Peso] kg
- Altura: [Altura] cm
- IMC: [IMC] kg/m²

Exame físico específico:
- Cabeça e pescoço: [Achados]
- Tórax: [Achados]
- Abdome: [Achados]
- Extremidades: [Achados]
- Sistema nervoso: [Achados]

EXAMES COMPLEMENTARES

Exames laboratoriais: [Listar e resultados]
Exames de imagem: [Listar e resultados]
Outros exames: [Listar e resultados]

HIPÓTESE DIAGNÓSTICA

Diagnóstico principal: [Diagnóstico]
Diagnósticos diferenciais: [Listar]

PLANO TERAPÊUTICO

Medicamentos prescritos: [Listar medicamentos, dosagem e posologia]
Orientações gerais: [Orientações ao paciente]
Retorno: [Data do retorno]
Encaminhamentos: [Se houver]

EVOLUÇÃO

Data: [DD/MM/AAAA]
Evolução: [Descrever evolução do caso]
Medicamentos ajustados: [Se houver]
Novas orientações: [Se houver]

OBSERVAÇÕES

[Observações adicionais]

Data: [DD/MM/AAAA] Hora: [HH:MM]

_______________________________________________________
Assinatura do médico: [Nome do médico]
CRM: [Número do CRM]`,
  },
  {
    id: "anamnesis-orthopedic",
    type: "anamnesis" as const,
    title: "Ficha de Avaliação em Ortopedia",
    description: "Template padrão para ficha de avaliação em ortopedia",
    content: `FICHA DE AVALIAÇÃO EM ORTOPEDIA

IDENTIFICAÇÃO DO PACIENTE

Nome: [Nome do paciente]
Data de nascimento: [ / / ]
Idade: [Idade]
Sexo: [M/F]
Profissão: [Profissão]
Endereço: [Endereço]
Telefone: [Telefone]
Email: [Email]

HISTÓRIA CLÍNICA

Queixa principal: [Descrever queixa principal]
História da doença atual: [Descrever detalhadamente os sintomas, início, evolução, fatores que melhoram ou pioram]
Medicamentos em uso: [Listar medicamentos]
Alergias conhecidas: [Listar alergias]
Cirurgias anteriores: [Listar cirurgias]
Internações anteriores: [Listar internações]

ANTECEDENTES PESSOAIS

Doenças anteriores: [Listar]
Medicamentos em uso: [Listar]
Alergias: [Listar]
Tabagismo: [Sim/Não] - Quantidade: [Quantidade]
Etilismo: [Sim/Não] - Quantidade: [Quantidade]
Exercícios físicos: [Sim/Não] - Tipo: [Tipo]
Alimentação: [Descrever hábitos alimentares]

ANTECEDENTES FAMILIARES

Doenças hereditárias: [Listar]
Causa mortis dos pais: [Se aplicável]
Doenças na família: [Listar]

EXAME FÍSICO

Estado geral: [Bom/Regular/Ruim]
Sinais vitais:
- Pressão arterial: [PA] mmHg
- Frequência cardíaca: [FC] bpm
- Frequência respiratória: [FR] rpm
- Temperatura: [T] °C
- Peso: [Peso] kg
- Altura: [Altura] cm
- IMC: [IMC] kg/m²

Exame físico específico:
- Cabeça e pescoço: [Achados]
- Tórax: [Achados]
- Abdome: [Achados]
- Extremidades: [Achados]
- Sistema nervoso: [Achados]

EXAMES COMPLEMENTARES

Exames laboratoriais: [Listar e resultados]
Exames de imagem: [Listar e resultados]
Outros exames: [Listar e resultados]

HIPÓTESE DIAGNÓSTICA

Diagnóstico principal: [Diagnóstico]
Diagnósticos diferenciais: [Listar]

PLANO TERAPÊUTICO

Medicamentos prescritos: [Listar medicamentos, dosagem e posologia]
Orientações gerais: [Orientações ao paciente]
Retorno: [Data do retorno]
Encaminhamentos: [Se houver]

EVOLUÇÃO

Data: [DD/MM/AAAA]
Evolução: [Descrever evolução do caso]
Medicamentos ajustados: [Se houver]
Novas orientações: [Se houver]

OBSERVAÇÕES

[Observações adicionais]

Data: [DD/MM/AAAA] Hora: [HH:MM]

_______________________________________________________
Assinatura do médico: [Nome do médico]
CRM: [Número do CRM]`,
  },
  {
    id: "anamnesis-postural-pilates",
    type: "anamnesis" as const,
    title: "Ficha de Avaliação Postural - Pilates",
    description: "Template padrão para ficha de avaliação postural - pilates",
    content: `FICHA DE AVALIAÇÃO POSTURAL - PILATES

IDENTIFICAÇÃO DO PACIENTE

Nome: [Nome do paciente]
Data de nascimento: [ / / ]
Idade: [Idade]
Sexo: [M/F]
Profissão: [Profissão]
Endereço: [Endereço]
Telefone: [Telefone]
Email: [Email]

HISTÓRIA CLÍNICA

Queixa principal: [Descrever queixa principal]
História da doença atual: [Descrever detalhadamente os sintomas, início, evolução, fatores que melhoram ou pioram]
Medicamentos em uso: [Listar medicamentos]
Alergias conhecidas: [Listar alergias]
Cirurgias anteriores: [Listar cirurgias]
Internações anteriores: [Listar internações]

ANTECEDENTES PESSOAIS

Doenças anteriores: [Listar]
Medicamentos em uso: [Listar]
Alergias: [Listar]
Tabagismo: [Sim/Não] - Quantidade: [Quantidade]
Etilismo: [Sim/Não] - Quantidade: [Quantidade]
Exercícios físicos: [Sim/Não] - Tipo: [Tipo]
Alimentação: [Descrever hábitos alimentares]

ANTECEDENTES FAMILIARES

Doenças hereditárias: [Listar]
Causa mortis dos pais: [Se aplicável]
Doenças na família: [Listar]

EXAME FÍSICO

Estado geral: [Bom/Regular/Ruim]
Sinais vitais:
- Pressão arterial: [PA] mmHg
- Frequência cardíaca: [FC] bpm
- Frequência respiratória: [FR] rpm
- Temperatura: [T] °C
- Peso: [Peso] kg
- Altura: [Altura] cm
- IMC: [IMC] kg/m²

Exame físico específico:
- Cabeça e pescoço: [Achados]
- Tórax: [Achados]
- Abdome: [Achados]
- Extremidades: [Achados]
- Sistema nervoso: [Achados]

EXAMES COMPLEMENTARES

Exames laboratoriais: [Listar e resultados]
Exames de imagem: [Listar e resultados]
Outros exames: [Listar e resultados]

HIPÓTESE DIAGNÓSTICA

Diagnóstico principal: [Diagnóstico]
Diagnósticos diferenciais: [Listar]

PLANO TERAPÊUTICO

Medicamentos prescritos: [Listar medicamentos, dosagem e posologia]
Orientações gerais: [Orientações ao paciente]
Retorno: [Data do retorno]
Encaminhamentos: [Se houver]

EVOLUÇÃO

Data: [DD/MM/AAAA]
Evolução: [Descrever evolução do caso]
Medicamentos ajustados: [Se houver]
Novas orientações: [Se houver]

OBSERVAÇÕES

[Observações adicionais]

Data: [DD/MM/AAAA] Hora: [HH:MM]

_______________________________________________________
Assinatura do médico: [Nome do médico]
CRM: [Número do CRM]`,
  },
  // RECEITA TEMPLATES
  {
    id: "prescription-medical",
    type: "prescription" as const,
    title: "Receita Médica",
    description: "Template padrão para prescrição de medicamentos",
    content: `RECEITA MÉDICA

Paciente: [Nome do Paciente]
Idade: [Idade]
Data: [Data]

Medicamentos:
1. [Nome do medicamento]
   Dosagem: [Dosagem]
   Posologia: [Posologia]
   Duração: [Duração]

2. [Nome do medicamento]
   Dosagem: [Dosagem]
   Posologia: [Posologia]
   Duração: [Duração]

Orientações:
[Orientações gerais]

Data: [Data]
_______________________________________________________
Dr(a). [Nome do Médico]
CRM: [Número do CRM]`,
  },
  // ATESTADO TEMPLATES
  {
    id: "certificate-medical",
    type: "medical_certificate" as const,
    title: "Atestado Médico",
    description: "Template padrão para atestado médico",
    content: `ATESTADO MÉDICO

Eu, [Nome do Médico], CRM [Número do CRM], atesto que o(a) paciente [Nome do Paciente], portador(a) do RG [Número do RG], necessita de afastamento de suas atividades por motivo de saúde, pelo período de [Período] dias, a partir de [Data de início].

Diagnóstico: [Diagnóstico]

Data: [Data]
_______________________________________________________
Dr(a). [Nome do Médico]
CRM: [Número do CRM]`,
  },
  // ENCAMINHAMENTO TEMPLATES
  {
    id: "referral-climed",
    type: "referral_form" as const,
    title: "Encaminhamento Clínica Climed",
    description: "Template padrão para encaminhamento Clínica Climed",
    content: `ENCAMINHAMENTO MÉDICO - CLIMED

Fone: (81) 99520-2052 / 3375-2598 / 3203-3241

Estamos encaminhando o Sr(a): [Nome do paciente]

Nome da Mãe: [Nome da mãe]
Data de Nascimento: [ / / ]
CPF: [ ]
RG: [ ]
Telefone: [ ]
Sexo: ( [ ] F ) ( [ ] M )

EXAMES SOLICITADOS

[ ]

[ ]

[ ]

[ ]

Agendado para a data: [ / / ]
Horário: [ ]
Ordem de chegada: das [ ] às [ ]

Recife, [ ] de [ ] de [ ]

ENDEREÇO PARA REALIZAR OS EXAMES

Av. Ulisses Montarroyos, 2968 – Prazeres, Jaboatão dos Guararapes – PE
(Em frente à Câmara dos Vereadores de Jaboatão / Próx. ao Shopping Guararapes)`,
  },
  {
    id: "referral-humanitas",
    type: "referral_form" as const,
    title: "Encaminhamento Clínica Humanitas",
    description: "Template específico para encaminhamento à Clínica Humanitas",
    content: `ENCAMINHAMENTO MÉDICO - HUMANITAS

Telefone: 3080-0202 / (81) 98494-4732 / 98431-8900

Paciente: [Nome do paciente]
Data de nascimento: [ / / ]
CPF: [ ]
RG: [ ]
Telefone: [ ]
Sexo: ( [ ] F ) ( [ ] M )

EXAME(S)

[Descrever exames solicitados]

AGENDAMENTO DA CLÍNICA HUMANITAS

Agendado para a data: [ / / ]
Horário: [ ]
Ordem de chegada: das [ ] às [ ]

Recife, [ ] de [ ] de [ ]

ENDEREÇO PARA REALIZAÇÃO DO(S) EXAMES

Av. Bernardo Vieira de Melo, nº 2222
Piedade – Jaboatão dos Guararapes – PE
(Entre o Banco Bradesco e o Supermercado Pão de Açúcar)`,
  },
  {
    id: "referral-ultramed",
    type: "referral_form" as const,
    title: "Encaminhamento Clínica Ultramed",
    description: "Template específico para encaminhamento Clínica Ultramed",
    content: `ENCAMINHAMENTO - CLÍNICA ULTRAMED

Fone: 3094-2470 / (81) 9 8508-3788

Estamos encaminhando o Sr(a): [Nome do paciente]

Nome da Mãe: [Nome da mãe]
Data de Nascimento: [ / / ]
CPF: [ ]
RG: [ ]
Telefone: [ ]
Sexo: ( [ ] F ) ( [ ] M )

Para atendimento na Clínica ULTRAMED conforme a parceria firmada com a nossa Clínica TRATTE SAÚDE, seguem abaixo os exames solicitados:

[ ]

[ ]

[ ]

OBS: Se o exame for mamografia, levar exame anterior.

Agendado para a data: [ / / ]
Horário: [ ]
Ordem de chegada: das [ ] às [ ]

Recife, [ ] de [ ] de [ ]

ENDEREÇO PARA REALIZAÇÃO DOS EXAMES

Av. Dr. Júlio Maranhão, 441 – Guararapes, Jaboatão dos Guararapes – PE, 54325-440
(Ao lado da Loja Palma Parafuso / Após o Bradesco)`,
  },
  {
    id: "referral-guararapes",
    type: "referral_form" as const,
    title: "Encaminhamento Consultório Guararapes",
    description:
      "Template específico para encaminhamento Consultório Guararapes",
    content: `ENCAMINHAMENTO - CONSULTÓRIO GUARARAPES

Fone: 3093-0077 / (81) 9 8336-3505

Estamos encaminhando o Sr(a): [Nome do paciente]

Nome da Mãe: [Nome da mãe]
Data de Nascimento: [ / / ]
CPF: [ ]
RG: [ ]
Telefone: [ ]
Sexo: ( [ ] F ) ( [ ] M )

Para atendimento no Consultório Guararapes conforme a parceria firmada com a nossa Clínica TRATTE SAÚDE, seguem abaixo os exames/consultas solicitados:

[ ]

[ ]

[ ]

[ ]

Agendado para a data: [ / / ]
Horário: [ ]
Ordem de chegada: das [ ] às [ ]

Recife, [ ] de [ ] de [ ]

ENDEREÇO PARA REALIZAÇÃO DOS EXAMES

Rua Santo Elias, 25 – Prazeres – Jaboatão dos Guararapes – PE
(Na rua ao lado do Supermercado Arco Mix, próximo à Livraria MEC)`,
  },
  {
    id: "referral-sir",
    type: "referral_form" as const,
    title: "Encaminhamento Clínica SIR",
    description: "Template específico para encaminhamento Clínica SIR",
    content: `ENCAMINHAMENTO - Clínica	 SIR

VIOLETA ESCRITÓRIO
Fone: 3445-1220 / (81) 9 9218-3164

Estamos encaminhando o Sr(a):
Nome: [Nome do paciente]
Nome do Filho: [Nome do filho]
Data de Nascimento: [ / / ]
CPF: [ ]
Telefone: [ ]
Sexo: ( [ ] F ) ( [ ] M )

Para atendimento na Clínica SIR conforme a parceria firmada com a nossa Clínica TRATTE SAÚDE, seguem abaixo os exames/consultas solicitados:

[ ]

[ ]

[ ]

[ ]

Agendado para a data: [ / / ]
Horário: [ ]
Ordem de chegada: das [ ] às [ ]

Recife, [ ] de [ ] de [ ]

OBSERVAÇÕES

Quando for RNM:

Marcapasso ( [ ] )

Metal no corpo ( [ ] )

Cirurgia na cabeça ( [ ] )

Cirurgia no coração: Qual [ ]

Peso: [ ]

ENDEREÇOS PARA REALIZAÇÃO DOS EXAMES

Rua Monsenhor Ambrósio Leite, nº 68 – Graças – Recife – PE
(Após o Hospital Jaime da Fonte, 1ª Rua à esquerda)

Rua das Pernambucanas, nº 244 – Recife
(Na mesma rua do Hospital Jaime da Fonte)

Rua Guilherme Pinto, nº 100 – Graças – Recife
(Ao passar o Hospital Jaime da Fonte, 2ª Rua à esquerda)`,
  },
  // OUTROS TEMPLATES
  {
    id: "recibo",
    type: "other" as const,
    title: "Recibo",
    description: "Template padrão para recibo",
    content: `RECIBO

Recebi do(a) Sr.(a): [Nome]

CNPJ/CPF: [ ]

A importância de: [Valor por extenso e em números]

Referente a: [Descrição do serviço/produto]

Prazeres, [ ] de [ ] de [ ]

[ ] DINHEIRO  [ ] PIX  [ ] DÉBITO  [ ] CRÉDITO

ASSINATURA: [ ]`,
  },
  {
    id: "termo-imagem",
    type: "other" as const,
    title: "Termo de Autorização de Uso da Imagem",
    description: "Template padrão para termo de autorização de uso da imagem",
    content: `TERMO DE AUTORIZAÇÃO DE USO DA IMAGEM

Eu, [Nome da pessoa], portador(a) do RG [Número do RG], CPF [Número do CPF], autorizo o uso de minha imagem para os seguintes fins:

(I) folder de apresentação;
(II) anúncios em revistas e jornais em geral;
(III) home page;
(IV) cartazes;
(V) mídia eletrônica e apresentações públicas (painéis, vídeo-tapes, televisão, data show, cinema, programa para rádio, entre outros).

Por esta ser a expressão da minha vontade, declaro que autorizo o uso acima descrito sem que nada haja a ser reclamado a título de direitos conexos à minha imagem ou a qualquer outro, e assino a presente autorização em 02 (duas) vias de igual teor e forma.

Cidade: [ ] Data: [ ] de [ ] de 20[ ]

_______________________________________________________
Nome da pessoa que autorizou o uso da imagem: [ ]`,
  },
  {
    id: "medical-record",
    type: "other" as const,
    title: "Ficha de Prontuário Médico",
    description: "Template completo para ficha de prontuário médico",
    content: `PRONTUÁRIO MÉDICO
FICHA DE PRONTUÁRIO MÉDICO Nº [ ]

Médico: [Nome do médico]
Especialidade (ESP): [ ]

Particular: ( [ ] )
Cl. Oro: S ( [ ] ) N ( [ ] )
Convênio: [ ]

Data do 1º Atendimento: [ / / ]

IDENTIFICAÇÃO

Nome: [Nome do paciente]
Idade: [ ]
Data de nascimento: [ / / ]
Sexo: ( [ ] M ) ( [ ] F )
CPF: [ ]

Endereço: [ ]
Bairro: [ ]
Cidade: [ ]
UF: [ ]
Fone: [ ]

ANOTAÇÕES MÉDICAS / EVOLUÇÃO

[Espaço para preenchimento]`,
  },
];
