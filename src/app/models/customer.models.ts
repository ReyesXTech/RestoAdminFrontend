import { AddressDto } from './common.models';

// Respuesta para GetById y GetByPhone
export interface CustomerResponse {
  id: string;
  fullName: string;
  phone: string;
  address: AddressDto;
  formattedAddress: string;
}

// Respuesta para GetAll (resumida)
export interface CustomerDto {
  id: string;
  fullName: string;
  phone: string;
  defaultAddress: string; // dirección formateada
  orderCount: Int16Array;
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
  address: AddressDto;
}

export interface UpdateCustomerCommand {
  id: string;
  fullName: string;
  phone: string;
  address: AddressDto;
}
