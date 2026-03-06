
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskPriority, TaskStatus } from '../types';
import { COLORS } from '../constants';

interface MaintenanceCalendarProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onScheduleTask: (date: Date) => void;
}

const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({ tasks, onSelectTask, onScheduleTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  // Helper to format local date object to YYYY-MM-DD string
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const days = [];
  // Add empty slots for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  // Get tasks for the selected date
  const selectedDateTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    return task.dueDate === formatDate(selectedDate);
  });

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.CRITICAL: return '#ef4444';
      case TaskPriority.HIGH: return '#f59e0b';
      case TaskPriority.MEDIUM: return '#1d98d2';
      default: return '#87b21e';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Calendar Grid Section */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#d4d5da] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-[#f0f9ff] rounded-lg text-[#1d98d2]">
                <CalendarIcon size={24} />
             </div>
             <h2 className="text-xl font-bold text-[#2a313d]">
               {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-bold text-[#1d98d2] hover:bg-[#f0f9ff] rounded-lg transition-colors">
                Today
            </button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-50 gap-px border-b border-gray-200">
          {days.map((date, idx) => {
             if (!date) return <div key={`empty-${idx}`} className="bg-white min-h-[100px]" />;
             
             // Check if selected using string comparison to avoid time issues
             const isSelected = formatDate(selectedDate) === formatDate(date);
             const isToday = formatDate(new Date()) === formatDate(date);
             
             // Find tasks for this day
             const dayTasks = tasks.filter(t => {
                if(!t.dueDate) return false;
                return t.dueDate === formatDate(date);
             });

             const hasCritical = dayTasks.some(t => t.priority === TaskPriority.CRITICAL);

             return (
               <div 
                 key={date.toISOString()}
                 onClick={() => setSelectedDate(date)}
                 className={`bg-white p-2 min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors relative group ${isSelected ? 'bg-blue-50/50' : ''}`}
               >
                 <div className="flex justify-between items-start">
                    <span className={`
                        w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                        ${isToday ? 'bg-[#1d98d2] text-white' : isSelected ? 'bg-[#1d98d2]/20 text-[#1d98d2]' : 'text-gray-700'}
                    `}>
                        {date.getDate()}
                    </span>
                    {dayTasks.length > 0 && (
                        <div className="flex flex-col gap-1 items-end">
                            {hasCritical && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                            <div className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500">
                                {dayTasks.length}
                            </div>
                        </div>
                    )}
                 </div>
                 
                 {/* Mini Task Bars */}
                 <div className="mt-2 space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                        <div 
                           key={task.id} 
                           className="text-[10px] px-1 py-0.5 rounded truncate border-l-2 bg-gray-50 text-gray-600"
                           style={{ borderLeftColor: getPriorityColor(task.priority) }}
                        >
                            {task.title}
                        </div>
                    ))}
                    {dayTasks.length > 3 && (
                        <div className="text-[10px] text-gray-400 pl-1">+ {dayTasks.length - 3} more</div>
                    )}
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* Side Panel: Selected Date Schedule */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-[#d4d5da] flex flex-col h-[600px] lg:h-auto">
         <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col gap-4">
            <div>
                <h3 className="text-lg font-bold text-[#2a313d]">{selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedDateTasks.length} Scheduled Tasks</p>
            </div>
            
            <button 
                onClick={() => onScheduleTask(selectedDate)}
                className="w-full bg-[#1d98d2] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#158bbd] transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={18} /> Schedule Maintenance
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedDateTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                    <CalendarIcon size={40} className="text-gray-300" />
                    <p>No scheduled tasks for this day.</p>
                </div>
            ) : (
                <AnimatePresence>
                    {selectedDateTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => onSelectTask(task)}
                            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border ${
                                    task.priority === TaskPriority.CRITICAL ? 'bg-red-50 text-red-600 border-red-100' :
                                    task.priority === TaskPriority.HIGH ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {task.priority}
                                </span>
                                {task.status === TaskStatus.COMPLETED && <CheckCircle size={16} className="text-[#87b21e]" />}
                            </div>
                            <h4 className="font-bold text-[#2a313d] text-sm mb-1 group-hover:text-[#1d98d2] transition-colors">{task.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <MapPin size={12} /> {task.location}
                            </div>
                            <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock size={12} /> {task.category}
                                </div>
                                <span className="text-xs font-medium text-[#1d98d2]">View Details</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
         </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
