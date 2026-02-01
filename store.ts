import {
  User,
  Property,
  Agreement,
  Payment,
  MaintenanceTicket,
  Notification,
  UserRole,
  PropertyStatus,
  TicketStatus,
  TicketPriority,
  NotificationType,
  TenantApplication,
  ApplicationStatus,
  PropertyCategory,
  FormTemplate,
} from "./types";
const STORAGE_KEY = "prop_lifecycle_data";

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    maintenance: boolean;
    payments: boolean;
  };
  appearance: {
    density: "comfortable" | "compact";
    animations: boolean;
    glassEffect: boolean;
  };
  localization: {
    currency: "NGN" | "USD" | "EUR";
    dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY";
  };
}

interface AppState {
  users: User[];
  properties: Property[];
  agreements: Agreement[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  notifications: Notification[];
  applications: TenantApplication[];
  formTemplates: FormTemplate[];
  currentUser: User | null;
  theme: "light" | "dark";
  settings: UserSettings;
}

const initialSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    maintenance: true,
    payments: true,
  },
  appearance: {
    density: "comfortable",
    animations: true,
    glassEffect: true,
  },
  localization: {
    currency: "NGN",
    dateFormat: "DD/MM/YYYY",
  },
};

const initialData: AppState = {
  users: [],
  properties: [],
  agreements: [],
  payments: [],
  tickets: [],
  notifications: [],
  applications: [],
  formTemplates: [],
  currentUser: null,
  theme: "dark",
  settings: initialSettings,
};

// Retrieve data synchronously from LocalStorage for instant UI render
export const getStore = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialData;
  const parsed = JSON.parse(saved);
  if (!parsed.settings) parsed.settings = initialSettings;
  if (!parsed.formTemplates) parsed.formTemplates = initialData.formTemplates;
  return parsed;
};

// Save data to LocalStorage (Immediate)
export const saveStore = (state: AppState) => {
  // Local Persistence (Fast)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// Mock sync for local-only operation
export const initFirebaseSync = (onUpdate: (newState: AppState) => void) => {
  return () => {};
};

/**
 * UTILITY: Format currency based on user settings
 */
export const formatCurrency = (
  amount: number,
  settings: UserSettings,
): string => {
  const rates = { NGN: 1, USD: 0.00065, EUR: 0.0006 };
  const converted = amount * rates[settings.localization.currency];

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: settings.localization.currency,
    minimumFractionDigits: settings.localization.currency === "NGN" ? 0 : 2,
  }).format(converted);
};

/**
 * UTILITY: Format date based on user settings
 */
export const formatDate = (
  dateString: string,
  settings: UserSettings,
): string => {
  if (!dateString || dateString === "---") return "---";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return settings.localization.dateFormat === "DD/MM/YYYY"
    ? `${day}/${month}/${year}`
    : `${month}/${day}/${year}`;
};
