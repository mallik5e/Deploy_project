import React, { useState, useEffect } from "react";
import axios from "axios";
import Profile from '../assets/profile_pic.png';
import { FaChevronDown } from "react-icons/fa";
import { useEvent } from '../context/EventContext';
import { toast } from "react-toastify";

const MyProfile = () => {
    const [user, setUser] = useState({});
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [activeSection, setActiveSection] = useState("my-profile");
    const [showSaveButton, setShowSaveButton] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const { userData } = useEvent();


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };


    const token = localStorage.getItem('token') ? localStorage.getItem('token')  : false
    console.log("token frontend: ",token)

    useEffect(() => {
      axios.get("http://localhost:5000/api/admin/get-profile",{headers:{token}})
          .then((response) => setUser(response.data.userData))
          .catch((error) => console.error(error));
  }, []);
   

    console.log("user",user);


    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put("/api/profile/change-password", { oldPassword, newPassword });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || "Failed to update password.");
        }
    };
    const email = user.email

    const handleUpdate = async(e) => {
                console.log("clicked")
                try {
                    const response = await axios.put(`http://localhost:5000/api/admin/update-admin/${email}`,user);
              
                    if (response.status === 200) {
                      toast.success('Data Updated Successfully')
                      setShowSaveButton(false); // Hide the Save button after update
                    } 
                  } catch (error) {
                    console.error("Error updating data:", error);
                  }
            }
    
      {/*
        const handleUpload = async () => {
        if (!image) {
          alert("Please select an image!");
          return;
        }
    
        const formData = new FormData();
        formData.append("image", image);
    
        try {
          const response = await axios.post("http://localhost:5000/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
    
          setUploadedImageUrl(response.data.imageUrl);
          alert("Image uploaded successfully!");
        } catch (error) {
          console.error("Upload failed:", error);
          alert("Upload failed!");
        }
      };
        <h2 className="block font-semibold">Company Logo</h2>
                    <div style={{ textAlign: "center", padding: "20px" }}>
      
      <input className="border rounded" type="file" onChange={handleFileChange} accept="image/*" />
      {preview && <img src={preview} alt="Preview" style={{ width: "100px", height:"100px", marginTop: "10px" }} />}
      <button onClick={handleUpload} style={{ display: "block", margin: "10px auto" }}>
        Upload
      </button> */}
     {/* {uploadedImageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={uploadedImageUrl} alt="Uploaded" style={{ width: "300px" }} />
        </div>
      )}
    </div> */}

    return (
        <div className="max-w-md bg-white shadow-lg rounded-xl mx-auto mt-7 p-6">
            <img 
                src={Profile} 
                alt="Profile" 
                className="w-34 h-34 rounded-full object-cover border-2 border-gray-300 shadow-md mx-auto" 
            />
            <h2 className="text-2xl font-bold mb-6 mt-2 text-center">Profile</h2>
            

            {/* Tabs */}
            <div className="flex justify-around mb-4 border-b pb-2">
                <button 
                    className={`px-4 py-2 ${activeSection === "my-profile" ? "font-bold border-b-2 border-blue-500" : "text-gray-500"}`}
                    onClick={() => setActiveSection("my-profile")}
                >
                    My Profile
                </button>
                <button 
                    className={`px-4 py-2 ${activeSection === "company-profile" ? "font-bold border-b-2 border-blue-500" : "text-gray-500"}`}
                    onClick={() => setActiveSection("company-profile")}
                >
                    Company Profile
                </button>
            </div>

            {/* My Profile Section */}
            {activeSection === "my-profile" && (
                <div className="space-y-4 ml-8">
           
                    <p className="text-gray-700 text-lg"><strong>Username: </strong>{user.username}</p>
                    <p className="text-gray-700 text-lg"><strong>Email: </strong>{user.email}</p>
                   <p className="text-gray-700 text-lg"><strong>Password: </strong>********</p>
                    <p className="text-gray-700 text-lg"><strong>Role:</strong> Admin</p>
                       <p className="text-gray-700 text-lg"><strong>Status:</strong> Active</p>
                         <p className="text-gray-700 text-lg"><strong>CreatedAt:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                </div>
            )}

            {/* Company Profile Section */}
            {activeSection === "company-profile" && (
                <div className="mt-5">
                   
                    <label className="block font-semibold">Company Name</label>
                    <input type="text" name="companyName"  value={user?.companyName || ""}  onChange={(e) => setUser({ ...user, companyName: e.target.value })} className="w-full border rounded-lg p-2"  onFocus={() => setShowSaveButton(true)} />
                    
                    <label className="block font-semibold">Company Website</label>
                    <input type="url" name="companyWebsite"  value={user?.companyWebsite || ""}  onChange={(e) => setUser({ ...user, companyWebsite: e.target.value })}  className="w-full text-blue-700 border border-black rounded-lg p-2"   onFocus={() => setShowSaveButton(true)} />
                    
                    <label className="block font-semibold">Company Address</label>
                    <input type="text" name="companyAddress"  value={user?.companyAddress || ""}  onChange={(e) => setUser({ ...user, companyAddress: e.target.value })}  className="w-full border rounded-lg p-2"   onFocus={() => setShowSaveButton(true)} />
                    
                    <label className="block font-semibold">Company Email</label>
                    <input type="email" name="companyEmail"  value={user?.companyEmail || ""}  onChange={(e) => setUser({ ...user, companyEmail: e.target.value })}  className="w-full border rounded-lg p-2"   onFocus={() => setShowSaveButton(true)} />
                    {showSaveButton && (
                 <button
                  className="mt-4  bg-blue-500 text-white px-46 py-2 rounded-lg"
                  onClick={handleUpdate}
                 >
                  Save
                </button>
      )}
                </div>
            )}

            {message && <p className="mt-4 text-center text-red-500 font-medium">{message}</p>}
        </div>
    );
};

export default MyProfile;
