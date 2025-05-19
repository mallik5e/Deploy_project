import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [categoriesFilter,setCategoriesFilter] = useState("");
    const [bookedServiceEvents, setBookedServiceEvents] = useState(null); // Store booked events of specific service
    const [showInvoice, setShowInvoice] = useState(false);
    const [userData, setUserData] = useState({});

    const token = localStorage.getItem('token') ? localStorage.getItem('token')  : false
    console.log("token frontend: ",token)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/user/get-event');
                console.log('Fetched categories:', response.data); // Debug log
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);
    

    const addNewCategory = async (newCategory) => {
        try {
            const response = await axios.post('http://localhost:5000/api/admin/add-event', { category: newCategory });
            const addedCategory = response.data;
            setCategories([...categories, addedCategory]); // Add new category to the list
            return addedCategory; // Return the newly added category
        } catch (error) {
            console.error('Error adding new category:', error);
            alert('Failed to add new category');
        }
    };
    

    const addEvent = async (eventData) => {
        try {
            await axios.post('http://localhost:5000/api/admin/add-event', eventData);
            toast.success("Service added successfully!");
        } catch (error) {
            console.error('Error adding event:', error);
            alert('Failed to add event');
        }
    };

    useEffect(()=>{
        if(token){
         getProfileData()
        }else{
         setUserData(false)
        }
      },[token])

      const getProfileData = async() => {
        try{
           const {data} = await axios.get("http://localhost:5000/api/admin/get-profile",{headers:{token}})
           if(data.success){
            setUserData(data.userData)
           }else{
             toast.error(data.message)
           }
        }catch(error){
            toast.error(error.message)
            console.log(error)
        }
    }

    

    
     

    return (
        <EventContext.Provider value={{ categories, setCategories,  selectedDate, categoriesFilter,  bookedServiceEvents, setBookedServiceEvents, setSelectedDate, setCategoriesFilter, addNewCategory, addEvent,showInvoice,setShowInvoice, userData, setUserData,  }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
};

export default EventContext;
