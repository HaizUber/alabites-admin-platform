import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../../config/firebase";
import logo from "../../assets/logo.png";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-grid" width={24} height={24} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" />
    <rect x={4} y={4} width={6} height={6} rx={1} />
    <rect x={14} y={4} width={6} height={6} rx={1} />
    <rect x={4} y={14} width={6} height={6} rx={1} />
    <rect x={14} y={14} width={6} height={6} rx={1} />
  </svg>
);

const PuzzleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-puzzle" width={24} height={24} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" />
    <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);

const StackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-stack" width={24} height={24} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" />
    <polyline points="12 4 4 8 12 12 20 8 12 4" />
    <polyline points="4 12 12 16 20 12" />
    <polyline points="4 16 12 20 20 16" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-settings" width={24} height={24} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ArrowLeftIcon = ({ onClick }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-left cursor-pointer h-6 w-6" width={24} height={24} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" onClick={onClick}>
    <path stroke="none" d="M0 0h24v24H0z" />
    <path d="M17 12H3M11 18l-6-6 6-6" />
  </svg>
);

const VerticalMenu = ({ isCollapsed, toggleMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [uid, setUid] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);

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
          } else {
            console.error("Admin not found");
          }
        } else {
          const errorMessage = await response.text();
          console.error(`Failed to fetch admins: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    if (uid) {
      fetchAdminInfo();
    }
  }, [uid]);

  const menuItems = [
    { icon: <GridIcon />, text: "Dashboard", path: "/dashboard" },
    { icon: <SettingsIcon />, text: "Personal", path: "/profile" },
    { icon: <PuzzleIcon />, text: "Products", path: "/products" },
    { icon: <StackIcon />, text: "Orders", path: "/orders" },
  ];

  return (
    <motion.div className={`fixed top-0 left-0 h-full flex flex-col justify-between border-e bg-white shadow-lg transition-all duration-300 z-50 ${isCollapsed ? "w-0" : "w-64"}`} initial={false} animate={isCollapsed ? { x: -240 } : { x: 0 }}>
      <div className="flex items-center justify-between px-4 py-6">
        <ArrowLeftIcon onClick={toggleMenu} />
        <img src={logo} alt="Logo" className={`rounded-lg transition-all duration-300 ${isCollapsed ? "h-10 w-10" : "h-16 w-32"}`} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-4">
          {menuItems.map((item, index) => (
            <motion.li key={index} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
              <Tippy content={item.text} placement="right">
                <a href="#" onClick={() => navigate(item.path)} className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition ${location.pathname === item.path ? "bg-gray-200" : "bg-gray-100"} ${isCollapsed ? "justify-center" : ""}`}>
                  {item.icon}
                  {!isCollapsed && <span className="ml-3">{item.text}</span>}
                </a>
              </Tippy>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default VerticalMenu;
