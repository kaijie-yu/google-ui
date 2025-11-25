import React, { useState } from 'react';
import { Layout, PlayCircle, Database, LogOut, Command } from 'lucide-react';
import { Login } from './components/Login';
import { ElementRepo } from './components/ElementRepo';
import { OperationsLibrary } from './components/OperationsLibrary';
import { WorkflowBuilder } from './components/WorkflowBuilder';
import { INITIAL_ELEMENTS, INITIAL_WORKFLOWS } from './constants';
import { UIElement, TestWorkflow } from './types';

// App Logic
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'WORKFLOW' | 'OPERATIONS' | 'ELEMENTS'>('WORKFLOW');
  
  // Data State (Mock Database)
  const [elements, setElements] = useState<UIElement[]>(INITIAL_ELEMENTS);
  const [workflows, setWorkflows] = useState<TestWorkflow[]>(INITIAL_WORKFLOWS);

  // Handlers
  const handleAddElement = (el: UIElement) => {
    setElements([...elements, el]);
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(e => e.id !== id));
  };

  const handleSaveWorkflow = (wf: TestWorkflow) => {
    const exists = workflows.find(w => w.id === wf.id);
    if (exists) {
      setWorkflows(workflows.map(w => w.id === wf.id ? wf : w));
    } else {
      setWorkflows([...workflows, wf]);
    }
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter(w => w.id !== id));
  };

  if (!isLoggedIn) {
    return <Login onLogin={setIsLoggedIn} />;
  }

  const navItems = [
    { id: 'WORKFLOW', label: 'Test Workflows', icon: <PlayCircle size={20} /> },
    { id: 'OPERATIONS', label: 'Operations', icon: <Command size={20} /> },
    { id: 'ELEMENTS', label: 'Elements Repo', icon: <Database size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Layout size={24} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">AutoFlow</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'WORKFLOW' && 'Test Automation Builder'}
            {activeTab === 'OPERATIONS' && 'Operations Reference'}
            {activeTab === 'ELEMENTS' && 'UI Element Repository'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-sm font-medium text-slate-600">System Ready</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 ml-4">
              A
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'ELEMENTS' && (
            <ElementRepo 
              elements={elements} 
              onAddElement={handleAddElement} 
              onDeleteElement={handleDeleteElement} 
            />
          )}
          
          {activeTab === 'OPERATIONS' && (
            <OperationsLibrary />
          )}

          {activeTab === 'WORKFLOW' && (
            <WorkflowBuilder 
              workflows={workflows}
              elements={elements}
              onSaveWorkflow={handleSaveWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;