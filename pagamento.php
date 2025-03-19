<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pagamento PIX - Viva Sorte</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs/qrcode.min.js"></script>

    <style>
        :root {
            --primary-color: #2f4eb5;
            --secondary-color: #00bf63;
            --background-color: #f7f9ff;
            --card-background: #ffffff;
            --text-color: #333;
            --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--background-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
        }

        .container-main {
            padding: 30px;
            max-width: 500px;
            margin: 40px auto;
            background: var(--card-background);
            border-radius: 12px;
            box-shadow: var(--shadow);
            text-align: center;
        }

        .qr-code {
            margin: 20px auto;
            display: flex;
            justify-content: center;
        }

        input#pix-code {
            width: 100%;
            margin-top: 15px;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #ddd;
            font-size: 16px;
            text-align: center;
            transition: border-color 0.3s ease;
        }

        input#pix-code:focus {
            border-color: var(--primary-color);
            outline: none;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.3s ease;
        }

        .btn-primary:hover {
            background-color: #203a88;
            transform: translateY(-2px);
        }

        .dados-pessoais {
            text-align: left;
            padding: 20px;
            background-color: var(--card-background);
            border-radius: 8px;
            margin-top: 20px;
            border: 1px solid #e0e4f1;
            box-shadow: var(--shadow);
        }

        .dados-pessoais h4 {
            font-size: 18px;
            color: var(--primary-color);
            margin-bottom: 15px;
        }

        .dados-pessoais p {
            margin: 10px 0;
            font-size: 14px;
        }

        .contador {
            font-size: 20px;
            color: #e63946;
            margin: 20px 0;
            font-weight: bold;
        }

        .logo {
            text-align: center;
            margin-bottom: 20px;
        }

        .logo img {
            max-width: 200px;
            transition: transform 0.3s ease;
            margin-top: 19px;
        }

        .logo img:hover {
            transform: scale(1.05);
        }

        .rodape {
            text-align: center;
            padding: 20px;
            background-color: var(--card-background);
            border-top: 1px solid #e0e4f1;
            margin-top: 40px;
        }

        .redes {
            margin-top: 15px;
        }

        .redes i {
            font-size: 24px;
            margin: 0 10px;
            color: var(--primary-color);
            cursor: pointer;
            transition: color 0.3s ease, transform 0.3s ease;
        }

        .redes i:hover {
            color: #203a88;
            transform: translateY(-2px);
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .modal-content {
            background-color: var(--card-background);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: var(--shadow);
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .modal-content button {
            margin-top: 15px;
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            background-color: var(--primary-color);
            color: white;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.3s ease;
        }

        .modal-content button:hover {
            background-color: #203a88;
            transform: translateY(-2px);
        }
        .container-main {
    max-width: 1200px; /* Largura máxima do container */
    margin: 0 auto; /* Centraliza o container na página */
    padding: 20px; /* Espaçamento interno */
}

.banner-space {
    margin-top: 20px; /* Espaçamento acima do banner */
    width: 100%; /* Ocupa 100% da largura do container */
    overflow: hidden; /* Garante que a imagem não ultrapasse o container */
    position: relative; /* Para posicionamento relativo */
}

.banner-space img {
    width: 100%; /* A imagem ocupa 100% da largura do container */
    height: auto; /* Altura automática para manter a proporção */
    display: block; /* Remove espaços indesejados abaixo da imagem */
}
    </style>
</head>
<body>
<header class="white-header">
    <div class="logo">
        <img src="images/logoviva.png" alt="Logomarca" class="logoviva">
    </div>
</header>
<div class="banner-space">
        <img src="images/bannernv2.jpg" alt="Banner Promocional">
    </div>
<div class="container-main">
    <h2>Seu Prêmio está a um passo!</h2>

    <h4>Efetue o pagamento PIX:</h4>

    <div id="qr-code" class="qr-code"></div>
    <p><strong>TOTAL</strong> <span id="valor"></span></p>

    <input type="text" id="pix-code" readonly>
    <p>Copie o código acima ou escaneie o QR Code com seu app bancário para pagar.</p>
    <div class="contador">Tempo restante: <span id="tempo">15:00</span></div>
    <button class="btn-primary" onclick="verificarPagamentoManual()">Conferir Bilhetes</button>
    <div class="dados-pessoais">
        <h4>Confira seus dados:</h4>
        <p><strong>Nome:</strong> <span id="nome"></span></p>
        <p><strong>Email:</strong> <span id="email"></span></p>
        <p><strong>Telefone:</strong> <span id="telefone"></span></p>
        <p><strong>Bilhetes adquiridos:</strong> <span id="bilhetes"></span></p>
        <p><strong>Bilhetes extras:</strong> <span id="extras"></span></p>
    </div>
</div>

<footer class="rodape">
    <div class="container-principal">
        <div class="redes">
            <i class="fab fa-instagram"></i>
            <i class="fab fa-facebook"></i>
            <i class="fab fa-twitter"></i>
            <i class="fab fa-youtube"></i>
        </div>
        <p>Sorteios lastreados por Títulos de Capitalização, da Modalidade Incentivo, emitidos pela VIA Capitalização S.A. O valor das premiações indicadas são líquidos. Registro SUSEP Sorteio n° 15414.652257/2023-51.</p>
    </div>
</footer>

<!-- Modal para pagamento pendente -->
<div class="modal" id="modal-pagamento-pendente">
    <div class="modal-content">
        <h3>Aguarde...</h3>
        <p>O pagamento ainda não foi confirmado. Aguarde até que a transação seja compensada para verificar os seus Bilhetes.</p>
        <button onclick="fecharModal()">Fechar</button>
    </div>
</div>

<script>
// Função para limpar o localStorage se o usuário voltar para a página anterior
window.addEventListener('beforeunload', function(event) {
    if (document.referrer && document.referrer.includes('pagina-anterior.html')) {
        localStorage.removeItem('transactionHash');
    }
});

const dados = JSON.parse(localStorage.getItem('dadosComprador'));
let bilhetesExtras = 0;

// Função para iniciar o contador
function iniciarContador() {
    let tempoRestante = 900; // 15 minutos em segundos
    const contadorElemento = document.getElementById('tempo');

    const intervalo = setInterval(() => {
        const minutos = Math.floor(tempoRestante / 60);
        const segundos = tempoRestante % 60;
        contadorElemento.textContent = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;

        if (tempoRestante <= 0) {
            clearInterval(intervalo);
            alert("Tempo esgotado! Por favor, reinicie o processo de pagamento.");
        } else {
            tempoRestante--;
        }
    }, 1000);
}

// Função para exibir o modal de pagamento pendente
function exibirModalPagamentoPendente() {
    const modal = document.getElementById('modal-pagamento-pendente');
    modal.style.display = 'flex';
}

// Função para fechar o modal
function fecharModal() {
    const modal = document.getElementById('modal-pagamento-pendente');
    modal.style.display = 'none';
}

// Função para consultar o status da transação
async function verificarStatusPagamento(transactionHash) {
    try {
        const response = await fetch(`https://api.zippify.com.br/api/public/v1/transactions/${transactionHash}?api_token=221lAClXA7r1263fotxCOFSm3PjbZYv7cB2ZYLzutou34jsTE1GRCOqQ0Mp8`);
        const data = await response.json();

        if (data.payment_status === "paid") {
            // Pagamento confirmado, redireciona para a página desejada
            window.location.href = "bilhetes.php"; // Substitua pela URL desejada
        } else if (data.payment_status === "pending") {
            // Pagamento ainda pendente, verifica novamente após 5 segundos
            setTimeout(() => verificarStatusPagamento(transactionHash), 5000);
        } else {
            console.log("Status do pagamento:", data.payment_status);
        }
    } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error);
    }
}

