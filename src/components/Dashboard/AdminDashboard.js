import React, { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
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
  const [allProducts, setAllProducts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log('User authenticated:', user.uid);
        setUid(user.uid);
      } else {
        console.log('No user authenticated');
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
  
        // Filter products, orders, and reviews specific to the admin's store
        const storeProducts = productsData.data.filter(product => product.store === adminInfo.storeId);
        console.log('Store products:', storeProducts);
  
        // Filter completed orders for products sold
        const completedOrders = ordersData.filter(order =>
          order.store === adminInfo.storeId && order.orderStatus === 'Completed'
        );
  
        const storeOrders = ordersData.filter(order => order.store === adminInfo.storeId);
  
        const storeReviews = reviewsData.filter(review =>
          storeProducts.some(product => product._id === review.product)
        );
  
        // Fetch detailed product data including photos
        const productDetailsPromises = storeProducts.map(async product => {
          const response = await fetch(`https://alabites-api.vercel.app/products/${product._id}`);
          if (response.ok) {
            const productDetail = await response.json();
            return { ...product, ...productDetail }; // Merge with detailed product data
          }
          return product; // Return original product if fetch fails
        });
  
        const detailedProducts = await Promise.all(productDetailsPromises);
        setAllProducts(detailedProducts);
  
        // Update state with fetched data
        const productSales = {};
        completedOrders.forEach(order => {
          order.items.forEach(item => {
            if (productSales[item.productId]) {
              productSales[item.productId].quantity += item.quantity;
            } else {
              productSales[item.productId] = { ...item, quantity: item.quantity };
            }
          });
        });
  
        const sortedProducts = Object.values(productSales)
          .map(item => ({
            ...item,
            ...detailedProducts.find(product => product._id === item.productId) // Merge with detailed product data
          }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
        setTopSellingProducts(sortedProducts);
  
        const sortedOrders = storeOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setRecentOrders(sortedOrders);
  
        const sortedReviews = storeReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setRecentReviews(sortedReviews);
  
        const totalRatings = storeReviews.reduce((acc, review) => acc + review.rating, 0);
        const avgRating = storeReviews.length ? (totalRatings / storeReviews.length).toFixed(1) : 0;
        setAverageRating(avgRating);
  
        // Identify low stock products
        const lowStock = storeProducts.filter(product => product.stock < 20); // Adjust threshold as needed
        setLowStockProducts(lowStock);
  
        // Calculate total products sold (only from completed orders)
        const totalSold = completedOrders.reduce((acc, order) => {
          return acc + order.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0);
        }, 0);
        setTotalProductsSold(totalSold);
  
        // Calculate total revenue (only from completed orders)
        const revenue = completedOrders.reduce((acc, order) => {
          return acc + order.totalAmount;
        }, 0);
        setTotalRevenue(revenue);
  
        // Calculate total orders (including all statuses)
        setTotalOrders(storeOrders.length);
  
        // Calculate average order value (only from completed orders)
        const avgOrderValue = completedOrders.length > 0 ?
          (revenue / completedOrders.length).toFixed(2) : 0;
        setAverageOrderValue(avgOrderValue);
  
        // Calculate total customers based on unique customer emails in orders
        const uniqueCustomers = new Set(storeOrders.map(order => order.customer.email));
        setTotalCustomers(uniqueCustomers.size);
  
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };
  
    if (adminInfo?.storeId) {
      fetchData();
    }
  }, [adminInfo, setRecentReviews, setTopSellingProducts, setRecentOrders, setAverageRating, setLowStockProducts]);
  
  
  
    
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
          <div className="flex flex-col rounded-lg border border-gray-300 px-4 py-8 text-center shadow-md transition duration-300 hover:shadow-lg bg-gradient-to-r from-red-500 to-red-300 bg-opacity-70">
            <dt className="order-last text-lg font-medium text-gray-100">Average Rating</dt>
            <dd className="text-4xl font-extrabold text-gray-100 md:text-5xl">{averageRating}</dd>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-4">
          <div className="overflow-hidden rounded-lg border border-gray-300 shadow-md transition duration-300 hover:shadow-lg bg-white">
            <div className="p-3">
              <h3 className="text-lg font-medium text-gray-900">Low Stock Products</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <li key={product._id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={product.productPhotos}
                        alt={product.name}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-red-500">Stock: {product.stock}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-300 shadow-md transition duration-300 hover:shadow-lg bg-white">
            <div className="p-3">
              <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {topSellingProducts.map((product) => (
                  <li key={product._id} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={
                          Array.isArray(product.productPhotos) && product.productPhotos.length > 0
                            ? product.productPhotos[0]
                            : 'https://via.placeholder.com/150'
                        }
                        alt={product.name}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">Sold: {product.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-300 shadow-md transition duration-300 hover:shadow-lg bg-white">
            <div className="p-3">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order._id} className="py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order ID: {order.orderNumber}</p>
                        <p className="text-sm text-gray-500">Customer: {order.customer.name}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">PHP {order.totalAmount}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Reviews Section */}
          <div className="overflow-hidden rounded-lg border border-gray-300 shadow-md transition duration-300 hover:shadow-lg bg-white">
            <div className="p-3">
              <h3 className="text-lg font-medium text-gray-900">Recent Reviews</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {allProducts.length > 0 && recentReviews.map((review) => {
                  // Find the corresponding product for this review
                  const product = allProducts.find((product) => product._id === review.product) || {};
                  return (
                    <li key={review._id} className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {/* Product Image */}
                          <img
                            className="h-16 w-16 rounded-full object-cover"
                            src={product.productPhotos?.[0] || 'https://via.placeholder.com/150'}
                            alt={product.name}
                          />
                          {/* Review Details */}
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">Product: {product.name}</p>
                            <p className="text-sm text-gray-500">Comment: {review.comment}</p>
                            <p className="text-sm text-gray-500">Rating: {review.rating}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Create a Store</h2>
              <p className="mb-4">
                It looks like you don't have a store yet. Please create a store to get started.
              </p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                onClick={handleCreateStore}
              >
                Create Store
              </button>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </div>
  );
};

export default AdminDashboard;
