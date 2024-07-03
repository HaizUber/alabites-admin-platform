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

const OrdersComponent = ({ handleOrderStatusChange }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [uid, setUid] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Filters state
  const [filterOrderNumber, setFilterOrderNumber] = useState('');
  const [filterCustomerName, setFilterCustomerName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterOrderStatus, setFilterOrderStatus] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
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

      setFilteredOrders(filtered);
    };

    applyFilters();
  }, [filterOrderNumber, filterCustomerName, filterEmail, filterOrderStatus, filterMinPrice, filterMaxPrice, orders]);

  const handleViewDetails = order => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    onClose();
  };

  const handleStatusChange = async (order, status) => {
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
    <Box p={4} display="flex" flexDirection={{ base: 'column', md: 'row' }}>
      <Box flex="1" mt={{ base: 4, md: 0 }} p={4}>
        {/* Filters Box */}
        <Box mb={4} p={4} bg="gray.100" borderRadius="md">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Input
              placeholder="Order Number"
              value={filterOrderNumber}
              onChange={e => setFilterOrderNumber(e.target.value)}
            />
            <Input
              placeholder="Customer Name"
              value={filterCustomerName}
              onChange={e => setFilterCustomerName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={filterEmail}
              onChange={e => setFilterEmail(e.target.value)}
            />
            <Select
              placeholder="Order Status"
              value={filterOrderStatus}
              onChange={e => setFilterOrderStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
            <Input
              type="number"
              placeholder="Min Price"
              value={filterMinPrice}
              onChange={e => setFilterMinPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={filterMaxPrice}
              onChange={e => setFilterMaxPrice(e.target.value)}
            />
          </SimpleGrid>
        </Box>

        {/* Orders Table */}
        <Box bg="white" borderRadius="md" boxShadow="md" mt={4}>
          <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
            <Thead>
              <Tr>
                <Th>Order Number</Th>
                <Th>Customer Name</Th>
                <Th>Order Status</Th>
                <Th>Total Amount (PHP)</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredOrders.map(order => (
                <Tr
                  key={order._id}
                  as={motion.tr}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Td>{order.orderNumber}</Td>
                  <Td>{order.customer.name}</Td>
                  <Td>
                    <Box
                      px={2}
                      py={1}
                      rounded="md"
                      bg={getOrderStatusColor(order.orderStatus).bg}
                      color={getOrderStatusColor(order.orderStatus).color}
                      display="inline-block"
                    >
                      {order.orderStatus}
                    </Box>
                  </Td>
                  <Td>{order.totalAmount}</Td>
                  <Td>
                    <Button colorScheme="blue" onClick={() => handleViewDetails(order)}>
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Order Details Modal */}
        {selectedOrder && (
          <Modal isOpen={isOpen} onClose={handleCloseDetails}>
            <ModalOverlay />
            <ModalContent as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ModalHeader>Order Details - {selectedOrder.orderNumber}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <p>Customer Name: {selectedOrder.customer.name}</p>
                <p>Customer Email: {selectedOrder.customer.email}</p>
                <p>Total Amount: {selectedOrder.totalAmount}</p>
                <p>Order Status: {selectedOrder.orderStatus}</p>
                <p>Payment Method: {selectedOrder.paymentDetails.method}</p>
                <p>Transaction ID: {selectedOrder.paymentDetails.transactionId}</p>
                <p>Items:</p>
                <ul>
                  {selectedOrder.items.map((item, index) => (
                    <li key={index}>
                      {item.name} - Quantity: {item.quantity} - Price: {item.price}
                    </li>
                  ))}
                </ul>
              </ModalBody>
              <ModalFooter>
                {selectedOrder.orderStatus === 'Pending' && (
                  <>
                    <Button
                      colorScheme="green"
                      onClick={() => handleStatusChange(selectedOrder, 'Completed')}
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => handleStatusChange(selectedOrder, 'Cancelled')}
                    >
                      Cancel Order
                    </Button>
                  </>
                )}
                <Button onClick={handleCloseDetails}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Box>
    </Box>
  );
};

export default OrdersComponent;
