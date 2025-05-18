const linhas = 5;
const colunas = 5;
const tabela = document.getElementById("matriz_vagas");

// Cria a matriz de vagas
function criarMatriz() {
  for (let i = 0; i < linhas; i++) {
    const linha = document.createElement("tr");
    for (let j = 0; j < colunas; j++) {
      const celula = document.createElement("td");
      celula.dataset.livre = "true";
      linha.appendChild(celula);
    }
    tabela.appendChild(linha);
  }
}

function corAleatoria() {
  const cores = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
    "#1abc9c", "#e67e22", "#34495e", "#7f8c8d", "#d35400",
    "#27ae60", "#2980b9", "#8e44ad", "#c0392b", "#16a085",
    "#f1c40f", "#bdc3c7", "#2c3e50"];
  return cores[Math.floor(Math.random() * cores.length)];
}

function criarCarro(placa, horario) {
  const carro = document.createElement("div");
  carro.classList.add("carro");
  carro.style.backgroundColor = corAleatoria();
  carro.title = `Entrou às ${horario}`;

  const iconesCarros = [
    "fa-car", "fa-car-side", "fa-taxi", "fa-bus",
    "fa-shuttle-van", "fa-truck-pickup", "fa-truck", 
    "fa-ambulance", "fa-motorcycle"
  ];
  const iconeAleatorio = iconesCarros[Math.floor(Math.random() * iconesCarros.length)];

  const icone = document.createElement("i");
  icone.classList.add("fas", iconeAleatorio);

  const texto = document.createElement("span");
  texto.textContent = placa;

  carro.appendChild(icone);
  carro.appendChild(texto);
  return carro;
}

function EvitarDuplas(placa) {
  const celulas = document.querySelectorAll("#matriz_vagas td");
  for (let celula of celulas) {
    if (celula.dataset.livre === "false") {
      const carro = celula.querySelector(".carro span");
      if (carro && carro.textContent.trim() === placa) {
        return false;
      }
    }
  }
  return true;
}

// Relógio
let hora = 10;
let minuto = 0;
let segundo = 0;

function atualizarRelogio() {
  segundo++;
  if (segundo >= 60) {
    segundo = 0;
    minuto++;
    if (minuto >= 60) {
      minuto = 0;
      hora++;
      if (hora >= 24) hora = 0;
    }
  }

  const format = (n) => n.toString().padStart(2, '0');
  document.getElementById("relogio").textContent = `${format(hora)}:${format(minuto)}:${format(segundo)}`;
}

setInterval(atualizarRelogio, 1000);

// Avança o tempo em minutos
function avancarTempo(min) {
  minuto += min;
  while (minuto >= 60) {
    minuto -= 60;
    hora++;
    if (hora >= 24) hora = 0;
  }
  atualizarRelogio();
}

// Evento de envio do formulário
document.getElementById("forms").addEventListener("submit", function (event) {
  event.preventDefault();

  const placa = document.getElementById("placa").value.trim().toUpperCase();
  if (!placa) return;

  if (!EvitarDuplas(placa)) {
    document.getElementById("mensagem").textContent = `A placa ${placa} já está estacionada!`;
    return;
  }

  const celulasLivres = Array.from(document.querySelectorAll("#matriz_vagas td")).filter(c => c.dataset.livre === "true");
  if (celulasLivres.length === 0) {
    document.getElementById("mensagem").textContent = "Estacionamento cheio!";
    return;
  }

  const vagaAleatoria = celulasLivres[Math.floor(Math.random() * celulasLivres.length)];

  const format = (n) => n.toString().padStart(2, '0');
  const horario = `${format(hora)}:${format(minuto)}:${format(segundo)}`;

  vagaAleatoria.dataset.livre = "false";
  vagaAleatoria.innerHTML = "";
  vagaAleatoria.appendChild(criarCarro(placa, horario));

  document.getElementById("mensagem").textContent = `Carro com placa ${placa} estacionado às ${horario}.`;
  document.getElementById("placa").value = "";
vagaAleatoria.onclick = function () {
    alert(`Carro com placa ${placa} entrou às ${horario}`);
}


  
});

// Inicializa a matriz ao carregar a página
window.onload = criarMatriz;
