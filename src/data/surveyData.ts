// ============================================================
// SURVEY DATA - All mock data compartmentalized for easy editing
// ============================================================

// ------------------------------------------------------------
// 1. SURVEY INFO - Metadata about the survey
// ------------------------------------------------------------
export const surveyInfo = {
  title: "Pesquisa de Satisfação do Cliente 2024",
  company: "TechCorp Brasil",
  period: "Outubro - Novembro 2024",
  totalRespondents: 1247,
  responseRate: 68.5,
  nps: 47,
  npsCategory: "Bom",
};

// ------------------------------------------------------------
// 2. EXECUTIVE REPORT
// ------------------------------------------------------------
export const executiveReport = {
  // 2a. Executive Summary
  summary: {
    aboutStudy: `Este estudo foi conduzido entre outubro e novembro de 2024 com o objetivo de avaliar a satisfação geral dos clientes da TechCorp Brasil.
A pesquisa abrangeu 1.247 respondentes de diferentes segmentos, incluindo clientes corporativos, PMEs e consumidores finais.
A metodologia utilizada combinou questionários quantitativos com perguntas abertas para capturar insights qualitativos sobre a experiência do cliente.`,

    mainFindings: `Os resultados indicam um NPS de 47 pontos, classificado como "Bom", representando uma melhoria de 8 pontos em relação ao ano anterior.
O atendimento ao cliente foi o atributo melhor avaliado, com 78% de satisfação.
Por outro lado, o tempo de resposta do suporte técnico apresentou a maior oportunidade de melhoria, com apenas 52% de aprovação.
Identificamos três clusters distintos de clientes: Entusiastas (42%), Neutros (35%) e Críticos (23%), cada um com necessidades e expectativas específicas.`,

    conclusions: `A TechCorp Brasil demonstra uma trajetória positiva na satisfação do cliente, mas precisa endereçar gaps críticos no suporte técnico e na comunicação proativa.
Os clientes valorizam especialmente a qualidade dos produtos e a expertise da equipe comercial.
Recomenda-se foco prioritário na redução do tempo de resposta do suporte e na implementação de um programa de comunicação mais personalizado para cada segmento de cliente.`,
  },

  // 2b. Recommendations
  recommendations: [
    {
      id: 1,
      recommendation:
        "Implementar sistema de tickets com SLA garantido de 4 horas para suporte técnico",
      severity: "critical" as const,
      stakeholders: ["TI", "Suporte", "Operações"],
    },
    {
      id: 2,
      recommendation:
        "Criar programa de comunicação proativa com atualizações mensais personalizadas",
      severity: "high" as const,
      stakeholders: ["Marketing", "Customer Success"],
    },
    {
      id: 3,
      recommendation:
        "Desenvolver portal de autoatendimento com base de conhecimento expandida",
      severity: "high" as const,
      stakeholders: ["TI", "Conteúdo", "UX"],
    },
    {
      id: 4,
      recommendation:
        "Implementar programa de fidelidade com benefícios escalonados",
      severity: "medium" as const,
      stakeholders: ["Marketing", "Comercial", "Financeiro"],
    },
    {
      id: 5,
      recommendation:
        "Realizar treinamentos trimestrais de atendimento para equipe comercial",
      severity: "low" as const,
      stakeholders: ["RH", "Comercial"],
    },
  ],
};

