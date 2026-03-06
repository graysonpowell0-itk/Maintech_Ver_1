
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import Inventory from './components/Inventory';
import { InventoryItem, Property, Room, Task, User } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './components/Login';
import { LogOut, ShieldAlert } from 'lucide-react';
import RoomDashboard from './components/RoomDashboard';
import MaintenanceCalendar from './components/MaintenanceCalendar';
import TaskDetail from './components/TaskDetail';
import Approvals from './components/Approvals';
import Schematics from './components/Schematics';
import ReportIssueModal from './components/ReportIssueModal';
import CreatePropertyModal from './components/CreatePropertyModal';
import type { RoomGenerationConfig } from './components/CreatePropertyModal';
import ProfileModal from './components/ProfileModal';
import { LanguageProvider } from './contexts/LanguageContext';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { playNotificationSound } from './utils/notificationSound';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard'); // Track where user came from
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [selectedDateForTask, setSelectedDateForTask] = useState<Date | undefined>(undefined);
  const { 
      tasks, inventory, rooms, schematics,
      properties, currentProperty, allUsers, approvalRequests,
      updateTask, updateInventoryItem, deleteInventoryItem, updateRoom, addTask,
      addProperty, updateProperty, switchProperty, updateUserStatus, bulkUpdateRooms, updateApprovalRequest,
      addApprovalRequest, generateRooms, updateUserProfile, addSchematic, deleteSchematic
  } = useFirestoreSync(user);
  
  useEffect(() => {
    let mounted = true;
    
    // Force sign-out on initial load to ensure the user sees the Login screen
    signOut(auth).catch(err => console.warn("Force sign-out failed", err));

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mounted) return;
      
      if (currentUser) {
        // Ensure user profile exists to prevent permission errors if rules require existing document
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, { 
                email: currentUser.email,
                lastSeen: new Date().toISOString(),
                uid: currentUser.uid // Ensure UID is present
            }, { merge: true });
        } catch (e) {
            console.warn("Failed to ensure profile existence", e);
        }

        setUser(currentUser);

        const userRef = doc(db, 'users', currentUser.uid);
        let hasSetInitialProfile = false;
        
        const unsubProfile = onSnapshot(userRef, (docSnapshot) => {
          // Only update from Firebase if we haven't set an initial profile yet
          // This prevents Firebase listener from overwriting optimistic updates
          if (!hasSetInitialProfile) {
            hasSetInitialProfile = true;
            if (docSnapshot.exists()) {
              const data = docSnapshot.data() as User;
              setUserProfile({
                ...data,
                accountStatus: data.accountStatus || 'active'
              });
            } else {
              // Create mock profile if no profile exists
              setUserProfile({
                id: currentUser.uid,
                uid: currentUser.uid,
                name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                email: currentUser.email || '',
                role: 'Admin',
                avatarUrl: currentUser.photoURL || '',
                status: 'online',
                accountStatus: 'active'
              });
            }
          }
        }, (error) => {
          console.warn("Profile listener warning:", error);
          // Create mock profile when permissions fail (only if not set yet)
          if (!hasSetInitialProfile) {
            hasSetInitialProfile = true;
            setUserProfile({
              id: currentUser.uid,
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              role: 'Admin',
              avatarUrl: currentUser.photoURL || '',
              status: 'online',
              accountStatus: 'active'
            });
          }
        });

        setAuthLoading(false);
        return () => unsubProfile();
      } else {
        setUser(null);
        setUserProfile(null);
        setAuthLoading(false);
      }
    });
    
    return () => {
        mounted = false;
        unsubscribe();
    };
  }, []);

  const handleTaskSelect = (task: Task, returnTab?: string) => {
    setSelectedTask(task);
    setPreviousTab(activeTab); // Store current tab to return to
    setActiveTab('task-detail');
  };

  const handleTaskCompletion = async (task: Task, proofImage: string, repairSummary: string) => {
    if (user) {
        const requesterName = userProfile?.name || user.displayName || user.email?.split('@')[0] || 'User';
        // Create approval request for admin (id will be auto-generated)
        await addApprovalRequest({
          type: 'Repair',
          title: task.title,
          requester: requesterName,
          date: new Date().toISOString(),
          status: 'Pending',
          taskId: task.id,
          repairSummary,
          completionProofUrl: proofImage
        });
        
        // Update task with completion info (but keep status as In Progress)
        await updateTask({
            ...task,
            completionProofUrl: proofImage,
            repairSummary
        });
    }
    setSelectedTask(null);
    setActiveTab('dashboard');
  };

  const handleNewIssue = async (task: Task) => {
      if(user) {
          // Add propertyId to the task if current property exists
          const taskWithProperty = {
            ...task,
            propertyId: currentProperty?.id
          };
          await addTask(taskWithProperty);
          // Play notification sound for maintenance staff
          playNotificationSound();
      }
  };
  
  const handleScheduleTask = (date: Date) => {
      setSelectedDateForTask(date);
      setIsReportModalOpen(true);
  };

  const handleSaveProperty = async (property: Property, roomConfig?: RoomGenerationConfig) => {
      try {
          if (propertyToEdit) {
              await updateProperty(property);
          } else {
              await addProperty(property);
              if (roomConfig) {
                  await generateRooms(property.id, roomConfig);
              }
          }
          setIsPropertyModalOpen(false);
          setPropertyToEdit(null);
      } catch (error) {
          console.error('Error saving property:', error);
          // Modal still closes - the optimistic update already happened
          setIsPropertyModalOpen(false);
          setPropertyToEdit(null);
      }
  };

  const handleEditProperty = (property: Property) => {
      setPropertyToEdit(property);
      setIsPropertyModalOpen(true);
  };

  const pendingUsers = allUsers.filter(u => u.accountStatus === 'pending');

  if (authLoading) {
    return <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1d98d2] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <Login />;
  }

  // --- Block Access for Pending Users ---
  if (userProfile && userProfile.accountStatus === 'pending') {
    return (
      <div className="min-h-screen bg-[#2a313d] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#2a313d] mb-2">Account Pending Approval</h1>
          <p className="text-gray-500 mb-8">
            Your account has been created successfully but is currently waiting for administrator approval.
            You will gain access once verified.
          </p>
          <div className="p-4 bg-gray-50 rounded-xl mb-6 text-sm text-left">
            <p className="font-bold text-gray-700 mb-1">Details Submitted:</p>
            <p className="text-gray-500">Name: <span className="text-[#2a313d] font-medium">{userProfile.name}</span></p>
            <p className="text-gray-500">Role: <span className="text-[#2a313d] font-medium">{userProfile.role}</span></p>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </motion.div>
      </div>
    );
  }

  if (userProfile && userProfile.accountStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-[#2a313d] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#2a313d] mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-8">Your request for access has been declined by an administrator.</p>
          <button 
            onClick={() => signOut(auth)}
            className="w-full py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tasks={tasks} inventory={inventory} onChangeTab={setActiveTab} />;
      
      case 'rooms':
        const currentPropertyRooms = currentProperty 
          ? rooms.filter(r => r.propertyId === currentProperty.id)
          : rooms;
        return (
          <RoomDashboard 
            rooms={currentPropertyRooms} 
            tasks={tasks} 
            onUpdateRoom={updateRoom} 
            bulkUpdateRooms={bulkUpdateRooms}
            onSelectTask={handleTaskSelect} 
          />
        );
      
      case 'calendar':
        return (
          <MaintenanceCalendar 
            tasks={tasks} 
            onSelectTask={handleTaskSelect} 
            onScheduleTask={handleScheduleTask} 
          />
        );
      
      case 'tasks':
        return <TaskList tasks={tasks} onSelectTask={handleTaskSelect} />;
      
      case 'task-detail':
        if (!selectedTask) return <TaskList tasks={tasks} onSelectTask={handleTaskSelect} />;
        return (
          <TaskDetail 
            task={selectedTask} 
            onBack={() => {
              setSelectedTask(null);
              setActiveTab(previousTab); // Return to the tab they came from
            }}
            onComplete={(proofImage, repairSummary) => handleTaskCompletion(selectedTask, proofImage, repairSummary)}
          />
        );
      
      case 'inventory':
        return (
          <Inventory 
            items={inventory} 
            onUpdate={updateInventoryItem} 
            onDelete={deleteInventoryItem}
            onRequestPurchase={addApprovalRequest}
            currentUser={user}
            currentPropertyId={currentProperty?.id}
          />
        );
      
      case 'approvals':
        return (
          <Approvals 
            pendingUsers={pendingUsers} 
            onApproveUser={(uid) => updateUserStatus(uid, 'active')} 
            onRejectUser={(uid) => updateUserStatus(uid, 'rejected')} 
            approvalRequests={approvalRequests}
            onApproveRequest={(id) => {
              const request = approvalRequests.find(r => r.id === id);
              updateApprovalRequest(id, 'Approved');
              
              // If it's a repair approval, mark the task as completed
              if (request?.type === 'Repair' && request.taskId) {
                const task = tasks.find(t => t.id === request.taskId);
                if (task) {
                  updateTask({
                    ...task,
                    status: 'Completed' as any
                  });
                }
              }
            }}
            onRejectRequest={(id) => updateApprovalRequest(id, 'Rejected')}
          />
        );
      
      case 'schematics':
        return (
          <Schematics
            schematics={schematics}
            onUpload={addSchematic}
            onDelete={deleteSchematic}
            currentUserName={userProfile?.name || user?.displayName || 'User'}
          />
        );
      
      default:
        return <Dashboard tasks={tasks} inventory={inventory} onChangeTab={setActiveTab} />;
    }
  };

  return (
    <>
      <Layout 
        activeTab={activeTab === 'task-detail' ? 'tasks' : activeTab} 
        onTabChange={setActiveTab}
        user={userProfile}
        onReportIssue={() => setIsReportModalOpen(true)}
        properties={properties}
        currentProperty={currentProperty}
        onSwitchProperty={switchProperty}
        onAddProperty={() => setIsPropertyModalOpen(true)}
        onEditProperty={handleEditProperty}
        pendingUserCount={pendingUsers.length}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      >
        {renderContent()}
      </Layout>

      <AnimatePresence>
        {isReportModalOpen && (
            <ReportIssueModal 
                onClose={() => {
                    setIsReportModalOpen(false);
                    setSelectedDateForTask(undefined);
                }}
                onSave={handleNewIssue}
                initialDate={selectedDateForTask}
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPropertyModalOpen && (
            <CreatePropertyModal 
                onClose={() => {
                    setIsPropertyModalOpen(false);
                    setPropertyToEdit(null);
                }}
                onSave={handleSaveProperty}
                initialData={propertyToEdit}
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileModalOpen && userProfile && (
            <ProfileModal 
                user={userProfile}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={async (data) => {
                  // Update local userProfile state immediately
                  setUserProfile(prev => prev ? { ...prev, ...data } : prev);
                  // Try to update in Firebase
                  await updateUserProfile(user.uid, data);
                }}
            />
        )}
      </AnimatePresence>
    </>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
