// utils/products.js

import axios from 'axios';
import { deleteImage } from './firebasefunctions';

const fetchAdminInfo = async (uid) => {
  const response = await axios.get(`https://alabites-api.vercel.app/admins/query/${uid}`);
  return response.data.data;
};

const fetchStoreId = async (adminuid) => {
  const response = await axios.get(`https://alabites-api.vercel.app/store/query/${adminuid}`);
  return response.data.data.storeId;
};

const fetchProducts = async (storeId) => {
  const response = await axios.get(`https://alabites-api.vercel.app/products/query/${storeId}`);
  return response.data.data;
};

const createProduct = async (productData) => {
  try {
    const response = await axios.post('https://alabites-api.vercel.app/products', JSON.stringify(productData), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

const updateProduct = async (id, productData) => {
  return await axios.put(`https://alabites-api.vercel.app/products/${id}`, productData, {
  });
};

const deleteProduct = async (productId) => {
  try {
    const response = await axios.get(`https://alabites-api.vercel.app/products/${productId}`);
    const productData = response.data.data;
    const photoPath = productData.productPhoto;

    if (photoPath) {
      await deleteImage(photoPath);
    }

    await axios.delete(`https://alabites-api.vercel.app/products/${productId}`);
    console.log(`Product ${productId} and associated image deleted successfully.`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};

const deleteProductPhoto = async (productId, photoIndex) => {
  try {
    const response = await axios.delete(`https://alabites-api.vercel.app/products/${productId}/photo/${photoIndex}`);
    console.log(`Product photo ${photoIndex} deleted successfully for product ${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product photo ${photoIndex} for product ${productId}:`, error);
    throw error;
  }
};

export { fetchAdminInfo, fetchStoreId, fetchProducts, createProduct, updateProduct, deleteProduct, deleteProductPhoto };
