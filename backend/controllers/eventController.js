import Event from "../models/eventModel.js";

// Admin Controller: Add or Update Events
const addEvents = async (req, res) => {
    console.log("receieved data from user",req.body)
      try {
          const { category, options } = req.body;
  
          if (!category) {
              return res.status(400).json({ error: 'Category is required' });
          }
  
          let event = await Event.findOne({ category });
  
          if (!event) {
              // Create new event category if it doesn't exist
              event = new Event({ category, options: options || [] });
          } else if (options && Array.isArray(options)) {
              for (const option of options) {
                  const existingOption = event.options.find(opt => opt.name === option.name);
                  if (existingOption) {
                      return res.status(400).json({ error: `Option with name '${option.name}' already exists in this category` });
                  }
                  event.options.push(option);
              }
          }
  
          await event.save();
          res.status(201).json({ message: 'Event added/updated successfully', event });
      } catch (error) {
          console.error('Error adding/updating event:', error);
          res.status(500).json({ error: 'Internal server error' });
      }
  };
  
   // Get all Events
   const viewEvents =  async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const viewOneEvent = async(req,res) => {
    try {
      const { serviceId } = req.params;
      const event = await Event.findOne({ "options._id": serviceId });
  
      if (!event) {
        return res.status(404).json({ error: "Service not found" });
      }
  
      // Extract the specific service
      const service = event.options.find((s) => s._id.toString() === serviceId);
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Error fetching service details" });
    }
  }
  
  
  const updateEvent = async (req, res) => { 
    try {
        console.log("Received request body: ", req.body); //Check if request is received
  
        const { categoryId, _id, name, price, discount, slotsLeft } = req.body;
  
        if (!categoryId || !_id) {
            console.log("Missing categoryId or _id!");
            return res.status(400).json({ error: 'Category ID and option ID are required' });
        }
  
        const event = await Event.findOne({ _id: categoryId });
        console.log("Found Event:", event); //Check if event is found in the category
  
        if (!event) {
            console.log("🚨 Event not found!");
            return res.status(404).json({ error: 'Event not found' });
        }
  
        const option = event.options.find(opt => opt._id.toString() === _id.toString());
        console.log("Found Option:", option); // if event is found, Get that specific event
  
        if (!option) {
            console.log("🚨 Option not found!");
            return res.status(404).json({ error: 'Option not found' });
        }
  
        // Update only if values exist
        if (name !== undefined) {
          console.log("Updating service name...");
          option.name = name;
      }
        if (price !== undefined) {
            console.log("Updating price...");
            option.price = Number(price);
        }
        if (discount !== undefined) {
            console.log("Updating discount...");
            option.discount = discount;
        }
        if (slotsLeft !== undefined) {
            console.log("Updating slotsLeft...");
            option.slotsLeft = slotsLeft;
        }
  
        console.log("Updated Option:", option); //Check if option is updated
  
        event.markModified("options");
        await event.save();
  
        console.log("Successfully saved changes to database!"); //Confirm save
  
        res.status(200).json({ message: 'Option updated successfully', updatedOption: option });
    } catch (error) {
        console.error('Error updating option:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const deleteEvent = async (req, res) => { 
    
    try {
        console.log("Received request body:", req.body); 
  
        const { categoryId, _id } = req.body;
  
        if (!categoryId || !_id) {
            console.log("Missing categoryId or _id!");
            return res.status(400).json({ error: 'Category ID and option ID are required' });
        }
  
        const event = await Event.findOne({ _id: categoryId });
        console.log("Found Event:", event); 
  
        if (!event) {
            console.log("Event not found!");
            return res.status(404).json({ error: 'Event not found' });
        }
  
        const initialLength = event.options.length;
        
        // Remove the option from the array
        event.options = event.options.filter(opt => opt._id.toString() !== _id.toString());
        
        if (event.options.length === initialLength) {
            console.log("🚨 Option not found!");
            return res.status(404).json({ error: 'Option not found' });
        }
  
        console.log("Option removed successfully");
  
        event.markModified("options");
        await event.save();
  
        console.log("Successfully saved changes to database!"); 
  
        res.status(200).json({ message: 'Option deleted successfully' });
    } catch (error) {
        console.error('Error deleting option:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };
  
export {addEvents,viewEvents,viewOneEvent,updateEvent,deleteEvent}