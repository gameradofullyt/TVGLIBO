// 1. CARROSSEL PRINCIPAL (TOPO)
let slideIndex = 1;
const slides = document.querySelectorAll('.carousel-item');

function showSlides(n) {
    if (slides.length === 0) return;
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    slides.forEach(s => s.style.display = "none");
    slides[slideIndex - 1].style.display = "flex";
}

function changeSlide(n) {
    showSlides(slideIndex += n);
}

if(slides.length > 0) {
    showSlides(slideIndex);
    setInterval(() => changeSlide(1), 5000);
}

// 2. MOVIMENTO DOS SLIDERS DE CATEGORIA (SETAS)
function scrollSlider(button, direction) {
    const track = button.parentElement.querySelector('.slider-track');
    const scrollAmount = track.clientWidth * 0.8;
    track.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

const grid = document.getElementById('grid-filmes');
let pagina = 0;
const filmesPorPagina = 20;

function gerarFilmes(qtd) {
    const filmes = [];
    for (let i = 0; i < qtd; i++) {
        filmes.push({
            titulo: 'Filme ' + (pagina * filmesPorPagina + i + 1),
            imagem: 'https://via.placeholder.com/300x450'
        });
    }
    return filmes;
}

function carregarFilmes() {
    if (!grid) return; 
    const filmes = gerarFilmes(filmesPorPagina);
    filmes.forEach(filme => {
        const div = document.createElement('div');
        div.className = 'filme';
        div.innerHTML = `
            <img src="${filme.imagem}">
            <h4>${filme.titulo}</h4>
        `;
        grid.appendChild(div);
    });
    pagina++;
}

window.addEventListener('scroll', () => {
    const fimDaPagina = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
    if (fimDaPagina) { carregarFilmes(); }
});

carregarFilmes();

// ==========================================
// LÓGICA DO ÍCONE DE PESQUISA (FECHAR/ESC CORRIGIDO)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const searchIconBtn = document.getElementById('searchIconBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchIconBtn && searchInput) {
        searchIconBtn.addEventListener('click', () => {
            searchInput.classList.toggle('active');
            
            if (searchInput.classList.contains('active')) {
                searchInput.focus();
            } else {
                // Ao fechar clicando na lupa, limpa e sai da pesquisa
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input')); 
                searchInput.blur();
            }
        });
    }

    // Fechar ao pressionar a tecla "Esc" (Escape)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchInput && searchInput.classList.contains('active')) {
            searchInput.classList.remove('active');
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input')); // Dispara o evento de limpar a tela de pesquisa
            searchInput.blur();
        }
    });
});

// ==========================================
// SISTEMA DE ORDEM ALEATÓRIA (TRUE/FALSE)
// ==========================================
function randomizarCategorias() {
    const sliders = document.querySelectorAll('.category-slider');
    sliders.forEach(slider => {
        const isRandom = slider.getAttribute('data-random') === 'true';
        if (isRandom) {
            const track = slider.querySelector('.slider-track');
            const cards = Array.from(track.querySelectorAll('.card'));
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cards[i], cards[j]] = [cards[j], cards[i]];
            }
            cards.forEach(card => track.appendChild(card));
        }
    });
}

// ==========================================
// FUNDO DINÂMICO (BLUR BASEADO NO PÔSTER)
// ==========================================
function iniciarFundoDinamico() {
    const bgElement = document.getElementById('bg-dinamico');
    const imagens = document.querySelectorAll('.card img');
    if (!bgElement || imagens.length === 0) return;
    bgElement.style.backgroundImage = `url('${imagens[0].src}')`;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const imgSrc = entry.target.src;
                bgElement.style.backgroundImage = `url('${imgSrc}')`;
            }
        });
    }, { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0.1 });
    imagens.forEach(img => observer.observe(img));
}

document.addEventListener("DOMContentLoaded", () => {
    randomizarCategorias();
    iniciarFundoDinamico();
});
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchInput');
    const telaPesquisa = document.getElementById('tela-pesquisa');
    const gridResultados = document.getElementById('resultados-grid');
    const conteudoPrincipal = document.getElementById('conteudo-principal');
    
    // Banco de dados em memória capturado da tela atual
    let bancoDados = [];

    function capturarConteudo() {
        bancoDados = [];
        // Seleciona todos os cards, exceto os de seções proibidas
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            // Filtro: ignora "Últimos Episódios" (card-wide) e "Outros conteúdos"
            const ehUltimosEp = card.classList.contains('card-wide');
            const ehOutros = card.closest('.category-slider')?.innerText.includes('Outros Conteúdos');
            
            if (!ehUltimosEp && !ehOutros) {
                bancoDados.push({
                    titulo: card.querySelector('h4')?.innerText.toLowerCase(),
                    elemento: card.cloneNode(true)
                });
            }
        });
    }

    // Inicializa a captura
    capturarConteudo();

    // Busca em tempo real
    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        
        if (termo.length > 0) {
            telaPesquisa.classList.remove('hidden');
            conteudoPrincipal.style.display = 'none';
            gridResultados.innerHTML = '';
            
            const filtrados = bancoDados.filter(item => item.titulo.includes(termo));
            
            filtrados.forEach(item => {
                gridResultados.appendChild(item.elemento);
            });
        } else {
            telaPesquisa.classList.add('hidden');
            conteudoPrincipal.style.display = 'block';
        }
    });

    // Fechar ao clicar na lupa ou ESC
    const fecharBusca = () => {
        searchInput.value = '';
        searchInput.classList.remove('active');
        telaPesquisa.classList.add('hidden');
        conteudoPrincipal.style.display = 'block';
    };

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharBusca(); });
});
// Previne o zoom por pinça (dois dedos)
document.addEventListener('touchmove', function (event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });