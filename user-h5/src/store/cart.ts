export type CartItem = {
  id: number;
  name: string;
  salePrice: number;
  imageUrl?: string;
  quantity: number;
};

const CART_KEY = "shoppingCart";
export const CART_UPDATED_EVENT = "cart:updated";

export function getCart(): CartItem[] {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveCart(list: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function addToCart(product: Omit<CartItem, "quantity">) {
  const list = getCart();
  const found = list.find((item) => item.id === product.id);
  if (found) {
    found.quantity += 1;
  } else {
    list.push({ ...product, quantity: 1 });
  }
  saveCart(list);
}

export function updateCartItemQuantity(id: number, quantity: number) {
  const list = getCart();
  const nextList = list
    .map((item) => (item.id === id ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  saveCart(nextList);
}

export function clearCart() {
  saveCart([]);
}
