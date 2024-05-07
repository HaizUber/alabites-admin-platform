import React, { useState, useEffect } from 'react';
import VerticalMenu from './VerticalMenu'; // Import VerticalMenu component
import { auth } from '../../config/firebase'; // Import Firebase auth
import { toast, ToastContainer } from 'react-toastify'; // Import toast notification and ToastContainer

const AdminDashboard = () => {
  const [uid, setUid] = useState(null); // State to store UID
  const [adminInfo, setAdminInfo] = useState(null); // State to store admin information

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUid(user.uid); // Set UID if user is logged in
      } else {
        setUid(null); // Set UID to null if user is logged out
      }
    });

    return () => unsubscribe(); // Unsubscribe from auth state changes on unmount
  }, []); // Empty dependency array to run effect only once

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
          const response = await fetch(`https://alabites-api.vercel.app/admins/query/${uid}`);
          if (response.ok) {
              const data = await response.json();
              console.log('Response data:', data); // Log the response data
              const admin = data.data; // Access the admin object directly
              if (admin) {
                  setAdminInfo(admin);
                  toast.success('Admin information fetched successfully');
              } else {
                  toast.error('Admin not found');
              }
          } else {
              const errorMessage = await response.text(); // Get the error message from the response
              toast.error(`Failed to fetch admins: ${errorMessage}`);
          }
      } catch (error) {
          console.error('Error fetching admins:', error);
          toast.error('Error fetching admins');
      }
  };
    if (uid) {
      fetchAdminInfo();
    }
  }, [uid]); // Dependency on UID to fetch admin information

  return (
    <div className="flex bg-gray-200 min-h-screen"> 
      <VerticalMenu />
      <div className="flex flex-col flex-1 bg-gray-100 border-l border-gray-100 p-3">
  
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-3">
  <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-orange-500 to-orange-300 bg-opacity-70">
    <dt className="order-last text-lg font-medium text-gray-100">Total Products Sold</dt>
    <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">1,234</dd>
  </div>

  <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-teal-500 to-teal-300 bg-opacity-70">
    <dt className="order-last text-lg font-medium text-gray-100">Products Available</dt>
    <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">567</dd>
  </div>

  <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-purple-500 to-purple-300 bg-opacity-70">
    <dt className="order-last text-lg font-medium text-gray-100">Total Sales</dt>
    <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">$890</dd>
  </div>

  <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-blue-500 to-blue-300 bg-opacity-70">
    <dt className="order-last text-lg font-medium text-gray-100">Total Sales in the last 7 Days</dt>
    <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">$123</dd>
  </div>
</div>

  
        <ToastContainer />
      </div>
    </div>

  );
}

export default AdminDashboard;