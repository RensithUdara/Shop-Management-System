// Enhanced Dashboard JavaScript

$(document).ready(function() {
    loadDashboardData();
    loadOrders();
    
    // Set up auto-refresh every 30 seconds
    setInterval(function() {
        loadDashboardData();
        loadOrders();
    }, 30000);
});

function loadDashboardData() {
    // Load statistics
    loadStatistics();
}

function loadStatistics() {
    // Load total orders
    $.ajax({
        method: "GET",
        url: "http://127.0.0.1:5000/getOrderStats",
        success: function(stats) {
            $("#totalOrders").text(stats.total_orders || 0);
            $("#totalRevenue").text("₹" + (stats.total_revenue || 0));
        },
        error: function() {
            console.log("Could not load order statistics");
        }
    });
    
    // Load total products
    $.ajax({
        method: "GET",
        url: "http://127.0.0.1:5000/getProductStats",
        success: function(stats) {
            $("#totalProducts").text(stats.total_products || 0);
            $("#lowStockItems").text(stats.low_stock_items || 0);
        },
        error: function() {
            console.log("Could not load product statistics");
        }
    });
}

function loadOrders() {
    $.ajax({
        method: "GET",
        url: orderListApiUrl,
        success: function(orders) {
            displayOrders(orders);
        },
        error: function() {
            console.log("Could not load orders");
            displayOrders([]);
        }
    });
}

function displayOrders(orders) {
    const tbody = $("#ordersTableBody");
    tbody.empty();
    
    if (orders.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="6" class="text-center">
                    <div style="padding: 40px;">
                        <i class="fa fa-shopping-cart fa-3x text-muted"></i>
                        <h4 class="text-muted">No orders found</h4>
                        <p class="text-muted">Start by creating your first order!</p>
                        <a href="order.html" class="btn btn-primary">
                            <i class="fa fa-plus"></i> Create Order
                        </a>
                    </div>
                </td>
            </tr>
        `);
        return;
    }
    
    orders.forEach(order => {
        const date = new Date(order.date).toLocaleDateString();
        const status = getOrderStatus(order.total);
        const statusClass = getStatusClass(status);
        
        tbody.append(`
            <tr>
                <td>${date}</td>
                <td>#${order.order_id}</td>
                <td><i class="fa fa-user text-primary"></i> ${order.customer_name}</td>
                <td><strong>₹${parseFloat(order.total).toFixed(2)}</strong></td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewOrderDetails(${order.order_id})" title="View Details">
                        <i class="fa fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editOrder(${order.order_id})" title="Edit Order">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.order_id})" title="Delete Order">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

function getOrderStatus(total) {
    // Simple status logic based on total amount
    if (total > 1000) return "High Value";
    if (total > 500) return "Medium";
    return "Standard";
}

function getStatusClass(status) {
    switch(status) {
        case "High Value": return "badge-success";
        case "Medium": return "badge-warning";
        default: return "badge-primary";
    }
}

function applyFilters() {
    const searchTerm = $("#searchOrders").val().toLowerCase();
    const filterDate = $("#filterDate").val();
    const filterStatus = $("#filterStatus").val();
    
    $("#ordersTable tbody tr").each(function() {
        const row = $(this);
        const customerName = row.find("td:nth-child(3)").text().toLowerCase();
        const orderDate = row.find("td:first").text();
        const status = row.find("td:nth-child(5)").text().toLowerCase();
        
        let showRow = true;
        
        if (searchTerm && !customerName.includes(searchTerm)) {
            showRow = false;
        }
        
        if (filterStatus && !status.includes(filterStatus.toLowerCase())) {
            showRow = false;
        }
        
        row.toggle(showRow);
    });
}

function viewOrderDetails(orderId) {
    // Implementation for viewing order details
    alert(`Viewing details for Order #${orderId}`);
}

function editOrder(orderId) {
    // Implementation for editing order
    window.location.href = `order.html?edit=${orderId}`;
}

function deleteOrder(orderId) {
    if (confirm(`Are you sure you want to delete Order #${orderId}?`)) {
        $.ajax({
            method: "POST",
            url: "http://127.0.0.1:5000/deleteOrder",
            data: { order_id: orderId },
            success: function() {
                loadOrders();
                loadDashboardData();
                alert("Order deleted successfully!");
            },
            error: function() {
                alert("Error deleting order!");
            }
        });
    }
}

function exportOrders() {
    // Implementation for exporting orders
    window.open("http://127.0.0.1:5000/exportOrders", "_blank");
}

function refreshDashboard() {
    loadDashboardData();
    loadOrders();
    
    // Show refresh feedback
    const refreshBtn = $("button:contains('Refresh')");
    const originalText = refreshBtn.html();
    refreshBtn.html('<i class="fa fa-spinner fa-spin"></i> Refreshing...');
    
    setTimeout(() => {
        refreshBtn.html(originalText);
    }, 1000);
}

// Search functionality
$("#searchOrders").on("keyup", function() {
    applyFilters();
});

$("#filterDate, #filterStatus").on("change", function() {
    applyFilters();
});
