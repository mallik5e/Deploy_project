import React, { useState,useEffect } from 'react';
import InvoiceTemplate1 from '../components/InvoiceTemplate1';
import InvoiceTemplate2 from '../components/InvoiceTemplate2';
import InvoiceTemplate3 from '../components/InvoiceTemplate3';
import InvoiceTemplate4 from '../components/InvoiceTemplate4';
import InvoiceTemplate5 from '../components/InvoiceTemplate5';
import { assets } from '../assets/assets';
import { FaPlus } from "react-icons/fa6";
import { useEvent } from '../context/EventContext';
import axios from 'axios'

const images = [
  { id: 1, src: assets.temp1 },
  { id: 2, src: assets.temp2 },
  { id: 3, src: assets.temp3 },
  { id: 4, src: assets.temp4 },
  { id: 5, src: assets.temp5 },
];

const SelectInvoice = () => {
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [invoiceTemplate,setInvoiceTemplate] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
 // const [showInvoice, setShowInvoice] = useState(false);
  const [isEdit,setIsEdit] = useState(false)//to edit the profile

  const {showInvoice,setShowInvoice} = useEvent();

   useEffect(() => {
         axios
           .get("http://localhost:5000/api/admin/get-invoiceinfo")
           .then((response) => {
             const template = (response.data.invoice.invoiceTemplate);
             console.log("Select template",template)
             setInvoiceTemplate(template);
           })
           .catch((error) => {
             console.error("Error fetching invoice:", error);
           });
       }, []);
     

  const handleClick = (id) => {
    setSelectedImageId(id);
    setShowInvoice(true);
  };

  const handleDoubleClick = (id) => {
   // const image = images.find((img) => img.id === id);
  //  setSelectedImageId(id);
   // setSelectedImage(image.src);
  //  setShowInvoice(false);
  };

  useEffect(() => {
    switch (invoiceTemplate) {
      case "template1":
        setSelectedImage(assets.temp1);
        break;
      case "template2":
        setSelectedImage(assets.temp2);
        break;
      case "template3":
        setSelectedImage(assets.temp3);
        break;
      case "template4":
        setSelectedImage(assets.temp4);
        break;
      case "template":
        setSelectedImage(assets.temp5);
        break;
      default:
        return;
    }
  }, [invoiceTemplate]); // run effect when invoiceTemplate changes
  
 

  const renderSelectedInvoice = () => {
    switch (selectedImageId) {
      case 1: return <InvoiceTemplate1 />;
      case 2: return <InvoiceTemplate2 />;
      case 3: return <InvoiceTemplate3 />;
      case 4: return <InvoiceTemplate4 />;
      case 5: return <InvoiceTemplate5 />  ;
      default: return null;
    }
  };

 

  return (
   <div className="mt-8 px-4 sm:px-6 lg:px-8">
  <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center items-start">
    {/* Selected Image Preview */}
    <div className="w-full h-[400px] sm:h-[480px] md:h-[520px] lg:w-[600px] lg:h-[580px] bg-gray-50 flex items-center justify-center text-center rounded-xl shadow-lg border border-gray-300">
      {selectedImage ? (
        <img
          src={selectedImage}
          alt="Selected"
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6">
          <FaPlus size={50} className="text-gray-500 mb-3" />
          <p className="text-gray-600 text-base text-center">
            Select a template from the right to your invoice.
          </p>
        </div>
      )}
    </div>

    {/* Template Section */}
    <div className='mx-2 md:ml-18'>
      <h1 className="text-xl sm:text-2xl font-bold mb-8">Invoice Templates:</h1>
      
      {/* Templates Grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <img
            key={image.id}
            src={image.src}
            alt={`Template ${image.id}`}
            onClick={() => handleClick(image.id)}
            onDoubleClick={() => handleDoubleClick(image.id)}
             className={`w-50 h-50 object-cover rounded-lg cursor-pointer transition-all duration-200 shadow-sm
                ${selectedImageId === image.id ? 'border-4 border-blue-500' : 'border border-gray-300 hover:border-blue-300'}`}
          />
        ))}
      </div>
    </div>
  </div>

  {/* Conditional Rendering */}
  {showInvoice && renderSelectedInvoice()}
</div>

  );
};

export default SelectInvoice;
