import { init } from 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.1.2/echarts.esm.min.js';

function combineTestsAndCasesData (testsData, casesData) {
  casesData = [...casesData];
  casesData.unshift({});

  const diff = casesData.length - testsData.length;
  
  return testsData.reduce(function (result, val, i) {
    const { cases_new, cases_import, cases_recovered, date } = casesData[i + diff];
    const totalCases = parseInt(cases_new) + parseInt(cases_import);
    const totalTests = parseInt(val.pcr) + parseInt(val['rtk-ag']);
    const sevenDaysTotal = casesData.slice(Math.max(i + diff - 6, diff), i + diff + 1).reduce(function (total, curr, i) {
      return total + parseInt(curr.cases_new) + parseInt(curr.cases_import);
    }, 0);

    result.dates.push(date);
    result.cases.push(cases_new);
    result.casesImport.push(cases_import);
    result.casesRecovered.push(cases_recovered);
    result.pcr.push(val.pcr);
    result.rtk.push(val['rtk-ag']);
    result.positiveRate.push((totalCases / totalTests * 100).toFixed(2));
    result.sevenDaysAverage.push(parseInt(sevenDaysTotal / 7));
    return result;
  }, {
    pcr: [],
    rtk: [],
    cases: [],
    casesImport: [],
    casesRecovered: [],
    dates: [],
    positiveRate: [],
    sevenDaysAverage: []
  });
}

export default function (testsData, casesData, deathsData) {
  const charts = [];
  const { pcr, rtk, cases, casesImport, casesRecovered, dates, positiveRate, sevenDaysAverage } = combineTestsAndCasesData(testsData, casesData);
  const [deaths, deathDates] = deathsData.reduce(function (result, { date, deaths_new}) {
    result[0].push(deaths_new);
    result[1].push(date);

    return result;
  }, [[], []]);
  
  const testsAndCasesOptions = {
    legend: {
      data: ['PCR tests', 'RTK-AG tests', 'New cases', 'Cases import', 'Positive rate', '7 days average']
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    xAxis: {
      data: dates
    },
    yAxis: {},
    dataZoom: [{
      type: 'slider',
      start: 0,
      end: 100
    }, 
    {
      start: 0,
      end: 100
    }],
    series: [{
      name: 'PCR tests',
      type: 'bar',
      stack: 'tests',
      data: pcr
    }, 
    {
      name: 'RTK-AG tests',
      type: 'bar',
      stack: 'tests',
      data: rtk
    },
    {
      name: 'New cases',
      type: 'bar',
      stack: 'cases',
      data: cases
    }, 
    {
      name: 'Cases import',
      type: 'bar',
      stack: 'cases',
      data: casesImport,
    },
    {
      name: 'Positive rate',
      type: 'line',
      data: positiveRate,
      zlevel: 101,
    },
    {
      name: '7 days average',
      type: 'line',      
      zlevel: 100,
      data: sevenDaysAverage
    }]
  };

  charts.push(init(document.getElementById('tests-and-cases-timeline'), 'dark'));
  charts[charts.length - 1].setOption(testsAndCasesOptions);

  const deathsOptions = {
    tooltip: {
      trigger: 'item'
    },
    xAxis: {
      data: deathDates
    },
    yAxis: {},
    dataZoom: [{
      type: 'slider',
      start: 0,
      end: 100
    }, 
    {
      start: 0,
      end: 100
    }],
    series: [{
      name: 'Deaths',
      type: 'bar',
      data: deaths
    }]
  }

  charts.push(init(document.getElementById('deaths-timeline'), 'dark'));
  charts[charts.length -1].setOption(deathsOptions);

  return charts;
}