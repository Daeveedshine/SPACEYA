import {
  User,
  Property,
  Agreement,
  Payment,
  MaintenanceTicket,
  Notification,
  TenantApplication,
  FormTemplate,
} from "./types";
import { db } from "./services/Firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const STORAGE_KEY = "prop_lifecycle_data";
const FIRESTORE_DOC_ID = "app_state"; // Single document to store all app state

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

export interface AppState {
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

// Save data to LocalStorage and Firestore, returns true on success
export const saveStore = async (state: AppState): Promise<boolean> => {
  // Local Persistence (Fast, for immediate UI feedback)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  // Firestore Persistence (Slower, but Synced)
  try {
    // Use a deep copy for Firestore to avoid any circular reference issues
    const stateToSave = JSON.parse(JSON.stringify(state));
    await setDoc(doc(db, "prop_lifecycle", FIRESTORE_DOC_ID), stateToSave, { merge: true });
    return true;
  } catch (error) {
    console.error("Firebase sync failed:", error);
    // Optionally, notify the user of the sync failure
    return false;
  }
};

// Set up real-time sync with Firebase
export const initFirebaseSync = (
  onUpdate: (newState: AppState) => void,
  onError: (error: Error) => void,
) => {
  const docRef = doc(db, "prop_lifecycle", FIRESTORE_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (doc) => {
      if (doc.exists()) {
        const newState = doc.data() as AppState;
        onUpdate(newState);
        // Also update local storage to keep it in sync
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } else {
        // If no data in Firestore, initialize it with the local data
        saveStore(getStore());
      }
    },
    (error) => {
      console.error("Firebase connection error:", error);
      onError(error);
    },
  );

  return unsubscribe; // Return the unsubscribe function to be called on cleanup
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
