const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'users.db');

async function runSchema() {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(`Error opening database ${DB_PATH}:`, err.message);
            return;
        }
        console.log(`Connected to the SQLite database: ${DB_PATH}`);
    });

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await new Promise((resolve, reject) => {
            db.exec(schemaSQL, function(err) {
                if (err) {
                    console.error('Error executing schema:', err.message);
                    return reject(err);
                }
                console.log('Schema executed successfully.');
                resolve();
            });
        });

    } catch (err) {
        console.error('An error occurred during schema setup:', err);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
}

runSchema();
