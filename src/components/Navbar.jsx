import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Format number to Indian currency format
  const formatIndianPrice = (price) => {
    return price?.toLocaleString('en-IN') || 0;
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav style={{...styles.nav, ...(scrolled ? styles.navScrolled : {})}}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <i className="fas fa-hotel" style={styles.brandIcon}></i>
          Luxury Hotels India
        </Link>
        
        <div style={styles.rightSection}>
          <button onClick={toggleTheme} style={styles.themeToggle} aria-label="Toggle theme">
            {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </button>
          
          <button 
            style={styles.mobileMenuButton} 
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation menu"
          >
            <i className={mobileMenu ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
          
          <div style={{
            ...styles.links,
            ...styles.desktopLinks
          }}>
            {renderNavLinks()}
          </div>
        </div>
      </div>
      
      {mobileMenu && (
        <div style={styles.mobileLinks}>
          {renderNavLinks()}
        </div>
      )}
    </nav>
  );
  
  function renderNavLinks() {
    return user ? (
      <>
        <Link to="/hotels" style={styles.link}>Browse Hotels</Link>
        <Link to="/dashboard" style={styles.link}>My Bookings</Link>
        <Link to="/add-wallet" style={styles.walletLink}>
          <span style={styles.wallet}>₹{formatIndianPrice(user.wallet)}</span>
        </Link>
        {user.isAdmin && (
          <Link to="/admin" style={styles.adminLink}>Admin Panel</Link>
        )}
        <button onClick={handleLogout} style={styles.button}>Logout</button>
      </>
    ) : (
      <>
        <Link to="/login" style={styles.link}>Login</Link>
        <Link to="/register" style={styles.signupButton}>Sign Up</Link>
      </>
    );
  }
}

const styles = {
  nav: {
    backgroundColor: 'var(--bg-color)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: 'box-shadow 0.3s ease, padding 0.3s ease',
  },
  navScrolled: {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    padding: '0.5rem 0',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0.75rem 1rem',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  brand: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--text-color)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  brandIcon: {
    marginRight: '0.5rem',
    color: 'var(--primary-color)',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
  },
  desktopLinks: {
    gap: '1.5rem',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  mobileLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-color)',
    borderTop: '1px solid var(--border-color)',
    '@media (min-width: 769px)': {
      display: 'none',
    },
  },
  mobileMenuButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-color)',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'block',
    },
  },
  themeToggle: {
    background: 'none',
    border: 'none',
    color: 'var(--text-color)',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  link: {
    color: 'var(--text-color)',
    fontSize: '0.95rem',
    textDecoration: 'none',
    padding: '0.25rem 0',
    transition: 'color 0.2s',
    '&:hover': {
      color: 'var(--primary-color)',
    },
  },
  walletLink: {
    backgroundColor: 'var(--secondary-color)',
    borderRadius: '4px',
    padding: '0.4rem 0.8rem',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    border: '1px solid var(--border-color)',
  },
  wallet: {
    color: 'var(--primary-color)',
    fontWeight: 'bold',
    fontSize: '0.95rem',
  },
  adminLink: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '0.95rem',
  },
  button: {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-color)',
    border: '1px solid var(--border-color)',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  signupButton: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '0.95rem',
  }
};

export default Navbar;
