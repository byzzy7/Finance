import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Legend, Tooltip)

ChartJS.defaults.color = 'rgba(255,255,255,0.7)'
ChartJS.defaults.borderColor = 'rgba(255,255,255,0.1)'
ChartJS.defaults.font.family = "'Segoe UI', system-ui, sans-serif"
