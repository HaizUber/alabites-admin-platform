import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase'; // Import Firebase auth
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerticalMenu from './VerticalMenu';

const ProductListPage = () => {
  const [uid, setUid] = useState(null);
  const [adminuid, setAdminuid] = useState(null);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storeExists, setStoreExists] = useState(true); // Set initial state to true
  
  // Define formData state to store form input values
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    productPrice: '',
    productCategory: '',
    productPhoto: '', // Add a state for the product photo base64 string
  });

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
            setAdminuid(admin.uid);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch store ID first
        const storeResponse = await axios.get(`https://alabites-api.vercel.app/store/query/${adminuid}`);
        const { storeId } = storeResponse.data.data;
        console.log('Store ID:', storeId);
  
        const response = await axios.get(`https://alabites-api.vercel.app/products/query/${storeId}`);
        if (response.status === 200) {
          const { data } = response;
          console.log('Products:', data);
  
          if (data && data.length > 0) {
            setProducts(data);
          } else {
            setStoreExists(false); // Set storeExists to false if no products are found
          }
          setLoading(false);
        } else if (response.status === 404) {
          setStoreExists(false);
          setLoading(false);
        } else {
          toast.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Error fetching products');
  
        if (error.response && error.response.status === 404) {
          setStoreExists(false);
          setLoading(false);
        }
      }
    };
  
    if (adminuid) {
      fetchData();
    }
  }, [adminuid]);
  
  

  const handleCreateProduct = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
  
    try {
      const maxWidthOrHeight = 564; // Maximum width or height of the resized image
  
      const img = new Image();
      img.src = URL.createObjectURL(file);
  
      img.onload = async () => {
        let resizedWidth = img.width;
        let resizedHeight = img.height;
  
        if (resizedWidth > maxWidthOrHeight || resizedHeight > maxWidthOrHeight) {
          if (resizedWidth > resizedHeight) {
            resizedWidth = maxWidthOrHeight;
            resizedHeight = Math.round((maxWidthOrHeight * img.height) / img.width);
          } else {
            resizedHeight = maxWidthOrHeight;
            resizedWidth = Math.round((maxWidthOrHeight * img.width) / img.height);
          }
        }
  
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        canvas.width = resizedWidth;
        canvas.height = resizedHeight;
  
        ctx.drawImage(img, 0, 0, resizedWidth, resizedHeight);
  
        const resizedDataURL = canvas.toDataURL('image/jpeg');
  
        setFormData(prevState => ({
          ...prevState,
          productphoto: resizedDataURL, // Updated to match the field name in the form state
        }));
      };
    } catch (error) {
      console.error('Error resizing image:', error);
      toast.error('Error resizing image');
    }
  };
  
  const handleUploadProduct = async () => {
    try {
      const { name, description, category, price, productphoto } = formData;
      if (!name || !description || !category || !price || !productphoto) {
        toast.error('Please fill in all the fields');
        return;
      }
  
      const prefix = "2000";
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const pid = prefix + randomDigits;
  
      const storeResponse = await axios.get(`https://alabites-api.vercel.app/store/query/${adminuid}`);
      const storeId = storeResponse.data.data.storeId;
  
      const productData = {
        pid: pid,
        name: name,
        description: description,
        price: price,
        category: category,
        store: storeId,
        productphoto: productphoto,
      };
  
      console.log('Product Data:', productData);
  
      const response = await axios.post('https://alabites-api.vercel.app/products', productData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 201) {
        toast.success('Product uploaded successfully');
        setShowModal(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          productphoto: '', // Reset the product photo field as well
        });
      } else {
        toast.error('Failed to upload product');
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      toast.error('Error uploading product');
    }
  };
  
  

  return (
    <div className="flex bg-gray-200 min-h-screen">
      <VerticalMenu />
      <div className="flex flex-col flex-1">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="mt-4">
            {storeExists ? ( 
                  <>
                    {/* Display products */}
                    {products.map(product => (
                      <div key={product._id} className="bg-white p-4 rounded shadow">
                        <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                        <p className="text-gray-600">{product.description}</p>
                        <p className="text-gray-600 mt-2">Price: ${product.price}</p>
                      </div>
                    ))}
                  </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-700 text-lg mb-4">No products found for this store.</p>
                  <button onClick={handleCreateProduct} className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Add Product</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                      Create Product
                    </h3>
                    <div className="mt-2">
                      <form>
                      <div className="mb-4">
  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Product Name:</label>
  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
</div>
<div className="mb-4">
  <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Product Description:</label>
  <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
</div>
<div className="mb-4">
  <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Product Category:</label>
  <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
</div>
<div className="mb-4">
  <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Product Price:</label>
  <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
</div>
<div className="mb-4">
  <label htmlFor="productphoto" className="block text-gray-700 text-sm font-bold mb-2">Product Photo:</label>
  <input type="file" id="productphoto" name="productphoto" onChange={handleFileChange} required accept="image/*" className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
</div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={handleUploadProduct} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Upload Product
                </button>
                <button onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer/>
    </div>
  );
};

export default ProductListPage;
