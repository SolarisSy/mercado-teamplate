import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import shopReducer from "./features/shop/shopSlice";
import authReducer from "./features/auth/authSlice";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage por padrão
import { combineReducers } from '@reduxjs/toolkit';

// Configuração da persistência
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart'], // Apenas o reducer do carrinho será persistido
};

// Combinar os reducers
const rootReducer = combineReducers({
  cart: cartReducer,
  shop: shopReducer,
  auth: authReducer
});

// Criar o reducer persistente
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurar a store com o reducer persistente
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar ações do redux-persist para evitar warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Criar o persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
