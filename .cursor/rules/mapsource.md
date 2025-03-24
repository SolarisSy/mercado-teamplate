### [2025-03-22]

**Função mapeada:** getUsers()
**Localização:** src/users/users.service.ts

**Descrição da função:**  
Consulta usuários no banco com filtros opcionais (`name`, `status`) e retorna dados paginados.

**Relacionamentos:**  
- Chama: `UserRepository.find()`  
- É chamada por: `UsersController.getAllUsers()`  
- Depende de: `GetUsersQueryDto`, `PaginationOptionsDto`

**Status:** Nova
---

**Função mapeada:** getAllUsers()
**Localização:** src/users/users.controller.ts

**Descrição da função:**  
Recebe requisição GET `/users`, aplica filtros e paginação, e retorna lista formatada com DTO.

**Relacionamentos:**  
- Chama: `UsersService.getUsers()`  
- É chamada por: Rota HTTP  
- Depende de: NestJS Query Parameters, Swagger decorators

**Status:** Nova
---

**Classe mapeada:** GetUsersQueryDto
**Localização:** src/users/dto/get-users-query.dto.ts

**Descrição da classe:**  
DTO para validação e tipagem dos parâmetros de consulta na rota GET `/users`.

**Relacionamentos:**  
- Usada por: `UsersController.getAllUsers()`
- Estende: `PaginationOptionsDto` (para parâmetros de paginação)

**Status:** Nova
---

**Classe mapeada:** UserResponseDto
**Localização:** src/users/dto/user-response.dto.ts

**Descrição da classe:**  
DTO para formatação da resposta com dados de usuário na API.

**Relacionamentos:**  
- Usada por: `UsersController.getAllUsers()`
- Mapeia: `UserEntity` para resposta da API

**Status:** Nova

### [2025-03-23]

**Módulo mapeado:** ScraperModule
**Localização:** src/scraper/scraper.module.ts

**Descrição do módulo:**  
Módulo responsável pela funcionalidade de scraping do site www.apoioentrega.com.

**Componentes:**
- ScraperController: Controla as rotas de acesso ao scraper
- ScraperService: Implementa a lógica de extração de dados
- HarAnalyzerService: Analisa arquivos HAR para identificar endpoints relevantes
- ProductExtractorService: Extrai informações de produtos das APIs identificadas
- CacheService: Gerencia cache de requisições para evitar duplicidade

**Status:** Novo
---

**Função mapeada:** analyzeHarFile()
**Localização:** src/scraper/services/har-analyzer.service.ts

**Descrição da função:**  
Analisa o arquivo HAR para identificar endpoints de API relevantes.

**Relacionamentos:**  
- É chamada por: `ScraperService.initialize()`
- Retorna: Lista de endpoints categorizados por tipo (produto, imagem, etc.)

**Status:** Nova
---

**Função mapeada:** extractProducts()
**Localização:** src/scraper/services/product-extractor.service.ts

**Descrição da função:**  
Extrai informações de produtos a partir dos endpoints identificados.

**Relacionamentos:**  
- Chama: APIs externas do site alvo
- É chamada por: `ScraperController.getProducts()`
- Utiliza: `CacheService` para armazenar resultados

**Status:** Nova
---

**Entidade mapeada:** ScrapedProductDto
**Localização:** src/scraper/dto/scraped-product.dto.ts

**Descrição da classe:**  
DTO para armazenar e validar os dados extraídos dos produtos.

**Campos:**
- id: Identificador único do produto
- name: Nome do produto
- imageUrls: Array com URLs das imagens
- price: Preço do produto
- description: Descrição do produto
- category: Categoria do produto

**Status:** Nova

# Mapa do Código-Fonte

## Visão geral
Este documento mapeia os principais componentes do sistema, suas responsabilidades e relacionamentos.

## Módulos Principais

### [ScraperModule]
**Categoria:** Extração de dados
**Localização:** `src/scraper/`

**Descrição:**  
Módulo responsável por extrair produtos e imagens de www.apoioentrega.com e disponibilizá-los para importação no sistema da loja.

**Componentes:**
- `controller.js` - Controlador principal que gerencia as APIs de extração e importação de produtos
- `CacheService` - Serviço de cache para minimizar requisições e aumentar performance
- `ProductExtractorService` - Serviço especializado em extrair dados de produtos
- `ScrapedProductDto` - Modelo de dados para produtos extraídos

