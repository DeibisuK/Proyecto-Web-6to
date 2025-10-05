export interface Reservation {
  id: number;
  userId: string;
  sport: 'futbol' | 'padel' | 'tenis';
  court: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Court {
  id: string;
  name: string;
  sport: 'futbol' | 'padel' | 'tenis';
  capacity: number;
  pricePerHour: number;
  features: string[];
  available: boolean;
}