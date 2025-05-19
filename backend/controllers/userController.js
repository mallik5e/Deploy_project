import Booking from "../models/userModel.js";
import Event from "../models/eventModel.js";
import AddOn from "../models/addonModel.js";
import PaymentGateway from "../models/paymentGatewayModel.js";
import SiteVisit from "../models/sitevisitModel.js";
//import axios from 'axios'
//import crypto from 'crypto'
//import uniqid from 'uniqid'
//import sha256 from 'sha256'
//import PayU from 'payu-websdk'
//import dotenv from 'dotenv'
//import Razorpay from 'razorpay'
//import paypal from 'paypal-rest-sdk'
//import paypal from "@paypal/checkout-server-sdk";
//import express from "express";


// Increment visit
const countVisits = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    let siteVisit = await SiteVisit.findOne();

    if (!siteVisit) {
      // First time setup
      siteVisit = new SiteVisit({
        visits: 1,
        prevVisits: 0,
        lastVisitMonth: currentMonth,
      });
    } else {
      if (siteVisit.lastVisitMonth !== currentMonth) {
        // Month has changed
        siteVisit.prevVisits = siteVisit.visits;
        siteVisit.visits = 1;
        siteVisit.lastVisitMonth = currentMonth;
      } else {
        // Same month, increment
        siteVisit.visits += 1;
      }
    }

    await siteVisit.save();

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Decrement visit
const updateVisits = async (req, res) => {
  try {

    let siteVisit = await SiteVisit.findOne();
      
    // Decrement
    siteVisit.visits -= 1;

    await siteVisit.save();

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// User Controller: Book an Event
const bookingEvent = async (req, res) => {
    try {
        const { selectedDate, services, addOns, userInfo, priceSummary, paymentStatus } = req.body;
        //console.log(req.body);
        //console.log("user information: ",userInfo)
        console.log("incoming request service: ",services)
        
        if (!services || services.length === 0) {
            return res.status(400).json({ message: 'No services selected' });
        }

        const updatedServices = [];

      for (const service of services) {
            //console.log("service: ",service)
            const event = await Event.findOne({ 'options._id': service._id });//find event, which has service with this service._id
            //console.log("event: ",event)
            if (!event) {
                return res.status(404).json({ message: `Event not found for service: ${service.name}` });
            }

            const option = event.options.find(opt => opt._id.toString() === service._id);//inside extracted event, find service with this service._id
            //console.log("option: ",option)
            if (!option) {
                return res.status(404).json({ message: `Option not found for service: ${service.name}` });
            }

              if (!option.slotsByDate) {
                option.slotsByDate = new Map(); // Initialize if it's undefined, initialize map to store slots by date in service.
            }

            const currentSlots = option.slotsByDate.get(selectedDate) ?? option.slotsLeft;//get available number of slots in service for specific date
            console.log("currentSlots: ",currentSlots)
            if (currentSlots < service.quantity) {
                return res.status(400).json({ message: `Not enough slots available for service on ${selectedDate}: ${service.name}` });
            }

          {/*  option.slotsByDate.set(selectedDate, currentSlots - service.quantity);
            event.markModified('options');//make mark for update
            console.log("final event: ",event)
            await event.save();//save updated event with service*/}

            // ✅ Add eventId to service
            updatedServices.push({
                ...service,
                eventId: event._id, // Attach eventId
            });
        }

        // ✅ Create a new booking with eventId included
        const newBooking = new Booking({
            selectedDate,
            services: updatedServices, // Save updated services with eventId
            addOns,
            userInfo,
            priceSummary,
            paymentStatus,
        });

        console.log("After Update Booking with eventId : ",newBooking);

        await newBooking.save();

        res.status(201).json({ bookingId: newBooking._id });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).send('Error saving booking');
    }
};


// Update payment status on booking after payment
const updatePaymentStatus = async (req, res) => {
    console.log('entering to updatePaymentStatus',req.body)
    const { bookingId } = req.params;
    const { paymentStatus,selectedDate,services } = req.body;
  
    try {
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { paymentStatus },
        { new: true }
      );
  
      if (!updatedBooking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      for (const service of services) {
        //console.log("service: ",service)
        const event = await Event.findOne({ 'options._id': service._id });//find event, which has service with this service._id
        //console.log("event: ",event)
        if (!event) {
            return res.status(404).json({ message: `Event not found for service: ${service.name}` });
        }

        const option = event.options.find(opt => opt._id.toString() === service._id);//inside extracted event, find service with this service._id
        //console.log("option: ",option)
        if (!option) {
            return res.status(404).json({ message: `Option not found for service: ${service.name}` });
        }

        if (!option.slotsByDate) {
            option.slotsByDate = new Map(); // Initialize if it's undefined, initialize map to store slots by date in service.
        }

        const currentSlots = option.slotsByDate.get(selectedDate) ?? option.slotsLeft;//get available number of slots in service for specific date
        //console.log("currentSlots: ",currentSlots)
        if (currentSlots < service.quantity) {
            return res.status(400).json({ message: `Not enough slots available for service on ${selectedDate}: ${service.name}` });
        }

        option.slotsByDate.set(selectedDate, currentSlots - service.quantity);
        event.markModified('options');//make mark for update
        await event.save();//save updated event with service
    }

      console.log("Payment status updated successfully")
      res.status(200).json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

  



// User Controller: Get Event Slots for a Date
const getEventSlots = async (req, res) => {
  try {
      const { eventId, date } = req.params;
      const event = await Event.findById(eventId);

      if (!event) {
          return res.status(404).json({ message: 'Event not found' });
      }

      const slots = event.options.map(option => ({
          name: option.name,
          slotsLeft: option.slotsByDate?.[date] ?? option.slotsLeft
      }));

      res.status(200).json(slots);
  } catch (error) {
      console.error('Error fetching event slots:', error);
      res.status(500).send('Error fetching event slots');
  }
};
  


const getEvents = async (req,res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

//get AddOn
const getAddOn =  async (req, res) => {
  try {
    const addOns = await AddOn.find();
    res.json(addOns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const activeGatewayInUser = async (req, res) => {
  console.log("enter into activeGateway")
  try {
    const activeGateway = await PaymentGateway.findOne();
    console.log("activeGateway",activeGateway)
    console.log("activeGateway name: ",activeGateway.gateway)
    if (!activeGateway) {
      return res.json({ gateway: null });
    }
    res.json({ gateway: activeGateway.gateway }); // Send only the gateway name
  } catch (error) {
    res.status(500).json({ message: "Error fetching active gateway", error });
  }
};


const makePaymentToGateway = async (req, res) => {
  const { amount, userId } = req.body;

  try {
    const activeGateway = await PaymentGateway.findOne();
    if (!activeGateway) return res.status(400).json({ message: "No active gateway enabled" });

    let paymentResponse;

    if (activeGateway.gateway === "Razorpay") {
      paymentResponse = await processRazorpayPayment(amount, activeGateway.apiKey, activeGateway.secretKey);
    } else if (activeGateway.gateway === "PayU") {
      paymentResponse = await processPayUPayment(amount, activeGateway.apiKey, activeGateway.secretKey);
    }
    
    res.json(paymentResponse);
  } catch (error) {
    res.status(500).json({ message: "Payment processing error", error });
  }
};

export {bookingEvent,getEvents,getEventSlots,getAddOn,updatePaymentStatus,makePaymentToGateway,activeGatewayInUser, countVisits,updateVisits}