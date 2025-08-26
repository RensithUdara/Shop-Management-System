// Modern Order Management JavaScript
class ModernOrderManager {
    constructor() {
        this.products = [];
        this.orders = [];
        this.currentOrder = {
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0
        };
        this.init();
    }

    async init() {
        await this.loadProducts();
        await this.loadOrders();
        this.setupEventListeners();
        this.updateOrderStatistics();
        this.displayOrders();
    }

    async loadProducts() {
        try {
            const response = await fetch('http://127.0.0.1:5000/getProducts');
            if (!response.ok) throw new Error('Failed to fetch products');
            
            this.products = await response.json();
            this.populateProductSelect();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Failed to load products', 'error');
        }
    }

    async loadOrders() {
        try {
            const response = await fetch('http://127.0.0.1:5000/getAllOrders');
            if (!response.ok) throw new Error('Failed to fetch orders');
            
            this.orders = await response.json();
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showNotification('Failed to load orders', 'error');
        }
    }

    populateProductSelect() {
        const select = document.getElementById('productSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Select Product</option>';
        this.products.forEach(product => {
            select.innerHTML += `
                <option value="${product.product_id}" data-price="${product.price_per_unit}" data-name="${product.product_name}" data-unit="${product.uom_name}">
                    ${product.product_name} - ₹${product.price_per_unit} per ${product.uom_name}
                </option>
            `;
        });
    }

    displayOrders() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        if (this.orders.length === 0) {
            tbody.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const rows = this.orders.map(order => this.createOrderRow(order)).join('');
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

    createOrderRow(order) {
        const orderDate = new Date(order.order_date).toLocaleDateString();
        const statusColor = this.getStatusColor(order.status || 'Completed');
        
        return `
            <tr data-order-id="${order.order_id}">
                <td><span class="fw-bold text-primary">#${order.order_id}</span></td>
                <td>${orderDate}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-user me-2 text-muted"></i>
                        <span>${order.customer_name || 'Walk-in Customer'}</span>
                    </div>
                </td>
                <td><span class="fw-bold text-success">₹${parseFloat(order.total).toFixed(2)}</span></td>
                <td>
                    <span class="badge bg-${statusColor}">${order.status || 'Completed'}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-info" onclick="orderManager.viewOrder(${order.order_id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning" onclick="orderManager.editOrder(${order.order_id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger" onclick="orderManager.deleteOrder(${order.order_id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-secondary" onclick="orderManager.printOrder(${order.order_id})" title="Print">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getEmptyStateHTML() {
        return `
            <tr>
                <td colspan="6" class="text-center p-5">
                    <div class="empty-state">
                        <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted mb-2">No orders found</h5>
                        <p class="text-muted mb-4">Create your first order to get started!</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createOrderModal">
                            <i class="fas fa-plus"></i>
                            Create Order
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getStatusColor(status) {
        const colors = {
            'Pending': 'warning',
            'Processing': 'info',
            'Completed': 'success',
            'Cancelled': 'danger',
            'Delivered': 'primary'
        };
        return colors[status] || 'secondary';
    }

    updateOrderStatistics() {
        const totalOrders = this.orders.length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const todaysOrders = this.orders.filter(order => {
            const orderDate = new Date(order.order_date).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        }).length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;
        document.getElementById('avgOrderValue').textContent = `₹${avgOrderValue.toFixed(0)}`;
        document.getElementById('todaysOrders').textContent = todaysOrders;
    }

    setupEventListeners() {
        // Product selection for new order
        const productSelect = document.getElementById('productSelect');
        if (productSelect) {
            productSelect.addEventListener('change', () => {
                this.updateProductInfo();
            });
        }

        // Quantity input
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.addEventListener('input', () => {
                this.updateItemTotal();
            });
        }

        // Add item button
        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.addItemToOrder();
            });
        }

