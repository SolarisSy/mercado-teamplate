## 2025-04-07 - Implementação de download de imagens para armazenamento local

**Responsável:** Claude Sonnet 3.7

**Tipo de mudança:** Nova funcionalidade

**Descrição:**  
Implementação de sistema para baixar e salvar localmente as imagens dos produtos importados do apoioentrega, em vez de apenas referenciar as URLs originais.

**Razão:**  
Identificados potenciais problemas com o uso direto das URLs originais das imagens:
1. Dependência de servidores externos que podem ficar indisponíveis
2. Possível lentidão no carregamento de imagens de fontes externas
3. Risco de mudanças nas URLs ou estrutura do site de origem
4. Melhor controle sobre o formato e tamanho das imagens

**Solução implementada:**
1. Criada nova função `downloadImage()` no controller do scraper que:
   - Recebe uma URL de imagem e um ID de produto
   - Valida a URL e verifica se é uma imagem
   - Gera um nome de arquivo único baseado no ID do produto e hash da URL
   - Faz o download do conteúdo da imagem usando Axios
   - Salva o arquivo localmente em 'public/img/produtos/'
   - Retorna o caminho relativo para uso no frontend

2. Modificada a função `importProductToStore()` para:
   - Preservar as URLs originais como referência
   - Processar cada imagem individualmente
   - Baixar e salvar localmente cada imagem usando a nova função
   - Usar os caminhos locais no produto salvo no banco de dados

**Impacto:**
- Redução da dependência de servidores externos
- Melhor performance no carregamento de imagens
- Maior consistência na exibição dos produtos
- Melhor controle sobre o conteúdo armazenado

**Arquivos modificados:**
- src/scraper/controller.js - Adição da função downloadImage e modificação da função importProductToStore

**Dependências adicionadas:**
- fs-extra: Para manipulação de arquivos
- uuid: Para geração de nomes únicos de arquivos

**Observações:**
Esta implementação melhora a robustez do sistema, garantindo que as imagens dos produtos continuem disponíveis mesmo se o site de origem ficar indisponível ou mudar sua estrutura. As URLs originais ainda são preservadas para referência, mas não são mais usadas diretamente na exibição dos produtos.

## 2025-04-08 - Refatoração completa do sistema de exibição de imagens

**Issue identificada:** Imagens baixadas localmente para produtos importados não estavam sendo exibidas corretamente nas páginas de listagem (homepage e shop).

**Solução implementada:**
1. Refatoração completa do componente `ProductItem.tsx` para:
   - Suportar passagem do objeto de produto completo (`product`) além das props individuais
   - Melhorar a detecção de produtos importados (usando ID e campo `source`)
   - Priorizar imagens baixadas localmente em `/img/produtos/`
   - Implementar uma lógica mais robusta de fallback para imagens com erro
   - Adicionar melhor logging para diagnóstico

2. Atualização do componente `ProductImage.tsx`:
   - Adição das propriedades `productId` e `source` para melhor identificação
   - Melhoria na lógica de inicialização e tratamento de erros
   - Suporte específico para imagens em `/img/produtos/`

3. Atualização dos componentes que usam `ProductItem`:
   - `ProductGrid.tsx` - Agora passa o objeto de produto completo
   - `Landing.tsx` - Agora passa o objeto de produto completo
   - `SingleProduct.tsx` - Agora usa o componente `ProductImage` com todas as props necessárias

**Impacto:**
- Melhor consistência na exibição de imagens em toda a aplicação
- Redução de requests a servidores externos
- Priorização de imagens baixadas localmente
- Melhor tratamento de erros e fallbacks
- Manutenção simplificada com melhor separação de responsabilidades

Essa refatoração completa o ciclo de implementação do download de imagens locais, garantindo que as imagens baixadas sejam corretamente utilizadas em todos os contextos da aplicação.

## 2025-04-09 - Decodificação de entidades HTML em descrições de produtos

**Issue identificada:** As descrições de produtos importados do apoioentrega estavam sendo exibidas com tags HTML literais (e.g., `&lt;p&gt;`, `&lt;b&gt;` etc.) em vez de serem renderizadas como HTML formatado.

**Solução implementada:**
1. Criação do utilitário `formatHtml.ts` com funções para:
   - `sanitizeHtml`: Sanitiza HTML para renderização segura via `dangerouslySetInnerHTML`
   - `htmlToPlainText`: Converte HTML para texto plano mantendo apenas o conteúdo textual
   - `decodeHtmlEntities`: Decodifica entidades HTML escapadas (sem depender do DOM)

