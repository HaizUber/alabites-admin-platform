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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Box,
  Checkbox,
  IconButton,
  SimpleGrid,
  ModalCloseButton,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
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
import { motion } from 'framer-motion';

const ProductListPage = ({ isCollapsed, toggleMenu }) => {
  const [uid, setUid] = useState(null);
  const [adminuid, setAdminuid] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    productPhotos: [],
    stock: '',
    tags: '',
    discount: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: '',
    withDiscount: false,
    lowStock: false,
  });
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deletePhotoConfirmationModal, setDeletePhotoConfirmationModal] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState('');
  const [deletingPhotoIndex, setDeletingPhotoIndex] = useState(-1);

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

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

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
    setSelectedFiles([]);
    setCurrentProduct(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetFormData();
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      productPhotos: [],
      stock: '',
      tags: '',
      discount: '',
    });
    setSelectedFiles([]);
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
    setSelectedFiles(files);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true); // Set isSubmitting to true to indicate form submission in progress
  
      const generatedPid = generateProductId();
      const storeId = await fetchStoreId(adminuid);
  
      const uploadedPhotoURLs = await Promise.all(selectedFiles.map(async (file) => {
        const productName = formData.name.toString();
        return await uploadImage(file, `storeId-${productName}-${file.name}`);
      }));
  
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
      setIsSubmitting(false); // Reset isSubmitting after successful form submission
    } catch (error) {
      toast.error('Error handling form data');
      setIsSubmitting(false); // Reset isSubmitting in case of error
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
    setSelectedFiles([]);
    setShowModal(true);
    setIsEditing(true);
  };

  const handleDeleteProduct = async (productId, productPhotos) => {
    setDeletingProductId(productId);
    setDeleteConfirmationModal(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      setIsDeleting(true); // Set isDeleting to true to indicate deletion process in progress
  
      if (deleteConfirmationModal) {
        await deleteProduct(deletingProductId);
        toast.success('Product deleted successfully');
      } else if (deletePhotoConfirmationModal && deletingPhotoIndex !== -1) {
        const photoPath = formData.productPhotos[deletingPhotoIndex];
        await deleteImage(photoPath);
        const updatedPhotos = [...formData.productPhotos];
        updatedPhotos.splice(deletingPhotoIndex, 1);
        setFormData((prev) => ({
          ...prev,
          productPhotos: updatedPhotos,
        }));
        toast.success('Photo deleted successfully');
      }
    } catch (error) {
      toast.error('Error deleting product');
    } finally {
      setIsDeleting(false); // Reset isDeleting after deletion process completes (success or error)
      setDeleteConfirmationModal(false);
      setDeletePhotoConfirmationModal(false);
    }
  };
  

  const handleCancelDelete = () => {
    setDeleteConfirmationModal(false);
    setDeletePhotoConfirmationModal(false);
  };

  const handleDeletePhoto = async (index) => {
    setDeletingPhotoIndex(index);
    setDeletePhotoConfirmationModal(true);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      startDate: '',
      endDate: '',
      minPrice: '',
      maxPrice: '',
      withDiscount: false,
      lowStock: false,
    });
  };

  const applyFilters = () => {
    let filtered = products;

    // Filtering by name
    if (filters.name) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filtering by date
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((product) => {
        const createdAt = new Date(product.createdAt);
        return createdAt >= new Date(filters.startDate) && createdAt <= new Date(filters.endDate);
      });
    }

    // Filtering by price
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.price);
        const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
        const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Number.MAX_SAFE_INTEGER;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Filtering by discount
    if (filters.withDiscount) {
      filtered = filtered.filter((product) => product.discount > 0);
    }

    // Filtering by low stock
    if (filters.lowStock) {
      filtered = filtered.filter((product) => product.stock < 20);
    }

    setFilteredProducts(filtered);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-row flex-wrap p-4"
    >
      <VerticalMenu isCollapsed={isCollapsed} toggleMenu={toggleMenu} />
      <ToastContainer />
      <div className={`flex-col flex-auto p-4 ml-${isCollapsed ? '28' : '0'}`}>
        <div className="rounded-md p-4 mb-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Products</h2>
            <button
              onClick={handleCreateProduct}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none"
            >
              Add Product
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Filter by name"
              className="w-full md:w-1/4 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              placeholder="Start Date"
              className="w-full md:w-1/4 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              placeholder="End Date"
              className="w-full md:w-1/4 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min Price"
              className="w-full md:w-1/4 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max Price"
              className="w-full md:w-1/4 p-2 border border-gray-300 rounded-md"
            />
            <label className="flex items-center space-x-2">
              <Checkbox
                name="withDiscount"
                checked={filters.withDiscount}
                onChange={handleFilterChange}
                className="text-blue-500 border-gray-300 rounded-md"
              />
              <span>With Discount</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox
                name="lowStock"
                checked={filters.lowStock}
                onChange={handleFilterChange}
                className="text-blue-500 border-gray-300 rounded-md"
              />
              <span>Low Stock</span>
            </label>
            <button
              onClick={handleClearFilters}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none"
            >
              Clear Filters
            </button>
          </div>
          <div className="overflow-x-auto">
            <Table variant="simple" className="w-full table-with-scroll">
              <Thead>
                <Tr>
                  <Th>Product</Th>
                  <Th>Description</Th>
                  <Th>Price in (PHP)</Th>
                  <Th>Stock</Th>
                  <Th>Discount (%)</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredProducts.map((product) => (
                  <Tr key={product._id}>
                    <Td>{product.name}</Td>
                    <Td>{product.description}</Td>
                    <Td>{product.price}</Td>
                    <Td>{product.stock}</Td>
                    <Td>{product.discount}%</Td>
                    <Td>
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-500 hover:text-blue-700"
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        onClick={() => handleDeleteProduct(product._id, product.productPhotos)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </div>
      </div>
  
{/* Product Modal */}
<Modal isOpen={showModal} onClose={handleCloseModal} size="xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>{isEditing ? 'Edit Product' : 'Add Product'}</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <FormControl id="name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter product name"
        />
      </FormControl>
      <FormControl id="description" isRequired>
        <FormLabel>Description</FormLabel>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description"
        />
      </FormControl>
      <FormControl id="price" isRequired>
        <FormLabel>Price</FormLabel>
        <Input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Enter product price"
        />
      </FormControl>
      <FormControl id="stock" isRequired>
        <FormLabel>Stock</FormLabel>
        <Input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Enter product stock"
        />
      </FormControl>
      <FormControl id="tags">
        <FormLabel>Tags (comma separated)</FormLabel>
        <Input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="Enter product tags"
        />
      </FormControl>
      <FormControl id="discount">
        <FormLabel>Discount (%)</FormLabel>
        <Input
          type="number"
          name="discount"
          value={formData.discount}
          onChange={handleChange}
          placeholder="Enter discount percentage"
        />
      </FormControl>
      <FormControl id="productPhotos">
        <FormLabel>Product Photos</FormLabel>
        <SimpleGrid columns={2} spacing={4}>
          {formData.productPhotos.map((photo, index) => (
            <Box key={index} position="relative">
              <Image src={photo} alt={`Product ${index}`} className="w-full h-auto" />
              <IconButton
                aria-label="Delete Photo"
                icon={<DeleteIcon />}
                onClick={() => handleDeletePhoto(index)}
                className="absolute top-0 right-0 m-2 text-red-500 hover:text-red-700"
              />
            </Box>
          ))}
        </SimpleGrid>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="mt-2"
        />
      </FormControl>
    </ModalBody>
    <ModalFooter>
      <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={isSubmitting}>
        {isEditing ? (isSubmitting ? 'Updating...' : 'Update') : (isSubmitting ? 'Creating...' : 'Create')}
      </Button>
      <Button onClick={handleCloseModal} disabled={isSubmitting}>
        Cancel
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

{/* Delete Confirmation Modal */}
<Modal isOpen={deleteConfirmationModal} onClose={handleCancelDelete}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Confirm Delete</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <p>Are you sure you want to delete this product?</p>
    </ModalBody>
    <ModalFooter>
      <Button colorScheme="red" onClick={handleDeleteConfirmed} isLoading={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
      <Button onClick={handleCancelDelete} disabled={isDeleting}>
        Cancel
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

{/* Delete Photo Confirmation Modal */}
<Modal isOpen={deletePhotoConfirmationModal} onClose={handleCancelDelete}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Confirm Delete Photo</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <p>Are you sure you want to delete this photo?</p>
    </ModalBody>
    <ModalFooter>
      <Button colorScheme="red" onClick={handleDeleteConfirmed} isLoading={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
      <Button onClick={handleCancelDelete} disabled={isDeleting}>
        Cancel
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

    </motion.div>
  );
};
  
export default ProductListPage;
