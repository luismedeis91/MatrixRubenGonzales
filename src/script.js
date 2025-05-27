import Chart from 'chart.js/auto';

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


const dataGrafico = [];
for (let h = 10; h <= 23; h++) {
    dataGrafico.push({ hour: h, carsRemoved: 0, moneyEarned: 0 });
}

let myChart; 

window.onload = function () {
  tabela = document.getElementById("matriz_vagas");
  criarMatriz();

  const placaInput = document.getElementById("placa");

  placaInput.addEventListener("input", function (e) {
    let value = e.target.value.toUpperCase();
    const originalCursorPosition = e.target.selectionStart;
    let newCursorPosition = originalCursorPosition;
    let processedValue = "";

    
    if (value.length === 4 && value[3] !== '-' &&
        /^[A-Z]{3}$/.test(value.substring(0, 3)) &&
        /^\d$/.test(value[3])) {
      value = value.substring(0, 3) + '-' + value[3];
      if (originalCursorPosition === 4) {
        newCursorPosition = 5; // Pula o hífen
      }
    }

    let tempValue = "";
    for (let i = 0; i < value.length; i++) {
        const char = value[i];
        const currentLength = tempValue.length;

        if (currentLength < 3) { // Primeiras 3 letras
            if (/[A-Z]/.test(char)) {
                tempValue += char;
            } else {
                if (originalCursorPosition > i) newCursorPosition--;
            }
        } else if (currentLength === 3) { 
            if (char === '-' && !tempValue.includes('-')) { 
                tempValue += char;
            } else if (/[A-Z0-9]/.test(char)) { 
                tempValue += char;
            } else {
                if (originalCursorPosition > i) newCursorPosition--;
            }
        } else if (tempValue.includes('-')) { 
            if (tempValue.length < 8 && /\d/.test(char)) { // 
                tempValue += char;
            } else {
                if (originalCursorPosition > i) newCursorPosition--;
            }
        } else {
            
            if (currentLength === 3 && /\d/.test(char) && /^[A-Z]{3}$/.test(tempValue)) {
                 tempValue += char;
            }
            else if (currentLength === 4 && /[A-Z]/.test(char) && /^[A-Z]{3}\d$/.test(tempValue)) {
                 tempValue += char;
            }
            
            else if (currentLength === 5 && /\d/.test(char) && /^[A-Z]{3}\d[A-Z]$/.test(tempValue)) {
                 tempValue += char;
            }
            
            else if (currentLength === 6 && /\d/.test(char) && /^[A-Z]{3}\d[A-Z]\d$/.test(tempValue)) {
                 tempValue += char;
            } else {
                if (originalCursorPosition > i && tempValue.length < 7) newCursorPosition--; // Apenas ajusta se não estiver no limite
            }
        }
    }
    processedValue = tempValue;

    // Limita o tamanho máximo
    if (processedValue.includes('-')) {
        if (processedValue.length > 8) processedValue = processedValue.substring(0, 8); // LLL-NNNN
    } else {
        if (processedValue.length > 7) processedValue = processedValue.substring(0, 7); // LLLNLNN
    }

    if (e.target.value !== processedValue) {
        e.target.value = processedValue;
        // Tenta restaurar a posição do cursor de forma inteligente
        if (value.length > e.target.value.length && originalCursorPosition > processedValue.length) {
             e.target.setSelectionRange(processedValue.length, processedValue.length);
        } else {
             e.target.setSelectionRange(newCursorPosition, newCursorPosition);
        }
    }
  });

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

  // Inicialização do gráfico
  const ctx = document.getElementById('acquisitions').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dataGrafico.map(row => row.hour + ':00'),
      datasets: [
        {
          label: 'Carros Retirados',
          data: dataGrafico.map(row => row.carsRemoved),
          backgroundColor: 'rgba(153, 102, 255, 0.5)', 
          borderColor: 'rgba(153, 102, 255, 1)',     
          yAxisID: 'y-cars',
        },
        {
          label: 'Valor Arrecadado (R$)',
          data: dataGrafico.map(row => row.moneyEarned),
          backgroundColor: 'rgba(0, 128, 0, 0.5)',
          borderColor: 'rgba(0, 128, 0, 1)',      // Verde opaco
      
          borderWidth: 1,
          yAxisID: 'y-money',
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Hora do Dia'
          }
        },
        'y-cars': {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Quantidade de Carros Retirados'
          },
          ticks: {
            stepSize: 1
          }
        },
        'y-money': {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor Arrecadado (R$)'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                if (context.dataset.yAxisID === 'y-money') {
                  label += 'R$ ' + context.parsed.y.toFixed(2);
                } else {
                  label += context.parsed.y;
                }
              }
              return label;
            }
          }
        }
      }
    }
  });
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