// ------------------------------------------------------------
// 3. SUPPORT ANALYSIS
// ------------------------------------------------------------
export const supportAnalysis = {
  // 3a. Sentiment Analysis
  sentimentAnalysis: {
    description: `A análise de sentimento foi realizada utilizando processamento de linguagem natural nas respostas abertas dos participantes.
Foram analisadas 4.892 menções em 6 categorias principais.
Os resultados mostram predominância de sentimentos positivos no atendimento e qualidade do produto.
Enquanto suporte técnico e tempo de resposta apresentam maior proporção de sentimentos negativos.`,

    data: [
      { category: "Atendimento", positive: 65, neutral: 20, negative: 15 },
      {
        category: "Qualidade do Produto",
        positive: 72,
        neutral: 18,
        negative: 10,
      },
      { category: "Preço", positive: 35, neutral: 40, negative: 25 },
      { category: "Suporte Técnico", positive: 28, neutral: 24, negative: 48 },
      {
        category: "Tempo de Resposta",
        positive: 22,
        neutral: 30,
        negative: 48,
      },
      { category: "Inovação", positive: 55, neutral: 32, negative: 13 },
    ],
  },

  // 3b. Respondent Intent
  respondentIntent: {
    description: `A intenção dos respondentes foi categorizada com base em suas respostas sobre comportamento futuro e recomendação.
Os dados indicam alta propensão de recompra entre os clientes satisfeitos, mas alertam para um grupo significativo de detratores que podem impactar negativamente a reputação da marca.`,

    data: [
      { intent: "Promotores (NPS 9-10)", percentage: 52, count: 649 },
      { intent: "Neutros (NPS 7-8)", percentage: 25, count: 312 },
      { intent: "Detratores (NPS 0-6)", percentage: 23, count: 286 },
      { intent: "Intenção de Recompra Alta", percentage: 68, count: 848 },
      { intent: "Intenção de Recompra Média", percentage: 22, count: 274 },
      { intent: "Intenção de Recompra Baixa", percentage: 10, count: 125 },
    ],
  },

  // 3c. Respondent Segmentation
  segmentation: [
    {
      cluster: "Entusiastas",
      description: `Clientes altamente satisfeitos, promotores ativos da marca.
Valorizam qualidade e inovação.
Representam o maior LTV e menor churn.`,
      percentage: 42,
      characteristics: [
        "NPS médio: 9.2",
        "Ticket médio: R$ 2.800",
        "Tempo de cliente: 3+ anos",
      ],
    },
    {
      cluster: "Neutros",
      description: `Clientes satisfeitos mas não engajados.
Sensíveis a preço e concorrência.
Potencial de conversão para Entusiastas com ações direcionadas.`,
      percentage: 35,
      characteristics: [
        "NPS médio: 7.5",
        "Ticket médio: R$ 1.500",
        "Tempo de cliente: 1-2 anos",
      ],
    },
    {
      cluster: "Críticos",
      description: `Clientes insatisfeitos com alto risco de churn.
Principais queixas relacionadas a suporte e tempo de resposta.
Requerem atenção imediata.`,
      percentage: 23,
      characteristics: [
        "NPS médio: 4.1",
        "Ticket médio: R$ 900",
        "Tempo de cliente: < 1 ano",
      ],
    },
  ],
};

