
import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Check, X, DollarSign, PenTool, UserPlus, Shield } from 'lucide-react';
import { User, ApprovalRequest } from '../types';

interface ApprovalsProps {
  pendingUsers?: User[];
  onApproveUser?: (uid: string) => void;
  onRejectUser?: (uid: string) => void;
  approvalRequests?: ApprovalRequest[];
  onApproveRequest?: (id: string) => void;
  onRejectRequest?: (id: string) => void;
}

const Approvals: React.FC<ApprovalsProps> = ({ 
  pendingUsers = [], 
  onApproveUser, 
  onRejectUser,
  approvalRequests = [],
  onApproveRequest,
  onRejectRequest
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  
  // Filter out already approved/rejected requests
  const pendingRequests = approvalRequests.filter(req => req.status === 'Pending');

  return (
    <div className="flex flex-col h-full">
       <div className="flex items-center justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-xl flex">
             <button 
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-white shadow-sm text-[#2a313d]' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Approval Requests ({pendingRequests.length})
             </button>
             <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white shadow-sm text-[#2a313d]' : 'text-gray-500 hover:text-gray-700'}`}
             >
                User Access
                {pendingUsers.length > 0 && (
                    <span className="bg-[#ef4444] text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingUsers.length}</span>
                )}
             </button>
          </div>
       </div>

       {activeTab === 'requests' ? (
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
             <div className="absolute top-0 left-0 w-full text-center py-4">
                <h2 className="text-xl font-bold text-[#2a313d]">Pending Approvals</h2>
                <p className="text-gray-500 text-sm">Swipe right to approve, left to reject</p>
            </div>

            <div className="relative w-full max-w-sm h-[400px]">
                <AnimatePresence>
                {pendingRequests.map((item, index) => (
                    <Card 
                    key={item.id} 
                    item={item} 
                    isTop={index === pendingRequests.length - 1} 
                    onApprove={() => onApproveRequest && onApproveRequest(item.id)}
                    onReject={() => onRejectRequest && onRejectRequest(item.id)}
                    />
                ))}
                </AnimatePresence>
                {pendingRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Check size={32} />
                    </div>
                    <p>All caught up!</p>
                </div>
                )}
            </div>
          </div>
       ) : (
          <div className="max-w-3xl mx-auto w-full space-y-4">
              <h2 className="text-xl font-bold text-[#2a313d] mb-4">New User Requests</h2>
              {pendingUsers.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                          <UserPlus size={32} />
                      </div>
                      <p className="text-gray-500 font-medium">No pending user requests.</p>
                  </div>
              ) : (
                  <div className="grid gap-4">
                      {pendingUsers.map(user => (
                          <div key={user.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
                              <div className="flex items-center gap-4 flex-1">
                                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                      {user.avatarUrl ? (
                                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                      ) : (
                                          <span className="text-xl font-bold text-gray-400">{user.name.charAt(0)}</span>
                                      )}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-lg text-[#2a313d]">{user.name}</h3>
                                      <p className="text-sm text-gray-500">{user.email}</p>
                                      <div className="mt-1 flex gap-2">
                                          <span className="bg-[#1d98d2]/10 text-[#1d98d2] text-xs font-bold px-2 py-0.5 rounded-full border border-[#1d98d2]/20">{user.role}</span>
                                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-200">Pending</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex gap-3 w-full md:w-auto">
                                  <button 
                                      onClick={() => onRejectUser && onRejectUser(user.uid || user.id)}
                                      className="flex-1 md:flex-none px-6 py-2 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
                                  >
                                      Reject
                                  </button>
                                  <button 
                                      onClick={() => onApproveUser && onApproveUser(user.uid || user.id)}
                                      className="flex-1 md:flex-none px-6 py-2 bg-[#87b21e] text-white font-bold rounded-xl hover:bg-[#769c1a] shadow-lg shadow-[#87b21e]/20 transition-colors flex items-center justify-center gap-2"
                                  >
                                      <Shield size={16} /> Approve Access
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
       )}
    </div>
  );
};

interface CardProps {
  item: ApprovalRequest;
  isTop: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const Card: React.FC<CardProps> = ({ item, isTop, onApprove, onReject }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const bg = useTransform(x, [-150, 0, 150], ['rgb(239, 68, 68)', 'rgb(255, 255, 255)', 'rgb(135, 178, 30)']);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onApprove();
    } else if (info.offset.x < -100) {
      onReject();
    }
  };

  if (!isTop) {
    return (
      <div className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-sm border border-[#d4d5da] p-8 scale-95 opacity-50 -z-10 translate-y-4"></div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, opacity, backgroundColor: bg as any }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-xl border border-[#d4d5da] p-8 flex flex-col items-center text-center cursor-grab active:cursor-grabbing overflow-y-auto"
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
        item.type === 'Purchase' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
      }`}>
        {item.type === 'Purchase' ? <DollarSign size={32} /> : <PenTool size={32} />}
      </div>
      
      <h3 className="text-xl font-bold text-[#2a313d] mb-2">{item.title}</h3>
      <p className="text-gray-500 mb-4">{item.type} Request by <span className="font-semibold text-[#2a313d]">{item.requester}</span></p>
      
      {item.amount && (
        <div className="text-3xl font-bold text-[#2a313d] mb-4">{item.amount}</div>
      )}

      {item.type === 'Repair' && item.completionProofUrl && (
        <div className="w-full mb-4">
          <div className="rounded-xl overflow-hidden border border-gray-200 mb-3">
            <img 
              src={item.completionProofUrl} 
              alt="Completion proof" 
              className="w-full aspect-[5/4] object-cover"
            />
          </div>
          {item.repairSummary && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Repair Summary:</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.repairSummary}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-4 w-full">
         <button onClick={(e) => { e.stopPropagation(); onReject(); }} className="flex-1 py-3 rounded-xl border-2 border-red-100 text-red-500 font-bold flex items-center justify-center hover:bg-red-50 transition-colors">
           Reject
         </button>
         <button onClick={(e) => { e.stopPropagation(); onApprove(); }} className="flex-1 py-3 rounded-xl bg-[#87b21e] text-white font-bold flex items-center justify-center shadow-lg shadow-[#87b21e]/30 hover:bg-[#769c1a] transition-colors">
           Approve
         </button>
      </div>
    </motion.div>
  );
};

export default Approvals;
