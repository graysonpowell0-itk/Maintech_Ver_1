
import { useState, useEffect } from 'react';
import { 
  collection, 
  collectionGroup,
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Task, InventoryItem, Room, Property, User, ApprovalRequest, Schematic } from '../types';
import { MOCK_TASKS, MOCK_INVENTORY, MOCK_ROOMS, TEAM_MEMBERS, MOCK_USER, MOCK_APPROVALS } from '../constants';

// Helper functions for localStorage persistence
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(`maintech_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(`maintech_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
    return defaultValue;
  }
};

export const useFirestoreSync = (user: any) => {
  // Initialize with data from localStorage or empty arrays
  const [tasks, setTasks] = useState<Task[]>(() => loadFromLocalStorage('tasks', []));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadFromLocalStorage('inventory', []));
  const [rooms, setRooms] = useState<Room[]>(() => loadFromLocalStorage('rooms', []));
  const [properties, setProperties] = useState<Property[]>(() => loadFromLocalStorage('properties', []));
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(() => loadFromLocalStorage('approvals', []));
  const [schematics, setSchematics] = useState<Schematic[]>(() => loadFromLocalStorage('schematics', []));
  const [currentProperty, setCurrentProperty] = useState<Property | null>(() => loadFromLocalStorage('currentProperty', null));
  const [allUsers, setAllUsers] = useState<User[]>(() => loadFromLocalStorage('users', []));
  const [loading, setLoading] = useState(true);

  // Persist data to localStorage whenever it changes
  useEffect(() => { saveToLocalStorage('tasks', tasks); }, [tasks]);
  useEffect(() => { saveToLocalStorage('inventory', inventory); }, [inventory]);
  useEffect(() => { saveToLocalStorage('rooms', rooms); }, [rooms]);
  useEffect(() => { saveToLocalStorage('properties', properties); }, [properties]);
  useEffect(() => { saveToLocalStorage('approvals', approvalRequests); }, [approvalRequests]);
  useEffect(() => { saveToLocalStorage('schematics', schematics); }, [schematics]);
  useEffect(() => { saveToLocalStorage('currentProperty', currentProperty); }, [currentProperty]);
  useEffect(() => { saveToLocalStorage('users', allUsers); }, [allUsers]);

  useEffect(() => {
    if (!user) {
      // Reset to defaults if logged out
      setTasks(MOCK_TASKS);
      setInventory(MOCK_INVENTORY);
      setRooms(MOCK_ROOMS);
      setApprovalRequests(MOCK_APPROVALS);
      setProperties([{ 
          id: 'p1', 
          name: 'Main Hotel', 
          address: '123 Main St', 
          type: 'Hotel', 
          imageUrl: 'https://picsum.photos/200' 
      }]);
      setAllUsers([MOCK_USER, ...TEAM_MEMBERS]);
      // Set default property for demo mode
      setCurrentProperty({ 
          id: 'p1', 
          name: 'Main Hotel', 
          address: '123 Main St', 
          type: 'Hotel', 
          imageUrl: 'https://picsum.photos/200' 
      });
      setLoading(false);
      return;
    }

    const uid = user.uid;

    // 1. Tasks Listener
    const tasksQuery = collection(db, 'users', uid, 'tasks');
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Task[];
      setTasks(fetchedTasks);
    }, (error) => {
      console.warn("Tasks sync error", error);
      setTasks([]);
    });

    // 2. Inventory Listener
    const invQuery = collection(db, 'users', uid, 'inventory');
    const unsubscribeInv = onSnapshot(invQuery, (snapshot) => {
      const fetchedInv = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as InventoryItem[];
      setInventory(fetchedInv);
    }, (error) => {
      console.warn("Inventory sync error", error);
      setInventory([]);
    });

    // 3. Rooms Listener - Moved to separate useEffect dependent on currentProperty
    
    // 4. Properties Listener - Listen to all properties via collectionGroup
    const propsQuery = collectionGroup(db, 'properties');
    const unsubscribeProps = onSnapshot(propsQuery, (snapshot) => {
      const fetchedProps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Property[];
      // Deduplicate properties by id (in case same property appears under multiple users)
      const uniqueProps = Array.from(new Map(fetchedProps.map(p => [p.id, p])).values());
      setProperties(uniqueProps);
      
      // Update current property
      setCurrentProperty(prev => {
          if (!prev) return uniqueProps[0] || null;
          const stillExists = uniqueProps.find(p => p.id === prev.id);
          return stillExists || uniqueProps[0] || null;
      });
    }, (error) => {
       console.warn("Properties sync error", error);
       setProperties([]);
    });

    // 5. Users Listener - Listen to ALL users in the collection
    const usersCollectionRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersCollectionRef, (snapshot) => {
        const fetchedUsers = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, uid: doc.id })) as User[];
        setAllUsers(fetchedUsers);
    }, (error) => {
        console.warn("Users collection sync error", error);
        setAllUsers([]);
    });

    // 6. Approval Requests Listener
    const approvalsQuery = collection(db, 'users', uid, 'approvals');
    const unsubscribeApprovals = onSnapshot(approvalsQuery, (snapshot) => {
      const fetchedApprovals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ApprovalRequest[];
      setApprovalRequests(fetchedApprovals);
    }, (error) => {
      console.warn("Approvals sync error", error);
      setApprovalRequests([]);
    });

    // 7. Schematics Listener
    const schematicsQuery = collection(db, 'users', uid, 'schematics');
    const unsubscribeSchematics = onSnapshot(schematicsQuery, (snapshot) => {
      const fetchedSchematics = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Schematic[];
      setSchematics(fetchedSchematics);
    }, (error) => {
      console.warn("Schematics sync error", error);
      setSchematics([]);
    });

    setLoading(false);

    return () => {
      unsubscribeTasks();
      unsubscribeInv();
      // unsubscribeRooms(); // Removed from here
      unsubscribeProps();
      unsubscribeUsers();
      unsubscribeApprovals();
      unsubscribeSchematics();
    };
  }, [user]);

  // Separate effect for Rooms Listener dependent on currentProperty
  useEffect(() => {
      if (!user || !currentProperty) {
          // Only set MOCK_ROOMS if rooms array is currently empty
          if (!user) {
            setRooms(prev => prev.length > 0 ? prev : MOCK_ROOMS);
          }
          return;
      }

      const roomsQuery = collection(db, 'users', user.uid, 'properties', currentProperty.id, 'rooms');
      const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
          const fetchedRooms = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Room[];
          setRooms(fetchedRooms);
      }, (error) => {
          console.warn("Rooms sync error (nested)", error);
          setRooms([]);
      });

      return () => unsubscribeRooms();
  }, [user, currentProperty]);

  // CRUD Operations
  const updateRoom = async (room: Room) => {
    if (!user) return;
    const propId = room.propertyId || currentProperty?.id;
    if (!propId) {
        console.warn("Cannot update room: missing propertyId");
        return;
    }
    try {
        const roomRef = doc(db, 'users', user.uid, 'properties', propId, 'rooms', room.id);
        await setDoc(roomRef, room, { merge: true });
    } catch(e) { console.warn("Update Room failed (Demo mode)", e); }
    // Optimistic update for UI responsiveness
    setRooms(prev => prev.map(r => r.id === room.id ? room : r));
  };

  const bulkUpdateRooms = async (updates: Room[]) => {
    if (!user) return;
    
    console.log('bulkUpdateRooms called with', updates.length, 'updates');
    console.log('Current rooms before update:', rooms.length);
    
    // Optimistic update - apply immediately for responsive UI
    setRooms(prev => {
        const updateMap = new Map(updates.map(u => [u.id, u]));
        const updated = prev.map(r => {
            const update = updateMap.get(r.id);
            if (update) {
                console.log(`Updating room ${r.number}: status=${update.status}, occupancy=${update.occupancy}`);
                return { ...r, ...update };
            }
            return r;
        });
        console.log('Rooms after update:', updated.length);
        return updated;
    });
    
    // Then persist to Firestore
    try {
        const batch = writeBatch(db);
        updates.forEach(r => {
            const propId = r.propertyId || currentProperty?.id;
            if (propId) {
                const ref = doc(db, 'users', user.uid, 'properties', propId, 'rooms', r.id);
                batch.set(ref, r, { merge: true });
            }
        });
        await batch.commit();
        console.log(`Successfully updated ${updates.length} room(s) in Firestore`);
    } catch(e) { 
        console.warn("Bulk Update failed (Demo mode)", e);
    }
  };

  const updateTask = async (task: Task) => {
    if (!user) return;
    try {
        const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
        await setDoc(taskRef, task, { merge: true });
    } catch(e) { console.warn("Update Task failed (Demo mode)", e); }
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  };

  const addTask = async (task: Task) => {
    if (!user) return;
    try {
        const taskRef = doc(db, 'users', user.uid, 'tasks', task.id);
        await setDoc(taskRef, task);
    } catch(e) { console.warn("Add Task failed (Demo mode)", e); }
    setTasks(prev => [task, ...prev]);
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    if (!user) return;
    try {
        const itemRef = doc(db, 'users', user.uid, 'inventory', item.id);
        await setDoc(itemRef, item, { merge: true });
    } catch(e) { console.warn("Update Inventory failed (Demo mode)", e); }
    setInventory(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const deleteInventoryItem = async (id: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'inventory', id));
    } catch(e) { console.warn("Delete Inventory failed (Demo mode)", e); }
    setInventory(prev => prev.filter(i => i.id !== id));
  };

