from datetime import datetime

from mysql.connector import custom_error_exception

from connection import get_sql_connection

def get_all_orders(connection):
    cursor = connection.cursor()
    query = ("SELECT * FROM orders")

    cursor.execute(query)

    response = []
    for (Order_id, Customer_name, Date, Total) in cursor:
        response.append({
            'order_id': Order_id,
            'customer_name':Customer_name,
            'total': Total,
            'datetime': Date,
        })

    return response

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
