import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { auth, storage } from '../../config/firebase'; // Import Firebase auth
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerticalMenu from './VerticalMenu';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const ProductListPage = () => {
  const [uid, setUid] = useState(null);
  const [adminuid, setAdminuid] = useState(null);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [minPrice, setMinPrice] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
const [maxPrice, setMaxPrice] = useState('');
const [formData, setFormData] = useState({
  name: '',
  description: '',
  price: '',
  productPhotos: [],
  stock: '',
  tags: '',
  discount: '',
});

  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    productPhotos: [], // Ensure this is initialized as an array
    stock: '',
    tags: '',
    discount: '',
  });
  

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
// SVG icons as constants
const ClockIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PartsIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const JSIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

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
          const storeResponse = await axios.get(`https://alabites-api.vercel.app/store/query/${adminuid}`);
          if (storeResponse.status === 200) {
            const { storeId } = storeResponse.data.data;
  
            const response = await axios.get(`https://alabites-api.vercel.app/products/query/${storeId}`);
            if (response.status === 200) {
              const responseData = response.data;
              console.log('Products:', responseData);
  
              if (responseData && responseData.data && responseData.data.length > 0) {
                // Set both products and filteredProducts with fetched data
                setProducts(responseData.data);
                setFilteredProducts(responseData.data);
                setLoading(false);
                toast.success('Products fetched successfully');
              } else {
                toast.error('No products found for this store.');
                setLoading(false);
              }
            } else {
              toast.error('Failed to fetch products');
              setLoading(false);
            }
          } else if (storeResponse.status === 404) {
            toast.error('Store not found');
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          toast.error('Error fetching products');
          setLoading(false);
        }
      };
  
      // Fetch data when adminuid is available
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
  const files = event.target.files;

  try {
    setIsUploadingImages(true); // Start image upload process
    const maxWidthOrHeight = 564;
    const photoURLs = [];

    for (const file of files) {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      await new Promise(resolve => {
        img.onload = resolve;
      });

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

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));

      const storageRef = ref(storage, `product_photos/${uuidv4()}`);

      const snapshot = await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(snapshot.ref);

      photoURLs.push(downloadURL);
    }

    setFormData(prevState => ({
      ...prevState,
      productPhotos: photoURLs,
    }));
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Error uploading image');
  } finally {
    setIsUploadingImages(false); // End image upload process
  }
};

const handleUploadProduct = async () => {
  try {
    const { name, description, price, productPhotos, stock, tags, discount } = formData;

    if (isUploadingImages || !name || !description || !price || !productPhotos.length || !stock || !tags || !discount) {
      toast.error(isUploadingImages ? 'Please wait, images are being processed' : 'Please fill in all the fields');
      return;
    }

    const prefix = "2000";
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const pid = prefix + randomDigits;

    const storeResponse = await axios.get(`https://alabites-api.vercel.app/store/query/${adminuid}`);
    const storeId = storeResponse.data.data.storeId;

    const productData = {
      pid,
      name,
      description,
      price,
      store: storeId,
      productPhotos,
      stock,
      tags,
      discount,
    };

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
        productPhotos: [],
        stock: '',
        tags: '',
        discount: '',
      });
    } else {
      toast.error('Failed to upload product');
    }
  } catch (error) {
    console.error('Error uploading product:', error);
    toast.error('Error uploading product');
  }
};

const handleEditProduct = (product) => {
  try {
    console.log('Product data:', product);
    // Set the product data in editFormData state
    setEditingProduct(product);
    setEditFormData({ 
      _id: product._id,
      pid: product.pid || product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      productPhotos: product.productPhotos,
      stock: product.stock || '', // Add stock field
      tags: product.tags || '', // Add tags field
      discount: product.discount || '', // Add discount field
      createdAt: new Date(product.createdAt).toLocaleString(),
      updatedAt: new Date(product.updatedAt).toLocaleString()
    });
    setShowUpdateModal(true);
  } catch (error) {
    console.error('Error setting product data:', error);
    toast.error('Error setting product data');
  }
};

const handleEditFileChange = (event) => {
  const files = Array.from(event.target.files);
  setEditFormData((prevFormData) => ({
    ...prevFormData,
    tempProductPhotos: prevFormData.tempProductPhotos ? prevFormData.tempProductPhotos.concat(files) : files,
  }));
};