2. Modificação do componente `ProductItem.tsx` para usar `htmlToPlainText` nas descrições em cards:
   - Converte tags HTML escapadas para texto plano na exibição de cards
   - Mantém o texto legível sem exibir as tags literais

3. Modificação do componente `SingleProduct.tsx` para render HTML sanitizado na página de detalhes:
   - Usa `dangerouslySetInnerHTML` com HTML sanitizado para exibir formatação
   - Exibe descrições ricas com formatação HTML preservada e segura

4. Atualização do processo de importação em `controller.js`:
   - Decodificação de entidades HTML no momento da importação no backend
   - Processamento de descrições tanto na função `importProductToStore` quanto na rota `/api/import-product`
   - Limpeza de descrições para remover tags HTML escapadas

**Impacto:**
- Melhoria significativa na experiência do usuário com descrições de produtos formatadas corretamente
- Manutenção da segurança através da sanitização do HTML antes da renderização
- Processo de importação mais robusto com tratamento adequado de conteúdo HTML
- Exibição consistente de descrições em toda a aplicação (cards e páginas de detalhes)

**Dependências adicionadas:**
- DOMPurify: biblioteca para sanitização segura de HTML

**Arquivos modificados:**
- `src/utils/formatHtml.ts` (novo): funções para processamento e sanitização de HTML
- `src/components/ProductItem.tsx`: atualizado para converter HTML para texto plano em cards
- `src/pages/SingleProduct.tsx`: atualizado para renderizar HTML sanitizado na página de detalhes
- `src/scraper/controller.js`: atualizado para decodificar HTML durante a importação

**Observações:**
Esta implementação garante que as descrições de produtos importados sejam exibidas corretamente em todos os contextos, mantendo a formatação original quando apropriado e garantindo a segurança contra potenciais vulnerabilidades XSS.

## 2025-04-09 - Implementação de importação em massa de todos os produtos

**Responsável:** Claude Sonnet 3.7

**Tipo de mudança:** Nova funcionalidade

**Descrição:**  
Implementação de sistema de importação em massa para importar gradualmente todos os produtos disponíveis na API do apoioentrega, permitindo ao usuário iniciar, monitorar e cancelar o processo.

**Razão:**  
O sistema anterior limitava a visualização e importação a apenas 100 produtos por vez, com duas opções: importação manual individual e importação automática periódica. Era necessária uma terceira opção que permitisse a importação completa do catálogo de uma só vez.

**Solução implementada:**
1. No controlador do scraper (`controller.js`):
   - Criação do método `importAllProducts()` que busca e importa produtos em lotes contínuos até não haver mais produtos disponíveis
   - Implementação de sistema de rastreamento de progresso com estatísticas detalhadas (produtos encontrados, importados, falhas)
   - Adição de lógica para cálculo de estimativas de tempo restante e taxas de importação
   - Implementação de tratamento de erros robusto com sistema de recuperação e cancelamento automático após falhas consecutivas
   - Criação de rotas API para iniciar, monitorar e cancelar a importação em massa

2. Na interface do usuário (`ScraperProductsList.tsx`):
   - Adição de um novo painel dedicado à importação em massa
   - Implementação de barra de progresso para acompanhamento visual
   - Exibição de estatísticas detalhadas durante o processo (produtos importados, falhas, tempo decorrido, estimativa de tempo restante)
   - Botões para iniciar e cancelar o processo de importação em massa
   - Atualização automática do status a cada 30 segundos quando a importação está em andamento

**Impacto:**
- Capacidade de importar todo o catálogo de produtos do apoioentrega com uma única ação
- Maior visibilidade do progresso da importação com estatísticas em tempo real
- Melhor experiência do usuário com feedback visual sobre o processo
- Prevenção de duplicidade com verificação automática antes da importação de cada produto
- Download e armazenamento local de imagens durante a importação para maior independência de servidores externos

**Arquivos modificados:**
- `src/scraper/controller.js`: Adição dos métodos de importação em massa e rotas API correspondentes
- `src/components/ScraperProductsList.tsx`: Implementação do painel de interface para controle e monitoramento

**Dependências utilizadas:**
- Axios para requisições HTTP
- Sistema existente de download de imagens e processamento de produtos

**Observações:**
Esta implementação completa o ciclo de funcionalidades de importação, oferecendo três opções distintas para diferentes necessidades:
1. **Importação manual**: Para teste e seleção criteriosa de produtos individuais
2. **Importação automática**: Para monitoramento contínuo de novos produtos em intervalos regulares
3. **Importação em massa**: Para cadastro completo e rápido de todo o catálogo disponível

