import React,{useState,useEffect} from "react";
import Logo from "../assets/Company_Logo.png";
import { useEvent } from '../context/EventContext';
import { useNavigate,useParams } from "react-router-dom";
import axios from 'axios'
import upload_icon from '../assets/upload_icon.png'
//import { v4 as uuidv4 } from "uuid";
import { FiEdit } from "react-icons/fi";
import { FaSave } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import {toast} from 'react-toastify'

const InvoiceTemplate3 = () => {
    //const [invoiceId, setInvoiceId] = useState("");
    const {showInvoice,setShowInvoice} = useEvent();
    const [isEdit,setIsEdit] = useState(false)//to edit the profile
    const [image, setImage] = useState(null);
    const [user, setUser] = useState({
        name: "",
        address: "",
        contact: "",
        website: "",
        logo:""
      });
    const [companyProfile, setCompanyProfile] = useState({
          name: "",
          address: "",
          contact: "",
          website: "",
        });
    const [headerBg, setHeaderBg] = useState("#9CA3AF");
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    if(!bookingId){
      return;
    }
    const fetchTransaction = async () => {
      try {
        const res = await axios.get(`https://deploy-project-k4im.onrender.com/api/admin/get-userinfo/${bookingId}`);
        //console.log("invoicetemp1: ",res.data);
        const data = res.data.data;
        //console.log("data: ",data);
        setTransaction(data);
      } catch (err) {
        console.error("Failed to fetch booking:", err);
      }
    };

    fetchTransaction();
  }, [bookingId]);


   useEffect(() => {
       axios
         .get("https://deploy-project-k4im.onrender.com/api/admin/get-invoiceinfo")
         .then((response) => {
           const invoice = response.data.invoice;
   
           if (invoice) {
             setUser({
               name: invoice.companyName || "",
               address: invoice.companyAddress || "",
               contact: invoice.companyContact || "",
               website: invoice.companyWebsite || "",
               logo: invoice.logo || Logo
             });
   
             setHeaderBg(invoice.headerBg || "#9CA3AF");
           }
           
         })
         .catch((error) => {
           console.error("Error fetching invoice:", error);
         });
     }, []);
   
     console.log("user: ",user)
   
         const invoiceData = {
           invoiceNumber: transaction?.userInfo?.id || "61278496",
           date: new Date().toISOString().split("T")[0], // Current date
           dueDate: "2025-04-05",
           seller: {
             name: user.name || "Your Company Name",
             address: user.address || "your company address",
             contact: user.contact || "your company contact",
             website: user.website || "your company website url",
           },
           buyer: {
             name: transaction?.userInfo?.fullName || "Customer Name",
             address: transaction?.userInfo?.city || "Customer Address",
             email: transaction?.userInfo?.email || "Customer Email",
             contact: transaction?.userInfo?.contactNumber || "Customer Contact",
           },
           items: transaction?.services || [
             { name: "Sample Service", quantity: 1, price: 100 },
           ],
           addOns: transaction?.addOns || [],
           subtotal: transaction?.priceSummary?.totalAmount || 100,
           Discount: transaction?.priceSummary?.totalDiscount || 0,
           tax: transaction?.tax || 10,
           total: transaction?.priceSummary?.totalAmount || 110,
           paymentDetails: { bankName: "ABC Bank", accountNumber: "123456789", terms: "Due in 30 days" },
           notes: "Thank you!",
         };
   
         const handleCloseOverlay = () => {
           setShowInvoice(false);
         };

         const handleCloseTemplate = () => {
          navigate("/transaction");
          //console.log("Clicked close")
         }

          // Handle input changes
    const handleChange = (e) => {
      setCompanyProfile({
        ...companyProfile,
        [e.target.name]: e.target.value,
      });
    };

    const invoice = "template3";
   
      
      // Function to save updated data to backend
    const handleSave = async (e) => {
      e.preventDefault();
    
      const formData = new FormData();
      formData.append("companyName", companyProfile.name);
      formData.append("companyAddress", companyProfile.address);
      formData.append("companyContact", companyProfile.contact);
      formData.append("companyWebsite", companyProfile.website);
      formData.append("headerBg", headerBg);
      //formData.append("invoiceId", invoiceId);
      formData.append("logo", image);
      formData.append("invoice",invoice)
      if (image instanceof File) {
        console.log("logo", image);
      } else {
        console.error("Invalid file selected");
      }
    
      // ✅ Log FormData to check entries before sending
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]); // This should show both text fields and file data
      }
      

      console.log("formData ",formData)
    
      // 🚀 Send to backend
      try {
        const response = await axios.put("https://deploy-project-k4im.onrender.com/api/admin/update-invoice", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
    
        console.log("Response:", response.data);
        toast.success("Template Saved for Invoice")
        setIsEdit(false);
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Error in Saving Template Data")
      }
    };

    const handleSaveTemplate = async() => {
      console.log("invoice selected: ",invoice)
      try {
        const response = await axios.put("https://deploy-project-k4im.onrender.com/api/admin/update-template", {
          invoiceTemplate: invoice
        });
        toast.success("Template Saved for Invoice")
        console.log("Response:", response.data);
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Error in Saving Template")
      }
    }
    
  return (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-lg overflow-y-auto scrollbar-hide z-50">
  <div className="flex justify-center m-3">
       <div className="relative w-full max-w-2xl bg-white shadow-md rounded-lg border border-gray-300 ">
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-900 text-white overflow-hidden  h-32 flex items-center px-5">
      {/* Wave Background */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="rgba(255,255,255,0.05)"
          d="M0,224L80,197.3C160,171,320,117,480,106.7C640,96,800,128,960,149.3C1120,171,1280,181,1360,186.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        ></path>
      </svg>

      {/* Content */}
      <div className="flex justify-between w-full z-10">
       <div>
       <h1 className="text-3xl font-bold">INVOICE</h1>
       <p className="text-base sm:text-lg mt-10 font-semibold">NO: {`INV${invoiceData.invoiceNumber}`}</p>
       </div>
         {
                      isEdit ? 
                      <label htmlFor="image">
                        <div className='inline-block relative cursor-pointer right-15'>
                          <img className='w-44 h-24 rounded opacity-75 ' src={image ? URL.createObjectURL(image) : Logo} alt="Uploaded Preview" />
                          <img className='w-10 absolute text-center bottom-10 right-16' src={image ? '' : upload_icon} alt=''/>
                        </div>
                        <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden/>
                      </label>
                      : 
                        <img className='w-44 h-24 rounded absolute right-13 sm:right-25' src={user.logo} alt="No Logo" />
                   
              }
      </div>
      {
              transaction ? (
           <button
                onClick={handleCloseTemplate}
                title="Close"
                className="absolute top-0 right-0 text-red-500 bg-red-200 shadow-2xl transition"
              >
                <RxCross2 size={45}/>
              </button>
              ):(
            <button onClick={handleCloseOverlay}  title="Close" className="absolute top-0 right-0 text-red-600 font-bold bg-red-200 shadow-2xl transition">
              <RxCross2 size={45}/>
            </button>
              )
            }
    </div>
      {/*<div className="flex mb-4">
        <img src={Logo} className="w-20 h-12 rounded" alt="" />
      </div>*/}
      <div className="p-5">
      <div className="grid grid-cols-2 gap-4   border-b pb-4 mb-4">
        <div className="">
          <h3 className="font-semibold">Billed To:</h3>
          <p className="font-semibold ">{invoiceData.buyer.name}</p>
          <p className="text-[15px]">{invoiceData.buyer.address}</p>
          <p className="text-[15px]">{invoiceData.buyer.email}</p>
          <p className="text-[15px]">{invoiceData.buyer.contact}</p>
        <div className="my-3">
        <p><strong>Date:</strong> {invoiceData.date}</p>
        </div>
        </div>
      
        <div className="text-left mx-auto">
        {
              isEdit ?
              <div className="flex flex-col text-right">
              <input type="text" className="text-center text-xl font-semibold " placeholder="Your Company name"  name="name" onChange={handleChange}/>
              <input type="text" className="text-center" placeholder="Your Company website" name="address"  onChange={handleChange}  />
              <input type="text" className="text-center" placeholder="Your Company address"  name="website"  onChange={handleChange}  />
              <input type="text" className="text-center" placeholder="Your Company contact"  name="contact" onChange={handleChange}  />
            </div>
            :
            <div className="flex flex-col text-left mr-3">
            <h2 className="text-2xl font-semibold">{invoiceData.seller.name}</h2>
            <p>{invoiceData.seller.website}</p>
            <p>{invoiceData.seller.address}</p>
            <p>{invoiceData.seller.contact}</p>
          </div>
         }
        </div>
      </div>
      
      <table className="w-full border border-collapse border-black mb-4">
        <thead>
          <tr className="bg-blue-800 text-white">
            <th className="border border-black p-2">Item Description</th>
            <th className="border border-black p-2">Quantity</th>
            <th className="border border-black p-2">Unit Price</th>
            <th className="border border-black p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.items.map((item, index) => (
            <tr key={index} className="">
              <td className="border p-2">{item.name}</td>
              <td className="border p-2 text-center">{item.quantity}</td>
              <td className="border p-2 text-center">${item.price}</td>
              <td className="border p-2 text-center">${(item.quantity * item.price)}</td>
            </tr>
          ))}
          {invoiceData.addOns.map((addOn, index) => (
            <tr key={index} className="">
              <td className="border p-2">{addOn.name}</td>
              <td className="border p-2 text-center">1</td>
              <td className="border p-2 text-center">${addOn.price}</td>
              <td className="border p-2 text-center">${(1 * addOn.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="text-right ">
        <p className="px-3"><strong>Subtotal:</strong> ${invoiceData.subtotal}.00</p>
        <p className="px-3"><strong>Tax ({invoiceData.taxRate}%):</strong> ${invoiceData.tax}.00</p>
        <hr className="my-1 w-1/3 border-t border-gray-400 ml-auto" />
        <p className="text-xl text-blue-700 font-bold px-3">Total: ${invoiceData.total}.00</p>
      </div>
      
      <div>
        <h3 className="text-blue-500 font-semibold">Payment Details:</h3>
        <p><strong>Bank Name:</strong> {invoiceData.paymentDetails.bankName}</p>
        <p><strong>Account Number:</strong> {invoiceData.paymentDetails.accountNumber}</p>
        <p><strong>Payment Terms:</strong> {invoiceData.paymentDetails.terms}</p>
      </div>

      <div>
      <div className="text-right mt-4">
      <hr className=" w-1/3 border-t border-gray-400 ml-auto" />
        <p className="mx-8">Company Signature</p>
      </div>
      
      <div className="">
        <p><strong>Notes:</strong> </p>
        <p>This is applicable for one time.</p>
      </div>
      </div>
      <p className="text-center mt-6 font-semibold">Thank You for Your Business!</p>
      
      </div>
     {
               transaction ? (
                  <div>
                  </div>
               ):(
                 <div className='flex'>
             {
               isEdit ? (
               <button className="absolute 2xl:hidden top-14  md:top-0 right-0 md:-right-[60px] p-2 bg-green-200 rounded-md"  onClick={handleSave}>
               <FaSave size={32}/>
             </button>
           
             ):(
             <div>
               <button title="Save Template" className="absolute 2xl:hidden bg-green-200 p-2 rounded-lg top-14 md:top-0 right-0 md:-right-[60px]" onClick={handleSaveTemplate}><FaSave size={32}/></button>
           <button title="Edit Template" className="absolute 2xl:hidden bg-green-200 p-2 rounded-lg top-28 md:top-18 right-0 md:-right-[60px]" onClick={()=>setIsEdit(true)}><FiEdit size={32}/></button>
            
             </div>
             )}
               </div>
               )
              }
    </div>
    </div>
    {
    transaction ? (
  <div>
    
  </div>
    ):(
      <div className='flex'>
  {
    isEdit ? 
    <button className="absolute  hidden 2xl:block p-2 bg-green-200  rounded-md top-3 right-80"  onClick={handleSave}>
   <FaSave size={32}/>
  </button>
  :
  <div>
<button title="Save Template" className="absolute hidden 2xl:block bg-green-200 p-2 rounded-lg top-2 right-80 " onClick={handleSaveTemplate}><FaSave size={32}/></button>
<button title="Edit Template" className="absolute hidden 2xl:block bg-green-100 p-2 rounded-lg top-20 right-80" onClick={()=>setIsEdit(true)}><FiEdit size={32}/></button>
  </div>
  }
    </div>
    )
   }
    </div>
  );
};

export default InvoiceTemplate3;
