import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: '',
    price: '',
    description: '',
    imageUrl: '',
    available: true
  });
  const [editMode, setEditMode] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom({
      ...newRoom,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setNewRoom({
      name: '',
      type: '',
      price: '',
      description: '',
      imageUrl: '',
      available: true
    });
    setEditMode(false);
    setCurrentRoomId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const roomData = {
        ...newRoom,
        price: parseFloat(newRoom.price)
      };
      
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/rooms/${currentRoomId}`,
          roomData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/rooms',
          roomData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
      
      resetForm();
      fetchRooms();
      alert(editMode ? 'Room updated successfully!' : 'Room added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving room');
    }
  };

  const handleEdit = (room) => {
    setEditMode(true);
    setCurrentRoomId(room._id);
    setNewRoom({
      name: room.name,
      type: room.type,
      price: room.price.toString(),
      description: room.description,
      imageUrl: room.imageUrl,
      available: room.available
    });
  };

  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchRooms();
        alert('Room deleted successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting room');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1>{editMode ? 'Edit Room' : 'Add New Room'}</h1>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Room Name</label>
          <input
            type="text"
            name="name"
            value={newRoom.name}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Room Type</label>
          <select
            name="type"
            value={newRoom.type}
            onChange={handleInputChange}
            required
            style={styles.input}
          >
            <option value="">Select Type</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe</option>
          </select>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Price per Night</label>
          <input
            type="number"
            name="price"
            value={newRoom.price}
            onChange={handleInputChange}
            required
            min="1"
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            value={newRoom.description}
            onChange={handleInputChange}
            required
            style={{...styles.input, height: '100px'}}
          ></textarea>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={newRoom.imageUrl}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="available"
              checked={newRoom.available}
              onChange={handleInputChange}
            />
            Available for Booking
          </label>
        </div>
        
        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.submitButton}>
            {editMode ? 'Update Room' : 'Add Room'}
          </button>
          {editMode && (
            <button 
              type="button" 
              onClick={resetForm}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      <h2>Existing Rooms</h2>
      <div style={styles.roomsGrid}>
        {rooms.map(room => (
          <div key={room._id} style={styles.roomCard}>
            <img src={room.imageUrl} alt={room.name} style={styles.roomImage} />
            <h3>{room.name}</h3>
            <p><strong>Type:</strong> {room.type}</p>
            <p><strong>Price:</strong> ${room.price}/night</p>
            <p><strong>Status:</strong> {room.available ? 'Available' : 'Not Available'}</p>
            <div style={styles.roomActions}>
              <button 
                onClick={() => handleEdit(room)}
                style={styles.editButton}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(room._id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    marginTop: '60px'
  },
  form: {
    maxWidth: '600px',
    margin: '0 auto 40px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  submitButton: {
    flex: '1',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  cancelButton: {
    flex: '1',
    padding: '10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  roomCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: 'white'
  },
  roomImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  roomActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  editButton: {
    flex: '1',
    padding: '8px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteButton: {
    flex: '1',
    padding: '8px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default RoomManagement;
