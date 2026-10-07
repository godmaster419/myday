import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Task } from '../types';
import { formatShortDate } from '../utils/dateUtils';

interface SearchBarProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ tasks, onSelectTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const results = query.trim().length > 0
    ? tasks.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10)
    : [];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 transition-colors cursor-pointer"
        title="Search"
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4" onClick={() => { setIsOpen(false); setQuery(''); }}>
      <div className="slide-up bg-white dark:bg-surface-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
          <Search className="w-5 h-5 text-surface-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks, goals, plans..."
            className="flex-1 bg-transparent text-surface-800 dark:text-surface-100 placeholder-surface-400 focus:outline-none text-[15px]"
          />
          <button
            onClick={() => { setIsOpen(false); setQuery(''); }}
            className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto py-2">
            {results.map(task => (
              <button
                key={task.id}
                onClick={() => {
                  onSelectTask(task);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
              >
                <p className={`text-sm ${task.completed ? 'line-through text-surface-400' : 'text-surface-700 dark:text-surface-200'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">
                  {task.type} · {formatShortDate(task.date)}
                </p>
              </button>
            ))}
          </div>
        )}

        {query.trim().length > 0 && results.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-surface-400">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
};
