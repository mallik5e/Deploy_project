import React, { useState, useContext, useEffect,useRef } from 'react';
import { BookingContext } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddOn from './AddOn';
import { CircleCheckBig } from 'lucide-react';
import { Plus, Minus } from 'lucide-react';
import { TiMinus } from "react-icons/ti";
import { HiPlus } from "react-icons/hi";
import { Helmet } from 'react-helmet';
//import { LiaChevronCircleDownSolid } from "react-icons/lia";
//import { IoChevronDownCircleSharp } from "react-icons/io5";
import { IoChevronDownCircle } from "react-icons/io5";
import { ShoppingCart, ChevronRight } from 'lucide-react';
//import { TbSquareRoundedChevronsDownFilled } from "react-icons/tb";

const QuantitySelector = ({ quantity, onQuantityChange }) => {
  const [isAdding, setIsAdding] = useState(quantity > 0);

  const handleAddClick = () => {
    setIsAdding(true);
    onQuantityChange(1);
  };

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    const newQuantity = quantity - 1;
    if (newQuantity <= 0) {
      setIsAdding(false);
      onQuantityChange(0);
    } else {
      onQuantityChange(newQuantity);
    }
  };

  return (
    <div className="flex items-center border rounded gap-2">
      {!isAdding ? (
        <button onClick={handleAddClick} className="px-10 py-2 font-semibold text-gray-800 hover:bg-blue-500 hover:text-white">ADD</button>
      ) : (
        <div className="flex items-center gap-2  py-2">
          <button onClick={handleDecrement} className="px-3 text-center text-2xl text-red-800">
            <TiMinus/>
          </button>
          <span className='font-semibold'>{quantity}</span>
          <button onClick={handleIncrement} className="px-3 text-center text-xl font-semibold text-green-700">
            <HiPlus/>
          </button>
        </div>
      )}
    </div>
  );
};

