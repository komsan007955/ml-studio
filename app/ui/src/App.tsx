import React, { useState, useEffect } from 'react';
import { searchExperiments } from './services/mlService';

import {
  LayoutGrid, Database, Filter, Search, Code2, BookOpen, Calculator, BarChart3, Table2,
  Monitor, Settings, ChevronLeft, ChevronRight, MoreVertical, Download, Waypoints, Bell,
  Info, Layout, Share2, RefreshCw, List, Copy, FolderTree, File, Maximize2, X,
  SlidersHorizontal, ChevronDown, FlaskConical,
  CirclePlus,
  PencilLine,
  Plus,
  Trash2,
  Pencil,
  Minimize2
} from 'lucide-react';

// --- TYPES & INTERFACES ---

interface StatusDotProps {
  color: 'orange' | 'teal' | 'green' | 'red' | 'purple' | string;
}

interface FilterButtonProps {
  label: string;
  icon?: React.ReactNode;
}

interface CardProps {
  title: string;
  description: string;
  modifiedBy: string;
  date: string;
  icon: React.ReactNode;
  imageUrl: string;
}

interface SidebarItem {
  id: string;
  icon?: React.ReactNode;
  isImage?: boolean;
  imageUrl?: string;
}

interface RunData {
  id: string;
  runName: string;
  runId: string;
  color: string;
  created: string;
  duration: string;
  datasets: string;
  user: string;
  source: string;
  models: string;
  f1: string;
  agg_depth: string;
  threshold: string;
  selected?: boolean;
}

// --- MOCK DATA ---

const mockRunsData: RunData[] = [
  { id: '1', runName: 'luxuriant-yak-214', runId: '1f899ed35c194ce0af63ec8470606e96', color: 'orange', created: '8 days ago', duration: '56.5s', datasets: '-', user: 'chaiya', source: 'zeppelin_python.py', models: 'fraud_predictor:v5', f1: '1', agg_depth: '2', threshold: '0.5' },
  { id: '2', runName: 'caring-hog-2', runId: 'b4ef74f0e61a4237b440cb56e7b060f1', color: 'teal', created: '18 days ago', duration: '58.4s', datasets: '-', user: 'saelee', source: 'zeppelin_python.py', models: 'fraud_predictor:v3', f1: '0.995206', agg_depth: '2', threshold: '0.5' },
  { id: '3', runName: 'victorious-elk-937', runId: 'a7c88ef0e61a4237b440cb56e7b060f1', color: 'green', created: '21 days ago', duration: '1.4min', datasets: '-', user: 'jkasem', source: 'zeppelin_python.py', models: 'fraud_predictor:v1', f1: '0.992430', agg_depth: '2', threshold: '-' },
];

// --- SHARED UI COMPONENTS ---

const StatusDot: React.FC<StatusDotProps> = ({ color }) => {
  const colorMap: Record<string, string> = {
    orange: 'bg-orange-400',
    teal: 'bg-teal-400',
    green: 'bg-green-500',
    red: 'bg-red-400',
    purple: 'bg-purple-400'
  };
  return <span className={`w-2 h-2 rounded-full ${colorMap[color] || 'bg-gray-400'}`}></span>;
};

const FilterButton: React.FC<FilterButtonProps> = ({ label, icon }) => (
  <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors">
    {icon && <span className="text-gray-400">{icon}</span>}
    {label}
    <ChevronDown size={14} className="text-gray-400" />
  </button>
);

// --- DASHBOARD ---

const UpdateCard: React.FC<CardProps> = ({ title, description, modifiedBy, date, icon, imageUrl }) => (
  <div className="flex-1 min-w-[300px] bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
    <div className="w-24 h-24 bg-gray-50 rounded flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      ) : (
        <BarChart3 size={32} className="text-gray-200" />
      )}
    </div>
    <div className="flex-grow">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-orange-500">{icon}</span>
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical size={16} />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1 italic">{description}</p>
      <div className="mt-4">
        <p className="text-[10px] text-gray-400">Modified by:</p>
        <p className="text-[10px] text-gray-500">{modifiedBy} - {date}</p>
      </div>
    </div>
  </div>
);

