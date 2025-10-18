export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  createdAt: Date;
}

export interface MarkerImage {
  id: string;
  markerId: string;
  uri: string;
  createdAt: Date;
}
//Маршруты навигации
export type RootStackParamList = {
  index: undefined;                   // без параметров
  'marker/[id]': { id: string };
};

export type ImagePickerError = {  //Попробовать. Обработка ошибки при выборе изображения
  code: string;
  message: string;
  domain?: string;
};

export type NavigationError = { //Ошибка при навигации
  message: string;
  stack?: string;
};