A solução implementa mecanismos de segurança para evitar sobrecarga do servidor de origem, com delays configuráveis entre lotes de importação e limitação do número de erros consecutivos permitidos.

## Análise e Documentação do Sistema de Categorias vs. Carrossel - 2023-10-15

**Contexto:**
Identificada uma inconsistência entre a visualização de categorias no painel administrativo e no site principal. A tela mostrada no painel é de gerenciamento de banners do carrossel, não o gerenciamento de categorias.

**Análise:**
1. No exemplo fornecido, o usuário estava visualizando o componente `CarouselManager.tsx` em vez do `CategoriesManager.tsx` no painel administrativo.
2. O `CarouselManager.tsx` gerencia banners promocionais que aparecem no carrossel da página inicial, com links para categorias específicas.
3. O verdadeiro gerenciador de categorias (`CategoriesManager.tsx`) é um componente separado que gerencia as categorias exibidas na navegação do site.

**Solução implementada:**
1. Documentada a distinção entre os dois componentes:
   - `CarouselManager.tsx`: gerencia banners promocionais do carrossel
   - `CategoriesManager.tsx`: gerencia categorias da loja

2. Identificado o fluxo correto para gerenciamento de categorias:
   - Categorias são criadas/editadas no componente `CategoriesManager`
   - Essas categorias são consumidas pelo `CategoryContext` e disponibilizadas em toda a aplicação
   - O componente `ShopPageContent` exibe as categorias na página da loja usando dados do `CategoryContext`

3. Confirmada a implementação correta do sistema de categorias através da análise do código:
   - O `CategoryContext` carrega as categorias da API e as mantém atualizadas
   - O `ShopPageContent` exibe as categorias disponíveis como filtros na loja
   - O sistema atualmente exibe corretamente as categorias no site da loja

**Impacto:**
- Esclarecido o propósito de cada componente administrativo
- Confirmado que o sistema de categorias funciona corretamente
- Documentada a diferença entre o gerenciamento de banners do carrossel e categorias
- Prevenção de confusão futura entre os dois sistemas

**Recomendações:**
1. Considerar adicionar mais clareza na interface administrativa para distinguir melhor o gerenciamento de carrossel do gerenciamento de categorias
2. Implementar breadcrumbs no painel administrativo para ajudar na navegação
3. Adicionar textos explicativos em cada seção administrativa para esclarecer seu propósito

## Correção do Erro de Desestruturação no ProductItem - 2023-10-15

**Contexto:**
Foi identificado um erro crítico ao acessar páginas de detalhes de produtos, onde o componente `ProductItem` gerava uma exceção: "Cannot destructure property 'id' of 'product' as it is undefined". Este erro impedia a visualização da página de detalhes do produto e afetava a exibição de produtos relacionados.

**Análise do problema:**
1. O componente `ProductItem` recebia dados de duas formas inconsistentes:
   - Em algumas partes do código, recebia um objeto `product` completo
   - Em outras partes, recebia propriedades individuais (id, title, price, etc.)
2. A implementação original tentava desestruturar propriedades de `product` sem verificar se o objeto existia
3. Na página `SingleProduct.tsx`, os produtos relacionados eram passados com propriedades individuais, não como objetos completos

**Solução implementada:**
1. Refatoração do componente `ProductItem`:
   - Tornando o parâmetro `product` opcional na interface `ProductProps`
   - Adicionando suporte para receber tanto o objeto completo quanto propriedades individuais
   - Implementando uma lógica de fallback que prioriza o objeto `product` e depois usa propriedades individuais
   - Adicionando verificações de segurança para evitar erros quando os dados são insuficientes
   - Exibindo uma mensagem de erro amigável quando os dados são incompletos

2. Atualização dos componentes que utilizam `ProductItem`:
   - Padronizando a forma de passar dados para o componente em `SingleProduct.tsx`
   - Usando o padrão de passar o objeto completo `product` quando disponível

**Impacto:**
- Correção do erro crítico que impedia a visualização de páginas de detalhes de produtos
- Maior robustez na renderização de produtos, evitando quebras na interface
- Melhor experiência do usuário com tratamento adequado de estados de erro
- Compatibilidade retroativa mantida com código existente que usa diferentes padrões de props

**Arquivos modificados:**
- `src/components/ProductItem.tsx`: Refatoração principal com suporte a múltiplos padrões de props
- `src/pages/SingleProduct.tsx`: Atualização da forma de passar dados para produtos relacionados

