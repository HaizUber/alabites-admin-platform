import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Grid,
  Heading,
  Text,
  Image,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import VerticalMenu from './VerticalMenu';

const PencilIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487 1.687 19.662a1.875 1.875 0 0 1-2.652-2.652L10.582 16.07a4.5 4.5 0 0 0 1.897-1.13L18 6l-.8 2.685a4.5 4.5 0 0 0-1.13 1.897l-8.932 8.931"/>
  </svg>
);

const StoreProfilePage = ({ isCollapsed, toggleMenu }) => {
  const [uid, setUid] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logoFile, setLogoFile] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [storeId, setStoreId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
        navigate('/login'); // Redirect to login if user is not authenticated
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
            const storeResponse = await fetch('https://alabites-api.vercel.app/store');
            if (storeResponse.ok) {
              const storeData = await storeResponse.json();
              console.log('Store data:', storeData); // Debugging log
              const userStore = storeData.data.find(store => store.storeOwner === admin.uid);
              if (userStore) {
                console.log('User store:', userStore); // Debugging log
                setStoreId(userStore.storeId);
                setStoreInfo(userStore); // Set the store info
                setStoreName(userStore.storeName); // Initialize storeName state
                setDescription(userStore.description); // Initialize description state
                setLogoBase64(userStore.storePicture);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };
  
    if (uid) {
      fetchAdminInfo();
    }
  }, [uid]);
  
  const handleSubmit = async () => {
    try {
        setSubmitting(true);

        let updatedLogo = storeInfo?.storePicture || ''; // Ensure field name is consistent

        const isNewLogoUploaded = logoFile && logoFile.name;

        // Delete the old logo if a new logo is uploaded
        if (storeInfo?.storePicture && isNewLogoUploaded) {
            const oldLogoRef = ref(storage, storeInfo.storePicture);
            await deleteObject(oldLogoRef);
        }

        // Upload the new logo if necessary
        if (isNewLogoUploaded) {
            const storageRef = ref(storage, `store_logo/${uid}_${logoFile.name}`);
            await uploadBytes(storageRef, logoFile);
            updatedLogo = await getDownloadURL(storageRef);
        }

        const updatedStoreInfo = {
            storeName,
            description,
            storePicture: updatedLogo, // Use consistent field name
        };

        const response = await axios.put(`https://alabites-api.vercel.app/store/${storeId}`, updatedStoreInfo);

        if (response.status === 200) {
            toast.success('Store information updated successfully');
            onClose();
        } else {
            toast.error(response.data.message || 'Failed to update store information');
        }
    } catch (error) {
        console.error('Error updating store information:', error);
        toast.error('Error updating store information');
    } finally {
        setSubmitting(false);
    }
};

  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setLogoFile(file);
  
    // Convert file to a base64 string or URL for preview, if needed
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  

  const handleDeleteLogo = async () => {
    try {
      // Log storeInfo and storepicture for debugging
      console.log('storeInfo:', storeInfo);
      console.log('storeInfo.storepicture:', storeInfo?.storePicture);
  
      if (storeInfo?.storePicture) {
        const storageRef = ref(storage, storeInfo.storePicture);
  
        // Log the reference to verify the correct path
        console.log('Deleting logo from:', storeInfo.storePicture);
  
        // Attempt to delete the logo from Firebase
        await deleteObject(storageRef);
  
        // Update API to reflect the deletion of the logo
        await axios.put(`https://alabites-api.vercel.app/store/${storeInfo.storeId}`, { storePicture: null });
  
        // Update local state to reflect the deletion
        setLogoFile(null);
        setLogoBase64(null);
        toast.success('Logo deleted successfully');
      } else {
        toast.error('No logo to delete');
        console.log('No logo found in storeInfo.storepicture');
      }
    } catch (error) {
      // Log detailed error information
      console.error('Error deleting logo:', error);
  
      // Provide a more specific error message
      if (error.code === 'storage/object-not-found') {
        toast.error('Logo not found');
      } else if (error.code === 'storage/unauthorized') {
        toast.error('Unauthorized to delete logo');
      } else if (error.code === 'storage/canceled') {
        toast.error('Logo deletion canceled');
      } else if (error.response?.status === 404) {
        toast.error('API: Store not found');
      } else if (error.response?.status === 403) {
        toast.error('API: Unauthorized to update store');
      } else {
        toast.error('Error deleting logo');
      }
    }
  };  
  
  return (
    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} p={4}>
      <VerticalMenu isCollapsed={isCollapsed} toggleMenu={toggleMenu} />
      <Box
        p={4}
        borderWidth={1}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        as={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="center">
          {logoBase64 ? (
            <Image
              src={logoBase64}
              alt="Store Logo"
              boxSize="150px"
              borderRadius="full"
              mr={4}
            />
          ) : (
            <Box boxSize="150px" bg="gray.200" borderRadius="full" mr={4} />
          )}
          <Box>
            <Heading as="h2" size="lg">{storeName}</Heading>
            <Text fontSize="md">Description: {description}</Text>
            <Box mt={4}>
              <Button colorScheme="blue" leftIcon={PencilIcon} onClick={onOpen}>
                Edit Store Profile
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
  
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Store Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="text"
              placeholder="Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              mb={3}
              isRequired
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Store Description"
              mb={3}
            />
            <Input type="file" onChange={handleFileChange} mb={3} />
  
            {logoBase64 ? (
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                <Button colorScheme="red" onClick={handleDeleteLogo}>
                  Delete Logo
                </Button>
                <Image src={logoBase64} alt="Store Logo" boxSize="50px" borderRadius="full" />
              </Box>
            ) : (
              <Text>No logo uploaded</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={submitting}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ToastContainer />
    </Grid>
  );  
};

export default StoreProfilePage;
