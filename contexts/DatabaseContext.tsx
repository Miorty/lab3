import * as SQLite from 'expo-sqlite';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  deleteImage,
  deleteMarker,
  getMarkersWithImages,
  saveImage,
  saveMarker,
  updateMarker
} from '../database/operations';
import { initDatabase } from '../database/schema';
import { notificationManager } from '../services/notifications';
import { DatabaseContextType, Marker, MarkerImage } from '../types';

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      console.log('Инициализация базы данных...');
      
      // Инициализируем уведомления
      await notificationManager.initialize();
      
      const db = await initDatabase();
      setDatabase(db);
      
      console.log('База данных успешно инициализирована');
      await loadAllData(db);
      
    } catch (error) {
      console.error('Ошибка при инициализации базы данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllData = async (db: SQLite.SQLiteDatabase) => {
    try {
      console.log('Загрузка всех данных из базы данных...');
      
      const markersWithImages = await getMarkersWithImages(db);
      console.log(`Найдено ${markersWithImages.length} маркеров с изображениями в базе данных`);

      console.log('Данные успешно загружены');
      setMarkers(markersWithImages);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const addMarker = async (markerData: Omit<Marker, 'id'>): Promise<string> => {
    if (!database) throw new Error('База данных не инициализирована');
    
    const id = Date.now().toString();
    const marker: Marker = {
      ...markerData,
      id,
      images: []
    };

    try {
      console.log('Добавление маркера:', marker);
      
      await saveMarker(database, marker);
      await loadAllData(database);
      
      console.log('Маркер успешно добавлен');
      return id;
      
    } catch (error) {
      console.error('Ошибка при добавлении маркера:', error);
      throw error;
    }
  };

  const updateMarkerHandler = async (marker: Marker) => {
    if (!database) throw new Error('База данных не инициализирована');

    try {
      await updateMarker(database, marker);
      await loadAllData(database);
    } catch (error) {
      console.error('Ошибка при обновлении маркера:', error);
      throw error;
    }
  };

  const deleteMarkerHandler = async (markerId: string) => {
    if (!database) throw new Error('База данных не инициализирована');

    try {
      // Удаляем уведомления для этого маркера
      //await notificationManager.removeNotification(markerId);
      
      await deleteMarker(database, markerId);
      await loadAllData(database);
    } catch (error) {
      console.error('Ошибка при удалении маркера:', error);
      throw error;
    }
  };

  const addImageToMarker = async (imageData: Omit<MarkerImage, 'id'>) => {
    if (!database) throw new Error('База данных не инициализирована');
    
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const image: MarkerImage = {
      ...imageData,
      id,
    };

    try {
      console.log('Добавление изображения к маркеру:', image);
      
      await saveImage(database, image);
      await loadAllData(database);
      
      console.log('Изображение успешно добавлено');
      
    } catch (error) {
      console.error('Ошибка при добавлении изображения:', error);
      throw error;
    }
  };

  const deleteImageHandler = async (imageId: string) => {
    if (!database) throw new Error('База данных не инициализирована');

    try {
      await deleteImage(database, imageId);
      await loadAllData(database);
    } catch (error) {
      console.error('Ошибка при удалении изображения:', error);
      throw error;
    }
  };

  return (
    <DatabaseContext.Provider value={{
      markers,
      addMarker,
      updateMarker: updateMarkerHandler,
      deleteMarker: deleteMarkerHandler,
      addImageToMarker,
      deleteImage: deleteImageHandler,
      isLoading
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase должна использоваться в рамках DatabaseProvider');
  }
  return context;
};