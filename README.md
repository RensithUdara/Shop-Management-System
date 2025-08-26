# Grocery Store Management System (GSMS)

A web-based grocery store management system built with Flask (Python) backend and HTML/CSS/JavaScript frontend.

## Features
- Product management (Add, Edit, Delete products)
- Order management (Create and view orders)
- Inventory tracking with different units (Piece, Kg, Liter)
- MySQL database integration

## Setup Instructions

### 1. Database Setup
- Install MySQL Server
- Create database using the SQL script in `Database/grocery_store_db.sql`

### 2. Environment Configuration
- Copy `.env.example` to `.env`
- Update the database credentials in `.env` file:
  ```
  DB_HOST=127.0.0.1
  DB_USER=root
  DB_PASSWORD=your_mysql_password
  DB_NAME=grocery_store_db
  ```

### 3. Python Dependencies
```bash
pip install flask flask-cors mysql-connector-python python-dotenv
```

### 4. Run the Application
1. Start the Flask backend server:
   ```bash
   cd Backend
   python server.py
   ```
   Server will run on: http://127.0.0.1:5000

2. Start the frontend server:
   ```bash
   cd Frontend
   python -m http.server 9000
   ```
   Frontend will be available at: http://localhost:9000

## Security Notes
- Never commit the `.env` file to version control
- The `.env` file contains sensitive database credentials
- Use the `.env.example` as a template for other developers

## Project Structure
```
├── Backend/           # Flask API server
├── Database/          # SQL database schema
├── Frontend/          # HTML/CSS/JS frontend
├── .env              # Environment variables (not committed)
├── .env.example      # Template for environment variables
└── .gitignore        # Git ignore file
```
