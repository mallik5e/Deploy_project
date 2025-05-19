import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { BookingContext } from '../context/BookingContext';

const AddOn = () => {
  const [addOns, setAddOns] = useState([]);
  const { bookingData, updateBookingData } = useContext(BookingContext);

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user/getAddOn');
        const fetchedAddOns = response.data.map((addOn) => ({
          ...addOn,
          isSelected: bookingData.addOns?.some((selected) => selected._id === addOn._id) || false,
        }));
        setAddOns(fetchedAddOns);
      } catch (error) {
        console.error('Failed to fetch add-ons:', error);
      }
    };
    fetchAddOns();
  }, [bookingData.addOns]); // Ensure it updates when services change

  //handle selected add ons
  const handleToggleAddOn = (id) => {
    const updatedAddOns = addOns.map((addOn) =>
      addOn._id === id ? { ...addOn, isSelected: !addOn.isSelected } : addOn
    );
    setAddOns(updatedAddOns);

    const selectedAddOns = updatedAddOns.filter((addOn) => addOn.isSelected);

    updateBookingData({
      addOns: selectedAddOns,
    });
  };

  // Handle clearing add-ons when the date is changed
  useEffect(() => {
    if (bookingData.dateChanged) {
      setAddOns((prevAddOns) =>
        prevAddOns.map((addOn) => ({ ...addOn, isSelected: false }))
      );
      updateBookingData({ addOns: [] });
    }
  }, [bookingData.dateChanged]);

  return (
    <div className='min-h-100 mx-5'>

      <ul className="mt-2">
        {addOns && addOns.length > 0 ? (
          addOns.map((addOn) => (
            <li key={addOn._id} className="flex justify-between items-center text-lg text-gray-600 py-3 border-b">
              <div>
                <span className="font-semibold">{addOn.name}</span>
                <div className="text-md py-1 font-semibold text-blue-500">₹{addOn.price}</div>
                {addOn.description && <div className="text-sm text-gray-400">{addOn.description}</div>}
              </div>
              <input
                type="checkbox"
                checked={addOn.isSelected}
                onChange={() => handleToggleAddOn(addOn._id)}
                className="ml-4 w-5 h-5"
              />
            </li>
          ))
        ) : (
          <li>No add-ons available</li>
        )}
      </ul>
    </div>
  );
};

export default AddOn;
