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

function toLast2NoneZeroFixed (num) {
  if (num === 0) return num;
  return num.toFixed(1-Math.floor(Math.log(num)/Math.log(10)));
}

export default function (vaxData, population, deathsDetailsData) {
  const { astra1, astra2, cansino, pfizer1, pfizer2, sinovac1, sinovac2 } = getTotalVaxByTypes(vaxData);
  const vaxTypes = ['AstraZeneca', 'Cansino', 'Pfizer', 'Sinovac'];
  const vaxColors = ['#8213aa', '#00da7f', '#038eec', '#dd5010'];
  const charts = [];

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

  charts.push(init(document.getElementById('vaccine-brands'), 'dark'))
  charts[charts.length - 1].setOption(vaxTypesData);

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

  charts.push(init(document.getElementById('vaccinated'), 'dark'))
  charts[charts.length - 1].setOption(vaccinatedData);

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

  charts.push(init(document.getElementById('fully-vaccinated-timeline'), 'dark'))
  charts[charts.length - 1].setOption(fullVaxTimelineData);

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
          type: 'bar',
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

  charts.push(init(document.getElementById('daily-vaccination-timeline'), 'dark'))
  charts[charts.length - 1].setOption(dailyVaxTimelineData);

  const { all, above60, between18and60, under18 } = deathsDetailsData;
  const { totalFull14Days, totalFull, totalPartial, totalUnvaxed } = Object.keys(all).reduce(function (result, key) {
    if (Number.isInteger(all[key])) {
      result.totalUnvaxed += all[key];
      return result;
    }

    result.totalFull14Days += all[key].full14days;
    result.totalFull += all[key].full;
    result.totalPartial += all[key].partial;

    return result;
  }, { totalFull14Days: 0, totalFull: 0, totalPartial: 0, totalUnvaxed: 0 });

  const allDeathsWithVaxTypesData = {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{b} {a}: {c}%'
    },
    legend: {
      data: [vaxTypes[0], vaxTypes[2], vaxTypes[3]],
      textStyle: {
        color: '#FFF'
      }
    },
    series: [{
      name: 'Partial',
      type: 'pie',
      radius: [0, '30%'],
      label: {
        formatter: '{a}: {c}%',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: toLast2NoneZeroFixed(all.astra.partial / (astra1 - astra2) * 100), name: vaxTypes[0], itemStyle: { color: vaxColors[0] }},
        { value: toLast2NoneZeroFixed(all.pfizer.partial / (pfizer1 - pfizer2) * 100), name: 'Prizer', itemStyle: { color: vaxColors[2] }},
        { value: toLast2NoneZeroFixed(all.sinovac.partial / (sinovac1 - sinovac2) * 100), name: vaxTypes[3], itemStyle: { color: vaxColors[3] }}
      ]
    },
    {
      name: 'Full',
      type: 'pie',
      radius: ['31%', '55%'],
      label: {
        formatter: '{a}: {c}%',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: toLast2NoneZeroFixed(all.astra.full / astra2 * 100), name: vaxTypes[0], itemStyle: { color: vaxColors[0] }},
        { value: toLast2NoneZeroFixed(all.pfizer.full / pfizer2 * 100), name: vaxTypes[2], itemStyle: { color: vaxColors[2] }},
        { value: toLast2NoneZeroFixed(all.sinovac.full / sinovac2 * 100), name: vaxTypes[3], itemStyle: { color: vaxColors[3] }}
      ]
    },
    {
      name: 'Full(14 days)',
      type: 'pie',
      radius: ['56%', '80%'],
      label: {
        formatter: '{a}: {c}%',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: toLast2NoneZeroFixed(all.astra.full14days / astra2 * 100), name: vaxTypes[0], itemStyle: { color: vaxColors[0] }},
        { value: toLast2NoneZeroFixed(all.pfizer.full14days / pfizer2 * 100), name: vaxTypes[2], itemStyle: { color: vaxColors[2] }},
        { value: toLast2NoneZeroFixed(all.sinovac.full14days / sinovac2 * 100), name: vaxTypes[3], itemStyle: { color: vaxColors[3] }}
      ]
    }]
  };

  charts.push(init(document.getElementById('all-deaths-vs-vaxed'), 'dark'))
  charts[charts.length - 1].setOption(allDeathsWithVaxTypesData);

  const allDeathsVaxedVsUnvaxed = {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      data: ['Full(14 days)', 'Full', 'Partial', 'Unvaccinated'],
      textStyle: {
        color: '#FFF'
      }
    },
    series: [{
      type: 'pie',
      radius: [0, '85%'],
      label: {
        formatter: '{c}',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: totalUnvaxed, name: 'Unvaccinated', itemStyle: { color: 'rgba(255, 255, 255, 0.4)' }},
        { value: totalFull, name: 'Full' },
        { value: totalFull14Days, name: 'Full(14 days)' },
        { value: totalPartial, name: 'Partial' }
      ]
    }]
  };

  charts.push(init(document.getElementById('all-deaths-unvaxed-vs-vaxed'), 'dark'))
  charts[charts.length - 1].setOption(allDeathsVaxedVsUnvaxed);

  const periods = ['< 30days', '< 60days', '< 90days', '> 90days'];

  const astraDeathsPeriod = {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      data: periods,
      textStyle: {
        color: '#FFF'
      }
    },
    series: [{
      type: 'pie',
      radius: [0, '75%'],
      label: {
        formatter: '{c}',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: all.astra.below1MonthAfter14days, name: periods[0] },
        { value: all.astra.below2MonthsAfter14days, name: periods[1] },
        { value: all.astra.below3MonthsAfter14days, name: periods[2] },
        { value: all.astra.above3MonthsAfter14days, name: periods[3] },
      ]
    }]
  };

  charts.push(init(document.getElementById('astra-deaths-period'), 'dark'))
  charts[charts.length - 1].setOption(astraDeathsPeriod);

  const prizerDeathsPeriod = {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      data: periods,
      textStyle: {
        color: '#FFF'
      }
    },
    series: [{
      type: 'pie',
      radius: [0, '75%'],
      label: {
        formatter: '{c}',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: all.pfizer.below1MonthAfter14days, name: periods[0] },
        { value: all.pfizer.below2MonthsAfter14days, name: periods[1] },
        { value: all.pfizer.below3MonthsAfter14days, name: periods[2] },
        { value: all.pfizer.above3MonthsAfter14days, name: periods[3] },
      ]
    }]
  };

  charts.push(init(document.getElementById('pfizer-deaths-period'), 'dark'))
  charts[charts.length - 1].setOption(prizerDeathsPeriod);

  const sinovacDeathsPeriod = {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      data: periods,
      textStyle: {
        color: '#FFF'
      }
    },
    series: [{
      type: 'pie',
      radius: [0, '75%'],
      label: {
        formatter: '{c}',
        position: 'inner'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: all.sinovac.below1MonthAfter14days, name: periods[0] },
        { value: all.sinovac.below2MonthsAfter14days, name: periods[1] },
        { value: all.sinovac.below3MonthsAfter14days, name: periods[2] },
        { value: all.sinovac.above3MonthsAfter14days, name: periods[3] },
      ]
    }]
  };

  charts.push(init(document.getElementById('sinovac-deaths-period'), 'dark'));
  charts[charts.length -1].setOption(sinovacDeathsPeriod);

  return charts;
}