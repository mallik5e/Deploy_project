import React, { useState, useEffect } from "react";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import * as XLSX from "xlsx"; // Import XLSX library
import { IoMdCloudDownload,IoMdArrowDropright } from "react-icons/io";
import { BsDot } from 'react-icons/bs';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState({
    serviceName: true,
    date: true,
    userName: true,
    email: true,
    contact: true,
    city: true,
    paymentStatus: true,
  });
  const [showFilter, setShowFilter] = useState(false);
  

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/view");
        const data = await response.json();
        console.log("Fetched Data:", data);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    const serviceName = booking?.services?.[0]?.name?.toLowerCase() || "";
    const userName = booking?.userInfo?.fullName?.toLowerCase() || "";
    const email = booking?.userInfo?.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return (
      serviceName.includes(query) ||
      userName.includes(query) ||
      email.includes(query)
    );
  });


  // ✅ Handle Column Visibility Toggle
  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };
 
  // ✅ Export Visible Columns Only
  const downloadExcel = () => {
    const filteredData = bookings.map((booking) => {
      let row = {};
      if (visibleColumns.serviceName)
        row["Service Name"] = booking?.services?.[0]?.name || "No Service";
      if (visibleColumns.date) row["Date"] = formatDate(booking?.selectedDate);
      if (visibleColumns.userName) row["User Name"] = booking?.userInfo?.fullName || "N/A";
      if (visibleColumns.email) row["Email"] = booking?.userInfo?.email || "N/A";
      if (visibleColumns.contact) row["Contact"] = booking?.userInfo?.contactNumber || "N/A";
      if (visibleColumns.city) row["City"] = booking?.userInfo?.city || "N/A";
      if (visibleColumns.paymentStatus) row["Payment Status"] = booking?.paymentStatus || "Pending";
      if (visibleColumns.amountPaid) row["Amount Paid"] = booking?.amountPaid || "0";
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, "Booking_History.xlsx");
  };
      


  return (
    <div className="md:mx-10 my-6 bg-white shadow-lg rounded-2xl p-6 flex-1">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-4">Bookings</h2>
       
        <input
          type="text"
          placeholder="Search by event name, username, or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mx-2 px-3 w-2/4 border rounded-md mb-2"
        />
        {/* Filter Button */}
        <div className="relative hidden md:block">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex px-5 py-2 gap-3 bg-blue-500  text-white rounded-md"
            >
              Filter Column <TbAdjustmentsHorizontal size={20} className="text-center m-auto "/>
            </button>

            {/* Filter Dropdown */}
            {showFilter && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 w-52">
                <h3 className="font-bold mb-2">Select Columns:</h3>
                {Object.keys(visibleColumns).map((column) => (
                  <label key={column} className=" flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column]}
                      onChange={() =>  toggleColumn(column)}
                      className="mr-2"
                    />
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              {visibleColumns.serviceName && <th className="p-3 text-left">Service Name</th>}
              {visibleColumns.date && <th className="p-3 text-left w-1/6">Date</th>}
              {visibleColumns.userName && <th className="p-3 text-left w-1/8">User Name</th>}
              {visibleColumns.email && <th className="p-3 text-left">Email</th>}
              {visibleColumns.contact && <th className="p-3 text-left">Contact</th>}
              {visibleColumns.city && <th className="p-3 text-left">City</th>}
              {visibleColumns.paymentStatus && <th className="p-3 text-left">Payment Status</th>}
            </tr>
          </thead>
          <tbody>
            
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking, index) => (
                <tr
                  key={index}
                  className={`border-b transition-all duration-300 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                    {visibleColumns.serviceName && (
                  <td className="p-3">
                    {booking.services && booking.services.length > 0 ? (
                        booking.services.map((service, i) => (
                          <p key={i} className="flex pb-2">
                            <IoMdArrowDropright className="text-gray-500 text-center" size={25} />
                            {service.name}
                          </p>
                        ))
                      ) : (
                        "No Service Name"
                      )}
                      {booking.addOns && booking.addOns.length > 0 ? (
                          booking.addOns.map((addOn, i) => (
                            <p key={i} className="flex px-4 font-semibold text-[15px] text-gray-800 ">
                              <BsDot className="text-gray-500 text-center pt-0" size={25} />
                              {`${addOn.name}`}
                            </p>
                          ))
                        ) : (
                          <></>
                        )}
                  {/*{booking?.services?.[0]?.name || "No Service Name"}*/}
                  </td>
                    )}
                      {visibleColumns.date && (
                  <td className="p-3">{formatDate(booking?.selectedDate)}</td>
                      )}
                        {visibleColumns.userName && (
                  <td className="p-3">{booking?.userInfo?.fullName || "N/A"}</td>
                        )}
                    {visibleColumns.email && (
                  <td className="p-3">{booking?.userInfo?.email || "N/A"}</td>
                    )}
                      {visibleColumns.contact && (
                 <td className="p-3">
                    {booking?.userInfo?.contactNumber || "N/A"}
                  </td>
                      )}
                        {visibleColumns.city && (
                  <td className="p-3">{booking?.userInfo?.city || "N/A"}</td>
                        )}
                          {visibleColumns.paymentStatus && (
                  <td
                    className={`p-3 font-semibold ${
                      booking?.paymentStatus === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {booking?.paymentStatus || "Pending"}
                  </td>
                          )}
                </tr>
              ))
            ) : (
              
                <div className="flex  items-center justify-center ml-180 py-10">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xl font-semibold text-gray-400"></span>
                </div>
              
            )}
          </tbody>
        </table>
      </div>
     <div className="fixed bottom-4 right-4">
     <button
            onClick={downloadExcel}
           className="bg-blue-500 text-white px-5 py-3 rounded-full shadow-md hover:bg-green-600 transition-all"
          >
            <IoMdCloudDownload size={40}/> 
          </button>
     </div>
    </div>
  );
};

export default BookingHistory;
