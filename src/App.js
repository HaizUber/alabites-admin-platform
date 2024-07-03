import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import StoreForm from './components/Dashboard/StoreForm';
import ProfilePage from './components/Dashboard/Profile';
import ProductListPage from './components/Dashboard/Products';
import AddTamCredits from './components/overseer/addtamcredits';
import OrdersComponent from './components/Dashboard/Orders';
import HorizontalMenu from './components/Dashboard/HorizontalMenu';
import VerticalMenu from './components/Dashboard/VerticalMenu'; // Import VerticalMenu
import './App.css';

function App() {
  const [isVerticalMenuCollapsed, setIsVerticalMenuCollapsed] = useState(window.innerWidth < 768);

  const toggleMenu = () => {
    setIsVerticalMenuCollapsed(!isVerticalMenuCollapsed);
  };

  return (
    <ChakraProvider>
      <Router>
        <div className="App">
          <HorizontalMenu toggleMenu={toggleMenu} /> {/* Pass toggleMenu function */}
          <VerticalMenu isCollapsed={isVerticalMenuCollapsed} toggleMenu={toggleMenu} /> {/* Pass isCollapsed state and toggleMenu function */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/create-store-form" element={<StoreForm />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/add-tam-credits" element={<AddTamCredits />} />
            <Route path="/orders" element={<OrdersComponent />} />
          </Routes>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
