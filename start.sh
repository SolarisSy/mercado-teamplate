#!/bin/bash
set -e

# Exibir informações para debug
echo "Iniciando configuração..."
echo "Listando diretório /app:"
ls -la /app/
echo "Verificando arquivos de configuração do JSON Server:"
if [ -f /app/db.json ]; then
  echo "db.json encontrado!"
  cat /app/db.json | head -n 20
else
  echo "ERRO: db.json não encontrado!"
  echo "Criando db.json básico..."
  cat > /app/db.json << 'EOF'
{
  "products": [],
  "categories": [],
  "carousel": [],
  "orders": [],
  "users": []
}
EOF
fi

if [ -f /app/routes.json ]; then
  echo "routes.json encontrado!"
  cat /app/routes.json
else
  echo "ERRO: routes.json não encontrado!"
  echo "Criando routes.json básico..."
  cat > /app/routes.json << 'EOF'
{
  "/api/*": "/$1",
  "/categories": "/categories",
  "/products": "/products",
  "/orders": "/orders",
  "/users": "/users",
  "/users/:id": "/users/:id",
  "/carousel": "/carousel",
  "/carousel/:id": "/carousel/:id",
  "/api/categories": "/categories",
  "/api/products": "/products",
  "/api/orders": "/orders",
  "/api/users": "/users",
  "/api/users/:id": "/users/:id",
  "/api/carousel": "/carousel",
  "/api/carousel/:id": "/carousel/:id"
}
EOF
fi

# Criar uma versão modificada do middleware
cat > /app/middleware.js << 'EOF'
// Middleware simples para o JSON Server
module.exports = (req, res, next) => {
  // Configuração de CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Logging das requisições
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Lidar com requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Middleware para timestamp automático
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const timestamp = new Date().toISOString();
    
    if (req.method === 'POST') {
      req.body.createdAt = timestamp;
    }
    
    req.body.updatedAt = timestamp;
  }
  
  next();
};
EOF

# Instalar json-server globalmente
echo "Instalando json-server..."
npm install -g json-server@0.17.4

# Iniciar o JSON Server em segundo plano com opções mais simples
echo "Iniciando o JSON Server..."
cd /app && json-server --watch db.json --routes routes.json --host 0.0.0.0 --port 3000 --middlewares middleware.js > /tmp/json-server.log 2>&1 &
JSON_SERVER_PID=$!
echo "JSON Server iniciado com PID: $JSON_SERVER_PID"

# Aguardar o JSON Server iniciar
echo "Aguardando o JSON Server iniciar..."
sleep 5
if ps -p $JSON_SERVER_PID > /dev/null; then
  echo "JSON Server está rodando!"
  cat /tmp/json-server.log
else
  echo "ERRO: JSON Server falhou ao iniciar!"
  cat /tmp/json-server.log
  echo "Tentando iniciar sem middleware..."
  cd /app && json-server --watch db.json --routes routes.json --host 0.0.0.0 --port 3000 > /tmp/json-server.log 2>&1 &
  JSON_SERVER_PID=$!
  sleep 5
fi

# Testar conexão com JSON Server
echo "Testando conexão com JSON Server..."
if curl -s -f http://127.0.0.1:3000/products > /dev/null; then
  echo "Conexão com JSON Server bem-sucedida!"
  USE_JSON_SERVER=true
else
  echo "ERRO: Não foi possível conectar ao JSON Server!"
  USE_JSON_SERVER=false
  
  # Criar API estática como fallback
  echo "Criando API estática como fallback..."
  mkdir -p /app/static_api/api
  
  # Criar arquivos JSON estáticos para as principais rotas
  echo '[]' > /app/static_api/api/products
  echo '[]' > /app/static_api/api/categories
  echo '[]' > /app/static_api/api/carousel
  echo '[]' > /app/static_api/api/users
  echo '[]' > /app/static_api/api/orders
fi

# Configurar o Nginx para servir os arquivos estáticos do frontend
echo "Configurando o Nginx..."

if [ "$USE_JSON_SERVER" = true ]; then
  # Configuração padrão com proxy para JSON Server
  cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /app/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
else
  # Configuração de fallback usando arquivos estáticos
  cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /app/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    location /api/ {
        root /app/static_api;
        add_header Content-Type application/json;
        try_files $uri $uri/ =404;
    }
}
EOF
fi

# Iniciar o Nginx
echo "Iniciando o Nginx..."
service nginx start || { echo "ERRO: Falha ao iniciar Nginx"; exit 1; }

# Verificar status
echo "Verificando status dos serviços..."
if [ "$USE_JSON_SERVER" = true ]; then
  curl -s http://127.0.0.1:3000/products | head || echo "Erro ao acessar o JSON Server"
fi
curl -s http://127.0.0.1/api/products | head || echo "Erro ao acessar o endpoint do Nginx"

# Manter o processo principal ativo
echo "Serviços iniciados. Nginx na porta 80"
if [ "$USE_JSON_SERVER" = true ]; then
  echo "JSON Server na porta 3000"
  tail -f /tmp/json-server.log
else
  echo "Usando API estática como fallback"
  tail -f /var/log/nginx/access.log
fi
