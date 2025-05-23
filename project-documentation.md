# Mercado E-commerce - Documentação do Projeto

## 1. Visão Geral do Projeto

### Nome do projeto: 
Mercado E-commerce

### Descrição breve:
O Mercado E-commerce é uma plataforma completa de comércio eletrônico para produtos de supermercado, com funcionalidades para clientes e administradores. O projeto oferece uma experiência de compra intuitiva com catálogo de produtos, carrinho de compras, checkout, perfil de usuário e histórico de pedidos. Para administradores, inclui um painel abrangente para gerenciamento de produtos, categorias, usuários e pedidos.

### Tecnologias utilizadas:
- **Frontend**:
  - React.js (18.3.1)
  - TypeScript (5.2.2)
  - Redux Toolkit (2.2.7)
  - React Router (6.25.1)
  - TailwindCSS (3.4.6)
  - Axios (1.7.2)
  - Vite (5.3.4)
  - React Hot Toast (2.4.1)
  - HeadlessUI (2.1.2)
  - Firebase (11.4.0)
  - Redux Persist (6.0.0)
  - QRCode.react (4.2.0)
  - Browser Image Compression (2.0.2)

- **Backend**:
  - Firebase como principal backend:
    - Firestore para armazenamento de dados
    - Firebase Authentication para autenticação de usuários
  - API REST simulada com JSON Server (1.0.0-beta.1) para desenvolvimento local
  - Banco de dados JSON para desenvolvimento local

- **DevOps**:
  - Docker (containerização)
  - Nginx (servidor web)
  - Docker Compose (orquestração de contêineres)
  - Nixpacks (para deploy no Easypanel)

## 2. Estrutura e Arquitetura

### Arquitetura do sistema:
O projeto segue uma arquitetura cliente-servidor:

1. **Frontend (Cliente)**:
   - Aplicação React Single Page Application (SPA)
   - Gerenciamento de estado com Redux e Redux Persist
   - Roteamento com React Router
   - Interface responsiva com TailwindCSS
   - Componentes modulares com foco em reutilização

2. **Backend (Servidor)**:
   - Firebase como principal backend:
     - Firestore para armazenamento de dados
     - Firebase Authentication para autenticação de usuários
   - API REST simulada com JSON Server (para desenvolvimento local)
   - Banco de dados JSON para desenvolvimento local

3. **Infraestrutura**:
   - Containerização com Docker
   - Nginx como proxy reverso
   - Docker Compose para orquestração
   - Script de inicialização otimizado (start.sh)