// ------------------------------------------------------------
// 4. RESPONSE DETAILS
// ------------------------------------------------------------
export const responseDetails = {
  // Closed Questions
  closedQuestions: [
    {
      id: 1,
      question: "Qual seu nível de satisfação geral com a TechCorp?",
      summary: `A maioria dos respondentes (67%) demonstra satisfação alta ou muito alta com a empresa.
Apenas 12% expressaram insatisfação, indicando uma base sólida de clientes satisfeitos.`,
      data: [
        { option: "Muito Satisfeito", value: 324, percentage: 26 },
        { option: "Satisfeito", value: 511, percentage: 41 },
        { option: "Neutro", value: 262, percentage: 21 },
        { option: "Insatisfeito", value: 112, percentage: 9 },
        { option: "Muito Insatisfeito", value: 38, percentage: 3 },
      ],
    },
    {
      id: 2,
      question: "Como você avalia a qualidade dos nossos produtos?",
      summary: `A qualidade dos produtos é o ponto mais forte da empresa, com 78% de avaliações positivas.
Este é um diferencial competitivo importante a ser mantido.`,
      data: [
        { option: "Excelente", value: 412, percentage: 33 },
        { option: "Muito Boa", value: 561, percentage: 45 },
        { option: "Boa", value: 187, percentage: 15 },
        { option: "Regular", value: 62, percentage: 5 },
        { option: "Ruim", value: 25, percentage: 2 },
      ],
    },
    {
      id: 3,
      question: "Com que frequência você utiliza nossos serviços?",
      summary:
        "Mais da metade dos clientes (54%) utiliza os serviços semanalmente ou diariamente, indicando alto engajamento com a plataforma.",
      data: [
        { option: "Diariamente", value: 299, percentage: 24 },
        { option: "Semanalmente", value: 374, percentage: 30 },
        { option: "Quinzenalmente", value: 237, percentage: 19 },
        { option: "Mensalmente", value: 224, percentage: 18 },
        { option: "Raramente", value: 113, percentage: 9 },
      ],
    },
    {
      id: 4,
      question: "Você recomendaria a TechCorp para um colega ou amigo?",
      summary:
        "O alto índice de recomendação (72%) valida o NPS positivo e indica potencial para crescimento orgânico através de indicações.",
      data: [
        { option: "Com certeza", value: 524, percentage: 42 },
        { option: "Provavelmente sim", value: 374, percentage: 30 },
        { option: "Talvez", value: 212, percentage: 17 },
        { option: "Provavelmente não", value: 87, percentage: 7 },
        { option: "Com certeza não", value: 50, percentage: 4 },
      ],
    },
  ],

  // Open Questions
  openQuestions: [
    {
      id: 5,
      question: "O que você mais gosta na TechCorp?",
      summary:
        "As respostas abertas destacam principalmente a qualidade dos produtos e o atendimento personalizado como os maiores diferenciais percebidos pelos clientes.",
      sentimentData: [
        { category: "Qualidade", positive: 78, neutral: 15, negative: 7 },
        { category: "Atendimento", positive: 71, neutral: 19, negative: 10 },
        { category: "Inovação", positive: 62, neutral: 28, negative: 10 },
      ],
      topCategories: [
        {
          rank: 1,
          category: "Qualidade dos produtos",
          mentions: 487,
          percentage: 39,
          topics: [
            {
              topic: "agilidade no atendimento",
              sentiment: "positive" as const,
            },
            {
              topic: "qualidade dos resultados",
              sentiment: "positive" as const,
            },
            { topic: "eficiência do serviço", sentiment: "positive" as const },
            {
              topic: "confiabilidade do serviço",
              sentiment: "positive" as const,
            },
            { topic: "confiabilidade da rede", sentiment: "negative" as const },
            { topic: "estabilidade da rede", sentiment: "negative" as const },
          ],
        },
        {
          rank: 2,
          category: "Atendimento personalizado",
          mentions: 356,
          percentage: 29,
          topics: [
            { topic: "atenção ao cliente", sentiment: "positive" as const },
            { topic: "tratamento respeitoso", sentiment: "positive" as const },
            { topic: "prontidão de resposta", sentiment: "positive" as const },
            {
              topic: "preocupações com a retenção de clientes",
              sentiment: "negative" as const,
            },
            {
              topic: "usabilidade do aplicativo",
              sentiment: "negative" as const,
            },
            {
              topic: "intenção de cancelamento do cliente",
              sentiment: "negative" as const,
            },
          ],
        },
        {
          rank: 3,
          category: "Facilidade de uso",
          mentions: 198,
          percentage: 16,
          topics: [
            { topic: "cobertura de rede", sentiment: "positive" as const },
            { topic: "qualidade do sinal", sentiment: "positive" as const },
            { topic: "velocidade de conexão", sentiment: "positive" as const },
            {
              topic: "disponibilidade do serviço",
              sentiment: "negative" as const,
            },
            {
              topic: "interrupções frequentes",
              sentiment: "negative" as const,
            },
            { topic: "latência alta", sentiment: "negative" as const },
          ],
        },
      ],
      wordCloud: [
        { text: "qualidade", value: 487 },
        { text: "atendimento", value: 356 },
        { text: "produto", value: 312 },
        { text: "suporte", value: 245 },
        { text: "equipe", value: 198 },
        { text: "facilidade", value: 178 },
        { text: "inovação", value: 156 },
        { text: "confiança", value: 145 },
        { text: "rapidez", value: 134 },
        { text: "profissional", value: 123 },
        { text: "solução", value: 112 },
        { text: "tecnologia", value: 98 },
        { text: "parceria", value: 87 },
        { text: "preço", value: 76 },
        { text: "experiência", value: 65 },
      ],
    },
    {
      id: 6,
      question: "O que podemos melhorar?",
      summary: `O tempo de resposta do suporte técnico é a principal área de melhoria apontada pelos clientes.
Seguida pela comunicação e transparência de preços.`,
      sentimentData: [
        { category: "Suporte", positive: 15, neutral: 25, negative: 60 },
        { category: "Comunicação", positive: 22, neutral: 33, negative: 45 },
        { category: "Preço", positive: 18, neutral: 42, negative: 40 },
      ],
      topCategories: [
        {
          rank: 1,
          category: "Tempo de resposta do suporte",
          mentions: 412,
          percentage: 33,
          topics: [
            "demora no atendimento",
            { topic: "tempo de espera", sentiment: "negative" as const },
            "falta de agilidade",
            "necessidade de melhorias",
          ],
        },
        {
          rank: 2,
          category: "Comunicação proativa",
          mentions: 287,
          percentage: 23,
          topics: [
            "falta de atualizações",
            {
              topic: "comunicação insuficiente",
              sentiment: "negative" as const,
            },
            "necessidade de mais informações",
            "transparência",
          ],
        },
        {
          rank: 3,
          category: "Transparência de preços",
          mentions: 198,
          percentage: 16,
          topics: [
            "clareza nos valores",
            {
              topic: "preços não transparentes",
              sentiment: "negative" as const,
            },
            "necessidade de mais detalhamento",
          ],
        },
      ],
      wordCloud: [
        { text: "suporte", value: 412 },
        { text: "tempo", value: 356 },
        { text: "resposta", value: 312 },
        { text: "demora", value: 287 },
        { text: "comunicação", value: 245 },
        { text: "preço", value: 198 },
        { text: "atendimento", value: 178 },
        { text: "melhoria", value: 156 },
        { text: "agilidade", value: 145 },
        { text: "resolver", value: 134 },
        { text: "problema", value: 123 },
        { text: "espera", value: 112 },
        { text: "retorno", value: 98 },
        { text: "clareza", value: 87 },
        { text: "processo", value: 76 },
      ],
    },
  ],
};