const handleUpdateProduct = async () => {
  try {
    const { _id, name, description, price, stock, tags, discount, tempProductPhotos, productPhotos } = editFormData;

    if (isUploadingImages || !name || !description || !price || !stock || !tags || !discount) {
      toast.error(isUploadingImages ? 'Please wait, images are being processed' : 'Please fill in all the fields');
      return;
    }

    setIsLoading(true);
    setFeedbackMessage('Uploading new photos...');
    
    // Upload new photos
    const photoURLs = [...productPhotos];
    for (const file of tempProductPhotos) {
      if (photoURLs.length >= 6) {
        toast.error('A maximum of 6 photos is allowed');
        break;
      }
      const storageRef = ref(storage, `product_photos/${uuidv4()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      photoURLs.push(downloadURL);
    }
    console.log('New photos uploaded:', photoURLs);

    // Clear tempProductPhotos after uploading
    setEditFormData((prevFormData) => ({
      ...prevFormData,
      tempProductPhotos: [],
      productPhotos: photoURLs, // Combine existing and new photos
    }));

    // Prepare updated product data for API update
    const updatedProductData = {
      name,
      description,
      price,
      productPhotos: photoURLs, // Assigning the combined photo URLs
      stock,
      tags,
      discount,
    };

    setFeedbackMessage('Updating product data...');
    console.log('Sending updated product data to the API:', updatedProductData);
    // Send updated product data to the API
    const response = await axios.put(`https://alabites-api.vercel.app/products/${_id}`, updatedProductData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      toast.success('Product updated successfully');
      setShowUpdateModal(false);
      setEditingProduct(null);
    } else {
      toast.error('Failed to update product');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    toast.error('Error updating product');
  } finally {
    setIsLoading(false);
    setFeedbackMessage('');
  }
};

const handleDeletePhoto = async (photo) => {
  const confirmed = window.confirm('Are you sure you want to delete this photo? This action is irreversible.');
  if (confirmed) {
    try {
      // Delete photo from Firebase Storage
      const photoRef = ref(storage, photo);
      await deleteObject(photoRef);
      
      // Update local state
      setEditFormData((prevFormData) => ({
        ...prevFormData,
        productPhotos: prevFormData.productPhotos.filter((p) => p !== photo),
      }));

      // Optionally, update the product in the backend to reflect the removed photo
      const updatedProductData = {
        ...editFormData,
        productPhotos: editFormData.productPhotos.filter((p) => p !== photo),
      };

      await axios.put(`https://alabites-api.vercel.app/products/${editFormData._id}`, updatedProductData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Error deleting photo');
    }
  }
};
  
  
  const handleDeleteProduct = async (productId) => {
    try {
      const response = await axios.delete(`https://alabites-api.vercel.app/products/${productId}`);
      if (response.status === 200) {
        // Update products state by filtering out the deleted product
        setProducts(products.filter(product => product._id !== productId));
        toast.success('Product deleted successfully');
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

// Handle product name filter
const handleProductNameFilter = (searchTerm) => {
  if (!searchTerm.trim()) {
    // If search term is empty, reset filtered products to all products
    setFilteredProducts(products);
  } else {
    // If search term is provided, filter products by product name
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }
};

// Handle price filter
const handlePriceFilter = (type) => {
  let filtered = [...filteredProducts];
  switch (type) {
    case 'high-low':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'low-high':
      filtered.sort((a, b) => a.price - b.price);
      break;
    default:
      break;
  }
  setFilteredProducts(filtered);
};

// Handle price range filter
const handlePriceRangeFilter = () => {
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);
  if (!isNaN(min) && !isNaN(max)) {
    const filtered = products.filter(product =>
      product.price >= min && product.price <= max
    );
    setFilteredProducts(filtered);
  }
};

return (
  <div className="flex bg-gray-200 min-h-screen">
    <VerticalMenu />
    <div className="flex flex-col flex-1">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="space-y-2">
          {/* Filter by Product Name */}
          <details
            className="overflow-hidden rounded border border-gray-300 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary
              className="flex cursor-pointer items-center justify-between gap-2 bg-white p-4 text-gray-900 transition"
            >
              <span className="text-sm font-medium"> Filters </span>

              <span className="transition group-open:-rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </summary>

            <div className="border-t border-gray-200 bg-white">
              {/* Input field for searching product names */}
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Search by product name..."
                  className="w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
                  // Implement onChange handler to handle search input changes
                  onChange={(e) => handleProductNameFilter(e.target.value)}
                />
              </div>

              {/* Price filter */}
              <div className="p-4 flex items-center">
                <span className="text-gray-700 mr-2">Price:</span>
                <button onClick={() => handlePriceFilter('high-low')} className="text-gray-700 mr-2">High-Low</button>
                <button onClick={() => handlePriceFilter('low-high')} className="text-gray-700 mr-2">Low-High</button>
              </div>

              {/* Price range filter */}
              <div className="p-4 flex items-center">
                <span className="text-gray-700 mr-2">Price Range:</span>
                <input
                  type="number"
                  placeholder="Min price"
                  className="w-1/4 rounded-md border-gray-200 shadow-sm sm:text-sm mr-2"
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-gray-700 mr-2">to</span>
                <input
                  type="number"
                  placeholder="Max price"
                  className="w-1/4 rounded-md border-gray-200 shadow-sm sm:text-sm mr-2"
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
                <button onClick={handlePriceRangeFilter} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300">Apply</button>
              </div>
            </div>
          </details>
          {/* Other filters */}
          {/* Add other filter details here */}
        </div>


        {/* Add Product Button */}
        <button
          onClick={handleCreateProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
          >
            Add Product
          </button>
        </div>
  
        <div className="flex justify-center items-center py-20">
  <div className="md:px-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 space-y-4 md:space-y-0">
    {filteredProducts.map((product, index) => (
      <div key={index} className="max-w-sm bg-white px-6 pt-6 pb-2 rounded-xl shadow-lg transform hover:scale-105 transition duration-500">
        <div className="relative">
          <img className="w-full rounded-xl" src={product.productPhotos.length > 0 ? product.productPhotos[0] : 'default-placeholder-image.jpg'} alt={product.name} />
          <p className="absolute top-0 bg-yellow-300 text-gray-800 font-semibold py-1 px-3 rounded-br-lg rounded-tl-lg">Php{product.price}</p>
        </div>
        <h1 className="mt-4 text-gray-800 text-2xl font-bold cursor-pointer">{product.name}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <div className="my-4">
          <div className="flex space-x-1 items-center">
            {PartsIcon}
            <p>{product.category}</p>
          </div>
          <div className="flex space-x-1 items-center">
            {ClockIcon}
            <p>Created: {product.createdAt}</p>
          </div>
          <div className="flex space-x-1 items-center">
            {ClockIcon}
            <p>Last Updated: {product.updatedAt}</p>
          </div>
          <button onClick={() => handleEditProduct(product)} className="mt-4 text-xl w-full text-white bg-indigo-600 py-2 rounded-xl shadow-lg">Edit Product</button>
          <button onClick={() => handleDeleteProduct(product._id)} className="mt-4 text-xl w-full text-white bg-red-600 py-2 rounded-xl shadow-lg">Delete Product</button>
        </div>
      </div>
    ))}
  </div>
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
                                        <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Product Price:</label>
                                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="stock" className="block text-gray-700 text-sm font-bold mb-2">Stock:</label>
                                        <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">Tags (comma-separated):</label>
                                        <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="discount" className="block text-gray-700 text-sm font-bold mb-2">Discount (%):</label>
                                        <input type="number" id="discount" name="discount" value={formData.discount} onChange={handleChange} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="productphoto" className="block text-gray-700 text-sm font-bold mb-2">Product Photos:</label>
                                        <input type="file" id="productphotos" name="productphotos" onChange={handleFileChange} required accept="image/*" multiple className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button onClick={handleUploadProduct} disabled={isUploadingImages} className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isUploadingImages ? 'cursor-not-allowed opacity-50' : ''}`}>
            {isUploadingImages ? 'Processing images...' : 'Upload Product'}
          </button>
          <button onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Cancel
          </button>
                </div>
            </div>
        </div>
    </div>
)}

{showUpdateModal && (
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
                Edit Product
              </h3>
              <div className="mt-2">
                <form>
                  <div className="mb-4">
                    <label htmlFor="edit-name" className="block text-gray-700 text-sm font-bold mb-2">Product Name:</label>
                    <input type="text" id="edit-name" name="name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-description" className="block text-gray-700 text-sm font-bold mb-2">Product Description:</label>
                    <textarea id="edit-description" name="description" value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-price" className="block text-gray-700 text-sm font-bold mb-2">Product Price:</label>
                    <input type="number" id="edit-price" name="price" value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-stock" className="block text-gray-700 text-sm font-bold mb-2">Stock:</label>
                    <input type="number" id="edit-stock" name="stock" value={editFormData.stock} onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-tags" className="block text-gray-700 text-sm font-bold mb-2">Tags:</label>
                    <input type="text" id="edit-tags" name="tags" value={editFormData.tags} onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-discount" className="block text-gray-700 text-sm font-bold mb-2">Discount:</label>
                    <input type="number" id="edit-discount" name="discount" value={editFormData.discount} onChange={(e) => setEditFormData({ ...editFormData, discount: e.target.value })} className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                                    <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Product Photos:</label>
                    <div className="grid grid-cols-3 gap-4">
                      {editFormData.productPhotos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img src={photo} alt={`Product ${index + 1}`} className="w-full h-24 object-cover rounded" />
                          <button type="button" onClick={() => handleDeletePhoto(photo)} className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full p-1 focus:outline-none">
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit-productphoto" className="block text-gray-700 text-sm font-bold mb-2">Add New Product Photo:</label>
                    <input type="file" id="edit-productphoto" name="productphoto" onChange={handleEditFileChange} multiple accept="image/*" className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleUpdateProduct}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${isLoading ? 'bg-blue-300' : 'bg-blue-600'} text-base font-medium text-white ${isLoading ? '' : 'hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Product'}
            </button>
            <button
              onClick={() => setShowUpdateModal(false)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
        </div>
      </div>
    </div>
  </div>
)}
      <ToastContainer />
    </div>
  </div>
);

};

export default ProductListPage;