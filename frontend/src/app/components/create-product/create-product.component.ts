import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

interface ProductForm {
  categoryId: number;
  title: string;
  code: string;
  description: string;
  variationType: string;
  about: string[];
  // Computer-specific fields
  capacity?: number;
  capacityUnit?: 'GB' | 'TB';
  capacityType?: 'SSD' | 'HD';
  computerBrand?: string;
  series?: string;
  // Fashion-specific fields
  material?: string;
  fashionBrand?: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  season?: string;
}

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
})
export class CreateProductComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  step: number = 1;
  productId: number | null = null;
  previousCategoryId: number = 1;
  loading = false;
  error = '';
  success = false;

  // Form data
  form: ProductForm = {
    categoryId: 1,
    title: '',
    code: '',
    description: '',
    variationType: 'NONE',
    about: [''],
    // Computer defaults
    capacity: 512,
    capacityUnit: 'GB',
    capacityType: 'SSD',
    computerBrand: '',
    series: '',
    // Fashion defaults
    material: '',
    fashionBrand: '',
    size: 'M',
    season: '',
  };

  categories = [
    { id: 1, name: 'Computers' },
    { id: 2, name: 'Fashion' },
  ];

  variationTypes = [
    { value: 'NONE', label: 'No Variation' },
    { value: 'OnlySize', label: 'Size Only' },
    { value: 'OnlyColor', label: 'Color Only' },
    { value: 'SizeAndColor', label: 'Size and Color' },
  ];

  capacityUnits = ['GB', 'TB'];
  capacityTypes = ['SSD', 'HD'];
  fashionSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit(): void {}

  // Step 1: Create basic product with categoryId
  createBasicProduct(): void {
    if (!this.form.categoryId) {
      this.error = 'Please select a category';
      return;
    }

    // Check if category changed and clear form details if so
    if (this.step === 2 && this.previousCategoryId !== this.form.categoryId) {
      this.clearFormDetails();
    }

    this.loading = true;
    this.error = '';

    // Ensure categoryId is a number
    const categoryId = Number(this.form.categoryId);

    this.productService.createProduct(categoryId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.productId = response.data.id;
          this.previousCategoryId = this.form.categoryId;
          this.step = 2;
        } else {
          this.error = 'Failed to create product';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Product creation error:', err);
        if (err.status === 403) {
          this.error = 'You need Admin or Merchant role to create products';
        } else if (err.status === 401) {
          this.error = 'You must be logged in to create products';
        } else {
          this.error = err.error?.message || 'Failed to create product';
        }
        this.loading = false;
      },
    });
  }

  // Step 2: Add product details
  addProductDetails(): void {
    if (!this.validateForm()) {
      return;
    }

    if (!this.productId) {
      this.error = 'Product ID not found';
      return;
    }

    this.loading = true;
    this.error = '';

    const detailsPayload = {
      title: this.form.title,
      code: this.form.code,
      description: this.form.description,
      variationType: this.form.variationType,
      about: this.form.about.filter((item) => item.trim() !== ''),
      details: this.getDetailsObject(),
    };

    this.productService
      .addProductDetails(this.productId, detailsPayload)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.success = true;
            setTimeout(() => {
              this.router.navigate(['/products']);
            }, 2000);
          } else {
            this.error = 'Failed to add product details';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to add product details';
          this.loading = false;
        },
      });
  }

  // Step 3: Activate product
  activateProduct(): void {
    if (!this.productId) return;

    this.loading = true;
    this.productService.activateProduct(this.productId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.success = true;
          setTimeout(() => this.router.navigate(['/products']), 2000);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to activate product';
        this.loading = false;
      },
    });
  }

  validateForm(): boolean {
    if (!this.form.title.trim()) {
      this.error = 'Title is required';
      return false;
    }
    if (!this.form.code.trim()) {
      this.error = 'Product code is required';
      return false;
    }
    if (!this.form.description.trim()) {
      this.error = 'Description is required';
      return false;
    }
    if (this.form.about.filter((item) => item.trim() !== '').length === 0) {
      this.error = 'At least one "About" item is required';
      return false;
    }

    // Category-specific validation
    if (this.form.categoryId === 1) {
      // Computers validation
      if (!this.form.capacity || this.form.capacity <= 0) {
        this.error = 'Capacity is required for computers';
        return false;
      }
      if (!this.form.computerBrand?.trim()) {
        this.error = 'Brand is required for computers';
        return false;
      }
      if (!this.form.series?.trim()) {
        this.error = 'Series is required for computers';
        return false;
      }
    } else if (this.form.categoryId === 2) {
      // Fashion validation
      if (!this.form.material?.trim()) {
        this.error = 'Material is required for fashion items';
        return false;
      }
      if (!this.form.fashionBrand?.trim()) {
        this.error = 'Brand is required for fashion items';
        return false;
      }
      if (!this.form.season?.trim()) {
        this.error = 'Season is required for fashion items';
        return false;
      }
    }

    return true;
  }

  getDetailsObject(): any {
    if (this.form.categoryId === 1) {
      // Computers category
      return {
        category: 'Computers',
        capacity: Number(this.form.capacity),
        capacityUnit: this.form.capacityUnit,
        capacityType: this.form.capacityType,
        brand: this.form.computerBrand,
        series: this.form.series,
      };
    } else if (this.form.categoryId === 2) {
      // Fashion category
      return {
        category: 'Fashion',
        material: this.form.material,
        brand: this.form.fashionBrand,
        size: this.form.size,
        season: this.form.season,
      };
    }

    // Fallback (should not happen)
    return {};
  }

  addAboutField(): void {
    this.form.about.push('');
  }

  removeAboutField(index: number): void {
    if (this.form.about.length > 1) {
      this.form.about.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  cancel(): void {
    if (confirm('Discard product creation?')) {
      this.router.navigate(['/products']);
    }
  }

  goBackToStep1(): void {
    this.step = 1;
    this.error = '';
  }

  clearFormDetails(): void {
    // Clear all form fields except categoryId
    this.form.title = '';
    this.form.code = '';
    this.form.description = '';
    this.form.variationType = 'NONE';
    this.form.about = [''];

    // Clear computer fields
    this.form.capacity = 512;
    this.form.capacityUnit = 'GB';
    this.form.capacityType = 'SSD';
    this.form.computerBrand = '';
    this.form.series = '';

    // Clear fashion fields
    this.form.material = '';
    this.form.fashionBrand = '';
    this.form.size = 'M';
    this.form.season = '';
  }
}
