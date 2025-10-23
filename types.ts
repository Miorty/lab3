export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  createdAt: Date;
  images?: MarkerImage[]; //добавлерие массива изображений в маркер
}

export interface MarkerImage {
  id: string;
  markerId: string;
  uri: string;
  createdAt: Date;
}

export type RootStackParamList = {
  index: undefined;
  'marker/[id]': { id: string };
};

export type ImagePickerError = {
  code: string;
  message: string;
  domain?: string;
};

export type NavigationError = {
  message: string;
  stack?: string;
};