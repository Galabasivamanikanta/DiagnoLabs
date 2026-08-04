const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const getPgUrl = () => {
    if (process.env.RENDER) {
        return 'postgresql://diagnolabs_user:gMAJKmXqW5hcbgvKglOj8reTTpU6kTAG@dpg-d9op1pks728c73fkb1u0-a/diagnolabs';
    }
    if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    return 'postgresql://diagnolabs_user:gMAJKmXqW5hcbgvKglOj8reTTpU6kTAG@dpg-d9op1pks728c73fkb1u0-a.oregon-postgres.render.com/diagnolabs?ssl=true';
};

const connectionString = getPgUrl();

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

const initPgDb = async () => {
    try {
        console.log('[PG-INIT] Initializing PostgreSQL Users & Admins Tables...');
        
        // 1. Create Regular Users / Patients Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                role VARCHAR(50) DEFAULT 'patient',
                is_verified BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Create Staff / Admin Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                employee_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                role VARCHAR(50) DEFAULT 'admin',
                is_first_login BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Seed Master Admin ADM-001 in admins Table
        const salt = await bcrypt.genSalt(10);
        const adminHashedPass = await bcrypt.hash('Admin@123', salt);

        const adminCheck = await pool.query(
            'SELECT * FROM admins WHERE UPPER(employee_id) = $1 OR UPPER(email) = $2',
            ['ADM-001', 'DIAGNOLABS.OFFICIAL@GMAIL.COM']
        );

        if (adminCheck.rows.length === 0) {
            await pool.query(`
                INSERT INTO admins (employee_id, name, email, password, phone, role, is_first_login)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, ['ADM-001', 'Siva (Master Admin)', 'diagnolabs.official@gmail.com', adminHashedPass, '9000000001', 'admin', false]);
            console.log('✅ Master Admin ADM-001 created in PostgreSQL admins table');
        } else {
            await pool.query(
                'UPDATE admins SET password = $1, email = $2, role = $3, is_first_login = false WHERE UPPER(employee_id) = $4 OR UPPER(email) = $2',
                [adminHashedPass, 'diagnolabs.official@gmail.com', 'admin', 'ADM-001']
            );
            console.log('✅ Master Admin ADM-001 verified & updated in PostgreSQL admins table');
        }

        console.log('🎉 [PG-SUCCESS] PostgreSQL Users & Admins Tables Active');
        return true;
    } catch (err) {
        console.error('❌ [PG-ERROR] PostgreSQL Initialization Error:', err.message);
        return false;
    }
};

module.exports = { pool, initPgDb };
