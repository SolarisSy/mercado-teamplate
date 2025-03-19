# Documentação do Sistema de Pagamento - Viva Sorte

## 1. Geração de Dados

### 1.1. Dados do Comprador
- Os dados do comprador são armazenados no `localStorage` sob a chave `dadosComprador`
- Estrutura dos dados:
  ```json
  {
    "nome": "Nome do cliente",
    "email": "email@cliente.com",
    "telefone": "99999999999",
    "cpf": "12345678900",
    "quantidade": 10, // Quantidade de bilhetes
    "valorTotal": 29.90 // Valor total em reais
  }
  ```
- Estes dados são coletados em uma etapa anterior e acessados durante o processo de pagamento

### 1.2. Geração do PIX
- A geração do código PIX é realizada através da API Zippify
- Endpoint utilizado: `https://api.zippify.com.br/api/public/v1/transactions`
- Autenticação: Token de API via parâmetro `api_token`
- Payload da requisição:
  ```json
  {
    "amount": 2990, // Valor em centavos
    "offer_hash": "xlsg2f1mhn",
    "payment_method": "pix",
    "customer": {
      "name": "Nome do cliente",
      "document": "12345678900", // CPF
      "email": "email@cliente.com",
      "phone_number": "99999999999"
    },
    "cart": [{
      "product_hash": "z1afbguiqs",
      "title": "Bilhetes Viva Sorte",
      "price": 2990, // Valor em centavos
      "quantity": 1,
      "operation_type": 1,
      "tangible": false,
      "cover": null
    }],
    "installments": 1
  }
  ```
- Resposta da API: contém o QR code e o código PIX para cópia

### 1.3. Armazenamento da Transação
- O hash da transação é armazenado no `localStorage` sob a chave `transactionHash`
- Este hash é utilizado posteriormente para verificar o status do pagamento

## 2. Fluxo de Checkout

### 2.1. Inicialização
- Quando a página de pagamento é carregada, a função `gerarPagamento()` é executada automaticamente
- O sistema verifica se já existe uma transação ativa no `localStorage`
  - Se existir: recupera os dados da transação existente
  - Se não existir: gera uma nova transação PIX

### 2.2. Exibição do QR Code
- O QR Code é gerado utilizando a biblioteca qrcodejs
- O código PIX também é disponibilizado em formato texto para cópia

### 2.3. Temporizador
- Um contador regressivo de 15 minutos é exibido
- Feedback visual sobre o tempo restante para o pagamento
- Após o término do tempo, o usuário é notificado para reiniciar o processo

### 2.4. Verificação Manual
- O usuário pode acionar manualmente a verificação do pagamento através do botão "Conferir Bilhetes"
- Esta ação verifica o status atual da transação na API Zippify
- Se o pagamento estiver pendente, exibe um modal informativo
- Se o pagamento estiver confirmado, redireciona para a página de bilhetes

### 2.5. Promoção (Apenas no segundo arquivo)
- Exibe um popup de promoção oferecendo bilhetes adicionais
- O usuário pode aceitar (aumentando a quantidade e valor) ou rejeitar a oferta
- Após a decisão, o sistema procede para a geração do pagamento

## 3. Notificações Instantâneas

### 3.1. Verificação Automática
- Função `verificarStatusPagamento()` consulta periodicamente a API para verificar o status do pagamento
- Polling a cada 5 segundos para atualização do status
- Endpoint utilizado: `https://api.zippify.com.br/api/public/v1/transactions/{hash}?api_token={token}`

### 3.2. Estados do Pagamento
- **Pendente (`pending`)**: continua verificando periodicamente
- **Pago (`paid`)**: redireciona automaticamente para a página de bilhetes
- **Outros estados**: registra no console e mantém o usuário na página de pagamento

### 3.3. Feedback Visual
- Modal informativo quando o pagamento ainda está pendente
- Redirecionamento automático quando o pagamento é confirmado
- Mensagens de erro em caso de falha na comunicação com a API

## 4. Funcionamento Geral

### 4.1. Interação Front-end/Back-end
- **Front-end**: Interface de pagamento com QR Code e instruções
- **Back-end**: API Zippify para geração e verificação de pagamentos PIX
- Comunicação via requisições HTTP (fetch API)
- Autenticação através de token API

### 4.2. Fluxo de Dados
1. Recuperação dos dados do comprador do `localStorage`
2. Geração da transação PIX via API
3. Armazenamento do hash da transação no `localStorage`
4. Exibição do QR Code e código PIX
5. Verificação periódica do status do pagamento
6. Redirecionamento após confirmação bem-sucedida

### 4.3. Segurança
- Token de API exposto no código client-side (ponto crítico)
- Dados sensíveis do cliente (CPF, email, telefone) são transmitidos diretamente do front-end
- Ausência de validação dos dados no front-end antes do envio

### 4.4. Persistência de Dados
- Utilização de `localStorage` para armazenar dados entre sessões
- Limpeza do hash da transação ao retornar para a página anterior (listener `beforeunload`)

## 5. Pontos Críticos e Recomendações

### 5.1. Segurança
- **Crítico**: Token de API exposto no cliente
  - Recomendação: Implementar um proxy server para intermediar as requisições à API Zippify
- **Crítico**: Dados sensíveis transmitidos diretamente do front-end
  - Recomendação: Validar e processar dados no back-end

### 5.2. Usabilidade
- Implementar feedback visual durante o carregamento (spinners, etc.)
- Melhorar mensagens de erro para orientar o usuário em caso de falhas

### 5.3. Robustez
- Implementar tratamento de erros mais abrangente
- Adicionar retry automático em caso de falha na comunicação com a API

### 5.4. Arquitetura
- Migrar a lógica de pagamento para o back-end
- Implementar armazenamento seguro de dados da transação no servidor
- Considerar webhooks para notificações de pagamento ao invés de polling

### 5.5. Compatibilidade
- Garantir funcionamento em diferentes navegadores e dispositivos
- Implementar fallbacks para bibliotecas externas (qrcodejs) 