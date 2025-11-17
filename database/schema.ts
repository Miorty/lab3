import * as SQLite from 'expo-sqlite';

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync('markers.db');
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS markers (
        id TEXT PRIMARY KEY NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS marker_images (
        id TEXT PRIMARY KEY NOT NULL,
        markerId TEXT NOT NULL,
        uri TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (markerId) REFERENCES markers (id) ON DELETE CASCADE
      );
    `);

    console.log('✅ База данных инициализирована');
    return db;
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    throw error;
  }
};