import React from "react";

const HorizontalMenu = ({ toggleMenu, adminInfo }) => {
  return (
    <div className="sticky top-0 h-16 flex justify-between items-center bg-white border-b shadow-lg px-4 z-50">
      <div className="flex items-center">
        <img
          alt=""
          src={adminInfo?.avatar}
          className="h-8 w-8 rounded-full object-cover cursor-pointer"
        />
        <span className="ml-2 text-gray-700 cursor-pointer">
          {adminInfo?.firstName} {adminInfo?.lastName}
        </span>
      </div>
      <button onClick={toggleMenu} className="p-2">
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
      </button>
    </div>
  );
};

export default HorizontalMenu;
