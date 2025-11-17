import * as SQLite from 'expo-sqlite';
import { Marker, MarkerImage, MarkerWithImagesDB } from '../types';

// Инициализация базы данных
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await SQLite.openDatabaseAsync('markers.db');
  return db;
};

export const getMarkersWithImages = async (db: SQLite.SQLiteDatabase): Promise<Marker[]> => {
  try {
    const result = await db.getAllAsync<MarkerWithImagesDB>(`
      SELECT 
        m.id,
        m.latitude,
        m.longitude,
        m.title,
        m.description,
        m.createdAt,
        mi.id as imageId,
        mi.markerId as imageMarkerId,
        mi.uri as imageUri,
        mi.createdAt as imageCreatedAt
      FROM markers m
      LEFT JOIN marker_images mi ON m.id = mi.markerId
      ORDER BY m.createdAt DESC, mi.createdAt DESC;
    `);
    
    //Группировка результата по маркерам
    const markersMap = new Map<string, Marker>();
    
    for (const row of result) {
      const markerId = row.id;
      
      if (!markersMap.has(markerId)) {
        markersMap.set(markerId, {
          id: markerId,
          latitude: row.latitude,
          longitude: row.longitude,
          title: row.title,
          description: row.description || '',
          createdAt: new Date(row.createdAt),
          images: []
        });
      }
      
      // + изображение
      if (row.imageId) {
        const marker = markersMap.get(markerId)!;
        marker.images!.push({
          id: row.imageId,
          markerId: row.imageMarkerId!,
          uri: row.imageUri!,
          createdAt: new Date(row.imageCreatedAt!)
        });
      }
    }
    
    return Array.from(markersMap.values());
  } catch (error) {
    console.error('Ошибка при запросе маркеров с изображениями:', error);
    throw error;
  }
};


export const saveMarker = async (db: SQLite.SQLiteDatabase, marker: Marker): Promise<void> => {
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO markers (id, latitude, longitude, title, description, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        marker.id,
        marker.latitude,
        marker.longitude,
        marker.title,
        marker.description,
        marker.createdAt.toISOString()
      ]
    );
  } catch (error) {
    console.error('Ошибка при добавлении маркера:', error);
    throw error;
  }
};

export const deleteMarker = async (db: SQLite.SQLiteDatabase, markerId: string): Promise<void> => {
  try {
    // Удаляем связанные изображения и маркер в одной транзакции
    await db.execAsync(`
      BEGIN TRANSACTION;
      DELETE FROM marker_images WHERE markerId = '${markerId}';
      DELETE FROM markers WHERE id = '${markerId}';
      COMMIT;
    `);
  } catch (error) {
    console.error('Ошибка при удалении маркера:', error);
    throw error;
  }
};

export const saveImage = async (db: SQLite.SQLiteDatabase, image: MarkerImage): Promise<void> => {
  try {
    await db.runAsync(
      `INSERT INTO marker_images (id, markerId, uri, createdAt) VALUES (?, ?, ?, ?);`,
      [
        image.id,
        image.markerId,
        image.uri,
        image.createdAt.toISOString()
      ]
    );
  } catch (error) {
    console.error('Ошибка сохранения изображения:', error);
    throw error;
  }
};

export const deleteImage = async (db: SQLite.SQLiteDatabase, imageId: string): Promise<void> => {
  try {
    await db.runAsync(
      `DELETE FROM marker_images WHERE id = ?;`,
      [imageId]
    );
  } catch (error) {
    console.error('Ошибка удаления изображения:', error);
    throw error;
  }
};

export const updateMarker = async (db: SQLite.SQLiteDatabase, marker: Marker): Promise<void> => {
  try {
    await db.runAsync(
      `UPDATE markers SET title = ?, description = ? WHERE id = ?;`,
      [marker.title, marker.description, marker.id]
    );
  } catch (error) {
    console.error('Ошибка при обновлении маркера:', error);
    throw error;
  }
};

// Функция для получения маркера по ID с изображениями
export const getMarkerWithImages = async (db: SQLite.SQLiteDatabase, markerId: string): Promise<Marker | null> => {
  try {
    const result = await db.getAllAsync<MarkerWithImagesDB>(`
      SELECT 
        m.id,
        m.latitude,
        m.longitude,
        m.title,
        m.description,
        m.createdAt,
        mi.id as imageId,
        mi.markerId as imageMarkerId,
        mi.uri as imageUri,
        mi.createdAt as imageCreatedAt
      FROM markers m
      LEFT JOIN marker_images mi ON m.id = mi.markerId
      WHERE m.id = ?
      ORDER BY mi.createdAt DESC;
    `, [markerId]);
    
    if (result.length === 0) {
      return null;
    }
    
    const firstRow = result[0];
    const marker: Marker = {
      id: firstRow.id,
      latitude: firstRow.latitude,
      longitude: firstRow.longitude,
      title: firstRow.title,
      description: firstRow.description || '',
      createdAt: new Date(firstRow.createdAt),
      images: []
    };
    

    for (const row of result) {
      if (row.imageId) {
        marker.images!.push({
          id: row.imageId,
          markerId: row.imageMarkerId!,
          uri: row.imageUri!,
          createdAt: new Date(row.imageCreatedAt!)
        });
      }
    }
    
    return marker;
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
};
