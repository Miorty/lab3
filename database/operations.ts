import { db } from './db';

// Маркеры
export const addMarker = async (latitude: number, longitude: number, title?: string): Promise<number> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO markers (latitude, longitude, title) VALUES (?, ?, ?);',
      [latitude, longitude, title || `Маркер`]
    );
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('Error adding marker:', error);
    throw error;
  }
};

export const updateMarker = async (id: number, title: string): Promise<void> => {
  try {
    await db.runAsync(
      'UPDATE markers SET title = ? WHERE id = ?;',
      [title, id]
    );
  } catch (error) {
    console.error('Error updating marker:', error);
    throw error;
  }
};

export const getMarkers = async (): Promise<any[]> => {
  try {
    return await db.getAllAsync('SELECT * FROM markers ORDER BY created_at DESC;');
  } catch (error) {
    console.error('Error getting markers:', error);
    throw error;
  }
};

export const getMarkerById = async (id: number): Promise<any> => {
  try {
    return await db.getFirstAsync('SELECT * FROM markers WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error getting marker by id:', error);
    throw error;
  }
};

// Изображения маркеров
export const addImage = async (markerId: number, uri: string): Promise<number> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO marker_images (marker_id, uri) VALUES (?, ?);',
      [markerId, uri]
    );
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('Error adding image:', error);
    throw error;
  }
};

export const deleteImage = async (id: number): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM marker_images WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const getMarkerImages = async (markerId: number): Promise<any[]> => {
  try {
    return await db.getAllAsync(
      'SELECT * FROM marker_images WHERE marker_id = ? ORDER BY created_at DESC;',
      [markerId]
    );
  } catch (error) {
    console.error('Error getting marker images:', error);
    throw error;
  }
};