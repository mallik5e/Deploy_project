import axios from 'axios'
import crypto from 'crypto'
import uniqid from 'uniqid'
import sha256 from 'sha256'
import PayU from 'payu-websdk'
import dotenv from 'dotenv'
import Razorpay from 'razorpay'
//import paypal from 'paypal-rest-sdk'
import paypal from "@paypal/checkout-server-sdk";
import paymentGateway from '../models/paymentGatewayModel.js'
//import express from "express";
//import PaymentGateway from "../models/paymentGatewayModel.js";


const PAYU_BASE_URL = 'https://test.payu.in/_payment';
//initiate payu payment
const payment = async (req, res) => {
    try {
        const { txnId, amount, productInfo, firstName, email, phone } = req.body;

        const key = process.env.MERCHANT_KEY; // PayU Merchant Key
        const salt = process.env.MERCHANT_SALT; // PayU Salt

        const data = {
            key,
            txnid: txnId,
            amount,
            currency: 'INR',
            productinfo: productInfo,
            firstname: firstName,
            email,
            phone,
            surl: `http://localhost:5000/api/user/verify/${txnId}`, // Success URL
            furl: `http://localhost:5000/api/user/verify/${txnId}`, // Failure URL
            udf1: 'custom1',
            udf2: '',
            udf3: '',
            udf4: '',
            udf5: '',
        };

        // **EXACT FORMAT FOR HASH STRING (PayU Formula)**
        const hashString = `${key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1}|${data.udf2}|${data.udf3}|${data.udf4}|${data.udf5}||||||${salt}`;

        console.log('Hash String:', hashString); // Debug: Check if hashString is correct

        // Hashing the string using SHA512
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');

        console.log('Generated Hash:', hash); // Debug: Check if hash matches PayU’s expected value

        data.hash = hash;

        res.json({
            url: PAYU_BASE_URL,
            payUData: data,
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).send({ error: 'Something went wrong' });
    }
};


//verify status of payu payment
const verifyStatus = (req, res) => {
    console.log(req.body);
    const { status, txnid } = req.body; // message comes from PayU response
  
    if (status === 'success') {
        const message = encodeURIComponent('Transaction successful');
        res.redirect(`http://localhost:5173/success?message=${message}`);
      } else {
        const message = encodeURIComponent('Transaction failed');
        res.redirect(`http://localhost:5173/failure?message=${message}`);
      }

  };
  

  const PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/hermes";
  const PHONEPE_MERCHANT_ID = "PGTESTPAYUAT86";
  const PHONEPE_SALT_KEY = "96434309-7796-489d-8924-ab56988a6076";
  const PHONEPE_SALT_INDEX = 1;
  
  //initiate phonepe payment
  const initiatePayment = async (req, res) => {
    const merchantTransactionId = uniqid();
    console.log("merchantTransactionId",merchantTransactionId);
    try {
      const { totalAmount, orderId } = req.body;
      console.log("totalAmount:",totalAmount);
      if (!totalAmount) {
        return res.status(400).json({ error: "Missing amount" });
      }
  
      if (!orderId) {
        return res.status(400).json({ error: "Missing orderId" });
      }
      
  
      const payload = {
        merchantId: PHONEPE_MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,  // ✅ Ensure correct key name
        amount: totalAmount * 100,
        mobileNumber: "9999999999",
        redirectUrl:`http://localhost:5000/api/user/payment-status/${merchantTransactionId}`,
        redirectMode:'POST',
        paymentInstrument: { type: "PAY_PAGE" }
      };
      
  
      // Convert payload to base64 payload because phonepe allow request formate: xVerify = base64 payload + "/pg/v1/pay" + PHONEPE_SALT_KEY + "###" + PHONEPE_SALT_INDEX;
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  
      const apiEndpoint = "/pg/v1/pay";
      const stringToSign = base64Payload + apiEndpoint + PHONEPE_SALT_KEY;
      const xVerify = crypto.createHash("sha256").update(stringToSign).digest("hex") + "###" + PHONEPE_SALT_INDEX;
  
      // Send Payment Request to phonepe gateway
      const response = await axios.post(`${PHONEPE_BASE_URL}${apiEndpoint}`, 
        { request: base64Payload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
            "X-MERCHANT-ID": PHONEPE_MERCHANT_ID,
          },
        }
      );
      console.log("response.data: ",response.data)
      res.json(response.data);
    } catch (error) {
      console.error("Error initiating payment:", error?.response?.data || error.message);
      res.status(500).json({ success: false, message: "Payment initiation failed", error: error?.response?.data || error.message });
    }
  };

  const generateXVerify = (txnId) => {
    const apiEndpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${txnId}`;
    const stringToSign = apiEndpoint + PHONEPE_SALT_KEY;
    return crypto.createHash("sha256").update(stringToSign).digest("hex") + "###" + PHONEPE_SALT_INDEX;
  };
  
//verify phonepe payment status
const phonepeStatus = async (req, res) => {

    console.log("after payment",req.body)
    const txnId = req.params.id;
    console.log("txnId: ",txnId);
    try {
        const xVerify = generateXVerify(txnId);
        // Call PhonePe's transaction status API to verify the payment
        const statusResponse = await axios.get(
            `${PHONEPE_BASE_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${txnId}`,//passing our merchant_id and transactionId to check status of our payment from phonepe
            { 
                headers: {
                    "Content-Type": "application/json",
                    "X-VERIFY": xVerify, // Required
                    "X-MERCHANT-ID": PHONEPE_MERCHANT_ID, // Optional (not required)
                },
            }
        );
        ;
        console.log("statusResponse: ",statusResponse)

        // If payment was successful, redirect the user to success page
        const data = statusResponse.data;

        if (data.success && data.code === "PAYMENT_SUCCESS" && data.data.state === "COMPLETED") {
            return res.redirect(`http://localhost:5173/success?txnId=${txnId}`);
        } else {
            return res.redirect(`http://localhost:5173/failure?txnId=${txnId}`);
        }
    } catch (error) {
        console.error("Error verifying transaction:", error);
        return res.redirect(`http://localhost:5173/failure?txnId=${txnId}`);
    }
};

