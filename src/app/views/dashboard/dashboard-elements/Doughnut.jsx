import React from 'react';
import { useTheme } from '@mui/system';
import ReactEcharts from 'echarts-for-react';

const DoughnutChart = ({ height, color = [] }) => {
  const theme = useTheme();

  const option = {
    legend: {
      show: true,
      itemGap: 20,
      icon: 'circle',
      bottom: 0,
      textStyle: {
        color: theme.palette.text.secondary,
        fontSize: 13,
        fontFamily: 'roboto',
      },
    },
    tooltip: {
      show: false,
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    xAxis: [
      {
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],

    series: [
      {
        name: 'Traffic Rate',
        type: 'pie',
        radius: ['45%', '72.55%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        hoverOffset: 5,
        stillShowZeroSum: false,
        label: {
          normal: {
            show: false,
            position: 'center',
            textStyle: {
              color: theme.palette.text.secondary,
              fontSize: 13,
              fontFamily: 'roboto',
            },
            formatter: '{a}',
          },
          emphasis: {
            show: true,
            textStyle: {
              fontSize: '14',
              fontWeight: 'normal',
            },
            formatter: '{b} \n{c} ({d}%)',
          },
        },
        labelLine: {
          normal: {
            show: false,
          },
        },
        data: [
          {
            value: 55,
            name: 'Internet',
          },
          {
            value: 25,
            name: 'Telefon',
          },
          {
            value: 20,
            name: 'Osobiście',
          },
        ],
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <ReactEcharts
      style={{ height: height }}
      option={{
        ...option,
        color: [...color],
      }}
    />
  );
};

export default DoughnutChart;
