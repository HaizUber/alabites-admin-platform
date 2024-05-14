import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login'; // Import Login component
import Register from './components/Auth/Register'; // Import Register component
import AdminDashboard from './components/Dashboard/AdminDashboard'; // Import AdminDashboard component
import StoreForm from './components/Dashboard/StoreForm'; 
import ProfilePage from './components/Dashboard/Profile';
import ProductListPage from './components/Dashboard/Products';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        
        <Routes>
          <Route path="/" element={<Login />} /> {/* Route for login page */}
          <Route path="/login" element={<Login />} /> {/* Route for login page */}
          <Route path="/register" element={<Register />} /> {/* Route for register page */}
          <Route path="/dashboard" element={<AdminDashboard />} /> {/* Route for AdminDashboard */}
          <Route path="/create-store-form" element={<StoreForm />} /> {/* Route for StoreForm */}
          <Route path="/profile" element={<ProfilePage />} /> {/* Route for ProfilePage */}
          <Route path="/products" element={<ProductListPage />} /> {/* Route for ProductListPage */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
