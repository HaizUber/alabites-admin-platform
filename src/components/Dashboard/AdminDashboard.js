import React, { useState, useEffect } from 'react';
import VerticalMenu from './VerticalMenu';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const [uid, setUid] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [hasStore, setHasStore] = useState(false); // State to track if the admin has a store

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
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
            toast.success('Admin information fetched successfully');
            const storeResponse = await fetch('https://alabites-api.vercel.app/store');
            if (storeResponse.ok) {
              const storeData = await storeResponse.json();
              const hasStore = storeData.data.some(store => store.storeOwner === admin.uid);
              if (!hasStore) {
                setShowModal(true); // Show the modal if the admin doesn't have a store
              }
            } else {
              toast.error('Failed to fetch stores');
            }
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
  
  
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleCreateStore = () => {
    setShowModal(false); // Close the modal
    navigate('/create-store-form'); // Redirect to create-store-form route
  };

  return (
    <div className="flex bg-gray-200 min-h-screen">
      <VerticalMenu />
      <div className="flex flex-col flex-1 bg-gray-100 border-l border-gray-100 p-3">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-3">
          <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-orange-500 to-orange-300 bg-opacity-70">
            <dt className="order-last text-lg font-medium text-gray-100">Total Products Sold</dt>
            <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">1,234</dd>
          </div>
          {/* Other dashboard components */}
        </div>
        <ToastContainer />
        {/* Modal */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      {/* Pencil Icon */}
                      <svg
                        data-slot="icon"
                        fill="none"
                        stroke-width="1.5"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className="h-6 w-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        ></path>
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Create Store</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">You don't have a store yet. Would you like to create one?</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleCreateStore}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Store
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