**APIs Expostas:**
- GET `/scraper/products` - Lista todos os produtos extraídos
- GET `/scraper/products/:id` - Obtém detalhes de um produto específico
- POST `/api/import-product` - Importa um produto específico para o sistema (via requisição direta)
- GET `/api-test` - Endpoint de teste para validar funcionamento do scraper

**Dependências:**
- Axios para requisições HTTP
- Sistema de caching em memória
- fs-extra para manipulação de arquivos
- uuid para geração de identificadores únicos
- crypto para hashing de URLs

### [AutoImportSystem]
**Categoria:** Importação automática
**Localização:** `src/scraper/controller.js`

**Descrição:**
Sistema responsável por executar importação automática de produtos em intervalos regulares, verificar duplicatas e gerenciar o processo de importação.

**Componentes:**
- `autoImportProcessor` - Função que gerencia o ciclo de vida da importação automática
- `autoImportTimer` - Timer que executa a importação em intervalos regulares
- `autoImportStatus` - Objeto que mantém o estado atual do sistema de importação
- `productMemory` - Sistema de memória para evitar importação de produtos duplicados

**APIs Expostas:**
- POST `/scraper/auto-import/start` - Inicia a importação automática
- POST `/scraper/auto-import/stop` - Para a importação automática
- GET `/scraper/auto-import/status` - Verifica o status atual da importação
- POST `/scraper/auto-import/run-now` - Força uma execução imediata da importação

**Dependências:**
- ScraperModule para extração de produtos
- ProductService para persistência de produtos no sistema

### [AdminModule]
**Categoria:** Administrativo
**Localização:** `src/pages/admin/`

**Descrição:**  
Interface administrativa para gerenciamento da loja online.

**Componentes:**
- `AdminDashboard.tsx` - Dashboard principal com visão geral do sistema
- `ProductsPage.tsx` - Página de gerenciamento de produtos
- `CategoriesPage.tsx` - Página de gerenciamento de categorias
- `UsersPage.tsx` - Página de gerenciamento de usuários
- `ProductImporter.tsx` - Interface para importação manual e automática de produtos

**Rotas:**
- `/admin` - Dashboard principal
- `/admin/products` - Gerenciamento de produtos
- `/admin/categories` - Gerenciamento de categorias
- `/admin/users` - Gerenciamento de usuários
- `/admin/importer` - Sistema de importação de produtos

### [CoreComponents]
**Categoria:** Componentes reutilizáveis
**Localização:** `src/components/`

**Descrição:**  
Componentes reutilizáveis por todo o sistema.

**Componentes:**
- `Header.tsx` - Cabeçalho da aplicação
- `Footer.tsx` - Rodapé da aplicação
- `ProductCard.tsx` - Card para exibição de produtos
- `ScraperProductsList.tsx` - Lista de produtos extraídos com controles de importação
- `AutoImportControl.tsx` - Controles para a importação automática de produtos

### [AuthModule]
**Categoria:** Autenticação
**Localização:** `src/auth/`

**Descrição:**  
Módulo responsável pela autenticação e autorização no sistema.

**Componentes:**
- `AuthContext.tsx` - Contexto React para gerenciamento do estado de autenticação
- `LoginPage.tsx` - Página de login
- `RegisterPage.tsx` - Página de registro
- `auth.service.ts` - Serviço com lógica de autenticação

**Rotas:**
- `/login` - Login de usuários
- `/register` - Registro de novos usuários

## Fluxos Principais

### [Fluxo de Extração e Importação]
1. O usuário acessa `/admin/importer`
2. O sistema exibe produtos disponíveis para importação do site www.apoioentrega.com
3. O usuário pode:
   a. Selecionar produtos e importar manualmente
   b. Ativar a importação automática
4. Produtos importados são adicionados ao catálogo da loja

### [Fluxo de Importação Automática]
1. O sistema verifica novos produtos a cada 5 minutos
2. Para cada produto encontrado:
   a. Verifica se já existe no sistema (evita duplicatas)
   b. Extrai todas as informações necessárias
   c. Importa para o catálogo da loja
3. O painel de controle exibe estatísticas em tempo real do processo

