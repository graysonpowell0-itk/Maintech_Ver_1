import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Download, Trash2, Eye, FolderOpen, X } from 'lucide-react';
import { Schematic } from '../types';

interface SchematicsProps {
  schematics: Schematic[];
  onUpload: (schematic: Omit<Schematic, 'id'>) => void;
  onDelete: (id: string) => void;
  currentUserName?: string;
}

const Schematics: React.FC<SchematicsProps> = ({ schematics = [], onUpload, onDelete, currentUserName }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSchematic, setSelectedSchematic] = useState<Schematic | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    category: 'Room Layout' as 'Room Layout' | 'Property Layout' | 'Floor Plan' | 'Other',
    file: null as File | null,
  });

  const categories = ['All', 'Room Layout', 'Property Layout', 'Floor Plan', 'Other'];

  const filteredSchematics = categoryFilter === 'All' 
    ? schematics 
    : schematics.filter(s => s.category === categoryFilter);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadForm(prev => ({ ...prev, file, name: prev.name || file.name.replace('.pdf', '') }));
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name.trim()) {
      alert('Please provide a name and select a PDF file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onUpload({
        name: uploadForm.name,
        description: uploadForm.description,
        category: uploadForm.category,
        fileUrl: base64,
        fileName: uploadForm.file!.name,
        uploadedBy: currentUserName || 'User',
        uploadedAt: new Date().toISOString(),
      });
      
      setUploadForm({
        name: '',
        description: '',
        category: 'Room Layout',
        file: null,
      });
      setIsUploadModalOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(uploadForm.file);
  };

  const handleDownload = (schematic: Schematic) => {
    const link = document.createElement('a');
    link.href = schematic.fileUrl;
    link.download = schematic.fileName;
    link.click();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Room Layout':
        return '🛏️';
      case 'Property Layout':
        return '🏨';
      case 'Floor Plan':
        return '📐';
      default:
        return '📄';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#2a313d]">Hotel Schematics</h1>
          <p className="text-gray-500 mt-1">Property layouts, floor plans, and room diagrams</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-[#1d98d2] hover:bg-[#158bbd] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Upload size={20} /> Upload Schematic
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-[#1d98d2] text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1d98d2]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Schematics Grid */}
      {filteredSchematics.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">No Schematics</h3>
          <p className="text-gray-500">Upload your first schematic to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchematics.map(schematic => (
            <motion.div
              key={schematic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{getCategoryIcon(schematic.category)}</div>
                <button
                  onClick={() => onDelete(schematic.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className="font-bold text-[#2a313d] mb-1">{schematic.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{schematic.category}</p>
              
              {schematic.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{schematic.description}</p>
              )}
              
              <div className="text-xs text-gray-400 mb-4">
                <div>Uploaded by {schematic.uploadedBy}</div>
                <div>{new Date(schematic.uploadedAt).toLocaleDateString()}</div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSchematic(schematic)}
                  className="flex-1 py-2 px-3 bg-[#1d98d2] text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#158bbd] transition-all"
                >
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => handleDownload(schematic)}
                  className="py-2 px-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <Download size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsUploadModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#2a313d]">Upload Schematic</h2>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Floor 3 Layout"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d98d2]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d98d2]"
                  >
                    <option value="Room Layout">Room Layout</option>
                    <option value="Property Layout">Property Layout</option>
                    <option value="Floor Plan">Floor Plan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d98d2] resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PDF File <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#1d98d2] transition-all"
                  >
                    {uploadForm.file ? (
                      <div className="flex items-center justify-center gap-2 text-[#1d98d2]">
                        <FileText size={24} />
                        <span className="font-medium">{uploadForm.file.name}</span>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload size={32} className="mx-auto mb-2" />
                        <p className="font-medium">Click to upload PDF</p>
                        <p className="text-xs mt-1">PDF files only</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadForm.file || !uploadForm.name.trim()}
                  className="flex-1 py-3 bg-[#87b21e] text-white rounded-xl font-bold hover:bg-[#769c1a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {selectedSchematic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSchematic(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-6xl w-full h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-[#2a313d]">{selectedSchematic.name}</h2>
                  <p className="text-sm text-gray-500">{selectedSchematic.category}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(selectedSchematic)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <Download size={18} /> Download
                  </button>
                  <button
                    onClick={() => setSelectedSchematic(null)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <iframe
                  src={selectedSchematic.fileUrl}
                  className="w-full h-full"
                  title={selectedSchematic.name}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Schematics;
