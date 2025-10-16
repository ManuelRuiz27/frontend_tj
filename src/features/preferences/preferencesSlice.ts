import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Language = 'es' | 'en';
export type Theme = 'light' | 'dark';

export interface PreferencesState {
  language: Language;
  theme: Theme;
  notificationsEnabled: boolean;
}

const STORAGE_KEY = 'tj_preferences';

const defaultState: PreferencesState = {
  language: 'es',
  theme: 'light',
  notificationsEnabled: true,
};

export const loadPreferences = (): PreferencesState => {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<PreferencesState>;
    return {
      ...defaultState,
      ...parsed,
    };
  } catch (error) {
    console.warn('Unable to parse preferences, restoring defaults', error);
    return defaultState;
  }
};

export const persistPreferences = (state: PreferencesState) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: defaultState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
  },
});

export const { setLanguage, setTheme, setNotificationsEnabled } = preferencesSlice.actions;

export default preferencesSlice.reducer;
