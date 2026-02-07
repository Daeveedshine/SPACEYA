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
const FIRESTORE_DOC_ID = "app_state";

export interface UserSettings {
  notifications: { email: boolean; push: boolean; maintenance: boolean; payments: boolean; };
  appearance: { density: "comfortable" | "compact"; animations: boolean; glassEffect: boolean; };
  localization: { currency: "NGN" | "USD" | "EUR"; dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY"; };
}

const initialSettings: UserSettings = {
  notifications: { email: true, push: true, maintenance: true, payments: true },
  appearance: { density: "comfortable", animations: true, glassEffect: true },
  localization: { currency: "NGN", dateFormat: "DD/MM/YYYY" },
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

// --- CORRECT, USER-FRIENDLY ID GENERATION ---
const generateSecureAlphanumeric = (length: number): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const randomValues = new Uint32Array(length);
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
// --- END --- 

export const getStore = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialData;
  const parsed = JSON.parse(saved);
  if (!parsed.settings) parsed.settings = initialSettings;
  if (!parsed.formTemplates) parsed.formTemplates = initialData.formTemplates;
  return parsed;
};

export const fetchStoreFromFirestore = async (): Promise<AppState | null> => {
  try {
    const docRef = doc(db, "prop_lifecycle", FIRESTORE_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppState;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch state from Firestore:", error);
    return null;
  }
};

export const saveStore = async (state: AppState): Promise<boolean> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  try {
    const stateToSave = JSON.parse(JSON.stringify(state));
    await setDoc(doc(db, "prop_lifecycle", FIRESTORE_DOC_ID), stateToSave, { merge: true });
    return true;
  } catch (error) {
    console.error("Firebase sync failed:", error);
    return false;
  }
};

// --- CORRECT saveUser LOGIC ---
export const saveUser = async (user: Omit<User, 'displayId'> & { displayId?: string }): Promise<boolean> => {
  const store = getStore();
  const userIndex = store.users.findIndex(u => u.id === user.id);

  if (userIndex > -1) {
    // User exists: Preserve their original displayId on update.
    const existingUser = store.users[userIndex];
    store.users[userIndex] = { ...user, displayId: existingUser.displayId };
  } else {
    // New user: Generate a brand new, user-friendly displayId.
    const existingIds = store.users.map(u => u.displayId);
    const newDisplayId = generateDisplayId(user.role, existingIds);
    const newUserWithId = { ...user, displayId: newDisplayId } as User;
    store.users.unshift(newUserWithId);
  }

  return await saveStore(store);
};
// --- END ---

const generateGenericDisplayId = (prefix: string, existingIds: string[]): string => {
    let newId = '';
    let isUnique = false;
    while (!isUnique) {
        newId = `${prefix}-${generateSecureAlphanumeric(6)}`;
        if (!existingIds.includes(newId)) {
            isUnique = true;
        }
    }
    return newId;
}

export const saveProperty = async (property: Omit<Property, 'id' | 'displayId'>): Promise<boolean> => {
    const store = getStore();
    const existingIds = store.properties.map(p => p.displayId);
    const newDisplayId = generateGenericDisplayId('PROP', existingIds);
    const newProperty: Property = {
        ...property,
        id: crypto.randomUUID(),
        displayId: newDisplayId,
    };
    store.properties.unshift(newProperty);
    return await saveStore(store);
};

export const saveMaintenanceRequest = async (request: Omit<MaintenanceTicket, 'id' | 'displayId' | 'status' | 'createdAt'>): Promise<boolean> => {
    const store = getStore();
    const existingIds = store.tickets.map(r => r.displayId);
    const newDisplayId = generateGenericDisplayId('REQ', existingIds);
    const newRequest: MaintenanceTicket = {
        ...request,
        id: crypto.randomUUID(),
        displayId: newDisplayId,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    store.tickets.unshift(newRequest);
    return await saveStore(store);
};

export const saveApplication = async (application: Omit<TenantApplication, 'id' | 'displayId' | 'status' | 'createdAt'>): Promise<boolean> => {
    const store = getStore();
    const existingIds = store.applications.map(a => a.displayId);
    const newDisplayId = generateGenericDisplayId('APP', existingIds);
    const newApplication: TenantApplication = {
        ...application,
        id: crypto.randomUUID(),
        displayId: newDisplayId,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    store.applications.unshift(newApplication);
    return await saveStore(store);
};

export const initFirebaseSync = (
  onUpdate: (newState: AppState) => void,
  onError: (error: Error) => void,
) => {
  const docRef = doc(db, "prop_lifecycle", FIRESTORE_DOC_ID);
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const newState = doc.data() as AppState;
      onUpdate(newState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } else {
      saveStore(getStore());
    }
  }, (error) => {
    console.error("Firebase connection error:", error);
    onError(error);
  });
  return unsubscribe;
};

export const formatCurrency = (amount: number, settings: UserSettings): string => {
  const rates = { NGN: 1, USD: 0.00065, EUR: 0.0006 };
  const converted = amount * rates[settings.localization.currency];
  return new Intl.NumberFormat("en-US", { style: "currency", currency: settings.localization.currency, minimumFractionDigits: settings.localization.currency === "NGN" ? 0 : 2 }).format(converted);
};

export const formatDate = (dateString: string, settings: UserSettings): string => {
  if (!dateString || dateString === "---") return "---";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return settings.localization.dateFormat === "DD/MM/YYYY" ? `${day}/${month}/${year}` : `${month}/${day}/${year}`;
};
