import { Currency, ProductCategory, PagedResult } from './common.models';

// ------------------- Crear producto -------------------
export interface CreateProductCommand {
  name: string;
  description: string;
  detailedDescription: string;
  priceAmount: number;
  priceCurrency: Currency;
  category: ProductCategory;
  imageUrl?: string | null;
}

// ------------------- Obtener producto por ID -------------------
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  priceAmount: number;
  priceCurrency: Currency;
  category: ProductCategory;
  imageUrl?: string | null;
  isActive: boolean;
}

// ------------------- Lista paginada / scroll -------------------
export interface GetProductsScrollQuery {
  page: number;
  pageSize: number;
  searchTerm?: string;
  category?: ProductCategory;
  isActive?: boolean;
}

// ------------------- Actualizar producto -------------------
export interface UpdateProductCommand {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  priceAmount: number;
  priceCurrency: Currency;
  category: ProductCategory;
  imageUrl?: string | null;
  isActive?: boolean | null;
}

// ------------------- NUEVOS comandos -------------------
export interface DeleteProductCommand {
  id: string;
}

export interface ToggleProductStatusCommand {
  id: string;
  isActive: boolean;
}
