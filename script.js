let linhas = 5;
let colunas = 6;
let tabela;
let popupCelulaAtiva = null;
let popupPlacaAtiva = null;
let valorTotalAcumulado = 0;

let hora = 10;
let minuto = 0;
let segundo = 0;

let horaGlobal = 0;
let minutoGlobal = 0;
let segundoGlobal = 0;

let horaEntrada = [];
let minutoEntrada = [];
let segundoEntrada = [];

window.onload = function () {
  tabela = document.getElementById("matriz_vagas");
  criarMatriz();

  document.getElementById("btn-fechar").onclick = () => {
    document.getElementById("popup").classList.add("hidden");
  };

  document.getElementById("btn-fecharRepetido").onclick = () => {
    document.getElementById("popupRepetido").classList.add("hidden");
  };

  document.getElementById("btn-verHistorico").onclick = () => {
    document.getElementById("valorTotalHistorico").textContent = `R$ ${valorTotalAcumulado.toFixed(2)}`;
    document.getElementById("popupPrecos").classList.remove("hidden");
  };

  document.getElementById("btn-fecharPrecos").onclick = () => {
    document.getElementById("popupPrecos").classList.add("hidden");
  };
};

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

  const horarioTexto = document.createElement("span");
  horarioTexto.classList.add("horario");
  horarioTexto.textContent = `${horario}`;

  carro.appendChild(icone);
  carro.appendChild(texto);
  carro.appendChild(horarioTexto);
  return carro;
}

function placaJaExiste(placa) {
  const celulas = document.querySelectorAll("#matriz_vagas td");
  for (let celula of celulas) {
    if (celula.dataset.livre === "false") {
      const carroSpanPlaca = celula.querySelector(".carro span:not(.horario)");
      if (carroSpanPlaca && carroSpanPlaca.textContent.trim() === placa) {
        return true;
      }
    }
  }
  return false;
}

function atualizarRelogio() {
  segundo++;
  if (segundo >= 60) {
    segundo = 0;
    minuto++;
    if (minuto >= 60) {
      minuto = 0;
      hora++;
      if (hora >= 24) hora = 10;
    }
  }

  atualizarRelogioGlobal();

  const format = (n) => n.toString().padStart(2, '0');
  document.getElementById("relogio").textContent = `${format(hora)}:${format(minuto)}:${format(segundo)}`;
}

function atualizarRelogioGlobal() {
  segundoGlobal++;
  if (segundoGlobal >= 60) {
    segundoGlobal = 0;
    minutoGlobal++;
    if (minutoGlobal >= 60) {
      minutoGlobal = 0;
      horaGlobal++;
    }
  }
  
  atualizarRelogioEmCarros();
}

function atualizarRelogioEmCarros() {
  const celulas = document.querySelectorAll("#matriz_vagas td");
  for(let celula of celulas) {
    if(celula.dataset.livre === "false") {
      const carro = celula.querySelector(".carro");
      const carroTime = celula.querySelector(".horario");
      
      const format = (n) => n.toString().padStart(2, '0');
      carroTime.textContent = `${format(horaGlobal)}:${format(minutoGlobal)}:${format(segundoGlobal)}`;
    }
  }
}

setInterval(atualizarRelogio, 1000);

function avancarTempo(min) {
  minuto += min;
  while (minuto >= 60) {
    minuto -= 60;
    hora++;
    if (hora >= 24) hora = 10;
  }
  atualizarRelogio();
}

