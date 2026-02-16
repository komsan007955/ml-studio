import React, { useState, useEffect } from 'react';
import {
  LayoutGrid, Database, Filter, Search, Code2, BookOpen, Calculator,
  BarChart3, Table2, Monitor, Settings, ChevronLeft, ChevronRight,
  MoreVertical, Download, Waypoints, Bell, Info, Layout, Share2,
  RefreshCw, List, Copy, FolderTree, File, Maximize2, X, Minimize2,
  SlidersHorizontal, ChevronDown, FlaskConical, CirclePlus, PencilLine,
  Plus, Trash2, Pencil, Check
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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
}

interface ModelData {
  name: string;
  latest: string;
  alias: string;
  createdBy: string;
  lastModified: string;
  tags: string;
}

interface ExperimentData {
  experiment_id: string;
  name: string;
  artifact_location: string;
  created_by?: string;
  created_at?: string;
  last_updated?: string;
  deleted_by?: string;
  deleted_at?: string;
  tags?: ExperimentTag[];
  description?: string;
}

interface CreateExperimentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateExperiment: (name: string, artifactLocation?: string) => Promise<void>;
  currentUserId: string;
}

interface ExperimentValidationResult {
  isValid: boolean;
  error?: string;
  softDeletedExperiment?: ExperimentData;
}

interface ExperimentTag {
  key: string;
  value: string;
  created_by?: string;
  created_at?: string;
}

interface StatusDotProps {
  color: 'orange' | 'teal' | 'green' | 'red' | 'purple' | string;
}

interface Artifact {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: string;
  modified?: string;
  uri?: string;
  children?: Artifact[];
}

interface ArtifactPermissions {
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  permissionLevel: 'none' | 'view' | 'edit' | 'admin';
}

// ============================================================================
// CONSTANTS & MOCK DATA
// ============================================================================

const MOCK_RUNS: RunData[] = [
  {
    id: '1', runName: 'luxuriant-yak-214', runId: '1f899ed35c194ce0af63ec8470606e96',
    color: 'orange', created: '8 days ago', duration: '56.5s', datasets: '-',
    user: 'chaiya', source: 'zeppelin_python.py', models: 'fraud_predictor:v5',
    f1: '1', agg_depth: '2', threshold: '0.5'
  },
  {
    id: '2', runName: 'caring-hog-2', runId: 'b4ef74f0e61a4237b440cb56e7b060f1',
    color: 'teal', created: '18 days ago', duration: '58.4s', datasets: '-',
    user: 'saelee', source: 'zeppelin_python.py', models: 'fraud_predictor:v3',
    f1: '0.995206', agg_depth: '2', threshold: '0.5'
  },
  {
    id: '3', runName: 'victorious-elk-937', runId: 'a7c88ef0e61a4237b440cb56e7b060f1',
    color: 'green', created: '21 days ago', duration: '1.4min', datasets: '-',
    user: 'jkasem', source: 'zeppelin_python.py', models: 'fraud_predictor:v1',
    f1: '0.992430', agg_depth: '2', threshold: '-'
  },
];

const MOCK_MODELS: ModelData[] = [
  { name: '380kjlieJlaCndWu80Cw6fKXzevt', latest: '—', alias: '—', createdBy: 'jkasem', lastModified: '2026-01-08 23:39:15', tags: '—' },
  { name: 'IQgsFT', latest: 'Version 6', alias: '—', createdBy: 'test', lastModified: '2026-01-18 10:16:56', tags: '—' },
  { name: 'locust_model_00ksm2', latest: '—', alias: '—', createdBy: 'chaiya', lastModified: '2026-01-01 19:01:11', tags: '—' },
  { name: 'fraud_predictor_main', latest: 'Version 5', alias: 'Production', createdBy: 'saelee', lastModified: '2026-01-20 14:22:01', tags: 'task: LR' },
];

const MOCK_EXPERIMENTS: ExperimentData[] = [
  {
    experiment_id: '1',
    name: 'demo_fraud_train',
    artifact_location: '/data/zeus/mlflow/mlartifacts/1',
    created_by: 'chaiya',
    created_at: '2026-01-01T10:00:00Z',
    last_updated: '2026-02-15T14:32:21Z',
    description: 'Fraud detection model training experiment',
    tags: [
      { key: 'team', value: 'data-science', created_by: 'chaiya', created_at: '2026-01-01T10:00:00Z' },
      { key: 'project', value: 'fraud-detection', created_by: 'chaiya', created_at: '2026-01-01T10:00:00Z' },
      { key: 'environment', value: 'production', created_by: 'chaiya', created_at: '2026-01-01T10:00:00Z' }
    ]
  },
  {
    experiment_id: '2',
    name: 'churn_prediction',
    artifact_location: '/data/zeus/mlflow/mlartifacts/2',
    created_by: 'saelee',
    created_at: '2026-01-15T14:20:00Z',
    last_updated: '2026-02-15T14:32:21Z',
    description: 'Customer churn prediction model',
    tags: [
      { key: 'team', value: 'analytics', created_by: 'saelee', created_at: '2026-01-15T14:20:00Z' },
      { key: 'priority', value: 'high', created_by: 'saelee', created_at: '2026-01-15T14:20:00Z' }
    ]
  },
  {
    experiment_id: '3',
    name: 'customer_segmentation',
    artifact_location: '/data/zeus/mlflow/mlartifacts/3',
    created_by: 'jkasem',
    created_at: '2026-01-20T09:15:00Z',
    last_updated: '2026-02-15T14:32:21Z',
    description: 'RFM customer segmentation',
    tags: [
      { key: 'team', value: 'marketing', created_by: 'jkasem', created_at: '2026-01-20T09:15:00Z' },
      { key: 'model', value: 'kmeans', created_by: 'jkasem', created_at: '2026-01-20T09:15:00Z' },
      { key: 'clusters', value: '5', created_by: 'jkasem', created_at: '2026-01-20T09:15:00Z' }
    ]
  }
];

const MOCK_SOFT_DELETED_EXPERIMENTS: ExperimentData[] = [
  {
    experiment_id: '4',
    name: 'demo_fraud_train',
    artifact_location: '/data/zeus/mlflow/mlartifacts/4',
    created_by: 'chaiya',
    created_at: '2026-01-01T10:00:00Z',
    last_updated: '2026-02-15T14:32:21Z',
    deleted_by: 'chaiya',
    deleted_at: '2026-02-10T10:30:00Z'
  },
  {
    experiment_id: '5',
    name: 'old_experiment',
    artifact_location: '/data/zeus/mlflow/mlartifacts/5',
    created_by: 'beatrice',
    created_at: '2026-01-15T14:20:00Z',
    last_updated: '2026-02-15T14:32:21Z',
    deleted_by: 'beatrice',
    deleted_at: '2026-02-09T15:45:00Z'
  },
];

const RECENT_UPDATES = [
  {
    title: 'test_dashboard', description: 'No dashboard Description',
    modifiedBy: 'beatrice', date: '19/06/2025 22:44:24',
    icon: <BarChart3 size={14} />, imageUrl: '/dash-list.png'
  },
  {
    title: 'test_app', description: 'No application Description',
    modifiedBy: 'beatrice', date: '19/06/2025 22:12:41',
    icon: <Layout size={14} />, imageUrl: '/app-list.png'
  },
  {
    title: 'quickstart_tut', description: 'No project Description',
    modifiedBy: 'beatrice', date: '19/06/2025 22:11:23',
    icon: <Database size={14} />, imageUrl: '/project-list.png'
  }
];

const STATUS_COLORS: Record<string, string> = {
  orange: 'bg-orange-400',
  teal: 'bg-teal-400',
  green: 'bg-green-500',
  red: 'bg-red-400',
  purple: 'bg-purple-400'
};

