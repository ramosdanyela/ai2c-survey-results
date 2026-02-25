Pontos de refinamento da aplicação

1. Na parte de Recomendações, preciso manualmente expandir cada recomendação para que as tarefas para implementação da recomendação apareçam (você está vendo nos dois arquivos porque eu fiz isso)
--> no exportpreview, em recommendationstable, a lista de ações/tarefas deve estar ABERTAS por default.


2. Nessa mesma parte, no documento Word, isso ficou cortado (talvez pelo mesmo motivo acima)

--> Em algumas partes da exportacao do word, quando o elemento vira imagem no word, ele fica cortado no final da “folha do wordl” (como se tivesse ocultado uma parte da imagem). Isso nao deveria acontecer, pense em alternativas para isso nao acontecer.


3. Exportação de gráficos, tanto no PDF quanto no Word, estão com legenda e rótulos se sobrepondo às vezes (ver sentimento das top categorias e predição de intenção como exemplos)
É preciso criar uma estratégia para ajustar as legendas e rótulos especialmente dos graficos que usam sentimentDivergentChart e barChart.
Tanto no export preview quanto na aplicação eles estão ficando encavalados pelo tamanho do texto ou com um pedaço cortado. Os rótulos não deveriam sobrepor uns aos outros OU o próprio gráfico. O gráfico e a legenda devem respeitar o container. Os gráficos e seus dados devem ser centralizados no container. 
As informações do grafico tipo stackedBarMece estão sendo cortadas e ficando pra fora do container. isso acontece porque as barras sao muito "grandes”horizontalmente e nao sobre espaço pras legendas, pq sao longas. Voce pode diminuir o tamanho horizontal das barras (proporcionalmente) QUANDO necessário.
Considere esses problemas de sytling e renderizacao que estamos tendo e que precisamos resolve-los em todos os break points. Desenhe a estratégia antes e depois aplique. Pode considerar quando necessário diminuir a fonte de legendas e rótulos.
Voce nao deve alterar os dados nem a estrutura que é recebida através do .json. mas pode mudar o código em si (nao o json e sua estrutura a ser recebida)


4. Ainda na aplicação, achamos um problema. Se você passar o mouse em cima do gráfico de sentimentdivergentchart, aparecem dois “Positive”, quando deveria haver o “Negative”. Não encontrei esse erro no JSON, então acho que é na renderização do gráfico mesmo.
--> A tooltip deve seguir os dados do .json, hoje os dois dados da tooltip estao com dois rotulos de positive (de forma errada).


5. Um outro ponto também... quando clicamos em uma seção (exceto na análise de questões), a tela da direita deveria carregar a visão da seção desde o início, mas ela mostra a tela no meio ou no final da visão de atributo. Para navegabilidade isso seria muito melhor. É o que acontece na análise por questão, que funciona bem.
--> Sempre ao abrir uma seção ou subseção ( com exceção da secao analise por questao que está certa), ao clicar na seção ou subseção a ser aberta, você deve renderizar ela a partir do início da página. Hoje ao clicar para abrir uma nova subseção, ele abre no meio (verticalmente falando) da subseção, ao invés de abrir no início.
