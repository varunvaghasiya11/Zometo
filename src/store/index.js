import { configureStore,combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { persistReducer,persistStore } from 'redux-persist';

const costomStorage = {
  getItem : (key)=> {
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem : (key,value)=> {
    return Promise.resolve(localStorage.setItem(key,value));
  },
  removeItem : (key)=> {
    return Promise.resolve(localStorage.removeItem(key));
  }
}; 

const persistConfig = {
  key : "Zometo",
  storage: costomStorage,
}

const rootReducer = combineReducers({
  auth : authReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware : (getDefaultMiddleware )=> 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

