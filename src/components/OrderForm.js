// OrderForm.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './OrderForm.css'; // Separate CSS for OrderForm component

function OrderForm() {
  const [formData, setFormData] = useState({ item_id: '', quantity: 1, customer_email: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Processing order...');
    setIsError(false); // Reset error state on submit

    try {
      const response = await fetch('YOUR-API-KEY', {  // Correct endpoint for processing order
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      
      if (response.ok) {
        setMessage(`Order confirmed: ${result.message}`);
        setIsError(false);
        // Optionally, reset form data after successful order
        setFormData({ item_id: '', quantity: 1, customer_email: '' });
      } else {
        setMessage(`Error: ${result.message}`);
        setIsError(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Oops! Something went wrong, please try again.');
      setIsError(true);
    }
  };

  return (
    <div className="order-form-container">
      {/* Go Back Button */}
      <div className="go-back-button">
        <Link to="/">
          <button className="back-btn">Go Back to Products</button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <h2>Place Your Order</h2>
        
        <label>Item ID:</label>
        <input type="text" name="item_id" value={formData.item_id} onChange={handleChange} required />

        <label>Quantity:</label>
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required />

        <label>Customer Email:</label>
        <input type="email" name="customer_email" value={formData.customer_email} onChange={handleChange} required />

        <button type="submit">Submit Order</button>
        
        {message && (
          <div className={`message ${isError ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default OrderForm;
