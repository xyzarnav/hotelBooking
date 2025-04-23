import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('http://localhost:5000/api/rooms');
        setRooms(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleBook = async (roomId, price) => {
    if (!user) {
      alert('Please login to book a room');
      navigate('/login');
      return;
    }
    
    if (user.wallet < price) {
      alert('Insufficient wallet balance. Please add money to your wallet.');
      return;
    }
    
    try {
      const checkInDate = new Date();
      const checkOutDate = new Date();
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      
      await axios.post('http://localhost:5000/api/bookings', {
        roomId,
        checkInDate,
        checkOutDate,
        totalPrice: price
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Update user's wallet in local state
      user.wallet -= price;
      localStorage.setItem('user', JSON.stringify(user));
      
      alert('Booking request sent! Check your dashboard for booking status.');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Error booking room');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h2>Loading rooms...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1>Welcome to Luxury Hotel Booking</h1>
        <p>Find and book your perfect stay with ease</p>
      </div>
      
      <h2 style={styles.sectionTitle}>Available Rooms</h2>
      
      {rooms.length === 0 ? (
        <p>No rooms available at the moment.</p>
      ) : (
        <div style={styles.grid}>
          {rooms.map(room => (
            <div key={room._id} style={styles.card}>
              <div style={styles.imageContainer}>
                <img 
                  src={room.imageUrl || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a'} 
                  alt={room.name} 
                  style={styles.image} 
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a';
                  }}
                />
                <span style={styles.priceTag}>${room.price}/night</span>
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.roomTitle}>{room.name}</h3>
                <p style={styles.roomType}>{room.type}</p>
                <p style={styles.roomDescription}>{room.description}</p>
                <button 
                  onClick={() => handleBook(room._id, room.price)}
                  style={room.available ? styles.button : styles.buttonDisabled}
                  disabled={!room.available}
                >
                  {room.available ? 'Book Now' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '0 2rem',
    marginTop: '60px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '60vh',
    marginTop: '60px'
  },
  hero: {
    textAlign: 'center',
    padding: '3rem 0',
    marginBottom: '2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  sectionTitle: {
    marginBottom: '1.5rem',
    fontSize: '2rem',
    textAlign: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem'
  },
  card: {
    border: 'none',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s',
    backgroundColor: '#fff',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  },
  imageContainer: {
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
  },
  priceTag: {
    position: 'absolute',
    right: '10px',
    top: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '20px',
    fontWeight: 'bold'
  },
  cardContent: {
    padding: '1.5rem',
  },
  roomTitle: {
    margin: '0 0 5px 0',
    fontSize: '1.5rem',
  },
  roomType: {
    fontStyle: 'italic',
    color: '#666',
    marginBottom: '10px'
  },
  roomDescription: {
    marginBottom: '20px',
    color: '#333'
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    color: '#666666',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    width: '100%',
    fontSize: '1rem'
  }
};

export default Home;
