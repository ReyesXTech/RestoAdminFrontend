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
    ProductCategory.Entrantes,
    ProductCategory.Ensaladas,
    ProductCategory.Sopas,
    ProductCategory.Pizzas,
    ProductCategory.Pastas,
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
    ProductCategory.Refrescos,
    ProductCategory.Jugos,
    ProductCategory.Aguas,
    ProductCategory.Cafes,
    ProductCategory.Te,
    ProductCategory.Cervezas,
    ProductCategory.Vinos,
    ProductCategory.Licores,
    ProductCategory.Cocteles,
    ProductCategory.Desayunos,
    ProductCategory.Infantil,
    ProductCategory.Vegetariano,
    ProductCategory.Vegano,
    ProductCategory.SinGluten,
    ProductCategory.Especialidades,
    ProductCategory.Otros,
  ];
  categories: (ProductCategory | 'all')[] = ['all', ...this.allCategories];

  // Filtros
  searchText = signal('');
  searchCategory = signal<ProductCategory | 'all'>('all');
  searchStatus = signal<'all' | 'active' | 'inactive'>('all');

  private dragCounter = 0;
  private searchSubject = new Subject<void>();
  private searchSubscription = this.searchSubject
    .pipe(debounceTime(400))
    .subscribe(() => this.applyFilters());

  // Modal
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingId: string | null = null;
  isDuplicating = false;

  formName = '';
  formCategory: ProductCategory = ProductCategory.Pizzas;
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

  // ==================== NUEVAS SEÑALES PARA IMÁGENES ====================
  selectedImageFile = signal<File | null>(null);
  uploadingImage = signal(false);
  imagePreviewUrl = signal<string | null>(null);
  isDragOver = signal(false);

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
      0: 'Entrantes',
      1: 'Ensaladas',
      2: 'Sopas',
      3: 'Pizzas',
      4: 'Pastas',
      5: 'Arroces',
      6: 'Hamburguesas',
      7: 'Sandwiches',
      8: 'Carnes',
      9: 'Pescados',
      10: 'Mariscos',
      11: 'Sushi',
      12: 'Salteados',
      13: 'Guarniciones',
      14: 'Postres',
      15: 'Refrescos',
      16: 'Jugos',
      17: 'Aguas',
      18: 'Cafes',
      19: 'Te',
      20: 'Cervezas',
      21: 'Vinos',
      22: 'Licores',
      23: 'Cocteles',
      24: 'Desayunos',
      25: 'Infantil',
      26: 'Vegetariano',
      27: 'Vegano',
      28: 'SinGluten',
      29: 'Especialidades',
      30: 'Otros',
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

  // ---------- Drag & Drop ----------
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter++;
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.isDragOver.set(false);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter = 0;
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.processFile(file);
    }
  }

  // ---------- Selección de archivo (desde botón) ----------
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  // ---------- Procesamiento: redimensionar + convertir a WebP ----------
  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen válido.');
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e: any) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    img.onload = () => {
      // Redimensionar manteniendo proporción, máximo 800 px en ancho o alto
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let { width, height } = img;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      // Crear canvas y dibujar
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a WebP (calidad 0.8)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const webpFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
              type: 'image/webp',
            });
            this.selectedImageFile.set(webpFile);
            this.uploadingImage.set(false);

            // Vista previa local
            const previewUrl = URL.createObjectURL(webpFile);
            this.imagePreviewUrl.set(previewUrl);
          } else {
            alert('No se pudo convertir la imagen a WebP.');
          }
        },
        'image/webp',
        0.8,
      );
    };
  }

  // ---------- Subir la imagen al backend ----------
  async uploadSelectedImage(): Promise<string | null> {
    const file = this.selectedImageFile();
    if (!file) {
      return this.formImageUrl || null; // Si no hay archivo nuevo, se queda la URL actual
    }

    this.uploadingImage.set(true);
    try {
      const imageUrl = await this.dataService.uploadImage(file);
      this.formImageUrl = imageUrl; // Guardar la ruta devuelta por el backend
      this.selectedImageFile.set(null); // Limpiar selección
      return imageUrl;
    } catch (error) {
      console.error('Error al subir la imagen', error);
      alert('No se pudo subir la imagen. Inténtalo de nuevo.');
      return null;
    } finally {
      this.uploadingImage.set(false);
    }
  }

  handleImageError(item: ProductResponse): void {
    if (!item.imageUrl) return; // Ya es null, evita bucles
    console.warn('Imagen rota:', item.imageUrl);
    this.dataService.updateLocalMenuItems((items: ProductResponse[]) =>
      items.map((i) => (i.id === item.id ? { ...i, imageUrl: null } : i)),
    );
  }

  openAddModal(): void {
    this.formName = '';
    this.formCategory = ProductCategory.Pizzas;
    this.formPriceAmount = 0;
    this.formPriceCurrency = Currency.CUP;
    this.formIsActive = true;
    this.formDescription = '';
    this.formDetailedDescription = '';
    this.editingId = null;
    this.modalMode = 'add';
    this.showModal = true;
    this.isDuplicating = false;
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.uploadingImage.set(false);
    this.formImageUrl = '';
  }

  // Método auxiliar para convertir categoría de string a número
  private parseCategory(value: any): ProductCategory {
    if (typeof value === 'number') {
      return value;
    }
    // Buscar en el enum usando el string
    const num = ProductCategory[value as keyof typeof ProductCategory];
    return num !== undefined ? num : ProductCategory.Pizzas; // valor por defecto
  }

  private parseCurrency(value: any): Currency {
    if (typeof value === 'number') return value;
    const num = Currency[value as keyof typeof Currency];
    return num !== undefined ? num : Currency.CUP; // valor por defecto
  }

  openEditModal(item: ProductResponse): void {
    this.formName = item.name;
    this.formCategory = this.parseCategory(item.category);
    this.formPriceAmount = item.priceAmount;
    this.formPriceCurrency = this.parseCurrency(item.priceCurrency);
    this.formIsActive =
      item.isActive === true || (item.isActive as any) === 'true' || (item.isActive as any) === 1;
    this.formDescription = item.description;
    this.formDetailedDescription = item.detailedDescription;
    this.formImageUrl = item.imageUrl || '';
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.uploadingImage.set(false);
    this.editingId = item.id;
    this.modalMode = 'edit';
    this.showModal = true;
  }

  closeModal(): void {
    if (this.imagePreviewUrl()) {
      URL.revokeObjectURL(this.imagePreviewUrl()!);
    }
    this.imagePreviewUrl.set(null);

    this.dragCounter = 0;
    this.isDragOver.set(false);
    this.showModal = false;
    this.isDuplicating = false;
  }

  async saveItem(): Promise<void> {
    if (!this.formName.trim() || this.formPriceAmount <= 0) return;

    // Si se seleccionó una imagen nueva, súbela primero
    if (this.selectedImageFile()) {
      const uploadedUrl = await this.uploadSelectedImage();
      if (!uploadedUrl) return; // ya falló
    }

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

  showActionTooltip(event: MouseEvent, action: 'edit' | 'delete' | 'duplicate'): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    const text = action === 'edit' ? 'Editar' : action === 'delete' ? 'Eliminar' : 'Duplicar';
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

  duplicateItem(item: ProductResponse): void {
    // Evitar acumulación de "(copia)"
    const baseName = item.name.replace(/\s*\(copia\)\s*$/i, '');
    const duplicatedName = `${baseName} (copia)`;

    this.formName = duplicatedName;
    this.formCategory = this.parseCategory(item.category);
    this.formPriceAmount = item.priceAmount;
    this.formPriceCurrency = this.parseCurrency(item.priceCurrency);
    this.formIsActive =
      item.isActive === true || (item.isActive as any) === 'true' || (item.isActive as any) === 1;
    this.formDescription = item.description;
    this.formDetailedDescription = item.detailedDescription;
    this.formImageUrl = item.imageUrl || '';
    this.editingId = null; // Es un producto nuevo
    this.modalMode = 'add';
    this.isDuplicating = true; // Bandera para el título
    this.showModal = true;
  }
}