const RAZORPAY_KEY_ID = "rzp_test_NYnGqqT5u8zO5w";
const RAZORPAY_SECRET = "iAUdtSYSrnN2S03FNgj1zqdZ";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_SECRET,
});

// Create an order for Razorpay to initiate payment
const initiateRazorpay = async (req, res) => {
  try {
    const { totalAmount, currency } = req.body; // Amount in INR (e.g., 500 for ₹500)
    const options = {
      amount: totalAmount * 100, // Convert to paisa
      currency,
      //receipt: `order_rcpt_${Date.now()}`,//creating an unique orderId for transaction.
    };

    const order = await razorpay.orders.create(options);
    console.log(order)
    res.json(order);//send orderId to make payment
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Verify payment signature
const verifyRazorpay = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256",RAZORPAY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const txnId = razorpay_payment_id;
      return res.json({
        success: true,
        redirectUrl: `http://localhost:5173/success?txnId=${txnId}`,
      });
      
    } else {
      const txnId = razorpay_payment_id;
      res.status(400).json({ success: false, redirectUrl: `http://localhost:5173/failure?txnId=${txnId}` });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

const PAYPAL_CLIENT_ID = "AcTtMI_v0RIygl-hsTZM-5_t3z6nCMQO-0I9grONnEtHGXFvnn714CrUWbL9LFYi9m9YtIAY2znU5DJI"
const PAYPAL_CLIENT_SECRET = "EF_M4bpzA6TyialK2IoO4t6MhednkrcTDu6Wn-V6NbgBy6jl4DHdCkxatOX4SVccAESt3jTgWBejHlKl"
const PAYPAL_MODE = "sandbox"  // Use "live" for production


// ✅ Set Up Environment (Sandbox or Live)
const environment = new paypal.core.SandboxEnvironment(
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET
);

// ✅ Create PayPal Client
const client = new paypal.core.PayPalHttpClient(environment);


// ✅ Create a PayPal Order
const initiatePaypal = async (req, res) => {
  console.log("Getting into initiatePaypal")
  const { totalAmount } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: { currency_code: "USD",  value: Number(totalAmount).toFixed(2)},
        description: "Event Booking Payment",
      },
    ],
    application_context: {
      brand_name: "My Event Booking",
      landing_page: "BILLING",
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
      return_url: `http://localhost:5000/api/user/execute-payment`,
      cancel_url: `http://localhost:5173/cancel`,


    },
  });  

  try {
    const response = await client.execute(request);
    const approvalUrl = response.result.links.find((link) => link.rel === "approve")?.href;

    console.log("approvalUrl: ",approvalUrl)
    
    if (!approvalUrl) {
      throw new Error("Approval URL not found in PayPal response.");
    }
    res.json({ approvalUrl });
  } catch (error) {
    console.error("PayPal Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Capture PayPal Payment and Redirect to Frontend
const executePaypalPayment = async (req, res) => {
  const orderID = req.query.token; // PayPal sends ?token=ORDER_ID
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const response = await client.execute(request);
    const txnId = response.result.id;

    // Redirect user to success page on frontend
    res.redirect(`http://localhost:5173/success?txnId=${txnId}`);
  } catch (error) {
    console.error("Error:", error);
    res.redirect(`http://localhost:5173/failure?txnId=${orderID}`);
  }
};

export {initiatePayment,phonepeStatus,initiateRazorpay, verifyRazorpay, initiatePaypal, executePaypalPayment, payment,verifyStatus}