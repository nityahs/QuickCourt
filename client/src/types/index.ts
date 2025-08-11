export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'user' | 'facility_owner' | 'admin';
  isVerified: boolean;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  location: string;
  sportTypes: string[];
  startingPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  operatingHours: {
    start: string;
    end: string;
  };
  courts: Court[];
  ownerId: string;
  isApproved: boolean;
}

export interface Court {
  id: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  venueId: string;
}

export interface Booking {
  id: string;
  userId: string;
  venueId: string;
  courtId: string;
  date: string;
  startTime: string;
  duration: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  venueId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
}