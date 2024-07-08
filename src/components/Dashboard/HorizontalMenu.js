import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth"; // Import signOut from Firebase auth
import { auth } from "../../config/firebase"; // Ensure auth is imported from your Firebase config

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-settings" width={24} height={24} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const HorizontalMenu = ({ toggleMenu, adminInfo }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fallback values for avatar and name
  const avatar = adminInfo?.avatar || 'https://via.placeholder.com/32';
  const firstName = adminInfo?.firstName || 'Admin';
  const lastName = adminInfo?.lastName || '';

  const handleLogout = async () => {
    try {
      // Sign out the user from Firebase
      await signOut(auth);
      // Redirect to login page after successful logout
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      // Handle sign-out error
    }
  };

  return (
    <div className="sticky top-0 h-16 flex justify-between items-center bg-white border-b shadow-lg px-4 z-50">
      <motion.button
        onClick={toggleMenu}
        className="p-2"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-menu"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </motion.button>
      <motion.div
        className="relative flex items-center"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Tooltip label="View Profile" fontSize="md">
          <img
            alt={`${firstName} ${lastName}`}
            src={avatar}
            className="h-8 w-8 rounded-full object-cover cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            onError={(e) => e.target.src = 'https://via.placeholder.com/32'} // Fallback if image fails to load
          />
        </Tooltip>
        <span className="ml-2 text-gray-700 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          {firstName} {lastName}
        </span>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg"
            >
              <div
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  toggleMenu();
                  navigate("/profile");
                }}
              >
                <SettingsIcon />
                <span className="ml-2">My Profile</span>
              </div>
              <div
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout(); // Call handleLogout function on logout button click
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-logout"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <path d="M9 21h-6a2 2 0 0 1-2-2v-14a2 2 0 0 1 2-2h6" />
                  <path d="M16 17l5-5-5-5m-5 5h14" />
                </svg>
                <span className="ml-2">Logout</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default HorizontalMenu;
