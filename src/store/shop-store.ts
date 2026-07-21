import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  sku: string;
  shipping_charge?: number;
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
  addToCart: (product: any, suppressToast?: boolean) => void;
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

      addToCart: (product, suppressToast = false) => {
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
                price: Number(product.selling_price || product.price || 0),
                quantity: 1,
                image: product.featured_image || product.image || null,
                sku: product.sku || product.id,
                shipping_charge: product.shipping_charge !== undefined && product.shipping_charge !== null ? Number(product.shipping_charge) : undefined,
              },
            ],
          });
        }
        if (!suppressToast) {
          toast.success(`"${product.name}" added to cart!`, {
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              fontSize: "12px",
              fontWeight: "bold",
            }
          });
        }
      },

      removeFromCart: (id) => {
        const item = get().cart.find(i => i.id === id);
        set({ cart: get().cart.filter((item) => item.id !== id) });
        if (item) {
          toast.error(`"${item.name}" removed from cart.`, {
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              fontSize: "12px",
              fontWeight: "bold",
            }
          });
        }
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

      clearCart: () => {
        set({ cart: [] });
        toast.success("Cart cleared", {
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            fontSize: "12px",
            fontWeight: "bold",
          }
        });
      },

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
          toast.success(`"${product.name}" added to wishlist!`, {
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              fontSize: "12px",
              fontWeight: "bold",
            }
          });
        }
      },

      removeFromWishlist: (id) => {
        const item = get().wishlist.find(i => i.id === id);
        set({ wishlist: get().wishlist.filter((item) => item.id !== id) });
        if (item) {
          toast.error(`"${item.name}" removed from wishlist.`, {
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              fontSize: "12px",
              fontWeight: "bold",
            }
          });
        }
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
