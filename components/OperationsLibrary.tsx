import React from 'react';
import { MousePointer, Type, Clock, CheckCircle, AlertTriangle, Settings, Globe } from 'lucide-react';
import { OPS_DESCRIPTIONS } from '../constants';
import { OperationType } from '../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  'mouse-pointer': <MousePointer size={24} />,
  'type': <Type size={24} />,
  'clock': <Clock size={24} />,
  'check-circle': <CheckCircle size={24} />,
  'alert-triangle': <AlertTriangle size={24} />,
  'globe': <Globe size={24} />,
};

export const OperationsLibrary: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Operation Library</h2>
        <p className="text-slate-500">Available actions for constructing automation workflows.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.keys(OPS_DESCRIPTIONS) as OperationType[]).map((opKey) => {
          const op = OPS_DESCRIPTIONS[opKey];
          return (
            <div key={opKey} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {ICON_MAP[op.icon]}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{op.label}</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                {op.description}
              </p>
              
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Configuration Parameters</h4>
                <div className="flex flex-wrap gap-2">
                  {opKey === 'INPUT' && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Value (String)</span>}
                  {opKey === 'OPEN_URL' && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">URL (String)</span>}
                  {opKey === 'WAIT' && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Duration (ms)</span>}
                  {opKey === 'ASSERT_TEXT' && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">Expected Text</span>}
                  {(opKey === 'CLICK' || opKey === 'INPUT' || opKey === 'ASSERT_TEXT') && (
                     <span className="text-xs bg-indigo-50 px-2 py-1 rounded text-indigo-700">Target Element</span>
                  )}
                   {opKey === 'CONFIRM_MODAL' && <span className="text-xs bg-green-50 px-2 py-1 rounded text-green-700">Auto-Accept</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 text-slate-300 p-6 rounded-xl mt-8 flex items-start gap-4">
        <Settings className="shrink-0 mt-1" />
        <div>
          <h3 className="text-white font-bold text-lg mb-2">Global Settings</h3>
          <p className="mb-4">Configure default timeouts and global assertion behavior.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Implicit Wait (ms)</label>
              <input type="number" defaultValue={5000} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Page Load Timeout (ms)</label>
              <input type="number" defaultValue={30000} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};