// ------------------------------------------------------------
// 5. ATTRIBUTE DEEP DIVE
// ------------------------------------------------------------
export const attributeDeepDive = {
  attributes: [
    {
      id: "state",
      name: "Estado",
      summary: `A distribuição geográfica mostra concentração no Sudeste (68%), com São Paulo liderando em volume de respondentes.
O sentimento varia significativamente por região.
Com o Sul apresentando os maiores índices de satisfação.`,
      distribution: [
        { segment: "São Paulo", count: 498, percentage: 40 },
        { segment: "Rio de Janeiro", count: 224, percentage: 18 },
        { segment: "Minas Gerais", count: 125, percentage: 10 },
        { segment: "Paraná", count: 112, percentage: 9 },
        { segment: "Rio Grande do Sul", count: 100, percentage: 8 },
        { segment: "Outros", count: 188, percentage: 15 },
      ],
      sentiment: [
        { segment: "São Paulo", positive: 62, neutral: 23, negative: 15 },
        { segment: "Rio de Janeiro", positive: 55, neutral: 25, negative: 20 },
        { segment: "Minas Gerais", positive: 68, neutral: 20, negative: 12 },
        { segment: "Paraná", positive: 72, neutral: 18, negative: 10 },
        {
          segment: "Rio Grande do Sul",
          positive: 75,
          neutral: 17,
          negative: 8,
        },
        { segment: "Outros", positive: 58, neutral: 27, negative: 15 },
      ],
    },
    {
      id: "education",
      name: "Escolaridade",
      summary: `Clientes com pós-graduação representam a maior parcela (45%) e demonstram os maiores níveis de satisfação.
Há oportunidade de melhorar a experiência para clientes com ensino médio, que apresentam maior proporção de sentimentos negativos.`,
      distribution: [
        { segment: "Pós-graduação", count: 561, percentage: 45 },
        { segment: "Ensino Superior", count: 437, percentage: 35 },
        { segment: "Ensino Médio", count: 187, percentage: 15 },
        { segment: "Outros", count: 62, percentage: 5 },
      ],
      sentiment: [
        { segment: "Pós-graduação", positive: 72, neutral: 18, negative: 10 },
        { segment: "Ensino Superior", positive: 65, neutral: 22, negative: 13 },
        { segment: "Ensino Médio", positive: 48, neutral: 27, negative: 25 },
        { segment: "Outros", positive: 52, neutral: 30, negative: 18 },
      ],
    },
    {
      id: "customerType",
      name: "Tipo de Cliente",
      summary: `Clientes corporativos (Enterprise) apresentam os maiores níveis de satisfação.
Enquanto consumidores finais têm maior variabilidade.
PMEs representam uma oportunidade de crescimento com ações focadas em suas necessidades específicas.`,
      distribution: [
        { segment: "Enterprise", count: 374, percentage: 30 },
        { segment: "PME", count: 436, percentage: 35 },
        { segment: "Consumidor Final", count: 312, percentage: 25 },
        { segment: "Governo", count: 125, percentage: 10 },
      ],
      sentiment: [
        { segment: "Enterprise", positive: 75, neutral: 17, negative: 8 },
        { segment: "PME", positive: 58, neutral: 25, negative: 17 },
        {
          segment: "Consumidor Final",
          positive: 52,
          neutral: 28,
          negative: 20,
        },
        { segment: "Governo", positive: 65, neutral: 25, negative: 10 },
      ],
    },
  ],
};

