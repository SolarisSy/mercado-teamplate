# Mapa da Estrutura do Projeto

## Visão Geral
Este projeto é um e-commerce de mercado (template) construído com React.js, TypeScript e JSON server. A aplicação possui funcionalidades para clientes (loja online) e também um painel administrativo.

## Tecnologias Principais
- **Frontend**: React.js, TypeScript, TailwindCSS
- **Gerenciamento de Estado**: Redux Toolkit, React Context API
- **Roteamento**: React Router Dom
- **Backend Simulado**: JSON Server
- **Outras Bibliotecas**: Axios, Firebase, React Hot Toast

## Estrutura de Diretórios

### Raiz do Projeto
- `src/` - Código fonte principal
- `public/` - Arquivos estáticos
- `dist/` - Arquivos compilados para produção
- `.cursor/` - Arquivos de configuração do Cursor IDE
- Arquivos de configuração: `vite.config.ts`, `tailwind.config.js`, etc.

### Diretório `src/`
- `actions/` - Ações para formulários e outras operações
- `assets/` - Recursos estáticos (imagens, ícones)
- `axios/` - Configurações do cliente HTTP Axios
- `components/` - Componentes reutilizáveis
- `context/` - Contextos do React para gerenciamento de estado
- `data/` - Dados ou mocks utilizados pela aplicação
- `features/` - Features organizadas por funcionalidade
- `firebase/` - Configuração e serviços do Firebase
- `hooks/` - Hooks personalizados
- `pages/` - Componentes de página
- `redux/` - Configuração e slices do Redux
- `services/` - Serviços para chamadas de API e lógica de negócios
- `types/` - Definições de tipos TypeScript
- `utils/` - Funções utilitárias

## Principais Componentes

### Arquivos de Configuração
- `App.tsx` - Componente principal, configura o roteamento da aplicação
- `main.tsx` - Ponto de entrada da aplicação
- `store.ts` - Configuração da store do Redux
- `typings.d.ts` - Definições de tipos globais

### Componentes de UI
- `components/Button.tsx` - Componente de botão reutilizável
- `components/Navbar.tsx` - Barra de navegação
- `components/Footer.tsx` - Rodapé
- `components/ProductItem.tsx` - Item de produto para listagens
- `components/ProductGrid.tsx` - Grid para exibição de produtos
- `components/PaymentModal.tsx` - Modal para processamento de pagamentos

### Páginas
- `pages/Landing.tsx` - Página inicial
- `pages/Shop.tsx` - Página de listagem de produtos
- `pages/SingleProduct.tsx` - Página de detalhes do produto
- `pages/Cart.tsx` - Página do carrinho de compras
- `pages/Checkout.tsx` - Página de checkout
- `pages/Login.tsx` - Página de login
- `pages/Register.tsx` - Página de registro
- `pages/UserProfile.tsx` - Perfil do usuário
- `pages/OrderHistory.tsx` - Histórico de pedidos

### Páginas de Administração
- `pages/admin/AdminLogin.tsx` - Login do painel admin
- `pages/admin/AdminDashboard.tsx` - Layout do painel admin
- `pages/admin/DashboardHome.tsx` - Página inicial do painel
- `pages/admin/ProductsList.tsx` - Gerenciamento de produtos
- `pages/admin/ProductForm.tsx` - Formulário para criar/editar produtos
- `pages/admin/CategoriesManager.tsx` - Gerenciamento de categorias

### Contextos
- `context/AuthContext.tsx` - Contexto de autenticação de usuários
- `context/AdminAuthContext.tsx` - Contexto de autenticação admin
- `context/CategoryContext.tsx` - Gerenciamento de categorias
- `context/TrackingContext.tsx` - Rastreamento de ações do usuário

## Protocolos de Comunicação

### Cliente-Servidor
1. **API RESTful (JSON Server)**
   - **Endpoint**: `/products` - Lista todos os produtos
   - **Endpoint**: `/products/:id` - Detalhes de um produto específico
   - **Endpoint**: `/categories` - Lista todas as categorias
   - **Endpoint**: `/users` - Gerenciamento de usuários
   - **Endpoint**: `/orders` - Gerenciamento de pedidos
   - **Suporte a Paginação**: `?_page=1&_limit=12` - Controla paginação de resultados
   - **Filtros**: `?category=1` - Filtragem por categoria
   - **Ordenação**: `?_sort=price&_order=desc` - Ordenação de resultados

2. **Interceptores Axios**
   - `customFetch.ts` - Configura interceptores para requisições e respostas
   - Adiciona cabeçalhos padrão como Authorization
   - Manipula erros de forma centralizada
   - Normaliza formatos de resposta para consumo pelo frontend

3. **WebSockets (Firebase)**
   - Atualizações em tempo real de status de pedidos
   - Notificações para usuários e administradores
   - Sincronização de carrinho entre dispositivos

### Comunicação entre Componentes
1. **Redux Store**
   - `cartSlice` - Gerencia o estado do carrinho de compras
   - `userSlice` - Gerencia informações do usuário logado
   - `productSlice` - Gerencia a lista de produtos e detalhes
   - Dispatchers padronizados para alteração de estado

2. **React Context API**
   - Compartilhamento de estado entre componentes relacionados
   - Gerencia estados globais de UI (tema, visibilidade de elementos)
   - Fornece acesso a serviços compartilhados

3. **Props e Eventos**
   - Passagem de dados de componentes pais para filhos
   - Emissão de eventos de componentes filhos para pais
   - Uso de TypeScript para garantir tipagem correta

## Estrutura do Banco de Dados (db.json)

### Entidades Principais
- **categories** - Categorias de produtos
- **products** - Produtos disponíveis
- **users** - Usuários do sistema
- **orders** - Pedidos realizados

## Fluxos Principais
1. **Navegação e Compra**:
   - Visualização de produtos
   - Adição ao carrinho
   - Checkout
   - Processamento de pagamento
   - Confirmação de pedido
   
2. **Autenticação**:
   - Registro de usuário
   - Login/Logout
   - Perfil do usuário
   - Histórico de pedidos

3. **Painel Administrativo**:
   - Gerenciamento de produtos
   - Gerenciamento de categorias
   - Visualização de métricas
   - Gerenciamento de conteúdo (banners, carrossel)

## APIs e Serviços
- **JSON Server** - Serve como backend simulado para dados
- **Firebase** - Integração para recursos adicionais (autenticação, armazenamento) 