// Função para verificar o pagamento manualmente (botão "Já Paguei")
async function verificarPagamentoManual() {
    const transactionHash = localStorage.getItem('transactionHash');
    if (!transactionHash) {
        alert("Nenhuma transação encontrada. Gere um novo PIX.");
        return;
    }

    try {
        const response = await fetch(`https://api.zippify.com.br/api/public/v1/transactions/${transactionHash}?api_token=221lAClXA7r1263fotxCOFSm3PjbZYv7cB2ZYLzutou34jsTE1GRCOqQ0Mp8`);
        const data = await response.json();

        if (data.payment_status === "paid") {
            // Pagamento confirmado, redireciona para a página desejada
            window.location.href = "bilhetes.php";
        } else {
            // Pagamento ainda pendente, exibe o modal
            exibirModalPagamentoPendente();
        }
    } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error);
        alert("Erro ao verificar o pagamento. Tente novamente.");
    }
}

async function gerarPix(total) {
    const amountInCents = Math.round(total * 100);

    const requestBody = {
        amount: amountInCents,
        offer_hash: "xlsg2f1mhn",
        payment_method: "pix",
        customer: {
            name: dados.nome,
            document: dados.cpf,
            email: dados.email,
            phone_number: dados.telefone
        },
        cart: [{
            product_hash: "z1afbguiqs",
            title: "Bilhetes Viva Sorte",
            price: amountInCents,
            quantity: 1,
            operation_type: 1,
            tangible: false,
            cover: null
        }],
        installments: 1
    };

    try {
        const response = await fetch(`https://api.zippify.com.br/api/public/v1/transactions?api_token=221lAClXA7r1263fotxCOFSm3PjbZYv7cB2ZYLzutou34jsTE1GRCOqQ0Mp8`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // Verifica se a resposta contém o QR Code
        if (!data || !data.pix || !data.pix.pix_qr_code) {
            console.error("Resposta da API:", data); // Log da resposta da API para depuração
            throw new Error("Resposta da API inválida. Não foi possível gerar o QR Code.");
        }

        // Armazena o hash da transação no localStorage
        localStorage.setItem('transactionHash', data.hash);

        return { qrCodeString: data.pix.pix_qr_code, copyPasteCode: data.pix.pix_qr_code };
    } catch (error) {
        console.error("Erro ao gerar QR Code PIX:", error);
        alert("Erro ao gerar QR Code PIX: " + error.message);
        throw error;
    }
}

async function gerarPagamento() {
    try {
        // Verifica se já existe uma transação ativa
        let transactionHash = localStorage.getItem('transactionHash');
        let pagamento;

        if (!transactionHash) {
            // Gera uma nova transação
            pagamento = await gerarPix(dados.valorTotal);
            transactionHash = localStorage.getItem('transactionHash');
        } else {
            // Usa a transação existente
            const response = await fetch(`https://api.zippify.com.br/api/public/v1/transactions/${transactionHash}?api_token=221lAClXA7r1263fotxCOFSm3PjbZYv7cB2ZYLzutou34jsTE1GRCOqQ0Mp8`);
            const data = await response.json();

            if (data.payment_status === "paid") {
                // Se o pagamento já foi confirmado, redireciona imediatamente
                window.location.href = "bilhetes.php";
                return;
            }

            pagamento = { qrCodeString: data.pix.pix_qr_code, copyPasteCode: data.pix.pix_qr_code };
        }

        // Renderiza o QR Code
        new QRCode(document.getElementById('qr-code'), {
            text: pagamento.qrCodeString,
            width: 200,
            height: 200
        });
        document.getElementById('pix-code').value = pagamento.copyPasteCode;

        // Preenche os dados do usuário
        document.getElementById('nome').innerText = dados.nome;
        document.getElementById('email').innerText = dados.email;
        document.getElementById('telefone').innerText = dados.telefone;
        document.getElementById('bilhetes').innerText = dados.quantidade - bilhetesExtras;
        document.getElementById('extras').innerText = bilhetesExtras;
        document.getElementById('valor').innerText = parseFloat(dados.valorTotal).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        iniciarContador(); // Inicia o contador
        verificarStatusPagamento(transactionHash); // Inicia a verificação do status do pagamento
    } catch (error) {
        console.log(error);
        alert('Erro ao gerar pagamento PIX: ' + error.message);
    }
}

window.onload = gerarPagamento; // Gera o pagamento ao carregar a página
</script>

</body>
</html>