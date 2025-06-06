import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

interface ProductInCart {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  category?: string;
  stock?: number;
  // Campos específicos para supermercado
  weight?: number;
  unit?: string;
  brand?: string;
  isOrganic?: boolean;
  discount?: number;
}

interface CartState {
  cartItems: ProductInCart[];
  totalAmount: number;
}

const initialState: CartState = {
  cartItems: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<ProductInCart>) => {
      const product = action.payload;
      const existingProduct = state.cartItems.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        existingProduct.quantity += product.quantity;
        toast.success("Quantidade atualizada no carrinho");
      } else {
        state.cartItems.push(product);
        toast.success("Produto adicionado ao carrinho");
      }

      // Recalcular o valor total considerando descontos
      state.totalAmount = state.cartItems.reduce(
        (total, item) => {
          const price = item.discount 
            ? item.price * (1 - (item.discount / 100)) 
            : item.price;
          return total + price * item.quantity;
        },
        0
      );
    },
    
    removeProductFromTheCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.id !== productId);
      
      // Recalcular o valor total
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
    
    updateProductQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const product = state.cartItems.find((item) => item.id === id);
      
      if (product) {
        product.quantity = quantity;
      }
      
      // Recalcular o valor total
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
    
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    },
  },
});

export const {
  addToCart,
  removeProductFromTheCart,
  updateProductQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer; 