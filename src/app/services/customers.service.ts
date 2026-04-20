import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateCustomerCommand,
  CustomerResponse,
  CustomerDto,
  UpdateCustomerCommand,
  GetCustomerByIdQuery,
  GetCustomerByPhoneQuery,
} from '../models';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _customers = signal<CustomerDto[]>([]);
  readonly customers = this._customers.asReadonly();

  loadAllCustomers(): void {
    firstValueFrom(this.http.get<CustomerDto[]>(`${this.apiUrl}/customers`))
      .then((data) => this._customers.set(data))
      .catch((err) => console.error('Error loading customers', err));
  }

  getCustomerById(query: GetCustomerByIdQuery): Promise<CustomerResponse> {
    return firstValueFrom(this.http.get<CustomerResponse>(`${this.apiUrl}/customers/${query.id}`));
  }

  getCustomerByPhone(query: GetCustomerByPhoneQuery): Promise<CustomerResponse> {
    return firstValueFrom(
      this.http.get<CustomerResponse>(`${this.apiUrl}/customers/by-phone/${query.phone}`),
    );
  }

  createCustomer(command: CreateCustomerCommand): Promise<string> {
    return firstValueFrom(this.http.post<string>(`${this.apiUrl}/customers`, command));
  }

  updateCustomer(command: UpdateCustomerCommand): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.apiUrl}/customers/${command.id}`, command));
  }
}
