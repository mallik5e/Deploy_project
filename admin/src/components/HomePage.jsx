import React, { useState,useEffect } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [bookings, setBookings] = useState([]);
  const [currentMonthBookingsCount, setCurrentMonthBookingsCount] = useState(0);
  const [visitsCount,setVisitsCount] = useState(0);
  const [totalEarningsThisMonth, setTotalEarningsThisMonth] = useState(0);
  const [prevVisits,setPrevVisits] = useState(0);
  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/view');
      const allBookings = res.data;

      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();

      const formattedMonthYear = now.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      setCurrentMonthYear(formattedMonthYear);

      //logic for total Booking to this month
      const filteredBookings = allBookings.filter((booking) => {
        const bookingDate = new Date(booking.selectedDate); // use selectedDate instead of createdAt
        return (
          booking.paymentStatus === "success" &&
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      });

      setBookings(allBookings);
      setCurrentMonthBookingsCount(filteredBookings.length);
      console.log("Total booking of current month: ",currentMonthBookingsCount);

      //logic for total earning from this month bookings.
      const thisMonthBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.selectedDate);
        return (
          booking.paymentStatus === "success" &&
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      });

      const total = thisMonthBookings.reduce((sum, booking) => {
        return sum + (booking.priceSummary?.totalAmount || 0);
      }, 0);

      setTotalEarningsThisMonth(total);
      console.log("total earning: ",totalEarningsThisMonth)

    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

  useEffect(()=>{
    fetchVisitCount();
   
  })

  const fetchVisitCount = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/count');
      const count = res.data;
      console.log("count response: ", count);
      setVisitsCount(count.stat.visits); // or count.visits if you change backend response
      setPrevVisits(count.stat.prevVisits)

    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

{/*   // Calculate percentage change
const calculatePercentage = () => {
  const percentageChange = ((visitsCount - prevVisits) / (prevVisits || 1)) * 100;
const roundedChange = Math.round(percentageChange); // or use toFixed(1) for 1 decimal

// Determine trend
const trend = visitsCount > prevVisits
  ? 'increase'
  : visitsCount < prevVisits
  ? 'decrease'
  : 'no change';

console.log(`User visits ${trend} by ${Math.abs(roundedChange)}%`);
}*/}
  

  return (
    <main className="w-full pb-5 pl-2 pr-5 font-sans max-h-[calc(100vh-56px)] overflow-y-auto ">

      {/* Info Boxes */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-9">
        {[
          { icon: '🎟️', value: `${currentMonthBookingsCount}`, label: 'Total Bookings', bgColor: 'bg-blue-100 text-blue-500' },
          { icon: '👥', value: `${visitsCount}`, label: 'Total Visitors',  bgColor: 'bg-green-100 text-green-500' },
          { icon: '💰', value: `₹${totalEarningsThisMonth.toLocaleString('en-IN')}`, label: 'Total Earnings', bgColor: 'bg-yellow-100 text-yellow-500' }
        ].map((info, index) => (
          <li key={index} className="bg-white p-6 rounded-xl flex items-center justify-center gap-6 shadow">
            <div className={`w-20 h-18 rounded-lg flex items-center justify-center text-4xl  ${info.bgColor}`}>
              {info.icon}
            </div>
            <div>
              <h3 className="text-3xl font-semibold text-gray-800 mb-0.5"> {info.value < 10 ? `0${info.value}` : info.value} </h3>
              <p className="text-gray-600">{info.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default HomePage;