### Organização dos arquivos:
```
/
├── public/               # Arquivos estáticos
├── src/                  # Código-fonte da aplicação
│   ├── actions/          # Actions para formulários e operações
│   ├── assets/           # Recursos estáticos (imagens, etc.)
│   ├── axios/            # Configuração do cliente Axios
│   ├── components/       # Componentes reutilizáveis da UI
│   │   ├── Banner.tsx           # Banner promocional da página inicial
│   │   ├── Button.tsx           # Componente de botão reutilizável
│   │   ├── Footer.tsx           # Rodapé do site
│   │   ├── Header.tsx           # Cabeçalho do site
│   │   ├── Navbar.tsx           # Barra de navegação
│   │   ├── PaymentModal.tsx     # Modal de processamento de pagamento
│   │   ├── ProductImage.tsx     # Exibição de imagem de produto
│   │   ├── ProductItem.tsx      # Item de produto na grade
│   │   ├── ProtectedRoute.tsx   # Rota protegida para usuários logados
│   │   └── ... 
│   ├── context/          # Contextos React (autenticação, etc.)
│   ├── data/             # Dados estáticos ou mockados
│   ├── features/         # Funcionalidades específicas
│   ├── firebase/         # Configuração e serviços do Firebase
│   │   ├── auth.ts       # Serviços de autenticação
│   │   ├── config.ts     # Configuração do Firebase
│   │   └── db.ts         # Serviços do Firestore
│   ├── hooks/            # Hooks personalizados
│   ├── pages/            # Componentes de página
│   │   ├── admin/        # Páginas do painel administrativo
│   │   │   ├── AdminDashboard.tsx    # Layout principal do painel admin
│   │   │   ├── AdminLogin.tsx        # Página de login administrativo
│   │   │   ├── CarouselManager.tsx   # Gerenciamento de banners do carrossel
│   │   │   ├── CategoriesManager.tsx # Gerenciamento de categorias
│   │   │   ├── DashboardHome.tsx     # Página inicial do dashboard
│   │   │   ├── ProductForm.tsx       # Formulário de criação/edição de produto
│   │   │   ├── ProductsList.tsx      # Lista de produtos
│   │   │   └── ProductView.tsx       # Visualização detalhada de produto
│   │   ├── Cart.tsx               # Página do carrinho de compras
│   │   ├── Checkout.tsx           # Página de checkout
│   │   ├── Landing.tsx            # Página inicial
│   │   ├── Login.tsx              # Página de login
│   │   ├── OrderConfirmation.tsx  # Confirmação de pedido
│   │   ├── OrderHistory.tsx       # Histórico de pedidos
│   │   ├── Register.tsx           # Página de registro
│   │   ├── Shop.tsx               # Página da loja
│   │   ├── SingleOrderHistory.tsx # Detalhes de um pedido específico
│   │   ├── SingleProduct.tsx      # Página de produto individual
│   │   └── UserProfile.tsx        # Perfil do usuário
│   ├── redux/            # Configuração do Redux, slices, etc.
│   │   └── slices/       # Slices Redux para gerenciamento de estado
│   ├── services/         # Serviços para comunicação com a API
│   ├── types/            # Definições de tipos TypeScript
│   ├── utils/            # Utilitários e funções auxiliares
│   ├── App.tsx           # Componente principal da aplicação
│   ├── index.css         # Estilos globais
│   ├── main.tsx          # Ponto de entrada da aplicação
│   ├── store.ts          # Configuração da store Redux
│   └── typings.d.ts      # Declarações de tipos globais
├── Dockerfile            # Configuração do container frontend
├── Dockerfile.backend    # Configuração do container backend
├── docker-compose.yml    # Orquestração de containers
├── firebase.json         # Configuração do Firebase CLI
├── firestore.rules       # Regras de segurança do Firestore
├── firestore.indexes.json # Índices do Firestore
├── nginx.conf            # Configuração do Nginx
├── nixpacks.toml         # Configuração do Nixpacks para deploy
├── start.sh              # Script de inicialização
├── .env                  # Variáveis de ambiente
├── db.json               # Banco de dados JSON para desenvolvimento
├── routes.json           # Configuração de rotas para o JSON Server
├── server.js             # Servidor JSON Server
├── package.json          # Dependências e scripts
├── tailwind.config.js    # Configuração do TailwindCSS
└── vite.config.ts        # Configuração do Vite
```

### Fluxo de dados:
1. **Cliente → Servidor**:
   - O cliente faz requisições para o Firebase usando SDK do Firebase e/ou
   - O cliente faz requisições HTTP para a API usando Axios para o JSON Server em ambiente de desenvolvimento
   - Requisições são autenticadas através do Firebase Authentication
   - Dados são enviados no formato JSON
   - Interações de pagamento processadas através do PaymentModal

2. **Servidor → Cliente**:
   - Firebase processa as requisições e retorna dados 
   - Em desenvolvimento, o JSON Server processa as requisições e retorna dados JSON
   - Firebase Authentication gerencia tokens de autenticação
   - Respostas são processadas e atualizadas no estado do Redux
   
3. **Gerenciamento de Estado**:
   - Redux Toolkit gerencia o estado global da aplicação
   - Redux Persist mantém estado entre sessões (carrinho, autenticação)
   - Contextos React para estados específicos (autenticação, categorias)
   - Armazenamento de imagens otimizado com browser-image-compression

## 3. Funcionalidades e Módulos

### Funcionalidades para Clientes:

1. **Catálogo de Produtos**
   - Listagem de produtos com paginação
   - Filtragem por categoria
   - Pesquisa de produtos
   - Visualização detalhada de produto
   - Exibição de informações nutricionais e detalhes de produtos

2. **Carrinho de Compras**
   - Adição/remoção de itens
   - Atualização de quantidades
   - Cálculo de subtotal e total
   - Persistência do carrinho entre sessões

3. **Checkout**
   - Formulário de endereço de entrega
   - Seleção de método de pagamento
   - Modal de pagamento com QR Code
   - Confirmação de pedido

4. **Autenticação de Usuário**
   - Registro de nova conta
   - Login/logout
   - Recuperação de senha
   - Roteamento protegido para áreas restritas

5. **Perfil de Usuário**
   - Visualização/edição de informações pessoais
   - Gerenciamento de endereços
   - Histórico de pedidos
   - Visualização detalhada de pedidos anteriores

### Funcionalidades para Administradores:

1. **Painel Administrativo**
   - Visão geral com métricas (produtos, pedidos, receita)
   - Autenticação segura para administradores
   - Interface dedicada para gerenciamento

2. **Gerenciamento de Produtos**
   - Listagem, criação, edição e exclusão de produtos
   - Upload e compressão de múltiplas imagens
   - Gerenciamento de estoque, tamanhos e cores
   - Controle de produtos orgânicos e informações nutricionais

