


import { Task, TaskPriority, TaskStatus, InventoryItem, User, Room, PMItem, Notification, ApprovalRequest } from './types';

export const COLORS = {
  background: '#fdfdfd',
  secondaryBg: '#2a313d',
  primary: '#1d98d2',
  success: '#87b21e',
  border: '#d4d5da',
  danger: '#ef4444',
  warning: '#f59e0b'
};

export const PM_CHECKLIST_TEMPLATE: PMItem[] = [
  // Entry Door
  { id: 'pm_ed1', category: 'Entry Door', task: 'Door and door frame', isChecked: false },
  { id: 'pm_ed2', category: 'Entry Door', task: 'Frame silencers, smoke seal, intumescent fire strips, door sweeps and doorstop (ensure they are in place)', isChecked: false },
  { id: 'pm_ed3', category: 'Entry Door', task: 'Closure and closer operation (back swing, swing, and latch operation – adjust as needed; ensure door automatically latches closed at 8" and 30" opening position)', isChecked: false },
  { id: 'pm_ed4', category: 'Entry Door', task: 'Deadbolt/night-latch', isChecked: false },
  { id: 'pm_ed5', category: 'Entry Door', task: 'Knob, strike plate and hinges', isChecked: false },
  { id: 'pm_ed6', category: 'Entry Door', task: 'Lock (condition, operation, battery strength, Bluetooth operation, Digital Key Health)', isChecked: false },
  { id: 'pm_ed7', category: 'Entry Door', task: 'Room number', isChecked: false },
  { id: 'pm_ed8', category: 'Entry Door', task: 'Evacuation/Innkeeper plaque', isChecked: false },
  { id: 'pm_ed9', category: 'Entry Door', task: 'Viewer/cover', isChecked: false },

  // Entry Threshold
  { id: 'pm_et1', category: 'Entry Threshold', task: 'Floor tile/carpet', isChecked: false },
  { id: 'pm_et2', category: 'Entry Threshold', task: 'Baseboard', isChecked: false },
  { id: 'pm_et3', category: 'Entry Threshold', task: 'Wall finish', isChecked: false },
  { id: 'pm_et4', category: 'Entry Threshold', task: 'Ceiling finish', isChecked: false },

  // Closet
  { id: 'pm_c1', category: 'Closet', task: 'Door tracks, guides & bumpers', isChecked: false },
  { id: 'pm_c2', category: 'Closet', task: 'Hangers, rods & shelves', isChecked: false },
  { id: 'pm_c3', category: 'Closet', task: 'Safe – battery strength & locking mechanism', isChecked: false },
  { id: 'pm_c4', category: 'Closet', task: 'Luggage rack stability', isChecked: false },
  { id: 'pm_c5', category: 'Closet', task: 'Iron & ironing board condition', isChecked: false },

  // Bathroom
  { id: 'pm_b1', category: 'Bathroom', task: 'Exhaust fan (clean & operational)', isChecked: false },
  { id: 'pm_b2', category: 'Bathroom', task: 'GFCI outlets (test reset button)', isChecked: false },
  { id: 'pm_b3', category: 'Bathroom', task: 'Sink/shower water temperature (122°F max)', isChecked: false },
  { id: 'pm_b4', category: 'Bathroom', task: 'Toilet flush & tank components', isChecked: false },
  { id: 'pm_b5', category: 'Bathroom', task: 'Caulking & grout condition (tub/sink)', isChecked: false },
  { id: 'pm_b6', category: 'Bathroom', task: 'Drain flow & stoppers', isChecked: false },
  { id: 'pm_b7', category: 'Bathroom', task: 'Towel bars, hooks & toilet paper holder', isChecked: false },
  { id: 'pm_b8', category: 'Bathroom', task: 'Mirror condition', isChecked: false },
  { id: 'pm_b9', category: 'Bathroom', task: 'Shower curtain rod, rings & curtain/door', isChecked: false },

  // Bedroom / Living Area
  { id: 'pm_br1', category: 'Bedroom / Living Area', task: 'All lighting, switches & USB/outlet functionality', isChecked: false },
  { id: 'pm_br2', category: 'Bedroom / Living Area', task: 'Window drapes & blackout curtain tracks', isChecked: false },
  { id: 'pm_br3', category: 'Bedroom / Living Area', task: 'Furniture stability (legs, drawers, handles)', isChecked: false },
  { id: 'pm_br4', category: 'Bedroom / Living Area', task: 'TV & remote functionality', isChecked: false },
  { id: 'pm_br5', category: 'Bedroom / Living Area', task: 'Telephone operation', isChecked: false },
  { id: 'pm_br6', category: 'Bedroom / Living Area', task: 'Floor tile/carpet condition', isChecked: false },
  { id: 'pm_br7', category: 'Bedroom / Living Area', task: 'Baseboards, wall finish & ceiling condition', isChecked: false },
  { id: 'pm_br8', category: 'Bedroom / Living Area', task: 'Artwork/mirrors – secure & condition', isChecked: false },

  // Windows & Balcony Door
  { id: 'pm_w1', category: 'Windows & Balcony Door', task: 'Window operation, latches & seals', isChecked: false },
  { id: 'pm_w2', category: 'Windows & Balcony Door', task: 'Sliding/balcony door operation & lock', isChecked: false },
  { id: 'pm_w3', category: 'Windows & Balcony Door', task: 'Screen condition (if applicable)', isChecked: false },
  { id: 'pm_w4', category: 'Windows & Balcony Door', task: 'Balcony railing stability (if applicable)', isChecked: false },

  // HVAC
  { id: 'pm_h1', category: 'HVAC', task: 'Thermostat heat/cool response', isChecked: false },
  { id: 'pm_h2', category: 'HVAC', task: 'Filter condition (replace if dirty)', isChecked: false },
  { id: 'pm_h3', category: 'HVAC', task: 'Vent/grille cleanliness', isChecked: false },
  { id: 'pm_h4', category: 'HVAC', task: 'Condensation drain pan check', isChecked: false },
  { id: 'pm_h5', category: 'HVAC', task: 'Fan coil/PTU unit operation (all speeds)', isChecked: false },

  // Fire & Safety
  { id: 'pm_fs1', category: 'Fire & Safety', task: 'Smoke detector test & battery check', isChecked: false },
  { id: 'pm_fs2', category: 'Fire & Safety', task: 'Sprinkler head condition (unobstructed)', isChecked: false },
  { id: 'pm_fs3', category: 'Fire & Safety', task: 'Evacuation map present & legible on door', isChecked: false },
  { id: 'pm_fs4', category: 'Fire & Safety', task: 'Fire pull station / annunciator panel check', isChecked: false },
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  role: 'Technician',
  avatarUrl: 'https://picsum.photos/100/100',
  status: 'online',
  accountStatus: 'active'
};

