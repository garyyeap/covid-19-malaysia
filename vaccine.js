import { init } from 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.1.2/echarts.esm.min.js';

function getTotalVaxByTypes (data) {
  const types = ['pfizer1', 'pfizer2', 'sinovac1', 'sinovac2', 'astra1', 'astra2', 'cansino'];
  const initResult = types.reduce(function (result, val) { 
    result[val] = 0; 

    return result;
  }, {});

  return data.reduce(function (result, val, i) {
    types.forEach((type) => result[type] += parseInt(val[type]));

    return result;
  }, initResult);
}

export default function (vaxData, population) {
  const { astra1, astra2, cansino, pfizer1, pfizer2, sinovac1, sinovac2 } = getTotalVaxByTypes(vaxData);
  const vaxTypes = ['AstraZeneca', 'Cansino', 'Pfizer', 'Sinovac'];
  const vaxColors = ['#8213aa', '#00da7f', '#038eec', '#dd5010'];

  const vaxTypesData = {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{b} {a}: {c} ({d}%)'
    },
    legend: {
      data: vaxTypes,
      textStyle: {
        color: '#FFF'
      }
    },
    series: [{
      name: '1st dose',
      type: 'pie',
      radius: [0, '50%'],
      label: {
        formatter: '{d}%',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: astra1, name: vaxTypes[0], itemStyle: { color: vaxColors[0] }},
        { value: parseInt(cansino), name: vaxTypes[1], itemStyle: { color: vaxColors[1] }},
        { value: pfizer1, name: vaxTypes[2], itemStyle: { color: vaxColors[2] }},
        { value: sinovac1, name: vaxTypes[3], itemStyle: { color: vaxColors[3] }}
      ]
    },
    {
      name: '2nd dose',
      type: 'pie',
      radius: ['51%', '85%'],
      label: {
        formatter: '{d}%',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: astra2, name: vaxTypes[0], itemStyle: { color: vaxColors[0] }},
        { value: 0, name: vaxTypes[1], itemStyle: { color: vaxColors[1] }},
        { value: pfizer2, name: vaxTypes[2], itemStyle: { color: vaxColors[2] }},
        { value: sinovac2, name: vaxTypes[3], itemStyle: { color: vaxColors[3] }}
      ]
    }]
  };

  init(document.getElementById('vaccine-types'), 'dark').setOption(vaxTypesData);

  const total1stDose = [astra1, pfizer1, sinovac1].reduce((prevVal, val) => prevVal + val);
  const total2stDose = [astra2, pfizer2, sinovac2].reduce((prevVal, val) => prevVal + val);
  const vaccinatedData = {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{b} {a}: {c} ({d}%)'
    },
    legend: {
      data: ['Vaccinated', 'Unvaccinated'],
      textStyle: {
        color: '#FFF'
      }
    },
    series: [{
      name: '1st dose',
      type: 'pie',
      radius: [0, '50%'],
      label: {
        formatter: '{d}%',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: total1stDose, name: 'Vaccinated', itemStyle: { color: '#a2d39b' } },
        { value: Math.max(population - total1stDose, 0), name: 'Unvaccinated', itemStyle: { color: 'rgba(255, 255, 255, 0.4)' } }
      ]
    },
    {
      name: '2nd dose',
      type: 'pie',
      radius: ['51%', '85%'],
      label: {
        formatter: '{d}%',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: total2stDose, name: 'Vaccinated', itemStyle: { color: '#a2d39b' } },
        { value: Math.max(population - total2stDose, 0), name: 'Unvaccinated', itemStyle: { color: 'rgba(255, 255, 255, 0.4)' } }
      ]
    }]
  };

  init(document.getElementById('vaccinated'), 'dark').setOption(vaccinatedData);


  const fullVaxTimelineData = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: vaxTypes
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: Object.keys(vaxData.reduce(function (result, val) {
          result[val.date] = null;

          return result;
        }, {}))
      }
    ],
    yAxis: [
      {
        type: 'value',
        max: (total2stDose > population) ? total2stDose : population
      }
    ],
    series: (function () {
      const types = ['astra2', 'cansino', 'pfizer2', 'sinovac2'];

      return vaxData.reduce(function (result, val) {
        types.forEach(function (type, i) {
          const num = parseInt(val[type]);
          result[i].push((result[i][result[i].length - 1] || 0) + num);
        });

        return result;
      }, [[], [], [], []]).map(function (data, i) {
        return {
          name: vaxTypes[i],
          type: 'line',
          stack: 'day',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: vaxColors[i]
          },
          data: data
        }
      });
    })()
  };

  init(document.getElementById('fully-vaccinated-timeline'), 'dark').setOption(fullVaxTimelineData);

  const dailyVaxTimelineData = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: vaxTypes
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: vaxData.map((val) => val.date)
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: (function () {
      const types = [['astra1','astra2'], ['cansino'], ['pfizer1', 'pfizer2'], ['sinovac1', 'sinovac2']];

      return vaxData.reduce(function (result, val) {
        types.forEach(function (type, i) {
          result[i].push(type.reduce((total, dose) => total + parseInt(val[dose]), 0));
        });

        return result;
      }, [[], [], [], []]).map(function (data, i) {
        return {
          name: vaxTypes[i],
          type: 'line',
          stack: 'day',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            color: vaxColors[i]
          },
          data: data
        }
      });
    })()
  };

  init(document.getElementById('daily-vaccination-timeline'), 'dark').setOption(dailyVaxTimelineData);
}