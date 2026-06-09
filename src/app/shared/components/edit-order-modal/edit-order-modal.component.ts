import { Component, inject, input, output, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrdersService } from '../../../services/orders.service';
import { ToastService } from '../../../services/toast.service';
import { MenuService } from '../../../services/menu.service';
import {
  UpdateOrderCommand,
  UpdateOrderItemDto,
  OrderDetailResponse,
} from '../../../models/order.models';
import { AddressDto } from '../../../models/';
import { ProductResponse } from '../../../models/product.models';
import { Subscription, map, startWith, Observable, of } from 'rxjs';

@Component({
  selector: 'app-edit-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-order-modal.component.html',
  styleUrls: ['./edit-order-modal.component.scss'],
})
export class EditOrderModalComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private ordersService = inject(OrdersService);
  private toastService = inject(ToastService);
  private menuService = inject(MenuService);

  orderId = input.required<string>();
  close = output<void>();
  updated = output<void>();

  readonly countryCodes = [
    { code: '+53', name: 'Cuba' },
    { code: '+1', name: 'EE.UU./Canadá' },
    { code: '+34', name: 'España' },
    { code: '+52', name: 'México' },
    { code: '+54', name: 'Argentina' },
  ];

  readonly availableProducts = this.menuService.products;

  private searchSubscriptions: Subscription[] = [];
  filteredOptionsMap: Map<number, Observable<ProductResponse[]>> = new Map();

  openDropdownIndex: number | null = null;
  isLoading = signal(false);
  originalOrder: OrderDetailResponse | null = null;

  orderForm = this.fb.group({
    clientName: ['', Validators.required],
    phoneCountryCode: ['+53', Validators.required],
    phoneNationalNumber: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
    city: ['', Validators.maxLength(100)],
    municipality: ['', Validators.required],
    street: ['', Validators.required],
    additionalInfo: [''],
    desiredDeliveryTimeAtLocal: ['', Validators.required],
    items: this.fb.array([]),
  });

  constructor() {
    this.menuService.loadProducts({ isActive: true });
  }

  ngOnInit(): void {
    this.loadOrder();
  }

  ngOnDestroy(): void {
    this.searchSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  private async loadOrder(): Promise<void> {
    this.isLoading.set(true);
    try {
      const order = await this.ordersService.getOrderById(this.orderId());
      this.originalOrder = order;
      this.patchFormWithOrder(order);
      this.initializeComboboxes();
    } catch (error) {
      this.toastService.show('Error al cargar el pedido', 'error');
      this.onClose();
    } finally {
      this.isLoading.set(false);
    }
  }

  private patchFormWithOrder(order: OrderDetailResponse): void {
    // Teléfono: separar código de país y número
    const phoneInfo = this.parsePhone(order.phone);
    this.orderForm.patchValue({
      clientName: order.clientName,
      phoneCountryCode: phoneInfo.countryCode,
      phoneNationalNumber: phoneInfo.nationalNumber,
      desiredDeliveryTimeAtLocal: this.formatDateForInput(order.desiredDeliveryTimeAtLocal),
      city: order.deliveryAddress.city,
      municipality: order.deliveryAddress.municipality,
      street: order.deliveryAddress.street,
      additionalInfo: order.deliveryAddress.additionalInfo ?? '',
    });

    // Rellenar ítems
    const itemsArray = this.orderForm.get('items') as FormArray;
    itemsArray.clear();
    order.items.forEach((item) => {
      const group = this.fb.group({
        productId: [item.productId, Validators.required],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]],
        searchControl: [item.productName],
      });
      itemsArray.push(group);
    });
    if (itemsArray.length === 0) {
      this.addItem(); // Asegurar al menos un ítem
    }
  }

  private parsePhone(phone: string): { countryCode: string; nationalNumber: string } {
    const matchedCode = this.countryCodes.find((c) => phone.startsWith(c.code));
    if (matchedCode) {
      // Extraemos el número nacional y le quitamos los espacios
      const rawNational = phone.substring(matchedCode.code.length).replace(/\s/g, '');
      return {
        countryCode: matchedCode.code,
        nationalNumber: rawNational,
      };
    }
    // Fallback: limpiamos todo el string y asumimos código +53
    const cleanPhone = phone.replace(/\s/g, '');
    return { countryCode: '+53', nationalNumber: cleanPhone };
  }

  private formatDateForInput(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private initializeComboboxes(): void {
    this.itemsArray.controls.forEach((_, index) => {
      this.setupItemCombobox(index);
    });
  }

  private setupItemCombobox(index: number): void {
    const itemGroup = this.itemsArray.at(index) as FormGroup;
    if (!itemGroup.contains('searchControl')) {
      itemGroup.addControl('searchControl', new FormControl(''));
    }
    const searchControl = itemGroup.get('searchControl') as FormControl;
    const filtered$ = searchControl.valueChanges.pipe(
      startWith(searchControl.value),
      map((term) => this.filterProducts(term || '')),
    );
    this.filteredOptionsMap.set(index, filtered$);
  }

  private filterProducts(searchTerm: string): ProductResponse[] {
    const term = searchTerm.toLowerCase().trim();
    const products = this.availableProducts();
    if (!term) return products.slice(0, 20);
    return products
      .filter(
        (p) => p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term),
      )
      .slice(0, 20);
  }

  get itemsArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      searchControl: [''],
    });
  }

  addItem(): void {
    const newGroup = this.createItem();
    this.itemsArray.push(newGroup);
    const newIndex = this.itemsArray.length - 1;
    this.setupItemCombobox(newIndex);
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
    this.filteredOptionsMap.delete(index);
    const newMap = new Map<number, Observable<ProductResponse[]>>();
    this.filteredOptionsMap.forEach((value, key) => {
      if (key < index) newMap.set(key, value);
      else if (key > index) newMap.set(key - 1, value);
    });
    this.filteredOptionsMap = newMap;
  }

  onComboboxFocus(index: number): void {
    this.openDropdownIndex = index;
  }

  onComboboxBlur(index: number): void {
    setTimeout(() => {
      if (this.openDropdownIndex === index) this.openDropdownIndex = null;
    }, 200);
  }

  isDropdownOpen(index: number): boolean {
    return this.openDropdownIndex === index;
  }

  onProductSelected(index: number, product: ProductResponse): void {
    const itemGroup = this.itemsArray.at(index) as FormGroup;
    itemGroup.patchValue({ productId: product.id });
    const searchControl = itemGroup.get('searchControl') as FormControl;
    searchControl.setValue(product.name, { emitEvent: false });
    this.openDropdownIndex = null;
  }

  getFilteredOptions(index: number): Observable<ProductResponse[]> {
    return this.filteredOptionsMap.get(index) || of([]);
  }

  private getFullPhoneNumber(): string {
    const code = this.orderForm.get('phoneCountryCode')?.value || '';
    const number = this.orderForm.get('phoneNationalNumber')?.value || '';
    return code + number;
  }

  async onSubmit(): Promise<void> {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.value;
    const items = (formValue.items ?? []) as any[];

    const address: AddressDto = {
      city: formValue.city!,
      municipality: formValue.municipality!,
      street: formValue.street!,
      additionalInfo: formValue.additionalInfo || null,
    };

    const command: UpdateOrderCommand = {
      orderId: this.orderId(),
      clientName: formValue.clientName!,
      phone: this.getFullPhoneNumber(),
      deliveryAddress: address,
      desiredDeliveryTimeAtLocal: formValue.desiredDeliveryTimeAtLocal!,
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      await this.ordersService.updateOrder(command);
      this.toastService.show('Pedido actualizado exitosamente', 'success');
      this.updated.emit();
      this.onClose();
    } catch (error) {
      this.toastService.show('Error al actualizar el pedido', 'error');
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
