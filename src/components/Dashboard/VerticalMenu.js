import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from '../../config/firebase';
import logo from '../../assets/logo.png';
// Define SVG icons as constants
const GridIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-grid" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" />
      <rect x={4} y={4} width={6} height={6} rx={1} />
      <rect x={14} y={4} width={6} height={6} rx={1} />
      <rect x={4} y={14} width={6} height={6} rx={1} />
      <rect x={14} y={14} width={6} height={6} rx={1} />
    </svg>
  );
  
  const PuzzleIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-puzzle" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  );
  
  const StackIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-stack" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" />
      <polyline points="12 4 4 8 12 12 20 8 12 4" />
      <polyline points="4 12 12 16 20 12" />
      <polyline points="4 16 12 20 20 16" />
    </svg>
  );
  
  const SettingsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-settings" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  );
  
  function VerticalMenu() {
      const navigate = useNavigate();
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
  
      const navigateToDashboard = () => {
          navigate('/dashboard');
      };
  
      const navigateToPersonal = () => {
          navigate('/profile');
      };
  
      const navigateToProducts = () => {
          navigate('/products');
      };
  
      const navigateToOrders = () => {
          navigate('/orders');
      };
  
      const navigateToManagers = () => {
          navigate('/managers');
      };
  
      return (
          <div className="sticky top-0 h-screen flex flex-col justify-between border-e bg-white">
              <div className="px-4 py-6">
              <img src={logo} alt="Logo" className="h-22 w-32 rounded-lg text-xs text-gray-600" />
  
                  <ul className="mt-6 space-y-1">
                      <li>
                          <a
                              href="#"
                              onClick={navigateToDashboard}
                              className="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                              {GridIcon}
                              Dashboard
                          </a>
                      </li>
  
                      <li>
                          <a
                              href="#"
                              onClick={navigateToPersonal}
                              className="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                              {SettingsIcon}
                              Personal
                          </a>
                      </li>
  
                      <li>
                          <hr className="my-1 border-gray-200" />
                      </li>
  
                      <li>
                          <a
                              href="#"
                              onClick={navigateToProducts}
                              className="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                              {PuzzleIcon}
                              Products
                          </a>
                      </li>
  
                      <li>
                          <a
                              href="#"
                              onClick={navigateToOrders}
                              className="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                              {StackIcon}
                              Orders
                          </a>
                      </li>
  
                      <li>
                          <hr className="my-1 border-gray-200" />
                      </li>
  
                      <li>
                          <a
                              href="#"
                              onClick={navigateToManagers}
                              className="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                              {SettingsIcon}
                              Managers
                          </a>
                      </li>
                  </ul>
              </div>
  
              <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
                  <a href="#" className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
                      <img
                          alt=""
                          src={adminInfo?.avatar}
                          className="size-10 rounded-full object-cover"
                      />
  
                      <div>
                          <p className="text-xs">
                              <strong className="block font-medium">{adminInfo?.firstName} {adminInfo?.lastName}</strong>
                              <span> {adminInfo?.email} </span>
                          </p>
                      </div>
                  </a>
              </div>
          </div>
      );
  }
  
  export default VerticalMenu;
