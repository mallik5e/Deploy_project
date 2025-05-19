import { useState, useEffect } from "react";
import { MdOutlinePayments } from "react-icons/md";
import { SiPhonepe, SiRazorpay } from "react-icons/si";
import { FaPaypal,FaRegEyeSlash } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import payment from '../assets/payment.png'

const paymentMethods = [
  { name: "PayU", icon: <MdOutlinePayments className="text-3xl text-green-600" /> },
  { name: "PhonePe", icon: <SiPhonepe className="text-3xl text-purple-600" /> },
  { name: "Razorpay", icon: <SiRazorpay className="text-3xl text-blue-600" /> },
  { name: "PayPal", icon: <FaPaypal className="text-3xl text-blue-500" /> },
];

export default function PaymentIntegration() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Fetch saved data from backend when component loads
  useEffect(() => {
    async function fetchSavedSettings() {
      try {
        const response = await fetch("http://localhost:5000/api/admin/get-paymentgateway");
        const data = await response.json();
        console.log("data",data)
        if (data.gateway) {
          setSelectedMethod(data.gateway);
          setCredentials({ [data.gateway]: { apiKey: data.apiKey, secretKey: data.secretKey } });
        }
      } catch (error) {
        toast.error(error);
        console.error("Error fetching saved payment method:", error);
      }
    }
    fetchSavedSettings();
  }, []);

  // Toggle only one payment method at a time
  const toggleMethod = (method) => {
    if (selectedMethod === method) {
      setSelectedMethod(null); // If clicking the same toggle, turn it off
    } else {
      setSelectedMethod(method);
      setCredentials((prev) => ({
        ...prev,
        [method]: prev[method] || { apiKey: "", secretKey: "" }, // Retain previously entered data
      }));
    }
  };

  // Handle input change
  const handleInputChange = (method, field, value) => {
    setCredentials((prev) => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value,
      },
    }));
  };

  // Handle save button click
  const handleSave = async (gateway) => {
    const data = {
      gateway,
      apiKey: credentials[gateway]?.apiKey || "",
      secretKey: credentials[gateway]?.secretKey || "",
    };
    
    try {
      const response = await fetch("http://localhost:5000/api/admin/set-paymentgateway", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
       
      toast.success(result.message);
      // Keep the toggle on and retain input field values
      setSelectedMethod(gateway);
    } catch (error) {
      console.error("Error saving payment method:", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setShowSaveButton(true);
  };

  // Handle input blur to check if any input is still focused
  const handleBlur = (e) => {
    setTimeout(() => {
      if (!document.querySelector("input:focus")) {
        setShowSaveButton(false);
      }
    }, 100); // Small delay to prevent flicker
  };

  return (
    <div className="flex xl:mx-15 xl:gap-40">
    <div className="p-4 md:m-10">
      <h2 className="text-2xl font-bold mb-12">Payment Integration:</h2>
      {paymentMethods.map(({ name, icon }) => (
        <div key={name} className="mb-10 sm:min-w-md">
          <div className="flex justify-between items-center  md:w-6/6">
            <span className="flex items-center space-x-3 text-xl font-medium">
              {icon} <span>{name}</span>
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={selectedMethod === name}
                onChange={() => toggleMethod(name)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer-checked:bg-blue-600 after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
          {selectedMethod === name && (
            <div className="mt-4 space-y-3">
              <div className="mt-3 relative md:w-6/6">
      <input
        type={showAPIKey ? "text" : "password"}
        placeholder="Enter API Key"
        className="w-full p-2 border rounded-lg pr-10"
        value={credentials[name]?.apiKey || ""}
        onChange={(e) => handleInputChange(name, "apiKey", e.target.value)}
        onFocus={handleFocus} 
      />
      <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
        {showAPIKey ? (
          <FaRegEyeSlash className="text-gray-500" onClick={() => setShowAPIKey(false)} />
        ) : (
          <IoEyeOutline className="text-gray-500" onClick={() => setShowAPIKey(true)} />
        )}
      </div>
    </div>
    <div className="mt-3 relative md:w-6/6">
      <input
        type={showSecretKey ? "text" : "password"}
        placeholder="Enter Secret Key"
        className="w-full p-2 border rounded-lg pr-10"
        value={credentials[name]?.secretKey || ""}
        onChange={(e) => handleInputChange(name, "secretKey", e.target.value)}
        onFocus={handleFocus} 
      />
      <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer">
        {showSecretKey ? (
          <FaRegEyeSlash className="text-gray-500" onClick={() => setShowSecretKey(false)} />
        ) : (
          <IoEyeOutline className="text-gray-500" onClick={() => setShowSecretKey(true)} />
        )}
      </div>
    </div>
    {showSaveButton && 
              <button
                className="md:w-6/6 bg-blue-600 text-white p-2 rounded-lg"
                onClick={() => handleSave(name)}
              >
                Save
              </button>
            }
            </div>
          )}
        </div>
      ))}
      </div>
      <img src={payment} alt="payment image" className="hidden xl:block w-160 h-120  mt-15 rounded-md"/>
    </div>
  );
}
