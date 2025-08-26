from flask import Flask, request, jsonify
import product_dao
import order_dao
import unit_dao
import json
from connection import get_sql_connection
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


connection = get_sql_connection()

@app.route('/getProducts', methods = ['GET'])
def get_products():
    products = product_dao.get_all_products(connection)

    response = jsonify(products)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/deleteProduct', methods = ['POST'])
def delete_products():
    return_id = product_dao.delete_product(connection, request.form['product_id'])
    response = jsonify({
        'product_id': return_id
    })

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getUnits', methods = ['GET'])
def get_units():
    response = unit_dao.get_units(connection)
    response = jsonify(response)

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/insertProduct', methods = ['POST'])
def insert_product ():
    try:
        request_payload = json.loads(request.form['data'])
        print(f"Received payload: {request_payload}")
        product_id = product_dao.insert_new_product(connection, request_payload)
        response = jsonify({
            'product_id': product_id
        })

        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        print(f"Error in insert_product: {str(e)}")
        response = jsonify({
            'error': str(e)
        })
        response.status_code = 500
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response



@app.route('/editProduct', methods = ['POST'])
def edit_product ():
    request_payload = json.loads(request.form['data'])
    product_id = product_dao.edit_product(connection, request_payload)
    response = jsonify({
        'product_id': product_id
    })

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response



@app.route('/insertOrder', methods = ['POST'])
def insert_order ():
    request_payload = json.loads(request.form['data'])
    order_id = order_dao.insert_order(connection, request_payload)
    response = jsonify({
        'order_id': order_id
    })

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getAllOrders', methods = ['GET'])
def get_all_orders ():
    response = order_dao.get_all_orders(connection)
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    print("Starting server...")
    app.run(port=5000)

