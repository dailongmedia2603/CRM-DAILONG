// Storage keys
const LEADS_STORAGE_KEY = 'agency-crm-leads';

// Generic type-safe get function
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from storage: ${error}`);
    return defaultValue;
  }
}

// Generic type-safe set function
export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item to storage: ${error}`);
  }
}

// Get leads from storage
export function getLeads() {
  return getFromStorage(LEADS_STORAGE_KEY, []);
}

// Set leads to storage
export function setLeads(leads: any[]) {
  setToStorage(LEADS_STORAGE_KEY, leads);
}

// Update a specific lead in storage
export function updateLead(leadId: string, updatedLead: any) {
  const leads = getLeads();
  const index = leads.findIndex((lead: any) => lead.id === leadId);
  
  if (index !== -1) {
    leads[index] = updatedLead;
    setLeads(leads);
    return true;
  }
  
  return false;
}