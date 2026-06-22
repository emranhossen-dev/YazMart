import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  sku: string;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  sku: string;
}

interface ShopState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: any) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (product: any) => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      addToCart: (product) => {
        const cart = get().cart;
        const existing = cart.find((item) => item.id === product.id);

        if (existing) {
          set({
            cart: cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + 1, product.current_stock || 99) }
                : item
            ),
          });
        } else {
          set({
            cart: [
              ...cart,
              {
                id: product.id,
                name: product.name,
                price: Number(product.selling_price),
                quantity: 1,
                image: product.featured_image || null,
                sku: product.sku,
              },
            ],
          });
        }
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      addToWishlist: (product) => {
        const wishlist = get().wishlist;
        const exists = wishlist.some((item) => item.id === product.id);
        if (!exists) {
          set({
            wishlist: [
              ...wishlist,
              {
                id: product.id,
                name: product.name,
                price: Number(product.selling_price),
                image: product.featured_image || null,
                sku: product.sku,
              },
            ],
          });
        }
      },

      removeFromWishlist: (id) => {
        set({ wishlist: get().wishlist.filter((item) => item.id !== id) });
      },

      toggleWishlist: (product) => {
        const wishlist = get().wishlist;
        const exists = wishlist.some((item) => item.id === product.id);
        if (exists) {
          get().removeFromWishlist(product.id);
        } else {
          get().addToWishlist(product);
        }
      },
    }),
    {
      name: 'yazmart-shop-storage',
    }
  )
);
