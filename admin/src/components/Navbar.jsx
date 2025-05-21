import React, { useState, useRef, useEffect } from "react";
import { IoSettingsOutline, IoNotificationsOutline } from "react-icons/io5";
import Profile from "../assets/profile_pic.png";
import logo from "../assets/Company_Logo.png";
import { Link, useNavigate,NavLink  } from "react-router-dom";
import { toast } from "react-toastify";
import cross_icon from '../assets/cross_icon.png'
import { BiMenuAltRight } from "react-icons/bi";
import { MdHome } from "react-icons/md";
import { FaHistory } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { HiViewGridAdd } from "react-icons/hi";
import { BsDot } from 'react-icons/bs'; // A clean dot
import axios from 'axios'

const Navbar = () => {
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNavbarOpen, setNavbarOpen] = useState(false);
  const [showMenu,setShowMenu] = useState(false);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const [unpaidBookings, setUnpaidBookings] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem('token')

   const backendUrl = import.meta.env.VITE_BACKEND_URL;


useEffect(() => {
  const handleNotificationClick = async () => {
    try {
      const res = await axios.get(backendUrl+'/api/admin/view');
      const allBookings = res.data;

      const now = new Date();
      const today = new Date().setHours(0, 0, 0, 0); // midnight today
      
      const unpaid = allBookings.filter((booking) => {
        const createdAt = new Date(booking.createdAt);
        const createdAtDateOnly = new Date(booking.createdAt).setHours(0, 0, 0, 0);

        const minutesPassed = (now - createdAt) / (1000 * 60);

        return (
          booking.paymentStatus !== 'success' &&
          createdAtDateOnly === today &&
          minutesPassed >= 5
        );
      });

      setUnpaidBookings(unpaid);
      console.log("Unpaid today (5+ min):", unpaid);
    } catch (err) {
      console.error('Error fetching unpaid bookings:', err);
    }
  };

  handleNotificationClick();
}, []);


  // Toggle dropdowns
  const toggleSettingsDropdown = () => {
   if(token){
    setSettingsOpen(!isSettingsOpen);
    setProfileOpen(false); // Close profile dropdown if open
    setNavbarOpen(false);
   }else{
    toast.warn('Login to Access')
   }
  };

  const toggleProfileDropdown = () => {
    if(token){
     setProfileOpen(!isProfileOpen);
     setSettingsOpen(false); // Close settings dropdown if open
     setNavbarOpen(false);
    }else{
      toast.warn('Login to Access')
    }
  };

  const toggleNavbarDropdown = () => {
    if(token){
     setNavbarOpen(!isNavbarOpen);
     setProfileOpen(false);
     setSettingsOpen(false); // Close settings dropdown if open
    }else{
      toast.warn('Login to Access')
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
     }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
   localStorage.removeItem('token') 
   setProfileOpen(false)
   navigate('/')
  }

  return (
    <nav className="w-full bg-white flex justify-between items-center p-5 z-50 shadow-glow">
      {/* Logo and Title */}
      <div className="flex gap-5 items-center">
       <img src={logo} alt="Logo" className="w-30 h-15 glowing-image" />
{/* <div className="hidden md:block text-3xl font-bold bg-gradient-to-r from-[#6a82fb] to-[#fc5c7d] bg-clip-text text-transparent">
  Elements Admin
</div>*/}

    <div className="hidden sm:block text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
      Elements Admin
      </div>

      </div>

      {/* Navigation Links */}
     {
      token && (
    <ul className="hidden lg:flex space-x-8 text-gray-700">
       <li><Link to="/dashboard" className="hover:text-blue-500 font-bold glowing-text">Home</Link></li>
       <li><Link to="/events" className="hover:text-blue-500 font-bold glowing-text">Events</Link></li>
       <li><Link to="/add-ons" className="hover:text-blue-500 font-bold glowing-text">Add-Ons</Link></li>
       <li><Link to="/history" className="hover:text-blue-500 font-bold glowing-text">History</Link></li>
    </ul>
      )}
  
    

      {/* Icons and Profile */}
      <div className="flex space-x-4 md:space-x-8 mr-2 items-center relative">

     {/* <div className="flex bg-white items-center gap-1 border text-[12px] p-2 rounded-3xl">
      <FaLink size={16}/>
      <button className="font-semibold">Visit Event Page</button>
      </div> */}
      
        {/* Settings Dropdown */}
        <div className="relative" ref={settingsRef}>
          <button onClick={toggleSettingsDropdown} className="relative hover:text-blue-500 bg-white rounded-full p-2 glowing-icon">
            <IoSettingsOutline size={24} />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg w-48 overflow-hidden z-50">
              <ul className="text-gray-800">
              <Link to='/payment'><li onClick={() => setSettingsOpen(false)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Payment Integration</li></Link>
              <Link to='/transaction'><li onClick={() => setSettingsOpen(false)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Transactions</li></Link>
              <Link to='/select-invoice'><li onClick={() => setSettingsOpen(false)} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Invoice</li></Link>              
              </ul>
            </div>
          )}
        </div>
        

        {/* Notification Icon */}
       <button aria-label="Notifications"  onClick={() => setShowNotifications(true)} className="relative hidden sm:block hover:text-blue-500 bg-white rounded-full glowing-icon">
         <IoNotificationsOutline size={26}  />
         {unpaidBookings.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full text-white text-xs px-1">
               {unpaidBookings.length}
           </span>
         )}
       </button>

        {showNotifications && (
  <div ref={notificationsRef} className="absolute top-10 p-2 right-20 bg-white shadow-md rounded-lg w-80 max-h-80 overflow-y-auto z-50 scrollbar-hide">
    {unpaidBookings.length > 0 ? (
      unpaidBookings.map((booking, index) => (
        <div key={index} className="flex justify-between items-center px-4 py-2 border-b border-gray-300 hover:bg-gray-50">
          <div>
            <div className="text-sm font-medium">{booking.userInfo?.fullName || 'Unknown'}</div>
            <div className="flex font-semibold items-center text-[11px] text-gray-500">
             <span>{new Date(booking.selectedDate).toLocaleDateString('en-GB')}</span>
             <span className="flex items-center ml-2">
               <BsDot className="text-[14px] leading-none m-0 p-0" />
              {(() => {
              const minutes = Math.floor((new Date() - new Date(booking.createdAt)) / (1000 * 60));
              return minutes < 60
              ? `${minutes}min ago`
              : `${Math.floor(minutes / 60)}hr ago`;
              })()}
            </span>
           </div>
          </div>
          <div className="text-red-500 font-semibold text-sm">Pending</div>
        </div>
      ))
    ) : (
      <div className="p-4 text-sm font-semibold text-gray-500">No Notifications..</div>
    )}
  </div>
)}


        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button onClick={toggleProfileDropdown}>
            <img src={Profile} alt="Profile" className="w-10 h-10 bg-gray-300 rounded-full glowing-icon" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg w-40 z-50">
              <ul className="text-gray-800">
              <Link to='/profile'><li onClick={() => setProfileOpen(false)}  className="px-4 py-2 hover:bg-gray-100 cursor-pointer">My Profile</li></Link>
                {/*<li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Reports</li> */}
                <li onClick={logout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li>
              </ul>
            </div>
          )}
        </div>



