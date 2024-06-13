import React, { useState } from 'react';
import axios from 'axios';
import VerticalMenu from '../Dashboard/VerticalMenu';

const AddTamCredits = () => {
  const [uid, setUid] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTamCredits = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`https://alabites-api.vercel.app/admins/${uid}/add-currency`, {
        uid,
        amount,
        description: 'Adding credits' // Add a description if necessary
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      console.log('Tam credits added successfully:', response.data);
    } catch (error) {
      console.error('Error adding Tam credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex">
      <div className="w-1/4 p-4">
        <VerticalMenu />
      </div>
      <div className="w-3/4 p-4">
        <h1 className="text-3xl font-semibold mb-6">Add Tam Credits</h1>
        <form onSubmit={handleAddTamCredits}>
          <div className="mb-4">
            <label htmlFor="uid" className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              id="uid"
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              className="mt-1 p-2 border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 p-2 border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md px-4 py-2 text-sm font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add TamCredits'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTamCredits;
