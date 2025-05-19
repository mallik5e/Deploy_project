import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEvent } from "../context/EventContext"; // Import useEvent
import ReferralDoughnutChart from "../components/ReferralDoughnutChart";


const Sidebar = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState(""); // State for select input


  const { setSelectedDate,categories, categoriesFilter, setCategoriesFilter } = useEvent(); // Get setSelectedDate from context

  
  const handleDateChange = (date) => {
    setStartDate(date);
    setSelectedDate(date); // Update selected date in context
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded shadow text-sm text-blue-500 text-center space-y-1">
          <p className='font-bold'>{`${payload[0].payload.fullDate}`}</p>
          <p>{`Bookings: ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-120 m-auto  md:m-4 p-6 bg-white shadow-lg rounded-2xl w-90 md:w-72 flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Filters</h3>

      {/* Date Picker */}
      <div className="mb-5">
        <label className="block text-gray-600 mb-3">Select Date:</label>
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Select Dropdown */}
      <div className="mb-6">
        <label className="block text-gray-600 mb-3">Choose Category:</label>
        <select
             value={categoriesFilter}
             onChange={(e) => setCategoriesFilter(e.target.value)}// Use updated function
             className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
      <option value="" className="bg-blue-500 text-white" disabled>Select an option</option>
      {categories.map((cat, index) => (
        <option key={cat._id || `${cat.category}-${index}`} value={cat.category} className="text-[10px] font-semibold">
           {cat.category}
        </option>
      ))}
    </select>
      </div>

      {/* Small Bar Chart */}
      <div className="w-full h-32">
            <ReferralDoughnutChart/>
          </div>
    </div>
  );
};

export default Sidebar;
