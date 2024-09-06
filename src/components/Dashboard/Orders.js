import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Input,
  Select,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const OrdersComponent = ({ handleOrderStatusChange }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [uid, setUid] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Filters state
  const [filterOrderNumber, setFilterOrderNumber] = useState('');
  const [filterCustomerName, setFilterCustomerName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15; // Number of orders to display per page
  const maxVisiblePages = 5; // Maximum number of pages to show directly

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
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };

    if (uid) {
      fetchAdminInfo();
    }
  }, [uid]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (storeId) {
          const response = await axios.get('https://alabites-api.vercel.app/orders');
          const filteredOrders = response.data.filter(order => order.store === storeId);
          setOrders(filteredOrders);
          setFilteredOrders(filteredOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [storeId]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = orders.filter(order => {
        let pass = true;
        if (filterOrderNumber && !order.orderNumber.toLowerCase().includes(filterOrderNumber.toLowerCase())) {
          pass = false;
        }
        if (filterCustomerName && !order.customer.name.toLowerCase().includes(filterCustomerName.toLowerCase())) {
          pass = false;
        }
        if (filterEmail && !order.customer.email.toLowerCase().includes(filterEmail.toLowerCase())) {
          pass = false;
        }
        if (filterOrderStatus && order.orderStatus !== filterOrderStatus) {
          pass = false;
        }
        if (filterMinPrice && parseFloat(order.totalAmount) < parseFloat(filterMinPrice)) {
          pass = false;
        }
        if (filterMaxPrice && parseFloat(order.totalAmount) > parseFloat(filterMaxPrice)) {
          pass = false;
        }
        return pass;
      });

      // Sort orders: Pending > Completed > Cancelled
      filtered = filtered.sort((a, b) => {
        if (a.orderStatus === 'Pending' && b.orderStatus !== 'Pending') return -1;
        if (a.orderStatus !== 'Pending' && b.orderStatus === 'Pending') return 1;
        if (a.orderStatus === 'Completed' && b.orderStatus !== 'Completed') return -1;
        if (a.orderStatus !== 'Completed' && b.orderStatus === 'Completed') return 1;
        return 0;
      });

      setFilteredOrders(filtered);
    };

    applyFilters();
  }, [filterOrderNumber, filterCustomerName, filterEmail, filterOrderStatus, filterMinPrice, filterMaxPrice, orders]);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  const handleViewDetails = order => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    onClose();
  };

  const handleStatusChange = async (order, status) => {
    if (status === 'Completed') {
      setIsMarkingComplete(true);
    } else if (status === 'Cancelled') {
      setIsCancellingOrder(true);
    }
  
    try {
      const response = await axios.patch(`https://alabites-api.vercel.app/orders/${order._id}/status`, {
        orderStatus: status,
      });
  
      if (response.status === 200) {
        const updatedOrder = { ...order, orderStatus: status };
  
        setOrders(prevOrders =>
          prevOrders.map(o => (o._id === order._id ? updatedOrder : o))
        );
        setFilteredOrders(prevOrders =>
          prevOrders.map(o => (o._id === order._id ? updatedOrder : o))
        );
  
        toast({
          title: 'Success',
          description: `Order status updated to ${status}.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      if (status === 'Completed') {
        setIsMarkingComplete(false);
      } else if (status === 'Cancelled') {
        setIsCancellingOrder(false);
      }
  
      setSelectedOrder(null);
      onClose();
    }
  };
  

  const getOrderStatusColor = status => {
    switch (status) {
      case 'Pending':
        return { bg: 'orange', color: 'white' };
      case 'Completed':
        return { bg: 'green', color: 'white' };
      case 'Cancelled':
      case 'Refunded':
        return { bg: 'red', color: 'white' };
      default:
        return { bg: 'gray', color: 'white' };
    }
  };

  return (
    <Box p={4} display="flex" flexDirection={{ base: 'column', md: 'row' }} overflowX="auto" maxWidth="100%">
      <Box flex="1" mt={{ base: 4, md: 0 }} p={4} minWidth={0}>
        {/* Filters Box */}
        <Box mb={4} p={4} bg="gray.100" borderRadius="md">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Input
              placeholder="Order Number"
              value={filterOrderNumber}
              onChange={(e) => setFilterOrderNumber(e.target.value)}
            />
            <Input
              placeholder="Customer Name"
              value={filterCustomerName}
              onChange={(e) => setFilterCustomerName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
            <Select
              placeholder="Order Status"
              value={filterOrderStatus}
              onChange={(e) => setFilterOrderStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
            </Select>
            <Input
              placeholder="Min Price"
              type="number"
              value={filterMinPrice}
              onChange={(e) => setFilterMinPrice(e.target.value)}
            />
            <Input
              placeholder="Max Price"
              type="number"
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(e.target.value)}
            />
          </SimpleGrid>
        </Box>
        {/* Orders Table */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Order Number</Th>
                <Th>Customer Name</Th>
                <Th>Email</Th>
                <Th>Order Status</Th>
                <Th>Total Amount</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentOrders.map(order => (
                <Tr key={order._id}>
                  <Td>{order.orderNumber}</Td>
                  <Td>{order.customer.name}</Td>
                  <Td>{order.customer.email}</Td>
                  <Td>
                    <Box
                      px={2}
                      py={1}
                      borderRadius="md"
                      bg={getOrderStatusColor(order.orderStatus).bg}
                      color={getOrderStatusColor(order.orderStatus).color}
                      textAlign="center"
                    >
                      {order.orderStatus}
                    </Box>
                  </Td>
                  <Td>₱{order.totalAmount.toFixed(2)}</Td>
                  <Td>
                    <Button size="sm" onClick={() => handleViewDetails(order)}>
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        {/* Pagination */}
        <Box mt={4} display="flex" justifyContent="center">
          {Array(Math.ceil(filteredOrders.length / ordersPerPage))
            .fill()
            .map((_, i) => (
              <Button
                key={i + 1}
                size="sm"
                onClick={() => paginate(i + 1)}
                isActive={i + 1 === currentPage}
                mx={1}
              >
                {i + 1}
              </Button>
            ))}
        </Box>
      </Box>

{/* Order Details Modal */}
<Modal isOpen={isOpen} onClose={handleCloseDetails}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Order Details</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {selectedOrder && (
        <Box>
          <Box mb={4}>
            <strong>Order Number:</strong> {selectedOrder.orderNumber}
          </Box>
          <Box mb={4}>
            <strong>Customer Name:</strong> {selectedOrder.customer.name}
          </Box>
          <Box mb={4}>
            <strong>Email:</strong> {selectedOrder.customer.email}
          </Box>
          <Box mb={4}>
            <strong>Payment Method:</strong> {selectedOrder.paymentDetails.method}
          </Box>
          <Box mb={4}>
            <strong>Order Status:</strong>{' '}
            <Box
              display="inline-block"
              px={2}
              py={1}
              borderRadius="md"
              bg={getOrderStatusColor(selectedOrder.orderStatus).bg}
              color={getOrderStatusColor(selectedOrder.orderStatus).color}
            >
              {selectedOrder.orderStatus}
            </Box>
          </Box>
          <Box mb={4}>
            <strong>Total Amount:</strong> ₱{selectedOrder.totalAmount.toFixed(2)}
          </Box>
          <Box mb={4}>
            <strong>Items:</strong>
            <Table variant="simple" mt={2}>
              <Thead>
                <Tr>
                  <Th>Product</Th>
                  <Th>Quantity</Th>
                  <Th>Price</Th>
                </Tr>
              </Thead>
              <Tbody>
                {selectedOrder.items.map(item => (
                  <Tr key={item.productId}>
                    <Td>{item.name}</Td> {/* Ensure you're accessing product name correctly */}
                    <Td>{item.quantity}</Td>
                    <Td>₱{item.price.toFixed(2)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </ModalBody>
    <ModalFooter>
      {selectedOrder && selectedOrder.orderStatus === 'Pending' && (
        <>
          <Button
            colorScheme="green"
            mr={3}
            onClick={() => handleStatusChange(selectedOrder, 'Completed')}
            isLoading={isMarkingComplete}
            loadingText="Marking as Complete"
          >
            Mark as Complete
          </Button>
          <Button
            colorScheme="red"
            onClick={() => handleStatusChange(selectedOrder, 'Cancelled')}
            isLoading={isCancellingOrder}
            loadingText="Cancelling Order"
          >
            Cancel Order
          </Button>
        </>
      )}
      <Button onClick={handleCloseDetails}>Close</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

    </Box>
  );
};

export default OrdersComponent;
