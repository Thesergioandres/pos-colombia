import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  barcode?: string;
  sku?: string;
  salePrice: number;
  stock: number;
  iva: number;
  includesIva: boolean;
  category?: {
    id: string;
    name: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  notes?: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  creditLimit?: number;
  currentDebt?: number;
}

interface PosState {
  cart: CartItem[];
  customer: Customer | null;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'NEQUI' | 'DAVIPLATA' | 'CREDIT';
  cashReceived: number;
  discount: number;
  notes: string;
  isProcessing: boolean;
  
  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  setCustomer: (customer: Customer | null) => void;
  setPaymentMethod: (method: PosState['paymentMethod']) => void;
  setCashReceived: (amount: number) => void;
  setDiscount: (discount: number) => void;
  setNotes: (notes: string) => void;
  setProcessing: (processing: boolean) => void;
  
  // Getters
  getSubtotal: () => number;
  getIva: () => number;
  getTotal: () => number;
  getChange: () => number;
  getItemCount: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  customer: null,
  paymentMethod: 'CASH',
  cashReceived: 0,
  discount: 0,
  notes: '',
  isProcessing: false,

  addToCart: (product: Product, quantity = 1) => {
    set((state) => {
      const existingItem = state.cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      }
      
      return {
        cart: [...state.cart, { product, quantity, discount: 0 }]
      };
    });
  },

  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter(item => item.product.id !== productId)
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    
    set((state) => ({
      cart: state.cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    }));
  },

  updateDiscount: (productId: string, discount: number) => {
    set((state) => ({
      cart: state.cart.map(item =>
        item.product.id === productId
          ? { ...item, discount: Math.max(0, Math.min(discount, 100)) }
          : item
      )
    }));
  },

  clearCart: () => {
    set({
      cart: [],
      customer: null,
      paymentMethod: 'CASH',
      cashReceived: 0,
      discount: 0,
      notes: '',
      isProcessing: false
    });
  },

  setCustomer: (customer: Customer | null) => {
    set({ customer });
  },

  setPaymentMethod: (method: PosState['paymentMethod']) => {
    set({ paymentMethod: method });
  },

  setCashReceived: (amount: number) => {
    set({ cashReceived: amount });
  },

  setDiscount: (discount: number) => {
    set({ discount: Math.max(0, Math.min(discount, 100)) });
  },

  setNotes: (notes: string) => {
    set({ notes });
  },

  setProcessing: (processing: boolean) => {
    set({ isProcessing: processing });
  },

  getSubtotal: () => {
    const state = get();
    return state.cart.reduce((total, item) => {
      const itemTotal = item.product.salePrice * item.quantity;
      const itemDiscount = itemTotal * (item.discount / 100);
      return total + (itemTotal - itemDiscount);
    }, 0);
  },

  getIva: () => {
    const state = get();
    return state.cart.reduce((total, item) => {
      const itemTotal = item.product.salePrice * item.quantity;
      const itemDiscount = itemTotal * (item.discount / 100);
      const finalItemTotal = itemTotal - itemDiscount;
      
      if (item.product.includesIva) {
        return total + (finalItemTotal * (item.product.iva / 100));
      }
      return total;
    }, 0);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const iva = get().getIva();
    const globalDiscount = subtotal * (get().discount / 100);
    return subtotal + iva - globalDiscount;
  },

  getChange: () => {
    const total = get().getTotal();
    const cashReceived = get().cashReceived;
    return Math.max(0, cashReceived - total);
  },

  getItemCount: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  }
}));