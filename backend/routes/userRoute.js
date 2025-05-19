import express from 'express'
import { bookingEvent,getEvents,getEventSlots,getAddOn,activeGatewayInUser,updatePaymentStatus,countVisits,updateVisits} from '../controllers/userController.js'
import {initiatePayment,phonepeStatus,initiateRazorpay, verifyRazorpay, initiatePaypal, executePaypalPayment, payment,verifyStatus} from '../controllers/paymentController.js'

const userRouter = express.Router()

userRouter.post('/visit',countVisits)
userRouter.put('update-count',updateVisits)

userRouter.post('/booking',bookingEvent)
userRouter.get('/get-event',getEvents)
userRouter.get('/event-slots/:eventId/:date', getEventSlots)
userRouter.get('/getAddOn',getAddOn)

//payment
userRouter.post('/pay',payment)
userRouter.post('/verify/:txnid',verifyStatus)


//phonepe
userRouter.post('/initiate-payment',initiatePayment)
userRouter.post('/payment-status/:id',phonepeStatus)

//razorpay
userRouter.post("/create-order",initiateRazorpay)
userRouter.post("/verify-payment",verifyRazorpay)

//paypal
userRouter.post('/create-payment',initiatePaypal)
userRouter.get('/execute-payment', executePaypalPayment);

userRouter.get('/active-gateway',activeGatewayInUser)

userRouter.put('/bookings/:bookingId/payment-status',updatePaymentStatus)

export default userRouter