### ScraperController
**Arquivo:** `src/scraper/controller.js`
**Descrição:** Controlador principal para o scraper de produtos do apoioentrega.

**Funcionalidades principais:**
- Extração de produtos do site apoioentrega.com
- Mapeamento de dados para o formato da loja
- Importação automática de produtos
- Importação manual de produtos
- Importação em massa de todos os produtos disponíveis
- Download e armazenamento local de imagens (opcional)
- Exclusão de produtos com limpeza de imagens associadas

**Métodos principais:**
- `initialize()`: Inicializa o controlador e configura cache
- `startAutoImport()`: Inicia a importação automática periódica
- `stopAutoImport()`: Para a importação automática
- `runAutoImport()`: Executa um ciclo de importação automática
- `extractProducts(limit)`: Extrai produtos até o limite especificado
- `extractProductDetails(productId)`: Extrai detalhes de um produto específico
- `importProductToStore(product, downloadImages)`: Importa um produto para a loja, com opção de baixar ou não as imagens
- `downloadImage(imageUrl, productId)`: Baixa e salva uma imagem localmente
- `deleteProductImage(imagePath)`: Exclui uma imagem específica do sistema de arquivos
- `deleteAllProductImages(product)`: Exclui todas as imagens associadas a um produto
- `importAllProducts(batchSize, delayBetweenBatches, downloadImages)`: Importa todos os produtos disponíveis em lotes, com opção de baixar ou não as imagens
- `getImportAllStatus()`: Retorna o status atual da importação em massa

**Rotas API disponibilizadas:**
- `GET /scraper/products`: Lista produtos extraídos (limitado por padrão a 100)
- `GET /scraper/products/:skuId`: Obtém detalhes de um produto específico
- `POST /api/import-product`: Importa um único produto para a loja
- `DELETE /api/delete-product/:id`: Exclui um produto específico e suas imagens
- `DELETE /api/delete-all-products`: Exclui todos os produtos e suas imagens
- `POST /scraper/auto-import/start`: Inicia importação automática
- `POST /scraper/auto-import/stop`: Para importação automática
- `GET /scraper/auto-import/status`: Obtém status da importação automática
- `POST /scraper/auto-import/run-now`: Executa importação automática imediatamente
- `POST /scraper/import-all-products`: Inicia importação em massa, suporta opção de download de imagens
- `GET /scraper/import-all-products/status`: Obtém status detalhado da importação em massa
- `POST /scraper/import-all-products/cancel`: Cancela a importação em massa em andamento

**Sistema de Importação em Massa:**
- **Funcionalidade**: Importação gradual de todos os produtos disponíveis na API
- **Parâmetros configuráveis**:
  - `batchSize`: Número de produtos por lote (padrão: 20)
  - `delayBetweenBatches`: Intervalo entre lotes em ms (padrão: 3000)
  - `downloadImages`: Define se as imagens devem ser baixadas localmente (padrão: true)
- **Rastreamento de progresso**:
  - Total de produtos encontrados
  - Produtos importados com sucesso
  - Falhas de importação
  - Lote atual em processamento
  - Tempo decorrido desde o início
  - Taxa de importação (produtos por segundo)
  - Tempo estimado para conclusão
- **Mecanismos de segurança**:
  - Cancelamento automático após muitas falhas consecutivas
  - Atrasos entre lotes para não sobrecarregar a API
  - Verificação de duplicidade antes da importação
  - Tratamento robusto de erros com tentativas de recuperação

**Sistema de Exclusão de Produtos:**
- **Funcionalidade**: Exclusão de produtos com limpeza de imagens associadas
- **Mecanismos de segurança**:
  - Verificação da existência da imagem antes da exclusão
  - Validação do caminho da imagem para evitar exclusão de arquivos do sistema
  - Restrição à pasta específica de imagens de produtos (`/img/produtos/`)
  - Tratamento de erros para continuar o processo mesmo com falhas individuais
- **Rastreamento de progresso**:
  - Total de produtos excluídos
  - Total de imagens removidas
  - Logs detalhados de cada operação

