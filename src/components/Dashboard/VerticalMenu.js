import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { auth } from "../../config/firebase";
import logo from "../../assets/logo.png";
import { signOut } from "firebase/auth"; // Import signOut from Firebase auth

const GridIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon icon-tabler icon-tabler-grid"
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
    <rect x={4} y={4} width={6} height={6} rx={1} />
    <rect x={14} y={4} width={6} height={6} rx={1} />
    <rect x={4} y={14} width={6} height={6} rx={1} />
    <rect x={14} y={14} width={6} height={6} rx={1} />
  </svg>
);

const PuzzleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon icon-tabler icon-tabler-puzzle"
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
    <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);

const StackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon icon-tabler icon-tabler-stack"
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
    <polyline points="12 4 4 8 12 12 20 8 12 4" />
    <polyline points="4 12 12 16 20 12" />
    <polyline points="4 16 12 20 20 16" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon icon-tabler icon-tabler-settings"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
  >
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ArrowLeftIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="icon icon-tabler icon-tabler-arrow-left cursor-pointer h-6 w-6"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    onClick={onClick}
  >
    <path stroke="none" d="M0 0h24v24H0z" />
    <path d="M17 12H3M11 18l-6-6 6-6" />
  </svg>
);

const VerticalMenu = ({ isCollapsed, toggleMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Console log for collapse state
  console.log("isCollapsed:", isCollapsed);

  const handleMenuItemClick = (path) => {
    navigate(path);
    if (isCollapsed) {
      toggleMenu(); // Close the menu if it's collapsed
    }
  };

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
    <motion.div
      className={`fixed top-0 left-0 h-full flex flex-col justify-between border-e bg-white shadow-lg transition-all duration-300 z-50 ${
        isCollapsed ? "w-0" : "w-64"
      }`}
      initial={false}
      animate={isCollapsed ? { x: -240 } : { x: 0 }}
    >
      <div className="flex items-center justify-between px-4 py-6">
        <ArrowLeftIcon onClick={toggleMenu} />
        <img
          src={logo}
          alt="Logo"
          className={`rounded-lg transition-all duration-300 ${
            isCollapsed ? "h-10 w-10" : "h-16 w-32"
          }`}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-4">
          <motion.li
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Tippy content="Dashboard" placement="right">
              <a
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuItemClick("/dashboard");
                }}
                className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition ${
                  location.pathname === "/dashboard"
                    ? "bg-gray-200"
                    : "bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <GridIcon />
                {!isCollapsed && <span className="ml-3">Dashboard</span>}
              </a>
            </Tippy>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Tippy content="Personal" placement="right">
              <a
                href="/profile"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuItemClick("/profile");
                }}
                className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition ${
                  location.pathname === "/profile"
                    ? "bg-gray-200"
                    : "bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <SettingsIcon />
                {!isCollapsed && <span className="ml-3">Personal</span>}
              </a>
            </Tippy>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Tippy content="Products" placement="right">
              <a
                href="/products"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuItemClick("/products");
                }}
                className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition ${
                  location.pathname === "/products"
                    ? "bg-gray-200"
                    : "bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <PuzzleIcon />
                {!isCollapsed && <span className="ml-3">Products</span>}
              </a>
            </Tippy>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Tippy content="Orders" placement="right">
              <a
                href="/orders"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuItemClick("/orders");
                }}
                className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition ${
                  location.pathname === "/orders"
                    ? "bg-gray-200"
                    : "bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <StackIcon />
                {!isCollapsed && <span className="ml-3">Orders</span>}
              </a>
            </Tippy>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Tippy content="Store" placement="right">
              <a
                href="/store"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuItemClick("/store");
                }}
                className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition ${
                  location.pathname === "/orders"
                    ? "bg-gray-200"
                    : "bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <StackIcon />
                {!isCollapsed && <span className="ml-3">Store</span>}
              </a>
            </Tippy>
          </motion.li>
        </ul>
      </div>
      <div className="px-4 py-3 border-t">
        <button
          onClick={handleLogout}
          className="block w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default VerticalMenu;