        // Order search
        const searchInput = document.getElementById('searchOrders');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => this.searchOrders(), 300));
        }

        // Date filters
        const dateFilters = document.querySelectorAll('#dateFrom, #dateTo');
        dateFilters.forEach(input => {
            input.addEventListener('change', () => this.filterOrders());
        });
    }

    updateProductInfo() {
        const select = document.getElementById('productSelect');
        const selectedOption = select.options[select.selectedIndex];
        
        if (selectedOption.value) {
            const price = selectedOption.dataset.price;
            const unit = selectedOption.dataset.unit;
            
            document.getElementById('unitPrice').value = price;
            document.getElementById('productUnit').textContent = unit || 'unit';
            this.updateItemTotal();
        } else {
            document.getElementById('unitPrice').value = '';
            document.getElementById('productUnit').textContent = 'unit';
            document.getElementById('itemTotal').textContent = '0.00';
        }
    }

    updateItemTotal() {
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
        const total = quantity * unitPrice;
        
        document.getElementById('itemTotal').textContent = total.toFixed(2);
    }

    addItemToOrder() {
        const productSelect = document.getElementById('productSelect');
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const quantity = parseFloat(document.getElementById('quantity').value);
        
        if (!selectedOption.value || !quantity) {
            this.showNotification('Please select a product and enter quantity', 'warning');
            return;
        }

        const item = {
            product_id: parseInt(selectedOption.value),
            product_name: selectedOption.dataset.name,
            quantity: quantity,
            unit_price: parseFloat(selectedOption.dataset.price),
            total: quantity * parseFloat(selectedOption.dataset.price)
        };

        // Check if item already exists
        const existingIndex = this.currentOrder.items.findIndex(i => i.product_id === item.product_id);
        if (existingIndex !== -1) {
            this.currentOrder.items[existingIndex].quantity += quantity;
            this.currentOrder.items[existingIndex].total = 
                this.currentOrder.items[existingIndex].quantity * this.currentOrder.items[existingIndex].unit_price;
        } else {
            this.currentOrder.items.push(item);
        }

        this.updateOrderDisplay();
        this.clearItemForm();
        this.showNotification('Item added to order', 'success');
    }

    updateOrderDisplay() {
        const tbody = document.getElementById('orderItemsBody');
        if (!tbody) return;

        // Display items
        const rows = this.currentOrder.items.map((item, index) => `
            <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.unit_price.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="orderManager.removeItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        tbody.innerHTML = rows;

        // Calculate totals
        this.currentOrder.subtotal = this.currentOrder.items.reduce((sum, item) => sum + item.total, 0);
        this.currentOrder.tax = this.currentOrder.subtotal * 0.18; // 18% GST
        this.currentOrder.total = this.currentOrder.subtotal + this.currentOrder.tax;

        // Update display
        document.getElementById('orderSubtotal').textContent = this.currentOrder.subtotal.toFixed(2);
        document.getElementById('orderTax').textContent = this.currentOrder.tax.toFixed(2);
        document.getElementById('orderTotal').textContent = this.currentOrder.total.toFixed(2);
    }

    removeItem(index) {
        this.currentOrder.items.splice(index, 1);
        this.updateOrderDisplay();
        this.showNotification('Item removed from order', 'info');
    }

    clearItemForm() {
        document.getElementById('productSelect').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('unitPrice').value = '';
        document.getElementById('itemTotal').textContent = '0.00';
        document.getElementById('productUnit').textContent = 'unit';
    }

    clearOrder() {
        this.currentOrder = { items: [], subtotal: 0, tax: 0, total: 0 };
        this.updateOrderDisplay();
        this.clearItemForm();
        document.getElementById('customerName').value = '';
        this.showNotification('Order cleared', 'info');
    }

    async submitOrder() {
        if (this.currentOrder.items.length === 0) {
            this.showNotification('Please add items to the order', 'warning');
            return;
        }

        const customerName = document.getElementById('customerName').value || 'Walk-in Customer';

        const orderData = {
            customer_name: customerName,
            items: this.currentOrder.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total
            })),
            total: this.currentOrder.total
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/insertOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Failed to create order');

            const result = await response.json();
            this.showNotification('Order created successfully!', 'success');
            
            // Close modal and refresh
            bootstrap.Modal.getInstance(document.getElementById('createOrderModal')).hide();
            this.clearOrder();
            await this.loadOrders();
            this.displayOrders();
            this.updateOrderStatistics();

        } catch (error) {
            console.error('Error creating order:', error);
            this.showNotification('Failed to create order', 'error');
        }
    }

    async viewOrder(orderId) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/getOrderDetails/${orderId}`);
            if (!response.ok) throw new Error('Failed to fetch order details');
            
            const orderDetails = await response.json();
            this.showOrderDetailsModal(orderDetails);
        } catch (error) {
            console.error('Error fetching order details:', error);
            this.showNotification('Failed to load order details', 'error');
        }
    }

    showOrderDetailsModal(orderDetails) {
        // Create and show order details modal
        const modalHtml = this.createOrderDetailsModal(orderDetails);
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
        
        // Remove modal when hidden
        document.getElementById('orderDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    createOrderDetailsModal(order) {
        const itemsHtml = order.items ? order.items.map(item => `
            <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>₹${parseFloat(item.unit_price).toFixed(2)}</td>
                <td>₹${parseFloat(item.total).toFixed(2)}</td>
            </tr>
        `).join('') : '';

        return `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Order Details - #${order.order_id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <strong>Customer:</strong> ${order.customer_name || 'Walk-in Customer'}
                                </div>
                                <div class="col-md-6">
                                    <strong>Date:</strong> ${new Date(order.order_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsHtml}
                                    </tbody>
                                </table>
                            </div>
                            <div class="text-end">
                                <h5>Total: ₹${parseFloat(order.total).toFixed(2)}</h5>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="orderManager.printOrder(${order.order_id})">
                                <i class="fas fa-print"></i> Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async deleteOrder(orderId) {
        const result = await this.showConfirmDialog(
            'Delete Order',
            'Are you sure you want to delete this order?',
            'Yes, Delete',
            'Cancel'
        );

        if (result) {
            try {
                const response = await fetch('http://127.0.0.1:5000/deleteOrder', {
                    method: 'POST',
                    body: new FormData(Object.assign(document.createElement('form'), {
                        order_id: { value: orderId }
                    }))
                });

                if (!response.ok) throw new Error('Failed to delete order');

                this.showNotification('Order deleted successfully!', 'success');
                await this.loadOrders();
                this.displayOrders();
                this.updateOrderStatistics();
            } catch (error) {
                console.error('Error deleting order:', error);
                this.showNotification('Failed to delete order', 'error');
            }
        }
    }

    printOrder(orderId) {
        // Create print-friendly window
        const order = this.orders.find(o => o.order_id === orderId);
        if (!order) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.createPrintableOrder(order));
        printWindow.document.close();
        printWindow.print();
    }

    createPrintableOrder(order) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order #${order.order_id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .order-info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .total { text-align: right; font-weight: bold; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Grocery Store Management System</h1>
                    <h2>Order Receipt</h2>
                </div>
                <div class="order-info">
                    <p><strong>Order ID:</strong> #${order.order_id}</p>
                    <p><strong>Customer:</strong> ${order.customer_name || 'Walk-in Customer'}</p>
                    <p><strong>Date:</strong> ${new Date(order.order_date).toLocaleDateString()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Items would be populated from order details -->
                    </tbody>
                </table>
                <div class="total">
                    <h3>Total: ₹${parseFloat(order.total).toFixed(2)}</h3>
                </div>
            </body>
            </html>
        `;
    }

    searchOrders() {
        const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
        // Implement search functionality
        this.filterOrders();
    }

    filterOrders() {
        // Implement date and search filtering
        this.displayOrders();
    }

    // Utility methods
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

// Initialize the modern order manager
const orderManager = new ModernOrderManager();

// Global functions
function submitOrder() {
    orderManager.submitOrder();
}

function clearOrder() {
    orderManager.clearOrder();
}

function addItemToOrder() {
    orderManager.addItemToOrder();
}
