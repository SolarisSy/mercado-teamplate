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
  sizes?: Array<{
    name: string;
    available: boolean;
  }>;
  colors?: Array<{
    name: string;
    hex: string;
    available: boolean;
  }>;
}

interface ProductInCart extends Product {
  id: string;
  quantity: number;
  size: string;
  color: string;
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
    size?: string;
    color?: string;
  }>;
  totalAmount: number;
}