// ------------------------------------------------------------
// 6. IMPLEMENTATION PLAN
// ------------------------------------------------------------
export const implementationPlan = {
  recommendations: [
    {
      id: 1,
      title: "Sistema de tickets com SLA garantido",
      severity: "critical" as const,
      tasks: [
        {
          task: "Avaliar e selecionar plataforma de tickets",
          owner: "TI",
          deadline: "Semana 1-2",
        },
        {
          task: "Configurar SLAs e escalações automáticas",
          owner: "Operações",
          deadline: "Semana 3-4",
        },
        {
          task: "Treinar equipe de suporte",
          owner: "RH",
          deadline: "Semana 5",
        },
        {
          task: "Implementar dashboards de monitoramento",
          owner: "TI",
          deadline: "Semana 6",
        },
        {
          task: "Go-live e acompanhamento",
          owner: "Suporte",
          deadline: "Semana 7-8",
        },
      ],
    },
    {
      id: 2,
      title: "Programa de comunicação proativa",
      severity: "high" as const,
      tasks: [
        {
          task: "Definir personas e jornadas de comunicação",
          owner: "Marketing",
          deadline: "Semana 1-2",
        },
        {
          task: "Criar templates de comunicação personalizados",
          owner: "Conteúdo",
          deadline: "Semana 3-4",
        },
        {
          task: "Configurar automações no CRM",
          owner: "Marketing",
          deadline: "Semana 5-6",
        },
        {
          task: "Lançar piloto com segmento Entusiastas",
          owner: "Customer Success",
          deadline: "Semana 7",
        },
        {
          task: "Avaliar resultados e expandir",
          owner: "Customer Success",
          deadline: "Semana 8-10",
        },
      ],
    },
    {
      id: 3,
      title: "Portal de autoatendimento",
      severity: "high" as const,
      tasks: [
        {
          task: "Mapear principais dúvidas e problemas",
          owner: "Suporte",
          deadline: "Semana 1-2",
        },
        {
          task: "Desenvolver arquitetura do portal",
          owner: "UX",
          deadline: "Semana 3-4",
        },
        {
          task: "Criar conteúdo da base de conhecimento",
          owner: "Conteúdo",
          deadline: "Semana 5-8",
        },
        {
          task: "Desenvolver e testar portal",
          owner: "TI",
          deadline: "Semana 9-12",
        },
        {
          task: "Lançamento e promoção",
          owner: "Marketing",
          deadline: "Semana 13",
        },
      ],
    },
    {
      id: 4,
      title: "Programa de fidelidade",
      severity: "medium" as const,
      tasks: [
        {
          task: "Benchmarking de programas de fidelidade",
          owner: "Marketing",
          deadline: "Semana 1-2",
        },
        {
          task: "Definir estrutura de benefícios",
          owner: "Comercial",
          deadline: "Semana 3-4",
        },
        {
          task: "Aprovar orçamento e ROI",
          owner: "Financeiro",
          deadline: "Semana 5",
        },
        {
          task: "Desenvolver sistema de pontos",
          owner: "TI",
          deadline: "Semana 6-10",
        },
        {
          task: "Lançar para clientes Entusiastas",
          owner: "Marketing",
          deadline: "Semana 11-12",
        },
      ],
    },
    {
      id: 5,
      title: "Treinamentos de atendimento",
      severity: "low" as const,
      tasks: [
        {
          task: "Identificar gaps de competência",
          owner: "RH",
          deadline: "Semana 1",
        },
        {
          task: "Desenvolver grade de treinamentos",
          owner: "RH",
          deadline: "Semana 2-3",
        },
        {
          task: "Contratar facilitadores/parceiros",
          owner: "RH",
          deadline: "Semana 4",
        },
        {
          task: "Executar primeira rodada de treinamentos",
          owner: "Comercial",
          deadline: "Semana 5-6",
        },
        {
          task: "Avaliar resultados e ajustar",
          owner: "RH",
          deadline: "Semana 7-8",
        },
      ],
    },
  ],
};

// ------------------------------------------------------------
// HELPER TYPES
// ------------------------------------------------------------
export type SeverityLevel = "critical" | "high" | "medium" | "low";

export const severityLabels: Record<SeverityLevel, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};