const DashboardView: React.FC = () => {
  const recentUpdates: CardProps[] = [
    { title: 'test_dashboard', description: 'No dashboard Description', modifiedBy: 'beatrice', date: '19/06/2025 22:44:24', icon: <BarChart3 size={14} />, imageUrl: '/dash-list.png' },
    { title: 'test_app', description: 'No application Description', modifiedBy: 'beatrice', date: '19/06/2025 22:12:41', icon: <Layout size={14} />, imageUrl: '/app-list.png' },
    { title: 'quickstart_tut', description: 'No project Description', modifiedBy: 'beatrice', date: '19/06/2025 22:11:23', icon: <Database size={14} />, imageUrl: '/project-list.png' }
  ];

  return (
    <div className="flex-grow overflow-auto p-6">
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-sm text-gray-800">Recent Update</h2>
            <span className="text-xs text-gray-400">1 - 3 of 3</span>
            <div className="flex gap-2 ml-4">
              <ChevronLeft size={16} className="text-gray-300 cursor-not-allowed" />
              <ChevronRight size={16} className="text-gray-300 cursor-not-allowed" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recentUpdates.map((update, idx) => <UpdateCard key={idx} {...update} />)}
        </div>
      </section>

      <section>
        <h2 className="font-bold text-sm text-gray-800 mb-4">Recent Export Data</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Query</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Timerange</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">File Format</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Create Date</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">Success</span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-700">example</td>
                <td className="px-4 py-4 text-xs text-gray-500 max-w-md truncate">
                  SELECT quickstart_tut.product FROM quickstart_tut quickstart_tut FULL JOIN quickstart_tut2 quickst... <span className="text-orange-400 cursor-pointer">Show more</span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-500">20/06/2025 00:00:00 - 20/06/2025 23:59:59</td>
                <td className="px-4 py-4 text-xs text-gray-500">excel</td>
                <td className="px-4 py-4 text-xs text-gray-500">19/06/2025 - 22:09:29</td>
                <td className="px-4 py-4 text-center">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const SnapshotDrawer: React.FC<{
  modelName: string | null;
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  onFullView: () => void; // alt to transition to the full page
}> = ({ modelName, isOpen, isExpanded, onClose, onToggleExpand, onFullView }) => {
  if (!isOpen) return null;

  return (
  <>
      {/* dark transparent overlay */}
      <div 
        className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-[2px] z-[90] transition-opacity duration-300"
        onClick={onClose} 
      />
      <div 
        className={`fixed bg-white shadow-2xl border border-gray-100 transition-all duration-300 ease-out z-[100] flex flex-col overflow-hidden ${
          isExpanded 
            ? 'top-0 left-0 w-full h-full rounded-none' 
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-6xl h-auto max-h-[85vh] rounded-[32px]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">{modelName?.split(':')[0]}</h3>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                {modelName?.includes(':') ? modelName.split(':')[1] : 'Latest Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onToggleExpand} className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Two column layout */}
        <div className="flex-grow overflow-auto p-8">
          <div className="flex gap-10">
            
            {/* Version lineage */}
            <div className="w-1/3 border-r border-gray-100 pr-10">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Version Lineage</h4>
              <div className="relative space-y-8">
                {/* vertical divider */}
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100" />
                
                {[5, 4, 3].map((v) => (
                  <div key={v} className="relative flex items-start gap-4 group cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border-2 border-white z-10 mt-1 transition-colors ${v === 5 ? 'bg-orange-500 shadow-md shadow-orange-200' : 'bg-gray-300 group-hover:bg-orange-300'}`} />
                    <div>
                      <div className="text-xs font-bold text-gray-800">Version {v}</div>
                      <div className="text-[10px] text-gray-400">Deployed 2 days ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Snapshot metrics */}
            <div className="flex-grow">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Metric Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mean Accuracy</p>
                      <p className="text-xl font-mono font-bold text-gray-900">0.9421</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Latency</p>
                      <p className="text-xl font-mono font-bold text-gray-900">45ms</p>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer acctions */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700"
          >
            Dismiss
          </button>
          <button 
            onClick={onFullView}
            className="px-8 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl shadow-xl shadow-gray-200 hover:bg-black transition-all"
          >
            View Full Details
          </button>
        </div>
      </div>
  </>
  );
};

