import { configureStore, createSlice, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authSlice = createSlice({
  name: 'auth',
  initialState: { isAuthenticated: false, isGuest: false },
  reducers: {
    login: state => { state.isAuthenticated = true; state.isGuest = false; },
    guestLogin: state => { state.isAuthenticated = true; state.isGuest = true; },
    logout: state => { state.isAuthenticated = false; state.isGuest = false; },
  },
});

const modeSlice = createSlice({
  name: 'mode',
  initialState: { role: 'candidate' },
  reducers: {
    setRole: (state, action) => { state.role = action.payload },
  },
  extraReducers: (builder) => {
    builder.addCase(authSlice.actions.logout, (state) => {
      state.role = 'candidate';
    });
  },
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: { onboarded: false, data: {} },
  reducers: {
    completeOnboarding: (state, action) => { state.onboarded = true; state.data = action.payload || {} },
    updateProfile: (state, action) => { state.data = { ...state.data, ...action.payload } },
  },
  extraReducers: (builder) => {
    builder.addCase(authSlice.actions.logout, (state) => {
      state.onboarded = false;
      state.data = {};
    });
    builder.addCase(authSlice.actions.guestLogin, (state) => {
      state.onboarded = true;
      state.data = { name: 'Guest User', role: 'candidate' };
    });
  },
});

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'light' },
  reducers: {
    set: (state, action) => { state.mode = action.payload },
  },
});

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  mode: modeSlice.reducer,
  profile: profileSlice.reducer,
  theme: themeSlice.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'mode', 'profile', 'theme'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export const { login, guestLogin, logout } = authSlice.actions;
export const { setRole } = modeSlice.actions;
export const { completeOnboarding, updateProfile } = profileSlice.actions;
export const { set: setTheme } = themeSlice.actions;
