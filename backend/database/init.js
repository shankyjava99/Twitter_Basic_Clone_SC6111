const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'twitter_clone.db');
const db = new sqlite3.Database(dbPath);

const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create users table
            db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    reject(err);
                    return;
                }
                console.log('Users table created/verified');
            });

            // Create posts table
            db.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
                if (err) {
                    console.error('Error creating posts table:', err);
                    reject(err);
                    return;
                }
                console.log('Posts table created/verified');
                resolve();
            });
        });
    });
};

module.exports = { db, initDatabase };
