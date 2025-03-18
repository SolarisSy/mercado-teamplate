export interface ProductSize {
  name: string;
  available: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: ProductImage[];
  image?: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  popularity: number;
  stock: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
} 