const addProperty = async (propData: any) => {
  if (!user) return;
  
  // Optimistically add to local state first
  const newProp = { ...propData, ownerId: user.uid };
  setProperties(prev => [...prev, newProp]);
  setCurrentProperty(newProp);
  
  // Try to save to Firestore under user's properties
  try {
    const propertyRef = doc(db, 'users', user.uid, 'properties', propData.id);
    await setDoc(propertyRef, newProp);
    console.log('Property saved to Firestore successfully');
  } catch (error) {
    console.warn('Failed to save property to Firestore (using local state only):', error);
  }
};

  const updateProperty = async (property: Property) => {
    if (!user) return;
    try {
        const propRef = doc(db, 'users', user.uid, 'properties', property.id);
        await setDoc(propRef, property, { merge: true });
    } catch(e) { console.warn("Update Property failed (Demo mode)", e); }
    
    setProperties(prev => prev.map(p => p.id === property.id ? property : p));
    setCurrentProperty(prev => prev?.id === property.id ? property : prev);
  };

  const switchProperty = (id: string) => {
    const prop = properties.find(p => p.id === id);
    if (prop) setCurrentProperty(prop);
  };

  const updateUserStatus = async (uid: string, status: string) => {
      try {
        await updateDoc(doc(db, 'users', uid), { accountStatus: status });
      } catch (error) {
        console.warn("Error updating user status (Demo mode):", error);
      }
      // Optimistic update
      setAllUsers(prev => prev.map(u => (u.uid === uid || u.id === uid) ? { ...u, accountStatus: status as any } : u));
  };

  const updateApprovalRequest = async (id: string, status: 'Approved' | 'Rejected') => {
      // Update local state first (works in both demo and logged-in mode)
      setApprovalRequests(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      
      // Try to update in Firebase if user is logged in
      if (user) {
        try {
          const ref = doc(db, 'users', user.uid, 'approvals', id);
          await updateDoc(ref, { status });
        } catch (err) {
          console.warn("Update Approval failed in Firebase (local state already updated)", err);
        }
      }
  };

  const addApprovalRequest = async (request: Omit<ApprovalRequest, 'id'>) => {
      const newRequest: ApprovalRequest = {
        ...request,
        id: `a${Date.now()}`,
      };
      
      // Optimistically update local state
      setApprovalRequests(prev => [newRequest, ...prev]);
      
      // Try to save to Firebase if logged in
      if (user) {
        try {
          const ref = doc(db, 'users', user.uid, 'approvals', newRequest.id);
          await setDoc(ref, newRequest);
        } catch (err) {
          console.warn("Add Approval request failed (local state updated)", err);
        }
      }
  };

  const addSchematic = async (schematic: Omit<Schematic, 'id'>) => {
      const newSchematic: Schematic = {
        ...schematic,
        id: `sch${Date.now()}`,
      };
      
      // Optimistically update local state
      setSchematics(prev => [newSchematic, ...prev]);
      
      // Try to save to Firebase if logged in
      if (user) {
        try {
          const ref = doc(db, 'users', user.uid, 'schematics', newSchematic.id);
          await setDoc(ref, newSchematic);
        } catch (err) {
          console.warn("Add Schematic failed (local state updated)", err);
        }
      }
  };

  const deleteSchematic = async (id: string) => {
      // Optimistically update local state
      setSchematics(prev => prev.filter(s => s.id !== id));
      
      // Try to delete from Firebase if logged in
      if (user) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'schematics', id));
        } catch (err) {
          console.warn("Delete Schematic failed (local state updated)", err);
        }
      }
  };

  const generateRooms = async (propertyId: string, config: any) => {
      console.log('generateRooms called with config:', config);
      
      const generatedRooms: Room[] = [];
      let count = 0;
      
      // Default checklist template
      const defaultChecklist = [
          { id: 'pm1', category: 'HVAC', task: 'Check Thermostat', isChecked: false },
          { id: 'pm2', category: 'HVAC', task: 'Clean Filter', isChecked: false },
          { id: 'pm3', category: 'Plumbing', task: 'Check Faucets', isChecked: false },
          { id: 'pm4', category: 'Electrical', task: 'Test Lights', isChecked: false }
      ];

      // Generate room objects first (works in both logged-in and demo mode)
      for (const [floorStr, range] of Object.entries(config)) {
          const floor = Number(floorStr);
          const start = parseInt((range as any).start.toString());
          const end = parseInt((range as any).end.toString());
          
          console.log(`Floor ${floor}: start=${start}, end=${end}`);
          
          // Safety check: prevent infinite loops or invalid ranges
          if (isNaN(start) || isNaN(end) || start > end || (end - start) > 500) {
              console.warn(`Skipping invalid room range for floor ${floor}:`, range);
              continue;
          }
          
          for (let num = start; num <= end; num++) {
              const roomNum = num.toString();
              const roomId = `room_${propertyId}_${roomNum}`;
              
              const newRoom: Room = {
                  id: roomId,
                  number: roomNum,
                  floor: floor,
                  status: 'Clean',
                  occupancy: 'Vacant',
                  type: 'Standard',
                  lastCleaned: 'Never',
                  features: ['Wifi', 'TV'],
                  pmStatus: 'Not Started',
                  pmChecklist: JSON.parse(JSON.stringify(defaultChecklist)), // Deep copy
                  propertyId: propertyId
              };
              
              generatedRooms.push(newRoom);
              count++;
          }
      }
      
      // Update local state immediately (works in both modes)
      if (count > 0) {
          console.log(`Successfully generated ${count} rooms`);
          
          setRooms(prev => {
              // Remove all rooms for this property (including mock rooms), then add new ones
              const filtered = prev.filter(r => r.propertyId !== propertyId);
              return [...filtered, ...generatedRooms];
          });
      }
      
      // Try to save to Firebase if user is logged in
      if (user && count > 0) {
          try {
              const batch = writeBatch(db);
              
              for (const room of generatedRooms) {
                  const roomRef = doc(db, 'users', user.uid, 'properties', propertyId, 'rooms', room.id);
                  batch.set(roomRef, room);
              }
              
              await batch.commit();
              console.log(`Saved ${count} rooms to Firebase`);
          } catch (e) {
              console.warn("Failed to save rooms to Firebase (local state already updated):", e);
          }
      }
  };

  const updateUserProfile = async (uid: string, data: Partial<User>) => {
      if (!user) {
          return Promise.resolve();
      }
      
      // Optimistic update - update local state first
      setAllUsers(prev => prev.map(u => (u.uid === uid || u.id === uid) ? { ...u, ...data } : u));
      
      // Try to update in Firebase (don't await - fire and forget)
      const userRef = doc(db, 'users', uid);
      updateDoc(userRef, data).catch(e => {
          console.warn("Update Profile failed (local state already updated)", e);
      });
      
      // Return immediately since we've done the optimistic update
      return Promise.resolve();
  };

  return { 
    tasks, 
    inventory, 
    rooms, 
    schematics,
    properties,
    approvalRequests,
    currentProperty,
    allUsers,
    loading, 
    updateRoom, 
    bulkUpdateRooms,
    updateTask,
    addTask,
    updateInventoryItem,
    deleteInventoryItem,
    addProperty,
    updateProperty,
    switchProperty,
    updateUserStatus,
    updateApprovalRequest,
    addApprovalRequest,
    generateRooms,
    updateUserProfile,
    addSchematic,
    deleteSchematic
  };
};