const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'HVAC Unit 304 Noise',
    location: 'Room 304',
    priority: TaskPriority.CRITICAL,
    status: TaskStatus.PENDING,
    description: 'Guest reports loud grinding noise coming from the AC unit.',
    reportedAt: '10:30 AM',
    category: 'HVAC',
    dueDate: today.toISOString().split('T')[0],
    propertyId: 'p1'
  },
  {
    id: 't2',
    title: 'Lobby Sink Leak',
    location: 'Lobby Restroom (M)',
    priority: TaskPriority.HIGH,
    status: TaskStatus.IN_PROGRESS,
    description: 'Steady drip from the cold water tap.',
    reportedAt: '09:15 AM',
    category: 'Plumbing',
    dueDate: today.toISOString().split('T')[0],
    propertyId: 'p1'
  },
  {
    id: 't3',
    title: 'Hallway Light Flicker',
    location: '3rd Floor Corridor',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    description: 'Several recessed lights are flickering intermittently.',
    reportedAt: 'Yesterday',
    category: 'Electrical',
    dueDate: tomorrow.toISOString().split('T')[0],
    propertyId: 'p1'
  },
  {
    id: 't4',
    title: 'Pool Pump Inspection',
    location: 'Pool Area',
    priority: TaskPriority.LOW,
    status: TaskStatus.COMPLETED,
    description: 'Routine maintenance check on main pump.',
    reportedAt: 'Yesterday',
    category: 'General',
    dueDate: nextWeek.toISOString().split('T')[0],
    propertyId: 'p1'
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Air Filter 20x20x1',
    sku: 'AF-2020-1',
    quantity: 5,
    minThreshold: 10,
    category: 'HVAC',
    imageUrl: 'https://picsum.photos/200/200?random=1',
    location: 'Shelf A-12',
    propertyId: 'p1'
  },
  {
    id: 'i2',
    name: 'LED Bulb 60W Eq',
    sku: 'LED-60W-DAY',
    quantity: 45,
    minThreshold: 20,
    category: 'Electrical',
    imageUrl: 'https://picsum.photos/200/200?random=2',
    location: 'Bin B-04',
    propertyId: 'p1'
  },
  {
    id: 'i3',
    name: 'Teflon Tape Roll',
    sku: 'TEF-001',
    quantity: 12,
    minThreshold: 5,
    category: 'Plumbing',
    imageUrl: 'https://picsum.photos/200/200?random=3',
    location: 'Drawer C-01',
    propertyId: 'p1'
  },
  {
    id: 'i4',
    name: 'PVC Elbow 1/2"',
    sku: 'PVC-EL-05',
    quantity: 2,
    minThreshold: 15,
    category: 'Plumbing',
    imageUrl: 'https://picsum.photos/200/200?random=4',
    location: 'Bin D-09',
    propertyId: 'p1'
  }
];

