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

# Instalar json-server globalmente se necessário
npm install -g json-server@0.17.4

# Iniciar o JSON Server em segundo plano
json-server --host 0.0.0.0 --port 3000 --watch db.json --routes routes.json &

# Manter o processo principal ativo
echo "Serviços iniciados. Nginx na porta 80, JSON Server na porta 3000"
tail -f /dev/null
