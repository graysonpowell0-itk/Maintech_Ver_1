
import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../firebase';
import { Lock, Mail, AlertCircle, User as UserIcon, Globe, ChevronDown, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Login: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Maintenance' | 'Admin' | 'Other Staff'>('Maintenance');
  const [selectedProperty, setSelectedProperty] = useState('Maintech Hotel HQ (Demo)');
  const [customPropertyName, setCustomPropertyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const mockProperties = [
      'Maintech Hotel HQ (Demo)',
      'Grand Plaza Downtown',
      'Seaside Resort & Spa',
      'Mountain View Lodge',
      'Create New Property...'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
          if (name) {
            await updateProfile(user, { displayName: name });
          }

          // Race Condition: Try to create profile in Firestore with a timeout
          // If Firestore permissions block writing or network is slow, we continue anyway
          try {
              const createProfilePromise = (async () => {
                  await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    id: user.uid,
                    email: user.email,
                    name: name,
                    displayName: name,
                    role: role,
                    language: language,
                    photoURL: avatarUrl || user.photoURL || '',
                    status: 'online',
                    accountStatus: 'pending',
                    lastSeen: new Date().toISOString()
                  }, { merge: true });

                  const isCustom = selectedProperty === 'Create New Property...';
                  const propName = isCustom ? customPropertyName : selectedProperty;
                  if (propName) {
                      const initialProperty = {
                        id: 'prop_init',
                        name: propName,
                        address: isCustom ? 'Address TBD' : '123 Main St, Metro City',
                        type: 'Hotel',
                        imageUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
                        roomCount: 50,
                        floorCount: 3,
                        amenities: ['Lobby', 'Staff Room']
                      };
                      await setDoc(doc(db, 'users', user.uid, 'properties', 'prop_init'), initialProperty);
                  }
              })();

              // Timeout after 3 seconds
              const timeoutPromise = new Promise((_, reject) => 
                 setTimeout(() => reject(new Error("Profile creation timeout")), 3000)
              );

              await Promise.race([createProfilePromise, timeoutPromise]);
              
          } catch (fsError) {
              console.warn("Firestore profile creation failed or timed out. Continuing in demo mode.", fsError);
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError("Invalid email or password");
      } else {
        setError("Authentication failed. Please check your credentials.");
      }
    } finally {
      // Ensure loading state is turned off
      if (isSignUp || !auth.currentUser) {
         setLoading(false);
      }
      // Note: If signIn successful, onAuthStateChanged in App.tsx will handle navigation
      // We keep loading true briefly if successful sign-in to avoid flicker
    }
  };

  const roles = [
      { id: 'Admin', label: t.roleAdmin },
      { id: 'Maintenance', label: t.roleMaintenance },
      { id: 'Other Staff', label: t.roleStaff }
  ];

  return (
    <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center p-4 relative">
      <div className="absolute top-6 right-6 z-20" ref={langMenuRef}>
        <div className="relative">
            <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg text-white border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
            >
                <Globe size={16} />
                <span className="text-sm font-medium">{language}</span>
                <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isLangMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30"
                    >
                        {(['English', 'Spanish', 'Hindi'] as Language[]).map(lang => (
                            <button
                                key={lang}
                                onClick={() => {
                                    setLanguage(lang);
                                    setIsLangMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                    language === lang ? 'font-bold text-[#1d98d2]' : 'text-gray-600'
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Dark header with logo */}
        <div className="bg-[#2a313d] px-8 py-10 flex flex-col items-center">
          <img 
            src="/maintech_logo.png" 
            alt="Maintech Logo" 
            className="w-48 h-48 object-contain"
          />
        </div>
        
        {/* Form content */}
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-bold text-[#2a313d]">{isSignUp ? t.createAccount : t.welcomeBack}</h1>
            <p className="text-gray-500 text-sm">{isSignUp ? t.signUpFor : t.signInTo}</p>
          </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div className="flex flex-col items-center mb-4">
                 <div 
                    className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#1d98d2] transition-colors group"
                    onClick={() => fileInputRef.current?.click()}
                 >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <UserIcon size={24} />
                            <span className="text-[10px] uppercase font-bold mt-1">Photo</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UserIcon className="text-white" size={20} />
                    </div>
                 </div>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                 />
                 <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-[#1d98d2] font-bold mt-2 hover:underline">
                    {avatarUrl ? 'Change Photo' : 'Add Profile Photo'}
                 </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.fullName}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] focus:ring-2 focus:ring-[#1d98d2]/20 outline-none transition-all bg-white text-[#2a313d]"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.role}</label>
                <div className="grid grid-cols-3 gap-2">
                    {roles.map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id as any)}
                            className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                                role === r.id
                                ? 'bg-[#1d98d2] text-white border-[#1d98d2] shadow-md shadow-[#1d98d2]/20'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Property / Workplace</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 text-gray-400" size={18} />
                  <select 
                     className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none bg-white text-[#2a313d] appearance-none"
                     value={selectedProperty}
                     onChange={(e) => setSelectedProperty(e.target.value)}
                  >
                     {mockProperties.map(p => (
                         <option key={p} value={p}>{p}</option>
                     ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                
                <AnimatePresence>
                    {selectedProperty === 'Create New Property...' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2"
                        >
                            <input 
                                type="text"
                                placeholder="Enter New Property Name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] outline-none bg-white text-[#2a313d]"
                                value={customPropertyName}
                                onChange={(e) => setCustomPropertyName(e.target.value)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] focus:ring-2 focus:ring-[#1d98d2]/20 outline-none transition-all bg-white text-[#2a313d]"
                placeholder="tech@maintech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1d98d2] focus:ring-2 focus:ring-[#1d98d2]/20 outline-none transition-all bg-white text-[#2a313d]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1d98d2] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#158bbd] transition-colors shadow-lg shadow-[#1d98d2]/20 disabled:opacity-50"
          >
            {loading ? t.processing : (isSignUp ? t.createAccount : t.signIn)}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}{' '}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-[#1d98d2] font-bold hover:underline"
            >
              {isSignUp ? t.signIn : t.signUp}
            </button>
          </p>
        </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
