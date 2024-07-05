import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import StoreForm from './components/Dashboard/StoreForm';
import ProfilePage from './components/Dashboard/Profile';
import ProductListPage from './components/Dashboard/ProductsListPage';
import AddTamCredits from './components/overseer/addtamcredits';
import OrdersComponent from './components/Dashboard/Orders';
import HorizontalMenu from './components/Dashboard/HorizontalMenu';
import VerticalMenu from './components/Dashboard/VerticalMenu'; // Import VerticalMenu
import { auth } from './config/firebase';
import './App.css';

function App() {
  const [isVerticalMenuCollapsed, setIsVerticalMenuCollapsed] = useState(true); // Initially collapsed
  const [adminInfo, setAdminInfo] = useState(null);
  const [uid, setUid] = useState(null);

  const toggleMenu = () => {
    setIsVerticalMenuCollapsed(!isVerticalMenuCollapsed);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (uid) {
        try {
          const response = await fetch(`https://alabites-api.vercel.app/admins/query/${uid}`);
          if (response.ok) {
            const data = await response.json();
            const admin = data.data;
            setAdminInfo(admin || null);
          } else {
            const errorMessage = await response.text();
            console.error(`Failed to fetch admins: ${errorMessage}`);
          }
        } catch (error) {
          console.error("Error fetching admins:", error);
        }
      }
    };

    fetchAdminInfo();
  }, [uid]);

  return (
    <ChakraProvider>
      <Router>
        <div className="App">
          <HorizontalMenu toggleMenu={toggleMenu} adminInfo={adminInfo} /> {/* Pass toggleMenu function and adminInfo */}
          <VerticalMenu isCollapsed={isVerticalMenuCollapsed} toggleMenu={toggleMenu} adminInfo={adminInfo} /> {/* Pass isCollapsed state, toggleMenu function, and adminInfo */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/create-store-form" element={<StoreForm />} />
            <Route path="/profile" element={<ProfilePage isCollapsed={isVerticalMenuCollapsed} toggleMenu={toggleMenu} adminInfo={adminInfo} />} />
            <Route path="/products" element={<ProductListPage isCollapsed={isVerticalMenuCollapsed} toggleMenu={toggleMenu} />} />
            <Route path="/add-tam-credits" element={<AddTamCredits />} />
            <Route path="/orders" element={<OrdersComponent />} />
          </Routes>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
