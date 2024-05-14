import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

const AddProductForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        store: '',
        category: '',
        image: '',
    });

    const handleChange = async (e) => {
        if (e.target.type === 'file') {
            try {
                const compressedImage = await compressImage(e.target.files[0]);
                const base64Image = await convertImageToBase64(compressedImage);
                setFormData({ ...formData, image: base64Image });
    
                // Log the size of the compressed image in MB
                const sizeInMB = compressedImage.size / 1024 / 1024;
                console.log('Compressed image size:', sizeInMB.toFixed(2), 'MB');
            } catch (error) {
                console.error('Error handling image:', error);
            }
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.image) {
                console.error('Please select an image.');
                return;
            }
    
            const formDataWithImage = {
                ...formData,
                photoReference: formData.image, // Use the base64 converted image as photoReference
                image: '' // Clear the image field as it's no longer needed
            };
    
            onSubmit(formDataWithImage); // Send form data with base64 image to the backend
            console.log("Form data with image:", formDataWithImage);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    

    const compressImage = async (imageFile) => {
        try {
            const options = {
                maxSizeMB: 0.065, // Maximum size in MB (65KB)
                maxWidthOrHeight: 1920, // Maximum width or height
                useWebWorker: true // Use WebWorker for faster compression
            };            
            const compressedFile = await imageCompression(imageFile, options);
            return compressedFile;
        } catch (error) {
            throw error;
        }
    };

    const convertImageToBase64 = (imageFile) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(imageFile);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto mt-8">
            <label className="block mb-4">
                <span className="text-gray-700">Product Name:</span>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input mt-1 block w-full" />
            </label>
            <label className="block mb-4">
                <span className="text-gray-700">Description:</span>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="form-input mt-1 block w-full" />
            </label>
            <label className="block mb-4">
                <span className="text-gray-700">Price:</span>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-input mt-1 block w-full" />
            </label>
            <label className="block mb-4">
                <span className="text-gray-700">Store:</span>
                <input type="text" name="store" value={formData.store} onChange={handleChange} className="form-input mt-1 block w-full" />
            </label>
            <label className="block mb-4">
                <span className="text-gray-700">Category:</span>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="form-input mt-1 block w-full" />
            </label>
            <label className="block mb-4">
                <span className="text-gray-700">Image:</span>
                <input type="file" accept="image/*" onChange={handleChange} className="form-input mt-1 block w-full" />
            </label>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300">Add Product</button>
        </form>
    );
};

export default AddProductForm;
