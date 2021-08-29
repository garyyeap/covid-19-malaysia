import csv2JSON from './csv.js';
import initChart from './vax-chart.js';

(async function () {
  function switchChart () {
    if (selector.value === states[0]) {
      initChart(vaxMalaysiaData, parseInt(populationData[0].pop_18));
      return;
    }

    const currentState = selector.value;
    const population = parseInt(populationData[states.indexOf(currentState)].pop_18);

    initChart(vaxStatesData[currentState], population);
    document.title = 'Vax-' + currentState;
  };

  const vaxStatesUrl = 'https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_state.csv';
  const vaxMalaysiaUrl = 'https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_malaysia.csv';
  const populationUrl = 'https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/static/population.csv';
  const [ populationData, vaxMalaysiaData, vaxStatesData ] = await Promise.all([
    fetch(populationUrl).then((response) => response.text()).then((text) => csv2JSON(text)),
    fetch(vaxMalaysiaUrl).then((response) => response.text()).then((text) => csv2JSON(text)),
    fetch(vaxStatesUrl).then((response) => response.text()).then((text) => {
      return csv2JSON(text).reduce(function (result, val) {
        if (!result[val.state]) result[val.state] = [];

        result[val.state].push(val);

        return result;
      }, {});
    })
  ]);
  const mainContainer = document.getElementById('main-container');
  const loadingCover = document.getElementById('loading-cover');
  const states = populationData.map(val => val.state);
  const selector = document.getElementById('switch');

  selector.onchange = switchChart;
  selector.innerHTML = states.map(function (val) {
    return `<option value="${val}">${val}</option>`;
  }).join('');

  loadingCover.ontransitionend = function () {
    loadingCover.style.display = 'none';
    mainContainer.style.display = 'block';
    customSelect('#switch');
    switchChart();
  };

  window.onresize = function () {  
    window.setTimeout(switchChart, 500);
  };

  loadingCover.style.opacity = 0;
})();