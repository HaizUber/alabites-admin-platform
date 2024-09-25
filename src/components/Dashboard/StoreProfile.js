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
  VStack,
  HStack,
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
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [logoFile, setLogoFile] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashQRFile, setGcashQRFile] = useState(null);
  const [gcashQRBase64, setGcashQRBase64] = useState(null);
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
      setIsLoading(true);
      try {
        const response = await fetch(`https://alabites-api.vercel.app/admins/query/${uid}`);
        if (response.ok) {
          const data = await response.json();
          const admin = data.data;
          if (admin) {
            const storeResponse = await fetch('https://alabites-api.vercel.app/store');
            if (storeResponse.ok) {
              const storeData = await storeResponse.json();
              const userStore = storeData.data.find(store => store.storeOwner === admin.uid);
              if (userStore) {
                setStoreId(userStore.storeId);
                setStoreInfo(userStore);
                setStoreName(userStore.storeName || '');
                setDescription(userStore.description || '');
                setLogoBase64(userStore.storePicture || '');
                setGcashNumber(userStore.gcashNumber || ''); // Initialize GCash number
                setGcashQRBase64(userStore.gcashQR || ''); // Initialize GCash QR
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
        toast.error('Error fetching store information');
      } finally {
        setIsLoading(false);
      }
    };

    if (uid) {
      fetchAdminInfo();
    }
  }, [uid]);
  
  const handleSubmit = async () => {
    if (!storeName.trim()) {
      toast.error('Store name is required.');
      return;
    }

    try {
      setSubmitting(true);

      let updatedLogo = storeInfo?.storePicture || '';
      const isNewLogoUploaded = logoFile && logoFile.name;
      let updatedGcashQR = storeInfo?.gcashQR || '';

      if (storeInfo?.storePicture && isNewLogoUploaded) {
        const oldLogoRef = ref(storage, storeInfo.storePicture);
        await deleteObject(oldLogoRef);
      }

      if (isNewLogoUploaded) {
        const storageRef = ref(storage, `store_logo/${uid}_${logoFile.name}`);
        await uploadBytes(storageRef, logoFile);
        updatedLogo = await getDownloadURL(storageRef);
      }

      if (gcashQRFile && gcashQRFile.name) {
        const gcashQRRef = ref(storage, `gcash_qr/${uid}_${gcashQRFile.name}`);
        await uploadBytes(gcashQRRef, gcashQRFile);
        updatedGcashQR = await getDownloadURL(gcashQRRef);
      }

      const updatedStoreInfo = {
        storeName,
        description,
        storePicture: updatedLogo,
        gcashNumber,
        gcashQR: updatedGcashQR,
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

  const handleLogoFileChange = (event) => {
    const file = event.target.files[0];

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleGcashQRFileChange = (event) => {
    const file = event.target.files[0];

    setGcashQRFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setGcashQRBase64(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      if (storeInfo?.storePicture) {
        const storageRef = ref(storage, storeInfo.storePicture);
        await deleteObject(storageRef);
        await axios.put(`https://alabites-api.vercel.app/store/${storeInfo.storeId}`, { storePicture: null });
        setLogoFile(null);
        setLogoBase64(null);
        toast.success('Logo deleted successfully');
      } else {
        toast.error('No logo to delete');
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast.error('Error deleting logo');
    }
  };

  const handleDeleteGcashQR = async () => {
    try {
      if (storeInfo?.gcashQR) {
        const storageRef = ref(storage, storeInfo.gcashQR);
        await deleteObject(storageRef);
        await axios.put(`https://alabites-api.vercel.app/store/${storeInfo.storeId}`, { gcashQR: null });
        setGcashQRFile(null);
        setGcashQRBase64(null);
        toast.success('GCash QR deleted successfully');
      } else {
        toast.error('No GCash QR to delete');
      }
    } catch (error) {
      console.error('Error deleting GCash QR:', error);
      toast.error('Error deleting GCash QR');
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} p={4}>
      <VerticalMenu isCollapsed={isCollapsed} toggleMenu={toggleMenu} />
      <Box
  p={6}
  borderWidth={1}
  borderRadius="lg"
  overflow="hidden"
  boxShadow="lg"
  as={motion.div}
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  bg="white"
>
  <Heading as="h2" size="lg" mb={4} textAlign="center" color="teal.600">Store Profile</Heading>
  
  <VStack spacing={4} align="start">
    <HStack width="full" justify="space-between">
      <Text fontWeight="bold" color="gray.800">Store Name:</Text>
      <Text color="gray.600">{storeInfo?.storeName}</Text>
    </HStack>

    <HStack width="full" justify="space-between">
      <Text fontWeight="bold" color="gray.800">Description:</Text>
      <Text color="gray.600">{storeInfo?.description}</Text>
    </HStack>

    <HStack width="full" justify="space-between">
      <Text fontWeight="bold" color="gray.800">GCash Number:</Text>
      <Text color="gray.600">{storeInfo?.gcashNumber}</Text>
    </HStack>

    {/* Display Store Logo */}
    {storeInfo?.storePicture && (
      <VStack spacing={2} align="start">
        <Text fontWeight="bold" color="gray.800">Store Logo:</Text>
        <Image src={storeInfo.storePicture} alt="Store Logo" boxSize="100px" objectFit="cover" borderRadius="md" />
      </VStack>
    )}

    {/* Display GCash QR Code */}
    {storeInfo?.gcashQR && (
      <VStack spacing={2} align="start">
        <Text fontWeight="bold" color="gray.800">GCash QR Code:</Text>
        <Image src={storeInfo.gcashQR} alt="GCash QR Code" boxSize="100px" objectFit="cover" borderRadius="md" />
      </VStack>
    )}
  </VStack>

  <Button colorScheme="teal" onClick={onOpen} leftIcon={PencilIcon} width="full" mt={4}>
    Edit
  </Button>
</Box>


      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Store Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2} fontWeight="bold">Store Name</Text>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Enter store name"
              mb={4}
            />
            <Text mb={2} fontWeight="bold">Description</Text>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              resize="none"
              mb={4}
            />
            <Text mb={2} fontWeight="bold">GCash Number</Text>
            <Input
              value={gcashNumber}
              onChange={(e) => setGcashNumber(e.target.value)}
              placeholder="Enter GCash number"
              maxLength={11} // Limit to 11 digits
              mb={4}
            />
            <Text mb={2} fontWeight="bold">Store Logo</Text>
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              mb={4}
            />
            {logoBase64 && (
              <Image src={logoBase64} alt="Store Logo" boxSize="100px" objectFit="cover" mt={2} />
            )}
            {storeInfo?.storePicture && (
              <Button mt={2} colorScheme="red" onClick={handleDeleteLogo}>Delete Logo</Button>
            )}
            <Text mb={2} fontWeight="bold">GCash QR Code</Text>
            <Input
              type="file"
              accept="image/*"
              onChange={handleGcashQRFileChange}
              mb={4}
            />
            {gcashQRBase64 && (
              <Image src={gcashQRBase64} alt="GCash QR Code" boxSize="100px" objectFit="cover" mt={2} />
            )}
            {storeInfo?.gcashQR && (
              <Button mt={2} colorScheme="red" onClick={handleDeleteGcashQR}>Delete GCash QR</Button>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSubmit} isLoading={submitting}>Save</Button>
            <Button onClick={onClose} ml={3}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ToastContainer />
    </Grid>
  );
  
};

export default StoreProfilePage;