**Observações técnicas:**
A solução implementa um padrão de "API flexível" que permite múltiplas formas de uso do componente, facilitando a manutenção do código existente enquanto promove uma padronização gradual para o uso do objeto `product` completo em toda a aplicação.

## Correção do Botão de Adicionar ao Carrinho na Página de Detalhes de Produto - 2023-10-16

**Contexto:**
Foi identificado um problema na página de detalhes do produto (`SingleProduct.tsx`), onde o botão "Adicionar ao Carrinho" não estava sendo renderizado corretamente, exibindo apenas "No valid mode selected" como mensagem de erro.

**Análise do problema:**
1. O componente `Button` espera receber uma propriedade `mode` para definir o estilo visual do botão, aceitando valores como "primary", "secondary", "white" ou "transparent"
2. Na implementação da página `SingleProduct.tsx`, estava sendo passado incorretamente o atributo `purpose="primary"` em vez de `mode="primary"`
3. Além disso, o componente não suporta a propriedade `styles` que estava sendo utilizada para definir responsividade

**Solução implementada:**
1. Correções no componente `Button` no arquivo `SingleProduct.tsx`:
   - Substituído o atributo `purpose="primary"` por `mode="primary"` para seguir a API correta do componente
   - Substituído o atributo `styles="w-full md:w-auto"` por `className="w-full md:w-auto"`, que é o atributo padrão para estilização em componentes React

**Impacto:**
- Correção da renderização do botão "Adicionar ao Carrinho" na página de detalhes do produto
- Melhor experiência do usuário ao visualizar produtos individuais
- Consistência visual com o resto da aplicação
- Funcionalidade completa de adicionar produtos ao carrinho a partir da página de detalhes

**Arquivos modificados:**
- `src/pages/SingleProduct.tsx`: Correção dos atributos do componente Button

**Observações técnicas:**
Esta correção demonstra a importância de seguir corretamente a API dos componentes conforme definida em suas interfaces. O problema ocorreu porque o componente Button define `mode` como propriedade obrigatória em sua interface e não reconhece `purpose` como uma alternativa válida.

## 2025-04-09 - Implementação de exclusão de produtos com limpeza de imagens

**Responsável:** Claude Sonnet 3.7

**Tipo de mudança:** Nova funcionalidade

**Descrição:**  
Implementação de funcionalidades para excluir produtos com suas imagens associadas e para excluir todos os produtos do sistema em uma única operação.

**Razão:**  
O sistema anterior não removia as imagens locais dos produtos quando estes eram excluídos, causando acúmulo de arquivos não utilizados no servidor. Além disso, não havia uma forma rápida de limpar todos os produtos do catálogo quando necessário, exigindo exclusão manual um a um.

**Solução implementada:**
1. No controlador do scraper (`controller.js`):
   - Adição da função `deleteProductImage()` para remover uma imagem específica do sistema de arquivos
   - Adição da função `deleteAllProductImages()` para remover todas as imagens associadas a um produto
   - Criação de nova rota `/api/delete-product/:id` que exclui um produto e suas imagens
   - Criação de nova rota `/api/delete-all-products` que exclui todos os produtos e suas imagens
   - Implementação de verificações de segurança para evitar exclusão de arquivos do sistema
   - Adição de relatórios detalhados sobre o número de produtos e imagens excluídos

2. Na interface do usuário (`ProductsList.tsx`):
   - Modificação da função `handleDeleteProduct` para usar a nova rota de exclusão
   - Adição da função `handleDeleteAllProducts` para chamar a rota de exclusão de todos os produtos
   - Adição de botão "Excluir Todos os Produtos" com estilo de alerta visual (vermelho)
   - Implementação de confirmação dupla para evitar exclusões acidentais
   - Feedback visual através de notificações toast sobre o resultado da operação

**Impacto:**
- Melhoria na gestão de armazenamento do servidor, evitando acúmulo de arquivos não utilizados
- Facilidade para administradores realizarem limpeza completa do catálogo quando necessário
- Manutenção mais eficiente do sistema de arquivos, especialmente após testes de importação
- Maior rastreabilidade das operações de exclusão com logs detalhados
- Melhor experiência de usuário com feedback visual sobre o resultado das operações

**Arquivos modificados:**
- `src/scraper/controller.js`: Adição de funções para excluir imagens e rotas para exclusão de produtos
- `src/pages/admin/ProductsList.tsx`: Modificação da interface para incluir botão de exclusão em massa

