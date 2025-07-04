// Storage keys
const LEADS_STORAGE_KEY = 'agency-crm-leads';
const CLIENTS_STORAGE_KEY = 'agency-crm-clients';
const PROJECTS_STORAGE_KEY = 'agency-crm-projects';
const PERSONNEL_STORAGE_KEY = 'agency-crm-personnel';
const POSITIONS_STORAGE_KEY = 'agency-crm-positions';
const TASKS_STORAGE_KEY = 'agency-crm-tasks';
const INTERN_TASKS_STORAGE_KEY = 'agency-crm-intern-tasks';

// Generic type-safe get function
export function getFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item from storage: ${error}`);
    return null;
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

// --- Leads ---
export function getLeads() {
  return getFromStorage<any[]>(LEADS_STORAGE_KEY);
}
export function setLeads(leads: any[]) {
  setToStorage(LEADS_STORAGE_KEY, leads);
}

// --- Clients ---
export function getClients() {
  return getFromStorage<any[]>(CLIENTS_STORAGE_KEY);
}
export function setClients(clients: any[]) {
  setToStorage(CLIENTS_STORAGE_KEY, clients);
}

// --- Projects ---
export function getProjects() {
  return getFromStorage<any[]>(PROJECTS_STORAGE_KEY);
}
export function setProjects(projects: any[]) {
  setToStorage(PROJECTS_STORAGE_KEY, projects);
}

// --- Personnel ---
export function getPersonnel() {
  return getFromStorage<any[]>(PERSONNEL_STORAGE_KEY);
}
export function setPersonnel(personnel: any[]) {
  setToStorage(PERSONNEL_STORAGE_KEY, personnel);
}

// --- Positions ---
export function getPositions() {
  return getFromStorage<string[]>(POSITIONS_STORAGE_KEY);
}
export function setPositions(positions: string[]) {
  setToStorage(POSITIONS_STORAGE_KEY, positions);
}

// --- Tasks ---
export function getTasks() {
  return getFromStorage<any[]>(TASKS_STORAGE_KEY);
}
export function setTasks(tasks: any[]) {
  setToStorage(TASKS_STORAGE_KEY, tasks);
}

// --- Intern Tasks ---
export function getInternTasks() {
  return getFromStorage<any[]>(INTERN_TASKS_STORAGE_KEY);
}
export function setInternTasks(tasks: any[]) {
  setToStorage(INTERN_TASKS_STORAGE_KEY, tasks);
}