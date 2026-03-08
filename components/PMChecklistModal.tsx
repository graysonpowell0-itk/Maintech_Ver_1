
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Circle, ClipboardCheck, Save, User } from 'lucide-react';
import { Room, PMItem, PMLogEntry } from '../types';

interface PMChecklistModalProps {
  room: Room;
  currentUserName: string;
  onClose: () => void;
  onSave: (updatedRoom: Room) => void;
}

const PMChecklistModal: React.FC<PMChecklistModalProps> = ({ room, currentUserName, onClose, onSave }) => {
  const [items, setItems] = useState<PMItem[]>(JSON.parse(JSON.stringify(room.pmChecklist)));

  const categories = Array.from(new Set(items.map(item => item.category)));

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const handleSave = () => {
    const total = items.length;
    const checked = items.filter(i => i.isChecked).length;
    
    let status: Room['pmStatus'] = 'Not Started';
    if (checked === total) status = 'Completed';
    else if (checked > 0) status = 'In Progress';

    // Create log entry when PM is completed
    const now = new Date().toISOString();
    const logEntry: PMLogEntry = {
      completedBy: currentUserName,
      completedAt: now,
      itemsCompleted: checked,
      totalItems: total
    };

    // Build updated room with PM tracking
    const updatedRoom: Room = {
      ...room,
      pmChecklist: items,
      pmStatus: status,
      ...(status === 'Completed' ? {
        pmCompletedBy: currentUserName,
        pmCompletedAt: now,
        pmHistory: [...(room.pmHistory || []), logEntry]
      } : {})
    };

    onSave(updatedRoom);
    onClose();
  };

  const getProgress = () => {
    const checked = items.filter(i => i.isChecked).length;
    return Math.round((checked / items.length) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2a313d] flex items-center gap-2">
              <ClipboardCheck className="text-[#1d98d2]" />
              PM Checklist - Room {room.number}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1d98d2] transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-gray-500">{getProgress()}% Complete</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <User size={12} /> Technician: <span className="font-medium text-[#2a313d]">{currentUserName}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 sticky top-0 bg-white py-2 z-10 border-b border-gray-100">
                {category}
              </h3>
              <div className="space-y-2">
                {items.filter(i => i.category === category).map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all group"
                  >
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors
                      ${item.isChecked 
                        ? 'bg-[#87b21e] border-[#87b21e] text-white' 
                        : 'border-gray-300 text-transparent group-hover:border-[#1d98d2]'
                      }
                    `}>
                      <CheckCircle size={14} fill={item.isChecked ? "currentColor" : "none"} />
                    </div>
                    <span className={`text-sm font-medium transition-colors ${item.isChecked ? 'text-gray-400 line-through' : 'text-[#2a313d]'}`}>
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 rounded-xl font-bold bg-[#1d98d2] text-white hover:bg-[#158bbd] transition-colors flex items-center gap-2 shadow-lg shadow-[#1d98d2]/20"
          >
            <Save size={20} /> Save Progress
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PMChecklistModal;