const EXAMPLE_TAGS = [
  { name: 'task: LR', color: 'bg-pink-400/80' },
  { name: 'task: RF', color: 'bg-indigo-400/80' },
  { name: 'validation_status: approved', color: 'bg-sky-600' }
];

const MOCK_USER_PERMISSIONS: ArtifactPermissions = {
  canDelete: true,
  canEdit: true,
  canView: true,
  permissionLevel: 'edit' // Change to 'view' to test disabled state
};

const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: '1',
    name: 'preprocessor',
    type: 'directory',
    path: '/artifacts/preprocessor',
    uri: 's3://mlflow-artifacts/1/preprocessor',
    modified: '2026-02-15 14:32:21',
    children: [
      {
        id: '1-1',
        name: 'config.json',
        type: 'file',
        path: '/artifacts/preprocessor/config.json',
        size: '2.4 KB',
        modified: '2026-02-15 14:32:21'
      },
      {
        id: '1-2',
        name: 'vocab.txt',
        type: 'file',
        path: '/artifacts/preprocessor/vocab.txt',
        size: '156 KB',
        modified: '2026-02-15 14:32:21'
      }
    ]
  },
  {
    id: '2',
    name: 'estimator',
    type: 'directory',
    path: '/artifacts/estimator',
    uri: 's3://mlflow-artifacts/1/estimator',
    modified: '2026-02-15 14:32:22',
    children: [
      {
        id: '2-1',
        name: 'model.pkl',
        type: 'file',
        path: '/artifacts/estimator/model.pkl',
        size: '45.2 MB',
        modified: '2026-02-15 14:32:22'
      },
      {
        id: '2-2',
        name: 'metadata.json',
        type: 'file',
        path: '/artifacts/estimator/metadata.json',
        size: '1.8 KB',
        modified: '2026-02-15 14:32:22'
      }
    ]
  },
  {
    id: '3',
    name: 'metrics.json',
    type: 'file',
    path: '/artifacts/metrics.json',
    size: '3.2 KB',
    modified: '2026-02-15 14:32:23',
    uri: 's3://mlflow-artifacts/1/metrics.json'
  }
];

// ============================================================================
// UTILITIES
// ============================================================================

const formatRunId = (id: string): string => `${id.substring(0, 8)}...`;
const parseModelVersion = (model: string): { name: string; version: string } => {
  const [name, version = 'v1'] = model.split(':');
  return { name, version };
};

// ============================================================================
// SHARED UI COMPONENTS
// ============================================================================

const StatusDot: React.FC<{ color: string }> = ({ color }) => (
  <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[color] || 'bg-gray-400'}`} />
);

const FilterButton: React.FC<{ label: string; icon?: React.ReactNode }> = ({ label, icon }) => (
  <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors">
    {icon && <span className="text-gray-400">{icon}</span>}
    {label}
    <ChevronDown size={14} className="text-gray-400" />
  </button>
);

const SearchInput: React.FC<{ placeholder: string; className?: string }> = ({
  placeholder,
  className = "w-64"
}) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
    <input
      type="text"
      placeholder={placeholder}
      className="w-full bg-white border border-gray-200 rounded pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-orange-500"
    />
  </div>
);

const CopyButton: React.FC<{ text?: string }> = ({ text }) => (
  <Copy size={10} className="text-gray-300 cursor-pointer hover:text-orange-500" onClick={() => text && navigator.clipboard?.writeText(text)} />
);

const Badge: React.FC<{ children: React.ReactNode; variant?: 'blue' | 'green' | 'purple' | 'gray' }> = ({
  children,
  variant = 'gray'
}) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    gray: 'bg-gray-100 text-gray-500 border-gray-200'
  };

  return (
    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${variants[variant]}`}>
      {children}
    </span>
  );
};

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================

