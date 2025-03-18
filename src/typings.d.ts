interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  popularity: number;
  featured: boolean;
  image: string;
  images?: Array<{
    id: string;
    url: string;
    isPrimary?: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
  weight?: number;
  unit?: string; // kg, g, ml, L, unidade
  brand?: string;
  isOrganic?: boolean;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sodium?: number;
  };
  expiryDate?: string;
  origin?: string;
  discount?: number;
}

interface ProductInCart extends Product {
  id: string;
  quantity: number;
  stock: number;
}

interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: string;
  password: string;
}

interface Order {
  id: number;
  orderStatus: string;
  orderDate: string;
  data: {
    email: string;
  };
  products: ProductInCart[];
  subtotal: number;
  user: {
    email: string;
    id: number;
  };
}

interface CartState {
  cartItems: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    weight?: number;
    unit?: string;
  }>;
  totalAmount: number;
}

interface CarouselBanner {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  active: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}
