import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AddWallet() {
  const [amount, setAmount] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      const newBalance = user.wallet + Number(amount);
      
      await axios.put(
        'http://localhost:5000/api/users/wallet',
        { amount: newBalance },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Update user in context
      const updatedUser = { ...user, wallet: newBalance };
      login(updatedUser);
      
      alert(`₹${amount.toLocaleString('en-IN')} has been added to your wallet!`);
      navigate('/hotels');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding funds');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Add Money to Wallet</h1>
        <p style={styles.currentBalance}>
          Current Balance: <span style={styles.amount}>₹{user?.wallet.toLocaleString('en-IN') || 0}</span>
        </p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="amount" style={styles.label}>Amount to Add (₹)</label>
            <input
              id="amount"
              type="number"
              min="1000"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in INR"
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.quickAmounts}>
            <button type="button" style={styles.quickButton} onClick={() => setAmount('5000')}>+ ₹5,000</button>
            <button type="button" style={styles.quickButton} onClick={() => setAmount('10000')}>+ ₹10,000</button>
            <button type="button" style={styles.quickButton} onClick={() => setAmount('25000')}>+ ₹25,000</button>
            <button type="button" style={styles.quickButton} onClick={() => setAmount('50000')}>+ ₹50,000</button>
          </div>
          
          <button type="submit" style={styles.button}>Add Funds</button>
          <button 
            type="button" 
            onClick={() => navigate('/hotels')}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </form>
        
        <div style={styles.info}>
          <p>Note: This is a simulation. In a real application, this would connect to a payment gateway like Razorpay or PayTM.</p>
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
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    padding: '2rem',
  },
  title: {
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#333'
  },
  currentBalance: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  amount: {
    fontWeight: 'bold',
    color: '#4CAF50',
    fontSize: '1.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: 'bold',
    color: '#555'
  },
  input: {
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  info: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    borderLeft: '4px solid #4CAF50',
    fontSize: '0.9rem',
    color: '#666'
  },
  quickAmounts: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '20px',
  },
  quickButton: {
    backgroundColor: '#f1f1f1',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color:"#000"
    
  },
};

export default AddWallet;