function criarCarro(placa, horarioEntradaDisplay) {
  const carro = document.createElement("div");
  carro.classList.add("carro");
  carro.style.backgroundColor = corAleatoria();
  carro.title = `Entrou às ${horarioEntradaDisplay}`;

  const iconesCarros = [
    "fa-car", "fa-car-side", "fa-taxi", "fa-bus",
    "fa-shuttle-van", "fa-truck-pickup", "fa-truck",
    "fa-ambulance", "fa-motorcycle"
  ];
  const iconeAleatorio = iconesCarros[Math.floor(Math.random() * iconesCarros.length)];

  const icone = document.createElement("i");
  icone.classList.add("fas", iconeAleatorio);

  const textoPlaca = document.createElement("span");
  textoPlaca.textContent = placa;

  const horarioTextoPermanencia = document.createElement("span");
  horarioTextoPermanencia.classList.add("horario");
  horarioTextoPermanencia.textContent = `00:00:00`;

  carro.appendChild(icone);
  carro.appendChild(textoPlaca);
  carro.appendChild(horarioTextoPermanencia);
  return carro;
}

function placaJaExiste(placa) {
  const celulas = document.querySelectorAll("#matriz_vagas td");
  for (let celula of celulas) {
    if (celula.dataset.livre === "false") {
      const carroSpanPlaca = celula.querySelector(".carro span:not(.horario)");
      if (carroSpanPlaca && carroSpanPlaca.textContent.trim().replace(/-/g, "") === placa.replace(/-/g, "")) {
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
      if (hora >= 24) {
        hora = 10;
      }
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
  const format = (n) => n.toString().padStart(2, '0');

  for(let celula of celulas) {
    if(celula.dataset.livre === "false") {
      const carroTimeDisplay = celula.querySelector(".carro .horario");
      if (!carroTimeDisplay) continue;

      const hEntradaCarroGlobal = parseInt(celula.dataset.horaEntradaCarro);
      const mEntradaCarroGlobal = parseInt(celula.dataset.minutoEntradaCarro);
      const sEntradaCarroGlobal = parseInt(celula.dataset.segundoEntradaCarro);

      let permanenciaTotalSegundos = (horaGlobal * 3600 + minutoGlobal * 60 + segundoGlobal) -
                                   (hEntradaCarroGlobal * 3600 + mEntradaCarroGlobal * 60 + sEntradaCarroGlobal);

      if (permanenciaTotalSegundos < 0) {
        permanenciaTotalSegundos = 0;
      }

      const permanenciaH = Math.floor(permanenciaTotalSegundos / 3600);
      const permanenciaM = Math.floor((permanenciaTotalSegundos % 3600) / 60);
      const permanenciaS = permanenciaTotalSegundos % 60;

      carroTimeDisplay.textContent = `${format(permanenciaH)}:${format(permanenciaM)}:${format(permanenciaS)}`;
    }
  }
}

setInterval(atualizarRelogio, 1000);

function avancarTempo(minutosAvanco) {
  minuto += minutosAvanco;
  while (minuto >= 60) {
    minuto -= 60;
    hora++;
    if (hora >= 24) {
      hora = 10;
    }
  }

  minutoGlobal += minutosAvanco;
  while (minutoGlobal >= 60) {
    minutoGlobal -= 60;
    horaGlobal++;
  }
  atualizarRelogio();
}

document.getElementById("forms").addEventListener("submit", function (event) {
  event.preventDefault();

  const placaInput = document.getElementById("placa");
  const placa = placaInput.value.trim().toUpperCase();
  if (!placa) return;

  if (!placaValidaSudeste(placa)) {
    document.getElementById("popup-textRepetido").innerHTML = `
      <strong>Formato de placa inválido!</strong><br><br>
      Por favor, insira uma placa no formato antigo (Ex: ABC-1234)<br>
      ou Mercosul (Ex: ABC1D23).<br><br>
      <em>"Essa placa não parece correta, chefe."</em><br>
      Essa fita ai não ta correta não bigode, bota uma placa válida ai tio!!!<br>
      <br>
      <br>
      <strong>Aqui é so na cariocagem</strong>
    `;
    document.getElementById("popupRepetido").classList.remove("hidden");
    placaInput.focus();
    return;
  }

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
  const horarioEntradaDisplay = `${format(hora)}:${format(minuto)}:${format(segundo)}`;

  vagaAleatoria.dataset.livre = "false";
  vagaAleatoria.dataset.horaEntradaDisplay = horarioEntradaDisplay;
  vagaAleatoria.innerHTML = "";
  vagaAleatoria.classList.add("breathing");

  vagaAleatoria.dataset.horaEntradaCarro = horaGlobal;
  vagaAleatoria.dataset.minutoEntradaCarro = minutoGlobal;
  vagaAleatoria.dataset.segundoEntradaCarro = segundoGlobal;

  vagaAleatoria.appendChild(criarCarro(placaInput.value.toUpperCase(), horarioEntradaDisplay)); // Usa o valor do input formatado

  document.getElementById("mensagem").textContent = `Carro com placa ${placaInput.value.toUpperCase()} estacionado às ${horarioEntradaDisplay}.`;
  placaInput.value = "";

  vagaAleatoria.onclick = function () {
    const entradaStrDisplay = this.dataset.horaEntradaDisplay;

    const hEntradaGlobalCarro = parseInt(this.dataset.horaEntradaCarro);
    const mEntradaGlobalCarro = parseInt(this.dataset.minutoEntradaCarro);
    const sEntradaGlobalCarro = parseInt(this.dataset.segundoEntradaCarro);

    const entradaTotalGlobalSegundos = hEntradaGlobalCarro * 3600 + mEntradaGlobalCarro * 60 + sEntradaGlobalCarro;
    const agoraTotalGlobalSegundos = horaGlobal * 3600 + minutoGlobal * 60 + segundoGlobal;

    let diffTotalSegundos = agoraTotalGlobalSegundos - entradaTotalGlobalSegundos;
    if (diffTotalSegundos < 0) {
        diffTotalSegundos = 0;
    }

    const diffMin = Math.floor(diffTotalSegundos / 60);

    const permanenciaH = Math.floor(diffTotalSegundos / 3600);
    const permanenciaM = Math.floor((diffTotalSegundos % 3600) / 60);
    const permanenciaS = diffTotalSegundos % 60;
    const formatPermanencia = (n) => n.toString().padStart(2, '0');
    const tempoEstacionadoFormatado = `${formatPermanencia(permanenciaH)}h ${formatPermanencia(permanenciaM)}m ${formatPermanencia(permanenciaS)}s`;

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
      `Carro com placa <strong>${placaDoCarro}</strong> entrou às ${entradaStrDisplay}<br>
      Tempo estacionado: <strong>${tempoEstacionadoFormatado} (${diffMin} minutos totais)</strong><br>
      Valor a pagar: <strong>R$ ${preco.toFixed(2)}</strong>`;

    document.getElementById("popup").classList.remove("hidden");
  };
});

document.getElementById("btn-retirar").onclick = () => {
  if (popupCelulaAtiva) {
    const entradaStrDisplay = popupCelulaAtiva.dataset.horaEntradaDisplay;

    const hEntradaGlobalCarro = parseInt(popupCelulaAtiva.dataset.horaEntradaCarro);
    const mEntradaGlobalCarro = parseInt(popupCelulaAtiva.dataset.minutoEntradaCarro);
    const sEntradaGlobalCarro = parseInt(popupCelulaAtiva.dataset.segundoEntradaCarro);

    const entradaTotalGlobalSegundos = hEntradaGlobalCarro * 3600 + mEntradaGlobalCarro * 60 + sEntradaGlobalCarro;
    const saidaTotalGlobalSegundos = horaGlobal * 3600 + minutoGlobal * 60 + segundoGlobal;

    let diffTotalSegundos = saidaTotalGlobalSegundos - entradaTotalGlobalSegundos;
     if (diffTotalSegundos < 0) {
        diffTotalSegundos = 0;
    }

    const diffMin = Math.floor(diffTotalSegundos / 60);

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

    // Atualiza os dados do gráfico
    const horaDeRetirada = hora;
    const entradaGrafico = dataGrafico.find(d => d.hour === horaDeRetirada);
    if (entradaGrafico) {
      entradaGrafico.carsRemoved++;
      entradaGrafico.moneyEarned += preco;
      if (myChart) {
        myChart.data.datasets[0].data = dataGrafico.map(row => row.carsRemoved);
        myChart.data.datasets[1].data = dataGrafico.map(row => row.moneyEarned);
        myChart.update();
      }
    }

    const format = (n) => n.toString().padStart(2, '0');
    const saidaStrDisplay = `${format(hora)}:${format(minuto)}:${format(segundo)}`;

    const historicoItem = document.createElement("li");
    historicoItem.innerHTML = `
      <strong>Placa:</strong> ${popupPlacaAtiva} |
      <strong>Entrada:</strong> ${entradaStrDisplay} |
      <strong>Saída:</strong> ${saidaStrDisplay} |
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
    popupCelulaAtiva.classList.remove("breathing");
    popupCelulaAtiva.onclick = null;

    delete popupCelulaAtiva.dataset.horaEntradaDisplay;
    delete popupCelulaAtiva.dataset.horaEntradaCarro;
    delete popupCelulaAtiva.dataset.minutoEntradaCarro;
    delete popupCelulaAtiva.dataset.segundoEntradaCarro;

    document.getElementById("popup").classList.add("hidden");
    document.getElementById("mensagem").textContent = `Carro com placa ${popupPlacaAtiva} foi retirado. Valor: R$ ${preco.toFixed(2)}.`;

    popupCelulaAtiva = null;
    popupPlacaAtiva = null;
  }
};

document.querySelector("#avancar30min").onclick = function(){
  avancarTempo(30);
}

document.querySelector("#avancar15min").onclick = function(){
  avancarTempo(15);
}

document.querySelector("#avancar1h").onclick = function(){
  avancarTempo(60);
}

function placaValidaSudeste(placaInput){
    const placaOriginal = placaInput.toUpperCase();
    const placaSemHifenOuEspaco = placaOriginal.replace(/-/g, "").replace(/\s/g, "");

    const primeirasTresLetras = placaSemHifenOuEspaco.substring(0, 3);

    const prefixosSudeste = [
        // São Paulo (Exemplos - você precisará de uma lista mais completa para precisão)
        // Formato antigo: BFA-BXZ, CJA-CKZ, DAL-DBZ, EMA-EMY, FRA-FRZ, GMA-GMZ, HTA-HTZ, IAP-IAR, JAN-JAO, KDA-KDZ, LIA-LIZ, MOA-MOZ, NFA-NFZ, OGA-OGZ, QGA-QGZ
        // Mercosul (Exemplos de sequências que *podem* ser de SP com base na sua lista anterior)
        "BFA", "BFB", "BFC", "BFD", "BFE", "BFF", "BFG", "BFH", "BFI", "BFJ", "BFK", "BFL", "BFM",
        "QSA", "QSB", "QSC", "QSD", "QSE", "QSF", "QSG", "QSH", "QSI", "QSJ", "QSK", "QSL", "QSM",
        "RIA", "RIB", "RIC", "RID", "RIE", "RIF", "RIG", "RIH", "RII", "RIJ", "RIK", "RIL", "RIM",
        "BRA", "BRB", "BRC", "BRD", // Adicionados da sua lista anterior para SP

        // Rio de Janeiro (Exemplos)
        // Formato antigo: KMF-LVE
        // Mercosul (Exemplos de sequências que *podem* ser do RJ com base na sua lista anterior)
        "KMF", "KMG", "KMH", "KMI", "KMJ", "KMK", "KML", "KMM", "KMN", "KMO", "KMP", "KMQ", "KMR", "KMS", "KMT", "KMU", "KMV", "KMW", "KMX", "KMY", "KMZ",
        "LVA", "LVB", "LVC", "LVD", "LVE",
        "RIO", "RIW", "RJX", "RKA", "RKB", "RKC", // Adicionados da sua lista anterior para RJ


        // Minas Gerais (Exemplos)
        // Formato antigo: GKA-HOK, NHA-NIX, OLA-OMZ, OWA-OXK, PUA-PZZ, QMA-QMP, QQA-QQZ, QUA-QUZ, QWA-QWZ, GXA-GXZ
        // Mercosul (Exemplos de sequências que *podem* ser de MG com base na sua lista anterior)
        "QPA", "QPB", "QPC", "QPD", "QPE", "QPF", "QPG", "QPH", "QPI", "QPJ", "QPK", "QPL", "QPM",
        "RUA", "RUB", "RUC", "RUD", "RUE", "RUF", "RUG", "RUH", "RUI", "RUJ", "RUK", "RUL", "RUM",

        // Espírito Santo (Exemplos)
        // Formato antigo: MOA-MTZ (parte dessa faixa é de MG também), ODA-ODZ, OVA-OVZ
        // Mercosul (Exemplos de sequências que *podem* ser do ES com base na sua lista anterior)
        "QVA", "QVB", "QVC", "QVD", "QVE", "QVF", "QVG", "QVH", "QVI", "QVJ", "QVK", "QVL", "QVM",
        "RCA", "RCB", "RCC"
    ];

    if (!prefixosSudeste.includes(primeirasTresLetras)) {
        return false;
    }

    const regexAntigaComHifen = /^[A-Z]{3}-\d{4}$/;
    const regexAntigaSemHifen = /^[A-Z]{3}\d{4}$/;
    const regexMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;

    if (regexMercosul.test(placaSemHifenOuEspaco)) {
        return true;
    }

    if (regexAntigaComHifen.test(placaOriginal)) {
        return true;
    }

    if (regexAntigaSemHifen.test(placaSemHifenOuEspaco) && !placaOriginal.includes('-')) {
        return true;
    }
    
    if (placaOriginal.length === 7 && !placaOriginal.includes('-') && regexAntigaSemHifen.test(placaOriginal)) {
        return true;
    }

    return false;
}function placaValidaSudeste(placaInput){
    const placaOriginal = placaInput.toUpperCase();
    const placaSemHifenOuEspaco = placaOriginal.replace(/-/g, "").replace(/\s/g, "");

    const primeirasTresLetras = placaSemHifenOuEspaco.substring(0, 3);

    const prefixosSudeste = [
        // São Paulo (Exemplos - você precisará de uma lista mais completa para precisão)
        // Formato antigo: BFA-BXZ, CJA-CKZ, DAL-DBZ, EMA-EMY, FRA-FRZ, GMA-GMZ, HTA-HTZ, IAP-IAR, JAN-JAO, KDA-KDZ, LIA-LIZ, MOA-MOZ, NFA-NFZ, OGA-OGZ, QGA-QGZ
        // Mercosul (Exemplos de sequências que *podem* ser de SP com base na sua lista anterior)
        "BFA", "BFB", "BFC", "BFD", "BFE", "BFF", "BFG", "BFH", "BFI", "BFJ", "BFK", "BFL", "BFM",
        "QSA", "QSB", "QSC", "QSD", "QSE", "QSF", "QSG", "QSH", "QSI", "QSJ", "QSK", "QSL", "QSM",
        "RIA", "RIB", "RIC", "RID", "RIE", "RIF", "RIG", "RIH", "RII", "RIJ", "RIK", "RIL", "RIM",
        "BRA", "BRB", "BRC", "BRD", // Adicionados da sua lista anterior para SP

        // Rio de Janeiro (Exemplos)
        // Formato antigo: KMF-LVE
        // Mercosul (Exemplos de sequências que *podem* ser do RJ com base na sua lista anterior)
        "KMF", "KMG", "KMH", "KMI", "KMJ", "KMK", "KML", "KMM", "KMN", "KMO", "KMP", "KMQ", "KMR", "KMS", "KMT", "KMU", "KMV", "KMW", "KMX", "KMY", "KMZ",
        "LVA", "LVB", "LVC", "LVD", "LVE",
        "RIO", "RIW", "RJX", "RKA", "RKB", "RKC", // Adicionados da sua lista anterior para RJ


        // Minas Gerais (Exemplos)
        // Formato antigo: GKA-HOK, NHA-NIX, OLA-OMZ, OWA-OXK, PUA-PZZ, QMA-QMP, QQA-QQZ, QUA-QUZ, QWA-QWZ, GXA-GXZ
        // Mercosul (Exemplos de sequências que *podem* ser de MG com base na sua lista anterior)
        "QPA", "QPB", "QPC", "QPD", "QPE", "QPF", "QPG", "QPH", "QPI", "QPJ", "QPK", "QPL", "QPM",
        "RUA", "RUB", "RUC", "RUD", "RUE", "RUF", "RUG", "RUH", "RUI", "RUJ", "RUK", "RUL", "RUM",

        // Espírito Santo (Exemplos)
        // Formato antigo: MOA-MTZ (parte dessa faixa é de MG também), ODA-ODZ, OVA-OVZ
        // Mercosul (Exemplos de sequências que *podem* ser do ES com base na sua lista anterior)
        "QVA", "QVB", "QVC", "QVD", "QVE", "QVF", "QVG", "QVH", "QVI", "QVJ", "QVK", "QVL", "QVM",
        "RCA", "RCB", "RCC"
    ];

    if (!prefixosSudeste.includes(primeirasTresLetras)) {
        return false;
    }

    const regexAntigaComHifen = /^[A-Z]{3}-\d{4}$/;
    const regexAntigaSemHifen = /^[A-Z]{3}\d{4}$/;
    const regexMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;

    if (regexMercosul.test(placaSemHifenOuEspaco)) {
        return true;
    }

    if (regexAntigaComHifen.test(placaOriginal)) {
        return true;
    }

    if (regexAntigaSemHifen.test(placaSemHifenOuEspaco) && !placaOriginal.includes('-')) {
        return true;
    }
    
    if (placaOriginal.length === 7 && !placaOriginal.includes('-') && regexAntigaSemHifen.test(placaOriginal)) {
        return true;
    }

    return false;
}