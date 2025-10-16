import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { catalogApi } from './features/catalog/catalogSlice';
import preferencesReducer, {
  loadPreferences,
  persistPreferences,
} from './features/preferences/preferencesSlice';

const preloadedState = typeof window !== 'undefined'
  ? { preferences: loadPreferences() }
  : undefined;

export const store = configureStore({
  reducer: {
    [catalogApi.reducerPath]: catalogApi.reducer,
    preferences: preferencesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(catalogApi.middleware),
  preloadedState,
});

setupListeners(store.dispatch);

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState();
    persistPreferences(state.preferences);
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
