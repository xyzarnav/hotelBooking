import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    initialWallet: 50000
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        wallet: Number(formData.initialWallet)
      });
      login(data);
      navigate('/hotels');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          style={styles.input}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          style={styles.input}
          required
        />
        
        <div style={styles.walletSection}>
          <label style={styles.walletLabel}>Initial Wallet Amount (₹)</label>
          <input
            type="number"
            placeholder="Initial wallet amount"
            value={formData.initialWallet}
            onChange={(e) => setFormData({...formData, initialWallet: e.target.value})}
            style={styles.input}
            min="10000"
            max="1000000"
            required
          />
          <p style={styles.walletHint}>Add between ₹10,000 and ₹10,00,000 to your wallet</p>
        </div>
        
        <button type="submit" style={styles.button}>Register</button>
        
        <div style={styles.adminInfo}>
          <p>
            Admin Login: <br/>
            Email: admin@hotel.com <br/>
            Password: admin123
          </p>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '300px',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  walletSection: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  walletLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  walletHint: {
    fontSize: '0.8rem',
    color: '#666',
    margin: '5px 0 0 0',
  },
  adminInfo: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    fontSize: '0.85rem',
    textAlign: 'center',
    borderLeft: '4px solid #007bff',
  }
};

export default Register;
