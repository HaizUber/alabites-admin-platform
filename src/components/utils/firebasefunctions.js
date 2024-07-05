// utils/firebasefunctions.js

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../config/firebase';

const uploadImage = async (file, productName) => {
  const fileId = uuidv4();
  const fileName = `${productName.replace(/\s+/g, '-')}-${fileId}`;
  const storageRef = ref(storage, `product_photos/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

const deleteImage = async (photoPath) => {
  const storageRef = ref(storage, photoPath);

  try {
    await deleteObject(storageRef);
    console.log(`Image ${photoPath} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting image:', error.message);
    throw new Error('Failed to delete image');
  }
};

export { uploadImage, deleteImage };
