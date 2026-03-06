
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, Package, ArrowRight } from 'lucide-react';
import { TEAM_MEMBERS, COLORS } from '../constants';
import { Task, TaskPriority, InventoryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  onChangeTab: (tab: string) => void;
  tasks: Task[];
  inventory: InventoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeTab, tasks, inventory }) => {
  const { t } = useLanguage();
  
  // Sort tasks by priority (Critical > High > Medium > Low) and take top 3
  const priorityOrder = {
    [TaskPriority.CRITICAL]: 4,
    [TaskPriority.HIGH]: 3,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.LOW]: 1,
  };

  const topIssues = [...tasks]
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 3);

  const lowStockItems = inventory.filter(i => i.quantity <= i.minThreshold);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#2a313d]">{t.goodMorning}, Tech</h1>
        <p className="text-gray-500">{t.systemFunctional} {topIssues.filter(t => t.priority === TaskPriority.CRITICAL).length} {t.criticalAlerts}</p>
      </div>

      {/* Urgent Issues Widget - Vertical Stack */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#2a313d] flex items-center gap-2">
            <AlertTriangle className="text-[#ef4444]" size={20} />
            {t.urgentIssues}
          </h3>
          <button onClick={() => onChangeTab('tasks')} className="text-sm text-[#1d98d2] font-medium hover:underline">{t.viewAll}</button>
        </div>
        
        <div className="flex flex-col gap-3">
          {topIssues.length === 0 ? (
              <div className="p-8 bg-white rounded-xl text-center text-gray-400 border border-[#d4d5da]">{t.noUrgentIssues}</div>
          ) : (
            topIssues.map((task, index) => (
                <motion.div 
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.005 }}
                className="w-full bg-white border-l-4 rounded-xl shadow-sm p-5 relative overflow-hidden group cursor-pointer"
                style={{ borderColor: task.priority === TaskPriority.CRITICAL ? '#ef4444' : task.priority === TaskPriority.HIGH ? '#f59e0b' : '#1d98d2' }}
                onClick={() => onChangeTab('tasks')}
                >
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                    task.priority === TaskPriority.CRITICAL ? 'bg-[#ef4444]/10 text-[#ef4444]' : 
                    task.priority === TaskPriority.HIGH ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#1d98d2]/10 text-[#1d98d2]'
                    }`}>
                    {task.priority}
                    </span>
                    <span className="text-xs text-gray-400">{task.reportedAt}</span>
                </div>
                <h4 className="font-bold text-[#2a313d] text-lg mb-1">{task.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{task.location}</p>
                <div className="flex items-center text-[#1d98d2] text-sm font-medium group-hover:gap-2 transition-all">
                    {t.resolveNow} <ArrowRight size={16} className="ml-1" />
                </div>
                </motion.div>
            ))
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Status Widget */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#d4d5da]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#2a313d] flex items-center gap-2">
              <Users className="text-[#1d98d2]" size={20} />
              {t.teamStatus}
            </h3>
            <span className="bg-[#87b21e]/10 text-[#87b21e] px-2 py-1 rounded-full text-xs font-bold">
              {TEAM_MEMBERS.filter(u => u.status === 'online').length + 1} {t.active}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Current User */}
             <div className="relative">
                <img src="https://picsum.photos/100/100" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt="Me" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#87b21e] border-2 border-white rounded-full"></div>
             </div>
             {/* Other Members */}
             {TEAM_MEMBERS.map(member => (
               <div key={member.id} className="relative group">
                 <img src={member.avatarUrl} className="w-14 h-14 rounded-full border-2 border-white shadow-sm grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt={member.name} />
                 <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white rounded-full ${
                   member.status === 'online' ? 'bg-[#87b21e]' : member.status === 'busy' ? 'bg-[#f59e0b]' : 'bg-gray-400'
                 }`}></div>
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   {member.name}
                 </div>
               </div>
             ))}
             <button 
               onClick={() => onChangeTab('approvals')}
               className="w-14 h-14 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#1d98d2] hover:border-[#1d98d2] transition-colors"
               title="Manage team members"
             >
               +
             </button>
          </div>
        </section>

        {/* Inventory Alert Widget */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#d4d5da]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#2a313d] flex items-center gap-2">
              <Package className="text-[#f59e0b]" size={20} />
              {t.lowStock}
            </h3>
            <button onClick={() => onChangeTab('inventory')} className="text-sm text-[#1d98d2] font-medium">{t.reorder}</button>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-500">{t.inventoryOptimal}</p>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-[#fdfdfd] rounded-xl border border-[#d4d5da]/50 hover:border-[#f59e0b] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                      <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#2a313d]">{item.name}</p>
                      <p className="text-xs text-[#f59e0b] font-medium">{item.quantity} remaining (Min: {item.minThreshold})</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onChangeTab('inventory')}
                    className="px-3 py-1.5 bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-bold rounded-lg hover:bg-[#f59e0b] hover:text-white transition-colors"
                  >
                    {t.order}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t.pendingTasks, val: tasks.filter(t => t.status === 'Pending').length.toString(), color: '#1d98d2' },
          { label: t.avgResolution, val: '45m', color: '#87b21e' },
          { label: t.occupancy, val: '88%', color: '#2a313d' },
          { label: t.systemHealth, val: '99%', color: '#87b21e' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-[#d4d5da] flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.val}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
