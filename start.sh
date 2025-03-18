#!/bin/bash

# Configurar o Nginx para servir os arquivos estáticos do frontend
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
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:3000;
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

# Iniciar o Nginx
service nginx start

# Verificar a localização atual
echo "Diretório atual: $(pwd)"
echo "Conteúdo do diretório:"
ls -la

# Verificar se o arquivo db.json existe
if [ ! -f "/app/db.json" ]; then
    echo "ERRO: db.json não encontrado no diretório /app"
    echo "Tentando localizar db.json:"
    find / -name db.json -type f 2>/dev/null
    
    # Se não encontrar, copiar o db.json do diretório atual para /app caso exista
    if [ -f "db.json" ]; then
        echo "db.json encontrado no diretório atual, copiando para /app/db.json"
        cp db.json /app/db.json
    fi
fi

# Verificar novamente
if [ ! -f "/app/db.json" ]; then
    echo "ERRO: db.json ainda não encontrado. Criando um arquivo db.json básico."
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

# Verificar se o arquivo routes.json existe
if [ ! -f "/app/routes.json" ]; then
    echo "ERRO: routes.json não encontrado. Criando um arquivo routes.json básico."
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

# Criar versão CommonJS do server.js para caso o original falhe
echo "Criando versão CommonJS do middleware..."
cat > /app/server-commonjs.js << 'EOF'
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Adicionar timestamp automático
module.exports = (req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = new Date().toISOString();
    req.body.updatedAt = new Date().toISOString();
  }
  if (req.method === 'PUT' || req.method === 'PATCH') {
    req.body.updatedAt = new Date().toISOString();
  }
  next();
};
EOF

# Instalar json-server globalmente
echo "Instalando json-server..."
npm install -g json-server@0.17.4

# Iniciar o JSON Server com middleware simplificado
echo "Iniciando JSON Server com middleware CommonJS..."
cd /app
json-server --host 0.0.0.0 --port 3000 --watch db.json --routes routes.json --middlewares ./server-commonjs.js > /var/log/json-server.log 2>&1 &
JSON_SERVER_PID=$!

# Verificar se o processo está rodando
echo "JSON Server PID: $JSON_SERVER_PID"
sleep 3
if ps -p $JSON_SERVER_PID > /dev/null; then
    echo "JSON Server está rodando com middleware CommonJS."
else
    echo "ERRO: JSON Server falhou ao iniciar com middleware CommonJS. Verificando logs:"
    cat /var/log/json-server.log
    
    # Tentar iniciar JSON Server sem o middleware
    echo "Tentando iniciar JSON Server sem middleware..."
    json-server --host 0.0.0.0 --port 3000 --watch db.json --routes routes.json > /var/log/json-server-fallback.log 2>&1 &
    JSON_SERVER_PID=$!
    
    sleep 3
    if ps -p $JSON_SERVER_PID > /dev/null; then
        echo "JSON Server está rodando sem middleware."
    else
        echo "ERRO: JSON Server falhou novamente. Último recurso: modo básico..."
        json-server --host 0.0.0.0 --port 3000 --watch db.json > /var/log/json-server-basic.log 2>&1 &
        JSON_SERVER_PID=$!
        
        sleep 3
        if ps -p $JSON_SERVER_PID > /dev/null; then
            echo "JSON Server está rodando em modo básico (sem routes.json)."
        else
            echo "ERRO CRÍTICO: JSON Server falhou em todas as tentativas. Verificando logs:"
            cat /var/log/json-server-basic.log
        fi
    fi
fi

# Verificar se o servidor está respondendo
echo "Verificando se o JSON Server está respondendo..."
curl -v http://localhost:3000/categories || echo "ERRO: JSON Server não está respondendo"

# Manter o processo principal ativo e mostrar logs periodicamente
echo "Serviços iniciados. Nginx na porta 80, JSON Server na porta 3000"
while true; do
    sleep 60
    echo "=== Status dos serviços $(date) ==="
    echo "Nginx status:"
    service nginx status || echo "Nginx não está rodando!"
    
    echo "JSON Server status (PID: $JSON_SERVER_PID):"
    if ps -p $JSON_SERVER_PID > /dev/null; then
        echo "JSON Server está rodando."
        echo "Últimas linhas do log do JSON Server:"
        tail -n 10 /var/log/json-server.log
    else
        echo "ERRO: JSON Server não está rodando! Reiniciando..."
        json-server --host 0.0.0.0 --port 3000 --watch db.json --routes routes.json > /var/log/json-server.log 2>&1 &
        JSON_SERVER_PID=$!
    fi
done
