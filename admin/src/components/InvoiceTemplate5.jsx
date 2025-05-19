import React,{useState,useEffect} from "react";
import { useNavigate,useParams } from "react-router-dom";
import axios from 'axios';
import Logo from "../assets/Company_Logo.png";
//import { v4 as uuidv4 } from "uuid";
import { useEvent } from '../context/EventContext';
import upload_icon from '../assets/upload_icon.png'
//import { IoMdColorFilter } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { FaSave } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import {toast} from 'react-toastify'

const InvoiceTemplate5 = () => {
  const [user, setUser] = useState({
    name: "",
    address: "",
    contact: "",
    website: "",
    logo:""
  });
  const [invoiceId, setInvoiceId] = useState("");
  const [isEdit,setIsEdit] = useState(false)//to edit the profile
  const [image, setImage] = useState(null);
  const [companyProfile, setCompanyProfile] = useState({
    name: "",
    address: "",
    contact: "",
    website: "",
  });
  
  const [headerBg, setHeaderBg] = useState("#9CA3AF");
  const [showColor,setShowColor] = useState(false);
   const {showInvoice,setShowInvoice} = useEvent();
  const navigate = useNavigate();
   //const location = useLocation();
  //const { transaction } = location.state || {};
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
      subtotal: transaction?.priceSummary?.ItemPrice || 100,
      Discount: transaction?.priceSummary?.totalDiscount || 0,
      tax: transaction?.tax || 10,
      total: transaction?.priceSummary?.totalAmount || 110,
    };

    
    const handleCloseOverlay = () => {
        setShowInvoice(false);
      };

    const handleCloseTemplate = () => {
        navigate("/transaction");
        console.log("Clicked close")
      }
   
    
  
    // Handle input changes
    const handleChange = (e) => {
      setCompanyProfile({
        ...companyProfile,
        [e.target.name]: e.target.value,
      });
    };

    const invoice = "template";


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
  <div className="flex justify-center m-3 px-4">
    <div className='relative md:w-xl shadow-lg' style={{ backgroundColor: headerBg }}>    
      <div className="pl-6 border-b">
      <div className="relative px-2 pt-2 flex justify-between items-center">
  <h1 className="text-2xl font-bold text-center flex-1">Invoice</h1>
  {/*<div className="">
    {
      isEdit && <label className=" block text-sm font-medium text-gray-700">
      <IoMdColorFilter size={25}   onClick={() => setShowColor(true)} />
    </label>
    }
    
  </div>*/}
   {
    transaction ? (
  <button
      onClick={handleCloseTemplate}
      title="Close"
      className="absolute top-0 right-0 text-red-500 bg-red-200 transition  shadow-lg hover:shadow-xl "
    >
      <RxCross2 size={40}/>
    </button>
    ):(
      <button
      onClick={handleCloseOverlay}
      title="Close"
      className="absolute top-0 right-0 text-red-500 bg-red-200 transition  shadow-lg hover:shadow-xl "
    >
      <RxCross2 size={36}/>
    </button>
    )
  }
</div>
{/*<div className="text-right">
    
</div>*/}


<div className="flex justify-between items-center pb-4">
{
        isEdit ? 
        <label htmlFor="image">
          <div className='inline-block relative cursor-pointer'>
            <img className='w-44 h-24 rounded opacity-75' src={image ? URL.createObjectURL(image) : Logo} alt="Uploaded Preview" />

            <img className='w-10 absolute text-center bottom-10 right-16' src={image ? '' : upload_icon} alt=''/>
          </div>
          <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden/>
        </label>
        : <img className='w-44 h-24 rounded' src={user.logo} alt="No Logo" />
      }

            {
              isEdit ?
              <div className="flex flex-col text-right">
              <input type="text" className="text-center text-xl font-semibold " placeholder="Your Company name"  name="name" onChange={handleChange}/>
              <input type="text" className="text-center" placeholder="Your Company website" name="address"  onChange={handleChange}  />
              <input type="text" className="text-center" placeholder="Your Company address"  name="website"  onChange={handleChange}  />
              <input type="text" className="text-center" placeholder="Your Company contact"  name="contact" onChange={handleChange}  />
            </div>
            :
            <div className="flex flex-col text-right mr-3">
            <h2 className="text-xl font-semibold">{invoiceData.seller.name}</h2>
            <p>{invoiceData.seller.website}</p>
            <p>{invoiceData.seller.address}</p>
            <p>{invoiceData.seller.contact}</p>
            
          </div>
         }
