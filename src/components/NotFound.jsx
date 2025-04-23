import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>404</h1>
        <h2 style={styles.subtitle}>Page Not Found</h2>
        <p style={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" style={styles.button}>
          <i className="fas fa-home" style={{ marginRight: '8px' }}></i>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--bg-secondary)',
    padding: '1rem',
    textAlign: 'center',
  },
  content: {
    backgroundColor: 'var(--bg-color)',
    padding: '3rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    fontSize: '6rem',
    color: 'var(--primary-color)',
    margin: '0',
    lineHeight: '1',
  },
  subtitle: {
    fontSize: '1.5rem',
    margin: '0 0 1.5rem',
    color: 'var(--text-color)',
  },
  message: {
    color: '#666',
    marginBottom: '2rem',
  },
  button: {
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  }
};

export default NotFound;
