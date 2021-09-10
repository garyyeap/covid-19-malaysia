import csv2JSON from './csv.js';
import initVaxChart from './vaccine.js';
import initEpidemicChart from './epidemic.js';

function getDeathsDetailsByAgeAndVaxTypes (data) {
  // date,date_positive,date_dose1,date_dose2,vaxtype,state,age,male,bid,malaysian,comorb
  const vaxMap = { s: 'sinovac', p: 'pfizer', a: 'astra', u: 'unknown' };
  const dataTemplate = {
    unvaxed: 0,
    pfizer: {
      partial: 0,
      full14days: 0,
      full: 0,
      below1MonthAfter14days: 0,
      below2MonthsAfter14days: 0,
      below3MonthsAfter14days: 0,
      above3MonthsAfter14days: 0,
    },
    sinovac: {
      partial: 0,
      full14days: 0,
      full: 0,
      below1MonthAfter14days: 0,
      below2MonthsAfter14days: 0,
      below3MonthsAfter14days: 0,
      above3MonthsAfter14days: 0,
    },
    astra: {
      partial: 0,
      full14days: 0,
      full: 0,
      below1MonthAfter14days: 0,
      below2MonthsAfter14days: 0,
      below3MonthsAfter14days: 0,
      above3MonthsAfter14days: 0,
    },
    unknown: {
      partial: 0,
      full14days: 0,
      full: 0,
      below1MonthAfter14days: 0,
      below2MonthsAfter14days: 0,
      below3MonthsAfter14days: 0,
      above3MonthsAfter14days: 0,
    }
  };
  let c = 0;
  return data.reduce(function (result, val, i) { 
    const age = parseInt(val.age);

    if (!!val.date_dose2) {
      result.all[vaxMap[val.vaxtype]].full += 1;

      if (age >= 60) {
        result.above60[vaxMap[val.vaxtype]].full += 1;
      } else if (age >= 18) {
        result.between18and60[vaxMap[val.vaxtype]].full += 1;
      } else {
        result.under18[vaxMap[val.vaxtype]].full += 1;
      }

      if (dayjs(val.date_positive).diff(val.date_dose2, 'day') >= 14) {
        result.all[vaxMap[val.vaxtype]].full14days += 1;
        if (age >= 60) {
          result.above60[vaxMap[val.vaxtype]].full14days += 1;
        } else if (age >= 18) {
          result.between18and60[vaxMap[val.vaxtype]].full14days += 1;
        } else {
          result.under18[vaxMap[val.vaxtype]].full14days += 1;
        }

        const diff = Math.abs(dayjs(val.date_dose2).add(14, 'day').diff(val.date, 'day'));

        if (diff < 30) {
          result.all[vaxMap[val.vaxtype]].below1MonthAfter14days += 1;
          if (age >= 60) {
            result.above60[vaxMap[val.vaxtype]].below1MonthAfter14days += 1;
          } else if (age >= 18) {
            result.between18and60[vaxMap[val.vaxtype]].below1MonthAfter14days += 1;
          } else {
            result.under18[vaxMap[val.vaxtype]].below1MonthAfter14days += 1;
          }
        } else if (diff < 60) {
          result.all[vaxMap[val.vaxtype]].below2MonthsAfter14days += 1;
          if (age >= 60) {
            result.above60[vaxMap[val.vaxtype]].below2MonthsAfter14days += 1;
          } else if (age >= 18) {
            result.between18and60[vaxMap[val.vaxtype]].below2MonthsAfter14days += 1;
          } else {
            result.under18[vaxMap[val.vaxtype]].below2MonthsAfter14days += 1;
          }
        } else if (diff < 90) {
          result.all[vaxMap[val.vaxtype]].below3MonthsAfter14days += 1;
          if (age >= 60) {
            result.above60[vaxMap[val.vaxtype]].below3MonthsAfter14days += 1;
          } else if (age >= 18) {
            result.between18and60[vaxMap[val.vaxtype]].below3MonthsAfter14days += 1;
          } else {
            result.under18[vaxMap[val.vaxtype]].below3MonthsAfter14days += 1;
          }
        } else {
          result.all[vaxMap[val.vaxtype]].above3MonthsAfter14days += 1;
          if (age >= 60) {
            result.above60[vaxMap[val.vaxtype]].above3MonthsAfter14days += 1;
          } else if (age >= 18) {
            result.between18and60[vaxMap[val.vaxtype]].above3MonthsAfter14days += 1;
          } else {
            result.under18[vaxMap[val.vaxtype]].above3MonthsAfter14days += 1;
          }
        }
      }
    } else if (!!val.date_dose1) {
      result.all[vaxMap[val.vaxtype]].partial += 1;
      if (age >= 60) {
        result.above60[vaxMap[val.vaxtype]].partial += 1;
      } else if (age >= 18) {
        result.between18and60[vaxMap[val.vaxtype]].partial += 1;
      } else {
        result.under18[vaxMap[val.vaxtype]].partial += 1;
      }
    } else {
      result.all.unvaxed += 1;
      if (age >= 60) {
        result.above60.unvaxed += 1;
      } else if (age >= 18) {
        result.between18and60.unvaxed += 1;
      } else {
        result.under18.unvaxed += 1;
      }
    }

    return result;
  }, { 
    all: JSON.parse(JSON.stringify(dataTemplate)), 
    above60: JSON.parse(JSON.stringify(dataTemplate)), 
    between18and60: JSON.parse(JSON.stringify(dataTemplate)),
    under18: JSON.parse(JSON.stringify(dataTemplate))
  });
}

