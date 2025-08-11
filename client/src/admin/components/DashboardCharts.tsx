import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: any;
  title: string;
}

export const BookingActivityChart: React.FC<ChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.map((item: any) => item._id),
    datasets: [
      {
        label: 'Bookings',
        data: data.map((item: any) => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const UserRegistrationChart: React.FC<ChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.map((item: any) => item._id),
    datasets: [
      {
        label: 'New Users',
        data: data.map((item: any) => item.count),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const FacilityApprovalChart: React.FC<ChartProps> = ({ data, title }) => {
  const statusColors: Record<string, string> = {
    approved: 'rgba(75, 192, 192, 0.6)',
    pending: 'rgba(255, 206, 86, 0.6)',
    rejected: 'rgba(255, 99, 132, 0.6)',
  };

  const chartData = {
    labels: data.map((item: any) => item._id),
    datasets: [
      {
        data: data.map((item: any) => item.count),
        backgroundColor: data.map((item: any) => statusColors[item._id] || 'rgba(201, 203, 207, 0.6)'),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export const ActiveSportsChart: React.FC<ChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.map((item: any) => item._id),
    datasets: [
      {
        label: 'Facilities',
        data: data.map((item: any) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const EarningsChart: React.FC<ChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.map((item: any) => item.month),
    datasets: [
      {
        label: 'Earnings (₹)',
        data: data.map((item: any) => item.amount),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};