**Interface de usuário associada:**
- `ScraperProductsList.tsx`: Componente de interface para controle e monitoramento do scraper, incluindo painel dedicado à importação em massa com barra de progresso, estatísticas em tempo real e opções de configuração. Implementa feedback detalhado sobre o processo de importação e apresenta tooltips informativos posicionados adequadamente para evitar bloqueio de interações.
- `ProductsList.tsx`: Componente de interface para gerenciamento de produtos, incluindo exclusão individual e em massa.

**Status:** Atualizado

### [ProductItem]
**Categoria:** Componentes
**Localização:** `src/components/ProductItem.tsx`

**Descrição:**
Componente React responsável por exibir um produto na interface, com suporte especial para imagens do apoioentrega.

**Props:**
- `product`: Objeto completo do produto (opcional)
  - `id`: ID do produto
  - `title`: Título do produto
  - `description`: Descrição do produto
  - `price`: Preço do produto
  - `category`: Categoria do produto
  - `image`: URL da imagem principal
  - `stock`: Estoque disponível (opcional)
  - `featured`: Flag de produto em destaque (opcional)
  - `source`: Origem do produto (opcional)

- **Propriedades individuais** (alternativas ao objeto product, para retrocompatibilidade):
  - `id`: ID do produto
  - `title`: Título do produto
  - `description`: Descrição do produto
  - `price`: Preço do produto
  - `category`: Categoria do produto
  - `image` ou `imageUrl`: URL da imagem principal
  - `stock`: Estoque disponível
  - `featured`: Flag de produto em destaque
  - `source`: Origem do produto
  - `isApoioEntregaImage`: Flag indicando se a imagem é do apoioentrega

**Funcionalidades:**
- Exibição de imagens:
  - Usa o componente `ProductImage` para tratamento robusto de imagens
  - Suporte para produtos com origem no apoioentrega
  - Sistema de fallback para imagens com erro
- Badges e indicadores:
  - Produtos novos
  - Status de estoque
  - Preços com desconto
  - Botão de adicionar ao carrinho
- Tratamento de erros:
  - Verificação de dados mínimos necessários
  - Exibição de mensagem de erro quando dados são insuficientes
  - Usar dados do objeto `product` ou props individuais com priorização

**Dependências:**
- React Router para navegação
- Redux para gerenciamento de estado
- formatCurrency para formatação de preços
- formatCategoryName para formatação de categorias
- htmlToPlainText para processar descrições HTML

**Status:** Atualizado

### [ImageHelpers]
**Categoria:** Utilitários
**Localização:** `src/utils/imageHelpers.ts`

**Descrição:**
Módulo de utilitários para manipulação de imagens no sistema, fornecendo funções auxiliares para tratamento de URLs de imagens e fallbacks.

**Funções principais:**
- `getProductMainImage(product)`: Obtém a URL da imagem principal de um produto
  - Parâmetros:
    - `product`: Objeto do produto
  - Processamento:
    - Verifica imagem principal
    - Tenta primeira imagem da lista
    - Usa fallback se necessário
  - Retorno:
    - URL da imagem ou placeholder

- `getCategoryImage(category)`: Obtém a URL da imagem de uma categoria
  - Parâmetros:
    - `category`: Nome da categoria
  - Processamento:
    - Busca imagem da categoria
    - Usa fallback se necessário
  - Retorno:
    - URL da imagem ou placeholder

- `getLocalImageUrl(url, title, category)`: Obtém a URL local para uma imagem
  - Parâmetros:
    - `url`: URL original da imagem
    - `title`: Título do produto (opcional, para fallback)
    - `category`: Categoria do produto (opcional, para fallback)
  - Processamento:
    - Preserva URLs de apoioentrega.vteximg.com.br
    - Processa URLs para garantir formato correto
    - Fornece fallbacks para URLs ausentes ou inválidas
  - Retorno:
    - URL processada ou fallback

- `isValidImageUrl(url)`: Verifica se uma URL é válida
  - Parâmetros:
    - `url`: URL a ser verificada
  - Retorno:
    - `true` se a URL é válida

- `isImageUrl(url)`: Verifica se uma URL é de uma imagem
  - Parâmetros:
    - `url`: URL a ser verificada
  - Retorno:
    - `true` se a URL tem extensão de imagem

- `isPlaceholderUrl(url)`: Verifica se uma URL é um placeholder
  - Parâmetros:
    - `url`: URL a ser verificada
  - Retorno:
    - `true` se a URL é um placeholder

