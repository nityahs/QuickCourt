import React, { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { Offer } from '../../services/offers';
import offersService from '../../services/offers';

interface OfferNotificationsProps {
  onOfferUpdate?: (offer: Offer) => void;
}

const OfferNotifications: React.FC<OfferNotificationsProps> = ({ onOfferUpdate }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);

  // Fetch user's pending offers on component mount
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const userOffers = await offersService.getUserOffers();
        const pendingOffers = userOffers.filter(offer => 
          offer.status === 'pending' || offer.status === 'countered'
        );
        setOffers(pendingOffers);
        
        // Show notification for the most recent offer if any
        if (pendingOffers.length > 0) {
          const mostRecent = pendingOffers.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          setCurrentOffer(mostRecent);
          setShowNotification(true);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };
    
    if (user) {
      fetchOffers();
    }
  }, [user]);

  // Listen for real-time offer updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new offers
    socket.on('offer:new', (newOffer: Offer) => {
      if (newOffer.userId === user?.id) {
        setOffers(prev => [newOffer, ...prev]);
        setCurrentOffer(newOffer);
        setShowNotification(true);
        if (onOfferUpdate) onOfferUpdate(newOffer);
      }
    });

    // Listen for offer updates
    socket.on('offer:update', (updatedOffer: Offer) => {
      if (updatedOffer.userId === user?.id) {
        setOffers(prev => 
          prev.map(offer => 
            offer._id === updatedOffer._id ? updatedOffer : offer
          )
        );
        setCurrentOffer(updatedOffer);
        setShowNotification(true);
        if (onOfferUpdate) onOfferUpdate(updatedOffer);
      }
    });

    return () => {
      socket.off('offer:new');
      socket.off('offer:update');
    };
  }, [socket, isConnected, user, onOfferUpdate]);

  // Handle offer actions
  const handleAcceptCounterOffer = async () => {
    if (!currentOffer) return;
    
    try {
      await offersService.acceptOffer(currentOffer._id);
      setShowNotification(false);
      setOffers(prev => prev.filter(offer => offer._id !== currentOffer._id));
    } catch (error) {
      console.error('Error accepting counter offer:', error);
    }
  };

  const handleRejectOffer = async () => {
    if (!currentOffer) return;
    
    try {
      await offersService.rejectOffer(currentOffer._id);
      setShowNotification(false);
      setOffers(prev => prev.filter(offer => offer._id !== currentOffer._id));
    } catch (error) {
      console.error('Error rejecting offer:', error);
    }
  };

  const handleDismissNotification = () => {
    setShowNotification(false);
    
    // Show next offer if available
    if (offers.length > 1) {
      const nextOffer = offers.find(offer => offer._id !== currentOffer?._id);
      if (nextOffer) {
        setCurrentOffer(nextOffer);
        setShowNotification(true);
      }
    }
  };

  if (!showNotification || !currentOffer) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
        <h3 className="font-medium">Booking Offer Update</h3>
        <button 
          onClick={handleDismissNotification}
          className="text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
      
      <div className="p-4">
        {currentOffer.status === 'countered' ? (
          <>
            <p className="text-gray-700 mb-2">
              The facility owner has countered your offer for booking on{' '}
              <span className="font-medium">{new Date(currentOffer.dateISO).toLocaleDateString()}</span> at{' '}
              <span className="font-medium">{currentOffer.start}</span>.
            </p>
            
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded">
              <div>
                <div className="text-sm text-gray-500">Your offer</div>
                <div className="font-medium">₹{currentOffer.offeredPrice}</div>
              </div>
              <div className="text-gray-400">→</div>
              <div>
                <div className="text-sm text-gray-500">Counter offer</div>
                <div className="font-medium text-blue-600">₹{currentOffer.counterPrice}</div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleRejectOffer}
                className="flex-1 py-2 px-3 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptCounterOffer}
                className="flex-1 py-2 px-3 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
              >
                Accept ₹{currentOffer.counterPrice}
              </button>
            </div>
          </>
        ) : currentOffer.status === 'accepted' ? (
          <>
            <div className="flex items-center mb-3 text-green-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Your offer was accepted!</span>
            </div>
            
            <p className="text-gray-700 mb-4">
              Your offer of <span className="font-medium">₹{currentOffer.offeredPrice}</span> for booking on{' '}
              <span className="font-medium">{new Date(currentOffer.dateISO).toLocaleDateString()}</span> at{' '}
              <span className="font-medium">{currentOffer.start}</span> has been accepted.
            </p>
            
            <button
              onClick={handleDismissNotification}
              className="w-full py-2 px-3 bg-green-600 rounded text-white hover:bg-green-700 text-sm"
            >
              Proceed to Payment
            </button>
          </>
        ) : currentOffer.status === 'rejected' ? (
          <>
            <div className="flex items-center mb-3 text-red-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Your offer was declined</span>
            </div>
            
            <p className="text-gray-700 mb-4">
              Unfortunately, your offer of <span className="font-medium">₹{currentOffer.offeredPrice}</span> for booking on{' '}
              <span className="font-medium">{new Date(currentOffer.dateISO).toLocaleDateString()}</span> at{' '}
              <span className="font-medium">{currentOffer.start}</span> was not accepted.
            </p>
            
            <button
              onClick={handleDismissNotification}
              className="w-full py-2 px-3 bg-gray-600 rounded text-white hover:bg-gray-700 text-sm"
            >
              Try Another Booking
            </button>
          </>
        ) : (
          <p className="text-gray-700">
            Your booking offer is being reviewed. We'll notify you when there's an update.
          </p>
        )}
      </div>
    </div>
  );
};

export default OfferNotifications;