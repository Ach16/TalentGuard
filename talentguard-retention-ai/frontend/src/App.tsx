import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import WatchList from './pages/WatchList';
import EmployeeInsights from './pages/EmployeeInsights';
import Simulator from './pages/Simulator';
import Analytics from './pages/Analytics';
import ActionPlans from './pages/ActionPlans';
import ModelPerformance from './pages/ModelPerformance';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [targetEmployeeId, setTargetEmployeeId] = useState<number | null>(null);

  const handleNavigateToSimulator = (employeeId: number) => {
    setTargetEmployeeId(employeeId);
    setCurrentView('simulator');
  };

  const getHeaderProps = () => {
    switch (currentView) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Workforce Attrition Risk & High-Level Metrics' };
      case 'watchlist':
        return { title: 'Top-50 Retention Watch List', subtitle: 'Prioritized Employees by Predictive Attrition Risk' };
      case 'employee-insights':
        return { title: 'Employee Risk Insights', subtitle: 'Localized Factors & Stay-Interview Recommendations' };
      case 'simulator':
        return { title: 'What-If Retention Simulator', subtitle: 'Predictive Parameter Perturbation & Intervention Testing' };
      case 'analytics':
        return { title: 'Advanced Analytics & Intelligence', subtitle: 'Stage 3 Expected Loss, Fairness Audit & Hotspots' };
      case 'action-plans':
        return { title: 'Retention Action Outreach Drafts', subtitle: 'Human-in-the-Loop Approved Outreach Strategies' };
      case 'model-performance':
        return { title: 'Model Diagnostics & Rationale', subtitle: 'Stratified 5-Fold Cross Validation Benchmarks' };
      default:
        return { title: 'TalentGuard Dashboard', subtitle: 'HR Retention Intelligence Platform' };
    }
  };

  const headerProps = getHeaderProps();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1020] text-slate-100 selection:bg-[#695CFF]/30 selection:text-indigo-200">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={headerProps.title} subtitle={headerProps.subtitle} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0B1020] p-6 lg:p-8">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'watchlist' && <WatchList onNavigateToSimulator={handleNavigateToSimulator} />}
          {currentView === 'employee-insights' && <EmployeeInsights onNavigateToSimulator={handleNavigateToSimulator} />}
          {currentView === 'simulator' && <Simulator initialEmployeeId={targetEmployeeId} />}
          {currentView === 'analytics' && <Analytics />}
          {currentView === 'action-plans' && <ActionPlans />}
          {currentView === 'model-performance' && <ModelPerformance />}
        </main>
      </div>
    </div>
  );
}

export default App;
