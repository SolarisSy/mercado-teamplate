#!/usr/bin/env bash
# Caso falhe, tente: #!/bin/sh

# Detectar shell disponível
if [ -z "$BASH_VERSION" ]; then
  echo "Aviso: Este script foi projetado para Bash. Usando modo de compatibilidade com sh."
  USING_SH=true
else
  USING_SH=false
fi

# Função de log
log() {
  echo "[$(date)] - $1"
}

log "Iniciando script de inicialização..."

# Verificar e instalar dependências necessárias
install_deps() {
  log "Verificando dependências necessárias..."
  
  # Lista de pacotes npm para verificar (compatível com sh)
  npm_packages="express cors morgan lowdb json-server"
  missing_packages=""
  
  for pkg in $npm_packages; do
    if ! npm list --depth=0 "$pkg" >/dev/null 2>&1; then
      log "Dependência não encontrada: $pkg"
      missing_packages="$missing_packages $pkg"
    fi
  done
  
  # Instalar pacotes faltantes
  if [ -n "$missing_packages" ]; then
    log "Instalando dependências faltantes:$missing_packages"
    npm install --no-save $missing_packages || {
      log "AVISO: Falha ao instalar via npm. Tentando globalmente..."
      npm install -g $missing_packages || {
        log "ERRO: Falha ao instalar dependências. Tentando continuar mesmo assim."
      }
    }
  fi
  
  # Instalar utilitários do sistema se necessário
  if ! command -v bc &> /dev/null; then
    log "Instalando bc..."
    apt-get update && apt-get install -y bc || log "AVISO: Falha ao instalar bc"
  fi
}

# Configurar o Nginx para servir os arquivos estáticos do frontend
configure_nginx() {
  log "Configurando Nginx..."
  
  mkdir -p /etc/nginx/sites-available/
  
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
  service nginx start || {
    log "ERRO: Falha ao iniciar Nginx. Tentando continuar sem ele..."
  }
}

# Verificar se os arquivos necessários existem ou criar versões padrão
check_required_files() {
  log "Verificando arquivos necessários..."
  
  # Verificar a localização atual
  log "Diretório atual: $(pwd)"
  log "Conteúdo do diretório:"
  ls -la
  
  # Criar diretórios necessários
  mkdir -p logs

  # Verificar se o arquivo db.json existe
  if [ ! -f "db.json" ]; then
    log "AVISO: db.json não encontrado. Criando versão básica..."
    cat > db.json << 'EOF'
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
  if [ ! -f "routes.json" ]; then
    log "AVISO: routes.json não encontrado. Criando versão básica..."
    cat > routes.json << 'EOF'
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

  # Verificar se server-prod.js existe
  if [ ! -f "server-prod.js" ]; then
    log "AVISO: server-prod.js não encontrado. Tentando continuar sem ele..."
  fi
}

# Iniciar o monitor para o servidor
start_monitor() {
  local SERVER_PID=$1
  local IS_PRODUCTION=$2
  
  log "Iniciando script de monitoramento..."
  
  # Criar script de monitoramento compatível com sh
  cat > monitor.sh << 'EOF'
#!/bin/sh

LOG_FILE="logs/api-monitor.log"
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
    
    if [ "$(echo "$MEMORY_USAGE > $MAX_MEMORY_MB" | bc -l)" = "1" ]; then
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
    
    if [ "$IS_PRODUCTION" = "true" ]; then
        echo "$(date) - Iniciando servidor de produção..." >> $LOG_FILE
        # Usar o novo servidor de produção
        node server-prod.js > logs/server-prod.log 2>&1 &
        JSON_SERVER_PID=$!
        echo "$(date) - Novo servidor de produção PID: $JSON_SERVER_PID" >> $LOG_FILE
    else
        echo "$(date) - Iniciando JSON Server..." >> $LOG_FILE
        # Usar o JSON Server original
        json-server --host 0.0.0.0 --port 3000 --watch db.json --routes routes.json > logs/json-server.log 2>&1 &
        JSON_SERVER_PID=$!
        echo "$(date) - Novo JSON Server PID: $JSON_SERVER_PID" >> $LOG_FILE
    fi
    
    # Aguardar inicialização
    sleep 5
    
    # Verificar se iniciou corretamente
    if ! ps -p $JSON_SERVER_PID > /dev/null; then
        echo "$(date) - Falha ao iniciar o servidor. Tentando modo simples..." >> $LOG_FILE
        
        if [ "$IS_PRODUCTION" = "true" ]; then
            # Tentar com json-server
            json-server --host 0.0.0.0 --port 3000 --watch db.json > logs/json-server-fallback.log 2>&1 &
            JSON_SERVER_PID=$!
            echo "$(date) - Novo JSON Server PID (fallback): $JSON_SERVER_PID" >> $LOG_FILE
        else
            # Tentar iniciar JSON Server no modo simples
            json-server --host 0.0.0.0 --port 3000 --watch db.json > logs/json-server-basic.log 2>&1 &
            JSON_SERVER_PID=$!
            echo "$(date) - Novo JSON Server PID (modo simples): $JSON_SERVER_PID" >> $LOG_FILE
        fi
    fi
    
    # Exportar o novo PID para o script principal
    echo $JSON_SERVER_PID > server-pid
}