export const TEAM_MEMBERS: User[] = [
  { id: 'u2', name: 'Sarah J.', email: 'sarah.j@example.com', role: 'Manager', avatarUrl: 'https://picsum.photos/101/101', status: 'online', accountStatus: 'active' },
  { id: 'u3', name: 'Mike T.', email: 'mike.t@example.com', role: 'Technician', avatarUrl: 'https://picsum.photos/102/102', status: 'busy', accountStatus: 'active' },
  { id: 'u4', name: 'Davina L.', email: 'davina.l@example.com', role: 'Technician', avatarUrl: 'https://picsum.photos/103/103', status: 'offline', accountStatus: 'active' },
];

export const MOCK_ROOMS: Room[] = [
  { id: 'r101', number: '101', type: 'King Suite', status: 'Clean', occupancy: 'Occupied', floor: 1, lastCleaned: 'Today, 9:00 AM', features: ['Ocean View'], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r102', number: '102', type: 'Double Queen', status: 'Dirty', occupancy: 'Vacant', floor: 1, lastCleaned: 'Yesterday', features: [], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r103', number: '103', type: 'Standard King', status: 'Clean', occupancy: 'Vacant', floor: 1, lastCleaned: 'Today, 11:30 AM', features: [], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r104', number: '104', type: 'Standard King', status: 'Out of Order', occupancy: 'Vacant', floor: 1, lastCleaned: '3 days ago', features: ['Maintenance'], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r201', number: '201', type: 'King Suite', status: 'Clean', occupancy: 'Occupied', floor: 2, lastCleaned: 'Today, 10:15 AM', features: ['Balcony'], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r202', number: '202', type: 'Double Queen', status: 'Dirty', occupancy: 'Occupied', floor: 2, lastCleaned: 'Yesterday', features: [], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r203', number: '203', type: 'Standard King', status: 'Inspecting', occupancy: 'Vacant', floor: 2, lastCleaned: 'Today, 12:00 PM', features: [], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r204', number: '204', type: 'Standard King', status: 'Clean', occupancy: 'Vacant', floor: 2, lastCleaned: 'Today, 8:45 AM', features: [], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r301', number: '301', type: 'Presidential', status: 'Clean', occupancy: 'Occupied', floor: 3, lastCleaned: 'Today, 1:00 PM', features: ['Jacuzzi', 'Ocean View'], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r302', number: '302', type: 'Double Queen', status: 'Dirty', occupancy: 'Vacant', floor: 3, lastCleaned: '2 days ago', features: [], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r303', number: '303', type: 'King Suite', status: 'Dirty', occupancy: 'Occupied', floor: 3, lastCleaned: 'Yesterday', features: [], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
  { id: 'r304', number: '304', type: 'Standard King', status: 'Clean', occupancy: 'Occupied', floor: 3, lastCleaned: 'Today, 9:30 AM', features: [], pmStatus: 'Not Started', pmChecklist: PM_CHECKLIST_TEMPLATE, propertyId: 'p1' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', message: 'Urgent: HVAC Failure in Room 304', type: 'alert', time: 'Just now' },
  { id: 'n2', message: 'Inventory Low: LED Bulbs (Stock: 4)', type: 'info', time: '1 hour ago' },
  { id: 'n3', message: 'Task Completed: Pool Pump Inspection', type: 'success', time: '2 hours ago' },
  { id: 'n4', message: 'New Shift Schedule Posted', type: 'info', time: '5 hours ago' },
];

export const MOCK_APPROVALS: ApprovalRequest[] = [
  { id: 'a1', type: 'Purchase', title: '50x LED Bulbs Bulk', requester: 'Mike T.', amount: '$450.00', date: 'Today', status: 'Pending' },
  { id: 'a2', type: 'Repair', title: 'HVAC Compressor Replacement', requester: 'Davina L.', date: 'Yesterday', status: 'Pending' },
  { id: 'a3', type: 'Purchase', title: 'New Drill Kit', requester: 'Alex R.', amount: '$120.00', date: '2 days ago', status: 'Pending' },
];