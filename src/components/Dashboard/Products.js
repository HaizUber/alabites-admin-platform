import React, { useState, useEffect, useCallback } from 'react';
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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    productPrice: '',
    productCategory: '',
    productPhoto: '', // Add a state for the product photo base64 string
  });
  const [editingProduct, setEditingProduct] = useState(null);
const [editFormData, setEditFormData] = useState({
  name: '',
  description: '',
  price: '',
  productphoto: '',
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

  const handleEditProduct = (product) => {
    try {
      console.log('Product data:', product);
      // Set the product data in editFormData state
      setEditingProduct(product);
      setEditFormData({
        pid: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        productphoto: product.productphoto,
        createdAt: new Date(product.createdAt).toLocaleString(), // Convert createdAt to human-readable format
        updatedAt: new Date(product.updatedAt).toLocaleString()  // Convert updatedAt to human-readable format  
      });
      setShowUpdateModal(true);
    } catch (error) {
      console.error('Error setting product data:', error);
      // Handle error (e.g., show error message)
      toast.error('Error setting product data');
    }
  };
  
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  
  const handleEditFileChange = async (event) => {
    const file = event.target.files[0];
  
    try {
      const maxWidthOrHeight = 564; // Maximum width or height of the resized image
  
      const img = new Image();
      img.src = URL.createObjectURL(file);
  
      img.onload = async () => {
        console.log('Original image width:', img.width);
        console.log('Original image height:', img.height);
  
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
  
        console.log('Resized image width:', resizedWidth);
        console.log('Resized image height:', resizedHeight);
  
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        canvas.width = resizedWidth;
        canvas.height = resizedHeight;
  
        ctx.drawImage(img, 0, 0, resizedWidth, resizedHeight);
  
        const resizedDataURL = canvas.toDataURL('image/jpeg', 0.7);
  
        console.log('Resized image data URL:', resizedDataURL);
  
        setEditFormData(prevState => ({
          ...prevState,
          productphoto: resizedDataURL, // Updated to match the field name in the form state
        }));
      };
    } catch (error) {
      console.error('Error resizing image:', error);
      toast.error('Error resizing image');
    }
  };
  
  
  const handleUpdateProduct = async () => {
    try {
      console.log('editFormData:', editFormData); // Log editFormData state
      const { pid, name, description, price, productphoto } = editFormData; // Extracting id from editFormData
      if (!name || !description || !price) { // Ensure id is present
        toast.error('Please fill in all the fields');
        return;
      }
  
      const updatedProductData = {
        name: name,
        description: description,
        price: price,
        productphoto: productphoto,
      };
  
      const response = await axios.put(`https://alabites-api.vercel.app/products/${pid}`, updatedProductData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 200) {
        toast.success('Product updated successfully, refresh page to take effect');
        setShowUpdateModal(false);
        setEditingProduct(null);
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
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
                  <img className="w-full rounded-xl" src={product.productphoto} alt={product.name} />
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
                    <p>{product.createdAt}</p>
                  </div>
                  <div className="flex space-x-1 items-center">
                    {ClockIcon}
                    <p>{product.updatedAt}</p>
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
                    <label htmlFor="edit-productphoto" className="block text-gray-700 text-sm font-bold mb-2">Product Photo:</label>
                    <input type="file" id="edit-productphoto" name="productphoto" onChange={handleEditFileChange} required accept="image/*" className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button onClick={handleUpdateProduct} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
            Update Product
          </button>
          <button onClick={() => setShowUpdateModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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