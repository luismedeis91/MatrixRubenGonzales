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

// Estrutura de dados para o gráfico
const dataGrafico = [];
for (let h = 10; h <= 23; h++) {
    dataGrafico.push({ hour: h, carsRemoved: 0, moneyEarned: 0 });
}

let myChart; // Variável global para a instância do gráfico

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
        newCursorPosition = 5; 
      }
    }

    let tempValue = "";
    let hyphenInsertedByLogic = false; 

    for (let i = 0; i < value.length; i++) {
        const char = value[i];
        const currentLength = tempValue.length;

        if (currentLength < 3) { 
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
        } else if (currentLength === 4 && tempValue.includes('-')) {
            if (/\d/.test(char)) { // Deve ser número
                tempValue += char;
            } else {
                if (originalCursorPosition > i) newCursorPosition--;
            }
        } else if (currentLength === 4 && !tempValue.includes('-')) { 
             if (/[A-Z]/.test(char) && /\d$/.test(tempValue[3])) { 
                tempValue += char;
            } else {
                if (originalCursorPosition > i) newCursorPosition--;
            }
        } else if (currentLength > 4) { 
            if (tempValue.includes('-')) { 
                if (/\d/.test(char)) {
                    tempValue += char;
                } else {
                   if (originalCursorPosition > i) newCursorPosition--;
                }
            } else { // Formato LLLNLN... (Mercosul)
                if (/\d/.test(char) && /[A-Z]$/.test(tempValue[tempValue.length-1]) && tempValue.length == 5) { // LLLNLN (NÚMERO após LETRA)
                     tempValue += char;
                } else if (/\d$/.test(tempValue[tempValue.length-1]) && tempValue.length == 6 && /\d/.test(char)) { // LLLNLNN (NÚMERO após NÚMERO)
                     tempValue += char;
                }
                 else {
                   if (originalCursorPosition > i) newCursorPosition--;
                }
            }
        }
    }
    processedValue = tempValue;


    if (e.target.value !== processedValue) {
        e.target.value = processedValue;
      
        if (value.length > e.target.value.length && originalCursorPosition > processedValue.length) {
             e.target.setSelectionRange(processedValue.length, processedValue.length);
        } else {
             e.target.setSelectionRange(newCursorPosition, newCursorPosition);
        }
    }
  })














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
          backgroundColor: 'rgba(255, 99, 132, 0.5)', // Vermelho para carros
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y-cars',
        },
        {
          label: 'Valor Arrecadado (R$)',
          data: dataGrafico.map(row => row.moneyEarned),
          backgroundColor: 'rgba(54, 162, 235, 0.5)', 
          borderColor: 'rgba(54, 162, 235, 1)',
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
      <strong>Placa inválida ou não pertence à Região Sudeste!</strong><br><br>
      Apenas placas no formato Mercosul (Ex: ABC1D23) de SP, RJ, MG ou ES são permitidas.<br><br>
      <em>"Essa placa não está nos conformes do Mercosul para esta região, parceiro."</em><br>
      — <strong>Aqui é so na cariocagem</strong> <em>, mané</em>
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

  vagaAleatoria.appendChild(criarCarro(placa, horarioEntradaDisplay));

  document.getElementById("mensagem").textContent = `Carro com placa ${placa} estacionado às ${horarioEntradaDisplay}.`;
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
    const formatPermanencia = (n) => n.toString().padStart(2, '0'); // Formatador local para permanência
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
    const horaDeRetirada = hora; // Usa a hora atual do relógio de display (10-23)
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
    const placa = placaInput.toUpperCase().replace(/-/g, "")

    const regexMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/

    if(regexMercosul.test(placa)){
        const primeirasletras = placa.substring(0,3)
        
         const prefixosMercosulSudesteExemplos = [
            // São Paulo 
            "BRA", "BRB", "BRC", "BRD", 
            "BFA", "BFB", "BFC", "BFD", "BFE", "BFF", "BFG", "BFH", "BFI", "BFJ", "BFK", "BFL", "BFM",
            "QSA", "QSB", "QSC", "QSD", "QSE", "QSF", "QSG", "QSH", "QSI", "QSJ", "QSK", "QSL", "QSM",
            "RIA", "RIB", "RIC", "RID", "RIE", "RIF", "RIG", "RIH", "RII", "RIJ", "RIK", "RIL", "RIM",
            // Rio de Janeiro 
            "RIO", "RIW", "RJX", "RKA", "RKB", "RKC", "LVA", "LVB", "LVC", "LVD", "LVE",
            // Minas Gerais
            "QPA", "QPB", "QPC", "QPD", "QPE", "QPF", "QPG", "QPH", "QPI", "QPJ", "QPK", "QPL", "QPM",
            "RUA", "RUB", "RUC", "RUD", "RUE", "RUF", "RUG", "RUH", "RUI", "RUJ", "RUK", "RUL", "RUM",
            // Espírito Santo 
            "QVA", "QVB", "QVC", "QVD", "QVE", "QVF", "QVG", "QVH", "QVI", "QVJ", "QVK", "QVL", "QVM",
            "RCA", "RCB", "RCC"
           
        ];


        const primeiraLetraMercosul = primeirasletras[0]
        const iniciaisComunsMercosul = ['B', 'L', 'O', 'P', 'Q', 'R'];

        if(prefixosMercosulSudesteExemplos.includes(primeirasletras)){
            iniciaisComunsMercosul.includes(primeiraLetraMercosul)
            return true
        }


        return false

    }

    return false
    
}