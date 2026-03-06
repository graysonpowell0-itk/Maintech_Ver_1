import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Task, TaskPriority } from '../types';

interface TaskListProps {
  onSelectTask: (task: Task) => void;
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ onSelectTask, tasks }) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.CRITICAL: return '#ef4444';
      case TaskPriority.HIGH: return '#f59e0b';
      case TaskPriority.MEDIUM: return '#1d98d2';
      default: return '#87b21e';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          task.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || task.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#d4d5da]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search tasks, locations..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1d98d2] text-[#2a313d]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
          {['All', 'HVAC', 'Plumbing', 'Electrical'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat 
                  ? 'bg-[#2a313d] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => onSelectTask(task)}
            className="bg-white rounded-2xl p-0 shadow-sm border border-[#d4d5da] overflow-hidden cursor-pointer group flex"
          >
            {/* Priority Strip */}
            <div className="w-2" style={{ backgroundColor: getPriorityColor(task.priority) }}></div>
            
            <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{task.category}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-xs font-medium text-[#1d98d2]">{task.status}</span>
                </div>
                <h3 className="text-lg font-bold text-[#2a313d] group-hover:text-[#1d98d2] transition-colors">{task.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {task.location}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {task.reportedAt}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#1d98d2] transition-colors">
                  <ChevronRight size={20} className="text-gray-400 group-hover:text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p>No tasks found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;