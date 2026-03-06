import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Cpu, Zap, Check, Upload, Wrench, AlertCircle } from 'lucide-react';
import { Task, TaskStatus, AIFixSuggestion } from '../types';
import { analyzeBrokenEquipment } from '../services/geminiService';

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
  onComplete: (proofImage: string, repairSummary: string) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onBack, onComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AIFixSuggestion | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [repairSummary, setRepairSummary] = useState('');
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isProof: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      if (isProof) {
        setProofImage(base64);
      } else {
        setImage(base64);
        setIsAnalyzing(true);
        // Remove data URL prefix for API
        const base64Data = base64.split(',')[1];
        const result = await analyzeBrokenEquipment(base64Data);
        setAiSuggestion(result);
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitCompletion = () => {
    if (proofImage && repairSummary.trim()) {
      setIsCompleted(true);
      setTimeout(() => onComplete(proofImage, repairSummary), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-gray-500 hover:text-[#2a313d] transition-colors"
      >
        <ArrowLeft size={20} /> Back to Tasks
      </button>

      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d4d5da]">
        <div className="flex justify-between items-start mb-4">
          <div>
             <h1 className="text-2xl font-bold text-[#2a313d]">{task.title}</h1>
             <p className="text-[#1d98d2] font-medium mt-1 flex items-center gap-1">
               <MapPinIcon size={16} /> {task.location}
             </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            task.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {task.priority} Priority
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
          {task.description}
        </p>
        
        {/* Issue Image */}
        {task.imageUrl && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Reported Issue Photo:</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img 
                src={task.imageUrl} 
                alt="Issue photo" 
                className="w-full aspect-[5/4] object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* AI Troubleshooting Module - Optional */}
      {!showAiAssistant ? (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#d4d5da]">
          <button
            onClick={() => setShowAiAssistant(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1d98d2]/10 flex items-center justify-center">
                <Cpu className="text-[#1d98d2]" size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[#2a313d]">AI Troubleshooting Assistant</h3>
                <p className="text-xs text-gray-500">Optional: Get instant diagnostic & repair steps</p>
              </div>
            </div>
            <Zap className="text-[#1d98d2]" size={20} />
          </button>
        </div>
      ) : (
        <div className="bg-[#2a313d] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Cpu size={120} />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
              <Zap className="text-[#1d98d2]" /> AI Troubleshooting Assistant
            </h2>
            <button
              onClick={() => setShowAiAssistant(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {!image ? (
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm relative z-10">
              <p className="mb-4 text-center text-gray-300">
                Upload a photo of the broken equipment to get instant diagnostic & repair steps.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#1d98d2] hover:bg-[#158bbd] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#1d98d2]/20"
              >
                <Camera size={20} /> Scan Equipment
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e)} 
            />
          </div>
        ) : (
          <div className="relative z-10">
            <div className="flex gap-6 flex-col md:flex-row">
               <div className="w-full md:w-1/3 relative rounded-xl overflow-hidden border border-gray-600">
                  <img src={image} alt="Analyzed" className="w-full h-full object-cover" />
                  {isAnalyzing && (
                    <motion.div 
                      className="absolute inset-0 bg-[#1d98d2]/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#1d98d2] shadow-[0_0_15px_#1d98d2]" 
                           style={{ animation: 'scan 2s linear infinite' }} />
                      <style>{`
                        @keyframes scan {
                          0% { top: 0; }
                          100% { top: 100%; }
                        }
                      `}</style>
                    </motion.div>
                  )}
               </div>

               <div className="flex-1">
                 {isAnalyzing ? (
                   <div className="h-full flex flex-col items-center justify-center space-y-4 py-8">
                     <div className="w-8 h-8 border-4 border-[#1d98d2] border-t-transparent rounded-full animate-spin" />
                     <p className="text-gray-300 animate-pulse">Analyzing visual patterns...</p>
                   </div>
                 ) : aiSuggestion ? (
                   <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                   >
                     <div className="flex items-center justify-between">
                       <h3 className="font-bold text-lg text-[#1d98d2]">Analysis Complete</h3>
                       <span className="text-xs bg-[#87b21e]/20 text-[#87b21e] px-2 py-1 rounded-full border border-[#87b21e]/30">
                         {aiSuggestion.confidence}% Confidence
                       </span>
                     </div>
                     
                     <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                       <p className="text-sm font-medium">{aiSuggestion.issue}</p>
                     </div>

                     <div className="space-y-2">
                       <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Recommended Actions:</p>
                       {aiSuggestion.steps.map((step, idx) => (
                         <div key={idx} className="flex gap-3 text-sm">
                           <span className="w-5 h-5 rounded-full bg-[#1d98d2] flex items-center justify-center text-xs font-bold flex-shrink-0">
                             {idx + 1}
                           </span>
                           <p className="text-gray-200">{step}</p>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 ) : null}
               </div>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Action Footer */}
      {!isCompleted ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#d4d5da]">
           <h3 className="font-semibold text-[#2a313d] mb-4 text-center">Submit Repair for Approval</h3>
           
           {proofImage && (
             <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
               <img src={proofImage} alt="Proof of completion" className="w-full aspect-[5/4] object-cover" />
             </div>
           )}
           
           <button 
             onClick={() => proofInputRef.current?.click()}
             className="w-full mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-gray-300"
           >
             <Camera size={20} /> {proofImage ? 'Change Completion Photo' : 'Upload Completion Photo'}
           </button>
           <input 
             type="file" 
             ref={proofInputRef} 
             className="hidden" 
             accept="image/*" 
             onChange={(e) => handleImageUpload(e, true)}
           />

           <div className="mb-4">
             <label className="block text-sm font-semibold text-[#2a313d] mb-2">
               Repair Summary <span className="text-red-500">*</span>
             </label>
             <textarea
               value={repairSummary}
               onChange={(e) => setRepairSummary(e.target.value)}
               placeholder="Describe the work performed, parts used, and any observations..."
               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d98d2] focus:border-transparent resize-none"
               rows={4}
             />
           </div>

           <button 
             onClick={handleSubmitCompletion}
             disabled={!proofImage || !repairSummary.trim()}
             className="w-full bg-[#87b21e] hover:bg-[#769c1a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#87b21e]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             <Upload size={24} /> Submit for Admin Approval
           </button>
           {!proofImage && (
             <p className="text-xs text-gray-500 mt-2 text-center">Upload completion photo to enable submission</p>
           )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1d98d2] text-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-white text-[#1d98d2] rounded-full flex items-center justify-center mb-4 shadow-xl">
            <Check size={32} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Submitted for Approval!</h2>
          <p className="opacity-90">Your repair completion is pending admin review...</p>
        </motion.div>
      )}
    </div>
  );
};

// Helper for location icon
const MapPinIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export default TaskDetail;