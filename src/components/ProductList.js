import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('YOUR-API-KEY');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="products">
      <h2>Available Products</h2>
      <div className="product-list">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.ItemId} className="product-item">
              <span className="product-name">{product.name}</span>
              <div className="product-info">
                ID: {product.ItemId}<br />
                Stock: {product.stock}<br />
                Price: ${product.price ? product.price.toFixed(2) : 'N/A'}
              </div>
            </div>
          ))
        ) : (
          <div>No products available</div>
        )}
      </div>
      <Link to="/order">
        <button className="order-button">Click Here to Order</button>
      </Link>
    </div>
  );
}

export default ProductList;
