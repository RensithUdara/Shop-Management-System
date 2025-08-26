// Modern Dashboard JavaScript
class ModernDashboard {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadDashboardData();
        this.setupEventListeners();
        this.startAutoRefresh();
        this.initializeAnimations();
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadStatistics(),
                this.loadRecentOrders()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showErrorNotification('Failed to load dashboard data');
        }
    }

    async loadStatistics() {
        try {
            // Load order statistics
            const orderStats = await this.fetchData('/getOrderStats');
            this.updateStatCard('totalOrders', orderStats.total_orders || 0);
            this.updateStatCard('totalRevenue', `₹${(orderStats.total_revenue || 0).toLocaleString()}`);

            // Load product statistics
            const productStats = await this.fetchData('/getProductStats');
            this.updateStatCard('totalProducts', productStats.total_products || 0);
            this.updateStatCard('lowStockItems', productStats.low_stock_items || 0);

            // Animate stat cards
            this.animateStatCards();
        } catch (error) {
            console.error('Error loading statistics:', error);
            this.setDefaultStats();
        }
    }

    async loadRecentOrders() {
        try {
            const orders = await this.fetchData('/getAllOrders');
            this.displayOrders(orders.slice(0, 10)); // Show only recent 10 orders
        } catch (error) {
            console.error('Error loading orders:', error);
            this.displayEmptyOrdersState();
        }
    }

    async fetchData(endpoint) {
        const response = await fetch(`http://127.0.0.1:5000${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    animateStatCards() {
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
            element.classList.add('animate-fade-in');
        });
    }

    displayOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        if (!orders || orders.length === 0) {
            this.displayEmptyOrdersState();
            return;
        }

        const orderRows = orders.map(order => this.createOrderRow(order)).join('');
        tbody.innerHTML = orderRows;

        // Add row animations
        setTimeout(() => {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                row.style.animationDelay = `${index * 0.05}s`;
                row.classList.add('animate-slide-in');
            });
        }, 100);
    }

    createOrderRow(order) {
        const date = new Date(order.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const status = this.getOrderStatus(order.total);
        const statusClass = this.getStatusBadgeClass(status);
        
        return `
            <tr data-order-id="${order.order_id}">
                <td>
                    <span class="fw-bold text-primary">#${order.order_id}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="me-2">
                            <i class="fas fa-user-circle text-muted"></i>
                        </div>
                        <div>
                            <div class="fw-semibold">${this.escapeHtml(order.customer_name)}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>
                        ${date}
                    </small>
                </td>
                <td>
                    <span class="fw-bold text-success">₹${parseFloat(order.total).toLocaleString()}</span>
                </td>
                <td>
                    <span class="badge ${statusClass}">
                        ${status}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-info" onclick="dashboard.viewOrderDetails(${order.order_id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning" onclick="dashboard.editOrder(${order.order_id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger" onclick="dashboard.deleteOrder(${order.order_id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    displayEmptyOrdersState() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center p-5">
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted mb-2">No orders found</h5>
                        <p class="text-muted mb-4">Start by creating your first order!</p>
                        <a href="order.html" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Create Order
                        </a>
                    </div>
                </td>
            </tr>
        `;
    }

    getOrderStatus(total) {
        const amount = parseFloat(total);
        if (amount >= 1000) return 'High Value';
        if (amount >= 500) return 'Medium';
        if (amount >= 100) return 'Standard';
        return 'Small Order';
    }

    getStatusBadgeClass(status) {
        const classes = {
            'High Value': 'bg-success',
            'Medium': 'bg-warning',
            'Standard': 'bg-primary',
            'Small Order': 'bg-secondary'
        };
        return classes[status] || 'bg-secondary';
    }

    async viewOrderDetails(orderId) {
        try {
            // This would fetch order details from backend
            const orderDetails = await this.fetchData(`/getOrderDetails/${orderId}`);
            this.showOrderDetailsModal(orderDetails);
        } catch (error) {
            console.error('Error fetching order details:', error);
            this.showNotification('Unable to load order details', 'error');
        }
    }

    showOrderDetailsModal(orderDetails) {
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        const body = document.getElementById('orderDetailsBody');
        
        body.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Order ID:</strong> #${orderDetails.order_id}
                </div>
                <div class="col-md-6">
                    <strong>Customer:</strong> ${orderDetails.customer_name}
                </div>
            </div>
            <!-- Add more order details here -->
        `;
        
        modal.show();
    }

    editOrder(orderId) {
        window.location.href = `order.html?edit=${orderId}`;
    }

    async deleteOrder(orderId) {
        const result = await this.showConfirmDialog(
            'Delete Order',
            `Are you sure you want to delete order #${orderId}?`,
            'Yes, Delete',
            'Cancel'
        );

        if (result) {
            try {
                await this.fetchData('/deleteOrder', {
                    method: 'POST',
                    body: new FormData(Object.assign(document.createElement('form'), {
                        order_id: { value: orderId }
                    }))
                });
                
                this.showNotification('Order deleted successfully', 'success');
                this.loadDashboardData();
            } catch (error) {
                console.error('Error deleting order:', error);
                this.showNotification('Failed to delete order', 'error');
            }
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchOrders');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => this.applyFilters(), 300));
        }

        // Filter functionality
        const filterInputs = document.querySelectorAll('#filterDate, #filterStatus');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.applyFilters());
        });
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchOrders')?.value.toLowerCase() || '';
        const filterDate = document.getElementById('filterDate')?.value || '';
        const filterStatus = document.getElementById('filterStatus')?.value || '';

        const rows = document.querySelectorAll('#ordersTableBody tr');
        rows.forEach(row => {
            const customerName = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
            const orderDate = row.querySelector('td:nth-child(3)')?.textContent || '';
            const status = row.querySelector('td:nth-child(5)')?.textContent.toLowerCase() || '';

            let showRow = true;

            if (searchTerm && !customerName.includes(searchTerm)) {
                showRow = false;
            }

            if (filterStatus && !status.includes(filterStatus.toLowerCase())) {
                showRow = false;
            }

            row.style.display = showRow ? '' : 'none';
        });
    }

    startAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    initializeAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    setDefaultStats() {
        this.updateStatCard('totalOrders', '0');
        this.updateStatCard('totalProducts', '0');
        this.updateStatCard('totalRevenue', '₹0');
        this.updateStatCard('lowStockItems', '0');
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
        // Simple notification system
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

// Global functions
window.dashboard = new ModernDashboard();

function refreshDashboard() {
    dashboard.loadDashboardData();
    
    // Show refresh feedback
    const refreshBtn = document.querySelector('button[onclick="refreshDashboard()"]');
    if (refreshBtn) {
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
        
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }, 1500);
    }
}

function applyFilters() {
    dashboard.applyFilters();
}

function exportOrders() {
    window.open('http://127.0.0.1:5000/exportOrders', '_blank');
}

function viewInventory() {
    window.location.href = 'manage-product.html';
}

function generateReport() {
    window.location.href = 'reports.html';
}

function printOrder() {
    window.print();
}
