from datetime import datetime

from mysql.connector import custom_error_exception

from connection import get_sql_connection

def get_all_orders(connection):
    cursor = connection.cursor()
    query = ("SELECT Order_id, Customer_name, Date, Total FROM orders ORDER BY Date DESC")

    cursor.execute(query)

    response = []
    for (Order_id, Customer_name, Date, Total) in cursor:
        response.append({
            'order_id': Order_id,
            'customer_name': Customer_name,
            'total': Total,
            'date': Date.strftime('%Y-%m-%d %H:%M:%S') if Date else '',
        })

    return response

def get_order_statistics(connection):
    cursor = connection.cursor()
    
    # Get total orders and revenue
    query = """
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(Total), 0) as total_revenue
        FROM orders
    """
    cursor.execute(query)
    result = cursor.fetchone()
    
    return {
        'total_orders': result[0] if result else 0,
        'total_revenue': float(result[1]) if result and result[1] else 0.0
    }

def delete_order(connection, order_id):
    cursor = connection.cursor()
    
    # Delete order details first (foreign key constraint)
    detail_query = "DELETE FROM order_details WHERE order_id = %s"
    cursor.execute(detail_query, (order_id,))
    
    # Delete the order
    order_query = "DELETE FROM orders WHERE Order_id = %s"
    cursor.execute(order_query, (order_id,))
    
    connection.commit()
    return cursor.rowcount > 0

def insert_order(connection, order):
    cursor = connection.cursor()
    order_query = "insert into orders (Customer_name, Date, Total) values (%s, %s, %s)"
    order_data = (order['customer_name'], datetime.now(), order['grand_total'])

    cursor.execute(order_query, order_data)
    order_id = cursor.lastrowid


    order_details_query = "insert into order_details (order_id, product_id, quatity, total) values (%s, %s, %s, %s)"

    order_details_data = []

    for order_detail_record in order['order_details']:
        order_details_data.append([
            order_id,
            int(order_detail_record['product_id']),
            float(order_detail_record['quantity']),
            float(order_detail_record['total_price'])
        ])

    cursor.executemany(order_details_query, order_details_data)
    connection.commit()
    return order_id


if __name__ == '__main__':
    connection = get_sql_connection()
