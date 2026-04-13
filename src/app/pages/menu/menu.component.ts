import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Product, ProductCategory, Money } from '../../models/models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  private dataService = inject(DataService);

  readonly ProductCategory = ProductCategory;

  readonly menuItems = this.dataService.menuItems;
  readonly exchangeRate = this.dataService.exchangeRate;

  categories: ProductCategory[] = [
    ProductCategory.Ensaladas,
    ProductCategory.Sopas,
    ProductCategory.Pizza,
    ProductCategory.Pasta,
    ProductCategory.Arroces,
    ProductCategory.Hamburguesas,
    ProductCategory.Sandwiches,
    ProductCategory.Carnes,
    ProductCategory.Pescados,
    ProductCategory.Mariscos,
    ProductCategory.Sushi,
    ProductCategory.Salteados,
    ProductCategory.Guarniciones,
    ProductCategory.Postres,
    ProductCategory.Ron,
    ProductCategory.Whisky,
    ProductCategory.Vinos,
    ProductCategory.Cafés,
    ProductCategory.Té,
    ProductCategory.Otros,
  ];

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingId: string | number | null = null;

  formName = '';
  formCategory: ProductCategory = ProductCategory.Pizza;
  formPriceAmount = 0;
  formPriceCurrency: 'CUP' | 'USD' | 'EUR' = 'CUP';
  formIsActive = true;
  formDescription = '';
  formDetailedDescription = '';
  formImageUrl = '';

  usdRate = signal('');
  eurRate = signal('');
  isEditingRate = signal(false);

  searchText = signal('');
  searchCategory = signal<ProductCategory | 'all'>('all');
  searchStatus = signal<'all' | 'active' | 'inactive'>('all');

  showDeleteModal = signal(false);
  itemToDelete = signal<Product | null>(null);

  previewItem = signal<Product | null>(null);
  tooltipPosition = signal({ x: 0, y: 0 });
  tooltipFlipX = signal(false);
  tooltipFlipY = signal(false);

  private readonly TOOLTIP_OFFSET = 20;
  private readonly TOOLTIP_WIDTH = 320;
  private readonly TOOLTIP_HEIGHT = 380;

  // Tooltip para botones de acción (editar/eliminar)
  activeActionTooltip = signal<string | null>(null);
  actionTooltipPosition = signal({ x: 0, y: 0 });

  showActionTooltip(event: MouseEvent, action: 'edit' | 'delete'): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    // Centrar horizontalmente sobre el botón, 8px arriba
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;

    this.actionTooltipPosition.set({ x, y });
    this.activeActionTooltip.set(action);
  }

  hideActionTooltip(): void {
    this.activeActionTooltip.set(null);
  }

  filteredMenuItems = computed(() => {
    const items = this.menuItems();
    const text = this.searchText().toLowerCase();
    const category = this.searchCategory();
    const status = this.searchStatus();

    return items.filter((item) => {
      const matchesText = !text || item.name.toLowerCase().includes(text);
      const matchesCategory = category === 'all' || item.category === category;
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && item.isActive) ||
        (status === 'inactive' && !item.isActive);
      return matchesText && matchesCategory && matchesStatus;
    });
  });

  showPreview(event: MouseEvent, item: Product): void {
    this.previewItem.set(item);
    this.updatePreviewPosition(event);
  }

  updatePreviewPosition(event: MouseEvent): void {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let x = event.clientX + this.TOOLTIP_OFFSET;
    let y = event.clientY + this.TOOLTIP_OFFSET;

    if (x + this.TOOLTIP_WIDTH > viewportWidth - 20) {
      x = event.clientX - this.TOOLTIP_WIDTH - this.TOOLTIP_OFFSET;
    }
    if (y + this.TOOLTIP_HEIGHT > viewportHeight - 20) {
      y = event.clientY - this.TOOLTIP_HEIGHT - this.TOOLTIP_OFFSET;
    }
    x = Math.max(10, x);
    y = Math.max(10, y);
    this.tooltipPosition.set({ x, y });
  }

  hidePreview(): void {
    this.previewItem.set(null);
  }

  openAddModal(): void {
    this.formName = '';
    this.formCategory = ProductCategory.Pizza;
    this.formPriceAmount = 0;
    this.formPriceCurrency = 'CUP';
    this.formIsActive = true;
    this.formDescription = '';
    this.formDetailedDescription = '';
    this.formImageUrl = '';
    this.editingId = null;
    this.modalMode = 'add';
    this.showModal = true;
  }

  openEditModal(item: Product): void {
    this.formName = item.name;
    this.formCategory = item.category;
    this.formPriceAmount = item.price.amount;
    this.formPriceCurrency = item.price.currency;
    this.formIsActive = item.isActive;
    this.formDescription = item.description;
    this.formDetailedDescription = item.detailedDescription;
    this.formImageUrl = item.imageUrl || '';
    this.editingId = item.id;
    this.modalMode = 'edit';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  // Agrega este método dentro de la clase MenuComponent
  getCategoryName(category: ProductCategory): string {
    return ProductCategory[category]; // Devuelve "Pizza", "Ensaladas", etc.
  }

  saveItem(): void {
    if (!this.formName.trim() || this.formPriceAmount <= 0) return;

    const price: Money = {
      amount: this.formPriceAmount,
      currency: this.formPriceCurrency,
    };

    const productData = {
      name: this.formName,
      description: this.formDescription,
      detailedDescription: this.formDetailedDescription,
      imageUrl: this.formImageUrl || undefined,
      price: price,
      category: this.formCategory,
      isActive: this.formIsActive,
    };

    if (this.modalMode === 'add') {
      this.dataService.addMenuItem(productData as Omit<Product, 'id'>);
    } else if (this.editingId !== null) {
      this.dataService.updateMenuItem({
        id: this.editingId,
        ...productData,
      } as Product);
    }
    this.closeModal();
  }

  toggleAvailability(item: Product): void {
    this.dataService.updateMenuItem({
      ...item,
      isActive: !item.isActive,
    });
  }

  deleteItem(item: Product): void {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (item) {
      // Convertir id a número si es necesario (para el mock)
      const id = item.id;
      this.dataService.deleteMenuItem(id);
      this.showDeleteModal.set(false);
      this.itemToDelete.set(null);
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.itemToDelete.set(null);
  }

  saveExchangeRate(): void {
    const usd = parseFloat(this.usdRate());
    const eur = parseFloat(this.eurRate());
    if (!isNaN(usd) && usd > 0 && !isNaN(eur) && eur > 0) {
      this.dataService.updateExchangeRate(usd, eur);
      this.isEditingRate.set(false);
    }
  }

  cancelEditRate(): void {
    const exchangeRate = this.dataService.exchangeRate();
    this.usdRate.set(exchangeRate.usdToCup.toString());
    this.eurRate.set(exchangeRate.eurToCup.toString());
    this.isEditingRate.set(false);
  }

  ngOnInit(): void {
    const exchangeRate = this.dataService.exchangeRate();
    this.usdRate.set(exchangeRate.usdToCup.toString());
    this.eurRate.set(exchangeRate.eurToCup.toString());
  }
}
