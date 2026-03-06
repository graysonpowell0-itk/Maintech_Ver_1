
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Upload, MapPin, AlignLeft, AlertCircle, Save, Calendar } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';

interface ReportIssueModalProps {
  onClose: () => void;
  onSave: (task: Task) => void;
  initialDate?: Date;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ onClose, onSave, initialDate }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'HVAC' | 'Plumbing' | 'Electrical' | 'General'>('General');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [image, setImage] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(initialDate ? initialDate.toISOString().split('T')[0] : '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: title || `${category} Issue at ${location}`,
      location,
      description,
      priority,
      status: TaskStatus.PENDING,
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category,
      dueDate: dueDate || undefined,
      imageUrl: image || undefined, // Include the uploaded image
    };

    onSave(newTask);
    onClose();
  };

  const isScheduling = !!initialDate;

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-[#2a313d] flex items-center gap-2">
            {isScheduling ? <Calendar className="text-[#1d98d2]" /> : <AlertCircle className="text-[#ef4444]" />} 
            {isScheduling ? 'Schedule Maintenance' : 'Report Issue'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative
                ${image ? 'border-[#1d98d2]' : 'border-gray-300 hover:border-[#1d98d2] bg-gray-50'}
              `}
            >
              {image ? (
                <img src={image} alt="Issue" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-[#1d98d2] mb-2 group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Tap to take photo or upload</p>
                </>
              )}
              {image && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-white" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Location */}
            <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location / Room No.</label>
                <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    required
                    placeholder="e.g. Room 304"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
                </div>
            </div>

            {/* Due Date */}
            <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Scheduled Date</label>
                <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all text-gray-600"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
                </div>
            </div>
          </div>

          {/* Title (Optional, auto-generated if empty) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Task Title (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Leaking Faucet"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none bg-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                >
                    <option value="General">General</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none bg-white"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                    <option value={TaskPriority.CRITICAL}>Critical</option>
                </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description / Comment</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea 
                required
                rows={3}
                placeholder="Describe the issue..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-[2] py-3 bg-[#1d98d2] text-white rounded-xl font-bold hover:bg-[#158bbd] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1d98d2]/20"
            >
              <Save size={20} /> {isScheduling ? 'Schedule Task' : 'Submit Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ReportIssueModal;
