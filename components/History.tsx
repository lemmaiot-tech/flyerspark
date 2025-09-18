import React from 'react';
import { HistoryItem } from '../types';
import { ClockIcon, LightbulbIcon, PencilSquareIcon, TrashIcon, XCircleIcon } from './IconComponents';

interface HistoryProps {
  history: HistoryItem[];
  onClose: () => void;
  onLoadItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onClose, onLoadItem, onClearHistory }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  const getSummary = (item: HistoryItem): string => {
    if (item.prompt.toolMode === 'ideaGenerator') {
      const context = item.prompt.context;
      return `Idea for: "${context.length > 50 ? context.substring(0, 50) + '...' : context}"`;
    } else {
      return `Content structured as: ${item.prompt.outputFormat}`;
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      aria-labelledby="history-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gray-100 dark:bg-[#10102A] rounded-2xl shadow-2xl flex flex-col mx-4">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
          <h2 id="history-modal-title" className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <ClockIcon className="w-6 h-6" />
            Generation History
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white transition-colors"
            aria-label="Close history modal"
          >
            <XCircleIcon className="w-7 h-7" />
          </button>
        </header>

        <main className="p-4 flex-grow overflow-y-auto">
          {history.length > 0 ? (
            <ul className="space-y-3">
              {history.map(item => (
                <li key={item.id}>
                    <button 
                        onClick={() => onLoadItem(item)}
                        className="w-full text-left p-4 rounded-lg bg-white dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#FF3366]"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-grow">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                    {item.prompt.toolMode === 'ideaGenerator' ? <LightbulbIcon className="w-4 h-4 text-[#FF3366]" /> : <PencilSquareIcon className="w-4 h-4 text-[#FF3366]" />}
                                    {getSummary(item)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(item.date)}</p>
                            </div>
                            <span className="text-xs font-bold text-white bg-[#FF3366] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                View
                            </span>
                        </div>
                    </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-gray-500 dark:text-gray-400 p-8">
                <ClockIcon className="w-12 h-12 mb-4" />
                <h3 className="font-semibold text-lg">No History Yet</h3>
                <p>Your generated ideas and content will appear here.</p>
            </div>
          )}
        </main>
        
        {history.length > 0 && (
            <footer className="p-4 border-t border-gray-200 dark:border-white/10 flex-shrink-0">
                <button
                    onClick={onClearHistory}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors duration-200"
                    aria-label="Clear all generation history"
                >
                    <TrashIcon className="w-5 h-5" />
                    <span>Clear History</span>
                </button>
            </footer>
        )}
      </div>
    </div>
  );
};

export default History;
