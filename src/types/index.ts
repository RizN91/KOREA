// Core entity types for the Fridge Seal Management System

export interface Address {
  id: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  type: 'billing' | 'delivery' | 'site';
  lat?: number;
  lng?: number;
}

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  notes: string;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: string;
  customerId: string;
  address: Address;
  accessNotes: string;
  onsiteContact: string;
  parkingNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type JobStatus = 
  | 'new'
  | 'need_to_measure'
  | 'measured'
  | 'quoted'
  | 'waiting_approval'
  | 'approved'
  | 'in_production'
  | 'ready_for_install'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'invoiced'
  | 'paid'
  | 'on_hold'
  | 'cancelled';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Measurements {
  aSize: number; // width
  cSize: number; // height
  // No B-size as per business requirements
  profileCode: string;
  sealColour: 'black' | 'grey';
  qty: number;
  hingeSide?: 'left' | 'right';
  gasketType?: 'push-in' | 'screw-in';
}

export interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: Date;
  type: 'measurement' | 'before' | 'after' | 'issue';
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  requiresPhoto: boolean;
  photoId?: string;
  completedAt?: Date;
  completedBy?: string;
}

export interface Job {
  id: string;
  jobNo: string; // Auto formatted "JB####"
  customerId: string;
  siteId: string;
  status: JobStatus;
  priority: Priority;
  createdAt: Date;
  scheduledAt?: Date;
  assigneeId?: string;
  measurements?: Measurements;
  photos: JobPhoto[];
  notes: string;
  parts: string[]; // Part IDs
  measureChecklist: ChecklistItem[];
  installChecklist: ChecklistItem[];
  quoteId?: string;
  invoiceId?: string;
  updatedAt: Date;
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  profileCode: string;
  colour: 'black' | 'grey';
  lengthMm: number;
  priceEx: number;
  taxRate: number;
  stockQty: number;
  lowStockThreshold: number;
  category: string;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'scheduler' | 'tech';

export interface User {
  id: string;
  shortCode: string; // e.g., "FS", "MK", "JS"
  name: string;
  role: UserRole;
  mobile: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LineItem {
  id: string;
  partId?: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  jobId: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  validUntil: Date;
  pdfUrl?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  jobId: string;
  quoteId?: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  pdfUrl?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  jobId: string;
  timestamp: Date;
  actorId: string;
  action: string;
  meta: Record<string, any>;
}

export interface Timesheet {
  id: string;
  userId: string;
  jobId: string;
  start: Date;
  end?: Date;
  travelKm: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// UI and Search Types
export interface FilterOptions {
  status?: JobStatus[];
  assignee?: string[];
  priority?: Priority[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  customer?: string[];
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterOptions;
  columns: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  userId: string;
}

export interface DashboardKPI {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'currency' | 'percentage';
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Permissions
export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Location and Travel
export interface Location {
  lat: number;
  lng: number;
}

export interface TravelEstimate {
  distanceKm: number;
  durationMinutes: number;
}

// Export/Import
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  fields: string[];
  filters?: FilterOptions;
}

// Form State Types
export interface JobFormData {
  customerId: string;
  siteId: string;
  priority: Priority;
  notes: string;
  scheduledAt?: Date;
  assigneeId?: string;
}

export interface CustomerFormData {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  notes: string;
  addresses: Omit<Address, 'id'>[];
}

export interface SiteFormData {
  customerId: string;
  address: Omit<Address, 'id'>;
  accessNotes: string;
  onsiteContact: string;
  parkingNotes: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}