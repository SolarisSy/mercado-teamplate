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
        
        # Aumentar timeouts para evitar problemas com requisições longas
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
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

# Instalar dependências necessárias
echo "Instalando dependências..."
npm install -g json-server@0.17.4
apt-get update && apt-get install -y bc curl procps

# Criar script para executar a otimização do banco de dados diariamente
cat > /app/optimize-db-cron.sh << 'EOF'
#!/bin/bash

# Este script executa a otimização do banco de dados
LOG_FILE="/var/log/db-optimize.log"

echo "$(date) - Iniciando otimização do banco de dados" >> $LOG_FILE
cd /app

# Executar script de otimização
node database-optimizations.js >> $LOG_FILE 2>&1

# Verificar resultado
if [ $? -eq 0 ]; then
    echo "$(date) - Otimização concluída com sucesso" >> $LOG_FILE
else
    echo "$(date) - ERRO: Falha na otimização do banco de dados" >> $LOG_FILE
fi
EOF

chmod +x /app/optimize-db-cron.sh

# Configurar para executar uma vez por dia às 3:00 da manhã
(crontab -l 2>/dev/null; echo "0 3 * * * /app/optimize-db-cron.sh") | crontab -

# Executar a primeira otimização se o tamanho do db.json for maior que 5MB
DB_SIZE=$(stat -c%s "/app/db.json" 2>/dev/null || stat -f%z "/app/db.json" 2>/dev/null)
if [ -n "$DB_SIZE" ] && [ $DB_SIZE -gt 5000000 ]; then
    echo "Arquivo db.json grande (${DB_SIZE} bytes), executando otimização inicial..."
    /app/optimize-db-cron.sh
fi

# Determinar se estamos em ambiente de produção
NODE_ENV=${NODE_ENV:-development}
IS_PRODUCTION=false

if [ "$NODE_ENV" = "production" ]; then
    IS_PRODUCTION=true
else
    # Verificar o tamanho do db.json para decidir se devemos usar o servidor de produção
    DB_SIZE=$(stat -c%s "/app/db.json" 2>/dev/null || stat -f%z "/app/db.json" 2>/dev/null)
    if [ -n "$DB_SIZE" ] && [ $DB_SIZE -gt 5000000 ]; then # 5MB
        echo "Arquivo db.json grande (${DB_SIZE} bytes), usando servidor de produção para melhor performance."
        IS_PRODUCTION=true
    fi
fi

# Instalar dependências adicionais para o servidor de produção
if [ "$IS_PRODUCTION" = true ]; then
    echo "Configurando ambiente de produção..."
    npm install express cors morgan lowdb
    
    # Verificar se o arquivo server-prod.js existe
    if [ ! -f "/app/server-prod.js" ]; then
        echo "ERRO: server-prod.js não encontrado. Criando arquivo..."
        # O conteúdo deste arquivo está omitido aqui, pois já foi criado anteriormente
        # Se necessário, incluir o conteúdo do server-prod.js aqui
    fi
    
    # Criar diretório de logs
    mkdir -p /app/logs
fi

# Criar script de monitoramento
echo "Criando script de monitoramento..."
cat > /app/monitor.sh << 'EOF'
#!/bin/bash

LOG_FILE="/var/log/api-monitor.log"
RESTART_COUNT=0
MAX_RESTARTS=100
JSON_SERVER_PID=$1
MAX_MEMORY_MB=300  # Limite de memória em MB
IS_PRODUCTION=$2

echo "$(date) - Monitor iniciado para Servidor (PID: $JSON_SERVER_PID, Production: $IS_PRODUCTION)" >> $LOG_FILE

check_and_restart() {
    # Verificar se o processo existe
    if ! ps -p $JSON_SERVER_PID > /dev/null; then
        echo "$(date) - Servidor (PID: $JSON_SERVER_PID) não está rodando. Reiniciando..." >> $LOG_FILE
        start_server
        return
    fi
    
    # Verificar uso de memória
    MEMORY_USAGE=$(ps -o rss= -p $JSON_SERVER_PID | awk '{print $1/1024}')
    echo "$(date) - Uso de memória: ${MEMORY_USAGE}MB" >> $LOG_FILE
    
    if (( $(echo "$MEMORY_USAGE > $MAX_MEMORY_MB" | bc -l) )); then
        echo "$(date) - Servidor excedeu limite de memória (${MEMORY_USAGE}MB > ${MAX_MEMORY_MB}MB). Reiniciando..." >> $LOG_FILE
        kill -9 $JSON_SERVER_PID
        start_server
        return
    fi
    
    # Verificar se o servidor está respondendo
    if ! curl -s --max-time 5 http://localhost:3000/api-test > /dev/null; then
        echo "$(date) - Servidor não está respondendo. Reiniciando..." >> $LOG_FILE
        kill -9 $JSON_SERVER_PID
        start_server
    else
        echo "$(date) - Servidor está funcionando corretamente." >> $LOG_FILE
    fi
}

