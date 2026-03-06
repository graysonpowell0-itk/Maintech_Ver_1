
import React, { useState, useRef, useEffect } from 'react';
import { Menu, Home, ClipboardList, Package, CheckCircle, Bell, User, LogOut, BedDouble, PlusCircle, Calendar, ChevronDown, Plus, Building, X, Globe, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_USER, COLORS, MOCK_NOTIFICATIONS } from '../constants';
import { Property, Notification } from '../types';
import MaintenanceAssistant from './MaintenanceAssistant';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
  onReportIssue: () => void;
  properties: Property[];
  currentProperty: Property | null;
  onSwitchProperty: (id: string) => void;
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  pendingUserCount?: number;
  onOpenProfile: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
    children, activeTab, onTabChange, user, onReportIssue,
    properties, currentProperty, onSwitchProperty, onAddProperty, onEditProperty,
    pendingUserCount = 0, onOpenProfile
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);

  const propertyMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'calendar', label: t.schedule, icon: Calendar },
    { id: 'rooms', label: t.rooms, icon: BedDouble },
    { id: 'tasks', label: t.tasks, icon: ClipboardList },
    { id: 'inventory', label: t.inventory, icon: Package },
    { id: 'schematics', label: 'Schematics', icon: Building },
    { id: 'approvals', label: t.approvals, icon: CheckCircle },
  ];

  const displayName = user?.name || MOCK_USER.name;
  const firstName = displayName.split(' ')[0];
  const photoURL = user?.avatarUrl || MOCK_USER.avatarUrl;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (propertyMenuRef.current && !propertyMenuRef.current.contains(event.target as Node)) {
        setIsPropertyMenuOpen(false);
      }
      if (
          notificationRef.current && !notificationRef.current.contains(event.target as Node) &&
          mobileNotificationRef.current && !mobileNotificationRef.current.contains(event.target as Node)
        ) {
        setIsNotificationsOpen(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
          setIsLanguageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  const NotificationDropdown = () => (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
    >
      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-[#2a313d]">Notifications</h3>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="text-xs text-[#1d98d2] font-medium hover:underline">Mark all read</button>
        )}
      </div>
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
            <Bell size={24} className="opacity-20" />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 relative group">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                n.type === 'alert' ? 'bg-red-500' : 
                n.type === 'success' ? 'bg-[#87b21e]' : 'bg-blue-400'
              }`}></div>
              <div className="flex-1 pr-4">
                <p className="text-sm text-[#2a313d] font-medium leading-tight mb-1">{n.message}</p>
                <p className="text-xs text-gray-400">{n.time}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }}
                className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfdfd] text-[#2a313d] overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#2a313d] text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <img 
            src="/maintech_logo.png" 
            alt="Maintech" 
            className="h-8 object-contain"
          />
        </div>
        <div className="flex items-center gap-3">
             <button 
                onClick={onReportIssue}
                className="bg-[#1d98d2] p-2 rounded-full text-white shadow-md active:scale-95 transition-transform"
             >
                 <PlusCircle size={20} />
             </button>
             
            {/* Mobile Notification Bell */}
            <div className="relative" ref={mobileNotificationRef}>
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-1">
                    <Bell size={20} />
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#87b21e] rounded-full border-2 border-[#2a313d]"></span>
                    )}
                </button>
                <AnimatePresence>
                  {isNotificationsOpen && <NotificationDropdown />}
                </AnimatePresence>
            </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.nav
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 md:relative z-[60] h-full w-64 bg-[#2a313d] text-white flex flex-col justify-between shadow-xl md:translate-x-0 ${
              !isSidebarOpen && 'hidden md:flex'
            }`}
          >
            <div>
              {/* Mobile Close Button */}
              <div className="flex md:hidden justify-end p-4 pb-0">
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white">
                      <X size={24} />
                  </button>
              </div>

              {/* Logo for Desktop Sidebar */}
              <div className="hidden md:flex justify-center p-6 pb-4">
                  <img 
                    src="/maintech_logo.png" 
                    alt="Maintech" 
                    className="h-10 object-contain"
                  />
              </div>

              <div className="p-6 border-b border-gray-700/50">
                 {/* Property Switcher */}
                 <div className="relative" ref={propertyMenuRef}>
                    <button 
                        onClick={() => setIsPropertyMenuOpen(!isPropertyMenuOpen)}
                        className="w-full flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-[#1d98d2] flex-shrink-0 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                                {currentProperty?.imageUrl ? (
                                    <img src={currentProperty.imageUrl} className="w-full h-full object-cover" alt="Prop" />
                                ) : (
                                    <Building size={16} />
                                )}
                            </div>
                            <div className="text-left min-w-0">
                                <h1 className="text-sm font-bold tracking-tight truncate w-32">{currentProperty?.name || 'Loading...'}</h1>
                                <p className="text-[10px] text-gray-400 truncate">Tap to switch</p>
                            </div>
                        </div>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isPropertyMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isPropertyMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 w-full mt-2 bg-[#232933] border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                            >
                                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                    {properties.map(prop => (
                                        <button 
                                            key={prop.id}
                                            onClick={() => {
                                                onSwitchProperty(prop.id);
                                                setIsPropertyMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 text-sm hover:bg-white/5 transition-colors text-left ${
                                                currentProperty?.id === prop.id ? 'bg-white/10 text-white' : 'text-gray-400'
                                            }`}
                                        >
                                            <div className="w-6 h-6 rounded bg-gray-700 flex-shrink-0 overflow-hidden">
                                                 <img src={prop.imageUrl} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className="truncate">{prop.name}</span>
                                            {currentProperty?.id === prop.id && <CheckCircle size={14} className="ml-auto text-[#87b21e]" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 border-t border-gray-700">
                                    <button 
                                        onClick={() => {
                                            onAddProperty();
                                            setIsPropertyMenuOpen(false);
                                        }}
                                        className="w-full p-3 text-xs font-bold text-[#1d98d2] hover:bg-[#1d98d2]/10 flex items-center justify-center gap-2 transition-colors border-b border-gray-700"
                                    >
                                        <Plus size={14} /> Add New Property
                                    </button>
                                    {currentProperty && (
                                        <button 
                                            onClick={() => {
                                                onEditProperty(currentProperty);
                                                setIsPropertyMenuOpen(false);
                                            }}
                                            className="w-full p-3 text-xs font-bold text-gray-400 hover:bg-gray-700 hover:text-white flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Settings size={14} /> Property Settings
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </div>
              </div>

              <div className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                        isActive
                          ? 'bg-[#1d98d2] text-white shadow-lg shadow-[#1d98d2]/30'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                      {item.id === 'approvals' && pendingUserCount > 0 && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#ef4444] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                              {pendingUserCount}
                          </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700/50">
              {/* Language Selector in Sidebar (Visible on all devices when sidebar is open) */}
              <div className="mb-4 md:hidden">
                  <button 
                    onClick={() => setIsMobileLangOpen(!isMobileLangOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 bg-white/5 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors"
                  >
                     <div className="flex items-center gap-2">
                        <Globe size={16} />
                        {language}
                     </div>
                     <ChevronDown size={14} className={`transition-transform ${isMobileLangOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                      {isMobileLangOpen && (
                          <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-2 space-y-1"
                          >
                              {(['English', 'Spanish', 'Hindi'] as Language[]).map(lang => (
                                  <button
                                      key={lang}
                                      onClick={() => {
                                          setLanguage(lang);
                                          setIsMobileLangOpen(false);
                                      }}
                                      className={`w-full text-left px-8 py-2 text-xs rounded-lg transition-colors ${
                                          language === lang ? 'text-[#1d98d2] font-bold bg-white/5' : 'text-gray-500 hover:text-white'
                                      }`}
                                  >
                                      {lang}
                                  </button>
                              ))}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm">
                <button onClick={onOpenProfile} className="flex items-center gap-3 flex-1 text-left group">
                    <img
                    src={photoURL}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-[#87b21e] object-cover group-hover:border-white transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-[#1d98d2] transition-colors">{displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{t.technician}</p>
                    </div>
                </button>
                <button onClick={() => signOut(auth)} title="Sign Out">
                    <LogOut size={18} className="text-gray-400 hover:text-white cursor-pointer" />
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative no-scrollbar bg-[#fdfdfd]">
         {/* Desktop Header */}
         <header className="hidden md:flex items-center justify-between px-8 py-5 bg-[#fdfdfd] sticky top-0 z-20">
            <h2 className="text-2xl font-bold text-[#2a313d] capitalize">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-6">
              
              <button 
                onClick={onReportIssue}
                className="bg-[#ef4444] hover:bg-[#d93a3a] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                <PlusCircle size={18} /> {t.reportIssue}
              </button>

              <div className="h-8 w-[1px] bg-[#d4d5da]"></div>

              {/* Desktop Language Selector */}
              <div className="relative" ref={languageMenuRef}>
                 <button 
                   onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                 >
                    <Globe size={18} />
                    {language}
                    <ChevronDown size={14} className={`transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <AnimatePresence>
                     {isLanguageMenuOpen && (
                         <motion.div
                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                             className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                         >
                             {(['English', 'Spanish', 'Hindi'] as Language[]).map(lang => (
                                 <button
                                     key={lang}
                                     onClick={() => {
                                         setLanguage(lang);
                                         setIsLanguageMenuOpen(false);
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

              <div className="h-8 w-[1px] bg-[#d4d5da]"></div>

              {/* Desktop Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <Bell size={22} className="text-[#2a313d]" />
                    {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#87b21e] rounded-full border-2 border-white"></span>
                    )}
                </button>
                <AnimatePresence>
                  {isNotificationsOpen && <NotificationDropdown />}
                </AnimatePresence>
              </div>

              <div className="h-8 w-[1px] bg-[#d4d5da]"></div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-bold text-[#2a313d]">{firstName}</p>
                    <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md cursor-pointer hover:ring-2 hover:ring-[#1d98d2] transition-all">
                    <img src={photoURL} alt={firstName} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
         </header>

         <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
            {children}
         </div>
      </main>

      {/* AI Maintenance Assistant */}
      <MaintenanceAssistant />
    </div>
  );
};

export default Layout;
