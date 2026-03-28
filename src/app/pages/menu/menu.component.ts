import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { MenuItem } from '../../models/models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  private dataService = inject(DataService);

  readonly menuItems = this.dataService.menuItems;
  readonly exchangeRate = this.dataService.exchangeRate;
  readonly categories: MenuItem['category'][] = ['Comida', 'Bebida', 'Postre', 'Otros'];

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingId: number | null = null;

  formName = '';
  formCategory: MenuItem['category'] = 'Comida';
  formPrice = 0;
  formAvailable = true;
  formDescription = '';
  formIngredients = '';
  formImageUrl = '';

  usdRate = signal('');
  eurRate = signal('');
  isEditingRate = signal(false);
  searchText = signal('');
  searchCategory = signal<MenuItem['category'] | 'all'>('all');
  searchStatus = signal<'all' | 'active' | 'inactive'>('all');

  // Delete confirmation modal
  showDeleteModal = signal(false);
  itemToDelete = signal<MenuItem | null>(null);

  // ===== PREVIEW TOOLTIP STATE =====
  previewItem = signal<MenuItem | null>(null);
  tooltipPosition = signal({ x: 0, y: 0 });
  tooltipFlipX = signal(false);
  tooltipFlipY = signal(false);

  private readonly TOOLTIP_OFFSET = 20;
  private readonly TOOLTIP_WIDTH = 320;
  private readonly TOOLTIP_HEIGHT = 380;

  // ===== COMPUTED =====
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
        (status === 'active' && item.available) ||
        (status === 'inactive' && !item.available);

      return matchesText && matchesCategory && matchesStatus;
    });
  });

  // ===== PREVIEW METHODS =====
  showPreview(event: MouseEvent, item: MenuItem): void {
    this.previewItem.set(item);
    this.updatePreviewPosition(event);
  }

  updatePreviewPosition(event: MouseEvent): void {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = event.clientX + this.TOOLTIP_OFFSET;
    let y = event.clientY + this.TOOLTIP_OFFSET;

    // Check if tooltip would overflow right edge
    const wouldOverflowRight = x + this.TOOLTIP_WIDTH > viewportWidth - 20;
    const shouldFlipX = wouldOverflowRight;

    if (shouldFlipX) {
      x = event.clientX - this.TOOLTIP_WIDTH - this.TOOLTIP_OFFSET;
    }

    // Check if tooltip would overflow bottom edge
    const wouldOverflowBottom = y + this.TOOLTIP_HEIGHT > viewportHeight - 20;
    const shouldFlipY = wouldOverflowBottom;

    if (shouldFlipY) {
      y = event.clientY - this.TOOLTIP_HEIGHT - this.TOOLTIP_OFFSET;
    }

    // Ensure minimum bounds
    x = Math.max(10, x);
    y = Math.max(10, y);

    this.tooltipPosition.set({ x, y });
    this.tooltipFlipX.set(shouldFlipX);
    this.tooltipFlipY.set(shouldFlipY);
  }

  hidePreview(): void {
    this.previewItem.set(null);
  }

  // ===== CRUD METHODS =====
  openAddModal(): void {
    this.formName = '';
    this.formCategory = 'Comida';
    this.formPrice = 0;
    this.formAvailable = true;
    this.formDescription = '';
    this.formIngredients = '';
    this.formImageUrl = '';
    this.editingId = null;
    this.modalMode = 'add';
    this.showModal = true;
  }

  openEditModal(item: MenuItem): void {
    this.formName = item.name;
    this.formCategory = item.category;
    this.formPrice = item.price;
    this.formAvailable = item.available;
    this.formDescription = item.description || '';
    this.formIngredients = item.ingredients || '';
    this.formImageUrl = item.imageUrl || '';
    this.editingId = item.id;
    this.modalMode = 'edit';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveItem(): void {
    if (!this.formName.trim()) return;

    const itemData = {
      name: this.formName,
      category: this.formCategory,
      price: this.formPrice,
      available: this.formAvailable,
      description: this.formDescription,
      ingredients: this.formIngredients,
      imageUrl: this.formImageUrl,
    };

    if (this.modalMode === 'add') {
      this.dataService.addMenuItem(itemData);
    } else if (this.editingId !== null) {
      this.dataService.updateMenuItem({
        id: this.editingId,
        ...itemData,
      });
    }
    this.closeModal();
  }

  toggleAvailability(item: MenuItem): void {
    this.dataService.updateMenuItem({
      ...item,
      available: !item.available,
    });
  }

  deleteItem(item: MenuItem): void {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (item) {
      this.dataService.deleteMenuItem(item.id);
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
    this.usdRate.set(exchangeRate.usd.toString());
    this.eurRate.set(exchangeRate.eur.toString());
    this.isEditingRate.set(false);
  }

  ngOnInit(): void {
    const exchangeRate = this.dataService.exchangeRate();
    this.usdRate.set(exchangeRate.usd.toString());
    this.eurRate.set(exchangeRate.eur.toString());
  }
}
