# Mercado E-commerce - Documentação do Projeto

## 1. Visão Geral do Projeto

### Nome do projeto: 
Mercado E-commerce

### Descrição breve:
O Mercado E-commerce é uma plataforma completa de comércio eletrônico para produtos de moda, com funcionalidades para clientes e administradores. O projeto oferece uma experiência de compra intuitiva com catálogo de produtos, carrinho de compras, checkout, perfil de usuário e histórico de pedidos. Para administradores, inclui um painel abrangente para gerenciamento de produtos, categorias, usuários e pedidos.

### Tecnologias utilizadas:
- **Frontend**:
  - React.js (18.3.1)
  - TypeScript (5.2.2)
  - Redux Toolkit (gerenciamento de estado)
  - React Router (navegação)
  - TailwindCSS (estilização)
  - Axios (requisições HTTP)
  - Vite (bundler)
  - React Hot Toast (notificações)
  - HeadlessUI (componentes acessíveis)

- **Backend**:
  - JSON Server (API REST simulada)
  - Node.js

- **DevOps**:
  - Docker (containerização)
  - Nginx (servidor web)
  - Docker Compose (orquestração de contêineres)

## 2. Estrutura e Arquitetura

### Arquitetura do sistema:
O projeto segue uma arquitetura cliente-servidor:

1. **Frontend (Cliente)**:
   - Aplicação React Single Page Application (SPA)
   - Gerenciamento de estado com Redux
   - Roteamento com React Router
   - Interface responsiva com TailwindCSS

2. **Backend (Servidor)**:
   - API REST simulada com JSON Server
   - Banco de dados JSON para armazenamento de dados
   - Middleware para manipulação de requisições

3. **Infraestrutura**:
   - Containerização com Docker
   - Nginx como proxy reverso
   - Docker Compose para orquestração

### Organização dos arquivos:
```
/
├── public/               # Arquivos estáticos
├── src/                  # Código-fonte da aplicação
│   ├── actions/          # Actions para formulários e operações
│   ├── assets/           # Recursos estáticos (imagens, etc.)
│   ├── axios/            # Configuração do cliente Axios
│   ├── components/       # Componentes reutilizáveis da UI
│   ├── context/          # Contextos React (autenticação, etc.)
│   ├── data/             # Dados estáticos ou mockados
│   ├── features/         # Funcionalidades específicas
│   ├── hooks/            # Hooks personalizados
│   ├── pages/            # Componentes de página
│   │   ├── admin/        # Páginas do painel administrativo
│   │   └── ...           # Outras páginas do site
│   ├── redux/            # Configuração do Redux, slices, etc.
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
├── nginx.conf            # Configuração do Nginx
├── db.json               # Banco de dados JSON
├── server.js             # Servidor JSON Server
├── package.json          # Dependências e scripts
├── tailwind.config.js    # Configuração do TailwindCSS
└── vite.config.ts        # Configuração do Vite
```

### Fluxo de dados:
1. **Cliente → Servidor**:
   - O cliente faz requisições HTTP para a API usando Axios
   - Requisições são autenticadas quando necessário
   - Dados são enviados no formato JSON

2. **Servidor → Cliente**:
   - O servidor processa as requisições e retorna dados JSON
   - Middleware adiciona timestamps para criação/atualização
   
3. **Gerenciamento de Estado**:
   - Redux Toolkit gerencia o estado global da aplicação
   - Redux Persist mantém estado entre sessões
   - Contextos React para estados específicos (autenticação, categorias)

## 3. Funcionalidades e Módulos

### Funcionalidades para Clientes:

1. **Catálogo de Produtos**
   - Listagem de produtos com paginação
   - Filtragem por categoria
   - Pesquisa de produtos
   - Visualização detalhada de produto

2. **Carrinho de Compras**
   - Adição/remoção de itens
   - Atualização de quantidades
   - Cálculo de subtotal e total

3. **Checkout**
   - Formulário de endereço de entrega
   - Seleção de método de pagamento
   - Confirmação de pedido

4. **Autenticação de Usuário**
   - Registro de nova conta
   - Login/logout
   - Recuperação de senha

5. **Perfil de Usuário**
   - Visualização/edição de informações pessoais
   - Gerenciamento de endereços
   - Histórico de pedidos

### Funcionalidades para Administradores:

1. **Painel Administrativo**
   - Visão geral com métricas (produtos, pedidos, receita)
   - Autenticação segura para administradores

2. **Gerenciamento de Produtos**
   - Listagem, criação, edição e exclusão de produtos
   - Upload e compressão de múltiplas imagens
   - Gerenciamento de estoque, tamanhos e cores

3. **Gerenciamento de Categorias**
   - Criação e edição de categorias
   - Organização de produtos por categoria

4. **Gerenciamento de Usuários**
   - Visualização e edição de contas de usuário
   - Definição de níveis de acesso

## 4. APIs e Integrações

### API REST (JSON Server)

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

## 5. Instalação e Deploy

### Instalação Local

1. **Pré-requisitos**:
   - Node.js (versão 16 ou superior)
   - npm ou yarn

2. **Passos para instalação**:
   ```bash
   # Clone o repositório
   git clone [url-do-repositorio]
   cd mercado-teamplate

   # Instale as dependências
   npm install

   # Inicie o servidor de desenvolvimento e o JSON Server
   npm start
   ```

3. **Comandos úteis**:
   - `npm start` - Inicia o frontend e o backend concorrentemente
   - `npm run dev` - Inicia apenas o frontend (Vite)
   - `npm run server` - Inicia apenas o JSON Server
   - `npm run build` - Compila o projeto para produção

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
   - O frontend estará disponível na porta 80
   - A API estará disponível na porta 3000

## 6. Estrutura de Dados

### Produtos
```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  images: string[];
  featured: boolean;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Categorias
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  bannerImage?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

### Pedidos
```typescript
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}
```

### Usuários
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
```

## 7. Autenticação e Segurança

O sistema possui dois fluxos de autenticação:

1. **Autenticação de Cliente**:
   - Registro com email e senha
   - Login com credenciais
   - Redux Persist para manter o estado de autenticação

2. **Autenticação de Administrador**:
   - Login exclusivo em `/admin/login`
   - Rotas protegidas para o painel administrativo
   - Componente `AdminProtectedRoute` para verificação de acesso

## 8. Futuras Melhorias

- Implementação de gateway de pagamento real
- Otimização de desempenho para imagens e componentes
- Implementação de análises avançadas no painel administrativo
- Integração com sistemas de gerenciamento de estoque
- Funcionalidades de marketing como cupons e programas de fidelidade
- Suporte a múltiplos idiomas e internacionalização 