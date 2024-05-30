import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import VerticalMenu from './VerticalMenu';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../config/firebase"; // make sure to import firebase storage

const PencilIcon = (
  <svg
    data-slot="icon"
    fill="none"
    strokeWidth="1.5"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
    ></path>
  </svg>
);

const ProfilePage = () => {
  const [uid, setUid] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      try {
        const response = await fetch(`https://alabites-api.vercel.app/admins/query/${uid}`);
        if (response.ok) {
          const data = await response.json();
          const admin = data.data;
          if (admin) {
            setAdminInfo(admin);
            setFirstName(admin.firstName);
            setLastName(admin.lastName);
            setUsername(admin.username);
            toast.success('Admin information fetched successfully');
          } else {
            toast.error('Admin not found');
          }
        } else {
          const errorMessage = await response.text();
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
  }, [uid]);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true); // Set submitting to true when starting the process
      let updatedAvatar = avatarBase64; // Default to current avatar URL
      
      // Check if there's a new avatar file
      if (avatarFile) {
        // Upload to Firebase Storage
        const storageRef = ref(storage, `admin_avatar/${uid}_${avatarFile.name}`);
        await uploadBytes(storageRef, avatarFile);
  
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log('Download URL:', downloadURL); // Add console log here
        updatedAvatar = downloadURL;
      }
  
      // Prepare updated admin information object
      const updatedAdminInfo = {
        ...adminInfo,
        firstName,
        lastName,
        username,
        avatar: updatedAvatar, // Include updated avatar URL
      };
  
      console.log('Updated Admin Info:', updatedAdminInfo);
  
      // Send updated admin information to the server
      const response = await axios.put(`https://alabites-api.vercel.app/admins/${updatedAdminInfo.uid}`, updatedAdminInfo);
      console.log('Response from server:', response); // Add console log here
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
    } finally {
      setSubmitting(false); // Set submitting back to false regardless of success or failure
    }
  };
  
  
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setAvatarFile(file);
  
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `admin_avatar/${uid}_${file.name}`);
      await uploadBytes(storageRef, file);
  
      // Get the download URL and set it as the avatarBase64
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL:', downloadURL); // Add console log here
      setAvatarBase64(downloadURL);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    }
  };

  const handleDeleteAvatar = async () => {
    if (adminInfo?.avatar) {
      const avatarRef = ref(storage, adminInfo.avatar);
      try {
        // Delete the avatar from Firebase Storage
        await deleteObject(avatarRef);
  
        // Update the admin's avatar field to null in the API
        const updatedAdmin = { ...adminInfo, avatar: null };
        const response = await axios.put(`https://alabites-api.vercel.app/admins/${adminInfo.uid}`, updatedAdmin);
  
        if (response.status === 200) {
          // Update local state to remove the avatar
          setAvatarBase64(null); // Remove the avatar from state
          setAdminInfo((prev) => ({ ...prev, avatar: null }));
          setShowDeleteConfirm(false);
          toast.success('Avatar deleted successfully');
        } else {
          const errorMessage = response.data.message || 'Failed to delete avatar';
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Error deleting avatar:', error);
        toast.error('Error deleting avatar');
      }
    }
  };
  

  return (
    <div className="flex bg-gray-200 min-h-screen">
    <VerticalMenu />
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">User Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
          <div className="relative block overflow-hidden rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
            <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>
            <div className="sm:flex sm:justify-between sm:gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl">UID:</h3>
                <p className="mt-1 text-xs font-medium text-gray-600">{adminInfo?.uid}</p>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl mt-4">Name:</h3>
                <p className="mt-1 text-xs font-medium text-gray-600">{adminInfo?.firstName} {adminInfo?.lastName}</p>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl mt-4">Username:</h3>
                <p className="mt-1 text-xs font-medium text-gray-600">{adminInfo?.username}</p>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl mt-4">Email:</h3>
                <p className="mt-1 text-xs font-medium text-gray-600">{adminInfo?.email}</p>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl mt-4">Role:</h3>
                <p className="mt-1 text-xs font-medium text-gray-600">{adminInfo?.role}</p>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl mt-4">Update Date:</h3>
                <p className="mt-1 text-xs font-medium text-gray-600">{adminInfo?.updatedAt}</p>
                <h3 className="text-lg font-bold text-gray-900 sm:text-xl mt-4">Created Date:</h3>
                <p className="mt-1 text-xs font-medium text-gray-600">{adminInfo?.createdAt}</p>
              </div>
              <div className="hidden sm:block sm:shrink-0">
                {adminInfo?.avatar && (
                  <img
                    alt="Avatar"
                    src={adminInfo?.avatar}
                    className="w-24 h-24 rounded-lg object-cover shadow-sm"
                  />
                )}
              </div>
            </div>
          </div>
          <div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-0 right-0 w-6 h-6 mt-2 cursor-pointer"
            onClick={openModal}
          >
            {PencilIcon}
          </motion.div>
        </div>
        </div>
        {showModal && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50"
  >
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-lg font-semibold mb-4">Edit Admin Information</h2>
      {adminInfo?.avatar && (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Current Avatar:</h3>
          <img
            src={adminInfo?.avatar}
            alt="Current Avatar"
            className="mt-2 rounded-lg object-cover shadow-sm"
            style={{ width: '100px', height: '100px' }}
          />
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Avatar
          </button>
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {avatarBase64 && (
        <img
          src={avatarBase64}
          alt="Uploaded Avatar"
          className="mt-4 rounded"
          style={{ maxWidth: '100px', maxHeight: '100px' }}
        />
      )}
      <div className="mt-4">
        <label className="block text-gray-600 font-semibold">First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="text-gray-800 border-b-2 focus:outline-none"
        />
      </div>
      <div className="mt-4">
        <label className="block text-gray-600 font-semibold">Last Name:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="text-gray-800 border-b-2 focus:outline-none"
        />
      </div>
      <div className="mt-4">
        <label className="block text-gray-600 font-semibold">Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="text-gray-800 border-b-2 focus:outline-none"
        />
      </div>
      <div className="flex justify-end mt-6">
      <button
  onClick={handleSubmit}
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
  disabled={submitting} // Disable the button when submitting is true
>
  {submitting ? 'Processing...' : 'Submit'}
</button>
      

        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </motion.div>
)}

          {showDeleteConfirm && (
            <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-gray-500 bg-opacity-50">
              <div className="bg-white rounded-lg p-8">
                <h2 className="text-lg font-semibold mb-4">Delete Current Avatar</h2>
                <p className="text-gray-800 mb-4">Are you sure you want to delete your current avatar? This action cannot be undone.</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAvatar}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete Avatar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProfilePage;
