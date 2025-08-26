from connection import get_sql_connection

def get_all_products(connection):
    cursor = connection.cursor()

    query = ("SELECT product_id, product_name, Unit, Price_per_unit, unit_convert.unit_name "
             "FROM grocery_store_db.product inner join unit_convert on product.Unit = unit_convert.unit_id")

    cursor.execute(query)

    response = []

    for (product_id, product_name, Unit, Price_per_unit, unit_name) in cursor:
        response.append({
            'product_id': product_id,
            'product_name': product_name,
            'unit': Unit,
            'price_per_unit': Price_per_unit,
            'uom_name': unit_name
        }
        )

    return response


def insert_new_product(connection, product):
    cursor = connection.cursor()
    query = ("INSERT INTO grocery_store_db.product (product_name, Unit, Price_per_unit ) VALUES (%s, %s, %s)")

    data = (product['product_name'], product['Unit'], product['Price_per_unit'])

    cursor.execute(query, data)
    connection.commit()
    return cursor.lastrowid


def delete_product(connection, product_id):
    cursor = connection.cursor()
    query = ("DELETE FROM grocery_store_db.product WHERE product_id = "+str(product_id))
    cursor.execute(query)
    connection.commit()

def edit_product(connection, product):
    cursor = connection.cursor()
    query=("UPDATE grocery_store_db.product SET product_name=%s, Unit=%s, price_per_unit=%s WHERE product_id=%s")
    data = (product['product_name'],  product['Unit'], product['Price_per_unit'], product['product_id'])

    cursor.execute(query, data)
    connection.commit()
    return cursor.lastrowid

def get_product_statistics(connection):
    cursor = connection.cursor()
    
    # Get total products
    query = "SELECT COUNT(*) as total_products FROM product"
    cursor.execute(query)
    total_products = cursor.fetchone()[0]
    
    # For now, assume low stock items is a fixed number
    # In a real application, you would have a stock quantity field
    low_stock_items = 0
    
    return {
        'total_products': total_products,
        'low_stock_items': low_stock_items
    }

if __name__ == '__main__':
    connection = get_sql_connection()
