export enum UserRole {
  ADMIN = "admin",
  AGENT = "agent",
  TENANT = "tenant",
}

export enum PropertyType {
  APARTMENT = "Apartment",
  HOUSE = "House",
  COMMERCIAL = "Commercial",
}

export enum PropertyCategory {
    RESIDENTIAL = "Residential",
    COMMERCIAL = "Commercial",
    INDUSTRIAL = "Industrial",
    LAND = "Land",
}

export enum PropertyStatus {
    AVAILABLE = "Available",
    OCCUPIED = "Occupied",
    MAINTENANCE = "Under Maintenance",
  }

export enum TicketStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
}

export enum TicketPriority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export enum ApplicationStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export enum NotificationType {
    PAYMENT = "payment",
    MAINTENANCE = "maintenance",
    APPLICATION = "application",
    GENERAL = "general",
  }

export interface User {
  id: string; // This is the internal UUID/ULID
  displayId: string; // This is the new AGT-/TNT- prefixed ID
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
  profilePictureUrl?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: PropertyType;
  unitCount: number;
  agentId: string;
  imageUrl: string;
}

export interface Agreement {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  documentUrl: string;
}

export interface Payment {
  id: string;
  agreementId: string;
  amount: number;
  paymentDate: string;
  isVerified: boolean;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  tenantId: string;
  issue: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  priority: TicketPriority;
  resolutionDetails?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string;
  type: "payment" | "maintenance" | "application" | "general";
}

export interface TenantApplication {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: ApplicationStatus;
  submittedAt: string;
  agentId: string;
}

export type FormFieldValue = string | number | boolean | string[];

export type FieldType = "text" | "textarea" | "select" | "checkbox" | "number" | "date" | "file" | "tel" | "email";

export interface FormField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select type
  required: boolean;
}

export interface FormSection {
    id: string;
    title: string;
    icon: string;
    fields: FormField[];
}

export interface FormTemplate {
  agentId: string;
  lastUpdated: string;
  sections: FormSection[];
}


// This is the master state for the entire application.
export interface AppState {
    currentUser: User | null;
    users: User[];
    properties: Property[];
    agreements: Agreement[];
    payments: Payment[];
    tickets: MaintenanceTicket[];
    notifications: Notification[];
    applications: TenantApplication[];
    formTemplates: FormTemplate[];
    theme: "light" | "dark";
    settings: any; // Replace 'any' with a specific settings interface later
  }