**Dependências:**
- `typings.d.ts` para tipos do sistema

**Status:** Atualizado

### ProductImage
**Arquivo:** `src/components/ProductImage.tsx`
**Descrição:** Componente responsável por exibir imagens de produtos com tratamento de erros e fallbacks.

**Funcionalidades:**
- Exibe imagens de produtos com suporte a URLs externas e locais
- Preserva URLs originais do apoioentrega.vteximg.com.br
- Implementa sistema de fallback em caso de erro de carregamento
- Tenta alternativas como troca de protocolo HTTP/HTTPS antes de usar placeholder
- Suporta classes customizadas via props

**Props:**
- `src`: URL da imagem a ser exibida
- `alt`: Texto alternativo para a imagem
- `title`: Título do produto (opcional, usado para fallback)
- `category`: Categoria do produto (opcional, usado para fallback)
- `className`: Classes CSS a serem aplicadas (opcional)

**Dependências:**
- React
- Usa sistema simplificado para preservação de URLs originais
- Não depende do sistema de manipulação de imagens global

**Relacionado com:**
- ProductItem
- SingleProduct
- OrderConfirmation

### [FormatHtml]
**Categoria:** Utilitários
**Localização:** `src/utils/formatHtml.ts`

**Descrição:**
Módulo de utilitários para tratamento e sanitização de HTML, permitindo exibição segura de conteúdo HTML sem vulnerabilidades XSS.

**Funções principais:**
- `sanitizeHtml(htmlContent)`: Sanitiza conteúdo HTML para uso seguro com dangerouslySetInnerHTML
  - Parâmetros:
    - `htmlContent`: String contendo HTML (possivelmente com entidades escapadas)
  - Processamento:
    - Decodifica entidades HTML se necessário
    - Sanitiza o conteúdo usando DOMPurify
    - Limita tags permitidas para segurança
  - Retorno:
    - Objeto com formato { __html: string } para uso com dangerouslySetInnerHTML

- `htmlToPlainText(htmlContent)`: Converte HTML para texto plano removendo todas as tags
  - Parâmetros:
    - `htmlContent`: String contendo HTML (possivelmente com entidades escapadas)
  - Processamento:
    - Decodifica entidades HTML se necessário
    - Extrai apenas o conteúdo textual
  - Retorno:
    - String contendo apenas o texto, sem tags ou formatação HTML

- `decodeHtmlEntities(html)`: Decodifica entidades HTML escapadas sem depender do DOM
  - Parâmetros:
    - `html`: String contendo entidades HTML escapadas
  - Processamento:
    - Substitui entidades comuns (&lt;, &gt;, &amp;, etc.) por seus caracteres equivalentes
  - Retorno:
    - String com entidades HTML decodificadas

**Dependências:**
- DOMPurify para sanitização segura de HTML

**Status:** Novo

**Utilizações:**
- Em `ProductItem.tsx` para exibição segura de descrições em cards de produtos
- Em `SingleProduct.tsx` para exibição de descrições formatadas em páginas de detalhes
- Indiretamente no processo de importação para tratamento de HTML escapado

### Atualização do importProductToStore em Controller.js

**Localização:** `src/scraper/controller.js`

**Novas funcionalidades:**
- Processamento de descrições HTML durante importação:
  - Detecção automática de entidades HTML escapadas (&lt;, &gt;, etc.)
  - Decodificação para HTML válido
  - Preservação de estrutura HTML em descrições de produtos

**Fluxo atualizado de importação:**
1. Recebimento dos dados do produto (API externa ou formulário)
2. Validação dos dados obrigatórios
3. Processamento de descrição HTML (NEW):
   - Verificação de entidades HTML escapadas
   - Decodificação para HTML válido
4. Processamento de imagens:
   - Download e armazenamento local
   - Preservação de URLs originais
5. Criação do objeto formatado para o sistema
6. Validação final e persistência no banco de dados

**Impacto:**
- Melhoria na qualidade das descrições de produtos importados
- Preservação da formatação original das descrições
- Experiência de usuário aprimorada na visualização de produtos

**Status:** Atualizado

### Sistema de Imagens

O sistema de renderização de imagens foi reforçado para garantir melhor exibição em todas as páginas da aplicação:

