import React from 'react';
import './App.css';  // Your custom styles
import { Route, Routes } from 'react-router-dom'; // Import only Routes and Route here
import ProductList from './components/ProductList';
import OrderForm from './components/OrderForm';
import { Authenticator } from '@aws-amplify/ui-react';  // Updated import
import '@aws-amplify/ui-react/styles.css';  // Import default Amplify UI styles
import { Amplify } from 'aws-amplify';  // Corrected import for Amplify
import awsconfig from './aws-exports';  // Your AWS configuration

// Configure AWS Amplify with the provided settings
Amplify.configure(awsconfig);

function App() {
  return (
    <div className="app">
      {/* Use the Authenticator component to wrap your routes */}
      <Authenticator>
        {({ signOut, user }) => (
          <>
            {/* Show user info and sign out button */}
            <div>
              <button onClick={signOut}>Sign Out</button>
            </div>
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/order" element={<OrderForm />} />
            </Routes>
          </>
        )}
      </Authenticator>
    </div>
  );
}

export default App;
