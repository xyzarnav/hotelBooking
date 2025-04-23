import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import RoomManagement from './RoomManagement';
import DashboardStats from './admin/DashboardStats';
import Toast from './common/Toast';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  // Filter bookings when search term or status filter changes
  useEffect(() => {
    if (bookings.length) {
      filterBookings();
    }
  }, [statusFilter, searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Filter out any bookings with null user or room
      const validBookings = data.filter(booking => booking.user && booking.room);
      
      setBookings(validBookings);
      calculateStats(validBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBookings(filtered);
  };

  const calculateStats = (bookings) => {
    const totalRevenue = bookings.reduce((sum, booking) => 
      booking.status === 'approved' ? sum + booking.totalPrice : sum, 0);
    
    const statusCounts = {
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      rejected: bookings.filter(b => b.status === 'rejected').length
    };
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => 
      new Date(b.checkInDate).toISOString().split('T')[0] === todayString
    ).length;
    
    setStats({
      totalBookings: bookings.length,
      totalRevenue,
      statusCounts,
      todayBookings
    });
  };

  const handleStatus = async (bookingId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchBookings();
      
      showToast(`Booking ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating status', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Format number to Indian currency format
  const formatIndianPrice = (price) => {
    return price.toLocaleString('en-IN');
  };

  return (
    <div style={styles.container}>
      {toast.show && <Toast message={toast.message} type={toast.type} />}
      
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Admin Dashboard</h1>
        <div style={styles.tabs}>
          <button 
            style={activeTab === 'bookings' ? {...styles.tab, ...styles.activeTab} : styles.tab}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fas fa-calendar-check" style={styles.tabIcon}></i>
            Bookings
          </button>
          <button 
            style={activeTab === 'stats' ? {...styles.tab, ...styles.activeTab} : styles.tab}
            onClick={() => setActiveTab('stats')}
          >
            <i className="fas fa-chart-bar" style={styles.tabIcon}></i>
            Analytics
          </button>
          <button 
            style={activeTab === 'rooms' ? {...styles.tab, ...styles.activeTab} : styles.tab}
            onClick={() => setActiveTab('rooms')}
          >
            <i className="fas fa-bed" style={styles.tabIcon}></i>
            Room Management
          </button>
        </div>
      </div>
      
      {activeTab === 'bookings' ? (
        <div style={styles.content}>
          <div style={styles.sectionHeader}>
            <h2>All Bookings</h2>
            <div style={styles.bookingFilters}>
              <div style={styles.searchContainer}>
                <input 
                  type="text" 
                  placeholder="Search by guest or room name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
                <i className="fas fa-search" style={styles.searchIcon}></i>
              </div>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.statusFilter}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Loading bookings...</p>
            </div>
          ) : error ? (
            <div style={styles.errorMessage}>
              <p>{error}</p>
              <button 
                onClick={fetchBookings} 
                style={styles.retryButton}
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No bookings found matching your criteria.</p>
              {(statusFilter !== 'all' || searchTerm) && (
                <button 
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }} 
                  style={styles.clearButton}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div style={styles.bookingsContainer}>
              <div style={styles.bookingCount}>
                Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
              </div>
              <div style={styles.bookings}>
                {filteredBookings.map(booking => (
                  <div key={booking._id} style={styles.booking}>
                    <div style={styles.bookingHeader}>
                      <h3 style={styles.bookingTitle}>
                        {booking.room?.name || 'Room Data Unavailable'}
                      </h3>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(booking.status)
                      }}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div style={styles.bookingInfo}>
                      <div>
                        <p style={styles.infoLabel}>Guest</p>
                        <p style={styles.infoValue}>{booking.user?.name || 'User Data Unavailable'}</p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Check-in</p>
                        <p style={styles.infoValue}>
                          {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Check-out</p>
                        <p style={styles.infoValue}>
                          {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p style={styles.infoLabel}>Amount</p>
                        <p style={styles.infoValue}>
                          ₹{typeof booking.totalPrice === 'number' ? formatIndianPrice(booking.totalPrice) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div style={styles.actions}>
                        <button 
                          onClick={() => handleStatus(booking._id, 'approved')}
                          style={styles.approveButton}
                        >
                          <i className="fas fa-check" style={styles.buttonIcon}></i>
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatus(booking._id, 'rejected')}
                          style={styles.rejectButton}
                        >
                          <i className="fas fa-times" style={styles.buttonIcon}></i>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'stats' ? (
        <DashboardStats stats={stats} />
      ) : (
        <RoomManagement />
      )}
    </div>
  );
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'var(--warning-color)',
    approved: 'var(--success-color)',
    rejected: 'var(--danger-color)'
  };
  return colors[status] || '#6b7280'; // Default color if status is undefined
};

const styles = {
  container: {
    paddingTop: '60px',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderBottom: '1px solid #eaeaea',
  },
  pageTitle: {
    fontSize: '2rem',
    color: '#333',
    maxWidth: '1200px',
    margin: '0 auto 1.5rem',
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#555',
  },
  activeTab: {
    backgroundColor: '#0066cc',
    color: 'white',
    border: '1px solid #0066cc',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  sectionHeader: {
    marginBottom: '1.5rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '3rem',
    textAlign: 'center',
    color: '#666',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  bookingsContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  bookings: {
    display: 'grid',
    gridTemplateColumns: '1fr',
  },
  booking: {
    padding: '1.5rem',
    borderBottom: '1px solid #eaeaea',
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  bookingTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#fff',
  },
  bookingInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  infoLabel: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '0.25rem',
  },
  infoValue: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  approveButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
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
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  tabIcon: {
    marginRight: '8px',
  },
  buttonIcon: {
    marginRight: '5px',
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    paddingRight: '35px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  searchIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
  },
  bookingFilters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  statusFilter: {
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-color)',
  },
  bookingCount: {
    marginBottom: '15px',
    color: 'var(--text-color)',
    fontSize: '0.9rem',
  },
  clearButton: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    marginTop: '15px',
    cursor: 'pointer',
  },
};

export default AdminDashboard;