start_server() {
    RESTART_COUNT=$((RESTART_COUNT+1))
    
    if [ $RESTART_COUNT -gt $MAX_RESTARTS ]; then
        echo "$(date) - Número máximo de reinicializações excedido ($MAX_RESTARTS). Abortando." >> $LOG_FILE
        exit 1
    fi
    
    echo "$(date) - Reinicialização #$RESTART_COUNT. Iniciando servidor..." >> $LOG_FILE
    
    cd /app
    
    if [ "$IS_PRODUCTION" = "true" ]; then
        echo "$(date) - Iniciando servidor de produção..." >> $LOG_FILE
        # Usar o novo servidor de produção
        node --expose-gc server-prod.js > /var/log/server-prod.log 2>&1 &
        JSON_SERVER_PID=$!
        echo "$(date) - Novo servidor de produção PID: $JSON_SERVER_PID" >> $LOG_FILE
    else
        echo "$(date) - Iniciando JSON Server..." >> $LOG_FILE
        # Usar o JSON Server original
        json-server --host 0.0.0.0 --port 3000 --watch db.json --routes routes.json --middlewares ./server-commonjs.js > /var/log/json-server.log 2>&1 &
        JSON_SERVER_PID=$!
        echo "$(date) - Novo JSON Server PID: $JSON_SERVER_PID" >> $LOG_FILE
    fi
    
    # Aguardar inicialização
    sleep 5
    
    # Verificar se iniciou corretamente
    if ! ps -p $JSON_SERVER_PID > /dev/null; then
        echo "$(date) - Falha ao iniciar o servidor. Tentando modo simples..." >> $LOG_FILE
        
        if [ "$IS_PRODUCTION" = "true" ]; then
            # Tentar sem a flag --expose-gc
            node server-prod.js > /var/log/server-prod-fallback.log 2>&1 &
            JSON_SERVER_PID=$!
            echo "$(date) - Novo servidor de produção PID (fallback): $JSON_SERVER_PID" >> $LOG_FILE
        else
            # Tentar iniciar JSON Server no modo simples
            json-server --host 0.0.0.0 --port 3000 --watch db.json > /var/log/json-server-basic.log 2>&1 &
            JSON_SERVER_PID=$!
            echo "$(date) - Novo JSON Server PID (modo simples): $JSON_SERVER_PID" >> $LOG_FILE
        fi
    fi
    
    # Exportar o novo PID para o script principal
    echo $JSON_SERVER_PID > /tmp/json-server-pid
}

# Loop de monitoramento a cada 60 segundos
while true; do
    check_and_restart
    sleep 60
done
EOF

chmod +x /app/monitor.sh

# Iniciar o servidor apropriado (produção ou desenvolvimento)
echo "Iniciando servidor..."
cd /app

if [ "$IS_PRODUCTION" = true ]; then
    echo "Usando servidor de produção..."
    node --expose-gc server-prod.js > /var/log/server-prod.log 2>&1 &
    SERVER_PID=$!
else
    echo "Usando JSON Server..."
    # Tentar iniciar usando o server.js original primeiro
    if [ -f "server.js" ]; then
        echo "Tentando iniciar com server.js original..."
        node server.js > /var/log/json-server.log 2>&1 &
        SERVER_PID=$!
        
        # Esperar inicialização
        sleep 5
        
        # Verificar se iniciou
        if ! ps -p $SERVER_PID > /dev/null; then
            echo "Falha ao iniciar com server.js original. Usando json-server padrão..."
            json-server --host 0.0.0.0 --port 3000 --watch db.json --routes routes.json --middlewares ./server-commonjs.js > /var/log/json-server.log 2>&1 &
            SERVER_PID=$!
        else
            echo "Server.js original iniciado com sucesso."
        fi
    else
        # Iniciar com json-server padrão
        json-server --host 0.0.0.0 --port 3000 --watch db.json --routes routes.json --middlewares ./server-commonjs.js > /var/log/json-server.log 2>&1 &
        SERVER_PID=$!
    fi
