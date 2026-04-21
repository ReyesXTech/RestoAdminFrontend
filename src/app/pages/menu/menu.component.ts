import { Component, inject, signal, computed, OnInit, OnDestroy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DataService } from '../../services/data.service';
import { ProductCategory, ProductResponse, Currency } from '../../models';
import { TooltipService } from '../../services/tooltip.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private tooltipService = inject(TooltipService);

  readonly menuItems = this.dataService.menuItems;
  readonly loading = this.dataService.productsLoading;
  readonly hasMore = this.dataService.productsHasMore;
  readonly exchangeRate = this.dataService.exchangeRate;

  readonly ProductCategory = ProductCategory;
  readonly Currency = Currency;

  // Categorías para el selector
  readonly allCategories: ProductCategory[] = [
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
  categories: (ProductCategory | 'all')[] = ['all', ...this.allCategories];

  // Filtros
  searchText = signal('');
  searchCategory = signal<ProductCategory | 'all'>('all');
  searchStatus = signal<'all' | 'active' | 'inactive'>('all');

  private searchSubject = new Subject<void>();
  private searchSubscription = this.searchSubject
    .pipe(debounceTime(400))
    .subscribe(() => this.applyFilters());

  // Modal
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingId: string | null = null;

  formName = '';
  formCategory: ProductCategory = ProductCategory.Pizza;
  formPriceAmount = 0;
  formPriceCurrency: Currency = Currency.CUP;
  formIsActive = true;
  formDescription = '';
  formDetailedDescription = '';
  formImageUrl = '';

  // Tipo de cambio
  usdRate = signal('');
  eurRate = signal('');
  isEditingRate = signal(false);

  // Delete modal
  showDeleteModal = signal(false);
  itemToDelete = signal<ProductResponse | null>(null);

  // Tooltips
  activeActionTooltip = signal<string | null>(null);
  actionTooltipPosition = signal({ x: 0, y: 0 });
  previewItem = signal<ProductResponse | null>(null);
  tooltipPosition = signal({ x: 0, y: 0 });

  constructor() {
    effect(() => {
      const rate = this.exchangeRate();
      if (rate && !this.isEditingRate()) {
        this.usdRate.set(rate.usdToCup.toString());
        this.eurRate.set(rate.eurToCup.toString());
      }
    });
  }

  ngOnInit(): void {
    this.applyFilters();
    this.dataService.loadExchangeRate();
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  private applyFilters(): void {
    const isActive = this.searchStatus() === 'all' ? undefined : this.searchStatus() === 'active';
    this.dataService.loadMenuItems({
      searchTerm: this.searchText() || undefined,
      category: this.searchCategory() === 'all' ? undefined : this.searchCategory(),
      isActive,
    });
  }

  onSearchInput(): void {
    this.searchSubject.next();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText.set('');
    this.searchCategory.set('all');
    this.searchStatus.set('all');
    this.applyFilters();
  }

  onTableScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 100;
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
    if (nearBottom && this.hasMore() && !this.loading()) {
      this.dataService.loadNextMenuPage();
    }
  }

  getCategoryName(category: ProductCategory): string {
    // Intenta obtener el nombre desde el enum
    const name = ProductCategory[category];
    if (name) return name;

    // Respaldo manual por si acaso
    const manualNames: Record<number, string> = {
      0: 'Ensaladas',
      1: 'Sopas',
      2: 'Pizza',
      3: 'Pasta',
      4: 'Arroces',
      5: 'Hamburguesas',
      6: 'Sándwiches',
      7: 'Carnes',
      8: 'Pescados',
      9: 'Mariscos',
      10: 'Sushi',
      11: 'Salteados',
      12: 'Guarniciones',
      13: 'Postres',
      14: 'Ron',
      15: 'Whisky',
      16: 'Vinos',
      17: 'Cafés',
      18: 'Té',
      19: 'Otros',
    };
    return manualNames[category] || 'Desconocida';
  }

  // Añade este método para el código de moneda
  getCurrencyCode(currency: Currency): string {
    return Currency[currency]; // Devuelve "USD", "EUR", "CUP"
  }

  getCurrencySymbol(currency: Currency): string {
    return currency === Currency.USD ? 'USD' : currency === Currency.EUR ? 'EUR' : 'CUP';
  }

  openAddModal(): void {
    this.formName = '';
    this.formCategory = ProductCategory.Pizza;
    this.formPriceAmount = 0;
    this.formPriceCurrency = Currency.CUP;
    this.formIsActive = true;
    this.formDescription = '';
    this.formDetailedDescription = '';
    this.formImageUrl = '';
    this.editingId = null;
    this.modalMode = 'add';
    this.showModal = true;
  }

  openEditModal(item: ProductResponse): void {
    this.formName = item.name;
    this.formCategory = item.category;
    this.formPriceAmount = item.priceAmount;
    this.formPriceCurrency = item.priceCurrency;
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

  async saveItem(): Promise<void> {
    if (!this.formName.trim() || this.formPriceAmount <= 0) return;

    const productData = {
      name: this.formName,
      description: this.formDescription,
      detailedDescription: this.formDetailedDescription,
      priceAmount: this.formPriceAmount,
      priceCurrency: this.formPriceCurrency,
      category: this.formCategory,
      imageUrl: this.formImageUrl || null,
    };

    try {
      if (this.modalMode === 'add') {
        await this.dataService.addMenuItem(productData);
      } else if (this.editingId) {
        await this.dataService.updateMenuItem({
          id: this.editingId,
          ...productData,
          isActive: this.formIsActive,
        });
      }
      this.closeModal();
      this.applyFilters();
    } catch (error) {
      console.error('Error saving product', error);
    }
  }

  async toggleAvailability(item: ProductResponse): Promise<void> {
    const newActiveState = !item.isActive;

    // Actualización optimista
    this.dataService.updateLocalMenuItems((items: ProductResponse[]) =>
      items.map((i: ProductResponse) =>
        i.id === item.id ? { ...i, isActive: newActiveState } : i,
      ),
    );

    try {
      await this.dataService.updateMenuItem({
        id: item.id,
        name: item.name,
        description: item.description,
        detailedDescription: item.detailedDescription,
        priceAmount: item.priceAmount,
        priceCurrency: item.priceCurrency,
        category: item.category,
        imageUrl: item.imageUrl,
        isActive: newActiveState,
      });
    } catch (error) {
      // Revertir cambio
      this.dataService.updateLocalMenuItems((items: ProductResponse[]) =>
        items.map((i: ProductResponse) =>
          i.id === item.id ? { ...i, isActive: item.isActive } : i,
        ),
      );
      console.error('Error al cambiar disponibilidad', error);
    }
  }

  deleteItem(item: ProductResponse): void {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  async confirmDelete(): Promise<void> {
    const item = this.itemToDelete();
    if (item) {
      try {
        await this.dataService.deleteMenuItem(item.id);
        this.showDeleteModal.set(false);
        this.itemToDelete.set(null);
        this.applyFilters();
      } catch (error) {
        console.error('Error deleting product', error);
      }
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
    const rate = this.exchangeRate();
    if (rate) {
      this.usdRate.set(rate.usdToCup.toString());
      this.eurRate.set(rate.eurToCup.toString());
    }
    this.isEditingRate.set(false);
  }

  showActionTooltip(event: MouseEvent, action: 'edit' | 'delete'): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    const text = action === 'edit' ? 'Editar' : 'Eliminar';
    this.tooltipService.show(text, x, y);
  }

  hideActionTooltip(): void {
    this.tooltipService.hide();
  }

  showPreview(event: MouseEvent, item: ProductResponse): void {
    this.previewItem.set(item);
    // Lógica de posicionamiento...
  }

  hidePreview(): void {
    this.previewItem.set(null);
  }
}
