import {
  User,
  Property,
  Agreement,
  Payment,
  MaintenanceTicket,
  Notification,
  TenantApplication,
  FormTemplate,
  UserRole,
  AppState,
} from "./types";
import { db } from "./services/Firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

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

// UID Generation Logic
const generateSecureAlphanumeric = (length: number): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const randomValues = new Uint32Array(length);
    // Use the browser's built-in crypto API
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
    }
    return result;
};

export const generateDisplayId = (role: UserRole, existingIds: string[]): string => {
    const prefix = role === UserRole.AGENT ? 'AGT' : 'TNT';
    let newId = '';
    let isUnique = false;

    while (!isUnique) {
        newId = `${prefix}-${generateSecureAlphanumeric(6)}`;
        if (!existingIds.includes(newId)) {
            isUnique = true;
        }
    }
    return newId;
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

// Fetches the entire app state from Firestore.
export const fetchStoreFromFirestore = async (): Promise<AppState | null> => {
  try {
    const docRef = doc(db, "prop_lifecycle", FIRESTORE_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppState;
    }
    return null; // Or initialData if that's preferred
  } catch (error) {
    console.error("Failed to fetch state from Firestore:", error);
    return null;
  }
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

export const saveUser = async (user: Omit<User, 'displayId'> & { displayId?: string }): Promise<boolean> => {
  const store = getStore();
  const userIndex = store.users.findIndex(u => u.id === user.id);

  if (userIndex > -1) {
    // User exists, update it, ensuring displayId is not changed
    const existingUser = store.users[userIndex];
    store.users[userIndex] = { ...user, displayId: existingUser.displayId };
  } else {
    // User does not exist, generate a new displayId and add it
    const existingIds = store.users.map(u => u.displayId);
    const newDisplayId = generateDisplayId(user.role, existingIds);
    const newUserWithId = { ...user, displayId: newDisplayId } as User;
    store.users.unshift(newUserWithId);
  }

  // Now, save the entire updated state using the main save function
  return await saveStore(store);
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
