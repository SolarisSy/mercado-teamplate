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

### Controller (src/scraper/controller.js)

**Funções:**
- `importProductToStore(scraperProduct)`: Importa um produto do scraper para a loja
  - Parâmetros:
    - `scraperProduct`: Objeto com dados do produto a ser importado
  - Validações:
    - Verifica existência e formato dos dados obrigatórios
    - Valida URLs de imagens e preserva URLs do apoioentrega
    - Garante que a resposta da API contém os dados esperados
  - Retorno:
    - Sucesso: Objeto com ID do produto importado
    - Erro: Objeto com detalhes do erro encontrado

### ScraperProductsList (src/components/ScraperProductsList.tsx)

**Componente:**
- Responsável por exibir e gerenciar a lista de produtos do scraper
- Implementa a interface de importação de produtos

**Funções:**
- `importProduct(product)`: Prepara e envia produto para importação
  - Validações:
    - Verifica dados obrigatórios (título, preço, categoria)
    - Valida formato do preço
    - Verifica URLs de imagens
  - Tratamento de erros:
    - 400: Dados inválidos ou mal formatados
    - 409: Produto duplicado
    - 500: Erro interno do servidor
    - Outros: Erros de rede ou desconhecidos

**Helpers:**
- `getLocalImageUrl(url)`: Processa URLs de imagens
  - Preserva URLs do apoioentrega
  - Retorna URL local para outras imagens
- `validateProduct(product)`: Valida dados do produto antes do envio
  - Verifica campos obrigatórios
  - Valida formato dos dados
  - Retorna objeto com resultado da validação

### [ImportSystem]
**Categoria:** Importação de Produtos
**Localização:** `src/scraper/controller.js`

**Descrição:**
Sistema responsável por importar produtos do apoioentrega.com e gerenciar o processo de importação automática.

**Componentes principais:**
- `importProductToStore(product)`: Processa e importa um produto para o sistema
  - Parâmetros:
    - `product`: Objeto com dados do produto a ser importado
  - Processamento:
    - Valida dados obrigatórios
    - Processa URLs de imagens do apoioentrega
    - Preserva URLs originais no banco de dados
    - Adiciona campos de rastreamento
  - Retorno:
    - Objeto do produto formatado e salvo

- `extractProducts(limit)`: Extrai produtos do site alvo
  - Parâmetros:
    - `limit`: Número máximo de produtos a extrair
  - Processamento:
    - Busca produtos na API do apoioentrega
    - Extrai informações relevantes
    - Formata dados para importação
  - Retorno:
    - Array de produtos extraídos

**Estrutura de dados:**
- Produto no db.json:
  ```json
  {
    "id": "imported_[ID]",
    "title": "string",
    "description": "string",
    "price": number,
    "category": "string",
    "image": "string", // Imagem principal
    "images": ["string"], // Todas as imagens
    "stock": number,
    "source": "apoioentrega",
    "importedAt": "ISO date",
    "originalId": "string",
    "originalImages": ["string"], // URLs originais preservadas
    "lastUpdated": "ISO date"
  }
  ```

**APIs Expostas:**
- POST `/api/import-product` - Importação individual de produtos
- POST `/scraper/auto-import/start` - Inicia importação automática
- POST `/scraper/auto-import/stop` - Para importação automática
- GET `/scraper/auto-import/status` - Status da importação
- POST `/scraper/auto-import/run-now` - Força importação imediata

**Dependências:**
- Express.js para rotas
- Axios para requisições HTTP
- NodeCache para caching de produtos
- db.json para persistência de dados

**Status:** Atualizado

### [ProductItem]
**Categoria:** Componentes
**Localização:** `src/components/ProductItem.tsx`

**Descrição:**
Componente React responsável por exibir um produto na interface, com suporte especial para imagens do apoioentrega.

**Props:**
- `product`: Objeto completo do produto
- Props individuais para compatibilidade:
  - `id`: ID do produto
  - `title`: Título do produto
  - `price`: Preço do produto
  - `image`: URL da imagem principal
  - `category`: Categoria do produto
  - Outras props opcionais...

**Funcionalidades:**
- Exibição de imagens:
  - Usa `image` como fonte principal
  - Fallback para `images[0]` se necessário
  - Preserva URLs do apoioentrega
  - Trata erros de carregamento com fallbacks
  - Suporta troca de protocolo HTTP/HTTPS

- Badges e indicadores:
  - Ofertas
  - Produtos novos
  - Produtos orgânicos
  - Status de estoque
  - Descontos

**Dependências:**
- React Router para navegação
- Redux para gerenciamento de estado
- imageUtils para processamento de imagens

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
- `imageUtils.ts` para processamento de URLs
- `typings.d.ts` para tipos do sistema

**Status:** Atualizado
