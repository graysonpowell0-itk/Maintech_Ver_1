

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  APPROVED = 'Approved'
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'Hotel' | 'Resort' | 'Motel' | 'Apartment';
  imageUrl?: string;
  roomCount?: number;
  floorCount?: number;
  amenities?: string[];
}

export interface Task {
  id: string;
  title: string;
  location: string;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  reportedAt: string;
  assignedTo?: string;
  category: 'HVAC' | 'Plumbing' | 'Electrical' | 'General';
  dueDate?: string; // ISO Date string YYYY-MM-DD
  propertyId?: string;
  imageUrl?: string; // Image of the issue
  completionProofUrl?: string; // Image proof of completion
  repairSummary?: string; // Summary of repair work done
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minThreshold: number;
  category: string;
  imageUrl: string;
  location: string;
  propertyId?: string;
  specs?: string; // Item specifications
  distributor?: string; // Distributor name
  salesAgent?: string; // Sales agent contact information
  orderPageUrl?: string; // Link to order page
}

export interface Notification {
  id: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  time: string;
}

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: 'Technician' | 'Manager' | 'Admin' | 'Maintenance' | 'Other Staff';
  avatarUrl: string;
  status: 'online' | 'busy' | 'offline';
  accountStatus: 'pending' | 'active' | 'rejected';
  propertyId?: string;
}

export interface AIFixSuggestion {
  issue: string;
  confidence: number;
  steps: string[];
}

export type RoomStatus = 'Clean' | 'Dirty' | 'Inspecting' | 'Out of Order';
export type OccupancyStatus = 'Vacant' | 'Occupied' | 'Pending Departure';
export type PMStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface PMItem {
  id: string;
  category: string;
  task: string;
  isChecked: boolean;
}

export interface PMLogEntry {
  completedBy: string;
  completedAt: string;
  itemsCompleted: number;
  totalItems: number;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  status: RoomStatus;
  occupancy: OccupancyStatus;
  floor: number;
  lastCleaned: string;
  features: string[];
  pmStatus: PMStatus;
  pmChecklist: PMItem[];
  propertyId?: string;
  checkoutDate?: string;
  pmCompletedBy?: string;
  pmCompletedAt?: string;
  pmHistory?: PMLogEntry[];
}

export interface ApprovalRequest {
  id: string;
  type: 'Purchase' | 'Repair';
  title: string;
  requester: string;
  amount?: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  taskId?: string; // For repair completion approvals
  repairSummary?: string; // Summary of repair work
  completionProofUrl?: string; // Proof image for repair
}

export interface Schematic {
  id: string;
  name: string;
  description?: string;
  category: 'Room Layout' | 'Property Layout' | 'Floor Plan' | 'Other';
  fileUrl: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  propertyId?: string;
}