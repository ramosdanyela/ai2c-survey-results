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
  nps: -21,
  npsCategory: "Ruim",
};

// ------------------------------------------------------------
// 2. EXECUTIVE REPORT
// ------------------------------------------------------------
export const executiveReport = {
  // 2a. Executive Summary
  summary: {
    aboutStudy: `O objetivo do estudo é avaliar a satisfação do cliente com os serviços de telefonia móvel para identificar os fatores que impulsionam a lealdade e o cancelamento.
Pesquisa com 100 clientes móveis com 3 perguntas capturando experiência e intenções.`,

    mainFindings: `O Net Promoter Score é negativo, com detratores superando promotores por 21 pontos.
Problemas no serviço de rede apresentam o maior impacto negativo devido a preocupações com cobertura e estabilidade, seguidos por limitações na cobertura da rede; opiniões sobre suporte ao cliente e preços são mistas.
A análise por segmento revela que clientes pós-pago e controle expressam maior insatisfação em relação à funcionalidade do aplicativo, conectividade e faturamento, enquanto o sentimento regional varia significativamente, com Ceará positivo e RJ, PR, SP negativos.`,

    conclusions: `Foco urgente na infraestrutura de rede e monitoramento em tempo real é fundamental para reduzir a participação de detratores.
O suporte ao cliente e a confiabilidade do aplicativo exigem melhorias personalizadas em segmentos e regiões.
Abordar as frustrações relacionadas à rede e à cobrança ajudará a estabilizar a lealdade e limitar o churn.
Priorizar essas áreas está alinhado com as capacidades operacionais e a competitividade do mercado.`,
  },

  // 2b. Recommendations
  recommendations: [
    {
      id: 1,
      recommendation:
        "Atualize a Infraestrutura de Rede para Melhorar a Cobertura e Estabilidade",
      severity: "high",
      stakeholders: [
        "Engenharia de Redes",
        "Rede de Acesso Rádio (RAN)",
        "Operações de Rede",
      ],
    },
    {
      id: 2,
      recommendation:
        "Implemente Monitoramento de Rede em Tempo Real e Resolução Rápida de Falhas",
      severity: "high",
      stakeholders: [
        "Centro de Operações de Rede (NOC)",
        "Otimização de Rede",
        "Tecnologia e TI",
      ],
    },
    {
      id: 3,
      recommendation:
        "Lançar Contato Direcionado com Clientes para Abordar Preocupações sobre o Serviço de Rede",
      severity: "medium",
      stakeholders: [
        "Experiência do Cliente (CX)",
        "Operações de Atendimento ao Cliente",
        "Comunicação Corporativa",
      ],
    },
    {
      id: 4,
      recommendation:
        "Melhore a Qualidade do Sinal por meio da Otimização Avançada da Rede de Acesso Rádio",
      severity: "medium",
      stakeholders: [
        "Rede de Acesso Rádio (RAN)",
        "Otimização de Rede",
        "Engenharia de Rede",
      ],
    },
    {
      id: 5,
      recommendation:
        "Aprimorar o Treinamento de Suporte ao Cliente focado na Resolução de Problemas de Rede",
      severity: "medium",
      stakeholders: [
        "Atendimento ao Cliente",
        "Central de Atendimento",
        "Recursos Humanos",
      ],
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
      {
        category: "Serviço de rede",
        positive: 10.5,
        neutral: 51.4,
        negative: 38.1,
      },
      {
        category: "Suporte ao cliente",
        positive: 6.4,
        neutral: 83.1,
        negative: 10.5,
      },
      {
        category: "Cobertura de rede",
        positive: 1.8,
        neutral: 84.6,
        negative: 13.6,
      },
      {
        category: "Oferta e preços",
        positive: 3.3,
        neutral: 90.1,
        negative: 6.6,
      },
      {
        category: "Outro",
        positive: 2.8,
        neutral: 90.8,
        negative: 6.4,
      },
    ],
  },

  // 3b. Respondent Intent
  respondentIntent: {
    description: `Há um risco significativo de perda de clientes, com 36% dos respondentes provavelmente parando de usar o serviço e mais 34% expressando preocupações, indicando necessidade urgente de estratégias de retenção direcionadas e melhoria da qualidade do serviço.
Apenas 27% são promotores fortes, apresentando oportunidade de melhorar experiências positivas do cliente e advocacy da marca.
Além disso, uma taxa de satisfação estável muito baixa de 2% sinaliza insatisfação subjacente, mesmo entre clientes menos vocais, necessitando engajamento proativo para prevenir problemas adicionais.`,

    data: [
      {
        intent: "Provavelmente parará de usar o produto/serviço",
        percentage: 36.0,
        count: 449,
      },
      {
        intent: "Pretende ficar, mas expressa preocupações",
        percentage: 34.0,
        count: 424,
      },
      {
        intent: "Muito satisfeito e promoveria o produto/serviço",
        percentage: 27.0,
        count: 337,
      },
      { intent: "Satisfeito e estável", percentage: 2.0, count: 25 },
    ],
  },

  // 3c. Respondent Segmentation
  segmentation: [
    {
      cluster: "Campeão em Treinamento de IA",
      description: `Adotante entusiasmado que valoriza treinamento e desenvolvimento de capacidades em pesquisa de marketing orientada por IA dentro de TI.`,
      percentage: 38.5,
      id: 1,
      characteristics: [
        "Foco em treinamento e capacitação",
        "Alto engajamento com IA",
        "Pesquisa de marketing em TI",
      ],
    },
    {
      cluster: "Detrator de TI Focado em Treinamento",
      description: `Cliente crítico em relação a eventos de dados e produtos de IA, enfatizando lacunas no treinamento e no desenvolvimento de capacidades.`,
      percentage: 15.4,
      id: 2,
      characteristics: [
        "Crítico sobre eventos de dados",
        "Foco em lacunas de treinamento",
        "Produtos de IA",
      ],
    },
    {
      cluster: "Otimização do Construtor de Capacidade",
      description: `Satisfeito com as iniciativas de treinamento e capacitação em eventos de dados e IA para pesquisa de marketing em TI.`,
      percentage: 15.4,
      id: 3,
      characteristics: [
        "Satisfeito com treinamento",
        "Eventos de dados e IA",
        "Pesquisa de marketing em TI",
      ],
    },
    {
      cluster: "Defensor de Marketing Focado em ROI",
      description: `Promotor aproveitando eventos de dados e IA para medir rigorosamente o ROI de marketing em pesquisa de marketing de TI.`,
      percentage: 12.8,
      id: 4,
      characteristics: [
        "Foco em ROI de marketing",
        "Medição rigorosa",
        "Eventos de dados e IA",
      ],
    },
    {
      cluster: "Cético em ROI no Marketing de TI",
      description: `Cliente insatisfeito com a medição do ROI de marketing usando Data Events e IA em pesquisa de marketing de TI.`,
      percentage: 5.1,
      id: 5,
      characteristics: [
        "Insatisfeito com medição de ROI",
        "Data Events e IA",
        "Pesquisa de marketing de TI",
      ],
    },
    {
      cluster: "Estrategista de Dados de TI Neutro",
      description: `Cliente de TI passivamente envolvido avaliando eventos de dados e IA dentro de contextos de pesquisa de marketing.`,
      percentage: 5.1,
      id: 6,
      characteristics: [
        "Envolvimento passivo",
        "Avaliação de eventos de dados",
        "Contextos de pesquisa de marketing",
      ],
    },
    {
      cluster: "Outros",
      description: `Grupo de 3 pequenos segmentos que não formam clusters estatisticamente relevantes ou distintos por si só.`,
      percentage: 7.8,
      id: null,
      characteristics: [
        "Segmentos diversos",
        "Baixa representatividade estatística",
        "Agrupamento residual",
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
      question:
        "Qual é a probabilidade de você recomendar nossa empresa a um amigo ou colega em uma escala de 0 a 10?",
      summary: `Com 51% dos entrevistados classificados como detratores e apenas 30% como promotores, a empresa enfrenta um risco significativo de boca a boca negativo impactando a aquisição e retenção de clientes no competitivo mercado de telefonia móvel.`,
      data: [
        { option: "Detrator", value: 636, percentage: 51.0 },
        { option: "Promotor", value: 374, percentage: 30.0 },
        { option: "Neutro", value: 237, percentage: 19.0 },
      ],
    },
    {
      id: 3,
      question:
        "Dentre as opções qual é o principal ponto que impacta sua satisfação?",
      summary:
        "Problemas relacionados à internet, particularmente quedas e ausência de sinal, representam aproximadamente 26% da insatisfação dos clientes, indicando uma necessidade crítica de melhorar a estabilidade e a cobertura da rede para aumentar a satisfação nos serviços de telefonia móvel.",
      data: [
        {
          option: "Queda / instabilidade na internet / internet trava / oscila",
          value: 168,
          percentage: 13.5,
        },
        { option: "Falta de sinal de internet", value: 156, percentage: 12.5 },
        {
          option: "Custo benefício do plano/oferta é ruim",
          value: 117,
          percentage: 9.4,
        },
        { option: "Outro motivo", value: 117, percentage: 9.4 },
        {
          option: "Qualidade do sinal / Cobertura",
          value: 91,
          percentage: 7.3,
        },
        {
          option: "Qualidade do Sinal / Cobertura ruim",
          value: 91,
          percentage: 7.3,
        },
        {
          option: "Pacote de internet suficiente / dura o mês todo",
          value: 77,
          percentage: 6.2,
        },
        {
          option: "Estabilidade na internet / internet não trava / não oscila",
          value: 65,
          percentage: 5.2,
        },
        {
          option: "Custo benefício do plano/oferta é bom",
          value: 52,
          percentage: 4.2,
        },
        {
          option: "Velocidade da internet rápida / boa",
          value: 52,
          percentage: 4.2,
        },
        {
          option: "Qualidade do sinal / Cobertura boa",
          value: 52,
          percentage: 4.2,
        },
        { option: "Velocidade da internet", value: 52, percentage: 4.2 },
        {
          option:
            "Pacote de internet acaba rápido / não suficiente/ não dura o mês todo",
          value: 39,
          percentage: 3.1,
        },
        { option: "Estabilidade na internet", value: 26, percentage: 2.1 },
        {
          option: "Existência de sinal de internet",
          value: 26,
          percentage: 2.1,
        },
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
      id: 2,
      question: "Quais são os principais pontos que impactam sua satisfação?",
      summary: `A satisfação do cliente é impactada principalmente por problemas no serviço de rede, com 51 menções negativas focadas em cobertura, confiabilidade e estabilidade da rede superando 16 menções positivas sobre qualidade e velocidade do serviço, enquanto o suporte ao cliente apresenta um sentimento negativo menor, mas notável.`,
      sentimentData: [
        {
          category: "Serviço de rede",
          positive: 10.5,
          neutral: 51.4,
          negative: 38.1,
        },
        {
          category: "Suporte ao cliente",
          positive: 6.4,
          neutral: 83.1,
          negative: 10.5,
        },
        {
          category: "Cobertura de rede",
          positive: 1.8,
          neutral: 84.6,
          negative: 13.6,
        },
        {
          category: "Oferta e preços",
          positive: 3.3,
          neutral: 90.1,
          negative: 6.6,
        },
        { category: "Outro", positive: 2.8, neutral: 90.8, negative: 6.4 },
      ],
      topCategories: [
        {
          rank: 1,
          category: "Serviço de rede",
          mentions: 67,
          percentage: 100,
          topics: [
            { topic: "agilidade no atendimento", sentiment: "positive" },
            { topic: "qualidade dos resultados", sentiment: "positive" },
            { topic: "eficiência do serviço", sentiment: "positive" },
            { topic: "confiabilidade do serviço", sentiment: "negative" },
            { topic: "confiabilidade da rede", sentiment: "negative" },
            { topic: "estabilidade da rede", sentiment: "negative" },
          ],
        },
        {
          rank: 2,
          category: "Suporte ao cliente",
          mentions: 17,
          percentage: 25,
          topics: [
            { topic: "atenção ao cliente", sentiment: "positive" },
            { topic: "tratamento respeitoso", sentiment: "positive" },
            { topic: "prontidão de resposta", sentiment: "positive" },
            {
              topic: "preocupações com a retenção de clientes",
              sentiment: "negative",
            },
            { topic: "usabilidade do aplicativo", sentiment: "negative" },
            {
              topic: "intenção de cancelamento do cliente",
              sentiment: "negative",
            },
          ],
        },
        {
          rank: 3,
          category: "Cobertura de rede",
          mentions: 15,
          percentage: 22,
          topics: [
            { topic: "cobertura de rede", sentiment: "positive" },
            { topic: "qualidade do sinal", sentiment: "positive" },
            { topic: "disponibilidade do serviço", sentiment: "negative" },
          ],
        },
      ],
      wordCloud: [
        { text: "confiabilidade", value: 51 },
        { text: "rede", value: 48 },
        { text: "qualidade", value: 45 },
        { text: "estabilidade", value: 42 },
        { text: "conectividade", value: 38 },
        { text: "velocidade", value: 35 },
        { text: "cobertura", value: 32 },
        { text: "sinal", value: 28 },
        { text: "preço", value: 25 },
        { text: "disponibilidade", value: 22 },
        { text: "atendimento", value: 20 },
        { text: "conexão", value: 18 },
        { text: "intensidade", value: 16 },
        { text: "internet", value: 14 },
        { text: "resposta", value: 12 },
        { text: "desempenho", value: 10 },
        { text: "resolução", value: 9 },
        { text: "problema", value: 8 },
        { text: "eficiência", value: 7 },
        { text: "agilidade", value: 6 },
        { text: "resultado", value: 5 },
        { text: "faturamento", value: 4 },
        { text: "autonomia", value: 3 },
        { text: "serviço", value: 3 },
        { text: "satisfação", value: 2 },
        { text: "cancelamento", value: 2 },
        { text: "retenção", value: 2 },
        { text: "renovação", value: 1 },
        { text: "telemarketing", value: 1 },
        { text: "duração", value: 1 },
        { text: "plano", value: 1 },
        { text: "móvel", value: 1 },
        { text: "comunicação", value: 1 },
        { text: "mudança", value: 1 },
        { text: "4G", value: 1 },
      ],
    },
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
              sentiment: "positive",
            },
            {
              topic: "qualidade dos resultados",
              sentiment: "positive",
            },
            { topic: "eficiência do serviço", sentiment: "positive" },
            {
              topic: "confiabilidade do serviço",
              sentiment: "positive",
            },
            { topic: "confiabilidade da rede", sentiment: "negative" },
            { topic: "estabilidade da rede", sentiment: "negative" },
          ],
        },
        {
          rank: 2,
          category: "Atendimento personalizado",
          mentions: 356,
          percentage: 29,
          topics: [
            { topic: "atenção ao cliente", sentiment: "positive" },
            { topic: "tratamento respeitoso", sentiment: "positive" },
            { topic: "prontidão de resposta", sentiment: "positive" },
            {
              topic: "preocupações com a retenção de clientes",
              sentiment: "negative",
            },
            {
              topic: "usabilidade do aplicativo",
              sentiment: "negative",
            },
            {
              topic: "intenção de cancelamento do cliente",
              sentiment: "negative",
            },
          ],
        },
        {
          rank: 3,
          category: "Facilidade de uso",
          mentions: 198,
          percentage: 16,
          topics: [
            { topic: "cobertura de rede", sentiment: "positive" },
            { topic: "qualidade do sinal", sentiment: "positive" },
            { topic: "velocidade de conexão", sentiment: "positive" },
            {
              topic: "disponibilidade do serviço",
              sentiment: "negative",
            },
            {
              topic: "interrupções frequentes",
              sentiment: "negative",
            },
            { topic: "latência alta", sentiment: "negative" },
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
            { topic: "tempo de espera", sentiment: "negative" },
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
              sentiment: "negative",
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
              sentiment: "negative",
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
      id: "customerType",
      name: "Tipo de Cliente",
      summary: `O NPS negativo geral em todos os tipos de clientes sinaliza uma necessidade crítica de melhorar a qualidade do serviço para aumentar a defesa do cliente, com os segmentos pós-pago e controle exigindo atenção imediata devido aos seus níveis mais altos de insatisfação.
Os principais pontos problemáticos variam por segmento: clientes pós-pago estão frustrados principalmente com a funcionalidade do aplicativo e problemas de conectividade 5G, enquanto usuários controle enfrentam problemas de faturamento e serviço 4G, e clientes pré-pago, embora relativamente mais satisfeitos, ainda levantam preocupações sobre concorrência e desempenho do aplicativo.
Melhorias direcionadas focadas na confiabilidade do aplicativo, desempenho da rede e faturamento transparente, adaptadas aos problemas específicos de cada segmento, podem aumentar significativamente a satisfação do cliente e reduzir a rotatividade.`,
      distribution: [
        { segment: "Pré-pago", count: 37, percentage: 37.0 },
        { segment: "Controle", count: 35, percentage: 35.0 },
        { segment: "Pós-pago", count: 28, percentage: 28.0 },
      ],
      sentiment: [
        { segment: "Controle", positive: 24.3, neutral: 0.7, negative: 75.0 },
        { segment: "Pré-pago", positive: 35.8, neutral: 0.8, negative: 63.4 },
        { segment: "Pós-pago", positive: 13.8, neutral: 0.8, negative: 85.4 },
      ],
      npsSummary: `Os escores NPS para todos os tipos de clientes (controle, pré-pago, pós-pago) são negativos, indicando insatisfação geral e baixa probabilidade de recomendação da empresa.
O segmento pré-pago apresenta um sentimento relativamente melhor, com menor proporção de detratores e um NPS menos negativo (-13.5), em comparação com clientes controle e pós-pago, que têm maiores percentuais de detratores e escores mais negativos (-22.8 e -28.6, respectivamente).
Há uma necessidade urgente de melhorias direcionadas na qualidade do serviço e experiência do cliente, especialmente para usuários pós-pago e controle, para aumentar a defesa da marca e reduzir a rotatividade no competitivo mercado de telefonia móvel.`,
      nps: [
        { segment: "Controle", nps: -22.8 },
        { segment: "Pré-pago", nps: -13.5 },
        { segment: "Pós-pago", nps: -28.6 },
      ],
      npsDistribution: [
        {
          segment: "Controle",
          promotores: 28.6,
          neutros: 20.0,
          detratores: 51.4,
        },
        {
          segment: "Pré-pago",
          promotores: 35.1,
          neutros: 16.2,
          detratores: 48.6,
        },
        {
          segment: "Pós-pago",
          promotores: 25.0,
          neutros: 21.4,
          detratores: 53.6,
        },
      ],
      positiveCategories: [
        {
          category: "Serviço de rede",
          Controle: 27.8,
          "Pré-pago": 43.2,
          "Pós-pago": 70.6,
        },
        {
          category: "Suporte ao cliente",
          Controle: 47.2,
          "Pré-pago": 18.2,
          "Pós-pago": 0.0,
        },
        {
          category: "Oferta e preços",
          Controle: 16.7,
          "Pré-pago": 15.9,
          "Pós-pago": 0.0,
        },
      ],
      negativeCategories: [
        {
          category: "Serviço de rede",
          Controle: 46.8,
          "Pré-pago": 56.4,
          "Pós-pago": 50.5,
        },
        {
          category: "Cobertura de rede",
          Controle: 22.5,
          "Pré-pago": 19.2,
          "Pós-pago": 12.4,
        },
        {
          category: "Suporte ao cliente",
          Controle: 18.0,
          "Pré-pago": 6.4,
          "Pós-pago": 15.2,
        },
      ],
      satisfactionImpactSummary: `Clientes pós-pagos apresentam o maior sentimento negativo (85,4%), principalmente devido a problemas relacionados ao aplicativo e à conectividade 5G que afetam sua satisfação.
Clientes pré-pagos têm um feedback relativamente mais positivo, valorizando a cobertura da rede e os sistemas de bônus, embora existam algumas preocupações sobre a concorrência e o desempenho do aplicativo.
Clientes controle apreciam o suporte ao cliente e os planos acessíveis, mas relatam problemas de faturamento e serviço 4G que impactam negativamente a satisfação.`,
      satisfactionImpactSentiment: [
        {
          sentiment: "Negativo",
          Controle: 75.0,
          "Pré-pago": 63.4,
          "Pós-pago": 85.4,
        },
        {
          sentiment: "Não aplicável",
          Controle: 0.7,
          "Pré-pago": 0.8,
          "Pós-pago": 0.8,
        },
        {
          sentiment: "Positivo",
          Controle: 24.3,
          "Pré-pago": 35.8,
          "Pós-pago": 13.8,
        },
      ],
    },
    {
      id: "state",
      name: "Estado",
      summary: `A lealdade e satisfação do cliente variam significativamente entre os estados, com o Ceará (CE) demonstrando um forte sentimento positivo principalmente devido à excelente cobertura de rede, enquanto Rio de Janeiro (RJ), Paraná (PR) e São Paulo (SP) enfrentam desafios críticos refletidos em pontuações negativas de NPS e alta insatisfação relacionada ao suporte ao cliente deficiente e à usabilidade do aplicativo.
Para aumentar a satisfação do cliente e reduzir o churn, a empresa deve priorizar melhorias direcionadas nos serviços de suporte ao cliente e na experiência digital do aplicativo em RJ, PR e SP, além de manter e promover as vantagens da cobertura de rede no CE.
Implementar estratégias específicas para cada região que abordem esses pontos críticos será essencial para converter detratores em promotores e impulsionar um crescimento equilibrado em todos os estados.`,
      distribution: [
        { segment: "RJ", count: 14, percentage: 14.0 },
        { segment: "PR", count: 14, percentage: 14.0 },
        { segment: "PE", count: 13, percentage: 13.0 },
        { segment: "SP", count: 11, percentage: 11.0 },
        { segment: "CE", count: 11, percentage: 11.0 },
        { segment: "DF", count: 9, percentage: 9.0 },
        { segment: "SC", count: 9, percentage: 9.0 },
        { segment: "BA", count: 9, percentage: 9.0 },
        { segment: "RS", count: 5, percentage: 5.0 },
        { segment: "MG", count: 5, percentage: 5.0 },
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
      npsSummary: `Os dados revelam uma disparidade clara na lealdade do cliente entre os estados, com o Ceará (CE) apresentando um NPS fortemente positivo de 9,1, impulsionado por uma alta proporção de promotores, enquanto todos os outros estados exibem escores NPS negativos, indicando insatisfação geral.
Os piores escores estão no Rio de Janeiro (RJ) e no Paraná (PR), onde os detratores predominam, sugerindo problemas significativos com a qualidade do serviço ou o valor percebido nessas regiões.
Intervenções direcionadas que abordem pontos problemáticos específicos de cada região, especialmente em RJ e PR, serão críticas para melhorar a satisfação do cliente e reduzir o churn.`,
      nps: [
        { segment: "CE", nps: 9.1 },
        { segment: "PE", nps: -7.7 },
        { segment: "PR", nps: -14.3 },
        { segment: "RJ", nps: -28.6 },
        { segment: "SP", nps: -18.2 },
      ],
      npsDistribution: [
        {
          segment: "CE",
          promotores: 45.5,
          neutros: 18.2,
          detratores: 36.4,
        },
        {
          segment: "PE",
          promotores: 38.5,
          neutros: 15.4,
          detratores: 46.2,
        },
        {
          segment: "PR",
          promotores: 35.7,
          neutros: 14.3,
          detratores: 50.0,
        },
        {
          segment: "RJ",
          promotores: 21.4,
          neutros: 28.6,
          detratores: 50.0,
        },
        {
          segment: "SP",
          promotores: 27.3,
          neutros: 27.3,
          detratores: 45.5,
        },
      ],
      satisfactionImpactSummary: `A satisfação do cliente varia significativamente por região, com SP apresentando o maior sentimento negativo (94,6%), impulsionado principalmente por suporte ao cliente deficiente e problemas de usabilidade do aplicativo.
O feedback positivo no CE está fortemente ligado à cobertura de rede, enquanto em PE e PR, o suporte ao cliente e os sistemas de bônus são os principais fatores de satisfação.
Abordar as deficiências no suporte ao cliente e os problemas relacionados ao aplicativo em regiões com alta negatividade, especialmente SP e RJ, deve ser priorizado para melhorar a satisfação geral.`,
      satisfactionImpactSentiment: [
        {
          sentiment: "Negativo",
          CE: 77.4,
          PE: 62.5,
          PR: 58.3,
          RJ: 71.7,
          SP: 94.6,
        },
        {
          sentiment: "Não aplicável",
          CE: 0.0,
          PE: 0.0,
          PR: 2.8,
          RJ: 3.8,
          SP: 0.0,
        },
        {
          sentiment: "Positivo",
          CE: 22.6,
          PE: 37.5,
          PR: 38.9,
          RJ: 24.5,
          SP: 5.4,
        },
      ],
      positiveCategories: [
        {
          category: "Serviço de rede",
          CE: 14.3,
          PE: 28.6,
          PR: 21.4,
          RJ: 76.9,
          SP: 33.3,
        },
        {
          category: "Suporte ao cliente",
          CE: 14.3,
          PE: 23.8,
          PR: 21.4,
          RJ: 23.1,
          SP: 33.3,
        },
        {
          category: "Oferta e preços",
          CE: 0.0,
          PE: 28.6,
          PR: 42.9,
          RJ: 0.0,
          SP: 0.0,
        },
      ],
      negativeCategories: [
        {
          category: "Serviço de rede",
          CE: 58.3,
          PE: 34.3,
          PR: 66.7,
          RJ: 28.9,
          SP: 41.5,
        },
        {
          category: "Cobertura de rede",
          CE: 41.7,
          PE: 17.1,
          PR: 0.0,
          RJ: 28.9,
          SP: 13.2,
        },
        {
          category: "Suporte ao cliente",
          CE: 0.0,
          PE: 11.4,
          PR: 0.0,
          RJ: 21.1,
          SP: 28.3,
        },
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
  ],
};

// ------------------------------------------------------------
// 6. IMPLEMENTATION PLAN
// ------------------------------------------------------------
export const implementationPlan = {
  recommendations: [
    {
      id: 1,
      title:
        "Atualize a Infraestrutura de Rede para Melhorar a Cobertura e Estabilidade",
      severity: "high",
      tasks: [
        {
          task: "Realizar avaliação da infraestrutura de rede atual",
          owner: "Engenharia de Redes",
        },
        {
          task: "Identificar lacunas de cobertura e estabilidade",
          owner: "Engenharia de Redes",
        },
        {
          task: "Definir requisitos técnicos",
          owner: "Engenharia de Redes",
        },
        {
          task: "Desenvolver plano de projeto detalhado",
          owner: "Engenharia de Redes",
        },
        {
          task: "Coordenar com RAN para alocação de recursos",
          owner: "Rede de acesso via rádio (RAN)",
        },
        {
          task: "Selecionar soluções de hardware e software",
          owner: "Engenharia de Redes",
        },
        {
          task: "Adquirir equipamentos e licenças",
          owner: "Engenharia de Redes",
        },
        {
          task: "Agendar janelas de instalação",
          owner: "Operações de rede",
        },
        {
          task: "Implementar atualizações",
          owner: "Operações de rede",
        },
        {
          task: "Testar componentes",
          owner: "Operações de rede",
        },
        {
          task: "Monitorar desempenho",
          owner: "Operações de rede",
        },
        {
          task: "Resolver problemas identificados durante testes e monitoramento",
          owner: "Operações de rede",
        },
        {
          task: "Fornecer treinamento sobre novos sistemas para equipe de Operações de rede",
          owner: "Engenharia de Redes",
        },
        {
          task: "Documentar alterações e atualizar registros de configuração de rede",
          owner: "Engenharia de Redes",
        },
      ],
    },
    {
      id: 2,
      title: "Programa de comunicação proativa",
      severity: "high",
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
      severity: "high",
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
      severity: "medium",
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
      severity: "low",
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
// 7. UI TEXTS - All hardcoded texts from components
// ------------------------------------------------------------
export const uiTexts = {
  // AttributeDeepDive
  attributeDeepDive: {
    summary: "Sumário",
    distribution: "Distribuição dos respondentes",
    segment: "Segmento",
    quantity: "Quantidade",
    percentage: "%",
    sentimentAnalysis: "Análise de sentimento",
    positive: "Positivo",
    negative: "Negativo",
    npsQuestion:
      "Qual é a probabilidade de você recomendar nossa empresa a um amigo ou colega em escala de 0 a 10?",
    responses: "Respostas",
    promotersNeutralsDetractors: "Promotores, Neutros, Detratores",
    promoters: "Promotores",
    neutrals: "Neutros",
    detractors: "Detratores",
    nps: "NPS",
    satisfactionImpactQuestion:
      "Quais são os principais pontos que impactam sua satisfação?",
    positiveCategories: "Categorias com sentimento positivo - Top 3",
    negativeCategories: "Categorias com sentimento negativo - Top 3",
    sentiment: "Sentimento",
    notApplicable: "Não aplicável",
    category: "Categoria",
    tooltip: {
      respondents: (count, percentage) =>
        `${count.toLocaleString()} respondentes (${percentage}%)`,
    },
  },
  // ExecutiveReport
  executiveReport: {
    executiveSummary: "Sumário Executivo",
    aboutStudy: "Sobre o Estudo",
    mainFindings: "Principais Descobertas",
    conclusions: "Conclusões",
    recommendations: "Recomendações",
    tableHeaders: {
      number: "#",
      recommendation: "Recomendação",
      severity: "Gravidade",
      stakeholders: "Stakeholders",
    },
    tasks: {
      hideTasks: "Ocultar tarefas",
      showTasks: "Mostrar tarefas",
      hide: "Ocultar",
      show: "Mostrar",
      implementationTasks: "Tarefas de Implementação",
      task: "Tarefa",
      responsibleArea: "Área Responsável",
    },
  },
  // FilterPanel
  filterPanel: {
    all: "Todas",
    openField: "Campo Aberto",
    multipleChoice: "Múltipla Escolha",
    nps: "NPS",
    filterByQuestion: "Filtrar por questão:",
    selectQuestion: "Selecione uma questão",
    allQuestions: "Todas as questões",
    filters: "Filtros",
    selectFilterType: "Selecione um tipo de filtro",
    none: "Nenhum",
    state: "Estado",
    customerType: "Tipo de Cliente",
    education: "Escolaridade",
    clearAll: "Limpar todos",
    closeFilters: "Fechar filtros",
    openFilters: "Abrir filtros",
    activeFilters: "Filtros Ativos",
    selected: "selecionado",
    selectedPlural: "selecionados",
    selectValues: "Selecione os valores",
    clearAllFilters: "Limpar todos os filtros",
    ok: "OK",
    questionPrefix: "Q",
  },
  // SurveyHeader
  surveyHeader: {
    results: "Resultados da Pesquisa",
    question: "Questão",
    executiveReport: "Relatório Executivo",
    executiveSummary: "Sumário Executivo",
    recommendations: "Recomendações",
    supportAnalysis: "Análises de Suporte",
    sentimentAnalysis: "Análise de Sentimento",
    respondentIntent: "Intenção de Respondentes",
    segmentation: "Segmentação",
    questionAnalysis: "Análise por Questão",
    attributeDeepDive: "Aprofundamento por Atributos",
    deepDive: "Aprofundamento",
  },
  // ResponseDetails
  responseDetails: {
    all: "Todas",
    openField: "Campo Aberto",
    multipleChoice: "Múltipla Escolha",
    nps: "NPS",
    wordCloud: "Nuvem de Palavras",
    summary: "Sumário:",
    responses: "Respostas:",
    npsScore: "NPS Score",
    top3CategoriesTopics: "Top 3 categorias e principais tópicos",
    top3Categories: "Top 3 Categorias",
    mentions: "menções",
    positive: "Positivos",
    negative: "Negativos",
    noPositiveTopics: "Nenhum tópico positivo",
    noNegativeTopics: "Nenhum tópico negativo",
    filterQuestion: "Filtrar questão",
    downloadQuestion: "Download questão",
    png: "PNG",
    pdf: "PDF",
    removeFilter: "Remover filtro",
    responsesCount: "respostas",
    questionPrefix: "Q",
  },
  // SupportAnalysis
  supportAnalysis: {
    sentimentAnalysis: "Análise de Sentimento",
    respondentIntent: "Intenção de Respondentes",
    segmentation: "Segmentação",
    clusterLabel: "Rótulo de Cluster",
    clusterDescription: "Descrição do Cluster",
    memberPercentage: "Porcentagem de Membros",
    clusterId: "ID do Cluster",
    responses: "Respostas",
  },
  // SurveySidebar
  surveySidebar: {
    executiveReport: "Relatório Executivo",
    supportAnalysis: "Análises de Suporte",
    attributeDeepDive: "Aprofundamento por Atributos",
    questionAnalysis: "Análise por Questão",
    export: "Export",
    executiveSummary: "Sumário Executivo",
    recommendations: "Recomendações",
    sentimentAnalysis: "Análise de Sentimento",
    respondentIntent: "Intenção de Respondentes",
    segmentation: "Segmentação",
    respondents: "Respondentes",
    responseRate: "Taxa de Adesão",
    questions: "Perguntas",
  },
  // WordCloud
  wordCloud: {
    mentions: "menções",
  },
  // Export
  export: {
    title: "Export de Dados",
    description: "Exporte os dados da pesquisa em diferentes formatos",
    exportFullReport: "Exportar Relatório Completo",
    selectSpecificSections: "Selecione seções específicas",
    exportAsPDF: "Exportar como PDF",
    exportAsPPT: "Exportar como PPT",
    selectAtLeastOneSection:
      "Selecione pelo menos uma seção ou o relatório completo para exportar",
  },
};

// ------------------------------------------------------------
// HELPER CONSTANTS
// ------------------------------------------------------------
export const severityLabels = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};
