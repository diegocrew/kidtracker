
import { AppState, Profile } from '../types';
import { toLocalISOString } from '../utils';

const STORAGE_KEY = 'kidcare_tracker_v2';

const DEFAULT_PROFILE: Profile = {
  id: 'p1',
  name: 'Alex',
  avatarColor: 'bg-blue-400',
};

const DEFAULT_STATE: AppState = {
  profiles: [DEFAULT_PROFILE],
  logs: {},
  currentProfileId: 'p1',
};

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return DEFAULT_STATE;
    return JSON.parse(serialized);
  } catch (e) {
    console.error('Failed to load state', e);
    return DEFAULT_STATE;
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

// Helper to generate demo data
export const generateDemoData = (): AppState => {
  const profileId = 'p1';
  const logs: Record<string, any> = {};
  
  const today = new Date();
  
  const addEpisode = (start: Date, duration: number, symptoms: string[]) => {
    for (let i = 0; i < duration; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateKey = toLocalISOString(d); // Use local date string
      
      logs[dateKey] = {
        date: dateKey,
        symptoms: symptoms,
        medications: i < 3 ? [{ name: 'Ibuprofen', dosage: '5ml' }] : [],
        temperatures: i === 0 
          ? [{ time: '09:00', value: 38.5 }, { time: '14:00', value: 39.1 }] 
          : i === 1 ? [{ time: '10:00', value: 37.8 }] : [],
      };
    }
  };

  // Episode 1: 4 months ago
  const d1 = new Date(today); d1.setMonth(d1.getMonth() - 4);
  addEpisode(d1, 5, ['Fever', 'Cough']);

  // Episode 2: 2 months ago
  const d2 = new Date(today); d2.setMonth(d2.getMonth() - 2);
  addEpisode(d2, 3, ['Runny Nose']);

  // Episode 3: 2 weeks ago
  const d3 = new Date(today); d3.setDate(d3.getDate() - 14);
  addEpisode(d3, 4, ['Fever', 'Vomiting']);

  return {
    ...DEFAULT_STATE,
    logs: { [profileId]: logs }
  };
};