**Observações:**
Esta implementação completa o ciclo de gerenciamento de produtos, fornecendo não apenas ferramentas para importação e edição, mas também para exclusão limpa de produtos e seus recursos associados. As novas rotas garantem que o sistema de arquivos permanece limpo e organizado, mesmo após múltiplas operações de importação e exclusão.

## 2025-04-11 - Implementação de opção para escolha entre download ou uso direto de imagens na importação

**Responsável:** Claude Sonnet 3.7

**Tipo de mudança:** Nova funcionalidade

**Descrição:**  
Implementação de uma opção que permite ao usuário escolher entre baixar as imagens para armazenamento local ou utilizar diretamente as URLs originais durante o processo de importação em massa de produtos.

**Razão:**  
O sistema anteriormente sempre baixava e armazenava localmente todas as imagens durante a importação, o que garante disponibilidade contínua mas pode ocupar muito espaço de armazenamento e tornar o processo de importação mais lento. Alguns usuários podem preferir utilizar as URLs originais para economizar espaço e acelerar a importação, especialmente durante testes ou quando se tem certeza da estabilidade da fonte.

**Solução implementada:**
1. No controlador do scraper (`controller.js`):
   - Modificação do método `importProductToStore` para aceitar um parâmetro booleano `downloadImages`
   - Implementação de lógica condicional para baixar imagens ou usar URLs originais
   - Atualização do método `importAllProducts` para aceitar e propagar essa configuração
   - Modificação da rota API para receber o parâmetro `downloadImages` do frontend

2. Na interface do usuário (`ScraperProductsList.tsx`):
   - Adição de um checkbox "Baixar imagens localmente" no painel de importação em massa
   - Implementação de estado React para armazenar a preferência do usuário
   - Passagem dessa configuração para a API durante a chamada de importação em massa
   - Adição de tooltip explicativo sobre as vantagens e desvantagens de cada opção

**Impacto:**
- Maior flexibilidade para o usuário escolher entre economia de espaço ou disponibilidade garantida das imagens
- Possibilidade de importação mais rápida quando não há necessidade de baixar todas as imagens
- Redução potencial do uso de disco quando as URLs originais são utilizadas
- Melhor experiência do usuário com informações claras sobre as implicações de cada escolha
- Preservação da compatibilidade com importações anteriores, mantendo o comportamento padrão de baixar imagens

**Arquivos modificados:**
- `src/scraper/controller.js`: Modificação dos métodos de importação e rotas para suportar escolha de download
- `src/components/ScraperProductsList.tsx`: Adição de interface para seleção de modo de tratamento de imagens

**Observações:**
Esta implementação oferece mais controle ao usuário sobre o comportamento do sistema de importação, permitindo escolher a abordagem mais adequada às suas necessidades específicas. O comportamento padrão continua sendo baixar as imagens para manter compatibilidade com o sistema existente.

---
**Data:** 2024-05-31
**Funcionalidade:** Adição de opção para escolher entre baixar imagens ou usar URLs originais na importação em massa
**Responsável:** Claude Sonnet 3.7
**Tipo de Alteração:** Nova funcionalidade
**Descrição:**
Implementação de uma opção que permite aos usuários escolher entre baixar as imagens para armazenamento local ou utilizar as URLs originais das imagens durante o processo de importação em massa. 

**Razão:**
Anteriormente, o sistema sempre baixava as imagens para armazenamento local durante a importação, o que poderia:
1. Tornar o processo de importação mais lento
2. Consumir mais espaço em disco
3. Dificultar testes e importações temporárias

**Solução Implementada:**
- Adição do parâmetro `downloadImages` (boolean) nos métodos `importProductToStore` e `importAllProducts` no `controller.js`
- Modificação da rota de API para importação em massa para aceitar o novo parâmetro
- Implementação de checkbox na interface para permitir que o usuário escolha sua preferência
- Lógica condicional para processar imagens de acordo com a escolha do usuário
- Tooltip informativo na interface explicando as implicações de cada opção

**Impacto:**
- Maior flexibilidade para os usuários no gerenciamento de imagens
- Potencial para importações mais rápidas quando as imagens não são baixadas
- Redução do uso de disco para importações que não necessitam de imagens locais
- Melhor experiência do usuário com informações claras sobre as opções disponíveis

**Arquivos Modificados:**
- `src/scraper/controller.js`
- `src/components/ScraperProductsList.tsx`

**Observações:**
Esta implementação fornece mais controle aos usuários sobre o processo de importação, mantendo a compatibilidade com importações anteriores. O comportamento padrão continua sendo baixar as imagens para manter a consistência com a experiência anterior. 