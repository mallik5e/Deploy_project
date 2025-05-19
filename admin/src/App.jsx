import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddEvents from './pages/AddEvents';
import Login from './components/Login';
import Navbar from './components/Navbar';
import AddOn from './pages/AddOn';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BookingHistory from './pages/BookingHistory';
import GetEvents from './pages/GetEvents';
import GetAddOn from './pages/GetAddOn';
//import WhatsAppMessage from './pages/WhatsappMessage';
import MyProfile from './pages/MyProfile';
import PaymentIntegration from './pages/PaymentIntegration';
//import Invoice from './components/Invoice';
import Transaction from './pages/Transaction'
//import InvoiceFormate from './pages/InvoiceFormate';
import InvoiceTemplate1 from './components/InvoiceTemplate1';
import InvoiceTemplate2 from './components/InvoiceTemplate2';
import InvoiceTemplate3 from './components/InvoiceTemplate3';
import InvoiceTemplate4 from './components/InvoiceTemplate4';
import SelectInvoice from './pages/selectInvoice';
import InvoiceTemplate5 from './components/InvoiceTemplate5';
import MonthlyBookingsChart from './components/ReferralDoughnutChart';
//import ProgressBar from './components/ProgressCircle';


function App() {
  return (
    <Router>
      {/* ✅ Make Navbar fixed so it doesn't move */}
      <Navbar />
      <ToastContainer />

      {/* ✅ Add pt-16 to push content down instead of mt-16  <Route path='/invoiceform' element={<InvoiceFormate/>} /> */}
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<GetEvents />} />
          <Route path="/add-ons" element={<GetAddOn />} />
          <Route path="/history" element={<BookingHistory />} />
          <Route path='/profile' element={<MyProfile/>}/>
          <Route path='/transaction' element={<Transaction/>} />  
          <Route path='/invoice-temp1/:bookingId' element={<InvoiceTemplate1/>} /> 
          <Route path='/invoice-temp2/:bookingId' element={<InvoiceTemplate2/>} /> 
          <Route path='/invoice-temp3/:bookingId' element={<InvoiceTemplate3/>} /> 
          <Route path='/invoice-temp4/:bookingId' element={<InvoiceTemplate4/>} /> 
          <Route path='/invoice-temp5/:bookingId' element={<InvoiceTemplate5/>} /> 
          <Route path='/select-invoice' element={<SelectInvoice/>} /> 
          <Route path='/payment' element={<PaymentIntegration/>}/>
        
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// ✅ Redirect logic
const Root = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};
