import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// We must register the components we're using with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PollutantChart = ({ data }) => {
  // Extract the pollutant data from the API response
  const pollutants = data.list[0].components;
  
  // Format the data for Chart.js
  const chartData = {
    labels: ['PM2.5', 'PM10', 'NO₂', 'O₃', 'CO'],
    datasets: [
      {
        label: 'Pollutant Level (µg/m³)',
        data: [
          pollutants.pm2_5,
          pollutants.pm10,
          pollutants.no2,
          pollutants.o3,
          pollutants.co / 1000 // Convert CO from µg/m³ to mg/m³ for a better scale
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Live Pollutant Concentration',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.label === 'CO') {
               label += `${context.parsed.y.toFixed(2)} mg/m³`; // Special unit for CO
            } else {
               label += `${context.parsed.y} µg/m³`;
            }
            return label;
          }
        }
      }
    },
  };

  return <Bar options={options} data={chartData} />;
};

export default PollutantChart;