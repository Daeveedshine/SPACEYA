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
  INFO = "info", // Standardized to lowercase
}

export interface User {
  id: string;
  displayId: string;
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
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  linkTo?: string;
}

// This is a more accurate representation of the TenantApplication
export interface TenantApplication {
  id: string;
  userId: string;
  propertyId: string; // Can be 'PENDING'
  agentId: string;
  status: ApplicationStatus;
  submissionDate: string;

  // Personal Info
  firstName: string;
  surname: string;
  middleName?: string;
  dob: string;
  maritalStatus: string;
  gender: string;

  // Contact & Professional
  occupation: string;
  familySize: number;
  phoneNumber: string;

  // Residential History
  currentHomeAddress: string;
  reasonForRelocating: string;
  currentLandlordName: string;
  currentLandlordPhone: string;

  // Verification
  verificationType: string;
  verificationIdNumber: string;
  verificationUrl?: string; // URL to uploaded ID
  passportPhotoUrl?: string; // URL to uploaded photo

  // Authorization
  signature: string;
  applicationDate: string;

  // Agent-specific
  agentIdCode: string; // The code the tenant used to start the application

  // AI/System Generated
  riskScore?: number;
  aiRecommendation?: string;

  // This will hold all other non-standard fields from a dynamic form
  customResponses: Record<string, any>;
}

export type FormFieldValue = string | number | boolean | string[];

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "checkbox"
  | "number"
  | "date"
  | "file"
  | "tel"
  | "email";

export interface FormField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select type
  required: boolean;
  placeholder?: string;
}

export interface FormSection {
  id: string;
  title: string;
  icon: string;
  fields: FormField[];
}

export interface FormTemplate {
  agentId: string; // Internal agent UUID
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