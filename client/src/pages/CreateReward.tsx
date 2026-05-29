// File: CreateReward.tsx
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rewardApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiEdit3, FiRefreshCw, FiCheck, FiAlertCircle,
  FiLoader, FiPlus, FiImage, FiCalendar, FiTag, FiCopy, 
  FiShoppingBag, FiUploadCloud, FiTrash2, FiFileText
} from 'react-icons/fi';

// Types
interface ParsedCoupon {
  id: string | number;
  file?: File;
  image?: string;
  name?: string;
  description?: string;
  code?: string;
  ['cupon-code']?: string;
  expiry_date?: string;
  category?: string;
  image_url?: string;
  points?: number;
  status: 'parsing' | 'parsed' | 'failed' | 'creating' | 'created';
  ocr_text?: string;
}

interface Category {
  _id: string;
  name: string;
  icon: string;
}

const categoriesList: Category[] = [
  { _id: '507f1f77bcf86cd799439011', name: 'Gaming', icon: '🎮' },
  { _id: '507f1f77bcf86cd799439012', name: 'Shopping', icon: '🛍️' },
  { _id: '507f1f77bcf86cd799439013', name: 'Entertainment', icon: '🎬' },
  { _id: '507f1f77bcf86cd799439014', name: 'Food & Drinks', icon: '🍽️' },
  { _id: '507f1f77bcf86cd799439015', name: 'Travel', icon: '✈️' },
];

const parseJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting from markdown-like ```json block
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    throw new Error('Invalid JSON');
  }
};

const CreateReward = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedResults, setParsedResults] = useState<ParsedCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: File[]) => {
    const newItems: ParsedCoupon[] = files.map(file => ({
      file,
      id: Date.now() + Math.random(),
      status: 'parsing'
    }));

    setParsedResults(prev => [...prev, ...newItems]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const itemId = newItems[i].id;

      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = reader.result;
            const res = await fetch('https://dark-lord-chamber-production.up.railway.app/api/process-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image_data: base64 }),
            });
            const data = await res.json();

            if (data.success) {
              const parsedJson = parseJSON(data.ai_response);
              setParsedResults(prev =>
                prev.map(item =>
                  item.id === itemId
                    ? { 
                        ...parsedJson, 
                        id: itemId, 
                        image: data.image_url,
                        image_url: data.image_url,
                        ocr_text: data.ocr_text,
                        status: 'parsed' 
                      }
                    : item
                )
              );
            } else {
              throw new Error(data.error || 'Parsing failed');
            }
          } catch {
            setParsedResults(prev =>
              prev.map(item =>
                item.id === itemId ? { ...item, status: 'failed' } : item
              )
            );
            toast.error('AI parsing error on coupon');
          }
        };
        reader.readAsDataURL(file);
      } catch {
        toast.error('File reading error');
        setParsedResults(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, status: 'failed' } : item
          )
        );
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) {
      await processFiles(files);
    }
  };

  const createSingleReward = async (data: ParsedCoupon, index: number) => {
    try {
      setParsedResults(prev =>
        prev.map((item, i) => i === index ? { ...item, status: 'creating' } : item)
      );

      const categoryMatch = categoriesList.find(cat =>
        data.category?.toLowerCase().includes(cat.name.toLowerCase())
      );

      const payload = {
        title: data.name || 'Unnamed Coupon',
        description: data.description || 'No description provided',
        points: data.points || 10,
        code: data['cupon-code'] || data.code || 'NOCODE',
        expiryDate: data.expiry_date ? new Date(data.expiry_date).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: categoryMatch?._id || categoriesList[1]._id, // Default to Shopping
        imageUrls: [data.image_url || data.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop'],
        ocrText: data.ocr_text,
      };

      await rewardApi.create(payload);
      toast.success(`"${payload.title}" created successfully!`);

      setParsedResults(prev =>
        prev.map((item, i) => i === index ? { ...item, status: 'created' } : item)
      );
    } catch (error) {
      console.error('Error creating reward:', error);
      toast.error('Failed to create reward');
      setParsedResults(prev =>
        prev.map((item, i) => i === index ? { ...item, status: 'parsed' } : item)
      );
    }
  };

  const handleRetry = async (index: number) => {
    const item = parsedResults[index];
    if (!item.file) return;

    setParsedResults(prev =>
      prev.map((item, i) => i === index ? { ...item, status: 'parsing' } : item)
    );

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result;
          const res = await fetch('https://dark-lord-chamber-production.up.railway.app/api/process-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_data: base64 }),
          });
          const data = await res.json();

          if (data.success) {
            const parsedJson = parseJSON(data.ai_response);
            setParsedResults(prev =>
              prev.map((item, i) =>
                i === index
                  ? { 
                      ...parsedJson, 
                      id: item.id, 
                      image: data.image_url,
                      image_url: data.image_url,
                      ocr_text: data.ocr_text,
                      status: 'parsed' 
                    }
                  : item
              )
            );
          } else {
            throw new Error(data.error || 'Parsing failed');
          }
        } catch {
          setParsedResults(prev =>
            prev.map((item, i) => i === index ? { ...item, status: 'failed' } : item)
          );
          toast.error('Retry parsing failed');
        }
      };
      reader.readAsDataURL(item.file);
    } catch {
      toast.error('File reading error during retry');
      setParsedResults(prev =>
        prev.map((item, i) => i === index ? { ...item, status: 'failed' } : item)
      );
    }
  };

  const handleRemove = (index: number) => {
    setParsedResults(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number, field: string, value: any) => {
    setParsedResults(prev =>
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const handleCreateAll = async () => {
    setLoading(true);
    
    for (const [i, item] of parsedResults.entries()) {
      if (item.status === 'parsed') {
        await createSingleReward(item, i);
        await new Promise(res => setTimeout(res, 300));
      }
    }
    setLoading(false);
    navigate('/my-rewards');
    toast.success('Batch processing completed!');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Voucher code copied!');
  };

  const hasParsedCoupons = parsedResults.some(p => p.status === 'parsed');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/20 text-slate-800 dark:text-slate-100 flex flex-col"
    >
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/75 dark:bg-slate-900/75 border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent tracking-tight">
            AI Coupon Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">
            Instantly extract voucher details using intelligent OCR
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {parsedResults.length > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                {parsedResults.filter(p => p.status === 'created').length}/{parsedResults.length} Created
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-98 transition-all"
          >
            <FiPlus className="w-4 h-4 stroke-[3px]" />
            Upload Coupons
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start">
        {parsedResults.length === 0 ? (
          /* Sleek Dropzone Upload target */
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] py-10">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`max-w-2xl w-full p-12 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all duration-300 relative group flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20 shadow-xl scale-102'
                  : 'border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-slate-100/30 dark:hover:bg-slate-900/60 shadow-sm'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />

              <motion.div 
                animate={isDragging ? { y: [0, -10, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-950/40 dark:to-blue-950/40 p-6 rounded-2xl mb-4 group-hover:scale-110 transition-all border border-cyan-500/20"
              >
                <FiUploadCloud className="w-12 h-12 text-cyan-600 dark:text-cyan-400 stroke-[1.5px]" />
              </motion.div>

              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2">
                Drag & Drop Coupon Images
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-4">
                Or <span className="text-cyan-600 dark:text-cyan-400 font-bold underline group-hover:text-cyan-500">browse file directory</span> to upload receipts, emails, or digital coupon screenshots
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-150/40 dark:bg-slate-900/50 px-4 py-2 rounded-full border border-slate-200/20">
                <FiImage /> PNG, JPG, WEBP formats supported
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top batch actions bar */}
            {hasParsedCoupons && (
              <div className="flex justify-between items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Ready to deploy: <span className="text-emerald-600 dark:text-emerald-400">{parsedResults.filter(p => p.status === 'parsed').length} coupons parsed</span>
                </div>
                <button
                  disabled={loading}
                  onClick={handleCreateAll}
                  className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all flex items-center gap-2 ${
                    loading
                      ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md shadow-emerald-500/10 active:scale-98'
                  }`}
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Creating All...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4 stroke-[3px]" />
                      Deploy All Rewards
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Coupons Card Grid */}
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {parsedResults.map((item, index) => (
                  <CouponCard
                    key={item.id}
                    item={item}
                    index={index}
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                    onRetry={handleRetry}
                    onCreate={createSingleReward}
                    onCopyCode={copyCode}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* CouponCard Component */
const CouponCard = ({
  item,
  index,
  onEdit,
  onRemove,
  onRetry,
  onCreate,
  onCopyCode
}: {
  item: ParsedCoupon;
  index: number;
  onEdit: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  onRetry: (index: number) => void;
  onCreate: (item: ParsedCoupon, index: number) => void;
  onCopyCode: (code: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name || '',
    description: item.description || '',
    code: item['cupon-code'] || item.code || '',
    expiry_date: item.expiry_date || '',
    points: item.points || 10,
    category: item.category || 'Shopping'
  });

  const handleSaveEdit = () => {
    onEdit(index, 'name', editData.name);
    onEdit(index, 'description', editData.description);
    onEdit(index, 'code', editData.code);
    onEdit(index, 'expiry_date', editData.expiry_date);
    onEdit(index, 'points', editData.points);
    onEdit(index, 'category', editData.category);
    setIsEditing(false);
    toast.success('Updated locally');
  };

  const getStatusStyle = (status: ParsedCoupon['status']) => {
    switch (status) {
      case 'parsing': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
      case 'parsed': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400';
      case 'failed': return 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400';
      case 'creating': return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
      case 'created': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: ParsedCoupon['status']) => {
    switch (status) {
      case 'parsing': return <FiLoader className="w-3.5 h-3.5 animate-spin" />;
      case 'parsed': return <FiCheck className="w-3.5 h-3.5" />;
      case 'failed': return <FiAlertCircle className="w-3.5 h-3.5" />;
      case 'creating': return <FiLoader className="w-3.5 h-3.5 animate-spin" />;
      case 'created': return <FiCheck className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl border border-slate-200/50 dark:border-slate-800/60 overflow-hidden flex flex-col h-[420px]"
    >
      {/* Card Cover Picture */}
      <div className="relative h-[120px] bg-slate-100 dark:bg-slate-950 overflow-hidden flex-shrink-0 border-b border-slate-200/30 dark:border-slate-850">
        {(item.image_url || item.image) ? (
          <img
            src={item.image_url || item.image}
            alt="Coupon Scanned source"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <FiImage className="w-8 h-8 mb-1" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Scanned Coupon</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
        
        {/* Absolute indicators */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border backdrop-blur-sm ${getStatusStyle(item.status)}`}>
            {getStatusIcon(item.status)}
            {item.status}
          </span>
          <span className="text-[10px] text-white/90 font-mono tracking-wider font-semibold">
            ID: #{String(item.id).slice(-4)}
          </span>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
        
        {isEditing ? (
          <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Coupon Title</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500/20 h-14 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Voucher Code</label>
                <input
                  type="text"
                  value={editData.code}
                  onChange={(e) => setEditData({...editData, code: e.target.value})}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white font-mono focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Points Reward</label>
                <input
                  type="number"
                  value={editData.points}
                  onChange={(e) => setEditData({...editData, points: parseInt(e.target.value) || 10})}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Expiry Date</label>
                <input
                  type="date"
                  value={editData.expiry_date}
                  onChange={(e) => setEditData({...editData, expiry_date: e.target.value})}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Category</label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({...editData, category: e.target.value})}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="Shopping">🛍️ Shopping</option>
                  <option value="Gaming">🎮 Gaming</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                  <option value="Food & Drinks">🍽️ Food</option>
                  <option value="Travel">✈️ Travel</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-start overflow-hidden space-y-3">
            <div>
              <div className="flex justify-between items-start gap-1">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white line-clamp-1 flex-1 leading-tight">
                  {item.name || 'AI Parsing Coupon...'}
                </h3>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.status === 'parsed' && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition"
                      title="Edit extracted metadata"
                    >
                      <FiEdit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.status === 'failed' && (
                    <button
                      onClick={() => onRetry(index)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition"
                      title="Retry OCR"
                    >
                      <FiRefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onRemove(index)}
                    className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg transition"
                    title="Delete item"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-450 line-clamp-2 mt-1">
                {item.description || 'Metadata analysis in progress. AI is reviewing the item layout for coupons parameters.'}
              </p>
            </div>

            {/* Code indicator card */}
            {(item['cupon-code'] || item.code) && (
              <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-2.5 rounded-xl">
                <div className="flex items-center gap-2 min-w-0">
                  <FiTag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <code className="text-xs font-mono font-bold text-slate-700 dark:text-slate-350 truncate">
                    {item['cupon-code'] || item.code}
                  </code>
                </div>
                <button
                  onClick={() => onCopyCode(item['cupon-code'] || item.code || '')}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg transition flex-shrink-0"
                >
                  <FiCopy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Metadata Fields Checklist */}
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-3.5 h-3.5 text-cyan-500" />
                <span>
                  Expires: <span className="font-semibold text-slate-700 dark:text-slate-200">{item.expiry_date || 'None'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  Swapping cost: <span className="font-extrabold text-slate-800 dark:text-white">{item.points || 10} Points</span>
                </span>
              </div>
              {item.category && (
                <div className="flex items-center gap-2">
                  <FiFileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Category: <span className="font-semibold text-slate-700 dark:text-slate-200">{item.category}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card action footer */}
        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 py-2.5 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
              >
                Save Edits
              </button>
            </>
          ) : (
            item.status === 'parsed' && (
              <button
                onClick={() => onCreate(item, index)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-750 hover:to-blue-750 text-white py-3 rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg shadow-cyan-500/5 active:scale-98 flex items-center justify-center gap-1.5"
              >
                <FiCheck className="w-4 h-4 stroke-[3px]" />
                Deploy Coupon Listing
              </button>
            )
          )}
          {item.status === 'creating' && (
            <button
              disabled
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200/30"
            >
              <FiLoader className="w-4 h-4 animate-spin text-cyan-500" />
              Syncing to Server Ledger...
            </button>
          )}
          {item.status === 'created' && (
            <div className="w-full bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 py-3 rounded-xl text-xs font-bold border border-emerald-500/20 dark:border-emerald-900/30 flex items-center justify-center gap-1.5">
              <FiCheck className="w-4 h-4 stroke-[3px]" />
              Listed & Active!
            </div>
          )}
          {item.status === 'parsing' && (
            <div className="w-full bg-slate-550/10 text-slate-500 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
              <FiLoader className="w-4 h-4 animate-spin text-amber-500" />
              AI Analyzing Image...
            </div>
          )}
          {item.status === 'failed' && (
            <button
              onClick={() => onRetry(index)}
              className="w-full bg-rose-500/10 text-rose-600 dark:text-rose-400 py-3 rounded-xl text-xs font-bold hover:bg-rose-500/15 border border-rose-500/25 transition flex items-center justify-center gap-1.5"
            >
              <FiRefreshCw className="w-4 h-4" />
              OCR Parsing Failed - Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CreateReward;