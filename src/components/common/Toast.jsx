import React from 'react';

const Toast = ({ message, type = 'success' }) => {
  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' && <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>}
      {type === 'error' && <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>}
      {message}
    </div>
  );
};

export default Toast;
