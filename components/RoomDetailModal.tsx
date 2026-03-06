
import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, BedDouble, User, CheckCircle, AlertTriangle, Clock, History, FileText } from 'lucide-react';
import { Room, Task, TaskStatus } from '../types';
import { COLORS } from '../constants';

interface RoomDetailModalProps {
  room: Room;
  tasks: Task[];
  onClose: () => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ room, tasks, onClose }) => {
  // Filter tasks for this specific room based on room number inclusion in location string
  const roomTasks = tasks.filter(t => t.location.includes(room.number));
  
  const activeIssues = roomTasks.filter(t => 
    t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS
  );

  const historyLogs = roomTasks.filter(t => 
    t.status === TaskStatus.COMPLETED || t.status === TaskStatus.APPROVED
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-[#2a313d] text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BedDouble className="text-[#1d98d2]" />
              Room {room.number}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{room.type} • Floor {room.floor}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Room Info */}
            <div className="space-y-6">
              <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Status Overview</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">Housekeeping</span>
                    <span className={`font-bold ${
                      room.status === 'Clean' ? 'text-[#87b21e]' : 
                      room.status === 'Dirty' ? 'text-[#f59e0b]' : 'text-gray-700'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">Occupancy</span>
                    <span className={`font-bold ${
                      room.occupancy === 'Occupied' ? 'text-[#1d98d2]' : 'text-gray-700'
                    }`}>
                      {room.occupancy}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>Last Cleaned: <strong>{room.lastCleaned}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <User size={16} className="text-gray-400" />
                    <span>Type: <strong>{room.type}</strong></span>
                  </div>
                </div>

                <div className="mt-4">
                    <span className="text-xs text-gray-400 uppercase font-bold">Features</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {room.features.length > 0 ? room.features.map(f => (
                            <span key={f} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium border border-blue-100">
                                {f}
                            </span>
                        )) : <span className="text-xs text-gray-400 italic">No special features listed</span>}
                    </div>
                </div>
              </section>

              {/* PM Status Mini-View */}
              <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">PM Status</h3>
                 <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${
                        room.pmStatus === 'Completed' ? 'text-[#87b21e]' :
                        room.pmStatus === 'In Progress' ? 'text-[#f59e0b]' : 'text-gray-400'
                    }`}>{room.pmStatus}</span>
                    <div className="w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        {Math.round((room.pmChecklist.filter(i => i.isChecked).length / room.pmChecklist.length) * 100)}%
                    </div>
                 </div>
              </section>
            </div>

            {/* Middle & Right Column: Repairs & Logs */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Issues */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-red-50">
                    <AlertTriangle className="text-[#ef4444]" size={20} />
                    <h3 className="font-bold text-[#ef4444]">Needed Repairs / Active Issues</h3>
                    <span className="ml-auto bg-white text-[#ef4444] px-2 py-0.5 rounded-full text-xs font-bold border border-red-100">
                        {activeIssues.length}
                    </span>
                </div>
                
                <div className="p-4 space-y-3">
                    {activeIssues.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                            <CheckCircle size={32} className="mb-2 text-gray-300" />
                            <p>No active maintenance issues reported.</p>
                        </div>
                    ) : (
                        activeIssues.map(task => (
                            <div key={task.id} className="border border-red-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ef4444] rounded-l-lg"></div>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-[#2a313d]">{task.title}</h4>
                                    <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-600 rounded-full">{task.priority}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Clock size={12} /> Reported: {task.reportedAt}</span>
                                    <span className="flex items-center gap-1 font-medium text-[#1d98d2]">{task.status}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
              </section>

              {/* Repair History */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                    <History className="text-gray-500" size={20} />
                    <h3 className="font-bold text-gray-600">Repair Log & History</h3>
                </div>
                
                <div className="p-4">
                    {historyLogs.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">
                            <p>No repair history available.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {historyLogs.map(task => (
                                <div key={task.id} className="flex gap-4 items-start relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-gray-100 last:hidden"></div>
                                    
                                    <div className="mt-1 min-w-[24px]">
                                        <div className="w-6 h-6 rounded-full bg-[#87b21e] flex items-center justify-center text-white">
                                            <CheckCircle size={14} />
                                        </div>
                                    </div>
                                    <div className="flex-1 pb-2 border-b border-gray-50 last:border-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-[#2a313d] text-sm">{task.title}</h4>
                                            <span className="text-xs text-gray-400">{task.reportedAt}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{task.category}</span>
                                            {task.assignedTo && <span className="text-[10px] text-gray-400">Fixed by: {task.assignedTo}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
                Close Overview
            </button>
        </div>

      </motion.div>
    </div>
  );
};

export default RoomDetailModal;
