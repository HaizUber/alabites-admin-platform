import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../../assets/logo.png'; // Import logo image

function VerticalMenu() {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    
    const navigateToDashboard = () => {
        navigate('/dashboard');
    };

    const navigateToProducts = () => {
        navigate('/products');
    };

    const navigateToAccounts = () => {
        navigate('/accounts');
    };

    return (
        <div>
            {/* Desktop view */}
            <div className="w-64 absolute sm:relative bg-gray-100 shadow md:h-full flex-col justify-between hidden sm:flex">
                <div className="px-8">
                    <div className="h-16 w-full flex items-center">
                        <img src={logo} alt="Logo" className="h-16 w-auto mx-auto" />
                    </div>
                    <ul className="mt-12">
                        <li onClick={navigateToDashboard} className="flex w-full justify-between text-gray-700 hover:text-green-600 cursor-pointer items-center mb-6">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-grid" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" />
                                    <rect x={4} y={4} width={6} height={6} rx={1} />
                                    <rect x={14} y={4} width={6} height={6} rx={1} />
                                    <rect x={4} y={14} width={6} height={6} rx={1} />
                                    <rect x={14} y={14} width={6} height={6} rx={1} />
                                </svg>
                                <span className="text-sm  ml-2">Dashboard</span>
                            </div>
                            <div className="py-1 px-3 bg-green-100 rounded text-green-600 flex items-center justify-center text-xs">5</div>
                        </li>
                        <li onClick={navigateToProducts} className="flex w-full justify-between text-gray-700 hover:text-green-600 cursor-pointer items-center mb-6">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-puzzle" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" />
                                    <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                </svg>
                                <span className="text-sm  ml-2">Products</span>
                            </div>
                            <div className="py-1 px-3 bg-yellow-100 rounded text-yellow-600 flex items-center justify-center text-xs">8</div>
                        </li>
                        <li className="flex w-full justify-between text-gray-700 hover:text-green-600 cursor-pointer items-center mb-6">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-stack" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" />
                                    <polyline points="12 4 4 8 12 12 20 8 12 4" />
                                    <polyline points="4 12 12 16 20 12" />
                                    <polyline points="4 16 12 20 20 16" />
                                </svg>
                                <span className="text-sm  ml-2">Inventory</span>
                            </div>
                        </li>
                        <li onClick={navigateToAccounts} className="flex w-full justify-between text-gray-700 hover:text-green-600 cursor-pointer items-center">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-settings" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
                                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                <span className="text-sm  ml-2">Account</span>
                            </div>
                        </li>
                    </ul>
                    <div className="flex justify-center mt-48 mb-4 w-full"></div>
                </div>
            </div>

{/* Mobile view */}
<div className={show ? "w-64 absolute sm:relative bg-gray-100 shadow md:h-full flex-col justify-between sm:hidden transition duration-150 ease-in-out transform -translate-x-full" : "w-64 absolute sm:relative bg-gray-100 shadow md:h-full flex-col justify-between sm:hidden transition duration-150 ease-in-out transform -translate-x-0"} id="mobile-nav">
    <div className="h-10 w-10 bg-gray-100 absolute right-0 mt-16 -mr-10 flex items-center shadow rounded-tr rounded-br justify-center cursor-pointer" id="mobile-toggler" onClick={() => setShow(!show)}>
        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-adjustments" width={20} height={20} viewBox="0 0 24 24" strokeWidth="1.5" stroke="#000000" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" />
            <circle cx={6} cy={10} r={2} />
            <line x1={6} y1={4} x2={6} y2={8} />
            <line x1={6} y1={12} x2={6} y2={20} />
            <circle cx={12} cy={16} r={2} />
            <line x1={12} y1={4} x2={12} y2={14} />
            <line x1={12} y1={18} x2={12} y2={20} />
            <circle cx={18} cy={7} r={2} />
            <line x1={18} y1={4} x2={18} y2={5} />
            <line x1={18} y1={9} x2={18} y2={20} />
        </svg>
    </div>
    <div className="px-8">
        <div className="h-16 w-full flex items-center">
            <img src={logo} alt="Logo" className="h-16 w-auto mx-auto" />
        </div>
        <ul className="mt-12">
            <li onClick={navigateToDashboard} className="flex w-full justify-between text-gray-700 hover:text-green-600 cursor-pointer items-center mb-6">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-grid" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" />
                        <rect x={4} y={4} width={6} height={6} rx={1} />
                        <rect x={14} y={4} width={6} height={6} rx={1} />
                        <rect x={4} y={14} width={6} height={6} rx={1} />
                        <rect x={14} y={14} width={6} height={6} rx={1} />
                    </svg>
                    <span className="text-sm  ml-2">Dashboard</span>
                </div>
                <div className="py-1 px-3 bg-green-100 rounded text-green-600 flex items-center justify-center text-xs">5</div>
            </li>
            <li onClick={navigateToProducts} className="flex w-full justify-between text-gray-700 hover:text-green-600 cursor-pointer items-center mb-6">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-puzzle" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" />
                        <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    <span className="text-sm  ml-2">Products</span>
                </div>
                <div className="py-1 px-3 bg-yellow-100 rounded text-yellow-600 flex items-center justify-center text-xs">8</div>
            </li>
            <li className="flex w-full justify-between text-gray-700 hover:text-green-600 cursor-pointer items-center mb-6">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-stack" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" />
                        <polyline points="12 4 4 8 12 12 20 8 12 4" />
                        <polyline points="4 12 12 16 20 12" />
                        <polyline points="4 16 12 20 20 16" />
                    </svg>
                    <span className="text-sm  ml-2">Inventory</span>
                </div>
            </li>
            <li onClick={navigateToAccounts} className="flex w-full justify-between text-gray-700 hover:text-green-600 cursor-pointer items-center">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-settings" width={18} height={18} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span className="text-sm  ml-2">Account</span>
                </div>
            </li>
        </ul>
        <div className="flex justify-center mt-48 mb-4 w-full"></div>
    </div>
</div>
</div>

    );
}

export default VerticalMenu;