3. **Gerenciamento de Categorias**
   - Criação e edição de categorias
   - Organização de produtos por categoria
   - Interface visual para categorias

4. **Gerenciamento de Banners**
   - Criação e edição de banners do carrossel
   - Controle de ordem e visibilidade
   - Upload de imagens para banners

## 4. APIs e Integrações

### Firebase

#### Firebase Authentication
- Autenticação de Email/Senha
- Gerenciamento de usuários (registro, login, redefinição de senha)
- Proteção de rotas baseada em autenticação
- Verificação de perfil de administrador

#### Firebase Firestore
Coleções principais:
- `products`: Armazenamento de produtos
- `categories`: Gerenciamento de categorias
- `orders`: Pedidos dos clientes
- `users`: Detalhes estendidos dos usuários
- `carouselBanners`: Banners do carrossel

Operações:
- CRUD completo em cada coleção
- Consultas com filtros, ordenação e paginação
- Transações e operações em lote
- Regras de segurança para controle de acesso

### API REST (JSON Server - Desenvolvimento)

#### Produtos
- `GET /products` - Lista todos os produtos
- `GET /products/:id` - Obtém detalhes de um produto
- `GET /products?categoryId=:id` - Filtra produtos por categoria
- `GET /products?q=:query` - Pesquisa produtos
- `POST /products` - Cria um novo produto
- `PUT /products/:id` - Atualiza um produto existente
- `DELETE /products/:id` - Remove um produto

#### Categorias
- `GET /categories` - Lista todas as categorias
- `GET /categories/:id` - Obtém detalhes de uma categoria
- `POST /categories` - Cria uma nova categoria
- `PUT /categories/:id` - Atualiza uma categoria existente
- `DELETE /categories/:id` - Remove uma categoria

#### Pedidos
- `GET /orders` - Lista todos os pedidos
- `GET /orders/:id` - Obtém detalhes de um pedido
- `GET /orders?userId=:id` - Filtra pedidos por usuário
- `POST /orders` - Cria um novo pedido
- `PUT /orders/:id` - Atualiza um pedido existente

#### Usuários
- `GET /users` - Lista todos os usuários
- `GET /users/:id` - Obtém detalhes de um usuário
- `POST /users` - Cria um novo usuário
- `PUT /users/:id` - Atualiza um usuário existente

#### Banners do Carrossel
- `GET /carouselBanners` - Lista todos os banners
- `POST /carouselBanners` - Cria um novo banner
- `PUT /carouselBanners/:id` - Atualiza um banner existente
- `DELETE /carouselBanners/:id` - Remove um banner

## 5. Instalação e Deploy

### Instalação Local

1. **Pré-requisitos**:
   - Node.js (versão 16 ou superior)
   - npm ou yarn
   - Conta no Firebase (para configuração do projeto)

2. **Passos para instalação**:
   ```bash
   # Clone o repositório
   git clone [url-do-repositorio]
   cd mercado-teamplate

   # Instale as dependências
   npm install

   # Configure o Firebase
   # 1. Crie um projeto no console do Firebase (https://console.firebase.google.com/)
   # 2. Ative o Firestore e o Authentication
   # 3. Configure as variáveis de ambiente no arquivo .env:
   # VITE_FIREBASE_API_KEY=seu_api_key
   # VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   # VITE_FIREBASE_PROJECT_ID=seu_project_id
   # VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   # VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
   # VITE_FIREBASE_APP_ID=seu_app_id

   # Inicie o servidor de desenvolvimento
   npm run dev

   # Para iniciar o JSON Server junto com o frontend
   npm run server
   ```

3. **Comandos úteis**:
   - `npm run dev` - Inicia o frontend (Vite)
   - `npm start` - Inicia o frontend (Vite) - alias para dev
   - `npm run server` - Inicia apenas o JSON Server (para desenvolvimento local)
   - `npm run build` - Compila o projeto para produção

### Deploy com Firebase

1. **Pré-requisitos**:
   - Conta no Firebase
   - Firebase CLI instalado (`npm install -g firebase-tools`)

2. **Passos para deploy**:
   ```bash
   # Faça login no Firebase
   firebase login

   # Inicialize o projeto Firebase (se ainda não inicializado)
   firebase init

   # Compile o projeto
   npm run build

   # Faça o deploy
   firebase deploy
   ```

### Deploy com Docker

1. **Pré-requisitos**:
   - Docker
   - Docker Compose

2. **Passos para deploy**:
   ```bash
   # Construa e inicie os containers
   docker-compose up -d

   # Para parar os containers
   docker-compose down
   ```

