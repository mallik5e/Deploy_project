import { useState, useEffect } from 'react';
import { useEvent } from '../context/EventContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoClose } from "react-icons/io5";

const AddEvent = () => {
    const { categories, addNewCategory, addEvent } = useEvent();
    const [category, setCategory] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [option, setOption] = useState({ name: '', price: '', slotsLeft: '', discount: '', description: '',selectionType: '' });
    const [selectionType, setSelectionType] = useState('checkbox');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (newCategory && categories.some(cat => cat.category === newCategory)) {
            setCategory(newCategory);
            setNewCategory('');
        }
    }, [categories, newCategory]);

    const handleNewCategoryInputChange = (e) => {
        setNewCategory(e.target.value);
    };

    const handleAddNewCategory = async () => {
        if (newCategory.trim() !== '') {
            try {
                const newCat = await addNewCategory(newCategory);
                setCategory(newCat.category);
                setShowNewCategoryInput(false);
                setNewCategory('');
                window.location.reload(); // Force page refresh to immediately show new category
            } catch (error) {
                console.error('Error adding new category:', error);
            }
        }
    };

    const handleCategorySelectChange = (e) => {
        const { value } = e.target;
        if (value === 'Add New') {
            setShowNewCategoryInput(true);
        } else {
            setCategory(value);
            setShowNewCategoryInput(false);
        }
    };

    const handleOptionChange = (field, value) => {
        setOption(prevOption => ({ ...prevOption, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const eventData = { category, selectionType, options: [option] };
        try {
            await addEvent(eventData);
            setCategory('');
            setSelectionType('checkbox');
            setOption({ name: '', price: '', slotsLeft: '', discount: '', description: '',selectionType: '' });
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        window.location.reload();
      };
    

    return (
        <div>
       {
        isVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-lg">
            <div className="relative max-w-150 max-h-170 mx-auto bg-white p-3 sm:p-8 rounded-2xl shadow-xl mt-0 ">
            <IoClose size={30} className="absolute right-2 top-2 cursor-pointer text-gray-600 hover:text-red-500" onClick={handleClose}/>
           <h2 className="text-2xl font-bold mb-6 text-center">Add New Event</h2>
           <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                   <label className="block text-lg font-medium mb-2">Select Category: </label>
                   <select
                       required
                       className="w-full p-3 border rounded-lg"
                       name="category"
                       onChange={handleCategorySelectChange}
                       value={category}
                   >
                       <option value="" className="bg-blue-500 text-white" disabled>Select a category</option>
                       {categories.map((cat, index) => (
                           <option key={cat._id || `${cat.category}-${index}`} value={cat.category} className="text-[8px] md:text-[12px] font-semibold">
                               {cat.category}
                           </option>
                       ))}
                       <option className='bg-gray-300 p-2' value="Add New">Add New Category</option>
                   </select>

                   {showNewCategoryInput && (
                       <div className="mt-4 flex">
                           <input
                               type="text"
                               className="flex-grow p-3 border rounded-l-md"
                               placeholder="Enter New Category"
                               value={newCategory}
                               onChange={handleNewCategoryInputChange}
                           />
                           <button
                               type="button"
                               onClick={handleAddNewCategory}
                               className="bg-blue-500 text-white px-6 py-3 rounded-r-md"
                           >
                               Add
                           </button>
                       </div>
                   )}
               </div>
               <h3 className="text-lg font-semibold">Event Details: </h3>
               <div className="grid grid-cols-1 gap-4">
                   <input
                       type="text"
                       placeholder="Event Name..."
                       value={option.name}
                       onChange={(e) => handleOptionChange('name', e.target.value)}
                       className="w-full p-3 border rounded-lg"
                       required
                   />
                   <input
                       type="number"
                       placeholder="Price"
                       value={option.price}
                       onChange={(e) => handleOptionChange('price', e.target.value)}
                       className="w-full p-3 border rounded-lg"
                       required
                   />
                   <div className="grid grid-cols-2 gap-4">
                       <input
                           type="number"
                           placeholder="Discount"
                           value={option.discount}
                           onChange={(e) => handleOptionChange('discount', e.target.value)}
                           className="w-full p-3 border rounded-lg"
                       />
                       <input
                           type="number"
                           placeholder="Slots Left"
                           value={option.slotsLeft}
                           onChange={(e) => handleOptionChange('slotsLeft', e.target.value)}
                           className="w-full p-3 border rounded-lg"
                           required
                       />
                   </div>
                     <div>
                   <label className="block text-lg font-medium mb-2">Selection Type:</label>
                   <select
   required
   className="w-full p-3 border rounded-lg"
   value={option.selectionType}
   onChange={(e) => handleOptionChange('selectionType', e.target.value)}
>
<option value="">Select a type</option>
   <option value="checkbox">Checkbox</option>
   <option value="quantitySelector">Quantity Selector</option>
     </select>

               </div>
                   <textarea
                       placeholder="Description (optional)"
                       value={option.description}
                       onChange={(e) => handleOptionChange('description', e.target.value)}
                       className="w-full p-3 border rounded-lg"
                   />
               </div>
               <button type="submit" className="w-full bg-blue-500 text-white text-lg font-semibold px-4 py-3 rounded-lg hover:bg-green-600">Create Event</button>
           </form>
       </div>
       </div>
        )
       }
       </div>
    );
};

export default AddEvent;
