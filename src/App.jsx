import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes/router';

const App = () => {
  return (
    <div>
  
      <Router>
        <AppRoutes />
      </Router>
    </div>
  );
};
export default App;