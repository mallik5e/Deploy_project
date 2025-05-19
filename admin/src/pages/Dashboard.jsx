import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ContentArea from "../components/ContentArea";
import HomePage from '../components/HomePage'
import { CiSearch } from "react-icons/ci";
import { useEvent } from "../context/EventContext"; 
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import dayjs from 'dayjs';
import axios from 'axios'


const Dashboard = () => {
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [chartData, setChartData] = useState([]);
   const [currentMonthYear, setCurrentMonthYear] = useState('');

  const { setBookedServiceEvents } = useEvent();

  useEffect(() => {
    fetchBookingData();
  }, []);

  {/*Fetch booking data of the current month for line graph */}
  const fetchBookingData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/view');
      const bookings = res.data;

      const now = dayjs();
      const currentMonth = now.month();
      const currentYear = now.year();

      setCurrentMonthYear(now.format('MMM')); // 'Apr'

      const dailyCounts = {};

      bookings.forEach(booking => {
        const bookingDate = dayjs(booking.selectedDate);
        if ( booking.paymentStatus === "success" && bookingDate.month() === currentMonth && bookingDate.year() === currentYear) {
          const day = bookingDate.date();
          dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        }
      });

      const daysInMonth = now.daysInMonth();

      const chartDataFormatted = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return {
          date: `${day}`, // used for graph points
          fullDate: `${day}'${now.format('MMM')}`, // used in tooltip
          bookings: dailyCounts[day] || 0
        };
      });

      setChartData(chartDataFormatted);
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
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

  useEffect(() => {
    fetchBookingsData(timeFrame);
  }, [timeFrame]);

  // Helper function to get last 3 months
  const getLastThreeMonths = (currentMonth, currentYear) => {
    const months = [];
    for (let i = 2; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      months.push({ month, year });
    }
    return months;
  };

  {/*Fetch specific service bookings on content area table */}
  const handleServiceClick = async (serviceName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/view?service=${serviceName}`);
      const allEvents = await response.json();
  
      if (!Array.isArray(allEvents)) {
        console.error("Unexpected response format:", allEvents);
        setBookedServiceEvents([]);
        setTableData([]);
        return;
      }
  
      // Get current date details
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Months are 0-based
      const currentYear = currentDate.getFullYear();
  
      // Define quarterly and yearly start dates
      const pastQuarterStart = new Date();
      pastQuarterStart.setMonth(currentDate.getMonth() - 2);
      const pastQuarterMonth = pastQuarterStart.getMonth() + 1;
      const pastQuarterYear = pastQuarterStart.getFullYear();
  
      const pastYearStart = new Date();
      pastYearStart.setFullYear(currentDate.getFullYear() - 1);
      const pastYearMonth = pastYearStart.getMonth() + 1;
      const pastYearYear = pastYearStart.getFullYear();
  
      
  
      const lastThreeMonths = getLastThreeMonths(currentMonth, currentYear);
  
      // Filter only the events matching the selected service and time frame
      const filteredEvents = allEvents.filter(event => {
        if (!event.selectedDate) return false;
  
        const bookingDate = new Date(event.selectedDate);
        const bookingMonth = bookingDate.getMonth() + 1;
        const bookingYear = bookingDate.getFullYear();
  
        const isQuarterly = lastThreeMonths.some(({ month, year }) =>
          bookingMonth === month && bookingYear === year
        );
  
        if (timeFrame === "monthly") {
          return bookingMonth === currentMonth && bookingYear === currentYear;
        } else if (timeFrame === "quarterly") {
          return isQuarterly;
        } else if (timeFrame === "yearly") {
          return (
            (bookingYear === pastYearYear && bookingMonth >= pastYearMonth) ||
            (bookingYear === currentYear && bookingMonth <= currentMonth)
          );
        }
        return false;
      }).filter(event =>
        event.services.some(service => service.name === serviceName)
      );
  
      console.log(`✅ Filtered Events for ${serviceName} (${timeFrame}):`, filteredEvents);
  
      setBookedServiceEvents(filteredEvents);
      setTableData(filteredEvents);
    } catch (error) {
      console.error("Error fetching booked events:", error);
      setBookedServiceEvents([]);
      setTableData([]);
    }
  };

  const filterEventsByTimeFrame = (events, period) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const lastThreeMonths = getLastThreeMonths(currentMonth, currentYear);
    const pastYearStart = new Date();
    pastYearStart.setFullYear(currentYear - 1);

    return events.filter(event => {
      if (!event.selectedDate) return false;
      const eventDate = new Date(event.selectedDate);
      const eventMonth = eventDate.getMonth() + 1;
      const eventYear = eventDate.getFullYear();

      if (period === "monthly") {
        return eventMonth === currentMonth && eventYear === currentYear;
      }
      if (period === "quarterly") {
        return lastThreeMonths.some(({ month, year }) => 
          eventMonth === month && eventYear === year
        );
      }
      if (period === "yearly") {
        return (
          (eventYear === pastYearStart.getFullYear() && eventMonth >= pastYearStart.getMonth() + 1) ||
          (eventYear === currentYear && eventMonth <= currentMonth)
        );
      }
      return false;
    });
  };
  
  {/*Fetch booking for bar graph */}
  const fetchBookingsData = async (period) => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/view");
      const result = await response.json();
  
      //console.log("🔹 Raw API Data:", result);
  
      if (!Array.isArray(result) || result.length === 0) {
        console.warn("⚠️ No bookings found in API response.");
        setData([]);
        setTableData([]);
        return;
      }
  
      const filteredBookings = filterEventsByTimeFrame(result, period);
  
      console.log(`✅ Filtered Bookings for ${period}:`, filteredBookings);
  
      if (filteredBookings.length === 0) {
        console.warn(`⚠️ No bookings found for ${period}.`);
        setData([]);
        setTableData([]);
        return;
      }
  
      // Process data for chart
      const serviceBookings = {};
       {/* filteredBookings.forEach((booking) => {
        booking.services.forEach((service) => {
          const serviceName = service.name;
          if (!serviceBookings[serviceName]) {
            serviceBookings[serviceName] = 0;
          }
          serviceBookings[serviceName] += service.quantity;
        });
      }); */}
    
       filteredBookings.forEach((booking) => {
        if (booking.paymentStatus === "success") {
          booking.services.forEach((service) => {
            const serviceName = service.name;
            if (!serviceBookings[serviceName]) {
              serviceBookings[serviceName] = 0;
            }
            serviceBookings[serviceName] += service.quantity;
          });
        }
      }); 
      
  
      const processedData = Object.keys(serviceBookings).map((service) => ({
        service,
        bookings: serviceBookings[service],
      }));
  
      console.log("📊 Processed Data for Chart:", processedData);
  
      setData(processedData);
      setTableData([]); // Initially clear table until a service is clicked
    } catch (error) {
      console.error("❌ Error fetching booking data:", error);
    }
  };
  


  return (
    <div className="min-h-screen flex flex-col">
      <div className="mt-2">
        <div className="flex flex-1 p-4 items-center">
          <HomePage/>
        </div>
      </div>

      <div className="flex-1 lg:flex">
        <Sidebar />
        <ContentArea />
      </div>

    <div className="flex-1 md:flex">
      {/* Line graph  */}
       <div className="bg-white mx-4 my-7 shadow-lg rounded-lg  md:w-100 md:h-112 flex flex-col ">
  <h1 className="text-xl font-bold text-gray-800 p-6 mb-8">📈 Booking Trends: </h1>

  <div className="max-w-95 h-96">
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={chartData} margin={{ top: 10, right: 3, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} horizontal={true} stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          tick={false} 
          label={{ 
            value: `*Bookings by Date (${currentMonthYear})`, 
            position: "insideCenter", 
            style: { fill: "#374151", fontSize: 16, fontWeight: "bold" } 
          }} 
        />
        <YAxis 
          tick={{ fill: "#4B5563", fontSize: 12 }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="bookings"
          stroke="#10B981"
          strokeWidth={3.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>

    {/*<h3 className="mt-2 text-red-500 "><span className="text-red-600 text-xl">*</span>Maximum Bookings on: 23'April </h3>
           <h3 className="text-red-500"><span className="text-red-600 text-xl">*</span>Minimum Bookings on: 28'April </h3> */}

      {/* Bar Graph Section */}
      <div className="md:p-6 mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-3 lg:p-6 xl:min-w-5xl mx-auto">
          <div className="flex justify-between">
            <h2 className="md:text-xl font-bold text-gray-800 mb-3">
             Event Bookings on Each Services ({timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}):
            </h2>

            {/* Timeframe Selector */}
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded-md text-gray-700 focus:ring focus:ring-blue-300"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Bar Graph */}
          <div className="w-full h-80 mt-6">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                
                  
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length) {
                        return (
                          <div className="bg-white p-2 shadow-md rounded-md border border-gray-200">
                            <p className="text-sm font-semibold">{payload[0].payload.service}</p>
                            <p className="text-xs text-blue-600">Bookings: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  {/* Clickable Bar */}
                  <Bar
                    dataKey="bookings"
                    fill="#2563EB"
                    barSize={40}
                    onClick={(data) => handleServiceClick(data.service)}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">No bookings found.</p>
            )}

            {/* Beautified Text Below X-Axis */}
            <div className="flex justify-center mt-4">
  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-center text-sm font-medium">
    {timeFrame === "monthly" && (
      <span className="font-semibold">* Booking Data of this month</span>
    )}
    {timeFrame === "quarterly" && (() => {
      const currentDate = new Date();
      const startMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 2));
      return (
        <span className="font-semibold">
          * Booking Data from {startMonth.toLocaleString("default", { month: "short" })}'{startMonth.getFullYear()} - {new Date().toLocaleString("default", { month: "short" })}'{new Date().getFullYear()}
        </span>
      );
    })()}
    {timeFrame === "yearly" && (() => {
      const currentDate = new Date();
      const lastYear = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
      return (
        <span className="font-semibold">
          * Booking Data from {lastYear.toLocaleString("default", { month: "short" })}'{lastYear.getFullYear()} to {new Date().toLocaleString("default", { month: "short" })}'{new Date().getFullYear()}
        </span>
      );
    })()}
  </div>
</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;