- `ProductImage.tsx`: Componente responsável por renderizar imagens de produtos com tratamento robusto de erros.
  - Implementa múltiplas estratégias de fallback para garantir que alguma imagem seja sempre exibida
  - Suporta diferentes tipos de caminhos de imagem (local, relativo, absoluto)
  - Possui tratamento especial para imagens do apoioentrega
  - Usa placeholders alternativos em cascata quando a imagem principal falha

### Sistema de Categorias

O sistema de categorias foi aprimorado para garantir o correto funcionamento da filtragem e associação de produtos:

- `ShopPageContent.tsx`: Componente que exibe produtos filtrados por categoria
  - Implementa paginação manual para garantir funcionamento correto
  - Utiliza o slug da categoria como critério de filtragem
  - Tratamento robusto de erros durante a busca de produtos

- `CategoriesManager.tsx`: Componente de administração para gerenciar categorias
  - CRUD completo de categorias (criação, leitura, atualização, exclusão)
  - Interface para associar produtos a categorias
  - Suporte para upload de imagens de categorias

### Sistema de Integração com Apoioentrega

O processo de importação de produtos do apoioentrega foi aprimorado:

- `controller.js`: Implementa funções para extração e importação de produtos
  - `downloadImage`: Baixa e salva imagens localmente
  - `importProductToStore`: Processa produtos para o formato da loja, incluindo:
    - Limpeza de tags HTML nas descrições
    - Download e armazenamento local de imagens
    - Associação com categorias apropriadas

## Configuração do servidor
- server.js: servidor principal da aplicação
  - Utiliza json-server para fornecer uma API RESTful
  - Configuração de CORS para permitir acesso cross-origin incluindo todos os métodos HTTP necessários (GET, POST, PUT, DELETE, PATCH)
  - Configuração de middlewares de parsing e tratamento de requisições
  - Configuração de roteamento
  - Inicialização do controller do scraper

## Interface do Administrador
- src/pages/admin/CategoriesManager.tsx: painel de gerenciamento de categorias
  - CRUD completo de categorias
  - Upload e visualização de imagens de categorias
  - Associação de produtos a categorias
- src/pages/admin/ProductForm.tsx: formulário para criação e edição de produtos
  - Suporte para campos básicos (título, preço, categoria)
  - Suporte para campos específicos de supermercado (peso, unidade, marca, etc.)
  - Suporte para informações nutricionais
  - Upload de imagens (local e por URL)
  - Validação completa de dados
  - Renderização otimizada com chaves (keys) únicas para listas
- src/pages/admin/CarouselManager.tsx: painel de gerenciamento de banners do carrossel
  - CRUD completo de banners promocionais para o carrossel da página inicial
  - Configuração de título, imagem, link e ordem de exibição
  - Ativação/desativação de banners individuais
  - Sistema de ordenação para controlar a sequência de exibição
  - Distinto do sistema de categorias (não gerencia categorias da loja)

### [Button]
**Categoria:** Componentes
**Localização:** `src/components/Button.tsx`

**Descrição:**
Componente React para renderizar botões estilizados conforme o design system da aplicação.

**Props:**
- `mode`: Determina o estilo visual do botão (obrigatório)
  - `"primary"`: Botão com fundo na cor primária e texto branco
  - `"secondary"`: Botão com fundo na cor secundária e texto branco
  - `"white"`: Botão com fundo branco, borda cinza e texto na cor primária
  - `"transparent"`: Botão transparente com borda na cor primária e texto na cor primária
- `text`: Texto a ser exibido no botão (obrigatório)
- Suporta todas as propriedades HTML nativas de botões (`ButtonHTMLAttributes<HTMLButtonElement>`)
  - `onClick`: Função a ser executada no clique
  - `disabled`: Estado de desabilitado
  - `className`: Classes CSS adicionais
  - etc.

**Exemplo de uso:**
```tsx
<Button
  mode="primary"
  text="Adicionar ao Carrinho"
  onClick={handleAddToCart}
  disabled={!available}
  className="w-full md:w-auto"
/>
```

**Observações:**
- O componente aplica estilos base que incluem largura completa, altura, alinhamento e tamanho de texto
- Classes CSS adicionais podem ser aplicadas via prop `className`
- Se um `mode` inválido for fornecido, será exibida a mensagem "No valid mode selected"

**Status:** Documentado
