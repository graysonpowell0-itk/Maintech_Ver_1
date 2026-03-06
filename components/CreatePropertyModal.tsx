
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Building, MapPin, Save, Hotel, Layers, Hash, Coffee } from 'lucide-react';
import { Property } from '../types';

export interface RoomGenerationConfig {
  [floor: number]: {
    start: number;
    end: number;
  };
}

interface CreatePropertyModalProps {
  onClose: () => void;
  onSave: (property: Property, roomConfig?: RoomGenerationConfig) => void;
  initialData?: Property | null;
}

const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({ onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<Property['type']>('Hotel');
  const [roomCount, setRoomCount] = useState<number | ''>('');
  const [floorCount, setFloorCount] = useState<number | ''>('');
  const [amenities, setAmenities] = useState('');
  const [roomConfig, setRoomConfig] = useState<RoomGenerationConfig>({});

  useEffect(() => {
    if (initialData) {
        setName(initialData.name);
        setAddress(initialData.address);
        setType(initialData.type);
        setRoomCount(initialData.roomCount || '');
        setFloorCount(initialData.floorCount || '');
        setAmenities(initialData.amenities?.join(', ') || '');
    }
  }, [initialData]);

  // Auto-populate room config when floor count changes (only for new properties)
  useEffect(() => {
    if (initialData || !floorCount) return;
    
    const count = Number(floorCount);
    setRoomConfig(prev => {
      const newConfig: RoomGenerationConfig = {};
      for (let i = 1; i <= count; i++) {
        // Preserve existing config if floor still exists, otherwise default
        if (prev[i]) {
            newConfig[i] = prev[i];
        } else {
            // Default: Floor 1 -> 101-110, Floor 2 -> 201-210
            newConfig[i] = { start: i * 100 + 1, end: i * 100 + 10 };
        }
      }
      return newConfig;
    });
  }, [floorCount, initialData]);

  // Auto-calculate total room count based on room config
  useEffect(() => {
    if (initialData || !roomConfig || Object.keys(roomConfig).length === 0) return;
    
    let total = 0;
    Object.values(roomConfig).forEach(range => {
      const start = parseInt(range.start?.toString() || '0');
      const end = parseInt(range.end?.toString() || '0');
      if (start && end && start <= end) {
        total += (end - start + 1);
      }
    });
    
    if (total > 0 && total !== roomCount) {
      setRoomCount(total);
    }
  }, [roomConfig, initialData]);

  const handleRoomConfigChange = (floor: number, field: 'start' | 'end', value: string) => {
      const numVal = parseInt(value) || 0;
      setRoomConfig(prev => {
          const updated = {
              ...prev,
              [floor]: {
                  ...prev[floor],
                  [field]: numVal
              }
          };
          return updated;
      });
  };

  const getRoomRangeValidation = (floor: number) => {
      const range = roomConfig[floor];
      if (!range || !range.start || !range.end) return null;
      
      const start = parseInt(range.start.toString());
      const end = parseInt(range.end.toString());
      
      if (start > end) {
          return { valid: false, message: 'Start must be ≤ End' };
      }
      if (end - start > 100) {
          return { valid: false, message: 'Max 100 rooms per floor' };
      }
      return { valid: true, count: end - start + 1 };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { name, address, type, roomCount, floorCount, roomConfig });
    
    // Validate room ranges for new properties
    if (!initialData && floorCount && Number(floorCount) > 0) {
      let hasInvalidRanges = false;
      for (let i = 1; i <= Number(floorCount); i++) {
        const validation = getRoomRangeValidation(i);
        if (validation && !validation.valid) {
          alert(`Invalid room range for Floor ${i}: ${validation.message}`);
          hasInvalidRanges = true;
          break;
        }
      }
      if (hasInvalidRanges) return;
    }
    
    const newProperty: Property = {
      id: initialData?.id || `prop_${Date.now()}`,
      name,
      address,
      type,
      imageUrl: initialData?.imageUrl || `https://picsum.photos/200/200?random=${Date.now()}`,
      roomCount: Number(roomCount) || 0,
      floorCount: Number(floorCount) || 0,
      amenities: amenities.split(',').map(s => s.trim()).filter(Boolean)
    };
    
    // Ensure all roomConfig values are integers before passing
    const finalRoomConfig: RoomGenerationConfig = {};
    Object.entries(roomConfig).forEach(([floor, range]) => {
        finalRoomConfig[Number(floor)] = {
            start: parseInt(range.start.toString()) || 0,
            end: parseInt(range.end.toString()) || 0
        };
    });
    
    console.log('Final roomConfig being passed:', finalRoomConfig);
    
    // Only pass roomConfig if it's a new property
    onSave(newProperty, initialData ? undefined : finalRoomConfig);
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-[#2a313d] flex items-center gap-2">
            <Building className="text-[#1d98d2]" />
            {initialData ? 'Edit Property' : 'Add New Property'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Property Name</label>
            <div className="relative">
              <Hotel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                required
                placeholder="e.g. Grand Plaza Hotel"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                required
                placeholder="e.g. 123 Main St, New York"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Property Type</label>
              <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none bg-white"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
              >
                  <option value="Hotel">Hotel</option>
                  <option value="Resort">Resort</option>
                  <option value="Motel">Motel</option>
                  <option value="Apartment">Apartment</option>
              </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Floors</label>
               <div className="relative">
                 <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                    type="number" 
                    min="1"
                    placeholder="e.g. 10"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all"
                    value={floorCount}
                    onChange={(e) => setFloorCount(e.target.value ? parseInt(e.target.value) : '')}
                 />
               </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
               Total Rooms {!initialData && roomConfig && Object.keys(roomConfig).length > 0 && (
                 <span className="text-[10px] text-[#1d98d2] bg-[#1d98d2]/10 px-2 py-0.5 rounded-full ml-2">Auto-Calculated</span>
               )}
             </label>
             <div className="relative">
               <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input 
                  type="number" 
                  min="1"
                  placeholder="e.g. 150"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all ${
                    !initialData && roomConfig && Object.keys(roomConfig).length > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  value={roomCount}
                  onChange={(e) => setRoomCount(e.target.value ? parseInt(e.target.value) : '')}
                  disabled={!initialData && roomConfig && Object.keys(roomConfig).length > 0}
               />
             </div>
          </div>

          {/* Room Configuration Section - Only for new properties with floors */}
          {!initialData && floorCount && Number(floorCount) > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center justify-between">
                      <span>Room Number Generation</span>
                      <span className="text-[10px] text-[#1d98d2] bg-[#1d98d2]/10 px-2 py-0.5 rounded-full">Auto-Fill</span>
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {Array.from({ length: Number(floorCount) }).map((_, idx) => {
                          const floor = idx + 1;
                          const validation = getRoomRangeValidation(floor);
                          return (
                              <div key={floor} className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                      <span className="w-14 font-medium text-gray-600 text-xs">Floor {floor}:</span>
                                      <div className={`flex items-center bg-white border rounded-lg overflow-hidden flex-1 ${
                                          validation && !validation.valid ? 'border-red-300' : 'border-gray-200'
                                      }`}>
                                          <input
                                              type="number"
                                              className="w-full p-1.5 text-center outline-none text-xs"
                                              placeholder="Start"
                                              value={roomConfig[floor]?.start || ''}
                                              onChange={e => handleRoomConfigChange(floor, 'start', e.target.value)}
                                          />
                                          <span className="text-gray-300 px-1">-</span>
                                          <input
                                              type="number"
                                              className="w-full p-1.5 text-center outline-none text-xs"
                                              placeholder="End"
                                              value={roomConfig[floor]?.end || ''}
                                              onChange={e => handleRoomConfigChange(floor, 'end', e.target.value)}
                                          />
                                      </div>
                                      {validation?.valid && (
                                          <span className="text-[10px] text-gray-500 w-12 text-right">
                                              {validation.count} rms
                                          </span>
                                      )}
                                  </div>
                                  {validation && !validation.valid && (
                                      <p className="text-[10px] text-red-500 ml-16">{validation.message}</p>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Common Areas / Amenities</label>
             <div className="relative">
               <Coffee className="absolute left-3 top-3 text-gray-400" size={18} />
               <textarea 
                  rows={2}
                  placeholder="e.g. Lobby, Gym, Pool, Staff Room (comma separated)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none transition-all resize-none"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
               />
             </div>
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
              className="flex-[2] py-3 bg-[#1d98d2] text-white rounded-xl font-bold hover:bg-[#158bbd] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1d98d2]/20"
            >
              <Save size={20} /> {initialData ? 'Save Changes' : 'Create Property'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreatePropertyModal;
