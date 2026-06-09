import { Component, inject, output, signal, computed, OnInit, OnDestroy } from '@angular/core';
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
import { CreateOrderCommand, CreateOrderItemDto } from '../../../models/order.models';
import { ProductCategory } from '../../../models/common.models';
import { ProductResponse } from '../../../models/product.models';
import { Subscription, combineLatest, map, startWith, Observable, of } from 'rxjs';

@Component({
  selector: 'app-create-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-order-modal.component.html',
  styleUrls: ['./create-order-modal.component.scss'],
})
export class CreateOrderModalComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private ordersService = inject(OrdersService);
  private toastService = inject(ToastService);
  private menuService = inject(MenuService);

  close = output<void>();
  created = output<void>();

  readonly countryCodes = [
    { code: '+53', name: 'Cuba' },
    { code: '+1', name: 'EE.UU./Canadá' },
    { code: '+34', name: 'España' },
    { code: '+52', name: 'México' },
    { code: '+54', name: 'Argentina' },
  ];

  categories = Object.entries(ProductCategory)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ name: key, value: value as number }));

  readonly availableProducts = this.menuService.products;

  private searchSubscriptions: Subscription[] = [];
  filteredOptionsMap: Map<number, Observable<ProductResponse[]>> = new Map();

  // Estado para controlar qué dropdown está abierto
  openDropdownIndex: number | null = null;

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
    this.addItem(); // Agregar un item inicial
  }

  ngOnInit(): void {
    this.initializeComboboxes();
  }

  ngOnDestroy(): void {
    this.searchSubscriptions.forEach((sub) => sub.unsubscribe());
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
      startWith(''),
      map((searchTerm) => this.filterProducts(searchTerm || '')),
    );

    this.filteredOptionsMap.set(index, filtered$);
  }

  private filterProducts(searchTerm: string): ProductResponse[] {
    const term = searchTerm.toLowerCase().trim();
    const products = this.availableProducts();
    if (!term) {
      return products.slice(0, 20);
    }

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
    const group = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      searchControl: [''],
    });
    return group;
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
    // Reconstruir el mapa para los índices posteriores
    const newMap = new Map<number, Observable<ProductResponse[]>>();
    this.filteredOptionsMap.forEach((value, key) => {
      if (key < index) {
        newMap.set(key, value);
      } else if (key > index) {
        newMap.set(key - 1, value);
      }
    });
    this.filteredOptionsMap = newMap;
  }

  onComboboxFocus(index: number): void {
    this.openDropdownIndex = index;
  }

  onComboboxBlur(index: number): void {
    setTimeout(() => {
      if (this.openDropdownIndex === index) {
        this.openDropdownIndex = null;
      }
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
    this.openDropdownIndex = null; // Cerrar dropdown después de seleccionar
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

    // Garantizar que items existe (TypeScript no puede inferirlo, usamos fallback)
    const items = (formValue.items ?? []) as any[];

    const command: CreateOrderCommand = {
      clientName: formValue.clientName!,
      phone: this.getFullPhoneNumber(),
      deliveryAddress: {
        city: formValue.city!,
        municipality: formValue.municipality!,
        street: formValue.street!,
        additionalInfo: formValue.additionalInfo || null,
      },
      desiredDeliveryTimeAtLocal: formValue.desiredDeliveryTimeAtLocal!,
      items: items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      await this.ordersService.createOrder(command);
      this.toastService.show('Pedido creado exitosamente', 'success');
      this.created.emit();
      this.onClose();
    } catch (error) {
      this.toastService.show('Error al crear el pedido', 'error');
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
