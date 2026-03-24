// c:\projects\kostian_task\backend\src\server.ts

import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { testConnection } from './config/db';

const PORT = parseInt(process.env.PORT || '4000', 10);

async function main() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
