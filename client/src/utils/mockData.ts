// Mock data to support Test Mode booking flows
// Safe placeholder images are provided via picsum.photos with stable seeds.

type Id = string;

export type MockVenue = {
  _id: Id;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  sportTypes: string[];
  images: string[]; // photos
};

export type MockCourt = {
  _id: Id;
  facilityId: Id; // links to MockVenue._id
  name: string;
  sportType: string;
  pricePerHour: number;
  courtType?: string;
  image?: string; // photo
};

export type MockUser = {
  _id: Id;
  fullName: string;
  email: string;
};

// Utility: stable placeholder image
const img = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

export const mockVenues: MockVenue[] = [
  {
    _id: 'v_badminton_arena_01',
    name: 'SmashPoint Badminton Arena',
    address: '12 Court Street, Indiranagar, Bengaluru',
    rating: 4.62,
    reviewCount: 248,
    sportTypes: ['Badminton', 'Table Tennis'],
    images: [img('venue-smashpoint-1'), img('venue-smashpoint-2'), img('venue-smashpoint-3')],
  },
  {
    _id: 'v_tennis_club_01',
    name: 'GreenCourt Tennis Club',
    address: '221B Elm Avenue, Kothrud, Pune',
    rating: 4.38,
    reviewCount: 172,
    sportTypes: ['Tennis'],
    images: [img('venue-greencourt-1'), img('venue-greencourt-2'), img('venue-greencourt-3')],
  },
  {
    _id: 'v_multisport_01',
    name: 'City Arena Multi-Sport Complex',
    address: '5 Skyline Road, Andheri West, Mumbai',
    rating: 4.75,
    reviewCount: 389,
    sportTypes: ['Football', 'Basketball', 'Badminton'],
    images: [img('venue-cityarena-1'), img('venue-cityarena-2'), img('venue-cityarena-3')],
  },
];

export const mockCourts: MockCourt[] = [
  // SmashPoint Badminton Arena courts
  {
    _id: 'c_sp_badminton_01',
    facilityId: 'v_badminton_arena_01',
    name: 'Badminton Court A',
    sportType: 'Badminton',
    pricePerHour: 450,
    courtType: 'Synthetic',
    image: img('court-sp-a', 640, 480),
  },
  {
    _id: 'c_sp_badminton_02',
    facilityId: 'v_badminton_arena_01',
    name: 'Badminton Court B',
    sportType: 'Badminton',
    pricePerHour: 500,
    courtType: 'Wooden',
    image: img('court-sp-b', 640, 480),
  },
  {
    _id: 'c_sp_tt_01',
    facilityId: 'v_badminton_arena_01',
    name: 'Table Tennis Table 1',
    sportType: 'Table Tennis',
    pricePerHour: 250,
    image: img('court-sp-tt1', 640, 480),
  },

  // GreenCourt Tennis Club courts
  {
    _id: 'c_gc_tennis_01',
    facilityId: 'v_tennis_club_01',
    name: 'Tennis Court Clay 1',
    sportType: 'Tennis',
    pricePerHour: 700,
    courtType: 'Clay',
    image: img('court-gc-clay1', 640, 480),
  },
  {
    _id: 'c_gc_tennis_02',
    facilityId: 'v_tennis_club_01',
    name: 'Tennis Court Hard 1',
    sportType: 'Tennis',
    pricePerHour: 650,
    courtType: 'Hard',
    image: img('court-gc-hard1', 640, 480),
  },

  // City Arena Multi-Sport Complex courts
  {
    _id: 'c_ca_football_01',
    facilityId: 'v_multisport_01',
    name: 'Football Turf 7-a-side',
    sportType: 'Football',
    pricePerHour: 1800,
    courtType: 'Astro Turf',
    image: img('court-ca-football7', 640, 480),
  },
  {
    _id: 'c_ca_basketball_01',
    facilityId: 'v_multisport_01',
    name: 'Basketball Court 1',
    sportType: 'Basketball',
    pricePerHour: 900,
    courtType: 'Acrylic',
    image: img('court-ca-basket1', 640, 480),
  },
  {
    _id: 'c_ca_badminton_01',
    facilityId: 'v_multisport_01',
    name: 'Badminton Court 1',
    sportType: 'Badminton',
    pricePerHour: 520,
    courtType: 'Synthetic',
    image: img('court-ca-badminton1', 640, 480),
  },
];

// Time slots: 06:00 to 22:00 on the hour
export const mockTimeSlots: string[] = Array.from({ length: 17 }, (_, i) => {
  const hour = 6 + i;
  return `${String(hour).padStart(2, '0')}:00`;
});

export const mockUser: MockUser = {
  _id: 'u_mock_001',
  fullName: 'Test User',
  email: 'test.user@example.com',
};
// End of mock data
