import { useState,useContext,useEffect } from "react";
import { BookingContext } from '../context/BookingContext';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate,useSearchParams  } from 'react-router-dom';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import AddOn from "./AddOn";
import { Helmet } from 'react-helmet';

const UserDetails = () => {
  const { updateBookingData, bookingData } = useContext(BookingContext);
  const [isChecked, setIsChecked] = useState(false);
  const [showSaveButton,setShowSaveButton] = useState(true);
  const [showPaymentButton, setShowPaymentButton] = useState(false); // New state
  const [fadeIn, setFadeIn] = useState(false); 
  const [showCheckboxError, setShowCheckboxError] = useState(false);
  const [phone, setPhone] = useState("+91");
  //const [invoiceId, setInvoiceId] = useState("");

   const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [emailError, setEmailError] = useState("");
  const [confirmEmailError, setConfirmEmailError] = useState("");

  const [gateway, setGateway] = useState(null);

  const [isCollapsed, setIsCollapsed] = useState(false);


  const ItemPrice = bookingData.services.reduce((total, service) => total + (service.price*service.quantity), 0);
  const totalDiscount = bookingData.services.reduce((total, service) => total + (service.discount || 0), 0);

  const serviceTotal = bookingData.services.reduce((total, service) => {
    const discountedPrice = (service.price*service.quantity) - (service.discount || 0);
    return total + discountedPrice;
  }, 0);
  
  const addOnTotal = bookingData.addOns?.reduce((total, addOn) => {
    return total + addOn.price;
  }, 0) || 0;
  
  const totalAmount = serviceTotal + addOnTotal;
  

  useEffect(() => {
    updateBookingData({
      priceSummary: { ItemPrice: ItemPrice + addOnTotal, 
                      totalDiscount, 
                      totalAmount 
                    },
      });
  }, [ItemPrice, totalDiscount, totalAmount, updateBookingData]);

   // Generate invoiceId once on mount
  useEffect(() => {
    const newId = `${uuidv4().slice(0, 8).toUpperCase()}`;
    //setInvoiceId(newId);
    setFormData(prev => ({ ...prev, id: newId }));
  }, []);

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


  const [formData, setFormData] = useState({
    id:"",
    fullName: "",
    email: "",
    confirmEmail: "",
    contactNumber: "",
    city: "",
    referralSource: ""
  });

 // console.log("invoiceId: ",formData.id)

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    if (!isChecked) setShowCheckboxError(false); // ✅ Hide error when checkbox is selected
  };

  // Real-time email validation
  useEffect(() => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (formData.email && !emailRegex.test(formData.email)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }

    if (formData.confirmEmail && formData.email !== formData.confirmEmail) {
      setConfirmEmailError("Emails do not match");
    } else {
      setConfirmEmailError("");
    }
  }, [formData.email, formData.confirmEmail]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.city) {
      toast.error("Please fill all required fields.");
      return;
    }
  
    if (formData.email !== formData.confirmEmail) {
      toast.error("Emails do not match.");
      return;
    } 
  
    if (!phone || phone.length < 10) {
      toast.error("Enter a valid contact number.");
      return;
    }
  
    const updatedBookingData = {
      ...bookingData,
      userInfo: { ...formData, contactNumber: phone },
    };
  
    updateBookingData(updatedBookingData);
    
    try {
      const response = await axios.post(`${backendUrl}/api/user/booking`, updatedBookingData);
      sessionStorage.setItem("bookingId", response.data.bookingId);
      setShowSaveButton(false);
      toast.success("Now make payment to confirm your booking.");
      setShowPaymentButton(true);
    } catch (error) {
      toast.error("Failed to submit booking data");
      console.error(error);
    }
  };
  
  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email  || !formData.city) {
      toast.error("Please fill all required fields.");
      return;
    }
   if (formData.email !== formData.confirmEmail) {
      toast.error("Emails do not match.");
      return;
    } 
    if (!phone || phone.length < 10) {
      toast.error("Enter a valid contact number.");
      return;
    }

    const updatedBookingData = {
      ...bookingData,
      userInfo: { ...formData, contactNumber: phone },
    };
    updateBookingData(updatedBookingData);
     // Collapse the form on submit
    setIsCollapsed(true);
    try {
      const response = await axios.post(`${backendUrl}/api/user/booking`, updatedBookingData);
      sessionStorage.setItem("bookingId", response.data.bookingId);
      setShowSaveButton(false);
      toast.success("Now make payment to confirm your booking.");
      setShowPaymentButton(true);
    } catch (error) {
      toast.error("Failed to submit booking data");
      console.error(error);
    }
  };
  

  useEffect(() => {
    if (showPaymentButton) {
      setTimeout(() => setFadeIn(true), 200); // Delay fade-in effect slightly
    }
  }, [showPaymentButton]);

  useEffect(() => {
    // Fetch the active payment gateway from backend
    fetch(backendUrl+"/api/user/active-gateway")
      .then((res) => res.json())
      .then((data) => setGateway(data.gateway))
      .catch((error) => console.error("Error fetching gateway:", error));
  }, []);

  // Function to handle payment based on gateway
  const handlePayment = () => {
    console.log("handlePayment clicked")
    console.log("gatway",gateway)
    if (!gateway) return;
  
    if (gateway === "PayU") {
      handlePayuPayment();
    } else if (gateway === "PhonePe") {
      handlePhonepePayment();
    } else if (gateway === "Razorpay") {
      handleRazorpayPayment();
    } else if (gateway === "PayPal") {
      handlePaypalPayment();
    }
  };


  //payu
  const handlePayuPayment = async () => {
    if (!isChecked) {
      setShowCheckboxError(true); // Show error message if checkbox is not checked
      return;
    }
   
    try {
        const response = await axios.post(backendUrl+'/api/user/pay', {
            txnId: 'txn' + Date.now(),
            amount: totalAmount,
            productInfo: bookingData.services.map(service => service.name).join(', '),
            firstName: formData.fullName,
            email: formData.email,
            phone: formData.contactNumber,
        });
  
        const { url, payUData } = response.data;
  
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url; // Use 'url' from response
  
        Object.keys(payUData).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = payUData[key];
            form.appendChild(input);
        });
  
        document.body.appendChild(form);
        form.submit();
  
    } catch (error) {
        console.error('Payment failed:', error.response?.data || error.message);
    }
  };
 
  //phonepe payment
  const handlePhonepePayment = async () => {
    if (!isChecked) {
      setShowCheckboxError(true); // Show error message if checkbox is not checked
      return;
    }
    try {
      const orderId = "ORDER_" + new Date().getTime(); // Generate a unique order ID
      const response = await axios.post(backendUrl+"/api/user/initiate-payment", { totalAmount, orderId });

      if (response.data.success) {
          window.location.href = response.data.data.instrumentResponse.redirectInfo.url; // Redirect to PhonePe
      } else {
          alert("Payment initiation failed");
      }
  } catch (error) {
      console.error(error);
      alert("Error processing payment");
  }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  
  //Razorpay payment
  const handleRazorpayPayment = async () => {
    if (!isChecked) {
      setShowCheckboxError(true); // Show error message if checkbox is not checked
      return;
    }
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay. Please check your internet connection.");
      return;
    }
    try {
      // Create order on backend
      const { data } = await axios.post(backendUrl+"/api/user/create-order", {
        totalAmount,
        currency: "INR",
        receipt: `order_rcpt_${Date.now()}`,//creating an unique orderId for transaction.
      });

      const options = {
        key: "rzp_test_NYnGqqT5u8zO5w", // Razorpay Key ID
        amount: data.amount,
        currency: data.currency,
        name: "Event Booking",
        description: "Book your event slot",
        order_id: data.id,
        //verify the status of payment, we coded handler
        handler: async (response) => {
          console.log("Razorpay Response:", response);
  
          // Extract required values
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
          console.log("razorpay_order_id",razorpay_order_id)
          console.log("razorpay_payment_id",razorpay_payment_id)
          console.log("razorpay_signature",razorpay_signature)

          // Send for verification
          const verifyRes = await axios.post(backendUrl+"/api/user/verify-payment", {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          });

          console.log("verifyRes: ",verifyRes);

          if (verifyRes.data.success) {
          // Redirect to verification URL
          window.location.href = verifyRes.data.redirectUrl;

          } else {
          // Redirect to verification URL
          window.location.href = verifyRes.data.redirectUrl;;
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment failed!");
    }
  }

  //paypal payment
  // ✅ Create Payment
const handlePaypalPayment = async () => {
  if (!isChecked) {
      setShowCheckboxError(true); // Show error message if checkbox is not checked
      return;
    }
  try {
    const { data } = await axios.post(backendUrl+"/api/user/create-payment", { totalAmount });
    console.log("data.approvalUrl: ",data.approvalUrl);
    if (data?.approvalUrl) {
      window.location.href = data.approvalUrl; // Redirect to PayPal
    } else {
      console.error("Approval URL missing in response");
    }
  } catch (error) {
    console.error("Payment Error:", error);
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
   <div className="flex max-w-[800px] m-auto xl:m-0 gap-20 p-2">
    {/*checkout inputs form {!isCollapsed && (  <h2 className="text-5xl md:text-2xl font-bold mb-12 md:mb-6">User Details</h2> */}
    {!isCollapsed && (    <div  className="md:min-w-xl items-start mx-2 xl:ml-35  p-5 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-8 md:mb-4">User Details :</h2> 
     <form onSubmit={handleSubmit} className="grid gap-4 px-2">
        <div>
          <label className="block">Full Name <span className="text-red-500">*</span></label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full p-1 border-b-2 border-gray-400 outline-none" />
        </div>
        <div>
            <label className="block">Email <span className="text-red-500">*</span></label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="w-full p-1 border-b-2 border-gray-400 outline-none" 
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
         <div>
            <label className="block">Confirm Email <span className="text-red-500">*</span></label>
            <input 
              type="email" 
              name="confirmEmail" 
              value={formData.confirmEmail} 
              onChange={handleChange} 
              required 
              className="w-full p-1 border-b-2 border-gray-400 outline-none" 
            />
            {confirmEmailError && <p className="text-red-500 text-sm mt-1">{confirmEmailError}</p>}
          </div>
        <div>
        <label className="block"> Contact Number  <span className="text-red-500">*</span></label>
      <PhoneInput
          country={"in"}
          value={phone}
          onChange={(phone) => setPhone(phone)}
          containerStyle={{ width: "100%" }}
          countryCodeEditable={false}
          inputStyle={{
           width: "100%",
           height: "40px",
           fontSize: "16px",
           border: "none", // Remove all borders
           borderBottom: "2px solid #9CA3AF", // Add only bottom border
           borderRadius: "0px", // Remove rounded corners
           outline: "none", // Remove default focus outline
           paddingLeft: "50px", // Adjust for flag padding
           background: "transparent", // Match other input styles
        }}
       buttonStyle={{
          border: "none",
          background: "transparent",
        }}
    />
      </div>
        <div>
          <label className="block">City <span className="text-red-500">*</span></label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full p-1 border-b-2 border-gray-400 outline-none" />
        </div>
        <div>
          <label className="block">How did you hear about us? <span className="text-red-500">*</span></label>
          <select name="referralSource" value={formData.referralSource} onChange={handleChange} required className="w-full p-2 border-b-2 border-gray-400 outline-none">
            <option value="">Select an option</option>
            <option value="socialMedia">Social Media</option>
            <option value="friend">Friend/Family</option>
            <option value="searchEngine">Search Engine</option>
            <option value="other">Other</option>
          </select>
        </div>
        {
          showSaveButton ? (
            <button type="submit" className="hidden xl:block bg-blue-500 text-white p-3 mt-1 rounded-xl w-full">Save Information</button>
          ) : (
            <div className=" mt-1 w-full"></div>
          )
        }
       
       
      </form> 

       {/* Add ons*/}
       <div className="xl:hidden mt-10">
       <h4 className="text-xl font-bold py-3 px-5 bg-violet-900 text-white">ADD-ONS:</h4>
        <AddOn/>
      </div>
      {
          showSaveButton ? (
            <button  onClick={handleMobileSubmit} className="xl:hidden bg-blue-500 text-white text-xl py-3 mt-5 rounded-xl w-full">Save Information</button>
          ) : (
            <div className="p-3 mt-1 w-full"></div>
          )
        }
      
    </div>
   )}

   {  /* summary */}
   
    <div className="hidden xl:block">
    <div className="min-w-100 border mx-30 mt-25 mb-2 p-6 rounded-lg space-y-6 bg-white shadow-md">
  <h2 className="text-2xl font-semibold text-gray-800">Price Details</h2>
  <div>
    <div className="space-y-1">
    <div className="flex justify-between">
      <p className="text-lg font-semibold text-gray-700">Item Price:</p>
      <p className="text-lg font-semibold text-gray-700">₹{ItemPrice}</p>
    </div>
    {addOnTotal > 0 && (
      <div className="flex justify-between">
        <p className="text-lg font-semibold text-gray-700">Add-Ons:</p>
        <p className="text-lg font-semibold text-gray-700">₹{addOnTotal}</p>
      </div>
    )}
    {totalDiscount > 0 && (
      <div className="flex justify-between">
        <p className="text-md font-semibold text-green-700">Discount:</p>
        <p className="text-md font-semibold text-green-700">-₹{totalDiscount}</p>
      </div>
    )}
  </div>
  <hr />
  <div className="space-y-1 mt-3">
    <div className="flex justify-between">
      <p className="text-indigo-900 text-xl font-semibold">Total Amount:</p>
      <p className="text-indigo-900 text-2xl font-semibold">₹{totalAmount}</p>
    </div>
  </div>
    <span className="text-xs font-semibold text-gray-500">*Prices are inclusive of GST and excluding Booking Fees</span>
  </div>
</div>

<div className="flex items-center ml-28 space-x-2 mt-4">
        <input
          type="checkbox"
          id="terms"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="text-sm font-semibold max-w-100 text-gray-700">
          By clicking here, I state that I have read and understood the <span className="underline text-blue-900"> terms and conditions</span> and <span className="underline text-blue-900">privacy policy</span>.
        </label>
      </div>
      {showPaymentButton && (
            <div className="mt-6 ml-28">
        
        <button
          onClick={handlePayment}
          className={`zoom-shimmer-button  text-white px-40 py-6 rounded-lg shadow-lg 
              transition duration-300 ease-in-out hover:scale-105 
              focus:outline-none focus:ring-4 focus:ring-blue-300 
              ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          Proceed To Pay
        </button>

                
              {showCheckboxError && (
               <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
               {/*<BiErrorCircle className="text-lg" /> */}
               <span>*You must agree to the terms and conditions before proceeding.</span>
             </p>
              )}
            </div>
          )}
    </div>
  
   {isCollapsed && (
    <div className="block xl:hidden md:mx-auto">
    <div className="border mx-3 mt-30 mb-2 p-6 rounded-lg space-y-6 bg-white shadow-md">
  <h2 className="text-2xl font-semibold text-gray-800">Price Details</h2>
  <div className="space-y-1">
    <div className="flex justify-between">
      <p className="text-lg font-semibold text-gray-700">Item Price:</p>
      <p className="text-lg font-semibold text-gray-700">₹{ItemPrice}</p>
    </div>
    {addOnTotal > 0 && (
      <div className="flex justify-between">
        <p className="text-lg font-semibold text-gray-700">Add-Ons:</p>
        <p className="text-lg font-semibold text-gray-700">₹{addOnTotal}</p>
      </div>
    )}
    {totalDiscount > 0 && (
      <div className="flex justify-between">
        <p className="text-md font-semibold text-green-700">Discount:</p>
        <p className="text-md font-semibold text-green-700">-₹{totalDiscount}</p>
      </div>
    )}
  </div>
  <div className="space-y-1">
    <div className="flex justify-between">
      <p className="text-indigo-900 text-lg font-semibold">Total Amount:</p>
      <p className="text-indigo-900 text-lg font-semibold">₹{totalAmount}</p>
    </div>
    <span className="text-xs font-semibold text-gray-500">*Prices are inclusive of GST and excluding Booking Fees</span>
  </div>
</div>

<div className="flex items-center ml-3 space-x-2 mt-4">
        <input
          type="checkbox"
          id="terms"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="text-sm font-semibold max-w-100 text-gray-700">
          By clicking here, I state that I have read and understood the <span className="underline text-blue-900"> terms and conditions</span> and <span className="underline text-blue-900">privacy policy</span>.
        </label>
      </div>
      {showPaymentButton && (
            <div className="mt-6 mx-3">
        
        <button
  onClick={handlePayment}
  className={`zoom-shimmer-button  text-white px-32 md:px-36 py-6 rounded-lg shadow-lg 
              transition duration-300 ease-in-out hover:scale-105 
              focus:outline-none focus:ring-4 focus:ring-blue-300 
              ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
  Proceed To Pay
</button>

                
              {showCheckboxError && (
               <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
               {/*<BiErrorCircle className="text-lg" /> */}
               <span>*You must agree to the terms and conditions before proceeding.</span>
             </p>
              )}
            </div>
          )}
    </div>
   )}
    </div>
   {/* <div className="fixed bottom-0 left-0 w-full shadow-md z-50 md:hidden">
    {
          showSaveButton ? (
            <button  onClick={handleMobileSubmit} className=" bg-blue-500 text-white text-2xl py-4 mt-3 w-full">Save Information</button>
          ) : (
            <div className="p-3 mt-1 w-full"></div>
          )
        }
    </div>*/}

   </div>
  );
};

export default UserDetails;
