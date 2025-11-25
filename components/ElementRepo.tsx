import React, { useState } from 'react';
import { Plus, Search, Trash2, Code, Database } from 'lucide-react';
import { UIElement } from '../types';

interface ElementRepoProps {
  elements: UIElement[];
  onAddElement: (el: UIElement) => void;
  onDeleteElement: (id: string) => void;
}

export const ElementRepo: React.FC<ElementRepoProps> = ({ elements, onAddElement, onDeleteElement }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newLocator, setNewLocator] = useState('');
  const [newLocatorType, setNewLocatorType] = useState<'ID' | 'XPATH' | 'CSS'>('XPATH');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLocator) return;

    const newElement: UIElement = {
      id: Date.now().toString(),
      name: newName,
      locator: newLocator,
      locatorType: newLocatorType,
    };

    onAddElement(newElement);
    setNewName('');
    setNewLocator('');
    setIsModalOpen(false);
  };

  const filteredElements = elements.filter(el => 
    el.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    el.locator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">UI Element Repository</h2>
          <p className="text-slate-500">Manage your Page Object Model elements here.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add Element
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or locator..." 
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Locator Type</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Locator Value</th>
              <th className="px-6 py-4 text-right font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredElements.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  <Database className="mx-auto mb-3 opacity-20" size={48} />
                  No elements found. Add one to get started.
                </td>
              </tr>
            ) : (
              filteredElements.map((el) => (
                <tr key={el.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{el.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {el.locatorType}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600 truncate max-w-xs" title={el.locator}>
                    {el.locator}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDeleteElement(el.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="text-indigo-600" /> New UI Element
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Element Label <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Login Button"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={newLocatorType}
                    onChange={(e: any) => setNewLocatorType(e.target.value)}
                  >
                    <option value="XPATH">XPath</option>
                    <option value="CSS">CSS</option>
                    <option value="ID">ID</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Locator <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                    placeholder="//div[@id='...']"
                    value={newLocator}
                    onChange={e => setNewLocator(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors font-medium"
                >
                  Save Element
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};