fi

# Esperar inicialização
sleep 5

# Verificar se o processo está rodando
echo "Servidor PID: $SERVER_PID"
if ps -p $SERVER_PID > /dev/null; then
    echo "Servidor iniciado com sucesso."
else
    echo "ERRO: Servidor falhou ao iniciar. Verificando logs:"
    
    if [ "$IS_PRODUCTION" = true ]; then
        cat /var/log/server-prod.log
        
        # Tentar iniciar em modo fallback
        echo "Tentando iniciar servidor de produção em modo fallback..."
        node server-prod.js > /var/log/server-prod-fallback.log 2>&1 &
        SERVER_PID=$!
    else
        cat /var/log/json-server.log
        
        # Tentar iniciar JSON Server no modo básico como último recurso
        echo "Tentando iniciar JSON Server em modo básico..."
        json-server --host 0.0.0.0 --port 3000 --watch db.json > /var/log/json-server-basic.log 2>&1 &
        SERVER_PID=$!
    fi
    
    sleep 3
    if ps -p $SERVER_PID > /dev/null; then
        echo "Servidor iniciado em modo fallback."
    else
        echo "ERRO CRÍTICO: Todas as tentativas de iniciar o servidor falharam."
        exit 1
    fi
fi

# Salvar o PID para o monitor
echo $SERVER_PID > /tmp/json-server-pid

# Iniciar o monitor em segundo plano
/app/monitor.sh $SERVER_PID $IS_PRODUCTION &
MONITOR_PID=$!
echo "Monitor iniciado com PID: $MONITOR_PID"

# Verificar se o servidor está respondendo
echo "Verificando se o servidor está respondendo..."
curl -v --max-time 10 http://localhost:3000/categories || echo "ERRO: Servidor não está respondendo inicialmente."

# Criar uma rota API de teste para verificação de integridade
cat > /app/api-test-endpoint.json << 'EOF'
{
  "status": "ok",
  "timestamp": "",
  "version": "1.0.0"
}
EOF

# Função para atualizar o timestamp da rota de teste
update_api_test() {
    echo "{\"status\":\"ok\",\"timestamp\":\"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\",\"version\":\"1.0.0\"}" > /app/api-test-endpoint.json
}

# Loop principal - manter script rodando e registrando status
echo "Serviços iniciados. Configurando verificações periódicas..."

while true; do
    # Atualizar endpoint de teste
    update_api_test
    
    # Log de status a cada 5 minutos
    echo "=== Status dos serviços $(date) ==="
    echo "Nginx status:"
    service nginx status || { 
        echo "Nginx não está rodando! Reiniciando..."
        service nginx restart
    }
    
    # Verificar se o monitor ainda está rodando
    if ! ps -p $MONITOR_PID > /dev/null; then
        echo "Monitor não está rodando! Reiniciando..."
        # Obter o PID atual do servidor
        if [ -f "/tmp/json-server-pid" ]; then
            SERVER_PID=$(cat /tmp/json-server-pid)
        fi
        /app/monitor.sh $SERVER_PID $IS_PRODUCTION &
        MONITOR_PID=$!
        echo "Novo monitor iniciado com PID: $MONITOR_PID"
    fi
    
    # Verificar servidor
    echo "Servidor status (PID: $(cat /tmp/json-server-pid)):"
    if ps -p $(cat /tmp/json-server-pid) > /dev/null; then
        echo "Servidor está rodando."
        if [ "$IS_PRODUCTION" = true ]; then
            echo "Últimas linhas do log do servidor de produção:"
            tail -n 10 /var/log/server-prod.log
        else
            echo "Últimas linhas do log do JSON Server:"
            tail -n 10 /var/log/json-server.log
        fi
    else
        echo "ERRO: Servidor não está rodando segundo o PID do arquivo!"
        # O monitor deve capturar e resolver isso, mas vamos verificar
        cat /var/log/api-monitor.log | tail -n 20
    fi
    
    # Verificar resposta do servidor
    RESPONSE=$(curl -s --max-time 5 http://localhost:3000/api-test || echo "FALHA")
    if [ "$RESPONSE" == "FALHA" ]; then
        echo "ERRO: Servidor não está respondendo ao teste de API!"
        echo "Detalhes do monitor:"
        cat /var/log/api-monitor.log | tail -n 20
    else
        echo "API respondendo corretamente: $RESPONSE"
    fi
    
    # Dormir por 5 minutos
    sleep 300
done
