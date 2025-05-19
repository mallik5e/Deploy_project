import { useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useEffect,useState,useRef } from 'react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') || 'Payment was successful!';
  const status = 'success';

  const [selectedDate,setSelectedDate] = useState();
  const [services,setServices] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //const [paymentUpdated, setPaymentUpdated] = useState(false);
  const paymentUpdatedRef = useRef(false); // ✅ Use useRef to prevent duplicate calls
  const bookingId = sessionStorage.getItem('bookingId'); // Get bookingId from sessionStorage

  console.log(bookingId)

  
  // Fetch user and company data, then post to generate invoice
  useEffect(() => {
    const fetchDataAndGenerateInvoice = async () => {
      try {
        setLoading(true);

        // 1. Fetch user info
        const userRes = await axios.get(`https://deploy-project-k4im.onrender.com/api/admin/get-userinfo/${bookingId}`);
        const fullUserData = userRes.data;

        //console.log("fullUserData",fullUserData)


        const selectedDate = fullUserData.data.selectedDate;
        const services = fullUserData.data.services;

       setSelectedDate(selectedDate);
       setServices(services);

      // Use selectedDate and services here
       //console.log("selectedDate: ", selectedDate);
       //console.log("services: ", services);


        const extractedUserInfo = {
          id: fullUserData?.data.userInfo?.id,
          fullName: fullUserData?.data.userInfo?.fullName,
          email: fullUserData?.data.userInfo?.email,
          contactNumber: fullUserData?.data.userInfo?.contactNumber,
          city: fullUserData?.data.userInfo?.city,
          priceSummary: fullUserData?.data.priceSummary,
          services: fullUserData?.data.services,
          addOns: fullUserData?.data.addOns,
          dueDate: fullUserData?.data.selectedDate,
        };

   

        // 2. Fetch company info
        const companyRes = await axios.get('https://deploy-project-k4im.onrender.com/api/admin/get-invoiceinfo');
        const fullCompanyData = companyRes.data;

        //console.log("fullCompanyData",fullCompanyData)

        const extractedCompanyInfo = {
          companyAddress: fullCompanyData?.invoice.companyAddress,
          companyContact: fullCompanyData?.invoice.companyContact,
          companyName: fullCompanyData?.invoice.companyName,
          companyWebsite: fullCompanyData?.invoice.companyWebsite,
          invoiceId: fullCompanyData?.invoice.invoiceId,
          logo: fullCompanyData?.invoice.logo,
        };

        // 3. Combine and post to generate invoice
        const payload = {
          userInfo: extractedUserInfo,
          companyInfo: extractedCompanyInfo,
        };

        console.log("Payload: ",payload)

       const invoiceRes = await axios.post('https://deploy-project-k4im.onrender.com/api/admin/generate-invoice', payload);
       console.log("invoice response: ",invoiceRes.data);
       setInvoiceData(invoiceRes.data);

     // 4. Update payment status and send email
     await updatePaymentStatus(selectedDate, services, status);

       //console.log("invoice Response",invoiceRes.data.pdfUrl)
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to generate invoice');
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndGenerateInvoice();
  }, [bookingId, status]);

  
   const updatePaymentStatus = async (selectedDateParam, servicesParam, statusParam) => {
    //console.log("Getting into updatePaymentStatus function")

       if (!bookingId || paymentUpdatedRef.current) {
       return;
      }
      //setPaymentUpdated(true); 
     paymentUpdatedRef.current = true; // ✅ Lock after first execution, Immediately prevent further calls
     //console.log("Calling updatePaymentStatus...");

      try {
        await axios.put(`https://deploy-project-k4im.onrender.com/api/user/bookings/${bookingId}/payment-status`, {
          paymentStatus: statusParam,
          selectedDate: selectedDateParam,
          services: servicesParam
        });
        console.log('Payment status updated successfully');

        // Send confirmation email after payment update
        await axios.post('https://deploy-project-k4im.onrender.com/api/admin/booking/send-confirmation-email', {
          bookingId,
        });
        console.log('Confirmation email sent successfully');

        // Clear bookingId from sessionStorage after payment and email confirmation
        sessionStorage.removeItem('bookingId');
      } catch (error) {
        console.error('Failed to update payment status or send email:', error);
      }
    };

   // ✅ Handler for "Go to Homepage" button
  const handleGoHome = async () => {
    await updatePaymentStatus(selectedDate, services, status);
    window.location.href = '/'; // ✅ Navigate after ensuring update
  };


  //if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-300">
      <div className="bg-white shadow-lg rounded-2xl m-1 p-6 md:p-28 flex flex-col items-center">
        <CheckCircle className="text-green-500 w-26 h-26 mb-4" />
        <h1 className="text-4xl font-bold text-green-600">Success</h1>
        <p className="text-xl font-bold text-gray-700 mt-2">{message}</p>
         <button
          onClick={handleGoHome}
          className="mt-6 px-6 py-2 bg-green-500 text-white rounded-full text-lg font-medium hover:bg-green-600 transition"
        >
          Go to Homepage
        </button>
        <p className='mt-3 text-md font-semibold'><span className='text-red-500 text-xl mt-1'>*</span> We'll reach out to you as soon as possible.</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
