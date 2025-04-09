// src/types/categories.ts
export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}