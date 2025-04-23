import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });
      login(data);
      navigate(data.isAdmin ? '/admin' : '/hotels');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>
        
        {error && <div style={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          
          <div style={styles.adminTip}>
            <p>Admin credentials:</p>
            
          </div>
        </form>
        
        <div style={styles.footer}>
          <p>Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '1rem',
  },
  formContainer: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  header: {
    padding: '2rem 2rem 1rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: '#333',
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem',
  },
  form: {
    padding: '1rem 2rem 1.5rem',
  },
  inputGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: '#555',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: 500,
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  footer: {
    borderTop: '1px solid #eee',
    padding: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#666',
  },
  link: {
    color: '#0066cc',
    textDecoration: 'none',
    fontWeight: 500,
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '0.75rem 2rem',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  adminTip: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f1f8ff',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#555',
    border: '1px solid #e1ecf4',
  },
  credentials: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#0066cc',
  }
};

export default Login;