const UpdateCard: React.FC<{
  title: string;
  description: string;
  modifiedBy: string;
  date: string;
  icon: React.ReactNode;
  imageUrl: string;
}> = ({ title, description, modifiedBy, date, icon, imageUrl }) => (
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

const DashboardView: React.FC = () => (
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
        {RECENT_UPDATES.map((update, idx) => (
          <UpdateCard key={idx} {...update} />
        ))}
      </div>
    </section>

    <section>
      <h2 className="font-bold text-sm text-gray-800 mb-4">Recent Export Data</h2>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              {['Status', 'File Name', 'Query', 'Timerange', 'File Format', 'Create Date', 'Action'].map((header) => (
                <th key={header} className="px-4 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4">
                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                  Success
                </span>
              </td>
              <td className="px-4 py-4 text-xs text-gray-700">example</td>
              <td className="px-4 py-4 text-xs text-gray-500 max-w-md truncate">
                SELECT quickstart_tut.product...{' '}
                <span className="text-orange-400 cursor-pointer">Show more</span>
              </td>
              <td className="px-4 py-4 text-xs text-gray-500">
                20/06/2025 00:00:00 - 20/06/2025 23:59:59
              </td>
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

// ============================================================================
// MODELS REGISTRY COMPONENTS
// ============================================================================

const SnapshotDrawer: React.FC<{
  modelName: string | null;
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  onFullView: () => void;
}> = ({ modelName, isOpen, isExpanded, onClose, onToggleExpand, onFullView }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-[2px] z-[90] transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={`fixed bg-white shadow-2xl border border-gray-100 transition-all duration-300 ease-out z-[100] flex flex-col overflow-hidden ${isExpanded
          ? 'top-0 left-0 w-full h-full rounded-none'
          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-6xl h-auto max-h-[85vh] rounded-[32px]'
          }`}
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {modelName?.split(':')[0]}
              </h3>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                {modelName?.includes(':') ? modelName.split(':')[1] : 'Latest Overview'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleExpand}
              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
            >
              {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-auto p-8">
          <div className="flex gap-10">
            <div className="w-1/3 border-r border-gray-100 pr-10">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                Version Lineage
              </h4>
              <div className="relative space-y-8">
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100" />
                {[5, 4, 3].map((v) => (
                  <div key={v} className="relative flex items-start gap-4 group cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border-2 border-white z-10 mt-1 transition-colors ${v === 5 ? 'bg-orange-500 shadow-md shadow-orange-200' : 'bg-gray-300 group-hover:bg-orange-300'
                      }`} />
                    <div>
                      <div className="text-xs font-bold text-gray-800">Version {v}</div>
                      <div className="text-[10px] text-gray-400">Deployed 2 days ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                Metric Performance
              </h4>
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

        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700">
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

const ModelsRegistryView: React.FC<{ onSelectModel: (name: string) => void }> = ({ onSelectModel }) => {
  const [activeSnapshot, setActiveSnapshot] = useState<string | null>(null);
  const [isSnapshotExpanded, setIsSnapshotExpanded] = useState(false);

  const handleSnapshotClose = () => {
    setActiveSnapshot(null);
    setIsSnapshotExpanded(false);
  };

  const handleFullView = () => {
    if (activeSnapshot) {
      onSelectModel(activeSnapshot.split(':')[0]);
      setActiveSnapshot(null);
    }
  };

  return (
    <div className="flex-grow flex flex-col p-6 bg-white overflow-hidden">
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

      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <SearchInput placeholder="Filter registered models by name or tags..." className="flex-grow max-w-lg" />
      </div>

      <div className="flex-grow overflow-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Latest version</th>
              <th className="px-4 py-3">Aliased versions</th>
              <th className="px-4 py-3">Created by</th>
              <th className="px-4 py-3">Last modified</th>
              <th className="px-4 py-3 text-right">Tags</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {MOCK_MODELS.map((model) => (
              <tr key={model.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors bg-white">
                <td className="px-4 py-3">
                  <span
                    onClick={() => setActiveSnapshot(model.name)}
                    className="text-blue-600 hover:underline cursor-pointer font-semibold"
                  >
                    {model.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {model.latest !== '—' ? (
                    <span
                      onClick={() => setActiveSnapshot(`${model.name}:${model.latest}`)}
                      className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-bold text-[10px] cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      {model.latest}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  {model.alias !== '—' ? (
                    <span
                      onClick={() => setActiveSnapshot(`${model.name}:${model.alias}`)}
                      className="px-2 py-0.5 bg-green-50 text-green-600 rounded border border-green-100 font-bold text-[10px] cursor-pointer hover:bg-green-100 transition-colors"
                    >
                      {model.alias}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">{model.createdBy || '—'}</td>
                <td className="px-4 py-3 text-gray-400 font-mono">{model.lastModified}</td>
                <td className="px-4 py-3 text-right">
                  {model.tags !== '—' ? (
                    <Badge variant="purple">{model.tags}</Badge>
                  ) : '—'}
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
        onClose={handleSnapshotClose}
        onToggleExpand={() => setIsSnapshotExpanded(!isSnapshotExpanded)}
        onFullView={handleFullView}
      />
    </div>
  );
};

const ModelDetailsView: React.FC<{ modelName: string; onBack: () => void }> = ({ modelName, onBack }) => {
  const model = MOCK_MODELS.find(m => m.name === modelName) || MOCK_MODELS[0];

  return (
    <div className="flex-grow flex flex-col p-6 bg-white overflow-auto">
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
          <span>Created Time: <span className="text-gray-700">{model.lastModified}</span></span>
          <span>Last Modified: <span className="text-gray-700">{model.lastModified}</span></span>
        </div>
      </div>

      <div className="mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <ChevronDown size={14} className="text-gray-400" />
          <h3 className="font-bold text-sm text-gray-700">Description</h3>
          <button className="text-blue-600 text-xs hover:underline ml-2">Edit</button>
        </div>
        <p className="text-xs text-gray-400 italic ml-6">None</p>
      </div>

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
                <td className="px-2 py-2">
                  <input type="text" placeholder="Name" className="w-full bg-white border rounded px-2 py-1 focus:outline-none focus:border-orange-500" />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Value" className="w-full bg-white border rounded px-2 py-1 focus:outline-none focus:border-orange-500" />
                </td>
                <td className="px-2 py-2">
                  <button className="bg-white border border-gray-200 px-3 py-1 rounded hover:bg-gray-50 font-bold">
                    Add
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChevronDown size={14} className="text-gray-400" />
            <h3 className="font-bold text-sm text-gray-700">Versions</h3>
            <button className="ml-4 border border-gray-200 px-3 py-1 text-xs rounded text-gray-400 cursor-not-allowed bg-gray-50 font-bold">
              Compare
            </button>
          </div>
        </div>
        <div className="min-h-[200px] border border-gray-200 rounded-lg border-dashed flex flex-col items-center justify-center bg-gray-50/30">
          <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300 mb-4">
            <Plus size={24} />
          </div>
          <p className="text-[11px] text-gray-500">No models versions are registered yet.</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPERIMENT CREATION DIALOG COMPONENT
// ============================================================================

const CreateExperimentDialog: React.FC<CreateExperimentDialogProps> = ({
  isOpen,
  onClose,
  onCreateExperiment,
  currentUserId
}) => {

  const [experimentName, setExperimentName] = useState('');
  const [artifactLocation, setArtifactLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setExperimentName('');
        setArtifactLocation('');
        setError(null);
        setTouched(false);
        setIsLoading(false);
      }, 200); // Delay to avoid visual flicker
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const validateExperimentName = async (name: string): Promise<ExperimentValidationResult> => {
    // Simulate API call to check existing active experiments
    const activeExperimentExists = MOCK_EXPERIMENTS.some(
      exp => exp.name.toLowerCase() === name.toLowerCase()
    );

    if (activeExperimentExists) {
      return {
        isValid: false,
        error: `An active experiment with name "${name}" already exists. Please choose a different name.`
      };
    }

    // Check soft-deleted experiments
    const softDeleted = MOCK_SOFT_DELETED_EXPERIMENTS.find(
      exp => exp.name.toLowerCase() === name.toLowerCase()
    );

    if (softDeleted) {
      if (softDeleted.deleted_by !== currentUserId) {
        return {
          isValid: false,
          error: `An experiment with name "${name}" was previously deleted by another user (${softDeleted.deleted_by}). You cannot reuse this name.`
        };
      }

      // Soft-deleted experiment owned by current user - can be permanently deleted
      return {
        isValid: true,
        softDeletedExperiment: softDeleted
      };
    }

    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    // Validate required field
    if (!experimentName.trim()) {
      setError('Experiment name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate experiment name uniqueness
      const validation = await validateExperimentName(experimentName.trim());

      if (!validation.isValid) {
        setError(validation.error || 'Invalid experiment name');
        setIsLoading(false);
        return;
      }

      // If there's a soft-deleted experiment owned by this user, hard delete it first
      if (validation.softDeletedExperiment) {
        try {
          // Simulate API call to hard delete the soft-deleted experiment and its runs
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(`Hard deleted experiment: ${validation.softDeletedExperiment.experiment_id}`);
          // In real app: await api.deleteExperiment(validation.softDeletedExperiment.experiment_id, { permanent: true });
        } catch (deleteError) {
          setError('Failed to cleanup previous experiment. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Create new experiment
      await onCreateExperiment(
        experimentName.trim(),
        artifactLocation.trim() || undefined
      );

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create experiment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-[110] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <FlaskConical size={18} className="text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Create New Experiment</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Experiment Name Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Experiment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={experimentName}
                onChange={(e) => {
                  setExperimentName(e.target.value);
                  if (touched) setError(null);
                }}
                onBlur={() => setTouched(true)}
                placeholder="e.g., customer_churn_prediction"
                className={`w-full px-4 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${error && touched && !experimentName.trim()
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                  }`}
                disabled={isLoading}
                autoFocus
              />
              {error && touched && !experimentName.trim() && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <Info size={12} />
                  Experiment name is required
                </p>
              )}
              <p className="mt-1.5 text-[10px] text-gray-400">
                Must be unique among active experiments. Cannot reuse names deleted by other users.
              </p>
            </div>

            {/* Artifact Location Field (Optional) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Artifact Location <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={artifactLocation}
                onChange={(e) => setArtifactLocation(e.target.value)}
                placeholder="e.g., s3://my-bucket/experiments/"
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                disabled={isLoading}
              />
              <p className="mt-1.5 text-[10px] text-gray-400">
                Default location will be used if not specified
              </p>
            </div>

            {/* Error Message Display */}
            {error && touched && experimentName.trim() && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <Info size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-red-700 whitespace-pre-wrap">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Soft-delete warning example */}
            {experimentName.toLowerCase() === 'old_experiment' && !error && (
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <Info size={14} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-yellow-800">
                      An experiment with this name was previously deleted.
                      {currentUserId === 'beatrice'
                        ? ' You can reuse this name - the old experiment will be permanently deleted.'
                        : ' This name cannot be reused because it was deleted by another user.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !experimentName.trim()}
              className="px-6 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Experiment'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );

};


// ============================================================================
// RENAME EXPERIMENT DIALOG
// ============================================================================

interface RenameExperimentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  experiment: ExperimentData | null;
  onRename: (newName: string) => Promise<void>;
  currentUserId: string;
}

const RenameExperimentDialog: React.FC<RenameExperimentDialogProps> = ({
  isOpen,
  onClose,
  experiment,
  onRename,
  currentUserId
}) => {
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (experiment) {
      setNewName(experiment.name);
    }
  }, [experiment]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setNewName('');
        setError(null);
        setTouched(false);
        setIsLoading(false);
      }, 200);
    }
  }, [isOpen]);

  const validateExperimentName = async (name: string): Promise<ExperimentValidationResult> => {
    // Same validation as create: check active experiments except current one
    const activeExperimentExists = MOCK_EXPERIMENTS.some(
      exp => exp.name.toLowerCase() === name.toLowerCase() && exp.experiment_id !== experiment?.experiment_id
    );

    if (activeExperimentExists) {
      return {
        isValid: false,
        error: `An active experiment with name "${name}" already exists. Please choose a different name.`
      };
    }

    // Check soft-deleted experiments
    const softDeleted = MOCK_SOFT_DELETED_EXPERIMENTS.find(
      exp => exp.name.toLowerCase() === name.toLowerCase()
    );

    if (softDeleted) {
      if (softDeleted.deleted_by !== currentUserId) {
        return {
          isValid: false,
          error: `An experiment with name "${name}" was previously deleted by another user (${softDeleted.deleted_by}). You cannot reuse this name.`
        };
      }
      // Soft-deleted owned by current user – can be permanently deleted later if needed
      return {
        isValid: true,
        softDeletedExperiment: softDeleted
      };
    }

    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!newName.trim()) {
      setError('Experiment name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const validation = await validateExperimentName(newName.trim());
      if (!validation.isValid) {
        setError(validation.error || 'Invalid experiment name');
        setIsLoading(false);
        return;
      }

      // If there's a soft-deleted experiment owned by this user, we could hard delete it first
      // (similar to creation), but for simplicity we'll just rename and let the backend handle it.
      // In a real app you might want to prompt the user or automatically purge it.

      await onRename(newName.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename experiment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !experiment) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[210] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Pencil size={18} className="text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Rename Experiment</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg" disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                New Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (touched) setError(null);
                }}
                onBlur={() => setTouched(true)}
                placeholder="e.g., customer_churn_v2"
                className={`w-full px-4 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all ${error && touched && !newName.trim()
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                  }`}
                disabled={isLoading}
                autoFocus
              />
              {error && touched && !newName.trim() && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <Info size={12} />
                  Experiment name is required
                </p>
              )}
            </div>

            {error && touched && newName.trim() && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 whitespace-pre-wrap">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !newName.trim()}
              className="px-6 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

// ============================================================================
// DESCRIPTION EDIT POPUP
// ============================================================================

interface DescriptionEditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  onSave: (newDescription: string) => Promise<void>;
}

const DescriptionEditPopup: React.FC<DescriptionEditPopupProps> = ({
  isOpen,
  onClose,
  description,
  onSave
}) => {
  const [editedDesc, setEditedDesc] = useState(description);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(editedDesc);
      onClose();
    } catch (err) {
      setError('Failed to save description. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl z-[210] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Edit Description</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={editedDesc}
            onChange={(e) => setEditedDesc(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-sm border bg-white rounded-lg focus:outline-none focus:border-orange-500"
            placeholder="Enter experiment description..."
          />
          {error && (
            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <Info size={12} /> {error}
            </p>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 flex items-center gap-2"
            >
              {isSaving ? <RefreshCw size={12} className="animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// ARTIFACT DELETION DIALOG COMPONENT
// ============================================================================

interface DeleteArtifactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  selectedArtifacts: Artifact[];
  isDeleting: boolean;
}

const DeleteArtifactDialog: React.FC<DeleteArtifactDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedArtifacts,
  isDeleting
}) => {
  if (!isOpen) return null;

  const fileCount = selectedArtifacts.filter(a => a.type === 'file').length;
  const dirCount = selectedArtifacts.filter(a => a.type === 'directory').length;
  const totalItems = selectedArtifacts.length;

  const getDescription = () => {
    if (totalItems === 1) {
      const artifact = selectedArtifacts[0];
      return artifact.type === 'directory'
        ? `the directory "${artifact.name}" and all its contents`
        : `the file "${artifact.name}"`;
    }

    const parts = [];
    if (dirCount > 0) parts.push(`${dirCount} director${dirCount > 1 ? 'ies' : 'y'}`);
    if (fileCount > 0) parts.push(`${fileCount} file${fileCount > 1 ? 's' : ''}`);

    return `${parts.join(' and ')} (${totalItems} item${totalItems > 1 ? 's' : ''})`;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200] transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[210] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Delete Artifacts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            disabled={isDeleting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Info size={16} className="text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <span className="font-bold">{getDescription()}</span>?
                </p>
                {dirCount > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Deleting directories will permanently remove all nested files and subdirectories.
                  </p>
                )}
                <p className="text-xs text-red-600 mt-2">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Selected items preview */}
            {selectedArtifacts.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Selected items:
                </p>
                <div className="space-y-1.5">
                  {selectedArtifacts.slice(0, 5).map(artifact => (
                    <div key={artifact.id} className="flex items-center gap-2 text-xs">
                      {artifact.type === 'directory' ? (
                        <FolderTree size={12} className="text-orange-400 flex-shrink-0" />
                      ) : (
                        <File size={12} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-gray-700 truncate">{artifact.path}</span>
                    </div>
                  ))}
                  {selectedArtifacts.length > 5 && (
                    <p className="text-[10px] text-gray-500 pt-1">
                      and {selectedArtifacts.length - 5} more item{selectedArtifacts.length - 5 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-6 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Delete {totalItems > 0 ? `(${totalItems})` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


// ============================================================================
// EXPERIMENTS COMPONENTS
// ============================================================================

// ============================================================================
// EXPERIMENTS COMPONENTS
// ============================================================================

const ExperimentSidebar: React.FC<{
  experiments: ExperimentData[];
  selectedId: string;
  onSelect: (id: string) => void;
  isCollapsed: boolean;
  toggle: () => void;
  onCreateClick: () => void;
  isCreating?: boolean;
  currentUserId: string;
  onRename: (experiment: ExperimentData) => void;
}> = ({ 
  experiments, 
  selectedId, 
  onSelect, 
  isCollapsed, 
  toggle, 
  onCreateClick, 
  onRename,
  isCreating = false, 
  currentUserId 
}) => (
  <div className={`flex flex-col border-r border-gray-200 transition-all duration-300 relative bg-white ${isCollapsed ? 'w-0' : 'w-72'}`}>
    <button
      onClick={toggle}
      className={`absolute top-12 z-50 w-6 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 shadow-sm text-gray-400 text-xs transition-all duration-300 ${
        isCollapsed ? '-right-7' : '-right-3'
      }`}
    >
      {isCollapsed ? '»' : '«'}
    </button>

    <div className={`flex flex-col h-full overflow-hidden ${isCollapsed ? 'invisible opacity-0' : 'visible opacity-100'}`}>
      <div className="p-3 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Experiments
          </span>
          <button
            onClick={onCreateClick}
            disabled={isCreating}
            className="text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Create new experiment"
          >
            {isCreating ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
          </button>
        </div>
        <SearchInput placeholder="Filter experiments..." className="w-full" />
      </div>

      <div className="flex-grow overflow-y-auto mt-2">
        {experiments.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <FlaskConical size={20} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mb-2">No experiments yet</p>
            <button
              onClick={onCreateClick}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Create your first experiment
            </button>
          </div>
        ) : (
          experiments.map((exp) => (
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
                  onChange={() => onSelect(exp.experiment_id)}
                />
                <span className="text-[11px] truncate whitespace-nowrap">{exp.name}</span>
                {exp.created_by === currentUserId && (
                  <span className="text-[9px] text-gray-400">(owner)</span>
                )}
              </div>
              <div className={`flex items-center gap-1.5 ${
                selectedId === exp.experiment_id ? 'flex' : 'hidden group-hover:flex'
              }`}>
                <Pencil
                  size={12}
                  className="text-gray-400 hover:text-orange-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(exp);
                  }}
                />
                <Trash2 size={12} className="text-gray-400 hover:text-red-500 cursor-pointer" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);


// ============================================================================
// EXPERIMENT TAGS MANAGEMENT COMPONENTS
// ============================================================================

interface ExperimentTagsManagerProps {
  experiment: ExperimentData;
  permissions: ArtifactPermissions;
  onUpdateTags: (tags: ExperimentTag[]) => Promise<void>;
  hideUtilitySection?: boolean;
}

const ExperimentTagsManager: React.FC<ExperimentTagsManagerProps> = ({
  experiment,
  permissions,
  onUpdateTags,
  hideUtilitySection = false
}) => {
  const [tags, setTags] = useState<ExperimentTag[]>(experiment.tags || []);
  const [editMode, setEditMode] = useState(false);
  const [editableTags, setEditableTags] = useState<ExperimentTag[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = permissions?.permissionLevel === 'edit' || permissions?.permissionLevel === 'admin';

  // Enter edit mode
  const handleEdit = () => {
    setEditableTags(tags.map(tag => ({ ...tag }))); // deep copy
    setSelectedIndices(new Set());
    setEditMode(true);
    setError(null);
  };

  // Cancel edit
  const handleCancel = () => {
    setEditMode(false);
    setEditableTags([]);
    setSelectedIndices(new Set());
    setError(null);
  };

  // Apply changes
  const handleApply = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Filter out any empty rows (key and value both empty)
      const cleaned = editableTags.filter(t => t.key.trim() !== '' || t.value.trim() !== '');
      // Ensure all tags have key (required)
      if (cleaned.some(t => t.key.trim() === '')) {
        setError('Tag key cannot be empty');
        setIsSaving(false);
        return;
      }
      await onUpdateTags(cleaned);
      setTags(cleaned);
      setEditMode(false);
    } catch (err) {
      setError('Failed to save tags. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new empty tag row
  const handleAddRow = () => {
    setEditableTags([
      ...editableTags,
      { key: '', value: '', created_by: permissions?.permissionLevel, created_at: new Date().toISOString() }
    ]);
  };

  // Update a tag field
  const handleTagChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...editableTags];
    updated[index] = { ...updated[index], [field]: value };
    setEditableTags(updated);
  };

  // Delete a tag row
  const handleDeleteRow = (index: number) => {
    const updated = editableTags.filter((_, i) => i !== index);
    setEditableTags(updated);
    // Also remove from selection if needed
    const newSelected = new Set(selectedIndices);
    newSelected.delete(index);
    // Shift indices after deletion: adjust greater indices
    const adjusted = new Set<number>();
    newSelected.forEach(i => {
      if (i < index) adjusted.add(i);
      else if (i > index) adjusted.add(i - 1);
    });
    setSelectedIndices(adjusted);
  };

  // Toggle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIndices(new Set(editableTags.map((_, i) => i)));
    } else {
      setSelectedIndices(new Set());
    }
  };

  // Toggle single row
  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedIndices);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedIndices(newSelected);
  };

  // Clear all selected
  const handleClearAll = () => {
    setSelectedIndices(new Set());
  };

  // Delete selected rows
  const handleDeleteSelected = () => {
    if (selectedIndices.size === 0) return;
    const indicesToRemove = Array.from(selectedIndices).sort((a, b) => b - a); // descending
    let updated = [...editableTags];
    indicesToRemove.forEach(i => {
      updated = updated.filter((_, idx) => idx !== i);
    });
    setEditableTags(updated);
    setSelectedIndices(new Set());
  };

  // Render view mode (pills)
  const renderViewMode = () => (
    <div className="flex flex-wrap gap-2">
      {tags.length > 0 ? (
        tags.map(tag => (
          <span
            key={tag.key}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
          >
            {tag.key}: {tag.value}
          </span>
        ))
      ) : (
        <p className="text-xs text-gray-400 italic">No tags</p>
      )}
      {canEdit && (
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-orange-600 border border-gray-200 rounded-full hover:border-orange-200 transition-colors"
        >
          <Pencil size={12} />
          Edit Tags
        </button>
      )}
    </div>
  );

  // Render edit mode (table with checkboxes)
  const renderEditMode = () => {
    const allSelected = editableTags.length > 0 && selectedIndices.size === editableTags.length;

    return (
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-200"
                  />
                </th>
                <th className="px-4 py-2 font-bold text-gray-500">Key</th>
                <th className="px-4 py-2 font-bold text-gray-500">Value</th>
                <th className="px-4 py-2 w-10"></th> {/* Delete column */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {editableTags.map((tag, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIndices.has(index)}
                      onChange={(e) => handleSelectRow(index, e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-200"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={tag.key}
                      onChange={(e) => handleTagChange(index, 'key', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-orange-500 bg-white"
                      placeholder="key"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={tag.value}
                      onChange={(e) => handleTagChange(index, 'value', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-orange-500 bg-white"
                      placeholder="value"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDeleteRow(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete tag"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {/* Add new row */}
              <tr className="bg-gray-50/50">
                <td colSpan={4} className="px-4 py-2">
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600"
                  >
                    <Plus size={14} />
                    Add Tag
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <Info size={12} /> {error}
          </p>
        )}

        {/* Selection actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedIndices.size > 0 && (
              <>
                <span className="text-xs text-gray-500">
                  {selectedIndices.size} selected
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear All
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-200 hover:bg-red-100"
                >
                  <Trash2 size={12} />
                  Delete Selected
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isSaving}
              className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded hover:bg-orange-600 flex items-center gap-2"
            >
              {isSaving ? <RefreshCw size={12} className="animate-spin" /> : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Permission warning (if cannot edit and no tags)
  if (!canEdit && tags.length === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-500">No tags</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-700">Tags</h4>
        {!canEdit && (
          <span className="text-[10px] text-gray-400">(view only)</span>
        )}
      </div>

      {!canEdit ? (
        // View-only mode for non-editable
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag.key}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs border border-gray-200"
            >
              {tag.key}: {tag.value}
            </span>
          ))}
        </div>
      ) : (
        // Editable: either view mode or edit mode
        !editMode ? renderViewMode() : renderEditMode()
      )}
    </div>
  );
};

const ExperimentsView: React.FC = () => {
  const [experimentsList, setExperimentsList] = useState<ExperimentData[]>([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [detailsPanelTab, setDetailsPanelTab] = useState('Artifacts');
  const [selectedRunId, setSelectedRunId] = useState<string | null>('1');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingExperiment, setIsCreatingExperiment] = useState(false);
  const currentUserId = 'chaiya'; // Mock current user
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
  const [isDescriptionPopupOpen, setIsDescriptionPopupOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false); 
  const [experimentToRename, setExperimentToRename] = useState<ExperimentData | null>(null);

  const getPermissions = (experimentId: string): ArtifactPermissions => {
    if (experimentId === '1') {
      return {
        canDelete: true,
        canEdit: true,
        canView: true,
        permissionLevel: 'edit'
      };
    } else if (experimentId === '2') {
      return {
        canDelete: false,
        canEdit: false,
        canView: true,
        permissionLevel: 'view'
      };
    } else {
      return {
        canDelete: true,
        canEdit: true,
        canView: true,
        permissionLevel: 'admin'
      };
    }
  };

  useEffect(() => {
    const loadExperiments = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setExperimentsList(MOCK_EXPERIMENTS);
        if (MOCK_EXPERIMENTS.length > 0) {
          setSelectedExperimentId(MOCK_EXPERIMENTS[0].experiment_id);
        }
      } catch (error) {
        console.error("Failed to fetch experiments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExperiments();
  }, []);

  const selectedRun = MOCK_RUNS.find(r => r.id === selectedRunId);
  const currentExperiment = experimentsList.find(e => e.experiment_id === selectedExperimentId);

  const handleCreateExperiment = async (name: string, artifactLocation?: string) => {
    setIsCreatingExperiment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newExperiment: ExperimentData = {
        experiment_id: `${Date.now()}`,
        name,
        artifact_location: artifactLocation || `/data/zeus/mlflow/mlartifacts/${Date.now()}`,
        created_by: currentUserId,
        created_at: new Date().toISOString(),
      };
      setExperimentsList(prev => [newExperiment, ...prev]);
      setSelectedExperimentId(newExperiment.experiment_id);
    } catch (error) {
      console.error('Failed to create experiment:', error);
      throw error;
    } finally {
      setIsCreatingExperiment(false);
    }
  };

  const handleRenameExperiment = async (newName: string) => {
    if (!experimentToRename) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const updatedExperiments = experimentsList.map(exp =>
      exp.experiment_id === experimentToRename.experiment_id
        ? { ...exp, name: newName, last_updated: new Date().toISOString() }
        : exp
    );
    setExperimentsList(updatedExperiments);
    console.log(`Renamed experiment ${experimentToRename.experiment_id} to ${newName}`);
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white">
        <div className="text-center">
          <RefreshCw size={32} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading experiments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ExperimentSidebar
        experiments={experimentsList}
        selectedId={selectedExperimentId}
        onSelect={setSelectedExperimentId}
        isCollapsed={isSidebarCollapsed}
        toggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCreateClick={() => setIsCreateDialogOpen(true)}
        isCreating={isCreatingExperiment}
        currentUserId={currentUserId}
        onRename={(exp) => {
          setExperimentToRename(exp);
          setRenameDialogOpen(true);
        }}
      />

      <div className="flex-grow overflow-auto p-4">
        <div className="w-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {currentExperiment?.name || 'demo_fraud_train'}
              </h2>
              <button className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded">
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>

          {currentExperiment && (
            <div className="mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Collapsible Header */}
              <div
                className="px-5 py-4 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                onClick={() => setIsInfoExpanded(!isInfoExpanded)}
              >
                <div className="flex items-center gap-2">
                  {isInfoExpanded ? (
                    <ChevronDown size={16} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-500" />
                  )}
                  <Info size={14} className="text-gray-500" />
                  <h3 className="text-xs font-bold text-gray-700">Experiment Information</h3>
                </div>
                {isInfoExpanded && getPermissions(selectedExperimentId).permissionLevel !== 'view' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDescriptionPopupOpen(true);
                    }}
                    className="text-[10px] text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <Pencil size={10} />
                    Edit Description
                  </button>
                )}
              </div>

              {isInfoExpanded && (
                <div className="p-5 space-y-5">
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 w-24">Path:</span>
                        <span className="text-gray-700 font-mono truncate">{currentExperiment.name}</span>
                        <CopyButton text={currentExperiment.name} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 w-24">Experiment ID:</span>
                        <span className="text-gray-700 font-mono">{currentExperiment.experiment_id}</span>
                        <CopyButton text={currentExperiment.experiment_id} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 w-24">Artifact Location:</span>
                        <span className="text-gray-700 font-mono truncate max-w-[200px]">{currentExperiment.artifact_location}</span>
                        <CopyButton text={currentExperiment.artifact_location} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 w-24">Created:</span>
                        <span className="text-gray-700">
                          {currentExperiment.created_at
                            ? new Date(currentExperiment.created_at).toLocaleString('en-GB', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              }).replace(',', '')
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 w-24">Last Updated:</span>
                        <span className="text-gray-700">
                          {currentExperiment.last_updated
                            ? new Date(currentExperiment.last_updated).toLocaleString('en-GB', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                              }).replace(',', '')
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 w-24">Lifecycle Stage:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          currentExperiment.deleted_at ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {currentExperiment.deleted_at ? 'deleted' : 'active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 mb-2">Description</h4>
                    <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                      {currentExperiment.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Tags Manager */}
                  <ExperimentTagsManager
                    experiment={currentExperiment}
                    permissions={getPermissions(selectedExperimentId)}
                    onUpdateTags={async (updatedTags) => {
                      const updatedExperiments = experimentsList.map(exp =>
                        exp.experiment_id === currentExperiment.experiment_id
                          ? { ...exp, tags: updatedTags, last_updated: new Date().toISOString() }
                          : exp
                      );
                      setExperimentsList(updatedExperiments);
                      console.log('Tags updated:', updatedTags);
                    }}
                    hideUtilitySection={true}
                  />
                </div>
              )}
            </div>
          )}

          {/* Description Edit Popup */}
          <DescriptionEditPopup
            isOpen={isDescriptionPopupOpen}
            onClose={() => setIsDescriptionPopupOpen(false)}
            description={currentExperiment?.description || ''}
            onSave={async (newDesc) => {
              const updatedExperiments = experimentsList.map(exp =>
                exp.experiment_id === currentExperiment?.experiment_id
                  ? { ...exp, description: newDesc, last_updated: new Date().toISOString() }
                  : exp
              );
              setExperimentsList(updatedExperiments);
              console.log('Description updated:', newDesc);
            }}
          />

          <div className="mb-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <SearchInput placeholder="Query runs..." />
              <div className="flex items-center gap-2">
                <div className="border border-gray-200 rounded flex overflow-hidden">
                  <button className="px-2 py-1.5 bg-gray-100 text-gray-600">
                    <List size={16} />
                  </button>
                  <button className="px-2 py-1.5 bg-white text-gray-400 hover:bg-gray-50">
                    <BarChart3 size={16} />
                  </button>
                </div>
                <FilterButton label="Actions" />
                <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded">
                  New Run
                </button>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FilterButton label="Time created" />
              <FilterButton label="State: Active" />
              <FilterButton label="Sort: f1_score" icon={<SlidersHorizontal size={12} />} />
              <FilterButton label="Group by" />
              <FilterButton label="Datasets" />
              <span className="text-xs text-gray-400 ml-auto">{MOCK_RUNS.length} runs</span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-t-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2 border-r border-gray-200"></th>
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
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3 w-8 border-r border-gray-200">
                    <input type="checkbox" className="rounded text-orange-500" />
                  </th>
                  <th className="px-4 py-3">Run Name</th>
                  <th className="px-4 py-3">Run ID</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3 border-r border-gray-200">Models</th>
                  <th className="px-4 py-3 bg-gray-100/50 border-r border-gray-200">f1_score</th>
                  <th className="px-4 py-3 bg-gray-100/50">agg_depth</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {MOCK_RUNS.map((run) => {
                  const { name: modelName, version } = parseModelVersion(run.models);
                  return (
                    <tr
                      key={run.id}
                      onClick={() => setSelectedRunId(run.id)}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedRunId === run.id ? 'bg-orange-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 border-r border-gray-100">
                        <input
                          type="checkbox"
                          className="rounded text-orange-500"
                          checked={selectedRunId === run.id}
                          onChange={() => setSelectedRunId(run.id)}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <StatusDot color={run.color} />
                        <span className="text-blue-600 hover:underline">{run.runName}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono">{formatRunId(run.runId)}</td>
                      <td className="px-4 py-3 text-gray-500">{run.created}</td>
                      <td className="px-4 py-3 text-gray-500">{run.duration}</td>
                      <td className="px-4 py-3 text-gray-500">{run.user}</td>
                      <td className="px-4 py-3 text-gray-500">{run.source}</td>
                      <td className="px-4 py-3 border-r border-gray-100">
                        {run.models !== '-' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-600 hover:underline cursor-pointer font-medium">
                              {modelName}
                            </span>
                            <Badge variant="gray">{version}</Badge>
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 bg-gray-50/50 border-r border-gray-100 font-medium">{run.f1}</td>
                      <td className="px-4 py-3 bg-gray-50/50 font-medium">{run.agg_depth}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="h-3 bg-gray-50 border-x border-b border-gray-200 cursor-ns-resize flex items-center justify-center hover:bg-gray-100 transition-colors">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {selectedRun && (
            <RunDetailsPanel
              run={selectedRun}
              experimentId={selectedExperimentId}
              onClose={() => setSelectedRunId(null)}
              activeTab={detailsPanelTab}
              onTabChange={setDetailsPanelTab}
            />
          )}
        </div>
      </div>

      <CreateExperimentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateExperiment={handleCreateExperiment}
        currentUserId={currentUserId}
      />

      <RenameExperimentDialog
        isOpen={renameDialogOpen}
        onClose={() => {
          setRenameDialogOpen(false);
          setExperimentToRename(null);
        }}
        experiment={experimentToRename}
        onRename={handleRenameExperiment}
        currentUserId={currentUserId}
      />
    </div>
  );
};

const RunDetailsPanel: React.FC<{
  run: RunData;
  experimentId: string;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ run, experimentId, onClose, activeTab, onTabChange }) => {
  const detailsRows = [
    { label: 'Created at', value: '2026-01-01 18:58:01' },
    { label: 'Created by', value: run.user },
    { label: 'Experiment ID', value: experimentId || '490', hasCopy: true },
    { label: 'Status', value: 'Running', isStatus: true },
    { label: 'Run ID', value: run.runId, hasCopy: true },
    { label: 'Duration', value: run.duration },
    { label: 'Datasets used', value: '—' },
    { label: 'Tags', value: <CirclePlus size={14} />, isTags: true },
    { label: 'Source', value: run.source },
    { label: 'Logged models', value: '—' },
    { label: 'Registered models', value: '—' },
  ];
  const getPermissions = (): ArtifactPermissions => {
    // In real app, this would come from an API call based on run.experiment_id
    return {
      canDelete: true,
      canEdit: true,
      canView: true,
      permissionLevel: 'edit' // or 'view' to test readonly
    };
  };

  return (
    <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-5 min-h-[300px] shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
          {run.runName}
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
            Finished
          </span>
        </h3>
        <div className="flex items-center gap-3 text-gray-400">
          <Maximize2 size={16} className="cursor-pointer hover:text-gray-600" />
          <X size={18} className="cursor-pointer hover:text-gray-600" onClick={onClose} />
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {['Overview', 'Artifacts'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-[11px] font-bold transition-all rounded-t-md border-t border-l border-r ${activeTab === tab
              ? 'bg-white border-gray-200 text-orange-500 -mb-[1px] z-10 relative'
              : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto bg-white">
        {activeTab === 'Overview' && (
          <OverviewTab detailsRows={detailsRows} />
        )}

        {activeTab === 'Model Metrics' && (
          <div className="h-48 flex items-center justify-center border border-gray-200 rounded-lg border-dashed">
            <p className="text-xs text-gray-400">Model metrics visualization will appear here</p>
          </div>
        )}

        {activeTab === 'Artifacts' && (
          <ArtifactsTab runId={run.runId} permissions={getPermissions()} />
        )}
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ detailsRows: any[] }> = ({ detailsRows }) => (
  <div className="space-y-6">
    <section>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-xs font-bold text-gray-700">Description</h4>
        <button className="text-orange-500 hover:text-orange-600">
          <PencilLine size={12} />
        </button>
      </div>
      <p className="text-xs text-gray-400 italic">No description</p>
    </section>

    <section>
      <h4 className="text-xs font-bold text-gray-700 mb-3">Details</h4>
      <div className="border border-gray-200 rounded-md overflow-hidden text-[11px]">
        {detailsRows.map((row, idx) => (
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
                    {EXAMPLE_TAGS.map((tag, i) => (
                      <span
                        key={i}
                        className={`px-2.5 py-0.5 ${tag.color} text-white text-[10px] font-medium rounded-full whitespace-nowrap shadow-sm`}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center justify-center p-1 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all">
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
              {row.hasCopy && <CopyButton text={row.value} />}
            </div>
          </div>
        ))}
      </div>
    </section>

    <div className="grid grid-cols-2 gap-4 pb-4">
      {['Parameters (0)', 'Metrics (0)'].map((title) => (
        <div
          key={title}
          className="border border-gray-200 rounded-md p-4 min-h-[150px] flex flex-col items-center justify-center bg-gray-50/30"
        >
          <h4 className="text-[11px] font-bold text-gray-700 self-start mb-auto">{title}</h4>
          <List size={24} className="text-gray-200 mb-2" />
          <span className="text-[10px] text-gray-400">No data recorded</span>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// ENHANCED ARTIFACTS TAB COMPONENT
// ============================================================================

const ArtifactsTab: React.FC<{
  runId: string;
  permissions?: ArtifactPermissions;
}> = ({
  runId,
  permissions = MOCK_USER_PERMISSIONS
}) => {
    const [artifacts, setArtifacts] = useState<Artifact[]>(MOCK_ARTIFACTS);
    const [selectedArtifactIds, setSelectedArtifactIds] = useState<Set<string>>(new Set());
    const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['1', '2']));
    const [selectedArtifactDetail, setSelectedArtifactDetail] = useState<Artifact | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const canDelete = permissions?.permissionLevel === 'edit' || permissions?.permissionLevel === 'admin';
    const selectedArtifacts = artifacts.filter(a => selectedArtifactIds.has(a.id));

    // Flatten artifact tree for selection
    const getAllArtifactIds = (artifactList: Artifact[]): string[] => {
      return artifactList.reduce((acc: string[], artifact) => {
        acc.push(artifact.id);
        if (artifact.children) {
          acc.push(...getAllArtifactIds(artifact.children));
        }
        return acc;
      }, []);
    };

    const findArtifactAndChildren = (items: Artifact[], targetId: string): string[] => {
      const ids: string[] = [];
      for (const item of items) {
        if (item.id === targetId) {
          ids.push(item.id);
          if (item.children) {
            ids.push(...getAllArtifactIds(item.children));
          }
        } else if (item.children) {
          ids.push(...findArtifactAndChildren(item.children, targetId));
        }
      }
      return ids;
    };

    const handleSelectArtifact = (artifactId: string, checked: boolean, isDirectory: boolean = false) => {
      const newSelection = new Set(selectedArtifactIds);

      if (checked) {
        if (isDirectory) {
          const idsToAdd = findArtifactAndChildren(artifacts, artifactId);
          idsToAdd.forEach(id => newSelection.add(id));
        } else {
          newSelection.add(artifactId);
        }
      } else {
        if (isDirectory) {
          const idsToRemove = findArtifactAndChildren(artifacts, artifactId);
          idsToRemove.forEach(id => newSelection.delete(id));
        } else {
          newSelection.delete(artifactId);
        }
      }

      setSelectedArtifactIds(newSelection);
    };

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        setSelectedArtifactIds(new Set(getAllArtifactIds(artifacts)));
      } else {
        setSelectedArtifactIds(new Set());
      }
    };

    const toggleDirectory = (dirId: string) => {
      const newExpanded = new Set(expandedDirs);
      if (newExpanded.has(dirId)) {
        newExpanded.delete(dirId);
      } else {
        newExpanded.add(dirId);
      }
      setExpandedDirs(newExpanded);
    };

    const handleDeleteArtifacts = async () => {
      if (!canDelete) {
        setDeleteError('You do not have permission to delete these artifacts.');
        return;
      }

      setIsDeleting(true);
      setDeleteError(null);

      try {
        // Simulate API call to delete artifacts
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Filter out deleted artifacts
        const newArtifacts = artifacts.filter(a => !selectedArtifactIds.has(a.id));
        setArtifacts(newArtifacts);

        // Clear selection
        setSelectedArtifactIds(new Set());

        // Clear detail view if it was deleted
        if (selectedArtifactDetail && selectedArtifactIds.has(selectedArtifactDetail.id)) {
          setSelectedArtifactDetail(null);
        }

        setIsDeleteDialogOpen(false);
        console.log(`Successfully deleted ${selectedArtifacts.length} artifacts`);

      } catch (error) {
        console.error('Failed to delete artifacts:', error);
        setDeleteError('Failed to delete artifacts. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    };

    const renderArtifactTree = (items: Artifact[], level: number = 0) => {
      return items.map((artifact) => (
        <React.Fragment key={artifact.id}>
          <div
            className={`group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors ${selectedArtifactIds.has(artifact.id) ? 'bg-orange-50/50' : ''
              } ${level > 0 ? 'ml-6' : ''}`}
          >
            {/* Checkbox - only show if user has delete permission */}
            {canDelete && (
              <input
                type="checkbox"
                checked={selectedArtifactIds.has(artifact.id)}
                onChange={(e) => handleSelectArtifact(
                  artifact.id,
                  e.target.checked,
                  artifact.type === 'directory'
                )}
                className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-200"
              />
            )}

            {/* Expand/collapse for directories */}
            {artifact.type === 'directory' && artifact.children && artifact.children.length > 0 ? (
              <button
                onClick={() => toggleDirectory(artifact.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${expandedDirs.has(artifact.id) ? '' : '-rotate-90'
                    }`}
                />
              </button>
            ) : (
              <span className="w-6" /> // Spacing alignment
            )}

            {/* Artifact icon */}
            {artifact.type === 'directory' ? (
              <FolderTree size={16} className="text-orange-400 flex-shrink-0" />
            ) : (
              <File size={16} className="text-gray-400 flex-shrink-0" />
            )}

            {/* Artifact name and details */}
            <div
              className="flex-grow flex items-center justify-between cursor-pointer"
              onClick={() => setSelectedArtifactDetail(artifact)}
            >
              <span className="text-xs font-medium text-gray-700 hover:text-orange-600">
                {artifact.name}
              </span>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                {artifact.size && <span>{artifact.size}</span>}
                {artifact.modified && <span>{artifact.modified}</span>}
              </div>
            </div>
          </div>

          {/* Render children if expanded */}
          {artifact.type === 'directory' &&
            expandedDirs.has(artifact.id) &&
            artifact.children &&
            renderArtifactTree(artifact.children, level + 1)}
        </React.Fragment>
      ));
    };

    return (
      <div className="flex h-full gap-4">
        {/* Left panel - Artifact tree */}
        <div className="w-1/2 border-r border-gray-100 pr-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-gray-700">Artifacts</h4>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {canDelete && selectedArtifactIds.size > 0 && (
                <>
                  <button
                    onClick={() => handleSelectAll(false)}
                    className="text-[10px] text-gray-500 hover:text-gray-700 px-2 py-1"
                  >
                    Clear ({selectedArtifactIds.size})
                  </button>
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-200 hover:bg-red-100 transition-all"
                    disabled={!canDelete}
                  >
                    <Trash2 size={12} />
                    Delete ({selectedArtifactIds.size})
                  </button>
                </>
              )}

              {canDelete && selectedArtifactIds.size === 0 && (
                <button
                  onClick={() => handleSelectAll(true)}
                  className="text-[10px] text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Select All
                </button>
              )}
            </div>
          </div>

          {/* Artifact tree */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {renderArtifactTree(artifacts)}
          </div>

          {/* Permission warning */}
          {!canDelete && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-gray-400" />
                <p className="text-[10px] text-gray-500">
                  You have {permissions?.permissionLevel} access. Edit or admin permission required to delete artifacts.
                </p>
              </div>
            </div>
          )}

          {/* Delete error */}
          {deleteError && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-600">{deleteError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel - Artifact detail */}
        <div className="w-1/2 pl-4">
          <div className="bg-gray-50/50 rounded-lg border border-gray-200 h-[400px] flex flex-col items-center justify-center">
            {selectedArtifactDetail ? (
              <div className="w-full h-full overflow-auto p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                      {selectedArtifactDetail.type === 'directory' ? (
                        <FolderTree size={14} className="text-orange-400" />
                      ) : (
                        <File size={14} className="text-gray-400" />
                      )}
                      {selectedArtifactDetail.name}
                    </h4>
                    {canDelete && (
                      <button
                        onClick={() => {
                          handleSelectArtifact(selectedArtifactDetail.id, true, selectedArtifactDetail.type === 'directory');
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 text-[11px]">
                    {selectedArtifactDetail.uri && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 w-16 flex-shrink-0">URI:</span>
                        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] break-all">
                          {selectedArtifactDetail.uri}
                        </code>
                        <CopyButton text={selectedArtifactDetail.uri} />
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 w-16 flex-shrink-0">Path:</span>
                      <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] break-all">
                        {selectedArtifactDetail.path}
                      </code>
                      <CopyButton text={selectedArtifactDetail.path} />
                    </div>

                    {selectedArtifactDetail.size && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-16">Size:</span>
                        <span className="text-gray-700">{selectedArtifactDetail.size}</span>
                      </div>
                    )}

                    {selectedArtifactDetail.modified && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 w-16">Modified:</span>
                        <span className="text-gray-700">{selectedArtifactDetail.modified}</span>
                      </div>
                    )}

                    {selectedArtifactDetail.type === 'file' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            File Preview
                          </span>
                          <button className="text-[10px] text-orange-500 hover:text-orange-600">
                            Download
                          </button>
                        </div>
                        <div className="bg-white border border-gray-200 rounded p-3 text-[10px] text-gray-400 italic">
                          Preview not available for this file type
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <File size={32} className="text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">
                  Select an artifact to view details
                </p>
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteArtifactDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteError(null);
          }}
          onConfirm={handleDeleteArtifacts}
          selectedArtifacts={selectedArtifacts}
          isDeleting={isDeleting}
        />
      </div>
    );
  };

// ============================================================================
// ML STUDIO
// ============================================================================

const MLStudioView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Experiments');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedModel(null);
  };

  return (
    <div className="flex flex-col flex-grow overflow-hidden bg-white">
      <div className="bg-gray-100 pt-3 px-4 flex-shrink-0 border-b border-gray-200">
        <div className="flex gap-1">
          {['Models', 'Experiments'].map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`
                px-6 py-2 text-xs font-bold transition-all duration-200 rounded-t-md border-t border-l border-r
                ${activeTab === tab
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
          ))}
        </div>
      </div>

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

// ============================================================================
// SIDEBAR & MAIN APP
// ============================================================================

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('mlstudio');

  const sidebarTop = [
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
            className={`p-2 cursor-pointer transition-all relative group ${activeView === item.id ? 'text-orange-500' : 'text-[#999999] hover:text-white'
              }`}
          >
            {item.isImage && item.imageUrl ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div
                  className={`w-full h-full transition-all ${activeView === item.id
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
              <div className={activeView === item.id ? 'text-orange-500' : 'group-hover:text-white'}>
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
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">
                4
              </span>
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
          <p className="text-[9px] text-gray-400">
            Copyright© 2026. All right reserved. Blendata Co., Ltd. v4.5.2
          </p>
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