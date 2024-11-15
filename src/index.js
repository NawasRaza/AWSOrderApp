import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // Only import here
import App from './App';

ReactDOM.render(
  <BrowserRouter>
    <App /> {/* App is wrapped inside BrowserRouter */}
  </BrowserRouter>,
  document.getElementById('root')
);
