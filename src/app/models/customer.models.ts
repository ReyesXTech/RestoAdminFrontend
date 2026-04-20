import { AddressDto } from './common.models';

// Respuesta para GetById y GetByPhone
export interface CustomerResponse {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  municipality: string;
  mainStreet: string;
  street1: string;
  street2?: string | null;
  houseNumber: string;
  apartmentNumber?: string | null;
  additionalInfo?: string | null;
}

// Respuesta para GetAll (resumida)
export interface CustomerDto {
  id: string;
  fullName: string;
  phone: string;
  defaultAddress: string; // dirección formateada
}

// Queries (normalmente vacías o con parámetros)
export interface GetAllCustomersQuery {} // ← añadido
export interface GetCustomerByIdQuery {
  id: string;
}
export interface GetCustomerByPhoneQuery {
  phone: string;
}

// Comandos (ya los tenías)
export interface CreateCustomerCommand {
  fullName: string;
  phone: string;
  city: string;
  municipality: string;
  mainStreet: string;
  street1: string;
  street2?: string | null;
  houseNumber: string;
  apartmentNumber?: string | null;
  additionalInfo?: string | null;
}

export interface UpdateCustomerCommand {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  municipality: string;
  mainStreet: string;
  street1: string;
  street2?: string | null;
  houseNumber: string;
  apartmentNumber?: string | null;
  additionalInfo?: string | null;
}
