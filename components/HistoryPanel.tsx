import React from 'react';
import { HistoryItem } from '../types';
import { ClockIcon, TrashIcon, PlayIcon } from './icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  selectedId?: string | null;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectItem, onClearHistory, selectedId }) => {
  return (
    <aside className="w-full bg-gray-800/50 rounded-2xl shadow-2xl p-6 border border-gray-700 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ClockIcon />
          History
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm text-gray-400 hover:text-red-400 transition flex items-center gap-1"
            aria-label="Clear all history"
          >
            <TrashIcon />
            Clear
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-10 flex flex-col items-center justify-center h-full">
          <p>Your generated videos will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[40vh] lg:max-h-[25vh] overflow-y-auto pr-2 -mr-2">
          {history.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSelectItem(item)}
                className={`w-full text-left p-3 rounded-lg transition duration-200 flex items-start gap-3 ${
                  selectedId === item.id
                    ? 'bg-purple-600/50 ring-2 ring-purple-500'
                    : 'bg-gray-700/60 hover:bg-gray-700'
                }`}
              >
                <div className="flex-shrink-0 pt-1 text-gray-400">
                    <PlayIcon />
                </div>
                <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-medium text-gray-200 line-clamp-2" title={item.prompt}>{item.prompt}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default HistoryPanel;