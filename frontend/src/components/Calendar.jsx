import React, { useState, useEffect, useContext } from 'react';
import dayjs from 'dayjs';
import { BookingContext } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import PhotoShoots_Bumper_Package from '../assets/PhotoShoots_Bumper_Package.webp'
import PhotoShoots_Super_Package from '../assets/PhotoShoots_Super_Package.webp'
import PhotoShoots_Popular_Package from '../assets/PhotoShoots_Popular_Package.webp'
import { Helmet } from 'react-helmet';
import { CalendarDays, ChevronRight } from 'lucide-react';

const MonthlyCalendar = () => {

  const useBooking = () => useContext(BookingContext);
    
  const { bookingData, updateBookingData } = useBooking();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const images = [
    { src: PhotoShoots_Super_Package, alt: 'PhotoShoots_Super_Package Offer' },
    { src: PhotoShoots_Popular_Package, alt: 'PhotoShoots_Popular_Package Offer' },
    { src: PhotoShoots_Bumper_Package, alt: 'PhotoShoots_Bumper_Package Offer' }
  ];
  
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startDay });

  const minMonth = dayjs();
  const maxMonth = minMonth.add(3, 'month');

  useEffect(() => {
    if (!sessionStorage.getItem('visit-tracked')) {
      fetch(backendUrl+'/api/user/visit', {
        method: 'POST',
      }).catch((err) => console.error('Visit tracking failed:', err));
  
      sessionStorage.setItem('visit-tracked', 'true');
    }
  }, []);


   const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(nextSlide, 2000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, isHovered]);

  const prevMonth = () => {
    if (!currentDate.isSame(minMonth, 'month')) {
      setCurrentDate(currentDate.subtract(1, 'month'));
    }
  };

  const nextMonth = () => {
    if (!currentDate.isSame(maxMonth, 'month')) {
      setCurrentDate(currentDate.add(1, 'month'));
    }
  };

  const selectDate = (day) => {
    const date = currentDate.date(day).format('YYYY-MM-DD');
    updateBookingData({ selectedDate: date });
  };

  const handleProceed = () => {
    if (bookingData.selectedDate) {
      navigate('/services');
    }
  };

  return (
    <div>
      <Helmet>
        {/* Meta Tags */}
        <title>Pre Wedding | Post Wedding | Maternity | Baby Photoshoot Places in Bangalore</title>
        <meta
          name="description"
          content="Book your next photoshoot online. Find top photoshoot packages for pre-wedding, birthday, and maternity shoots in your city. Packages from ₹500."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="keywords" content="photoshoot, pre-wedding, maternity, book photoshoot online, family photoshoot, photoshoot in bangalore,post wedding photoshoot in bangalore, pre wedding photo shoot places in bangalore, maternity photoshoot in bangalore, photoshoot places in kanakapura road, outdoor photoshoot places in bangalore" />
        <meta name="author" content="Book Event" />
        <link rel="canonical" href="http://localhost:5173/" />

       <link rel="preload" as="image" href={images[0].src} fetchPriority="high"/>

        {/* Open Graph for social sharing */}
        <meta property="og:title" content="Book Photoshoot Online" />
        <meta property="og:description" content="Find the best photoshoot packages for every occasion." />
        <meta property="og:type" content="website" />
 </Helmet>

      {/* header */}
      <div>
      <h1 className='text-3xl text-gray-800 font-bold mx-4 lg:mx-20 mt-5'>Elements Photo Shoots</h1>
      <h4 className='text-xl md:text-lg mx-4 lg:mx-20'>Elements Bangalore</h4>
      <hr className="border-t-4 border-gray-300 mx-4 lg:mx-20 my-3 w-[90%]" />
      </div>

      {/* includes both calendar and image */}
      <div className="xl:flex lg:space-x-18  gap-2 " >
  
        {/* calendar */}
      <div className='space-y-10 sm:space-y-3'>
      <h2 className="text-xl ml-4 lg:ml-20 text-violet-400 mt-4 font-bold">SELECT DATE FOR EVENT :</h2>
        <div className="w-full max-w-full sm:max-w-[690px] xl:w-[600px] m-auto mt-6 py-3 sm:px-4 md:p-4 lg:ml-28 bg-white/90 rounded-2xl sm:shadow-sm">
            {/* <h2 className="text-xl md:text-base mb-4 font-bold">SELECT DATE FOR EVENT :</h2>*/}
      <div className="flex justify-center gap-8 items-center mb-4">
        <button onClick={prevMonth} className={`p-2  rounded-xl ${currentDate.isSame(minMonth, 'month') ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={currentDate.isSame(minMonth, 'month')}>❮</button>
        <h2 className="text-xl font-bold">{currentDate.format('MMMM YYYY')}</h2>
        <button onClick={nextMonth} className={`p-2  rounded-xl ${currentDate.isSame(maxMonth, 'month') ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={currentDate.isSame(maxMonth, 'month')}>❯</button>
      </div>
      <div className="grid grid-cols-7 gap-3 space-y-1 lg:space-y-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-lg py-1 font-semibold">
            {day}
          </div>
        ))}
        {emptyDays.map((_, index) => (
          <div key={index}></div>
        ))}
        {days.map((day) => {
            const date = currentDate.date(day);
            const isPastDate = date.isBefore(dayjs(), 'day');
            return (
              <div
                key={day}
                onClick={() => !isPastDate && selectDate(day)}
                className={`text-center p-2 text-lg lg:text-base rounded-xl hover:bg-blue-100 cursor-pointer ${isPastDate ? 'opacity-50 cursor-not-allowed' : (bookingData.selectedDate === date.format('YYYY-MM-DD') ? 'bg-blue-200' : 'hover:bg-blue-100')}`}
              >
                {day}
              </div>
            );
          })}
      </div>
    </div>
    

    {/*button for selected date */}
    <div className="hidden xl:flex justify-between mt-2 ml-28">
  {
    bookingData.selectedDate && (
      <button 
        onClick={handleProceed}
        className="bg-blue-500 text-white px-6 py-4 rounded-xl hover:bg-blue-600 disabled:bg-gray-400 flex justify-between items-center w-full" 
        disabled={!bookingData.selectedDate}
      >
        <span className='flex gap-1'><CalendarDays size={23} className='items-center gap-1' />{new Date(bookingData.selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(/(\d{2}) (\w{3})/, '$1 $2\'')}{new Date(bookingData.selectedDate).getFullYear().toString().slice(-2)}</span>
        <span className='flex gap-1 font-semibold'>Proceed <ChevronRight  size={25} className=''/></span>
      </button>
    )
   }

   </div>

   </div>

   {/*images */}
   <div className="hidden md:flex w-[550px] mx-auto lg:mx-30 xl:m-5 sm:min-w-175 md:max-h-135">
    <div className="relative flex items-center justify-center mt-8 lg:mt-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <img
         className="w-[550px] h-[460px] md:min-w-170 md:min-h-125"
         src={images[currentIndex].src} 
         alt={images[currentIndex].alt}
         loading="eager" fetchpriority="high"
      />
      <div className="absolute bottom-2 flex">
        {images.map((_, index) => (
          <span
            key={index}
            className={`h-2 w-2 mx-1 rounded-full cursor-pointer ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
     </div>
    </div>
    {bookingData.selectedDate && (
  <div className="fixed bottom-0 left-0 w-full shadow-md z-50 xl:hidden">
    <button
      onClick={handleProceed}
      className="bg-blue-500 text-white text-xl lg:text-2xl p-4 lg:py-7 w-full flex justify-between items-center"
    >
      <span className="flex gap-2">
        <CalendarDays size={30} className='items-center text-center'/>
        {new Date(bookingData.selectedDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short'
        }).replace(/(\d{2}) (\w{3})/, '$1 $2\'')}
        {new Date(bookingData.selectedDate).getFullYear().toString().slice(-2)}
      </span>
      <span className="flex gap-1 font-semibold">Proceed <ChevronRight size={30} className='items-center text-center'/></span>
    </button>
  </div>
)}
  </div>
</div>
  );
};

export default MonthlyCalendar;
