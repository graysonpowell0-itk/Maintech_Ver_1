import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Plus, Search, AlertCircle, X, PackagePlus, Edit2, Save, Trash2, Camera, Upload, ShoppingCart } from 'lucide-react';
import { InventoryItem, ApprovalRequest } from '../types';

interface InventoryProps {
    items: InventoryItem[];
    onUpdate: (item: InventoryItem) => void;
    onDelete: (id: string) => void;
    onRequestPurchase: (request: Omit<ApprovalRequest, 'id'>) => void;
    currentUser: any;
    currentPropertyId?: string;
}

const Inventory: React.FC<InventoryProps> = ({ items, onUpdate, onDelete, onRequestPurchase, currentUser, currentPropertyId }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [search, setSearch] = useState('');
  const [purchaseRequestItem, setPurchaseRequestItem] = useState<InventoryItem | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem>>({});
  
  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.name || !editingItem.sku) return;

    const newItem: InventoryItem = {
      id: editingItem.id || Math.random().toString(36).substr(2, 9),
      name: editingItem.name,
      sku: editingItem.sku,
      quantity: Number(editingItem.quantity) || 0,
      minThreshold: Number(editingItem.minThreshold) || 5,
      category: editingItem.category || 'General',
      location: editingItem.location || 'Storage',
      imageUrl: editingItem.imageUrl || `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
      specs: editingItem.specs || undefined,
      distributor: editingItem.distributor || undefined,
      salesAgent: editingItem.salesAgent || undefined,
      orderPageUrl: editingItem.orderPageUrl || undefined,
      propertyId: editingItem.propertyId || currentPropertyId,
    } as InventoryItem;

    onUpdate(newItem);
    setIsModalOpen(false);
    setEditingItem({});
  };

  const handleDeleteItem = (id: string) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
      onDelete(id);
      setIsModalOpen(false);
    }
  };

  const openAddModal = () => {
    setEditingItem({ quantity: 0, minThreshold: 5, category: 'General' });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingItem(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-[80vh]">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search parts by name or SKU..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#d4d5da] focus:ring-2 focus:ring-[#1d98d2] focus:border-transparent outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#1d98d2] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#158bbd] transition-colors shadow-sm"
        >
          <PackagePlus size={20} /> Add Item
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <motion.div 
            key={item.id}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-sm border border-[#d4d5da] overflow-hidden flex flex-col group relative"
          >
            {/* Edit Button Overlay */}
            <button 
                onClick={() => {
                    setEditingItem({...item});
                    setIsModalOpen(true);
                }}
                className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow-sm text-gray-600 hover:text-[#1d98d2] opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Edit2 size={16} />
            </button>

            <div className="h-40 bg-gray-100 relative">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              {item.quantity <= item.minThreshold && (
                <div className="absolute top-2 left-2 bg-[#f59e0b] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle size={10} /> LOW STOCK
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-[#2a313d] text-sm mb-1 line-clamp-1" title={item.name}>{item.name}</h3>
              <p className="text-xs text-gray-400 mb-1">{item.sku} • {item.location}</p>
              {item.distributor && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-1" title={item.distributor}>
                  📦 {item.distributor}
                </p>
              )}
              
              <div className="mt-auto space-y-2">
                {item.orderPageUrl && (
                  <a 
                    href={item.orderPageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block text-center text-xs text-[#1d98d2] hover:text-[#158bbd] font-medium underline"
                  >
                    🔗 Order Online
                  </a>
                )}
                <div className="flex items-center justify-between gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPurchaseRequestItem(item);
                    }}
                    className="flex-1 p-2 bg-[#87b21e]/10 text-[#87b21e] rounded-lg hover:bg-[#87b21e] hover:text-white transition-colors text-xs font-medium flex items-center justify-center gap-1"
                    title="Request Purchase Approval"
                  >
                    <ShoppingCart size={14} /> Request
                  </button>
                  <button 
                    onClick={() => {
                        onUpdate({...item, quantity: item.quantity + 1});
                    }}
                    className="p-2 bg-[#1d98d2]/10 text-[#1d98d2] rounded-lg hover:bg-[#1d98d2] hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${item.quantity <= item.minThreshold ? 'text-[#f59e0b]' : 'text-[#87b21e]'}`}>
                    {item.quantity} units
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
             >
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h2 className="text-xl font-bold text-[#2a313d]">{editingItem.id ? 'Edit Item' : 'New Item'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                   <X size={24} />
                 </button>
               </div>
               
               <form onSubmit={handleSaveItem} className="p-6 space-y-6 overflow-y-auto">
                 {/* Image Upload Area */}
                 <div className="flex flex-col items-center">
                    <div 
                      className="w-32 h-32 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative cursor-pointer group hover:border-[#1d98d2] transition-colors"
                      onClick={() => document.getElementById('item-image-upload')?.click()}
                    >
                        {editingItem.imageUrl ? (
                            <img src={editingItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <Camera size={24} className="mb-1" />
                              <span className="text-[10px] uppercase font-bold">Add Photo</span>
                            </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" size={24} />
                        </div>
                    </div>
                    <input 
                        id="item-image-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none"
                            value={editingItem.name || ''}
                            onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                            placeholder="e.g. Air Filter"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none"
                            value={editingItem.sku || ''}
                            onChange={e => setEditingItem({...editingItem, sku: e.target.value})}
                            placeholder="e.g. AF-200"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                        <select 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none bg-white"
                            value={editingItem.category || 'General'}
                            onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                        >
                            <option value="General">General</option>
                            <option value="HVAC">HVAC</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                        <input 
                            type="number" 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none"
                            value={editingItem.quantity || 0}
                            onChange={e => setEditingItem({...editingItem, quantity: parseInt(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Threshold</label>
                        <input 
                            type="number" 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none"
                            value={editingItem.minThreshold || 0}
                            onChange={e => setEditingItem({...editingItem, minThreshold: parseInt(e.target.value)})}
                        />
                    </div>
                     <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none"
                            value={editingItem.location || ''}
                            onChange={e => setEditingItem({...editingItem, location: e.target.value})}
                            placeholder="e.g. Shelf A-1"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Specs</label>
                        <textarea 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none resize-none"
                            value={editingItem.specs || ''}
                            onChange={e => setEditingItem({...editingItem, specs: e.target.value})}
                            placeholder="e.g. 20x25x1 inches, MERV 8 rating"
                            rows={2}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Distributor</label>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none"
                            value={editingItem.distributor || ''}
                            onChange={e => setEditingItem({...editingItem, distributor: e.target.value})}
                            placeholder="e.g. HVAC Supply Co."
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sales Agent Info</label>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none"
                            value={editingItem.salesAgent || ''}
                            onChange={e => setEditingItem({...editingItem, salesAgent: e.target.value})}
                            placeholder="e.g. John Doe - (555) 123-4567"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Order Page URL</label>
                        <input 
                            type="url" 
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#1d98d2] outline-none"
                            value={editingItem.orderPageUrl || ''}
                            onChange={e => setEditingItem({...editingItem, orderPageUrl: e.target.value})}
                            placeholder="e.g. https://supplier.com/product/12345"
                        />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-3">
                   {editingItem.id && (
                       <button 
                         type="button"
                         onClick={() => handleDeleteItem(editingItem.id!)}
                         className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                       >
                         <Trash2 size={20} />
                       </button>
                   )}
                   <button 
                     type="button" 
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     className="flex-[2] py-3 bg-[#1d98d2] text-white rounded-xl font-bold hover:bg-[#158bbd] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1d98d2]/20"
                   >
                     <Save size={20} /> Save Item
                   </button>
                 </div>
               </form>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* QR Scanner FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsScanning(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#2a313d] text-white rounded-full shadow-2xl flex items-center justify-center z-40 border-4 border-white"
      >
        <Scan size={28} />
      </motion.button>

      {/* Scanner Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
          >
            <button 
              onClick={() => setIsScanning(false)}
              className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full backdrop-blur-md"
            >
              <X size={24} />
            </button>
            
            <div className="w-full max-w-sm aspect-square bg-transparent border-2 border-white/30 rounded-3xl relative overflow-hidden">
               <div className="absolute inset-0 border-[3px] border-[#1d98d2] rounded-3xl animate-pulse"></div>
               {/* Simulating camera view */}
               <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                 [Camera View]
               </div>
               <motion.div 
                 className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_red]"
                 animate={{ top: ['0%', '100%', '0%'] }}
                 transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
               />
            </div>
            
            <p className="text-white mt-8 font-medium text-center">
              Align QR code within frame to scan part.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Request Modal */}
      <AnimatePresence>
        {purchaseRequestItem && (
          <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#87b21e] to-[#769c1a] p-6 flex items-center justify-between text-white">
                <h2 className="text-xl font-bold">Request Purchase Approval</h2>
                <button onClick={() => setPurchaseRequestItem(null)} className="text-white/80 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const quantity = parseInt(formData.get('quantity') as string);
                  const estimatedCost = formData.get('estimatedCost') as string;
                  
                  onRequestPurchase({
                    type: 'Purchase',
                    title: `${quantity}x ${purchaseRequestItem.name}`,
                    requester: currentUser?.displayName || currentUser?.email || 'User',
                    amount: estimatedCost,
                    date: new Date().toLocaleDateString(),
                    status: 'Pending',
                  });
                  
                  setPurchaseRequestItem(null);
                  alert('Purchase request submitted for approval!');
                }}
                className="p-6 space-y-4"
              >
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex gap-4">
                    <img src={purchaseRequestItem.imageUrl} alt={purchaseRequestItem.name} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-[#2a313d]">{purchaseRequestItem.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {purchaseRequestItem.sku}</p>
                      <p className="text-xs text-gray-400 mt-1">Current stock: {purchaseRequestItem.quantity} units</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity to Order</label>
                  <input 
                    name="quantity"
                    type="number" 
                    required
                    min="1"
                    defaultValue={Math.max(purchaseRequestItem.minThreshold * 2, 10)}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#87b21e] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estimated Cost</label>
                  <input 
                    name="estimatedCost"
                    type="text" 
                    required
                    placeholder="$0.00"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#87b21e] outline-none"
                  />
                </div>

                {purchaseRequestItem.distributor && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Distributor</p>
                    <p className="text-sm text-gray-700">{purchaseRequestItem.distributor}</p>
                    {purchaseRequestItem.salesAgent && (
                      <p className="text-xs text-gray-500 mt-1">{purchaseRequestItem.salesAgent}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPurchaseRequestItem(null)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-[#87b21e] text-white font-bold hover:bg-[#769c1a] transition-colors shadow-lg"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;