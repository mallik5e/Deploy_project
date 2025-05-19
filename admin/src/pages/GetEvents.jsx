import React, { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaEye, FaTrash, FaTimes } from "react-icons/fa";
import AddEvents from '../pages/AddEvents'
import { toast } from "react-toastify";

const GetEvents = () => {
  const [events, setEvents] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [updatedService, setUpdatedService] = useState({});
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/get-event");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
    setLoading(false);
  };

  const handleView = (service) => {
    setSelectedService(service);
  };

  const handleEdit = (service, categoryId) => {
    setEditingService(service);
    setUpdatedService({ ...service, categoryId }); // Include categoryId in the updatedService state
  };
  
  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/update-event`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedService), // Now contains categoryId
      });
      console.log(updatedService);
      if (response.ok) {
        fetchEvents();
        setEditingService(null);
      }
      toast.success("Updated Successfully")
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Update Failed")
    }
  };
  
  const handleDelete = async (serviceId, categoryId) => {
    if (!serviceId || !categoryId) {
      console.error("🚨 Missing categoryId or _id!");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete-event/${serviceId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, _id: serviceId }), // Ensure both categoryId and _id are sent
      });
  
      if (response.ok) {
        toast.success("Deleted Successfully")
        fetchEvents(); // Refresh the event list after deletion
      } else {
        console.error("🚨 Failed to delete event:", await response.json());
      }
    } catch (error) {
      console.error("🚨 Error deleting event:", error);
    }
  };
  
  

  return (
    <div className="relative mx-10 my-4 bg-white shadow-lg rounded-2xl p-6 transition-all duration-300">
      {/* Full-Page Blur Effect when Modal is Open */}
      {selectedService && <div className="fixed inset-0 backdrop-blur-md z-40"></div>}

      <h2 className="text-2xl font-bold mb-4">Events</h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl font-semibold text-gray-400"></span>
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-6">
          {events.map((category, index) => (
            <div
              key={category.category}
              className="bg-gray-100 p-4 rounded-lg shadow-md transition-all duration-300 border border-gray-300 w-full"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2 cursor-pointer">
                {category.category}
              </h3>

              <div className={`transition-opacity duration-300 ${hoveredIndex === index ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                {category.options.map((service) => (
                  <div key={service.name} className="bg-white p-3 rounded-lg shadow-sm mb-2 flex justify-between items-center">
                    <span className="text-lg font-semibold">{service.name}</span>
                    <div className="flex gap-3">
                      <FaEye className="text-blue-500 cursor-pointer" onClick={() => handleView({ category: category.category, ...service })} />
                      <FaEdit className="text-green-500 cursor-pointer" onClick={() => handleEdit(service, category._id)} />
                      <FaTrash className="text-red-500 cursor-pointer" onClick={() => handleDelete(service._id, category._id)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>
          
        </p>
      )}

      {/* Modal for Viewing Event Service */}
      {selectedService && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative z-50">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
              onClick={() => setSelectedService(null)}
            >
              <FaTimes />
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-600">{selectedService.category}</h2>
            <div className="space-y-3">
              <p><strong>Service Name:</strong> {selectedService.name}</p>
              <p><strong>Price:</strong> ₹{selectedService.price}</p>
              <p><strong>Discount:</strong> ₹{selectedService.discount}</p>
              <p><strong>Selection Type:</strong> {selectedService.selectionType}</p>
              <p><strong>Total Slots:</strong> {selectedService.slotsLeft}</p>

              {/* Display Slots By Date 
              <div>
                <strong>Slots by Date:</strong>
                <ul className="mt-2 border p-2 rounded-md bg-gray-100">
                  {Object.entries(selectedService.slotsByDate).map(([date, slots]) => (
                    <li key={date} className="text-sm text-gray-700">
                      {date}: <span className="font-semibold">{slots} slots</span>
                    </li>
                  ))}
                </ul>
              </div>*/}
            </div>
          </div>
        </div>
      )}

       {/* Edit Modal */}
       {editingService && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-lg">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
            <FaTimes className="absolute top-3 right-3 text-xl cursor-pointer" onClick={() => setEditingService(null)} />
            <h3 className="text-xl font-bold">Edit Service</h3>

            <label className="block mt-2">Name:</label>
            <input
              type="text"
              className="w-full border p-2 rounded-lg"
              value={updatedService.name}
              onChange={(e) => setUpdatedService({ ...updatedService, name: e.target.value })}
            />

            <label className="block mt-2">Price:</label>
            <input
              type="number"
              className="w-full border p-2 rounded-lg"
              value={updatedService.price}
              onChange={(e) => setUpdatedService({ ...updatedService, price: e.target.value })}
            />

            <label className="block mt-2">Discount:</label>
            <input
              type="number"
              className="w-full border p-2 rounded-lg"
              value={updatedService.discount}
              onChange={(e) => setUpdatedService({ ...updatedService, discount: e.target.value })}
            />

           <label className="block mt-2">Total Slots:</label>
            <input
              type="number"
              className="w-full border p-2 rounded-lg"
              value={updatedService.slotsLeft}
              onChange={(e) => setUpdatedService({ ...updatedService, slotsLeft: e.target.value })}
            />

            <button className="bg-green-500 text-white px-8 py-2 mt-4 rounded-lg" onClick={handleUpdate}>
              Update
            </button>
          </div>
        </div>
      )}
      <button
        className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition"
        onClick={() => setIsAddEventOpen(true)}
      >
        <FaPlus size={24} />
      </button>
{/* Show AddEvents component when the button is clicked */}
{isAddEventOpen && (
          <div>
            <AddEvents />
          </div>    
      )}
    </div>
  );
};

export default GetEvents;
