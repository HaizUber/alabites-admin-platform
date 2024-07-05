import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VerticalMenu from './VerticalMenu';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Spinner,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { auth } from '../../config/firebase';
import { uploadImage, deleteImage } from '../utils/firebasefunctions';
import axios from 'axios';
import {
  fetchAdminInfo,
  fetchStoreId,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../utils/products';

const ProductListPage = ({ isCollapsed, toggleMenu }) => {
  const [uid, setUid] = useState(null);
  const [adminuid, setAdminuid] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    productPhotos: [],
    stock: '',
    tags: '',
    discount: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]); // New state to hold selected files
  const [currentProduct, setCurrentProduct] = useState(null);

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
    const getAdminInfo = async () => {
      if (!uid) return;
      try {
        const admin = await fetchAdminInfo(uid);
        if (admin) {
          setAdminuid(admin.uid);
          toast.success('Admin information fetched successfully');
        } else {
          toast.error('Admin not found');
        }
      } catch (error) {
        toast.error('Error fetching admin info');
      }
    };
    getAdminInfo();
  }, [uid]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!adminuid) return;
      try {
        const storeId = await fetchStoreId(adminuid);
        const productsData = await fetchProducts(storeId);
        if (productsData.length > 0) {
          setProducts(productsData);
          setFilteredProducts(productsData);
          toast.success('Products fetched successfully');
        } else {
          toast.error('No products found for this store.');
        }
      } catch (error) {
        toast.error('Error fetching products');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [adminuid]);

  const handleCreateProduct = () => {
    setShowModal(true);
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      productPhotos: [],
      stock: '',
      tags: '',
      discount: '',
    });
    setSelectedFiles([]); // Clear selected files
    setCurrentProduct(null);
  };

  const handleCloseModal = () => {
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
    setSelectedFiles([]); // Clear selected files
    setCurrentProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateProductId = () => {
    const prefix = '2000';
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return prefix + randomDigits;
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files); // Store selected files in state
  };

  const handleSubmit = async () => {
    try {
      const generatedPid = generateProductId();
      const storeId = await fetchStoreId(adminuid);

      // Upload selected images to Firebase Storage
      const uploadedPhotoURLs = await Promise.all(selectedFiles.map(async (file) => {
        const productName = formData.name.toString();
        return await uploadImage(file, `storeId-${productName}-${file.name}`);
      }));

      // Combine existing photos with new uploaded photos
      const updatedProductPhotos = [...formData.productPhotos, ...uploadedPhotoURLs];

      const productData = { ...formData, store: storeId, pid: generatedPid, productPhotos: updatedProductPhotos };

      if (isEditing) {
        await updateProduct(currentProduct._id, productData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Error handling form data');
    }
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      productPhotos: product.productPhotos,
      stock: product.stock,
      tags: product.tags,
      discount: product.discount,
    });
    setSelectedFiles([]); // Clear selected files when editing
    setShowModal(true);
    setIsEditing(true);
  };

  const handleDeleteProduct = async (productId, productPhotos) => {
    try {
      if (Array.isArray(productPhotos)) {
        await Promise.all(productPhotos.map(async (photoURL) => {
          await deleteImage(photoURL);
        }));
      }
      await deleteProduct(productId);
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const handleDeletePhoto = async (index) => {
    const photoPath = formData.productPhotos[index];
    try {
      if (photoPath) {
        await deleteImage(photoPath);
      }
      const updatedPhotos = [...formData.productPhotos];
      updatedPhotos.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        productPhotos: updatedPhotos,
      }));
      toast.success('Photo deleted successfully');
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    if (value === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) => product.tags.toLowerCase().includes(value.toLowerCase()));
      setFilteredProducts(filtered);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <VerticalMenu isCollapsed={isCollapsed} toggleMenu={toggleMenu} />

      <div className={`flex-1 ml-0 md:ml-20 mt-12 mb-12`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Product List</h2>
          <button
            onClick={handleCreateProduct}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none"
          >
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-lg">Loading products...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Photos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.productPhotos.length > 0 ? (
                        <div className="flex flex-wrap">
                          {product.productPhotos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`product-${index}`}
                              className="h-12 w-12 object-cover m-1"
                            />
                          ))}
                        </div>
                      ) : (
                        <img
                          src="https://via.placeholder.com/64"
                          alt="placeholder"
                          className="h-12 w-12 object-cover"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.tags}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.discount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600 focus:outline-none mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id, product.productPhotos)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600 focus:outline-none"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Edit Product' : 'Add Product'}</ModalHeader>
          <ModalBody>
            <FormControl id="name" mb={4}>
              <FormLabel>Product Name</FormLabel>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="description" mb={4}>
              <FormLabel>Product Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="price" mb={4}>
              <FormLabel>Price</FormLabel>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="productPhotos" mb={4}>
              <FormLabel>Product Photos</FormLabel>
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <div className="mt-2">
                {formData.productPhotos.length > 0 &&
                  formData.productPhotos.map((photo, index) => (
                    <div key={index} className="relative inline-block mr-2 mb-2">
                      <img
                        src={photo}
                        alt={`product-${index}`}
                        className="h-16 w-16 object-cover"
                      />
                      <button
                        onClick={() => handleDeletePhoto(index)}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                      >
                        <DeleteIcon boxSize={4} />
                      </button>
                    </div>
                  ))}
              </div>
            </FormControl>
            <FormControl id="stock" mb={4}>
              <FormLabel>Stock</FormLabel>
              <Input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="tags" mb={4}>
              <FormLabel>Tags</FormLabel>
              <Input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl id="discount" mb={4}>
              <FormLabel>Discount</FormLabel>
              <Input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={handleSubmit}
              isLoading={isUploadingImages}
              loadingText="Uploading"
              colorScheme="blue"
              mr={3}
            >
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default ProductListPage;
