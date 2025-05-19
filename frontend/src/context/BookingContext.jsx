import { createContext, useEffect, useState } from "react";
//import axios from 'axios'
//import {toast} from 'react-toastify'


export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    selectedDate: '',
    services: [],
    addOns:[],
    userInfo: {},
    priceSummary: {},
    paymentStatus: ''
  });

  const updateBookingData = (newData) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    console.log('Booking Data:', bookingData);
  }, [bookingData]);

  

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingProvider;