import os

BASE_DIR = 'talentguard-retention-ai/frontend'

files = {
    'tailwind.config.js': '''/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
''',
    'src/index.css': '''@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}
''',
    'src/App.tsx': '''import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
''',
    'src/components/Sidebar.tsx': '''export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md hidden md:block">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-indigo-600">TalentGuard</h2>
        <p className="text-sm text-gray-500 mt-1">HR Intelligence</p>
      </div>
      <nav className="mt-6">
        <a className="block py-2.5 px-6 rounded transition duration-200 bg-indigo-50 text-indigo-700" href="#">Dashboard</a>
        <a className="block py-2.5 px-6 rounded transition duration-200 hover:bg-gray-100 text-gray-700" href="#">Watchlist</a>
        <a className="block py-2.5 px-6 rounded transition duration-200 hover:bg-gray-100 text-gray-700" href="#">What-If Simulator</a>
        <a className="block py-2.5 px-6 rounded transition duration-200 hover:bg-gray-100 text-gray-700" href="#">Reports</a>
      </nav>
    </aside>
  );
}
''',
    'src/components/Header.tsx': '''export default function Header() {
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm border-b">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700">TechNova HR</span>
      </div>
    </header>
  );
}
''',
    'src/pages/Dashboard.tsx': '''import { useState, useEffect } from 'react';
import { getHealth, getMetrics } from '../services/api';
import type { HealthResponse, MetricsResponse } from '../types/api';

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const healthData = await getHealth();
        setHealth(healthData);
        if (healthData.models_ready) {
          const metricsData = await getMetrics();
          setMetrics(metricsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading data...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-md">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">System Status</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {health?.status === 'ok' ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Models Ready</h3>
          <p className={`mt-2 text-3xl font-semibold ${health?.models_ready ? 'text-indigo-600' : 'text-amber-500'}`}>
            {health?.models_ready ? 'Yes' : 'No'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Base Attrition Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-800">
            {metrics ? (metrics.base_rate * 100).toFixed(1) + '%' : 'N/A'}
          </p>
        </div>
      </div>

      {metrics && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Model Performance ({metrics.selected_model})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">OOF ROC-AUC</p>
              <p className="text-2xl font-semibold">{metrics.models[metrics.selected_model].oof_roc_auc.toFixed(4)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">OOF PR-AUC</p>
              <p className="text-2xl font-semibold">{metrics.models[metrics.selected_model].oof_pr_auc.toFixed(4)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Precision@50</p>
              <p className="text-2xl font-semibold">{metrics.models[metrics.selected_model].oof_precision_50.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}
      
      {!health?.models_ready && (
         <div className="p-6 bg-blue-50 text-blue-800 rounded-md border border-blue-100">
            <h3 className="font-semibold text-lg">Setup Required</h3>
            <p className="mt-2">The models have not been trained yet. Please run the training pipeline:</p>
            <code className="block mt-2 bg-blue-100 p-2 rounded text-sm">python -m src.train</code>
         </div>
      )}
    </div>
  );
}
''',
    'src/services/api.ts': '''import { HealthResponse, MetricsResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('Failed to fetch health status');
  return response.json();
}

export async function getMetrics(): Promise<MetricsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/metrics`);
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
}
''',
    'src/types/api.ts': '''export interface HealthResponse {
  status: string;
  models_ready: boolean;
  data_ready: boolean;
}

export interface ModelMetrics {
  oof_roc_auc: number;
  oof_pr_auc: number;
  oof_precision_50: number;
  holdout_roc_auc: number;
  holdout_pr_auc: number;
  holdout_precision_50: number;
}

export interface MetricsResponse {
  selected_model: string;
  base_rate: number;
  models: Record<string, ModelMetrics>;
}
''',
    '.env': 'VITE_API_URL=http://localhost:8000\n'
}

for filepath, content in files.items():
    full_path = os.path.join(BASE_DIR, filepath)
    os.makedirs(os.path.dirname(full_path) or '.', exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print('React setup complete.')
