// Storage keys
const LEADS_STORAGE_KEY = 'agency-crm-leads';
const CLIENTS_STORAGE_KEY = 'agency-crm-clients';
const PROJECTS_STORAGE_KEY = 'agency-crm-projects';

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

// Get projects from storage
export function getProjects() {
  return getFromStorage(PROJECTS_STORAGE_KEY, []);
}

// Set projects to storage
export function setProjects(projects: any[]) {
  setToStorage(PROJECTS_STORAGE_KEY, projects);
}

// Get clients from storage
export function getClients() {
  return getFromStorage(CLIENTS_STORAGE_KEY, []);
}

// Set clients to storage
export function setClients(clients: any[]) {
  setToStorage(CLIENTS_STORAGE_KEY, clients);
}