3. **Configuração**:
   - Para deploy local: o frontend estará disponível na porta 80
   - Para deploy no Easypanel: o serviço estará disponível no domínio configurado (sem necessidade de especificar porta)
   - Em ambiente de desenvolvimento, a API estará disponível através do proxy reverso em /api

### Deploy com Nixpacks (Easypanel)

1. **Pré-requisitos**:
   - Conta no Easypanel
   - Repositório Git configurado

2. **Configuração**:
   - Arquivo `nixpacks.toml` configurado na raiz do projeto para instalar dependências e construir a aplicação
   - Script `start.sh` para configurar o Nginx e iniciar o JSON Server

3. **Como funciona**:
   - O Nixpacks constrói a aplicação, instala o Nginx e configura-o para servir os arquivos estáticos
   - O Nginx atua como proxy reverso para o JSON Server no caminho `/api`
   - A aplicação ficará disponível diretamente na URL fornecida pelo Easypanel (sem necessidade de especificar porta)

4. **Troubleshooting**:
   - Se ocorrer erro "port already allocated", verifique outros projetos no Easypanel que possam estar usando as mesmas portas
   - Para visualizar logs, use o painel de controle do Easypanel

## 6. Estrutura de Dados

### Produtos
```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  popularity: number;
  featured: boolean;
  image: string;
  images?: Array<{
    id: string;
    url: string;
    isPrimary?: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
  weight?: number;
  unit?: string; // kg, g, ml, L, unidade
  brand?: string;
  isOrganic?: boolean;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sodium?: number;
  };
  expiryDate?: string;
  origin?: string;
  discount?: number;
}
```

### Produtos no Carrinho
```typescript
interface ProductInCart extends Product {
  id: string;
  quantity: number;
  stock: number;
}
```

### Usuários
```typescript
interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: string;
  password: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
  };
}
```

### Pedidos
```typescript
interface Order {
  id: number;
  orderStatus: string;
  orderDate: string;
  data: {
    email: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipcode: string;
    };
    paymentMethod: string;
  };
  products: ProductInCart[];
  subtotal: number;
  user: {
    email: string;
    id: number;
  };
}
```

### Estado do Carrinho
```typescript
interface CartState {
  cartItems: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    weight?: number;
    unit?: string;
  }>;
  totalAmount: number;
}
```

### Banners do Carrossel
```typescript
interface CarouselBanner {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  active: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}
```

## 7. Autenticação e Segurança

O sistema utiliza Firebase Authentication para gerenciar os processos de autenticação:

1. **Autenticação de Cliente**:
   - Registro com email e senha
   - Login com credenciais de email/senha
   - Recuperação de senha via email
   - Componente ProtectedRoute para rotas protegidas
   - Redux Persist para manter o estado de autenticação entre sessões

2. **Autenticação de Administrador**:
   - Login exclusivo em `/admin/login`
   - Verificação de claims/roles no Firebase para permissões de administrador
   - Rotas protegidas para o painel administrativo
   - Componente `AdminProtectedRoute` para verificação de acesso

3. **Segurança do Firestore**:
   - Regras de segurança definidas no arquivo `firestore.rules`
   - Permissões baseadas em autenticação e roles
   - Validação de dados no lado do servidor
   - Controle de acesso por documento e coleção

## 8. Sistema de Pagamento

O sistema inclui um componente de pagamento (PaymentModal.tsx) que:

1. **Funcionalidades de Pagamento**:
   - Geração de QR Code para pagamento via PIX
   - Opção de pagamento via cartão de crédito/débito
   - Simulação de pagamento para testes
   - Histórico de transações

2. **Fluxo de Pagamento**:
   - Seleção do método de pagamento no checkout
   - Abertura do modal de pagamento
   - Processamento da transação
   - Confirmação e redirecionamento para página de confirmação de pedido

3. **Segurança**:
   - Dados sensíveis não são armazenados no cliente
   - Transações são registradas no Firestore
   - Validação do status de pagamento

## 9. Futuras Melhorias

- Implementação de Firebase Cloud Functions para lógica de backend mais complexa
- Implementação de Firebase Storage para armazenamento de imagens otimizado
- Integração com gateway de pagamento real (Stripe, PayPal)
- Implementação de sistema de notificações em tempo real com Firebase Cloud Messaging
- Otimização de desempenho para imagens e componentes
- Implementação de análises avançadas no painel administrativo com Firebase Analytics
- Integração com sistemas de gerenciamento de estoque
- Funcionalidades de marketing como cupons e programas de fidelidade
- Suporte a múltiplos idiomas e internacionalização
- Implementação de PWA (Progressive Web App) para experiência mobile aprimorada
- Testes automatizados com Jest e React Testing Library 
- Sistema de avaliações e reviews de produtos
- Implementação de chatbot para suporte ao cliente 