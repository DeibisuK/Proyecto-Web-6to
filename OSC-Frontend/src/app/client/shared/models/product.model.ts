export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  brand: string;
  images: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  rating: number;
  reviews: number;
  featured: boolean;
  discount?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
}