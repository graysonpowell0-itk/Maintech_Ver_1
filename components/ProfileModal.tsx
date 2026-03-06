import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Save, User as UserIcon, Building2 } from 'lucide-react';
import { User, Property } from '../types';

interface ProfileModalProps {
  user: User;
  properties: Property[];
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, properties, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [propertyId, setPropertyId] = useState(user.propertyId ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave({ name, avatarUrl, propertyId: propertyId || undefined });
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-[#2a313d] flex items-center gap-2">
            <UserIcon className="text-[#1d98d2]" />
            Edit Profile
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-[#1d98d2] font-bold hover:underline"
            >
              Change Photo
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full text-center">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Role</p>
              <p className="text-sm font-bold text-[#2a313d]">{user.role}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-sm font-bold text-[#2a313d] truncate">{user.email}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Building2 size={12} /> Property</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all bg-white text-[#2a313d] font-medium"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              <option value="">— Not assigned —</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

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
              disabled={isLoading}
              className="flex-[2] py-3 bg-[#1d98d2] text-white rounded-xl font-bold hover:bg-[#158bbd] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1d98d2]/20 disabled:opacity-70"
            >
              {isLoading ? 'Saving...' : 'Save Changes'} <Save size={20} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileModal;
