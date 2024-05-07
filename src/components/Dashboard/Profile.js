import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase'; // Import Firebase auth
import { toast, ToastContainer } from 'react-toastify'; // Import toast notification and ToastContainer
import 'react-toastify/dist/ReactToastify.css';

// Define the SVG icon as a constant
const PencilIcon = (
  <svg data-slot="icon" fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"></path>
  </svg>
);

const ProfilePage = () => {
    const [uid, setUid] = useState(null); // State to store UID
    const [adminInfo, setAdminInfo] = useState(null); // State to store admin information
    const [showModal, setShowModal] = useState(false); // State to control modal visibility
  
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

    // Function to handle opening the modal
    const openModal = () => {
      setShowModal(true);
    };

    // Function to handle closing the modal
    const closeModal = () => {
      setShowModal(false);
    };
    const handleSubmit = async (updatedAdminInfo) => {
        try {
          const response = await axios.put(`https://alabites-api.vercel.app/admins/${updatedAdminInfo.uid}`, updatedAdminInfo);
          if (response.status === 200) {
            toast.success('Admin information updated successfully');
            closeModal(); // Close the modal after successful update
          } else {
            const errorMessage = response.data.message || 'Failed to update admin information';
            toast.error(errorMessage);
          }
        } catch (error) {
          console.error('Error updating admin information:', error);
          toast.error('Error updating admin information');
        }
      };
      

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <div className="bg-white rounded shadow p-6">
                <h2 className="text-lg font-semibold mb-4">User Information</h2>
                {/* Main div for user information with pencil icon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    <div>
                        <label className="block text-gray-600 font-semibold">First Name:</label>
                        <span className="text-gray-800">{adminInfo?.firstName}</span>
                    </div>
                    <div>
                        <label className="block text-gray-600 font-semibold">Last Name:</label>
                        <span className="text-gray-800">{adminInfo?.lastName}</span>
                    </div>
                    <div>
                        <label className="block text-gray-600 font-semibold">Email:</label>
                        <span className="text-gray-800">{adminInfo?.email}</span>
                    </div>
                    <div>
                        <label className="block text-gray-600 font-semibold">Username:</label>
                        <span className="text-gray-800">{adminInfo?.username}</span>
                    </div>
                    {/* Pencil icon to trigger modal */}
                    <div className="absolute top-0 right-0 w-6 h-6 mt-2 cursor-pointer" onClick={openModal}>
                      {PencilIcon}
                    </div>
                </div>
            </div>
            {/* Modal for editing admin information */}
            {showModal && (
              <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50">
                <div className="bg-white rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Edit Admin Information</h2>
                  {/* Editable fields */}
                 <input type="text" value={adminInfo.firstName} onChange={(e) => setAdminInfo({ ...adminInfo, firstName: e.target.value })} /> 
                  <button onClick={() => handleSubmit(adminInfo)}>Submit</button>
                  <button onClick={closeModal}>Cancel</button>
                </div>
              </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default ProfilePage;
