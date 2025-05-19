import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoClose } from "react-icons/io5";

const AddOn = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/createAddOn",
        formData
      );
      console.log(response.data);
      console.log("Submitted Data:", formData);
      toast.success("Service added successfully!");
      setFormData({ name: "", price: "", description: "" });
    } catch (error) {
      toast.error("Failed to add service. Please try again.");
      console.error("Error submitting data:", error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    window.location.reload();
  };

  return (
    <div>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-lg">
          <div className="relative bg-white p-6 shadow-md rounded-lg w-96">
            {/* Close Icon positioned inside the card */}
            <IoClose
              size={30}
              className="absolute right-2 top-2 cursor-pointer text-gray-600 hover:text-red-500"
              onClick={handleClose}
            />
            <h2 className="text-2xl font-bold mb-4 text-center">
              Create Add-On
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Submit
              </button>
            </form>
          </div>
          {/* Toast Notification Container */}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      )}
    </div>
  );
};

export default AddOn;