const Services = () => {
  const { bookingData, updateBookingData } = useContext(BookingContext);
  const { services, selectedDate } = bookingData;
  const [openCategory, setOpenCategory] = useState({});
  const [servicesData, setServicesData] = useState([]);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

 const [atBottom, setAtBottom] = useState(false);
 const [showScrollIcon, setShowScrollIcon] = useState(false);



  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await axios.get(backendUrl+'/api/user/get-event');
        const updatedServices = response.data.map(category => ({
          ...category,
          options: category.options.map(option => {
            const slotsForDate = option.slotsByDate?.[bookingData.selectedDate];
            return {
              ...option,
              slotsLeft: slotsForDate ?? option.slotsLeft
            };
          })
        }));

        setServicesData(updatedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
      setLoading(false);
    };

    if (selectedDate) {
      fetchServices();
    }
  }, [selectedDate]);

  const toggleService = (service) => {
    const updatedServices = services.some((s) => s._id === service._id)
      ? services.filter((s) => s._id !== service._id)
      : [...services, { ...service, quantity: 1 }];

    updateBookingData({ services: updatedServices });
  };

  const updateServiceQuantity = (serviceId, quantity) => {
    let updatedServices;
    const existingService = services.find(s => s._id === serviceId);

    if (existingService) {
      if (quantity <= 0) {
        updatedServices = services.filter(s => s._id !== serviceId);
      } else {
        updatedServices = services.map(service =>
          service._id === serviceId ? { ...service, quantity } : service
        );
      }
    } else if (quantity > 0) {
      const newService = servicesData.flatMap(c => c.options).find(s => s._id === serviceId);
      updatedServices = [...services, { ...newService, quantity }];
    }

    updateBookingData({ services: updatedServices });
  };

  const toggleCategory = (category) => {
    setOpenCategory((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  //reload page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      sessionStorage.setItem("shouldRedirectHome", "true");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //scrolling
  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 5;
      const isAtTop = window.scrollY <= 5;
      const scrollable = document.body.scrollHeight > window.innerHeight;

      setShowScrollIcon(scrollable);
      setAtBottom(isAtBottom && !isAtTop);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

   const handleScrollClick = () => {
    if (atBottom) {
      // Instantly jump to top
      window.scrollTo({
        top: 0,
        behavior: "smooth", // Jump instantly
      });
    } else {
      // Scroll down step-by-step
      window.scrollBy({
        top: 600,
        behavior: "smooth", // Smooth scroll 100px
      });
    }
  };

  const formatDate = (selectedDate) => {
    const date = new Date(selectedDate);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${day}'${month} 05:00 AM - 06:00 PM |`;
  };

  const handleProceed = () => {
    navigate('/userdetails');
  };

  //console.log("services: ",services);
  //console.log("services: ",services.length);
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
      
              {/* Open Graph for social sharing */}
              <meta property="og:title" content="Book Photoshoot Online" />
              <meta property="og:description" content="Find the best photoshoot packages for every occasion." />
              <meta property="og:type" content="website" />
       </Helmet>
       {/* header  <h2 className="text-6xl md:text-3xl font-bold text-center mb-12 md:mb-8">Available Services</h2> bg-gray-100*/}
      <div>
      <h1 className='text-3xl text-gray-800 font-bold mx-4 lg:mx-10 mt-5'>Elements Photo Shoots</h1>
     <div className='md:flex'>
       <h4 className='text-xl md:text-lg ml-4 lg:ml-10'>{selectedDate ? formatDate(selectedDate) : ''}</h4>
      <h4 className='text-xl md:text-lg mx-4 lg:mx-1'> Elements Bangalore</h4>
     </div>
      <hr className="border-t-4 border-gray-300 mx-4 lg:mx-10 my-2 w-[90%]" />
      </div>
    <div className='flex'>
      <div className="min-h-screen md:min-w-full lg:min-w-250 p-2 lg:p-8">
       

        {loading ? (
         
          <div className="fixed inset-0 flex justify-center items-center z-50 bg-white/50">
           <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
         </div>

        ) : servicesData.length > 0 ? (
          servicesData.map((category) => (
            <div key={category.category} className="bg-white rounded-2xl shadow-sm md:shadow-lg p-5 mb-5">
              <h3 onClick={() => toggleCategory(category.category)} className="text-lg gap-10 flex justify-between font-semibold text-blue-600  mb-4">
                {category.category} {openCategory[category.category] ? <Minus className='bg-blue-100 rounded-full p-1 shrink-0' /> : <Plus className='bg-blue-100 rounded-full p-1 shrink-0'/>}
              </h3>
              {openCategory[category.category] &&
                category.options.map((service) => (
                  <div key={service._id} className="flex justify-between items-center bg-gray-50 rounded-lg px-2 py-4 mb-4 md:p-4 md:mb-2">
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold">{service.name}</span>
                     <div className='flex gap-2 items-center'>
                        {
                          service.discount ? (
                              <>
                                 <span className="text-gray-500 line-through text-sm font-medium">₹{service.price}</span>
                                <span className="text-green-600 text-lg font-medium">₹{service.price - service.discount} </span>
                                <span className="text-red-600 bg-red-100 text-xs font-medium px-2 py-1 rounded-full">₹{service.discount} OFF </span>
                              </>
                          ) : (
                            <span className="text-green-600 text-lg font-medium">₹{service.price}</span>
                          )
                        }  
                     </div>
                    </div>
                    {
                      service.slotsLeft > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                        {service.selectionType === 'checkbox' && (
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-500 rounded-lg focus:ring-blue-400"
                            checked={services.some((s) => s._id === service._id)}
                            onChange={() => toggleService(service)}
                          />
                        )}
                        {service.selectionType === 'quantitySelector' && (
                          <QuantitySelector
                            quantity={services.find((s) => s._id === service._id)?.quantity || 0}
                            onQuantityChange={(quantity) => updateServiceQuantity(service._id, quantity)}
                          />
                        )}
                        <span className={`${service.slotsLeft < 10 ? 'text-red-500 border-red-500' : 'text-green-500 border-green-500'} text-[10px] text-center border px-2 py-1 rounded-2xl font-semibold`}>
                          {service.slotsLeft} Left
                        </span>
                      </div>
                      ) :(
                         <div>
                          <span className="text-sm font-semibold text-red-500">
                             No Slots Left
                          </span>
                         </div>
                      )
                    }
                  </div>
                ))}
            </div>
          ))
        ) : (
          <p className="text-center text-red-500">No services available for the selected date, select your date properly.</p>
        )}
      </div>
     
      <div className='hidden xl:block space-y-0'>
        <div className='min-h-100 min-w-100 bg-white ml-8 mr-12 mt-1 shadow-md'>
          <h4 className="text-xl font-bold px-5 py-3 mt-8 bg-gray-500 text-white">SUMMARY:</h4>
          <ul className="mt-2 p-6">
            {services && services.length > 0 ? (
              services.map((service) => (
                <li key={service._id} className="flex items-center text-lg text-gray-600 py-1">
                  <span className='font-semibold'>{service.name} (x{service.quantity})</span>
               {/* <TbRosetteDiscountCheckFilled className="text-green-700 text-xl ml-2" />    */}
               <CircleCheckBig className="text-green-700 text-2xl ml-2 shrink-0"/>
                </li>
              ))
            ) : (
              <li className='text-center text-base text-gray-600'>No services selected ...</li>
            )}
          </ul>
          <div className='hidden xl:block mt-20'>
          <h4 className="text-xl font-bold py-3 px-5 bg-gray-500 text-white">ADD-ONS:</h4>
            <AddOn />
          </div>
        </div>
        <button
            onClick={handleProceed}
            disabled={services.length === 0}
            className={`px-50 py-4 ml-6 mt-4 mb-5 rounded-sm 
            ${services.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
            Proceed
        </button>
      </div>
     
    </div>
    <div className="fixed bottom-0 left-0 w-full shadow-md z-50 xl:hidden">
     <button
    onClick={handleProceed}
    disabled={services.length === 0}
    className={`w-full flex items-center justify-between p-3 md:py-5 text-lg font-medium
      ${services.length === 0 
        ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
        : "bg-blue-500 hover:bg-blue-600 text-white"}`}>
    <span className="flex items-center text-xl md:text-2xl gap-2">
      <ShoppingCart size={28}/>
      (x{services.length})
    </span>
     <span className='flex gap-1 font-semibold'>Proceed <ChevronRight size={28}/></span>
  </button>
    </div>
    


 {showScrollIcon && (
        <button
          onClick={handleScrollClick}
          className="hidden xl:block fixed bottom-4 right-4 text-gray-600 text-4xl z-50 hover:text-gray-800 transition"
        >
          <IoChevronDownCircle size={55}
            className={`transform transition-transform duration-300 ${
              atBottom ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      )}


 </div>
  );
};

export default Services;
