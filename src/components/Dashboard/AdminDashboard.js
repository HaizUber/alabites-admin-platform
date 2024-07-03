import React, { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import VerticalMenu from './VerticalMenu';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [uid, setUid] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null); // State for admin information
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log('User authenticated:', user.uid);
        setUid(user.uid);
      } else {
        console.log('No user authenticated');
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
            console.log('Admin info fetched:', admin);
            // Fetch stores and find the user's store
            const storeResponse = await fetch('https://alabites-api.vercel.app/store');
            if (storeResponse.ok) {
              const storeData = await storeResponse.json();
              const userStore = storeData.data.find(store => store.storeOwner === admin.uid);
              if (userStore) {
                console.log('User store found:', userStore);
                // Update adminInfo with storeId
                const updatedAdminInfo = { ...admin, storeId: userStore.storeId };
                setAdminInfo(updatedAdminInfo);
              } else {
                console.log('User does not have a store');
                setShowModal(true); // Show the modal if user does not have a store
              }
            } else {
              throw new Error('Failed to fetch stores');
            }
          } else {
            throw new Error('Admin not found');
          }
        } else {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch admins: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
        toast.error('Error fetching admins. Please try again.');
      }
    };

    // Call fetchAdminInfo when the component mounts
    if (uid) {
      fetchAdminInfo();
    }
  }, [uid]);

  useEffect(() => {
    console.log('Admin Info updated:', adminInfo);
  }, [adminInfo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!adminInfo || !adminInfo.storeId) {
          console.log('AdminInfo or storeId not available');
          setShowModal(true);
          return;
        }
  
        const [productsRes, ordersRes, reviewsRes] = await Promise.all([
          fetch('https://alabites-api.vercel.app/products'),
          fetch('https://alabites-api.vercel.app/orders'),
          fetch(`https://alabites-api.vercel.app/reviews/store/${adminInfo.storeId}`)
        ]);
  
        if (!productsRes.ok || !ordersRes.ok || !reviewsRes.ok) {
          throw new Error('Failed to fetch data');
        }
  
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        const reviewsData = await reviewsRes.json();
  
        console.log('Products data:', productsData);
        console.log('Orders data:', ordersData);
        console.log('Reviews data:', reviewsData);
  
        // Filter products, orders, and reviews specific to the admin's store
        const storeProducts = productsData.data.filter(product => product.store === adminInfo.storeId);
        console.log('Store products:', storeProducts);
  
        const storeOrders = ordersData.filter(order => {
          console.log('Order store:', order.store);
          console.log('Admin storeId:', adminInfo.storeId);
          console.log('Order status:', order.orderStatus);
          return order.store === adminInfo.storeId && order.orderStatus === 'Completed';
        });
        console.log('Store orders:', storeOrders);
  
        const storeReviews = reviewsData.filter(review => storeProducts.some(product => product._id === review.product));
        console.log('Store reviews:', storeReviews);
  
        // Update state with fetched data
        const productsSold = storeOrders.reduce((acc, order) => acc + order.items.reduce((sum, item) => sum + item.quantity, 0), 0);
        setTotalProductsSold(productsSold);
  
        const revenue = storeOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        setTotalRevenue(revenue);
  
        setTotalOrders(storeOrders.length);
  
        const avgOrderValue = storeOrders.length ? (revenue / storeOrders.length).toFixed(2) : 0;
        setAverageOrderValue(avgOrderValue);
  
        const uniqueCustomers = new Set(storeOrders.map(order => order.customer.email)).size;
        setTotalCustomers(uniqueCustomers);
  
        const lowStock = storeProducts.filter(product => product.stock < 10); // adjust threshold as needed
        setLowStockProducts(lowStock);
  
        const productSales = {};
        storeOrders.forEach(order => {
          order.items.forEach(item => {
            if (productSales[item.productId]) {
              productSales[item.productId].quantity += item.quantity;
            } else {
              productSales[item.productId] = { ...item, quantity: item.quantity };
            }
          });
        });
        const sortedProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
        setTopSellingProducts(sortedProducts);
  
        const sortedOrders = storeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setRecentOrders(sortedOrders);
  
        const sortedReviews = storeReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setRecentReviews(sortedReviews);
  
        const totalRatings = storeReviews.reduce((acc, review) => acc + review.rating, 0);
        const avgRating = storeReviews.length ? (totalRatings / storeReviews.length).toFixed(1) : 0;
        setAverageRating(avgRating);
  
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };
  
    if (adminInfo?.storeId) {
      fetchData();
    }
  }, [adminInfo]);
  
  
  
  const handleCreateStore = () => {
    setShowModal(false);
    navigate('/create-store-form');
  };

  return (
    <div className="flex bg-gray-200 min-h-screen">
    <div className="flex flex-col flex-1 bg-gray-100 border-l border-gray-100 p-3">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-3">
        <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-orange-500 to-orange-300 bg-opacity-70">
          <dt className="order-last text-lg font-medium text-gray-100">Total Products Sold</dt>
          <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">{totalProductsSold}</dd>
        </div>
        <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-blue-500 to-blue-300 bg-opacity-70">
          <dt className="order-last text-lg font-medium text-gray-100">Total Revenue</dt>
          <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">PHP {totalRevenue}</dd>
        </div>
        <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-green-500 to-green-300 bg-opacity-70">
          <dt className="order-last text-lg font-medium text-gray-100">Total Orders</dt>
          <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">{totalOrders}</dd>
        </div>
        <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-purple-500 to-purple-300 bg-opacity-70">
          <dt className="order-last text-lg font-medium text-gray-100">Average Order Value</dt>
          <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">PHP {averageOrderValue}</dd>
        </div>
        <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-300 bg-opacity-70">
          <dt className="order-last text-lg font-medium text-gray-100">Total Customers</dt>
          <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">{totalCustomers}</dd>
        </div>
        <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-pink-500 to-pink-300 bg-opacity-70">
          <dt className="order-last text-lg font-medium text-gray-100">Average Rating</dt>
          <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">{averageRating}</dd>
        </div>
      </div>
      <div className="grid grid-cols-1 mt-6 gap-4 sm:grid-cols-2 sm:gap-3">
        <div className="bg-white rounded-lg border border-gray-300 px-4 py-6 shadow-md transition duration-300 hover:shadow-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Low Stock Products</h3>
          <ul>
            {lowStockProducts.map(product => (
              <li key={product.id} className="flex justify-between items-center py-2">
                <span>{product.name}</span>
                <span className="text-red-500">Stock: {product.stock}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 px-4 py-6 shadow-md transition duration-300 hover:shadow-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top Selling Products</h3>
          <ul>
            {topSellingProducts.map(product => (
              <li key={product.productId} className="flex justify-between items-center py-2">
                <span>{product.name}</span>
                <span className="text-green-500">{product.quantity} sold</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 px-4 py-6 shadow-md transition duration-300 hover:shadow-lg col-span-2">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Orders</h3>
          <ul>
            {recentOrders.map(order => (
              <li key={order.id} className="border-b border-gray-200 py-2">
                <div className="flex justify-between items-center">
                  <span>{order.customer.name}</span>
                  <span>${order.totalAmount}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 px-4 py-6 shadow-md transition duration-300 hover:shadow-lg col-span-2">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Reviews</h3>
          <ul>
            {recentReviews.map(review => (
              <li key={review.id} className="border-b border-gray-200 py-2">
                <div className="flex justify-between items-center">
                  <span>{review.customerName}</span>
                  <span className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <svg key={index} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 fill-current ${index < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 1l2.56 5.806L18 7.5l-4.65 4.19L14.8 19 10 15.987 5.2 19l1.45-7.31L2 7.5l5.44-.694L10 1z" clipRule="evenodd" />
                      </svg>
                    ))}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{review.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
      <ToastContainer position="bottom-right" />
      {/* Modal for creating store */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create Store</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">You need to create a store to continue.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={handleCreateStore} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Create Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