document.getElementById("forms").addEventListener("submit", function (event) {
  event.preventDefault();

  const placaInput = document.getElementById("placa");
  const placa = placaInput.value.trim().toUpperCase();
  if (!placa) return;

  if (placaJaExiste(placa)) {
    document.getElementById("popup-textRepetido").innerHTML = `
      <strong>Placa duplicada detectada!</strong><br><br>
      Não é permitido estacionar dois automóveis com a mesma placa.<br>
      <em>"Parece que alguém quer arrumar problemas com a lei."</em><br>
      — <strong>Perna Longa</strong>, <em>Looney Tunes</em>
    `;
    document.getElementById("popupRepetido").classList.remove("hidden");
    return;
  }

  const celulasLivres = Array.from(document.querySelectorAll("#matriz_vagas td")).filter(c => c.dataset.livre === "true");
  if (celulasLivres.length === 0) {
    document.getElementById("mensagem").textContent = "Estacionamento cheio!";
    return;
  }

  const vagaAleatoria = celulasLivres[Math.floor(Math.random() * celulasLivres.length)];

  const format = (n) => n.toString().padStart(2, '0');
  const horarioEntrada = `${format(hora)}:${format(minuto)}:${format(segundo)}`;

  vagaAleatoria.dataset.livre = "false";
  vagaAleatoria.dataset.horaEntrada = horarioEntrada;
  vagaAleatoria.innerHTML = "";
  vagaAleatoria.appendChild(criarCarro(placa, horarioEntrada));

  document.getElementById("mensagem").textContent = `Carro com placa ${placa} estacionado às ${horarioEntrada}.`;
  placaInput.value = "";

  vagaAleatoria.onclick = function () {
    const entradaStr = this.dataset.horaEntrada;
    const [hEntrada, mEntrada, sEntrada] = entradaStr.split(":").map(Number);

    const entradaTotalSegundos = hEntrada * 3600 + mEntrada * 60 + sEntrada;
    const agoraTotalSegundos = hora * 3600 + minuto * 60 + segundo;
    
    let diffSegundos = agoraTotalSegundos - entradaTotalSegundos;
    if (diffSegundos < 0) {
      diffSegundos += 24 * 3600;
    }
    const diffMin = Math.floor(diffSegundos / 60);

    let preco = 0;
    if (diffMin > 15) {
      const horasFracionadas = diffMin / 60.0;
      const horasCobradas = Math.ceil(horasFracionadas);
      preco = 10;
      if (horasCobradas > 1) {
        preco += (horasCobradas - 1) * 2;
      }
    }

    const placaDoCarroElement = this.querySelector(".carro span:not(.horario)");
    const placaDoCarro = placaDoCarroElement ? placaDoCarroElement.textContent : "N/A";

    popupCelulaAtiva = this;
    popupPlacaAtiva = placaDoCarro;

    document.getElementById("popup-text").innerHTML =
      `Carro com placa <strong>${placaDoCarro}</strong> entrou às ${entradaStr}<br>
      Tempo estacionado: <strong>${diffMin} minutos</strong><br>
      Valor a pagar: <strong>R$ ${preco.toFixed(2)}</strong>`;

    document.getElementById("popup").classList.remove("hidden");
  };
});

document.getElementById("btn-retirar").onclick = () => {
  if (popupCelulaAtiva) {
    const entradaStr = popupCelulaAtiva.dataset.horaEntrada;
    const [hEntrada, mEntrada, sEntrada] = entradaStr.split(":").map(Number);

    const entradaTotalSegundos = hEntrada * 3600 + mEntrada * 60 + sEntrada;
    const saidaTotalSegundos = hora * 3600 + minuto * 60 + segundo;

    let diffSegundos = saidaTotalSegundos - entradaTotalSegundos;
    if (diffSegundos < 0) { 
      diffSegundos += 24 * 3600;
    }
    const diffMin = Math.floor(diffSegundos / 60);

    let preco = 0;
    if (diffMin > 15) {
      const horasFracionadas = diffMin / 60.0;
      const horasCobradas = Math.ceil(horasFracionadas);
      preco = 10;
      if (horasCobradas > 1) {
        preco += (horasCobradas - 1) * 2;
      }
    }

    valorTotalAcumulado += preco;

    const format = (n) => n.toString().padStart(2, '0');
    const saidaStr = `${format(hora)}:${format(minuto)}:${format(segundo)}`;

    const historicoItem = document.createElement("li");
    historicoItem.innerHTML = `
      <strong>Placa:</strong> ${popupPlacaAtiva} |
      <strong>Entrada:</strong> ${entradaStr} |
      <strong>Saída:</strong> ${saidaStr} |
      <strong>Valor:</strong> R$ ${preco.toFixed(2)}
    `;
    const historicoList = document.getElementById("historico");
    if (historicoList.firstChild) {
      historicoList.insertBefore(historicoItem, historicoList.firstChild);
    } else {
      historicoList.appendChild(historicoItem);
    }
    
    popupCelulaAtiva.dataset.livre = "true";
    popupCelulaAtiva.innerHTML = "";
    popupCelulaAtiva.style.backgroundColor = "";
    popupCelulaAtiva.onclick = null;

    document.getElementById("popup").classList.add("hidden");
    document.getElementById("mensagem").textContent = `Carro com placa ${popupPlacaAtiva} foi retirado. Valor: R$ ${preco.toFixed(2)}.`;
    popupCelulaAtiva = null;
    popupPlacaAtiva = null;
  }
};