mkdir -p logs

# Loop de monitoramento a cada 60 segundos
while true; do
    check_and_restart
    sleep 60
done
EOF

  chmod +x monitor.sh
  
  # Iniciar o monitor em segundo plano
  ./monitor.sh $SERVER_PID $IS_PRODUCTION &
  MONITOR_PID=$!
  log "Monitor iniciado com PID: $MONITOR_PID"
  
  # Salvar o PID do monitor
  echo $MONITOR_PID > monitor-pid
}

# Função principal
main() {
  log "Iniciando sistema..."
  
  # Verificar e instalar dependências
  install_deps
  
  # Configurar Nginx
  configure_nginx
  
  # Verificar arquivos necessários
  check_required_files
  
  # Determinar se estamos em ambiente de produção
  NODE_ENV=${NODE_ENV:-development}
  IS_PRODUCTION=false
  
  if [ "$NODE_ENV" = "production" ]; then
    IS_PRODUCTION=true
  else
    # Verificar o tamanho do db.json para decidir se devemos usar o servidor de produção
    if [ -f "db.json" ]; then
      DB_SIZE=$(stat -c%s "db.json" 2>/dev/null || stat -f%z "db.json" 2>/dev/null || echo "0")
      if [ -n "$DB_SIZE" ] && [ "$DB_SIZE" -gt 5000000 ]; then # 5MB
        log "Arquivo db.json grande (${DB_SIZE} bytes), usando servidor de produção para melhor performance."
        IS_PRODUCTION=true
      fi
    fi
  fi
  
  # Tentar iniciar o servidor apropriado
  log "Iniciando servidor..."
  SERVER_PID=""
  
  if [ "$IS_PRODUCTION" = true ] && [ -f "server-prod.js" ]; then
    log "Usando servidor de produção..."
    node server-prod.js > logs/server-prod.log 2>&1 &
    SERVER_PID=$!
    
    # Verificar se iniciou
    sleep 5
    if ! ps -p $SERVER_PID > /dev/null; then
      log "ERRO: Falha ao iniciar servidor de produção. Tentando JSON Server..."
      IS_PRODUCTION=false
    else
      log "Servidor de produção iniciado com sucesso. PID: $SERVER_PID"
    fi
  fi
  
  # Se não estamos usando servidor de produção ou ele falhou, usar JSON Server
  if [ "$IS_PRODUCTION" = false ] || [ -z "$SERVER_PID" ] || ! ps -p $SERVER_PID > /dev/null; then
    log "Usando JSON Server..."
    
    # Tentar iniciar server.js original
    if [ -f "server.js" ]; then
      log "Tentando iniciar com server.js original..."
      node server.js > logs/server.log 2>&1 &
      SERVER_PID=$!
      
      # Verificar se iniciou
      sleep 5
      if ! ps -p $SERVER_PID > /dev/null; then
        log "ERRO: Falha ao iniciar com server.js. Tentando JSON Server diretamente..."
      else
        log "server.js iniciado com sucesso. PID: $SERVER_PID"
      fi
    fi
    
    # Se server.js falhou ou não existe, usar JSON Server diretamente
    if [ -z "$SERVER_PID" ] || ! ps -p $SERVER_PID > /dev/null; then
      log "Iniciando JSON Server diretamente..."
      json-server --host 0.0.0.0 --port 3000 --watch db.json --routes routes.json > logs/json-server.log 2>&1 &
      SERVER_PID=$!
      
      # Verificar se iniciou
      sleep 5
      if ! ps -p $SERVER_PID > /dev/null; then
        log "ERRO: Falha ao iniciar JSON Server com configurações completas. Tentando modo básico..."
        json-server --host 0.0.0.0 --port 3000 --watch db.json > logs/json-server-basic.log 2>&1 &
        SERVER_PID=$!
        
        sleep 5
        if ! ps -p $SERVER_PID > /dev/null; then
          log "ERRO CRÍTICO: Todas as tentativas de iniciar o servidor falharam."
          exit 1
        else
          log "JSON Server iniciado em modo básico. PID: $SERVER_PID"
        fi
      else
        log "JSON Server iniciado com sucesso. PID: $SERVER_PID"
      fi
    fi
  fi
  
  # Salvar o PID do servidor
  echo $SERVER_PID > server-pid
  
  # Iniciar o monitor
  start_monitor $SERVER_PID $IS_PRODUCTION
  
  # Criar uma rota API de teste para verificação de integridade
  log "Criando endpoint de teste..."
  mkdir -p public
  echo "{\"status\":\"ok\",\"timestamp\":\"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\",\"version\":\"1.0.0\"}" > public/api-test.json
  
  # Verificar se o servidor está respondendo
  log "Verificando se o servidor está respondendo..."
  curl -s --max-time 10 http://localhost:3000/categories || log "AVISO: Servidor não está respondendo inicialmente."
  
  # Loop principal - manter script rodando e registrando status
  log "Serviços iniciados. Configurando verificações periódicas..."
  
  # Função para atualizar o timestamp da rota de teste
  update_api_test() {
    mkdir -p public
    echo "{\"status\":\"ok\",\"timestamp\":\"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\",\"version\":\"1.0.0\"}" > public/api-test.json
  }
  
  while true; do
    # Atualizar endpoint de teste
    update_api_test
    
    # Log de status a cada 5 minutos
    log "=== Status dos serviços $(date) ==="
    
    # Verificar Nginx
    log "Nginx status:"
    service nginx status || { 
      log "AVISO: Nginx não está rodando. Tentando reiniciar..."
      service nginx restart
    }
    
    # Verificar se o monitor ainda está rodando
    MONITOR_PID=$(cat monitor-pid 2>/dev/null || echo "")
    if [ -n "$MONITOR_PID" ] && ! ps -p $MONITOR_PID > /dev/null; then
      log "AVISO: Monitor não está rodando! Reiniciando..."
      # Obter o PID atual do servidor
      SERVER_PID=$(cat server-pid 2>/dev/null || echo "")
      if [ -n "$SERVER_PID" ]; then
        start_monitor $SERVER_PID $IS_PRODUCTION
      else
        log "ERRO: Não foi possível encontrar o PID do servidor para reiniciar o monitor"
      fi
    fi
    
    # Verificar servidor
    SERVER_PID=$(cat server-pid 2>/dev/null || echo "")
    if [ -n "$SERVER_PID" ]; then
      log "Servidor status (PID: $SERVER_PID):"
      if ps -p $SERVER_PID > /dev/null; then
        log "Servidor está rodando."
        
        # Exibir logs apropriados
        if [ "$IS_PRODUCTION" = true ]; then
          log "Últimas linhas do log do servidor de produção:"
          tail -n 10 logs/server-prod.log 2>/dev/null || log "Não foi possível ler o log"
        else
          log "Últimas linhas do log do JSON Server:"
          tail -n 10 logs/json-server.log 2>/dev/null || tail -n 10 logs/server.log 2>/dev/null || log "Não foi possível ler o log"
        fi
      else
        log "AVISO: Servidor não está rodando segundo o PID do arquivo!"
        log "Detalhes do monitor:"
        tail -n 20 logs/api-monitor.log 2>/dev/null || log "Não foi possível ler o log do monitor"
      fi
    else
      log "ERRO: Não foi possível encontrar o PID do servidor"
    fi
    
    # Verificar resposta do servidor
    RESPONSE=$(curl -s --max-time 5 http://localhost:3000/api-test 2>/dev/null || echo "FALHA")
    if [ "$RESPONSE" = "FALHA" ]; then
      log "AVISO: Servidor não está respondendo ao teste de API!"
      log "Detalhes do monitor:"
      tail -n 20 logs/api-monitor.log 2>/dev/null || log "Não foi possível ler o log do monitor"
    else
      log "API respondendo: $RESPONSE"
    fi
    
    # Dormir por 5 minutos
    sleep 300
  done
}

# Execução começa aqui
mkdir -p logs
main > logs/startup.log 2>&1
