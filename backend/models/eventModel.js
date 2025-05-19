import mongoose from 'mongoose'

const optionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    slotsLeft: { type: Number, required: true },
    slotsByDate: { type: Map, of: Number }, // Add this to track slots by date
    selectionType: { 
        type: String, 
        enum: ['checkbox', 'quantitySelector'], // Restrict possible values
        required: true 
    }
});

const eventSchema = new mongoose.Schema({
    category: { type: String, required: true },
    options: [optionSchema]
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
