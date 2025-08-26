// Modern Product Management JavaScript
class ModernProductManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentView = 'table';
        this.init();
    }

    async init() {
        await this.loadProducts();
        await this.loadUnits();
        this.setupEventListeners();
        this.updateStatistics();
    }

    async loadProducts() {
        try {
            const response = await fetch('http://127.0.0.1:5000/getProducts');
            if (!response.ok) throw new Error('Failed to fetch products');
            
            this.products = await response.json();
            this.filteredProducts = [...this.products];
            this.displayProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Failed to load products', 'error');
            this.displayEmptyState();
        }
    }

    async loadUnits() {
        try {
            const response = await fetch('http://127.0.0.1:5000/getUnits');
            if (!response.ok) throw new Error('Failed to fetch units');
            
            const units = await response.json();
            this.populateUnitSelects(units);
        } catch (error) {
            console.error('Error loading units:', error);
        }
    }

    populateUnitSelects(units) {
        const selects = document.querySelectorAll('select[name="uoms"]');
        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Unit</option>';
            units.forEach(unit => {
                select.innerHTML += `<option value="${unit.unit_id}">${unit.unit_name}</option>`;
            });
        });
    }

    displayProducts() {
        if (this.currentView === 'table') {
            this.displayTableView();
        } else {
            this.displayGridView();
        }
        this.updateStatistics();
    }

    displayTableView() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        if (this.filteredProducts.length === 0) {
            this.displayEmptyState();
            return;
        }

        const rows = this.filteredProducts.map(product => this.createProductRow(product)).join('');
        tbody.innerHTML = rows;

        // Add animations
        setTimeout(() => {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                row.style.animationDelay = `${index * 0.05}s`;
                row.classList.add('animate-slide-in');
            });
        }, 100);
    }

    displayGridView() {
        const container = document.getElementById('productsGridContainer');
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const cards = this.filteredProducts.map(product => this.createProductCard(product)).join('');
        container.innerHTML = cards;
    }

    createProductRow(product) {
        return `
            <tr data-product-id="${product.product_id}">
                <td><span class="fw-bold text-primary">${product.product_id}</span></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="me-2">
                            <i class="fas fa-box text-primary"></i>
                        </div>
                        <div>
                            <div class="fw-semibold">${this.escapeHtml(product.product_name)}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge bg-secondary">${product.uom_name || 'N/A'}</span>
                </td>
                <td>
                    <span class="fw-bold text-success">₹${parseFloat(product.price_per_unit).toFixed(2)}</span>
                </td>
                <td>
                    <span class="badge bg-info">In Stock</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-warning" onclick="productManager.editProduct(${product.product_id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger" onclick="productManager.deleteProduct(${product.product_id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-info" onclick="productManager.viewProduct(${product.product_id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    createProductCard(product) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card product-card" data-product-id="${product.product_id}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h6 class="card-title">${this.escapeHtml(product.product_name)}</h6>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" onclick="productManager.editProduct(${product.product_id})">
                                        <i class="fas fa-edit"></i> Edit</a></li>
                                    <li><a class="dropdown-item" onclick="productManager.deleteProduct(${product.product_id})">
                                        <i class="fas fa-trash"></i> Delete</a></li>
                                    <li><a class="dropdown-item" onclick="productManager.viewProduct(${product.product_id})">
                                        <i class="fas fa-eye"></i> View Details</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">Unit: ${product.uom_name || 'N/A'}</small>
                        </div>
                        <div class="mb-3">
                            <span class="h5 text-success">₹${parseFloat(product.price_per_unit).toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-success">In Stock</span>
                            <small class="text-muted">ID: ${product.product_id}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    displayEmptyState() {
        const tbody = document.getElementById('productsTableBody');
        if (tbody) {
            tbody.innerHTML = this.getEmptyStateHTML();
        }
    }

    getEmptyStateHTML() {
        return `
            <tr>
                <td colspan="6" class="text-center p-5">
                    <div class="empty-state">
                        <i class="fas fa-box fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted mb-2">No products found</h5>
                        <p class="text-muted mb-4">Add your first product to get started!</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProductModal">
                            <i class="fas fa-plus"></i>
                            Add Product
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    updateStatistics() {
        document.getElementById('totalProducts').textContent = this.products.length;
        document.getElementById('totalCategories').textContent = this.getUniqueCategories().length;
        document.getElementById('lowStockProducts').textContent = 0; // Placeholder
        
        const totalValue = this.products.reduce((sum, product) => sum + parseFloat(product.price_per_unit), 0);
        document.getElementById('totalValue').textContent = `₹${totalValue.toLocaleString()}`;
    }

    getUniqueCategories() {
        // Placeholder - in real app, you'd get this from product data
        return ['Groceries', 'Beverages', 'Dairy', 'Bakery'];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchProducts');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => this.applyFilters(), 300));
        }

        // Filter functionality
        const filterInputs = document.querySelectorAll('#filterCategory, #sortBy');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.applyFilters());
        });
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchProducts')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('filterCategory')?.value || '';
        const sortBy = document.getElementById('sortBy')?.value || 'name';

        // Filter products
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = !searchTerm || 
                product.product_name.toLowerCase().includes(searchTerm) ||
                product.product_id.toString().includes(searchTerm);

            // Category filter would be implemented with actual category data
            const matchesCategory = !categoryFilter; // Placeholder

            return matchesSearch && matchesCategory;
        });

        // Sort products
        this.filteredProducts.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.product_name.localeCompare(b.product_name);
                case 'price':
                    return parseFloat(a.price_per_unit) - parseFloat(b.price_per_unit);
                case 'date':
                    return a.product_id - b.product_id; // Using ID as proxy for date
                default:
                    return 0;
            }
        });

        this.displayProducts();
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Show/hide views
        document.getElementById('tableView').style.display = view === 'table' ? 'block' : 'none';
        document.getElementById('gridView').style.display = view === 'grid' ? 'block' : 'none';

        this.displayProducts();
    }

    async saveProduct() {
        const form = document.getElementById('addProductForm');
        const formData = new FormData(form);
        
        const productData = {
            product_name: formData.get('product_name'),
            Unit: formData.get('uoms'),
            Price_per_unit: parseFloat(formData.get('price'))
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/insertProduct', {
                method: 'POST',
                body: new FormData(Object.assign(document.createElement('form'), {
                    data: { value: JSON.stringify(productData) }
                }))
            });

            if (!response.ok) throw new Error('Failed to save product');

            this.showNotification('Product added successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
            form.reset();
            await this.loadProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Failed to save product', 'error');
        }
    }

    async editProduct(productId) {
        const product = this.products.find(p => p.product_id === productId);
        if (!product) return;

        // Populate edit form
        const form = document.getElementById('editProductForm');
        form.querySelector('input[name="product_id"]').value = product.product_id;
        form.querySelector('input[name="product_name"]').value = product.product_name;
        form.querySelector('select[name="uoms"]').value = product.unit;
        form.querySelector('input[name="price"]').value = product.price_per_unit;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    }

    async updateProduct() {
        const form = document.getElementById('editProductForm');
        const formData = new FormData(form);
        
        const productData = {
            product_id: parseInt(formData.get('product_id')),
            product_name: formData.get('product_name'),
            Unit: formData.get('uoms'),
            Price_per_unit: parseFloat(formData.get('price'))
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/editProduct', {
                method: 'POST',
                body: new FormData(Object.assign(document.createElement('form'), {
                    data: { value: JSON.stringify(productData) }
                }))
            });

            if (!response.ok) throw new Error('Failed to update product');

            this.showNotification('Product updated successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
            await this.loadProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            this.showNotification('Failed to update product', 'error');
        }
    }

    async deleteProduct(productId) {
        const result = await this.showConfirmDialog(
            'Delete Product',
            'Are you sure you want to delete this product?',
            'Yes, Delete',
            'Cancel'
        );

        if (result) {
            try {
                const response = await fetch('http://127.0.0.1:5000/deleteProduct', {
                    method: 'POST',
                    body: new FormData(Object.assign(document.createElement('form'), {
                        product_id: { value: productId }
                    }))
                });

                if (!response.ok) throw new Error('Failed to delete product');

                this.showNotification('Product deleted successfully!', 'success');
                await this.loadProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                this.showNotification('Failed to delete product', 'error');
            }
        }
    }

    viewProduct(productId) {
        const product = this.products.find(p => p.product_id === productId);
        if (!product) return;

        // Show product details in a modal or navigate to details page
        alert(`Product Details:\nName: ${product.product_name}\nPrice: ₹${product.price_per_unit}\nUnit: ${product.uom_name}`);
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    async showConfirmDialog(title, message, confirmText, cancelText) {
        return new Promise((resolve) => {
            if (confirm(`${title}\n\n${message}`)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
}

// Initialize the modern product manager
const productManager = new ModernProductManager();

// Global functions
function saveProduct() {
    productManager.saveProduct();
}

function updateProduct() {
    productManager.updateProduct();
}

function applyProductFilters() {
    productManager.applyFilters();
}

function switchView(view) {
    productManager.switchView(view);
}

function importProducts() {
    alert('Import functionality would be implemented here');
}

function exportProducts() {
    alert('Export functionality would be implemented here');
}
