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
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
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

export interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "number";
  options?: string[]; // for select type
  required: boolean;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
}
