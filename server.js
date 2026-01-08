const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Log environment
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);

// Middleware
// CORS configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-domain.com']
    : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kasir_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // SSL for production (PlanetScale, Railway, etc)
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
};

let pool;

// Initialize database connection
async function initDatabase() {
    try {
        // First connect without database to create it
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await tempConnection.end();

        // Create connection pool
        pool = mysql.createPool(dbConfig);

        // Create tables
        await createTables();
        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
}

// Create tables
async function createTables() {
    const connection = await pool.getConnection();
    
    try {
        // Settings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                store_name VARCHAR(255) DEFAULT 'Toko Saya',
                store_address TEXT,
                store_phone VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Insert default settings if not exists
        const [settingsRows] = await connection.query('SELECT * FROM settings LIMIT 1');
        if (settingsRows.length === 0) {
            await connection.query(`
                INSERT INTO settings (store_name, store_address, store_phone) 
                VALUES ('Toko Saya', 'Jl. Contoh No. 123', '081234567890')
            `);
        }

        // Transactions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                transaction_date DATETIME NOT NULL,
                total DECIMAL(15, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_date (transaction_date)
            )
        `);

        // Transaction items table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS transaction_items (
                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                transaction_id BIGINT NOT NULL,
                item_name VARCHAR(255) NOT NULL,
                price DECIMAL(15, 2) NOT NULL,
                quantity INT NOT NULL,
                subtotal DECIMAL(15, 2) NOT NULL,
                FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
                INDEX idx_transaction (transaction_id)
            )
        `);

        console.log('Tables created successfully!');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// API Routes

// Get settings
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings LIMIT 1');
        if (rows.length === 0) {
            return res.json({
                storeName: 'Toko Saya',
                storeAddress: '',
                storePhone: ''
            });
        }
        res.json({
            storeName: rows[0].store_name,
            storeAddress: rows[0].store_address,
            storePhone: rows[0].store_phone
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update settings
app.put('/api/settings', async (req, res) => {
    try {
        const { storeName, storeAddress, storePhone } = req.body;
        await pool.query(`
            UPDATE settings 
            SET store_name = ?, store_address = ?, store_phone = ?
            WHERE id = 1
        `, [storeName || 'Toko Saya', storeAddress || '', storePhone || '']);

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { items, total } = req.body;
        const transactionDate = new Date();

        // Insert transaction
        const [result] = await connection.query(`
            INSERT INTO transactions (transaction_date, total) 
            VALUES (?, ?)
        `, [transactionDate, total]);

        const transactionId = result.insertId;

        // Insert transaction items
        const itemValues = items.map(item => [
            transactionId,
            item.name,
            item.price,
            item.quantity,
            item.subtotal
        ]);

        await connection.query(`
            INSERT INTO transaction_items (transaction_id, item_name, price, quantity, subtotal)
            VALUES ?
        `, [itemValues]);

        await connection.commit();

        res.json({
            success: true,
            transactionId: transactionId,
            message: 'Transaction saved successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    } finally {
        connection.release();
    }
});

// Get transactions by month/year
app.get('/api/transactions', async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        const [transactions] = await pool.query(`
            SELECT t.id, t.transaction_date, t.total
            FROM transactions t
            WHERE MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
            ORDER BY t.transaction_date DESC
        `, [month, year]);

        // Get items for each transaction
        const transactionsWithItems = await Promise.all(
            transactions.map(async (trans) => {
                const [items] = await pool.query(`
                    SELECT item_name as name, price, quantity, subtotal
                    FROM transaction_items
                    WHERE transaction_id = ?
                `, [trans.id]);

                return {
                    id: trans.id,
                    date: trans.transaction_date,
                    total: parseFloat(trans.total),
                    items: items.map(item => ({
                        name: item.name,
                        price: parseFloat(item.price),
                        quantity: item.quantity,
                        subtotal: parseFloat(item.subtotal)
                    }))
                };
            })
        );

        res.json(transactionsWithItems);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Get single transaction
app.get('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [transactions] = await pool.query(`
            SELECT * FROM transactions WHERE id = ?
        `, [id]);

        if (transactions.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const [items] = await pool.query(`
            SELECT item_name as name, price, quantity, subtotal
            FROM transaction_items
            WHERE transaction_id = ?
        `, [id]);

        res.json({
            id: transactions[0].id,
            date: transactions[0].transaction_date,
            total: parseFloat(transactions[0].total),
            items: items.map(item => ({
                name: item.name,
                price: parseFloat(item.price),
                quantity: item.quantity,
                subtotal: parseFloat(item.subtotal)
            }))
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
});

// Get total income by month/year
app.get('/api/reports/total', async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        const [result] = await pool.query(`
            SELECT COALESCE(SUM(total), 0) as total_income
            FROM transactions
            WHERE MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?
        `, [month, year]);

        res.json({ totalIncome: parseFloat(result[0].total_income) });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
async function startServer() {
    await initDatabase();
    
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Database: ${dbConfig.database}`);
    });
}

startServer().catch(console.error);
