
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BedDouble, CalendarCheck, AlertCircle, CheckCircle, SprayCan, Ban, AlertTriangle, ClipboardList, Layers, ChevronDown, Upload, LogOut, Clock } from 'lucide-react';
import { COLORS } from '../constants';
import { Room, RoomStatus, TaskStatus, Task, OccupancyStatus } from '../types';
import PMChecklistModal from './PMChecklistModal';
import RoomDetailModal from './RoomDetailModal';

interface RoomDashboardProps {
    rooms: Room[];
    tasks: Task[];
    onUpdateRoom: (room: Room) => void;
    bulkUpdateRooms: (rooms: Room[]) => Promise<void>;
    onSelectTask: (task: Task) => void;
    currentUserName: string;
}

const RoomDashboard: React.FC<RoomDashboardProps> = ({ rooms, tasks, onUpdateRoom, bulkUpdateRooms, onSelectTask, currentUserName }) => {
  const [filter, setFilter] = useState<'All' | 'Clean' | 'Dirty' | 'Occupied' | 'Vacant' | 'Pending Departure'>('All');
  const [selectedFloor, setSelectedFloor] = useState<number | 'All'>('All');
  const [selectedRoomForPM, setSelectedRoomForPM] = useState<Room | null>(null);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Extract unique floors and sort them
  const uniqueFloors = Array.from(new Set(rooms.map(r => Number(r.floor)))).sort((a: number, b: number) => a - b);

  // Filter rooms based on floor selection first (for stats)
  const roomsOnFloor = selectedFloor === 'All' ? rooms : rooms.filter(r => r.floor === selectedFloor);

  // Apply status/occupancy filters and sort by room number
  const filteredRooms = roomsOnFloor
    .filter(room => {
      if (filter === 'All') return true;
      if (filter === 'Clean' || filter === 'Dirty') return room.status === filter;
      if (filter === 'Occupied' || filter === 'Vacant' || filter === 'Pending Departure') return room.occupancy === filter;
      return true;
    })
    .sort((a, b) => {
      // Sort by floor first, then by room number within floor
      if (a.floor !== b.floor) {
        return a.floor - b.floor;
      }
      // Sort room numbers numerically
      return parseInt(a.number) - parseInt(b.number);
    });

  const stats = {
    total: roomsOnFloor.length,
    occupied: roomsOnFloor.filter(r => r.occupancy === 'Occupied').length,
    dirty: roomsOnFloor.filter(r => r.status === 'Dirty').length,
    clean: roomsOnFloor.filter(r => r.status === 'Clean').length,
    pending: roomsOnFloor.filter(r => r.occupancy === 'Pending Departure').length
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'Clean': return COLORS.success;
      case 'Dirty': return COLORS.warning;
      case 'Out of Order': return COLORS.secondaryBg;
      case 'Inspecting': return COLORS.primary;
      default: return COLORS.border;
    }
  };

  const getStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case 'Clean': return <CheckCircle size={14} />;
      case 'Dirty': return <SprayCan size={14} />;
      case 'Out of Order': return <Ban size={14} />;
      case 'Inspecting': return <AlertCircle size={14} />;
      default: return null;
    }
  };

  const getPMButtonStyles = (status: Room['pmStatus']) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#87b21e] text-white border-transparent hover:bg-[#769c1a]';
      case 'In Progress':
        return 'bg-[#f59e0b] text-white border-transparent hover:bg-[#e0920a]';
      default: // Not Started
        return 'bg-transparent text-gray-400 border-gray-300 hover:border-[#1d98d2] hover:text-[#1d98d2]';
    }
  };

  const hasActiveIssue = (roomNumber: string) => {
    return tasks.some(task => 
      task.location.includes(roomNumber) && 
      task.status !== TaskStatus.COMPLETED && 
      task.status !== TaskStatus.APPROVED
    );
  };

  const getActiveTaskForRoom = (roomNumber: string): Task | undefined => {
    return tasks.find(task => 
      task.location.includes(roomNumber) && 
      task.status !== TaskStatus.COMPLETED && 
      task.status !== TaskStatus.APPROVED
    );
  };

  // CSV Parsing Logic
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        processCSV(text);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const processCSV = async (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/);
    if (lines.length < 2) {
      alert("CSV file is empty or has no data rows.");
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Helper to find index safely
    const getIndex = (possibleHeaders: string[]) => headers.findIndex(h => possibleHeaders.some(ph => h.includes(ph)));

    const idxNumber = getIndex(['room number', 'room no', 'room #', 'no.', 'room']);
    const idxHsk = getIndex(['hsk status', 'hsk', 'housekeeping']);
    const idxOcc = getIndex(['occ status', 'occupancy']);
    const idxDate = getIndex(['check out date', 'checkout date', 'checkout', 'departure', 'dep date', 'dep']);

    if (idxNumber === -1) {
      alert("Error: CSV must contain a 'Room number' column.");
      return;
    }

    const updates: Room[] = [];
    let updatedCount = 0;
    let errors = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',').map(c => c.trim());
        // Handle potential trailing commas or empty columns
        if (cols.length <= idxNumber) continue;

        const roomNumber = cols[idxNumber];
        if (!roomNumber) continue;
        
        // Find existing room
        const existingRoom = rooms.find(r => r.number === roomNumber);
        
        if (existingRoom) {
            const updateData: Room = { ...existingRoom };
            let hasChanges = false;
            
            // Map HSK Status
            if (idxHsk > -1 && cols[idxHsk]) {
                const val = cols[idxHsk].toLowerCase();
                let newStatus: RoomStatus | null = null;
                if (val === 'clean' || val === 'ready') newStatus = 'Clean';
                else if (val === 'dirty') newStatus = 'Dirty';
                else if (val === 'inspecting' || val === 'inspect') newStatus = 'Inspecting';
                else if (val === 'ooo' || val === 'out of order') newStatus = 'Out of Order';
                
                if (newStatus && newStatus !== existingRoom.status) {
                    updateData.status = newStatus;
                    hasChanges = true;
                }
            }

            // Map OCC Status
            if (idxOcc > -1 && cols[idxOcc]) {
                const val = cols[idxOcc].toLowerCase();
                let newOccupancy: OccupancyStatus | null = null;
                if (val === 'vacant') newOccupancy = 'Vacant';
                else if (val === 'occupied' || val === 'checked in' || val === 'stay over') newOccupancy = 'Occupied';
                else if (val === 'pending departure' || val === 'pending' || val === 'due out') newOccupancy = 'Pending Departure';
                
                if (newOccupancy && newOccupancy !== existingRoom.occupancy) {
                    updateData.occupancy = newOccupancy;
                    hasChanges = true;
                }
            }

            // Map Checkout Date
            if (idxDate > -1 && cols[idxDate]) {
                const newDate = cols[idxDate].trim();
                if (newDate && newDate !== existingRoom.checkoutDate) {
                    updateData.checkoutDate = newDate;
                    hasChanges = true;
                }
            } else if (idxDate > -1) {
                // Clear checkout date if column exists but is empty
                if (existingRoom.checkoutDate) {
                    updateData.checkoutDate = undefined;
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                updates.push(updateData);
                updatedCount++;
            }
        } else {
            // Room not found in system
            console.warn(`Room ${roomNumber} not found in system.`);
            errors++;
        }
    }

    if (updates.length > 0) {
        console.log('CSV Updates to apply:', updates.map(r => ({ number: r.number, status: r.status, occupancy: r.occupancy })));
        try {
            await bulkUpdateRooms(updates);
            alert(`✓ CSV Processed Successfully\n\nUpdated: ${updatedCount} room(s)\nSkipped: ${errors} room(s) not found\n\nThe room grid has been updated.`);
        } catch (error) {
            console.error('Bulk update error:', error);
            alert(`⚠ Error updating rooms. Please try again.`);
        }
    } else {
        alert("No matching rooms found to update.\n\nPlease check that room numbers in your CSV match existing rooms.");
    }
  };

  const downloadTemplate = () => {
    const headers = "Room Number,HSK Status,Occupancy,Checkout Date";
    const sample = [
        "101,Clean,Vacant,",
        "102,Dirty,Occupied,",
        "103,Clean,Pending Departure,2026-02-25",
        "104,Inspecting,Vacant,"
    ].join('\n');
    const blob = new Blob([`${headers}\n${sample}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "room_update_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#d4d5da] shadow-sm">
        
        {/* Floor Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 bg-[#f0f9ff] rounded-lg text-[#1d98d2]">
                <Layers size={20} />
            </div>
            <div>
                <h3 className="font-bold text-[#2a313d] text-sm">Floor Filter</h3>
                <p className="text-xs text-gray-500">Showing {selectedFloor === 'All' ? 'all floors' : `Floor ${selectedFloor}`}</p>
            </div>
            <div className="relative ml-2">
                <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                    className="appearance-none bg-gray-50 border border-gray-200 text-[#2a313d] font-bold py-2 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d98d2]/20 text-sm"
                >
                    <option value="All">All Floors</option>
                    {uniqueFloors.map(floor => (
                        <option key={floor} value={floor}>Floor {floor}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDown size={14} />
                </div>
            </div>
        </div>

        {/* CSV Upload */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button 
                onClick={downloadTemplate}
                className="text-xs text-[#1d98d2] font-bold hover:underline mr-2"
            >
                Download Template
            </button>
            <input 
                type="file" 
                ref={fileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#1d98d2] text-white rounded-xl font-bold text-sm hover:bg-[#158bbd] transition-colors shadow-md shadow-[#1d98d2]/20"
            >
                <Upload size={16} /> Bulk Update (CSV)
            </button>
        </div>
      </div>

      {/* Stats Header (Updates based on Floor Selection) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Rooms', val: stats.total, color: COLORS.secondaryBg },
          { label: 'Occupancy', val: stats.total > 0 ? `${Math.round((stats.occupied / stats.total) * 100)}%` : '0%', color: COLORS.primary },
          { label: 'Pending Dept.', val: stats.pending, color: '#f59e0b' },
          { label: 'Needs Cleaning', val: stats.dirty, color: COLORS.warning },
          { label: 'Ready', val: stats.clean, color: COLORS.success },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-[#d4d5da] shadow-sm flex flex-col justify-between h-24 transition-all">
            <span className="text-2xl font-bold" style={{ color: stat.color }}>{stat.val}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl border border-[#d4d5da] shadow-sm w-full md:w-fit">
        {['All', 'Clean', 'Dirty', 'Occupied', 'Vacant', 'Pending Departure'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              filter === f
                ? 'bg-[#2a313d] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredRooms.map((room) => {
          const statusColor = getStatusColor(room.status);
          const isOccupied = room.occupancy === 'Occupied';
          const isPending = room.occupancy === 'Pending Departure';
          const hasIssue = hasActiveIssue(room.number);
          
          if (hasIssue) {
            console.log(`Room ${room.number} has active issue, tasks:`, tasks.filter(t => t.location.includes(room.number)));
          }

          // Visual cue for Pending Departure: Yellow background tint or border
          const borderColor = isPending ? '#f59e0b' : (room.status === 'Dirty' ? COLORS.warning : COLORS.border);
          const bgTint = isPending ? 'bg-yellow-50' : 'bg-white';

          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedRoomForDetail(room)}
              className={`${bgTint} rounded-xl overflow-hidden border shadow-sm relative group cursor-pointer flex flex-col transition-shadow hover:shadow-md`}
              style={{ borderColor: borderColor, borderWidth: isPending ? '2px' : '1px' }}
            >
              {/* Status Bar */}
              <div className="h-1 w-full" style={{ backgroundColor: statusColor }}></div>
              
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-[#2a313d]">{room.number}</h3>
                    {hasIssue && (
                        <motion.button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const task = getActiveTaskForRoom(room.number);
                            if (task) {
                              onSelectTask(task);
                            }
                          }}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          whileHover={{ scale: 1.1 }}
                          className="text-[#ef4444] cursor-pointer z-10 relative" 
                          title="Click to view maintenance issue"
                        >
                            <AlertTriangle size={18} fill="#ef4444" className="text-white drop-shadow-sm" />
                        </motion.button>
                    )}
                  </div>
                  <div className={`p-1.5 rounded-full ${isOccupied ? 'bg-[#1d98d2]/10 text-[#1d98d2]' : isPending ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-gray-100 text-gray-400'}`}>
                    {isOccupied ? <User size={16} /> : isPending ? <LogOut size={16} /> : <BedDouble size={16} />}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">{room.type}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                   {/* Clean/Dirty Badge */}
                   <div 
                     className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 border"
                     style={{ 
                       color: statusColor, 
                       backgroundColor: `${statusColor}10`,
                       borderColor: `${statusColor}30`
                     }}
                   >
                     {getStatusIcon(room.status)}
                     {room.status}
                   </div>
                   
                   {/* Occupancy Badge */}
                   <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                     isOccupied 
                      ? 'bg-blue-50 text-blue-600 border-blue-100' 
                      : isPending
                      ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                      : 'bg-gray-50 text-gray-500 border-gray-100'
                   }`}>
                     {room.occupancy}
                   </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex flex-col gap-1 text-xs text-gray-400">
                   <div className="flex items-center justify-between">
                       <span className="flex items-center gap-1"><CalendarCheck size={12} /> {room.floor} Flr</span>
                       <span>{room.lastCleaned.includes('Today') ? room.lastCleaned.split(',')[1] : room.lastCleaned}</span>
                   </div>
                   {room.checkoutDate && (
                       <div className="flex items-center gap-1 text-[#f59e0b] font-medium mt-1">
                           <Clock size={12} /> Dep: {room.checkoutDate}
                       </div>
                   )}
                </div>
              </div>

              {/* PM Button Area */}
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoomForPM(room);
                  }}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 border transition-all ${getPMButtonStyles(room.pmStatus)}`}
                >
                  <ClipboardList size={14} />
                  PM: {room.pmStatus}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedRoomForPM && (
          <PMChecklistModal 
            room={selectedRoomForPM}
            currentUserName={currentUserName}
            onClose={() => setSelectedRoomForPM(null)}
            onSave={onUpdateRoom}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRoomForDetail && (
            <RoomDetailModal 
                room={selectedRoomForDetail}
                tasks={tasks}
                onClose={() => setSelectedRoomForDetail(null)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomDashboard;
