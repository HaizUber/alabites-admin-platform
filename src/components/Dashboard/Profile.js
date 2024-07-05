import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';
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
  useDisclosure, // Import useDisclosure from Chakra UI
} from '@chakra-ui/react';
import VerticalMenu from './VerticalMenu';

const PencilIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16.862 4.487 1.687 19.662a1.875 1.875 0 0 1-2.652-2.652L10.582 16.07a4.5 4.5 0 0 0 1.897-1.13L18 6l-.8 2.685a4.5 4.5 0 0 0-1.13 1.897l-8.932 8.931"
    />
  </svg>
);

const ProfilePage = ({ isCollapsed, toggleMenu }) => {
  const [uid, setUid] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [aboutMe, setAboutMe] = useState(''); // New state for About Me section
  const [submitting, setSubmitting] = useState(false);

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
            setAdminInfo(admin);
            setFirstName(admin.firstName);
            setLastName(admin.lastName);
            setUsername(admin.username);
            setRole(admin.role);
            setAboutMe(admin.aboutMe); // Set the aboutMe state
            if (admin.avatar) {
              setAvatarBase64(admin.avatar);
            }
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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      let updatedAvatar = avatarBase64;

      if (avatarFile) {
        const storageRef = ref(storage, `admin_avatar/${uid}_${avatarFile.name}`);
        await uploadBytes(storageRef, avatarFile);
        const downloadURL = await getDownloadURL(storageRef);
        updatedAvatar = downloadURL;
      }

      const updatedAdminInfo = {
        ...adminInfo,
        firstName,
        lastName,
        username,
        role,
        avatar: updatedAvatar,
        aboutMe, // Include aboutMe in the updatedAdminInfo object
      };

      const response = await axios.put(`https://alabites-api.vercel.app/admins/${updatedAdminInfo.uid}`, updatedAdminInfo);
      if (response.status === 200) {
        toast.success('Admin information updated successfully');
        onClose();
      } else {
        const errorMessage = response.data.message || 'Failed to update admin information';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating admin information:', error);
      toast.error('Error updating admin information');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setAvatarFile(file);

    try {
      const storageRef = ref(storage, `admin_avatar/${uid}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setAvatarBase64(downloadURL);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      if (adminInfo.avatar) {
        const storageRef = ref(storage, adminInfo.avatar);
        await deleteObject(storageRef);
        setAvatarFile(null);
        setAvatarBase64(null);
        toast.success('Avatar deleted successfully');
      } else {
        toast.error('No avatar to delete');
      }
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error('Error deleting avatar');
    }
  };

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} p={4}>
      <VerticalMenu isCollapsed={isCollapsed} toggleMenu={toggleMenu} />
      <Box p={4} borderWidth={1} borderRadius="lg" overflow="hidden" boxShadow="lg" as={motion.div} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box display="flex" justifyContent="center">
          {avatarBase64 ? (
            <Image src={avatarBase64} alt="Avatar" boxSize="150px" borderRadius="full" mr={4} />
          ) : (
            <Box boxSize="150px" bg="gray.200" borderRadius="full" mr={4} />
          )}
          <Box>
            <Heading as="h2" size="lg">{`${firstName} ${lastName}`}</Heading>
            <Text fontSize="md">Username: {username}</Text>
            <Text fontSize="md">Role: {role}</Text>
            <Box mt={4}>
              <Button colorScheme="blue" leftIcon={PencilIcon} onClick={onOpen}>
                Edit Profile
              </Button>
            </Box>
          </Box>
        </Box>
        <Box mt={6}>
          <Heading as="h3" size="md" mb={2}>About Me</Heading>
          <Text>{aboutMe}</Text>
        </Box>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} mb={3} isRequired />
            <Input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} mb={3} isRequired />
            <Input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} mb={3} isRequired />
            <Textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} placeholder="Write something about yourself..." mb={3} />
            <Input type="file" onChange={handleFileChange} mb={3} />
          </ModalBody>
          <ModalFooter>
            {avatarBase64 && (
              <Button variant="outline" colorScheme="red" mr={3} onClick={handleDeleteAvatar}>
                Delete Avatar
              </Button>
            )}
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

export default ProfilePage;
