export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  createdAt: Date;
  images?: MarkerImage[]; //добавлерие массива изображений в маркер
}

export interface MarkerImage {
  id: string;
  markerId: string;
  uri: string;
  createdAt: Date;
}
