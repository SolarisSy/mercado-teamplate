export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  weight?: number;
  unit?: string;
  brand?: string;
  isOrganic?: boolean;
  nutritionalInfo?: NutritionalInfo;
  expiryDate?: Date;
  origin?: string;
  discount?: number;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>; 