function fetchCSV (url) {
  return fetch(url).then(response => response.text()).then(text => csv2JSON(text));
}

function groupByState (data) {
  return data.reduce(function (result, val) {
    if (!result[val.state]) result[val.state] = [];

    result[val.state].push(val);

    return result;
  }, {});
}

function resize (charts, elements) {
  return function () {
    elements.forEach(function (pie) {
      pie.style.height = pie.getBoundingClientRect().width + 'px';
    }); 
    charts.forEach(function (chart) {
      chart.resize();
    });
  }
}

(async function () {
  let charts = [];
  const deathDetailDataCache = {};
  function initCharts () {
    const currentState = stateSelector.value;

    document.title = categorySelector.value + '-' + currentState;

    if (categorySelector.value === 'Vaccine') {
      epidemicContainer.style.display = 'none';
      vaxContainer.style.display = 'block';

      if (currentState === states[0]) {
        charts = initVaxChart(vaxMalaysiaData, parseInt(populationData[0].pop), deathDetailsDataMalaysia);
        return;
      }

      const population = parseInt(populationData[states.indexOf(currentState)].pop);
      const data = deathDetailDataCache[currentState] || getDeathsDetailsByAgeAndVaxTypes(deathsDetailsDataByStates[currentState]);
      charts = initVaxChart(vaxStatesData[currentState], population, data);
      return;
    }

    epidemicContainer.style.display = 'block';
    vaxContainer.style.display = 'none';

    if (currentState === states[0]) {
      charts = initEpidemicChart(testsMalaysiaData, casesMalaysiaData, deathsMalaysiaData);
      return;
    }

    charts = initEpidemicChart(testsStatesData[currentState], casesStatesData[currentState], deathsStatesData[currentState]);
  };

  const vaxStatesUrl = 'https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_state.csv';
  const vaxMalaysiaUrl = 'https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/vaccination/vax_malaysia.csv';
  const populationUrl = 'https://raw.githubusercontent.com/CITF-Malaysia/citf-public/main/static/population.csv';
  const casesMalaysiaUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/cases_malaysia.csv';
  const testsMalaysiaUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/tests_malaysia.csv';
  const deathsMalaysiaUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/deaths_malaysia.csv';
  const casesStatesUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/cases_state.csv';
  const testsStatesUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/tests_state.csv';
  const deathsStatesUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/deaths_state.csv';
  const deathsDetailsUrl = 'https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/epidemic/linelist/linelist_deaths.csv';
  const [ 
    testsMalaysiaData,
    casesMalaysiaData,
    deathsMalaysiaData,
    deathsDetailsData,
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
    fetchCSV(deathsDetailsUrl),
    fetchCSV(testsStatesUrl).then(groupByState),
    fetchCSV(casesStatesUrl).then(groupByState),
    fetchCSV(deathsStatesUrl).then(groupByState),
    fetchCSV(populationUrl),
    fetchCSV(vaxMalaysiaUrl),
    fetchCSV(vaxStatesUrl).then(groupByState)
  ]);
  const mainContainer = document.getElementById('main-container');
  const vaxContainer = document.getElementById('vax-container');
  const epidemicContainer = document.getElementById('epidemic-container');
  const loadingCover = document.getElementById('loading-cover');
  const states = populationData.map(val => val.state);
  const stateSelector = document.getElementById('state-switch');
  const categorySelector = document.getElementById('category-switch');
  const pies = document.querySelectorAll('.pie');
  const deathDetailsDataMalaysia = getDeathsDetailsByAgeAndVaxTypes(deathsDetailsData);
  const deathsDetailsDataByStates = groupByState(deathsDetailsData);

  stateSelector.onchange = categorySelector.onchange = initCharts;
  stateSelector.innerHTML = states.map(function (val) {
    return `<option value="${val}">${val.replace('W.P. ', '')}</option>`;
  }).join('');

  loadingCover.ontransitionend = function () {
    loadingCover.style.display = 'none';
    mainContainer.style.display = 'block';
    customSelect('.switch');
    initCharts();
    window.setTimeout(resize(charts, pies), 0);
  };

  window.onresize = function () { 
    initCharts();
    window.setTimeout(resize(charts, pies), 1000);
  };

  loadingCover.style.opacity = 0;
})();