import csv2JSON from './csv.js';
import initVaxChart from './vaccine.js';
import initEpidemicChart from './epidemic.js';

function fetchCSV (url) {
  return fetch(url).then(response => response.text()).then(text => csv2JSON(text));
}

function categoryByState (data) {
  return data.reduce(function (result, val) {
    if (!result[val.state]) result[val.state] = [];

    result[val.state].push(val);

    return result;
  }, {});
}

(async function () {
  function initCharts () {
    const currentState = stateSelector.value;

    document.title = categorySelector.value + '-' + currentState;

    if (categorySelector.value === 'Vaccine') {
      epidemicContainer.style.display = 'none';
      vaxContainer.style.display = 'block';

      if (currentState === states[0]) {
        initVaxChart(vaxMalaysiaData, parseInt(populationData[0].pop_18));
        return;
      }

      const population = parseInt(populationData[states.indexOf(currentState)].pop_18);
      initVaxChart(vaxStatesData[currentState], population);
      return;
    }

    epidemicContainer.style.display = 'block';
    vaxContainer.style.display = 'none';

    if (currentState === states[0]) {
      initEpidemicChart(testsMalaysiaData, casesMalaysiaData, deathsMalaysiaData);
      return;
    }
    initEpidemicChart(testsStatesData[currentState], casesStatesData[currentState], deathsStatesData[currentState]);
  };

  const vaxStatesUrl = 'https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_state.csv';
  const vaxMalaysiaUrl = 'https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_malaysia.csv';
  const populationUrl = 'https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/static/population.csv';
  const casesMalaysiaUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/cases_malaysia.csv';
  const testsMalaysiaUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/tests_malaysia.csv';
  const deathsMalaysiaUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/deaths_malaysia.csv';
  const casesStetesUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/cases_state.csv';
  const testsStetesUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/tests_state.csv';
  const deathsStetesUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/deaths_state.csv';
  const [ 
    testsMalaysiaData,
    casesMalaysiaData,
    deathsMalaysiaData,
    testsStatesData,
    casesStatesData,
    deathsStatesData,
    populationData, 
    vaxMalaysiaData, 
    vaxStatesData 
  ] = await Promise.all([
    fetchCSV(testsMalaysiaUrl),
    fetchCSV(casesMalaysiaUrl),
    fetchCSV(deathsMalaysiaUrl),
    fetchCSV(testsStetesUrl).then(categoryByState),
    fetchCSV(casesStetesUrl).then(categoryByState),
    fetchCSV(deathsStetesUrl).then(categoryByState),
    fetchCSV(populationUrl),
    fetchCSV(vaxMalaysiaUrl),
    fetchCSV(vaxStatesUrl).then(categoryByState)
  ]);
  const mainContainer = document.getElementById('main-container');
  const vaxContainer = document.getElementById('vax-container');
  const epidemicContainer = document.getElementById('epidemic-container');
  const loadingCover = document.getElementById('loading-cover');
  const states = populationData.map(val => val.state);
  const stateSelector = document.getElementById('state-switch');
  const categorySelector = document.getElementById('category-switch');

  stateSelector.onchange = categorySelector.onchange = initCharts;
  stateSelector.innerHTML = states.map(function (val) {
    return `<option value="${val}">${val.replace('W.P. ', '')}</option>`;
  }).join('');

  loadingCover.ontransitionend = function () {
    loadingCover.style.display = 'none';
    mainContainer.style.display = 'block';
    customSelect('.switch');
    initCharts();
  };

  window.onresize = function () {  
    window.setTimeout(initCharts, 500);
  };

  loadingCover.style.opacity = 0;
})();