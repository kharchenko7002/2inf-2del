// c:\projects\kostian_task\backend\src\scripts\seed.ts

import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/db';
import { hashPassword } from '../utils/hash';

async function seed() {
  console.log('Starting database seed...');

  // Create tables
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      theme ENUM('white', 'dark', 'blue') DEFAULT 'white',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('users table ready');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(512) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_token (token(255)),
      INDEX idx_user_id (user_id)
    )
  `);
  console.log('refresh_tokens table ready');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS faq (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('faq table ready');

  // Add index on sensor_data.created_at if not exists
  try {
    await pool.execute(`
      CREATE INDEX idx_created_at ON sensor_data(created_at)
    `);
    console.log('Index idx_created_at created on sensor_data');
  } catch (err: any) {
    if (err.code === 'ER_DUP_KEYNAME') {
      console.log('Index idx_created_at already exists');
    } else {
      console.warn('Could not create index on sensor_data:', err.message);
    }
  }

  // Seed admin user
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'qwerty1234';

  const [existing] = await pool.execute<any[]>(
    'SELECT id FROM users WHERE email = ?',
    [adminEmail]
  );

  if (existing.length === 0) {
    const hashedPassword = await hashPassword(adminPassword);
    await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin', adminEmail, hashedPassword, 'admin']
    );
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Seed sample FAQ entries
  const [faqRows] = await pool.execute<any[]>('SELECT COUNT(*) as count FROM faq');
  if (faqRows[0].count === 0) {
    const faqs = [
      {
        question: 'What does the temperature sensor measure?',
        answer: 'The sensor measures ambient air temperature in degrees Celsius with ±0.5°C accuracy.',
      },
      {
        question: 'What is a normal humidity level?',
        answer: 'Normal indoor humidity is typically between 30% and 60%. Values outside this range may indicate ventilation issues.',
      },
      {
        question: 'How often is data updated?',
        answer: 'Sensor data is recorded every minute and the dashboard refreshes automatically every 30 seconds.',
      },
      {
        question: 'What do the chart time ranges mean?',
        answer: '1h shows the last hour, 6h the last 6 hours, 24h the last day, 7d the last week, 30d the last month, and "all" shows all available data.',
      },
      {
        question: 'How do I change my dashboard theme?',
        answer: 'Go to your Profile page and select one of the three available themes: White (light), Dark, or Blue.',
      },
    ];

    for (const faq of faqs) {
      await pool.execute('INSERT INTO faq (question, answer) VALUES (?, ?)', [
        faq.question,
        faq.answer,
      ]);
    }
    console.log('Sample FAQ entries created');
  } else {
    console.log('FAQ entries already exist');
  }

  console.log('Seed completed successfully');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
