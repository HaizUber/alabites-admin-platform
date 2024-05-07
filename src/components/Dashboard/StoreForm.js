import React, { useState, useEffect } from 'react';
import { auth } from '../../config/firebase'; // Import Firebase auth
import axios from 'axios'; // Import Axios
import { toast, ToastContainer } from 'react-toastify'; // Import toast notification and ToastContainer
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const StoreForm = () => {
  const [formData, setFormData] = useState({
    storeName: '',
    storeType: '',
    description: ''
  });
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [uid, setUid] = useState(null); // State to store UID

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
                if (data.data) {
                    const admin = data.data;
                    setUsername(admin.username); // Update username state with admin's username
                    toast.success('Admin information fetched successfully');
                } else {
                    setUsername('Merchant'); // Set default username if admin not found
                    toast.error('Admin not found');
                }
            } else {
                setUsername('Merchant'); // Set default username in case of failed request
                toast.error('Failed to fetch admins');
            }
        } catch (error) {
            setUsername('Merchant'); // Set default username in case of error
            toast.error('Error fetching admins: ' + error.message);
        }
    };

    if (uid) {
        fetchAdminInfo();
    }
}, [uid]); // Dependency on UID to fetch admin information

  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const generateStoreId = async () => {
    const prefix = "4000";
    let storeId;
  
    do {
      const randomDigits = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit number
      storeId = prefix + randomDigits;
      console.log(storeId);
  
      try {
        // Check if storeId exists by sending a GET request
        const response = await axios.get(`https://alabites-api.vercel.app/store/query/${storeId}`);
        
        // If storeId does not exist (returns 404), break out of the loop
        if (response.status === 404) {
          break;
        }
      } catch (error) {
        // Check if the error response status code is 404, if so, break out of the loop
        if (error.response && error.response.status === 404) {
          break;
        }
        
        // Log any other errors encountered during the GET request
        console.error("Error checking storeID:", error);
      }
    } while (true);
  
    return storeId;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Function to get the UID of the current user from the API
      const getCurrentUserUid = async () => {
        try {
          // Make a request to your backend API to fetch the UID of the current user
          const response = await fetch(`https://alabites-api.vercel.app/admins/query/${auth.currentUser.uid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              return data.data.uid;
            } else {
              throw new Error('UID not found for the current user');
            }
          } else {
            throw new Error('Failed to fetch UID for the current user');
          }
        } catch (error) {
          throw new Error('Error fetching UID for the current user: ' + error.message);
        }
      };
  
      // Get the UID of the current user
      const storeOwnerUid = await getCurrentUserUid();
  
      // Generate a unique store ID
      const storeId = await generateStoreId(); // Await for the storeId generation
  
      // Prepare the data for store creation in a structured way
      const storeData = {
        storeName: formData.storeName,
        storeType: formData.storeType,
        description: formData.description,
        storeOwner: storeOwnerUid, // Include the uid as storeOwner
        storeId: storeId // Include the generated storeId
      };
  
      console.log('StoreData:', storeData); // Log storeData before sending the request
  
      // Send the storeData to the backend API for store creation
      await axios.post('https://alabites-api.vercel.app/store', storeData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Show success toast with a timeout
      toast.success("Store creation successful! Redirecting...", {
        autoClose: 3500, // Auto close the toast after 3.5 seconds
      });
  
      // Redirect the user to the admin dashboard after 3.5 seconds
      setTimeout(() => {
        navigate('/dashboard'); // Redirect to admin dashboard after 3.5 seconds
      }, 3500);
    } catch (error) {
      console.error('Error creating store:', error.message);
      toast.error('Failed to create store');
    }
  };
  
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-semibold mb-4">Welcome, {username || 'Merchant'}</h1>
      <h2 className="text-xl font-semibold mb-4">Create a New Store</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="storeName" className="block">Store Name:</label>
          <input type="text" id="storeName" name="storeName" value={formData.storeName} onChange={handleChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" />
        </div>
        <div>
          <label htmlFor="storeType" className="block">Store Cuisine:</label>
          <input type="text" id="storeType" name="storeType" value={formData.storeType} onChange={handleChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" />
        </div>
        <div>
          <label htmlFor="description" className="block">Description:</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" />
        </div>
        <button type="submit" className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Create Store</button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default StoreForm;
