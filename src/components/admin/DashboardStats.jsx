import React from 'react';

const DashboardStats = ({ stats }) => {
  // Format number to Indian currency format
  const formatIndianPrice = (price) => {
    return price.toLocaleString('en-IN');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dashboard Analytics</h2>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <i className="fas fa-calendar-check"></i>
          </div>
          <div style={styles.statInfo}>
            <h3 style={styles.statTitle}>Total Bookings</h3>
            <p style={styles.statValue}>{stats.totalBookings || 0}</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div style={styles.statInfo}>
            <h3 style={styles.statTitle}>Total Revenue</h3>
            <p style={styles.statValue}>₹{formatIndianPrice(stats.totalRevenue || 0)}</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>
            <i className="fas fa-clock"></i>
          </div>
          <div style={styles.statInfo}>
            <h3 style={styles.statTitle}>Pending Bookings</h3>
            <p style={styles.statValue}>{stats.statusCounts?.pending || 0}</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}>
            <i className="fas fa-calendar-day"></i>
          </div>
          <div style={styles.statInfo}>
            <h3 style={styles.statTitle}>Today's Check-ins</h3>
            <p style={styles.statValue}>{stats.todayBookings || 0}</p>
          </div>
        </div>
      </div>
      
      <h3 style={styles.sectionTitle}>Status Breakdown</h3>
      <div style={styles.statusChart}>
        <div style={styles.chartLabels}>
          <div style={styles.chartLabel}>
            <div style={{...styles.statusDot, backgroundColor: '#f59e0b'}}></div>
            <span>Pending</span>
            <span style={styles.labelCount}>{stats.statusCounts?.pending || 0}</span>
          </div>
          <div style={styles.chartLabel}>
            <div style={{...styles.statusDot, backgroundColor: '#10b981'}}></div>
            <span>Approved</span>
            <span style={styles.labelCount}>{stats.statusCounts?.approved || 0}</span>
          </div>
          <div style={styles.chartLabel}>
            <div style={{...styles.statusDot, backgroundColor: '#ef4444'}}></div>
            <span>Rejected</span>
            <span style={styles.labelCount}>{stats.statusCounts?.rejected || 0}</span>
          </div>
        </div>
        
        <div style={styles.barChart}>
          {renderBarChart(stats.statusCounts)}
        </div>
      </div>
    </div>
  );
};

const renderBarChart = (statusCounts) => {
  if (!statusCounts) return null;
  
  const total = (statusCounts.pending || 0) + (statusCounts.approved || 0) + (statusCounts.rejected || 0);
  if (total === 0) return <div>No data available</div>;
  
  const pendingPercent = ((statusCounts.pending || 0) / total) * 100;
  const approvedPercent = ((statusCounts.approved || 0) / total) * 100;
  const rejectedPercent = ((statusCounts.rejected || 0) / total) * 100;
  
  return (
    <div style={styles.barContainer}>
      <div style={{...styles.bar, width: `${pendingPercent}%`, backgroundColor: '#f59e0b'}}></div>
      <div style={{...styles.bar, width: `${approvedPercent}%`, backgroundColor: '#10b981'}}></div>
      <div style={{...styles.bar, width: `${rejectedPercent}%`, backgroundColor: '#ef4444'}}></div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  title: {
    marginBottom: '2rem',
    color: 'var(--text-color)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    backgroundColor: 'var(--bg-color)',
    borderRadius: '8px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    color: 'var(--primary-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginRight: '1rem',
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    color: 'var(--text-color)',
    margin: 0,
    fontSize: '0.9rem',
    opacity: 0.7,
  },
  statValue: {
    color: 'var(--text-color)',
    margin: '0.25rem 0 0 0',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginBottom: '1.5rem',
    color: 'var(--text-color)',
  },
  statusChart: {
    backgroundColor: 'var(--bg-color)',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  chartLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  chartLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: 'var(--text-color)',
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  labelCount: {
    marginLeft: '5px',
    fontWeight: 'bold',
  },
  barChart: {
    marginTop: '1rem',
  },
  barContainer: {
    display: 'flex',
    height: '24px',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    transition: 'width 0.5s ease-in-out',
  },
};

export default DashboardStats;