</div>
      </div>
<div className="bg-white p-6">
    
<div className="flex justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Billing To:</h2>
          <p>{invoiceData.buyer.name}</p>
          <p>{invoiceData.buyer.address}</p>
          <p>{invoiceData.buyer.contact}</p>
          <p>{invoiceData.buyer.email}</p>
         
        </div>

        <div className="my-auto text-right">
          <p><strong>Invoice: </strong> {`INV${invoiceData.invoiceNumber}`}</p>
          <p><strong>Date:</strong> {invoiceData.date}</p>
          <p><strong>Due Date:</strong> {invoiceData.dueDate}</p>
        </div>
      </div>

      <table className="w-full mt-5 mb-4">
        <thead>
          <tr className="bg-gray-300">
            <th className="text-left p-4">Item</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Price(₹)</th>
           {/*  <th className="p-2">Discount(₹)</th> */}
            <th className="p-2">Total(₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.items.map((item, index) => (
            <tr key={index}>
              <td className="p-2">{item.name}</td>
              <td className="p-2 text-center">{item.quantity}</td>
              <td className="p-2 text-center"> {item.price.toFixed(2)}</td>
              {/*<td className="p-2 text-center">{item.discount}</td> */}
              <td className="p-2 text-center">{(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
          {invoiceData.addOns.map((addOn, index) => (
            <tr key={index} className="">
              <td className="p-2">{addOn.name}</td>
              <td className="p-2 text-center">1</td>
              <td className="p-2 text-center">{addOn.price.toFixed(2)}</td>
              <td className="p-2 text-center">{(1 * addOn.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div  style={{ whiteSpace: "pre-line", textAlign: "right" }} className="text-right mx-3 my-2">
  <p className="text-[15px]">Subtotal(₹): {invoiceData.subtotal.toFixed(2)} </p>
  <p className="text-[15px]">Discount(₹): <span>-</span>{invoiceData.Discount.toFixed(2)}</p>
  <p className="text-[16px]">Tax(₹): {invoiceData.tax.toFixed(2)}</p>
  <p className="text-xl mt-3 font-bold"><strong>Total:</strong> ₹{invoiceData.total.toFixed(2)}</p>
</div>
 {
                transaction ? (
                   <div>
                   </div>
                ):(
                  <div className='flex'>
              {
                isEdit ? (
                <button title="Save Template" className="absolute 2xl:hidden top-14  md:top-0 right-0 md:-right-[60px] p-2 bg-green-200 rounded-md"  onClick={handleSave}>
                <FaSave size={32}/>
              </button>
            
              ):(
              <div>
                <button title="Save Template" className="absolute 2xl:hidden bg-green-200 p-2 rounded-lg top-14 sm:top-0 -right-[15px] sm:-right-[60px]" onClick={handleSaveTemplate}><FaSave size={32}/></button>
            <button title="Edit Template" className="absolute 2xl:hidden bg-green-200 p-2 rounded-lg top-28 sm:top-18 -right-[15px] sm:-right-[60px]" onClick={()=>setIsEdit(true)}><FiEdit size={32}/></button>
             
              </div>
              )}
                </div>
                )
         }
     </div>
     
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
    <button title="Save Template" className="absolute hidden 2xl:block p-2 bg-green-200  rounded-md top-3 right-80"  onClick={handleSave}>
    <FaSave size={32}/>
  </button>
  :
  <div>
<button title="Save Template" className="absolute hidden 2xl:block bg-green-200 p-2 rounded-lg top-2  right-90 " onClick={handleSaveTemplate}><FaSave size={32}/></button>
<button title="Edit Template" className="absolute hidden 2xl:block bg-green-100 p-2 rounded-lg top-20 right-90" onClick={()=>setIsEdit(true)}><FiEdit size={32}/></button>
  </div>
  }
    </div>
    )
   }
    </div>
  );
};

export default InvoiceTemplate5;
