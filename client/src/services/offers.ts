import http from './http';

export interface OfferRequest {
  facilityId: string;
  courtId: string;
  dateISO: string;
  start: string;
  end: string;
  originalPrice: number;
  offeredPrice: number;
}

export interface Offer {
  _id: string;
  userId: string;
  facilityId: string;
  courtId: string;
  dateISO: string;
  start: string;
  end: string;
  originalPrice: number;
  offeredPrice: number;
  counterPrice?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  createdAt: string;
  updatedAt: string;
}

export interface OfferStats {
  count: number;
  averageDiscount: number;
  minDiscount: number;
  maxDiscount: number;
  acceptedPrices: Array<{
    originalPrice: number;
    acceptedPrice: number;
    discountPercentage: number;
  }>;
}

const offersService = {
  // Create a new offer
  createOffer: async (offerData: OfferRequest): Promise<Offer> => {
    const response = await http.post('/offers', offerData);
    return response.data;
  },
  
  // Get all offers for the current user
  getUserOffers: async (): Promise<Offer[]> => {
    const response = await http.get('/offers/user');
    return response.data;
  },
  
  // Get all offers for a specific facility
  getFacilityOffers: async (facilityId: string): Promise<Offer[]> => {
    const response = await http.get(`/offers/facility/${facilityId}`);
    return response.data;
  },
  
  // Get offer statistics for a facility
  getOfferStats: async (facilityId: string): Promise<OfferStats> => {
    const response = await http.get(`/offers/stats/${facilityId}`);
    return response.data;
  },
  
  // Accept an offer
  acceptOffer: async (offerId: string): Promise<Offer> => {
    const response = await http.put(`/offers/${offerId}/accept`);
    return response.data;
  },
  
  // Reject an offer
  rejectOffer: async (offerId: string): Promise<Offer> => {
    const response = await http.put(`/offers/${offerId}/reject`);
    return response.data;
  },
  
  // Counter an offer
  counterOffer: async (offerId: string, counterPrice: number): Promise<Offer> => {
    const response = await http.put(`/offers/${offerId}/counter`, { counterPrice });
    return response.data;
  }
};

export default offersService;