{/* Mobile Menu Button 
<img onClick={()=>setShowMenu(true)} className='w-7 md:hidden' src={menu_icon} alt="" />*/}
<button onClick={toggleNavbarDropdown} className='w-7 lg:hidden'><BiMenuAltRight size={45}/></button>
                   {/* ------- mobile menu ---- */}
                  { isNavbarOpen && (
                      <div className={`fixed w-full h-full right-0 top-0 bottom-0 z-30 overflow-hidden bg-white transition-all  ease-in-out shadow-lg`}>
  <div className="flex items-center justify-between px-4 py-5 border-b shadow-sm">
    <img className="w-32 h-auto" src={logo} alt="Logo" />
    <button onClick={() => setNavbarOpen(false)} className="p-2">
      <img className="w-8 h-8" src={cross_icon} alt="Close Menu" />
    </button>
  </div>

  <ul className="flex flex-col items-center mt-10 gap-6 px-5">
  <NavLink 
    onClick={() => setNavbarOpen(false)} 
    to="/dashboard" 
    className="w-full text-center py-2.5 rounded-lg hover:bg-gray-100 transition-all font-semibold text-2xl flex items-center justify-center gap-4"
  >
    <MdHome className="text-xl" size={40}/>  
    <span>Home</span>
  </NavLink>
  <NavLink 
    onClick={() => setNavbarOpen(false)} 
    to="/events" 
    className="w-full text-center py-2.5 rounded-lg hover:bg-gray-100 transition-all font-semibold text-2xl flex items-center justify-center gap-4"
  >
    <MdEvent className="text-xl" size={36}/>
    <span>Events</span>
  </NavLink>
  <NavLink 
    onClick={() => setNavbarOpen(false)} 
    to="/add-ons" 
    className="w-full text-center py-2.5 rounded-lg hover:bg-gray-100 transition-all font-semibold text-2xl flex items-center justify-center gap-4"
  >
    <HiViewGridAdd className="ml-5 text-xl" size={36}/>
    <span>Add-Ons</span>
  </NavLink>
  <NavLink 
    onClick={() => setNavbarOpen(false)} 
    to="/history" 
    className="w-full text-center py-2.5 rounded-lg hover:bg-gray-100 transition-all font-semibold text-2xl flex items-center justify-center gap-4"
  >
    <FaHistory className="text-xl" size={30}/>
    <span>History</span>
  </NavLink>
</ul>

</div>
 )}


      </div>
    </nav>
  );
};

export default Navbar;
