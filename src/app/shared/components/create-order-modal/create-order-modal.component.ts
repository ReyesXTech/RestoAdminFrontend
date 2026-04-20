import { Component, inject, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrdersService } from '../../../services/orders.service';
import { ToastService } from '../../../services/toast.service';
import { MenuService } from '../../../services/menu.service';
import { CreateOrderCommand, CreateOrderItemDto } from '../../../models/order.models';
import { ProductCategory } from '../../../models/common.models';

@Component({
  selector: 'app-create-order-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-order-modal.component.html',
  styleUrls: ['./create-order-modal.component.scss'],
})
export class CreateOrderModalComponent {
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

  selectedCategory = signal<ProductCategory | 'all'>('all');

  readonly availableProducts = this.menuService.products;

  // Productos filtrados por categoría seleccionada
  readonly productsByCategory = computed(() => {
    const cat = this.selectedCategory();
    const products = this.availableProducts();
    if (cat === 'all') return products;
    return products.filter((p) => p.category === cat);
  });

  constructor() {
    this.menuService.loadProducts({ isActive: true });
  }

  onCategoryChange(categoryValue: string) {
    const cat = categoryValue ? (Number(categoryValue) as ProductCategory) : 'all';
    this.selectedCategory.set(cat);
  }

  orderForm = this.fb.group({
    clientName: ['', Validators.required],
    phoneCountryCode: ['+53', Validators.required],
    phoneNationalNumber: ['', [Validators.required, Validators.pattern(/^\d{6,12}$/)]],
    city: ['', Validators.required],
    municipality: ['', Validators.required],
    mainStreet: ['', Validators.required],
    street1: ['', Validators.required],
    street2: [''],
    houseNumber: ['', Validators.required],
    apartmentNumber: [''],
    additionalInfo: [''],
    desiredDeliveryTimeUtc: ['', Validators.required],
    items: this.fb.array([this.createItem()]),
  });

  private getFullPhoneNumber(): string {
    const code = this.orderForm.get('phoneCountryCode')?.value || '';
    const number = this.orderForm.get('phoneNationalNumber')?.value || '';
    return code + number;
  }

  get itemsArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  createItem() {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addItem() {
    this.itemsArray.push(this.createItem());
  }

  removeItem(index: number) {
    this.itemsArray.removeAt(index);
  }

  async onSubmit() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.value;

    const command: CreateOrderCommand = {
      clientName: formValue.clientName!,
      phone: this.getFullPhoneNumber(),
      city: formValue.city!,
      municipality: formValue.municipality!,
      mainStreet: formValue.mainStreet!,
      street1: formValue.street1!,
      street2: formValue.street2 || null,
      houseNumber: formValue.houseNumber!,
      apartmentNumber: formValue.apartmentNumber || null,
      additionalInfo: formValue.additionalInfo || null,
      desiredDeliveryTimeUtc: new Date(formValue.desiredDeliveryTimeUtc!).toISOString(),
      items: formValue.items as CreateOrderItemDto[],
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

  onClose() {
    this.close.emit();
  }
}
