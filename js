const URL_BASE = "[rickandmortyapi.com](https://rickandmortyapi.com/api/character)";

const listaPersonagens = document.querySelector("#lista-personagens");
const mensagemStatus = document.querySelector("#mensagem-status");
const formulario = document.querySelector("#form-busca");
const campoBusca = document.querySelector("#busca");
const campoStatus = document.querySelector("#status");
const botaoLimpar = document.querySelector("#limpar");
const botaoAnterior = document.querySelector("#anterior");
const botaoProxima = document.querySelector("#proxima");
const informacaoPagina = document.querySelector("#informacao-pagina");

let paginaAtual = 1;
let totalPaginas = 1;
let nomePesquisado = "";
let statusPesquisado = "";

function traduzirStatus(status) {
    const traducoes = {
        Alive: "Vivo",
        Dead: "Morto",
        unknown: "Desconhecido"
    };

    return traducoes[status] || status;
}

function traduzirGenero(genero) {
    const traducoes = {
        Female: "Feminino",
        Male: "Masculino",
        Genderless: "Sem gênero",
        unknown: "Desconhecido"
    };

    return traducoes[genero] || genero;
}

function obterClasseStatus(status) {
    if (status === "Alive") {
        return "vivo";
    }

    if (status === "Dead") {
        return "morto";
    }

    return "desconhecido";
}

function criarParagrafoInformacao(rotulo, valor) {
    const paragrafo = document.createElement("p");
    const destaque = document.createElement("strong");

    destaque.textContent = `${rotulo}: `;
    paragrafo.appendChild(destaque);
    paragrafo.append(valor || "Não informado");

    return paragrafo;
}

function criarCard(personagem) {
    const card = document.createElement("article");
    card.classList.add("card");

    const imagem = document.createElement("img");
    imagem.classList.add("card-imagem");
    imagem.src = personagem.image;
    imagem.alt = `Imagem do personagem ${personagem.name}`;
    imagem.loading = "lazy";

    const conteudo = document.createElement("div");
    conteudo.classList.add("card-conteudo");

    const nome = document.createElement("h3");
    nome.textContent = personagem.name;

    const status = document.createElement("p");
    status.classList.add("card-status");

    const indicadorStatus = document.createElement("span");
    indicadorStatus.classList.add(
        "indicador-status",
        obterClasseStatus(personagem.status)
    );

    indicadorStatus.setAttribute("aria-hidden", "true");

    const textoStatus = document.createElement("span");
    textoStatus.textContent =
        `${traduzirStatus(personagem.status)} - ${personagem.species}`;

    status.appendChild(indicadorStatus);
    status.appendChild(textoStatus);

    const informacoes = document.createElement("div");
    informacoes.classList.add("card-informacoes");

    const genero = criarParagrafoInformacao(
        "Gênero",
        traduzirGenero(personagem.gender)
    );

    const origem = criarParagrafoInformacao(
        "Origem",
        personagem.origin.name
    );

    const localizacao = criarParagrafoInformacao(
        "Última localização",
        personagem.location.name
    );

    informacoes.appendChild(genero);
    informacoes.appendChild(origem);
    informacoes.appendChild(localizacao);

    conteudo.appendChild(nome);
    conteudo.appendChild(status);
    conteudo.appendChild(informacoes);

    card.appendChild(imagem);
    card.appendChild(conteudo);

    return card;
}

function exibirPersonagens(personagens) {
    listaPersonagens.replaceChildren();

    const fragmento = document.createDocumentFragment();

    personagens.forEach((personagem) => {
        const card = criarCard(personagem);
        fragmento.appendChild(card);
    });

    listaPersonagens.appendChild(fragmento);
}

function atualizarPaginacao(info) {
    totalPaginas = info.pages;

    informacaoPagina.textContent =
        `Página ${paginaAtual} de ${totalPaginas}`;

    botaoAnterior.disabled = !info.prev;
    botaoProxima.disabled = !info.next;
}

function montarURL() {
    const parametros = new URLSearchParams();

    parametros.set("page", paginaAtual);

    if (nomePesquisado) {
        parametros.set("name", nomePesquisado);
    }

    if (statusPesquisado) {
        parametros.set("status", statusPesquisado);
    }

    return `${URL_BASE}?${parametros.toString()}`;
}

function carregarPersonagens() {
    mensagemStatus.textContent = "Carregando personagens...";
    mensagemStatus.classList.remove("erro");

    listaPersonagens.replaceChildren();
    botaoAnterior.disabled = true;
    botaoProxima.disabled = true;

    fetch(montarURL())
        .then((resposta) => {
            if (!resposta.ok) {
                throw new Error("Nenhum personagem foi encontrado.");
            }

            return resposta.json();
        })
        .then((dados) => {
            exibirPersonagens(dados.results);
            atualizarPaginacao(dados.info);

            mensagemStatus.textContent =
                `${dados.info.count} personagem(ns) encontrado(s).`;
        })
        .catch((erro) => {
            listaPersonagens.replaceChildren();

            mensagemStatus.textContent =
                erro.message || "Não foi possível acessar a API.";

            mensagemStatus.classList.add("erro");
            informacaoPagina.textContent = "Nenhum resultado";
            botaoAnterior.disabled = true;
            botaoProxima.disabled = true;
        });
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    nomePesquisado = campoBusca.value.trim();
    statusPesquisado = campoStatus.value;
    paginaAtual = 1;

    carregarPersonagens();
});

botaoLimpar.addEventListener("click", () => {
    formulario.reset();

    nomePesquisado = "";
    statusPesquisado = "";
    paginaAtual = 1;

    carregarPersonagens();
});

botaoAnterior.addEventListener("click", () => {
    if (paginaAtual > 1) {
        paginaAtual -= 1;
        carregarPersonagens();

        document
            .querySelector("#personagens")
            .scrollIntoView({ behavior: "smooth" });
    }
});

botaoProxima.addEventListener("click", () => {
    if (paginaAtual < totalPaginas) {
        paginaAtual += 1;
        carregarPersonagens();

        document
            .querySelector("#personagens")
            .scrollIntoView({ behavior: "smooth" });
    }
});

document.querySelector("#ano").textContent = new Date().getFullYear();

carregarPersonagens();
