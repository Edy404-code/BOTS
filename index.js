const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require('qrcode-terminal');
const OpenAI = require("openai");

const comandos = require('./comandos');

const openai = new OpenAI({
    apiKey: "Your Openai Api_key // Sua chave api da Openai"
});



// Aqui guarda as conversas para depois nao serem repetidas...

const conversas = new Map();


// Aqui faz o bot aguardar um tempo antes de responder...


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Criamos o cliente para conectar no whatsapp web

const client = new Client({
    authStrategy: new LocalAuth(),

    puppeteer: {
        executablePath: '/snap/bin/chromium',
        headless: true,

        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-gpu'
        ]
    }
});


// Parte que o qr code e gerado para a conexao

client.on('qr', qr => {
    console.log("[BOT] Escaneie o QR Code abaixo:\n");
    qrcode.generate(qr, { small: true });
});



client.on('ready', () => {
    console.log("[BOT] Online com sucesso!");
});



client.on('message_create', msg => {
    console.log(`[MSG] ${msg.from}: ${msg.body}`);
});


client.on('message', async msg => {

    try {

        // aqui o bot ignora as proprias mensagens
        if (msg.fromMe) return;

        const userId = msg.from;
        const texto = msg.body.toLowerCase().trim();


        // Aqui criamos a memoria
 

        if (!conversas.has(userId)) {

            conversas.set(userId, {
                mensagens: [],
                ultimaResposta: "",
                processando: false,
                ultimoTempo: 0
            });
        }

        const userData = conversas.get(userId);

        // Evita com que o bot envie multiplas mensagens --SPAM--


        if (userData.processando) {
            console.log("[ANTI-SPAM] Usuário ja esta sendo atendido");
            return;
        }

        // evita flood
        const agora = Date.now();

        if (agora - userData.ultimoTempo < 2000) {
            console.log("[FLOOD BLOQUEADO]");
            return;
        }

        userData.ultimoTempo = agora;
        userData.processando = true;

        // COMANDOS

        if (texto === 'oi' || texto === 'olá' || texto === 'ola') {

            await delay(3000);

            await comandos.oi(msg);

            userData.processando = false;
            return;
        }

 
        // Aqui salvamos o historico


        userData.mensagens.push({
            role: "user",
            content: msg.body
        });

        // mantém apenas últimas mensagens
        if (userData.mensagens.length > 12) {
            userData.mensagens.shift();
        }

  
        // Aqui fazemos requisicoes a openais


        const resposta = await openai.chat.completions.create({

            model: "gpt-4o-mini",

            temperature: 0.9,

            max_tokens: 300,

            messages: [

                {
                    role: "system",
//Aqui e o campo do prompt onde podes mudar para o estilo do seu negocio...
                    content: `
Você é uma mulher chamada Dra.Silvia Carvalho experiente em vendas e metodos para a saude.

Seu objetivo é conversar naturalmente e convencer o cliente a comprar.

==================================
COMPORTAMENTO
==================================

- Nunca parecer robótica
- Nunca repetir mensagens
- Nunca mandar textos enormes
- Responder curto e natural
- Parecer humana
- Usar poucas frases
- Criar curiosidade
- Gerar desejo
- Levar o cliente até o pagamento
- Sempre continuar a conversa
- Nunca responder igual
- Não usar respostas genéricas
- Não falar como IA
- Ser simpática e envolvente

==================================
PRODUTOS
==================================

Metodo Nigeriano  — 100mt

Benefícios:
- Aumento Peniano
- 100% Natural, facil de produzir
- Aumenta o tempo nas relacoes sexais 
- Elimina a ejaculacao precosse

==================================
FLUXO
==================================

PRIMEIRA RESPOSTA:
- Cumprimente
- Gere curiosidade
- Mostre os produtos
- Pergunte qual deseja

SEGUNDA RESPOSTA:
- Reforce benefícios
- Diga que funciona rápido
- Crie urgência leve
- Mostre confiança

SE CLIENTE QUISER:
Passe pagamento imediatamente.

==================================
PAGAMENTO
==================================

aqui coloca os seus metodos de pagamento

Após pagamento:
Pedir comprovante.


==================================
ESTILO
==================================

- Linguagem simples
- Tom feminino
- Persuasiva
- Natural
- Curta
- Organizada
- Emojis moderados
`
                },

                ...userData.mensagens
            ]
        });



        const textoResposta =
            resposta.choices[0].message.content.trim();

        // faz o bot nao repetir as mensagens
        if (textoResposta === userData.ultimaResposta) {

            console.log("[ANTI-REPETIÇÃO]");

            userData.processando = false;
            return;
        }

        userData.ultimaResposta = textoResposta;

        // comportamento humado delay
        const tempoDelay =
            Math.floor(Math.random() * 2000) + 3000;

        console.log(`[DELAY] ${tempoDelay}ms`);

        await delay(tempoDelay);

        await msg.reply(textoResposta);

        // salva resposta
        userData.mensagens.push({
            role: "assistant",
            content: textoResposta
        });

    } catch (erro) {

        console.log("\n================ ERRO ================\n");
        console.log(erro);

       
        if (erro.code === 'rate_limit_exceeded') {

            console.log("[RATE LIMIT] Esperando...");

            await delay(5000);

            try {
                await msg.reply(
                    "Estou atendendo muitas pessoas agora 😊 aguarde alguns segundos."
                );
            } catch {}
        }

        else {

            try {

                await delay(3000);

                await msg.reply(
                    "Desculpe 😊 ocorreu um pequeno erro, tente novamente."
                );

            } catch {}
        }

    } finally {

        if (conversas.has(msg.from)) {
            conversas.get(msg.from).processando = false;
        }
    }
});


client.initialize();
