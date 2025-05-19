import React, { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaEye, FaTrash, FaTimes } from "react-icons/fa";
import AddEvents from '../pages/AddEvents';
import axios from 'axios';
import AddOn from "./AddOn";
import { toast } from "react-toastify";

const GetAddOn = () => {
  const [addOns, setAddOns] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [updatedService, setUpdatedService] = useState({});
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://deploy-project-k4im.onrender.com/api/admin/getAddOn');
        setAddOns(response.data);
      } catch (error) {
        console.error('Failed to fetch add-ons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddOns();
  }, []);

  const handleView = (service) => {
    setSelectedService(service);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setUpdatedService({ ...service });
  };

  const handleUpdate = async () => {
    if (!editingService) {
      toast.error('No service selected for update');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/admin/updateAddOn/${editingService._id}`, updatedService);
      console.log(updatedService)
      setAddOns((prevAddOns) =>
        prevAddOns.map((item) =>
          item._id === editingService._id ? updatedService : item
        )
      );
      setEditingService(null);
      toast.success('Updated Successfully')
    } catch (error) {
      toast.error('Failed to Update')
      console.error('Failed to update:', error);
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/delete/${serviceId}`);
      setAddOns(addOns.filter((item) => item._id !== serviceId));
      toast.success('Deleted Successfully')
    } catch (error) {
      toast.error('Failed to Delete')
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div className="relative md:mx-10 my-4 bg-white shadow-lg rounded-2xl p-6 transition-all duration-300">
      {selectedService && <div className="fixed inset-0 backdrop-blur-md z-40"></div>}

      <h2 className="text-2xl font-bold mb-4">Add-Ons</h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl font-semibold text-gray-400"></span>
        </div>
      ) : addOns.length > 0 ? (
        <div className="space-y-6">
          {addOns.map((service, index) => (
            <div
              key={service._id}
              className="bg-gray-100 p-4 rounded-lg shadow-md transition-all duration-300 border border-gray-300 w-full flex justify-between items-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2 cursor-pointer">
                {service.name}
              </h3>
              <div className="flex gap-3">
                    <FaEye className="text-blue-500 cursor-pointer" onClick={() => handleView(service)} />
                    <FaEdit className="text-green-500 cursor-pointer" onClick={() => handleEdit(service)} />
                    <FaTrash className="text-red-500 cursor-pointer" onClick={() => handleDelete(service._id)} />
                  </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No add-ons found.</p>
      )}

      {/* Modal for Viewing Add-on Details */}
      {selectedService && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative z-50">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
              onClick={() => setSelectedService(null)}
            >
              <FaTimes />
            </button>
            <div className="space-y-3">
              <p><strong>Name:</strong> {selectedService.name}</p>
              <p><strong>Price:</strong> ₹{selectedService.price}</p>
              <p><strong>Description:</strong> {selectedService.description}</p>
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
              value={updatedService.name || ""}
              onChange={(e) => setUpdatedService({ ...updatedService, name: e.target.value })}
            />

            <label className="block mt-2">Price:</label>
            <input
              type="number"
              className="w-full border p-2 rounded-lg"
              value={updatedService.price || ""}
              onChange={(e) => setUpdatedService({ ...updatedService, price: e.target.value })}
            />

            <button className="bg-green-500 text-white px-4 py-2 mt-4 rounded-lg" onClick={handleUpdate}>
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

      {/* Show AddEvents Component */}
      {isAddEventOpen && (
        <div>
          <AddOn />
        </div>
      )}
    </div>
  );
};

export default GetAddOn;