// --- MODELS REGISTRY ---

const ModelsRegistryView: React.FC<{ onSelectModel: (name: string) => void }> = ({ onSelectModel }) => {
  const [activeSnapshot, setActiveSnapshot] = useState<string | null>(null);
  const [isSnapshotExpanded, setIsSnapshotExpanded] = useState(false);
  const mockModels = [
    { name: '380kjlieJlaCndWu80Cw6fKXzevt', latest: '—', alias: '—', createdBy: 'jkasem', lastModified: '2026-01-08 23:39:15', tags: '—' },
    { name: 'IQgsFT', latest: 'Version 6', alias: '—', createdBy: 'test', lastModified: '2026-01-18 10:16:56', tags: '—' },
    { name: 'locust_model_00ksm2', latest: '—', alias: '—', createdBy: 'chaiya', lastModified: '2026-01-01 19:01:11', tags: '—' },
    { name: 'fraud_predictor_main', latest: 'Version 5', alias: 'Production', createdBy: 'saelee', lastModified: '2026-01-20 14:22:01', tags: 'task: LR' },
  ];
  

  return (
   <div className="flex-grow flex flex-col p-6 bg-white overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Registered Models</h2>
          <p className="text-xs text-gray-500 mt-1">
            Manage and version your deployed machine learning models.
          </p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded shadow-sm transition-all">
          Create Model
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="relative flex-grow max-w-lg">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Filter registered models by name or tags..."
            className="w-full bg-white border border-gray-200 rounded px-9 py-2 text-xs text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-2 border-gray-100">
            <Info size={14} className="hover:text-gray-600 cursor-help" />
          </div>
        </div>
      </div>

      {/* Table (scrollable) */}
      <div className="flex-grow overflow-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Latest version</th>
              <th className="px-4 py-3">Aliased versions</th>
              <th className="px-4 py-3">Created by</th>
              <th className="px-4 py-3">Last modified</th>
              <th className="px-4 py-3 text-right">Tags</th>
            </tr>
          </thead>

          <tbody className="text-[11px]">
            {mockModels.map((model, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white"
              >
<td className="px-4 py-3">
                  <span
                    onClick={() => setActiveSnapshot(model.name)} // Trigger Snapshot
                    className="text-blue-600 hover:underline cursor-pointer font-semibold"
                  >
                    {model.name}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {model.latest !== '—' ? (
                    <span 
                      onClick={() => setActiveSnapshot(`${model.name}:${model.latest}`)} // Trigger Snapshot
                      className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-bold text-[10px] cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      {model.latest}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {model.alias !== '—' ? (
                    <span 
                      onClick={() => setActiveSnapshot(`${model.name}:${model.alias}`)}
                      className="px-2 py-0.5 bg-green-50 text-green-600 rounded border border-green-100 font-bold text-[10px] cursor-pointer hover:bg-green-100 transition-colors"
                    >
                      {model.alias}
                    </span>
                  ) : '—'}
                </td>


                <td className="px-4 py-3 text-gray-500">
                  {model.createdBy || '—'}
                </td>

                <td className="px-4 py-3 text-gray-400 font-mono">
                  {model.lastModified}
                </td>

                <td className="px-4 py-3 text-right">
                  {model.tags !== '—' ? (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[9px] font-medium border border-purple-200">
                      {model.tags}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SnapshotDrawer 
        modelName={activeSnapshot} 
        isOpen={!!activeSnapshot} 
        isExpanded={isSnapshotExpanded}
        onClose={() => { setActiveSnapshot(null); setIsSnapshotExpanded(false); }}
        onToggleExpand={() => setIsSnapshotExpanded(!isSnapshotExpanded)}
        onFullView={() => {
            if (activeSnapshot) {
                onSelectModel(activeSnapshot.split(':')[0]); // Navigates to the details page
                setActiveSnapshot(null);
            }
        }}
      />
    </div>
  );
};

const ModelDetailsView: React.FC<{ modelName: string; onBack: () => void }> = ({ modelName, onBack }) => {
  return (
    <div className="flex-grow flex flex-col p-6 bg-white overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={onBack} className="text-blue-600 hover:underline text-xs flex items-center gap-1 mb-2">
          <ChevronLeft size={14} /> Registered Models
        </button>
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-800">{modelName}</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={20} />
          </button>
        </div>
        <div className="flex gap-8 mt-2 text-[11px] text-gray-500">
          <span>Created Time: <span className="text-gray-700">2026-01-08 23:39:15</span></span>
          <span>Last Modified: <span className="text-gray-700">2026-01-08 23:39:15</span></span>
        </div>
      </div>

      {/* Description  */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <ChevronDown size={14} className="text-gray-400" />
          <h3 className="font-bold text-sm text-gray-700">Description</h3>
          <button className="text-blue-600 text-xs hover:underline ml-2">Edit</button>
        </div>
        <p className="text-xs text-gray-400 italic ml-6">None</p>
      </div>

      {/* Tags */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <ChevronDown size={14} className="text-gray-400" />
          <h3 className="font-bold text-sm text-gray-700">Tags</h3>
        </div>
        <div className="ml-6 border border-gray-200 rounded-lg overflow-hidden max-w-4xl">
           <table className="w-full text-left text-[11px]">
             <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
               <tr>
                 <th className="px-4 py-2 w-1/3">Name</th>
                 <th className="px-4 py-2 w-1/3">Value</th>
                 <th className="px-4 py-2">Actions</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                 <td className="px-2 py-2"><input type="text" placeholder="Name" className="w-full bg-white border rounded px-2 py-1 focus:outline-none focus:border-orange-500" /></td>
                 <td className="px-2 py-2"><input type="text" placeholder="Value" className="w-full bg-white border rounded px-2 py-1 focus:outline-none focus:border-orange-500" /></td>
                 <td className="px-2 py-2"><button className="bg-white border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 font-bold">Add</button></td>
               </tr>
             </tbody>
           </table>
        </div>
      </div>

      {/* Versions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronDown size={14} className="text-gray-400" />
            <h3 className="font-bold text-sm text-gray-700">Versions</h3>
            <button className="ml-4 border border-gray-200 px-3 py-1 text-xs rounded text-gray-400 cursor-not-allowed bg-gray-50 font-bold">Compare</button>
          </div>

        </div>

        {/* Empty Table container */}
        <div className="min-h-[200px] border border-gray-200 rounded-lg border-dashed flex flex-col items-center justify-center bg-gray-50/30">
          <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300 mb-4">
            <Plus size={24} />
          </div>
          <p className="text-[11px] text-gray-500">
            No models versions are registered yet. 
          </p>
        </div>
      </div>
    </div>
  );
};

// --- EXPERIMENTS ---
const ExperimentSidebar: React.FC<{ 
  experiments: any[], 
  selectedId: string, 
  onSelect: (id: string) => void,
  isCollapsed: boolean,
  toggle: () => void 
}> = ({ experiments, selectedId, onSelect, isCollapsed, toggle }) => {
  return (
// Outer container: relative so the button can be positioned against it
    <div className={`flex flex-col border-r border-gray-200 transition-all duration-300 relative bg-white ${isCollapsed ? 'w-0' : 'w-72'}`}>
      
<button 
  onClick={(e) => {
    e.stopPropagation();
    toggle();
  }}
  className={`absolute top-12 z-50 w-6 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 shadow-sm text-gray-400 font-mono text-xs transition-all duration-300 ${
    isCollapsed 
      ? '-right-7'
      : '-right-3'
  }`}
  title={isCollapsed ? "Expand" : "Collapse"}
>
  {isCollapsed ? '»' : '«'}
</button>

      {/* Content Visibility Wrapper */}
      <div className={`flex flex-col h-full overflow-hidden ${isCollapsed ? 'invisible opacity-0' : 'visible opacity-100'}`}>
        
        {/* Sidebar Header & Search */}
        <div className="p-3 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experiments</span>
            <button className="text-gray-400 hover:text-orange-500 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filter experiments..." 
              className="w-full text-xs bg-white 
              border border-gray-200 rounded-md pl-8 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 placeholder:text-gray-400"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
          </div>
        </div>

        {/* Experiment List Items */}
        <div className="flex-grow overflow-y-auto mt-2">
          {experiments.map((exp) => (
            <div 
              key={exp.experiment_id}
              onClick={() => onSelect(exp.experiment_id)}
              className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer border-l-4 transition-all ${
                selectedId === exp.experiment_id 
                  ? 'bg-orange-50/60 border-orange-500 text-orange-500 font-medium' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 rounded border-gray-300 bg-white text-orange-500 focus:ring-0 cursor-pointer" 
                  checked={selectedId === exp.experiment_id}
                  onChange={() => {}} // Controlled by row click
                />
                <span className="text-[11px] truncate whitespace-nowrap">{exp.name}</span>
              </div>
              
              <div className={`flex items-center gap-1.5 ${selectedId === exp.experiment_id ? 'flex' : 'hidden group-hover:flex'}`}>
                <Pencil size={12} className="text-gray-400 hover:text-orange-500" />
                <Trash2 size={12} className="text-gray-400 hover:text-red-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ExperimentsView: React.FC = () => {
  // --- Dynamic implementation ---
  const [experimentsList, setExperimentsList] = useState<any[]>([]);

  const [selectedExperimentId, setSelectedExperimentId] = useState('');
  useEffect(() => {
    const loadExperiments = async () => {
      try {
        setIsLoading(true);
        const data = await searchExperiments({ view_type: "ACTIVE_ONLY" });
        
        // MLflow returns { experiments: [{experiment_id, name, ...}] }
        const formattedList = data.experiments || [];
        setExperimentsList(formattedList);
        
        // Auto-select the first one if available
        if (formattedList.length > 0) {
          setSelectedExperimentId(formattedList[0].experiment_id);
        }
      } catch (error) {
        console.error("Failed to fetch experiments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExperiments();
  }, []);
  const [detailsPanelTab, setDetailsPanelTab] = useState('Artifacts');
  const [selectedRunId, setSelectedRunId] = useState<string | null>('1');
  const exampleTags = [
    { name: 'task: LR', color: 'bg-pink-400/80' },
    { name: 'task: RF', color: 'bg-indigo-400/80' },
    { name: 'validation_status: approved', color: 'bg-sky-600' }
  ];
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const selectedRun = mockRunsData.find(r => r.id === selectedRunId);

  return (

    <div className="flex h-full overflow-hidden bg-white">
      {/* Sidebar Component */}
      <ExperimentSidebar 
        experiments={experimentsList}
        selectedId={selectedExperimentId}
        onSelect={setSelectedExperimentId}
        isCollapsed={isSidebarCollapsed}
        toggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
        <div className="flex-grow overflow-auto p-4">
          <div className="w-full">

            {/* Experiment Title & Metadata Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">demo_fraud_train</h2>
                <button className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded">
                  <Share2 size={14} /> Share
                </button>
              </div>
              <div className="text-[11px] text-gray-500 flex flex-col gap-1 items-end">
                <div className="flex items-center gap-1">Path: <span className="font-medium text-gray-700">demo_fraud_train</span> <Copy size={10} className="cursor-pointer" /></div>
                <div className="flex items-center gap-1">Experiment ID: <span className="font-medium text-gray-700">1</span></div>
                <div className="flex items-center gap-1">Artifact Location: <span className="font-medium text-gray-700 truncate max-w-xs">/data/zeus/mlflow/mlartifacts/1</span> <Copy size={10} className="cursor-pointer" /></div>
              </div>
            </div>

            {/* Toolbar Section */}
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <input type="text" placeholder="Query runs..." className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded text-xs w-64 focus:outline-none focus:border-orange-500" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="border border-gray-200 rounded flex overflow-hidden">
                    <button className="px-2 py-1.5 bg-gray-100 text-gray-600"><List size={16} /></button>
                    <button className="px-2 py-1.5 bg-white text-gray-400 hover:bg-gray-50"><BarChart3 size={16} /></button>
                  </div>
                  <FilterButton label="Actions" />
                  <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded">New Run</button>
                  <button className="text-gray-400 hover:text-gray-600 p-1"><RefreshCw size={16} /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <FilterButton label="Time created" />
                <FilterButton label="State: Active" />
                <FilterButton label="Sort: f1_score" icon={<SlidersHorizontal size={12} />} />
                <FilterButton label="Group by" />
                <FilterButton label="Datasets" />
                <span className="text-xs text-gray-400 ml-auto">3 runs</span>
              </div>
            </div>

            {/* Runs Data Table */}
            <div className="border border-gray-200 rounded-t-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  {/* Row 1: Grouped Categories */}
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-2 border-r border-gray-200"></th>

                    {/* Increased colSpan to 7 to include Source and Models */}
                    <th colSpan={7} className="px-4 py-2 text-left border-r border-gray-200 bg-gray-100/30">
                      Attributes
                    </th>

                    <th className="px-4 py-2 text-left border-r border-gray-200 bg-blue-50/30 text-blue-600">
                      Metrics
                    </th>

                    <th className="px-4 py-2 text-left bg-purple-50/30 text-purple-600">
                      Params
                    </th>
                  </tr>

                  {/* Row 2: Sub-labels */}
                  <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3 w-8 border-r border-gray-200">
                      <input type="checkbox" className="rounded text-orange-500" checked readOnly />
                    </th>
                    <th className="px-4 py-3">Run Name</th>
                    <th className="px-4 py-3">Run ID</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">User</th>
                    {/* New Columns */}
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3 border-r border-gray-200">Models</th>

                    <th className="px-4 py-3 bg-gray-100/50 border-r border-gray-200">f1_score</th>

                    <th className="px-4 py-3 bg-gray-100/50">agg_depth</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {mockRunsData.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => setSelectedRunId(run.id)}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${selectedRunId === run.id ? 'bg-orange-50/50' : ''}`}
                    >
                      <td className="px-4 py-3 border-r border-gray-100">
                        <input type="checkbox" className="rounded text-orange-500" checked={selectedRunId === run.id} readOnly />
                      </td>
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <StatusDot color={run.color} />
                        <span className="text-blue-600 hover:underline">{run.runName}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono">{run.runId.substring(0, 8)}...</td>
                      <td className="px-4 py-3 text-gray-500">{run.created}</td>
                      <td className="px-4 py-3 text-gray-500">{run.duration}</td>
                      <td className="px-4 py-3 text-gray-500">{run.user}</td>
                      {/* New Data Cells */}
                      <td className="px-4 py-3 text-gray-500">{run.source}</td>
                      <td className="px-4 py-3 border-r border-gray-100">
                        {run.models !== '-' ? (
                          <div className="flex items-center gap-1.5">
                            {/* Hyperlink to future details page */}
                            <a
                              href={`/models/${run.models.split(':')[0]}`}
                              onClick={(e) => e.preventDefault()} // Prevents page reload for now
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {run.models.split(':')[0]}
                            </a>

                            {/* Version Badge */}
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded border border-gray-200 uppercase">
                              {run.models.split(':')[1] || 'v1'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 bg-gray-50/50 border-r border-gray-100 font-medium">{run.f1}</td>
                      <td className="px-4 py-3 bg-gray-50/50 font-medium">{run.agg_depth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resize Handle */}
            <div className="h-3 bg-gray-50 border-x border-b border-gray-200 cursor-ns-resize flex items-center justify-center hover:bg-gray-100 transition-colors">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Details Panel */}
            {selectedRun && (
              <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-5 min-h-[300px] shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    {selectedRun.runName}
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                      Finished
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Maximize2 size={16} className="cursor-pointer hover:text-gray-600" />
                    <X
                      size={18}
                      className="cursor-pointer hover:text-gray-600"
                      onClick={() => setSelectedRunId(null)}
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-100">
                  {['Overview', 'Artifacts'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailsPanelTab(tab)}
                      className={`px-4 py-2 text-[11px] font-bold transition-all rounded-t-md border-t border-l border-r ${detailsPanelTab === tab
                        ? 'bg-white border-gray-200 text-orange-500 -mb-[1px] z-10 relative'
                        : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto bg-white">
                  {detailsPanelTab === 'Overview' && (
                    <div className="space-y-6">
                      {/* Description */}
                      <section>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-xs font-bold text-gray-700">Description</h4>
                          <button className="text-orange-500 hover:text-orange-600">
                            <PencilLine size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 italic">No description</p>
                      </section>

                      {/* Details Table */}
                      <section>
                        <h4 className="text-xs font-bold text-gray-700 mb-3">Details</h4>
                        <div className="border border-gray-200 rounded-md overflow-hidden text-[11px]">
                          {[
                            { label: 'Created at', value: '2026-01-01 18:58:01' },
                            { label: 'Created by', value: selectedRun.user },
                            { label: 'Experiment ID', value: '490', hasCopy: true },
                            { label: 'Status', value: 'Running', isStatus: true },
                            { label: 'Run ID', value: selectedRun.runId, hasCopy: true },
                            { label: 'Duration', value: selectedRun.duration },
                            { label: 'Datasets used', value: '—' },
                            { label: 'Tags', value: <CirclePlus size={14} />, isTags: true },
                            { label: 'Source', value: selectedRun.source },
                            { label: 'Logged models', value: '—' },
                            { label: 'Registered models', value: '—' },
                          ].map((row, idx) => (
                            <div
                              key={idx}
                              className={`flex border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                            >
                              <div className="w-48 px-3 py-2 text-gray-500 font-medium border-r border-gray-100">
                                {row.label}
                              </div>
                              <div className="flex-grow px-3 py-2 flex items-center gap-2">
                                {row.isTags ? (
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-1">
                                    <div className="flex flex-wrap gap-1.5 items-center">
                                      {exampleTags.map((tag, i) => (
                                        <span
                                          key={i}
                                          className={`px-2.5 py-0.5 ${tag.color} text-white text-[10px] font-medium rounded-full whitespace-nowrap shadow-sm`}
                                        >
                                          {tag.name}
                                        </span>
                                      ))}
                                    </div>

                                    {/* Add icon */}
                                    <button
                                      className="flex items-center justify-center p-1 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
                                      title="Add Tag"
                                    >
                                      {row.value}
                                    </button>
                                  </div>
                                ) : row.isStatus ? (
                                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold uppercase">
                                    <RefreshCw size={10} className="animate-spin" /> {row.value}
                                  </span>
                                ) : (
                                  <span className="text-gray-700 break-all">{row.value}</span>
                                )}

                                {row.hasCopy && (
                                  <Copy size={10} className="text-gray-300 cursor-pointer hover:text-orange-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Parameters & Metrics */}
                      <div className="grid grid-cols-2 gap-4 pb-4">
                        {['Parameters (0)', 'Metrics (0)'].map((title) => (
                          <div
                            key={title}
                            className="border border-gray-200 rounded-md p-4 min-h-[150px] flex flex-col items-center justify-center bg-gray-50/30"
                          >
                            <h4 className="text-[11px] font-bold text-gray-700 self-start mb-auto">
                              {title}
                            </h4>
                            <List size={24} className="text-gray-200 mb-2" />
                            <span className="text-[10px] text-gray-400">
                              No data recorded
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailsPanelTab === 'Artifacts' && (
                    <div className="flex h-48">
                      <div className="w-1/3 pr-4 border-r border-gray-100">
                        <div className="text-[10px] text-gray-400 mb-2 break-all font-mono">
                          {`/artifacts/${selectedRun.runId}/fraud_predictor`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                          <ChevronDown size={14} className="text-gray-400" />
                          <FolderTree size={16} className="text-orange-400" />
                          <span className="font-medium">Sparkml</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 ml-6 mt-1 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                          <File size={16} className="text-gray-400" />
                          <span>metadata</span>
                        </div>
                      </div>
                      <div className="w-2/3 pl-4 bg-gray-50/50 rounded border border-dashed border-gray-200 m-2 flex items-center justify-center">
                        <span className="text-xs text-gray-400">
                          Select an artifact to preview
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
  );
}

// --- ML STUDIO ---

const MLStudioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Experiments');
const [selectedModel, setSelectedModel] = useState<string | null>(null);

  // Reset selected model if the user leaves the Models tab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedModel(null);
  };

  return (

    <div className="flex flex-col flex-grow overflow-hidden bg-white">
      {/* Page Tabs */}
      <div className="bg-gray-100 pt-3 px-4 flex-shrink-0 border-b border-gray-200">
        <div className="flex gap-1">
          {['Models', 'Experiments'].map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
            px-6 py-2 text-xs font-bold transition-all duration-200 rounded-t-md border-t border-l border-r
            ${isActive
                    ? 'bg-white border-gray-200 text-gray-800 -mb-[1px] z-10 relative'
                    : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                  }
          `}
              >
                <div className="flex items-center gap-2">
                  {tab === 'Models' ? <Waypoints size={14} /> : <FlaskConical size={14} />}
                  {tab}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Rendering */}
<div className="flex-grow overflow-hidden flex flex-col">
        {activeTab === 'Models' ? (
          selectedModel ? (
            <ModelDetailsView 
              modelName={selectedModel} 
              onBack={() => setSelectedModel(null)} 
            />
          ) : (
            <ModelsRegistryView onSelectModel={setSelectedModel} />
          )
        ) : (
          <ExperimentsView /> 
        )}
      </div>

    </div>
  );
};

// --- SIDEBAR ---

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('mlstudio');

  const sidebarTop: SidebarItem[] = [
    { id: 'dashboard', icon: <LayoutGrid size={20} /> },
    { id: 'db', icon: <Database size={20} /> },
    { id: 'filter', icon: <Filter size={20} /> },
    { id: 'search', icon: <Search size={20} /> },
    { id: 'code', icon: <Code2 size={20} /> },
    { id: 'book', icon: <BookOpen size={20} /> },
    { id: 'calc', icon: <Calculator size={20} /> },
    { id: 'chart', icon: <BarChart3 size={20} /> },
    { id: 'table', icon: <Table2 size={20} /> },
    { id: 'monitor', icon: <Monitor size={20} /> },
    { id: 'mlstudio', imageUrl: '/mlstudio.png', isImage: true },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-gray-700 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-14 bg-[#1a1a1a] flex flex-col items-center py-4 gap-4 flex-shrink-0 z-20">
        <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center mb-2">
          <img
            src="/blen-ent-white-no-word.svg"
            alt="Blendata logo"
            className="w-full h-full object-contain"
          />
        </div>

        {sidebarTop.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`p-2 cursor-pointer transition-all relative group ${
              activeView === item.id 
                ? 'text-orange-500' 
                : 'text-[#999999] hover:text-white'
            }`}
          >
            {item.isImage && item.imageUrl ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div
                  className={`w-full h-full transition-all ${
                    activeView === item.id
                      ? 'bg-orange-500 opacity-100' 
                      : 'bg-[#999999] opacity-60 group-hover:bg-white group-hover:opacity-100'
                  }`}
                  style={{
                    maskImage: `url(${item.imageUrl})`,
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskImage: `url(${item.imageUrl})`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                  }}
                />
              </div>
            ) : (
              <div className={`${activeView === item.id ? 'text-orange-500' : 'group-hover:text-white'}`}>
                {item.icon}
              </div>
            )}
            {activeView === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r" />
            )}
          </div>
        ))}

        <div className="mt-auto p-2 text-gray-400 hover:text-white cursor-pointer">
          <Settings size={20} />
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-sm font-semibold text-gray-700">
            {activeView === 'mlstudio' ? 'ML Studio' : 'Blendata Enterprise'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              <LayoutGrid size={14} className="text-gray-500" />
              <span className="text-[11px] font-medium text-gray-600">default</span>
            </div>
            <Info size={18} className="text-gray-300 cursor-pointer hover:text-gray-500" />
            <div className="relative cursor-pointer group">
              <Bell size={18} className="text-gray-300 group-hover:text-gray-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">4</span>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
              <img
                src="/user-default.png"
                alt="User profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {activeView === 'mlstudio' ? <MLStudioView /> : <DashboardView />}

        <footer className="h-8 bg-white border-t border-gray-100 flex items-center justify-center flex-shrink-0">
          <p className="text-[9px] text-gray-400">Copyright© 2026. All right reserved. Blendata Co., Ltd. v4.5.2</p>
        </footer>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;