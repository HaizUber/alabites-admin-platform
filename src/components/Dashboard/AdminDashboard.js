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
        const response = await fetch('https://alabites-api.vercel.app/admins');
        if (response.ok) {
          const data = await response.json();
          const admin = data.data.find(admin => admin.uid === uid);
          if (admin) {
            setAdminInfo(admin);
          } else {
            toast.error('Admin not found');
          }
        } else {
          toast.error('Failed to fetch admins');
        }
      } catch (error) {
        toast.error('Error fetching admins: ' + error.message);
      }
    };

    if (uid) {
      fetchAdminInfo();
    }
  }, [uid]); // Dependency on UID to fetch admin information

  return (
<div className="flex bg-gray-200 min-h-screen"> 
  <VerticalMenu />
  <div className="flex flex-col flex-1 bg-gray-100 border-l border-gray-100"> 
    <div className="bg-white shadow rounded-lg p-4 mb-4"> 
      <h1 className="text-center text-2xl font-bold text-green-700 sm:text-2xl text">Dashboard</h1> 
    </div>
    {/* Add your dashboard elements here */}
    <div className="flex flex-col p-4">
      {/* Example Dashboard Elements inside rounded boxes */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        {/* Content */}
      </div>
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        {/* Content */}
      </div>
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        {/* Content */}
      </div>
    </div>
  </div>
  <ToastContainer />
</div>



  );
}

export default AdminDashboard;
