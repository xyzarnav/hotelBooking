import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from './common/Toast';
import config from '../config';

function HotelListing() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Add state for date selection
  const [bookingDates, setBookingDates] = useState({
    roomId: null,
    checkIn: formatDateForInput(getDefaultCheckIn()),
    checkOut: formatDateForInput(getDefaultCheckOut()),
    showDatePicker: false
  });

  // Get default dates (tomorrow for check-in, day after tomorrow for check-out)
  function getDefaultCheckIn() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }

  function getDefaultCheckOut() {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  }

  // Format date for input element
  function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }

  // Calculate number of nights between two dates
  function calculateNights(checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${config.API_URL}/api/rooms`);
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      showToast('Failed to load hotels. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const showDatePicker = (roomId) => {
    setBookingDates({
      ...bookingDates,
      roomId: roomId,
      showDatePicker: true
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setBookingDates({
      ...bookingDates,
      [name]: value
    });
    
    // Ensure check-out date is after check-in date
    if (name === 'checkIn' && new Date(value) >= new Date(bookingDates.checkOut)) {
      const newCheckOut = new Date(value);
      newCheckOut.setDate(newCheckOut.getDate() + 2);
      setBookingDates(prev => ({
        ...prev,
        checkOut: formatDateForInput(newCheckOut)
      }));
    }
  };

  const handleBook = async (roomId, price) => {
    if (user.wallet < price) {
      showToast('Insufficient wallet balance. Please add money to your wallet.', 'error');
      navigate('/add-wallet');
      return;
    }
    
    try {
      const checkInDate = new Date(bookingDates.checkIn);
      const checkOutDate = new Date(bookingDates.checkOut);
      
      if (checkInDate < new Date().setHours(0,0,0,0)) {
        showToast('Check-in date cannot be in the past', 'error');
        return;
      }
      
      if (checkInDate >= checkOutDate) {
        showToast('Check-out date must be after check-in date', 'error');
        return;
      }
      
      const nights = calculateNights(checkInDate, checkOutDate);
      const totalPrice = price * nights;
      
      if (user.wallet < totalPrice) {
        showToast(`Insufficient wallet balance. You need ₹${formatIndianPrice(totalPrice)} for this booking.`, 'error');
        return;
      }
      
      await axios.post('http://localhost:5000/api/bookings', {
        roomId,
        checkInDate,
        checkOutDate,
        totalPrice
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Update user's wallet in context
      user.wallet -= totalPrice;
      localStorage.setItem('user', JSON.stringify(user));
      
      showToast('Booking request sent! Check your dashboard for booking status.');
      navigate('/dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || 'Error booking room', 'error');
    }
  };

  // Format number to Indian currency format
  const formatIndianPrice = (price) => {
    return price.toLocaleString('en-IN');
  };

  // Filter rooms based on search, type, and price
  const filteredRooms = rooms.filter(room => {
    // Search term filter
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Room type filter
    const matchesType = selectedType === '' || room.type === selectedType;
    
    // Price range filter
    let matchesPrice = true;
    if (priceRange === 'low') {
      matchesPrice = room.price <= 10000;
    } else if (priceRange === 'medium') {
      matchesPrice = room.price > 10000 && room.price <= 20000;
    } else if (priceRange === 'high') {
      matchesPrice = room.price > 20000;
    }
    
    return matchesSearch && matchesType && matchesPrice;
  });

  // Get unique room types for filter dropdown
  const roomTypes = [...new Set(rooms.map(room => room.type))];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p>Loading available hotels...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {toast.show && <Toast message={toast.message} type={toast.type} />}
      
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Premium Hotels Across India</h1>
          <p style={styles.heroSubtitle}>Experience luxury stays at the best locations</p>
          <p style={styles.walletDisplay}>Wallet Balance: <span style={styles.walletAmount}>₹{formatIndianPrice(user.wallet)}</span></p>
        </div>
      </div>
      
      <div style={styles.filtersContainer}>
        <div style={styles.filters}>
          <div style={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="Search hotels by name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <i className="fas fa-search" style={styles.searchIcon}></i>
          </div>
          
          <select 
            style={styles.filterSelect} 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            {roomTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
          
          <select 
            style={styles.filterSelect}
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option value="all">All Prices</option>
            <option value="low">Budget (Under ₹10,000)</option>
            <option value="medium">Standard (₹10,000 - ₹20,000)</option>
            <option value="high">Luxury (Above ₹20,000)</option>
          </select>
        </div>
      </div>
      
      {filteredRooms.length === 0 ? (
        <div style={styles.noRooms}>
          <h2>No hotels match your criteria</h2>
          <p>Try adjusting your filters or search term.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setPriceRange('all');
            }}
            style={styles.clearButton}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={styles.roomsContainer}>
          <div style={styles.resultCount}>
            <p>{filteredRooms.length} hotel{filteredRooms.length !== 1 ? 's' : ''} found</p>
          </div>
          <div style={styles.roomsGrid}>
            {filteredRooms.map(room => (
              <div key={room._id} style={styles.roomCard}>
                <div style={styles.imageContainer}>
                  <img 
                    src={room.imageUrl} 
                    alt={room.name} 
                    style={styles.image}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a';
                    }}
                  />
                  <div style={styles.badgeContainer}>
                    <span style={styles.typeBadge}>{room.type}</span>
                  </div>
                </div>
                
                <div style={styles.content}>
                  <h2 style={styles.roomName}>{room.name}</h2>
                  
                  <div style={styles.amenities}>
                    <span style={styles.amenity}>Wi-Fi</span>
                    <span style={styles.amenity}>AC</span>
                    <span style={styles.amenity}>Room Service</span>
                  </div>
                  
                  <p style={styles.description}>{room.description}</p>
                  
                  {bookingDates.showDatePicker && bookingDates.roomId === room._id ? (
                    <div style={styles.datePickerContainer}>
                      <h4 style={styles.datePickerTitle}>Select your stay dates</h4>
                      <div style={styles.dateInputs}>
                        <div style={styles.dateField}>
                          <label style={styles.dateLabel}>Check-in</label>
                          <input
                            type="date"
                            name="checkIn"
                            value={bookingDates.checkIn}
                            min={formatDateForInput(new Date())}
                            onChange={handleDateChange}
                            style={styles.dateInput}
                          />
                        </div>
                        <div style={styles.dateField}>
                          <label style={styles.dateLabel}>Check-out</label>
                          <input
                            type="date"
                            name="checkOut"
                            value={bookingDates.checkOut}
                            min={bookingDates.checkIn}
                            onChange={handleDateChange}
                            style={styles.dateInput}
                          />
                        </div>
                      </div>
                      
                      <div style={styles.stayDetails}>
                        <p>
                          {calculateNights(bookingDates.checkIn, bookingDates.checkOut)} nights × ₹{formatIndianPrice(room.price)}/night
                        </p>
                        <p style={styles.totalPricePreview}>
                          Total: ₹{formatIndianPrice(room.price * calculateNights(bookingDates.checkIn, bookingDates.checkOut))}
                        </p>
                      </div>
                      
                      <div style={styles.datePickerActions}>
                        <button
                          onClick={() => handleBook(room._id, room.price)}
                          style={styles.confirmButton}
                          disabled={!room.available}
                        >
                          Confirm Booking
                        </button>
                        <button
                          onClick={() => setBookingDates(prev => ({...prev, showDatePicker: false}))}
                          style={styles.cancelButton}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.footer}>
                      <div style={styles.priceInfo}>
                        <p style={styles.priceLabel}>Price per night:</p>
                        <p style={styles.totalPrice}>₹{formatIndianPrice(room.price)}</p>
                      </div>
                      
                      <button 
                        onClick={() => showDatePicker(room._id)}
                        style={room.available ? styles.bookButton : styles.bookButtonDisabled}
                        disabled={!room.available}
                      >
                        {room.available ? 'Book Now' : 'Not Available'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '60px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '70vh',
    backgroundColor: '#fff',
  },
  loader: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0066cc',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  hero: {
    backgroundColor: '#fff',
    padding: '2.5rem 0',
    borderBottom: '1px solid #eaeaea',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    color: '#555',
    marginBottom: '1rem',
  },
  walletDisplay: {
    fontSize: '1rem',
    color: '#555',
  },
  walletAmount: {
    fontWeight: 'bold',
    color: '#0066cc',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #eaeaea',
    padding: '1rem 0',
  },
  filters: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    gap: '1rem',
  },
  searchInput: {
    flex: '1',
    padding: '0.6rem 1rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
  },
  filterSelect: {
    padding: '0.6rem 1rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    fontSize: '0.95rem',
  },
  roomsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
  },
  imageContainer: {
    position: 'relative',
    height: '220px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: '15px',
    left: '15px',
  },
  typeBadge: {
    backgroundColor: '#0066cc',
    color: 'white',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  content: {
    padding: '1.5rem',
  },
  roomName: {
    margin: 0,
    fontSize: '1.4rem',
    marginBottom: '0.5rem',
  },
  amenities: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  amenity: {
    backgroundColor: '#f1f8ff',
    color: '#0066cc',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    border: '1px solid #e1ecf4',
  },
  description: {
    margin: 0,
    lineHeight: '1.6',
    color: '#555',
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
  },
  footer: {
    borderTop: '1px solid #eee',
    paddingTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  priceLabel: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#777',
  },
  totalPrice: {
    margin: '0.2rem 0 0 0',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
  },
  nightPrice: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#777',
  },
  bookButton: {
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.6rem 1.2rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  bookButtonDisabled: {
    backgroundColor: '#e0e0e0',
    color: '#888',
    border: 'none',
    borderRadius: '4px',
    padding: '0.6rem 1.2rem',
    fontSize: '0.95rem',
    cursor: 'not-allowed',
  },
  noRooms: {
    maxWidth: '600px',
    margin: '3rem auto',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  dashboardButton: {
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.6rem 1.2rem',
    marginTop: '1rem',
    cursor: 'pointer',
  },
  datePickerContainer: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #eee',
  },
  datePickerTitle: {
    fontSize: '1rem',
    marginBottom: '12px',
    color: '#333',
    fontWeight: '500',
  },
  dateInputs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '15px',
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    display: 'block',
    fontSize: '0.85rem',
    marginBottom: '5px',
    color: '#555',
  },
  dateInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.95rem',
  },
  stayDetails: {
    borderTop: '1px dashed #ddd',
    borderBottom: '1px dashed #ddd',
    padding: '10px 0',
    marginBottom: '15px',
    fontSize: '0.9rem',
    color: '#555',
  },
  totalPricePreview: {
    fontWeight: 'bold',
    color: '#0066cc',
    fontSize: '1.1rem',
    marginTop: '5px',
  },
  datePickerActions: {
    display: 'flex',
    gap: '10px',
  },
  confirmButton: {
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px',
    flex: 3,
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
    flex: 1,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  searchContainer: {
    position: 'relative',
    flex: '1',
  },
  searchIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
  },
  resultCount: {
    marginBottom: '1rem',
    color: 'var(--text-color)',
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.6rem 1.2rem',
    marginTop: '1rem',
    cursor: 'pointer',
  },
};

export default HotelListing;
