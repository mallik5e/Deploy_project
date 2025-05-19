import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import Login from './UserAuth/Login';
import MonthlyCalendar from './components/Calendar';
import Services from './components/Services';
import UserDetails from './components/userDetails';
import PaymentSuccess from './components/PaymentStatus';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import PaymentFailure from './components/Payment';
//import Home from './components/Home';


function App() {
  return (
    <div>
      {/* ✅ Correct placement of ToastContainer  <Route path='/success' element={<SuccessPage />} /> />*/}
      <ToastContainer />
      <Router>
        <Routes>
          <Route path='/' element={<MonthlyCalendar />} />
          <Route path='/services' element={<Services />} />
          <Route path='/userdetails' element={<UserDetails />} />
          <Route path='/success' element={<PaymentSuccess />} />
          <Route path='/failure' element={<PaymentFailure />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;


