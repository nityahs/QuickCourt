// Test/Mock data for Stripe integration testing
export const mockVenues = [
  {
    _id: 'mock-venue-1',
    name: 'Test Sports Complex',
    address: '123 Test Street, Test City',
    rating: 4.5,
    reviewCount: 150,
    sportTypes: ['Tennis', 'Basketball', 'Football', 'Badminton'],
    description: 'Mock venue for testing Stripe payments',
    images: [],
    facilities: ['Parking', 'Restrooms', 'Cafeteria']
  },
  {
    _id: 'mock-venue-2', 
    name: 'Elite Test Arena',
    address: '456 Demo Avenue, Mock City',
    rating: 4.8,
    reviewCount: 89,
    sportTypes: ['Cricket', 'Volleyball', 'Table Tennis'],
    description: 'Another mock venue for payment testing',
    images: [],
    facilities: ['AC', 'Lockers', 'Equipment Rental']
  }
];

export const mockCourts = [
  {
    _id: 'mock-court-1',
    name: 'Test Tennis Court A',
    sportType: 'Tennis',
    pricePerHour: 500,
    courtType: 'Outdoor',
    facilityId: 'mock-venue-1'
  },
  {
    _id: 'mock-court-2',
    name: 'Test Basketball Court B', 
    sportType: 'Basketball',
    pricePerHour: 800,
    courtType: 'Indoor',
    facilityId: 'mock-venue-1'
  },
  {
    _id: 'mock-court-3',
    name: 'Test Football Field C',
    sportType: 'Football', 
    pricePerHour: 1200,
    courtType: 'Outdoor',
    facilityId: 'mock-venue-1'
  },
  {
    _id: 'mock-court-4',
    name: 'Test Badminton Court D',
    sportType: 'Badminton',
    pricePerHour: 300,
    courtType: 'Indoor', 
    facilityId: 'mock-venue-1'
  }
];

export const mockTimeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const mockUser = {
  _id: 'mock-user-1',
  fullName: 'Test User',
  email: 'test@example.com',
  role: 'user',
  isVerified: true
};
