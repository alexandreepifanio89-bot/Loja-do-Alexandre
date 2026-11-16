const produtos = [
    {
        id: "fone",
        nome: "Fone de ouvido",
        descricao: "Sem fio, bateria de até 20 horas.",
        preco: 149.9,
        imagem: "img/fone.png.png"
    },
    {
        id: "relogio",
        nome: "Relógio de pulso",
        descricao: "Relógio com caixa de metal à prova d'água.",
        preco: 399,
        imagem: "img/relogio.png.png"
    },
    {
        id: "mochila",
        nome: "Mochila",
        descricao: "Mochila em couro sintético com 14 litros de capacidade.",
        preco: 169.9,
        imagem: "img/mochila.png.png"
    },
    {
        id: "tenis",
        nome: "Tênis de corrida",
        descricao: "Tênis leve e confortável, feito em tecido.",
        preco: 169.9,
        imagem: "img/tenis.png.jpg"
    },
    {
        id: "fire-tv",
        nome: "Fire TV Stick",
        descricao: "Transforme sua TV em smart com comando de voz.",
        preco: 169.9,
        imagem: "img/fire.png.png"
    },
    {
        id: "violao",
        nome: "Violão",
        descricao: "Violão acústico eletrificado com encordoamento de aço.",
        preco: 169.9,
        imagem: "img/violao.png.png"
    }
];

const chaveCarrinho = "loja-do-alexandre-carrinho";
const moeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

function lerCarrinho() {
    const salvo = localStorage.getItem(chaveCarrinho);
    if (!salvo) return {};

    try {
        const carrinho = JSON.parse(salvo);
        if (!carrinho || typeof carrinho !== "object" || Array.isArray(carrinho)) {
            throw new Error("Formato de carrinho inválido.");
        }
        return carrinho;
    } catch (erro) {
        console.error("Não foi possível ler os itens salvos no carrinho.", erro);
        return {};
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(chaveCarrinho, JSON.stringify(carrinho));
}

function quantidadeTotal(carrinho) {
    return Object.values(carrinho).reduce((total, quantidade) => {
        return total + (Number.isInteger(quantidade) && quantidade > 0 ? quantidade : 0);
    }, 0);
}

function atualizarContadores(carrinho) {
    document.querySelectorAll("[data-cart-count]").forEach((contador) => {
        contador.textContent = quantidadeTotal(carrinho);
    });
}

function renderizarProdutos() {
    const vitrine = document.querySelector("[data-products]");
    if (!vitrine) return;

    vitrine.innerHTML = produtos.map((produto) => `
        <article class="produto">
            <div class="foto">
                <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
            </div>
            <h2>${produto.nome}</h2>
            <p class="descricao">${produto.descricao}</p>
            <p class="preco">${moeda.format(produto.preco)}</p>
            <button class="botao" type="button" data-add-to-cart="${produto.id}">
                Adicionar ao carrinho
            </button>
        </article>
    `).join("");
}

function renderizarCarrinho(carrinho) {
    const lista = document.querySelector("[data-cart-items]");
    const resumo = document.querySelector("[data-cart-summary]");
    if (!lista || !resumo) return;

    const itens = produtos.filter((produto) => {
        return Number.isInteger(carrinho[produto.id]) && carrinho[produto.id] > 0;
    });

    if (itens.length === 0) {
        lista.innerHTML = `
            <p class="carrinho-vazio">Seu carrinho está vazio. Escolha um produto para começar.</p>
        `;
    } else {
        lista.innerHTML = itens.map((produto) => `
            <article class="item-carrinho">
                <img class="foto-mini" src="${produto.imagem}" alt="" loading="lazy">
                <div class="info">
                    <h2>${produto.nome}</h2>
                    <p class="descricao">${moeda.format(produto.preco)} cada</p>
                    <div class="controles">
                        <div class="controle-quantidade" aria-label="Quantidade de ${produto.nome}">
                            <button type="button" data-cart-action="decrease" data-product-id="${produto.id}" aria-label="Diminuir quantidade">−</button>
                            <span>${carrinho[produto.id]}</span>
                            <button type="button" data-cart-action="increase" data-product-id="${produto.id}" aria-label="Aumentar quantidade">+</button>
                        </div>
                        <button class="remover" type="button" data-cart-action="remove" data-product-id="${produto.id}">Remover</button>
                    </div>
                </div>
                <p class="preco-item">${moeda.format(produto.preco * carrinho[produto.id])}</p>
            </article>
        `).join("");
    }

    const subtotal = itens.reduce((total, produto) => {
        return total + produto.preco * carrinho[produto.id];
    }, 0);

    resumo.innerHTML = `
        <h2>Resumo do pedido</h2>
        <p class="linha"><span>Subtotal</span><span>${moeda.format(subtotal)}</span></p>
        <p class="linha"><span>Frete</span><span>A calcular</span></p>
        <p class="linha total"><span>Total</span><span>${moeda.format(subtotal)}</span></p>
        <a class="botao" href="index.html">Continuar comprando</a>
        ${itens.length ? '<p class="descricao">O frete será combinado na finalização do pedido.</p>' : ""}
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    let carrinho = lerCarrinho();
    atualizarContadores(carrinho);
    renderizarProdutos();
    renderizarCarrinho(carrinho);

    document.addEventListener("click", (evento) => {
        const adicionar = evento.target.closest("[data-add-to-cart]");
        if (adicionar) {
            const id = adicionar.dataset.addToCart;
            carrinho[id] = (Number.isInteger(carrinho[id]) && carrinho[id] > 0 ? carrinho[id] : 0) + 1;
            salvarCarrinho(carrinho);
            window.location.href = "carrinho.html";
            return;
        }

        const acao = evento.target.closest("[data-cart-action]");
        if (!acao) return;

        const id = acao.dataset.productId;
        if (acao.dataset.cartAction === "increase") {
            carrinho[id] = (carrinho[id] || 0) + 1;
        } else if (acao.dataset.cartAction === "decrease") {
            carrinho[id] = Math.max(0, (carrinho[id] || 0) - 1);
        } else if (acao.dataset.cartAction === "remove") {
            delete carrinho[id];
        }

        if (carrinho[id] === 0) delete carrinho[id];
        salvarCarrinho(carrinho);
        atualizarContadores(carrinho);
        renderizarCarrinho(carrinho);
    });
});
