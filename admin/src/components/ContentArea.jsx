import React, { useEffect, useState } from "react";
import axios from "axios";
import { useEvent } from "../context/EventContext"; 
import { format } from "date-fns";
import { IoMdArrowDropright } from "react-icons/io";
import { BsDot } from 'react-icons/bs'; // A clean dot

const ContentArea = ({ events }) => {
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { categories, selectedDate, categoriesFilter, bookedServiceEvents } = useEvent(); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDate) return;
      
      try {
        setLoading(true);
        const formattedDate = format(new Date(selectedDate), "yyyy-MM-dd");
        const response = await axios.get(`https://deploy-project-k4im.onrender.com/api/admin/view?date=${formattedDate}`);
        const filteredData = response.data.filter(
          (booking) => format(new Date(booking.selectedDate), "yyyy-MM-dd") === formattedDate
        );
        setBookings(filteredData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchBookings();
    }
  }, [selectedDate]);

  const validCategories = Array.isArray(categories) ? categories : [];

  const bookingsWithCategory = bookings.map((booking) => {
    const category = validCategories.find((cat) => String(cat._id) === String(booking.services?.[0]?.eventId));
    return { ...booking, category: category?.category || "Uncategorized" };
  });

  const formattedSelectedDate = selectedDate ? format(new Date(selectedDate), "yyyy-MM-dd") : null;

  const filteredBookings = bookingsWithCategory.filter((booking) => {
    const formattedBookingDate = format(new Date(booking.selectedDate), "yyyy-MM-dd");

    const categoryMatch = !categoriesFilter || categoriesFilter === "All" || booking.category === categoriesFilter;
    const dateMatch = !formattedSelectedDate || formattedBookingDate === formattedSelectedDate;

    const searchMatch =
      !searchQuery ||
      booking.services.some((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      booking.userInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userInfo.email.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && dateMatch && searchMatch;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => a.category.localeCompare(b.category));
  
  const displayBookings = bookedServiceEvents?.length > 0 ? bookedServiceEvents : sortedBookings;

  return (
    <div className="md:mx-10 my-4 bg-white shadow-lg rounded-2xl p-6 flex-1">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-4">Bookings</h2>
        <input
          type="text"
          placeholder="Search by event name, username, or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mx-2 px-3 w-1/2 border rounded-md mb-2"
        />
      </div>

      {loading ? (
        <p className="text-center m-10 text-gray-500">Loading bookings...</p>
      ) : selectedDate && displayBookings.length > 0 ? (
        <div className="h-[390px] overflow-hidden mt-1">
  <div className="h-[390px] overflow-y-auto scrollbar-hide">
    <table className="w-full border-collapse bg-white rounded-lg">
      <thead className="bg-gray-200 text-gray-700 sticky top-0 z-10">
        <tr>
          <th className="p-5 text-left w-2/5">Event Name</th>
          <th className="px-1 py-5 text-left">Username</th>
          <th className="p-5 ">Contact</th>
          <th className="p-5 ">Payment Status</th>
        </tr>
      </thead>
      <tbody>
        {displayBookings.map((booking, index) => (
          <tr key={index} className="border-b transition-all hover:bg-gray-100">
            <td className="p-2 w-2/5">
              {booking.services && booking.services.length > 0 ? (
                booking.services.map((service, i) => (
                  <p key={i} className="flex items-center pb-1">
                    <IoMdArrowDropright className="text-gray-500" size={20} />
                    {service.name}
                  </p>
                ))
              ) : (
                <p>No Service Name</p>
              )}
              {booking.addOns && booking.addOns.length > 0 && (
                booking.addOns.map((addOn, i) => (
                  <p key={i} className="flex items-center pl-1 md:pl-6 text-[15px] text-gray-800 font-semibold">
                    <BsDot className="text-gray-500 text-center" size={25} />
                    {addOn.name}
                  </p>
                ))
              )}
            </td>
            <td className="p-2">{booking.userInfo?.fullName || "N/A"}</td>
            <td className="p-2 text-center">
              <p className="px-8">{booking.userInfo?.contactNumber || "N/A"}</p>
              <p className="text-gray-600">{booking.userInfo?.email || "N/A"}</p>
            </td>
            <td className={`p-3 font-semibold text-center ${
              booking?.paymentStatus === "success" ? "text-green-600" : "text-red-600"
            }`}>
              {booking.paymentStatus || "Pending"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


      ) : (
        <p className="text-center m-10 text-gray-500">
          {selectedDate ? "No events found for this date..." : "Please select a date..."}
        </p>
      )}
    </div>
  );
};

export default ContentArea;
