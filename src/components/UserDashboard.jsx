import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get('http://localhost:5000/api/bookings/my', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Filter out bookings with null room data
      const validBookings = data.filter(booking => booking && booking.room);
      
      setBookings(validBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId, price) => {
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Update wallet in UI
      const updatedUser = { ...user, wallet: user.wallet + price };
      login(updatedUser);
      
      fetchBookings();
      alert('Booking cancelled successfully. Amount refunded to wallet.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error cancelling booking');
    }
  };

  // Format date to display in a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-IN', options);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Format number to Indian currency format
  const formatIndianPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return price.toLocaleString('en-IN');
  };

  // Calculate number of nights between two dates
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A';
    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const diffTime = checkOutDate.getTime() - checkInDate.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + ' nights';
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div style={styles.container}>
      <h1>My Bookings</h1>
      <p style={styles.wallet}>
        Wallet Balance: <span style={styles.walletAmount}>₹{formatIndianPrice(user.wallet)}</span>
      </p>
      
      <div style={styles.addWalletContainer}>
        <button 
          onClick={() => navigate('/add-wallet')}
          style={styles.addWalletButton}
        >
          Add Money to Wallet
        </button>
        <button 
          onClick={() => navigate('/hotels')}
          style={styles.browseHotelsButton}
        >
          Browse Hotels
        </button>
      </div>
      
      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading your bookings...</p>
        </div>
      ) : error ? (
        <div style={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={fetchBookings} style={styles.retryButton}>Try Again</button>
        </div>
      ) : bookings.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No bookings found. Book a hotel from our collection!</p>
          <button 
            onClick={() => navigate('/hotels')} 
            style={styles.browseButton}
          >
            Browse Hotels Now
          </button>
        </div>
      ) : (
        <div style={styles.bookingsList}>
          {bookings.map(booking => (
            <div key={booking._id} style={styles.booking}>
              <h3 style={styles.bookingTitle}>{booking.room?.name || 'Room Data Unavailable'}</h3>
              
              {booking.room?.imageUrl && (
                <img 
                  src={booking.room.imageUrl} 
                  alt={booking.room.name} 
                  style={styles.image}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a';
                    e.target.onerror = null; // Prevent infinite loop
                  }}
                />
              )}
              
              <div style={styles.bookingDetails}>
                <div style={styles.statusContainer}>
                  <span style={{...styles.statusLabel, ...getStatusStyle(booking.status)}}>
                    {booking.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                
                <div style={styles.dateContainer}>
                  <div style={styles.dateInfo}>
                    <span style={styles.dateLabel}>Check-in:</span>
                    <span style={styles.dateValue}>{formatDate(booking.checkInDate)}</span>
                  </div>
                  <div style={styles.dateInfo}>
                    <span style={styles.dateLabel}>Check-out:</span>
                    <span style={styles.dateValue}>{formatDate(booking.checkOutDate)}</span>
                  </div>
                  <div style={styles.nightsInfo}>
                    {calculateNights(booking.checkInDate, booking.checkOutDate)}
                  </div>
                </div>
                
                <div style={styles.priceContainer}>
                  <span style={styles.priceLabel}>Total Amount:</span>
                  <span style={styles.priceValue}>₹{formatIndianPrice(booking.totalPrice)}</span>
                </div>
              </div>
              
              {booking.status === 'pending' && (
                <button 
                  onClick={() => handleCancel(booking._id, booking.totalPrice)}
                  style={styles.cancelButton}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const getStatusStyle = (status) => {
  const colors = {
    pending: '#ffc107',
    approved: '#4CAF50',
    rejected: '#dc3545'
  };
  return { color: colors[status] || '#6b7280', fontWeight: 'bold' };
};

const styles = {
  container: {
    padding: '2rem',
    marginTop: '60px',
  },
  bookings: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  booking: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  bookingTitle: {
    padding: '1rem',
    margin: 0,
    borderBottom: '1px solid #eee',
    fontSize: '1.2rem',
  },
  bookingDetails: {
    padding: '1rem',
  },
  statusContainer: {
    marginBottom: '1rem',
  },
  statusLabel: {
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    borderRadius: '16px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  dateContainer: {
    marginBottom: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  dateInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  dateLabel: {
    color: '#555',
    fontSize: '0.9rem',
  },
  dateValue: {
    fontWeight: '500',
    color: '#333',
  },
  nightsInfo: {
    textAlign: 'right',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic',
  },
  priceContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #eee',
  },
  priceLabel: {
    color: '#555',
    fontSize: '0.9rem',
  },
  priceValue: {
    fontWeight: 'bold',
    color: '#0066cc',
    fontSize: '1.1rem',
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px'
  },
  wallet: {
    fontSize: '1.2rem',
    marginBottom: '20px'
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  walletAmount: {
    fontWeight: 'bold',
    color: '#FF6B6B',
    fontSize: '1.2rem',
  },
  addWalletContainer: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
  },
  addWalletButton: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  browseHotelsButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  browseButton: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '15px',
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '50%',
    borderTop: '3px solid #0066cc',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 0',
    color: '#666',
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    color: '#b91c1c',
    margin: '2rem 0',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    marginTop: '1rem',
    cursor: 'pointer',
  },
  bookingsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  bookingTitle: {
    margin: 0,
    padding: '1rem',
    fontSize: '1.2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px 8px 0 0',
    borderBottom: '1px solid #eaeaea',
  },
  bookingDetails: {
    padding: '1rem',
  },
  statusContainer: {
    marginBottom: '1rem',
    textAlign: 'center',
  },
  statusLabel: {
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    borderRadius: '16px',
    border: '1px solid #eaeaea',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  dateContainer: {
    marginBottom: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  dateInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  dateLabel: {
    color: '#555',
    fontSize: '0.9rem',
  },
  dateValue: {
    fontWeight: '500',
    color: '#333',
  },
  nightsInfo: {
    textAlign: 'right',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic',
  },
  priceContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #eee',
  },
  priceLabel: {
    color: '#555',
    fontSize: '0.9rem',
  },
  priceValue: {
    fontWeight: 'bold',
    color: '#0066cc',
    fontSize: '1.1rem',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};

export default UserDashboard;
