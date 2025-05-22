# Event Booking Platform

A full-stack Event Booking system built using the MERN stack with Tailwind CSS for styling. It includes a User Site for event selection and booking, and an Admin Site for managing events, add-ons, bookings, invoices, and integrated analytics.

📌 Project Overview

This platform enables users to:
- Browse events by date
- Select desired events and add-ons
- Enter booking details and make payments

Meanwhile, the admin panel allows:
- Full CRUD operations on events and add-ons
- Real-time booking analytics and transaction history
- Flexible payment gateway integration
- Invoice customization
- Confirmation via email and WhatsApp

🛠️ Tech Stack
- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Styling: Tailwind CSS
- Integrations:
  - Email & WhatsApp messaging
  - Dynamic Payment Gateway support (PhonePe, PayU, Paypal, Razorpay etc.)
  - Invoice generation with selectable templates


🌟 Key Features:

👤 User Site: 

    📅 Date Picker for Selecting Event Date

    🎉 Browse and Select Events

    ➕ Choose Add-Ons

    🧾 Checkout and Enter Personal Details

    💳 Make Payments via Configured Gateway

    ✅ Receive Confirmation via Email & WhatsApp (with invoice attached)

🛠️ Admin Site:

    🔐 Admin Login

    📊 Dashboard with Analytics (total bookings, earnings, monthly charts)

    📝 Manage Events (Create, Read, Update, Delete)

    🧩 Manage Add-Ons (Create, Read, Update, Delete)

    📚 Booking History with Export to Excel

    💼 Payment Gateway Configuration

    💸 View Transaction Records

    🧾 Select Invoice Templates and Auto-generate Invoices

    👤 Admin Profile Management

⚙️ Setup Instructions:
1. Clone the Repo:

       git clone https://github.com/your-username/event-booking.git
       cd event-booking

3. Install Dependencies:
   
       npm install

5. Run the Application
   Frontend (User/Admin):
                                                                                                                                                                   
       npm run dev
   
   Backend:
                                                                                                                                                                      
       npm start

🌐 App Routes & Pages:

🧑‍💻 User Site (http://localhost:5173)

    /calendar → Calendar Page to select date

    /services → Event Selection Page with add-ons

    /userdetails → Checkout Page (user fills booking details)

    /pay → Payment Page (make payment and confirm)

    /payment-success → Payment success Page (make payment and confirm)

    /payment-failure → Payment failure Page (make payment and confirm)

👨‍💼 Admin Site (http://localhost:5174)
  
    /login → Admin Login

    /dashboard → Dashboard with booking stats and charts

    /events → Manage Events (CRUD)

    /add-ons → Manage Add-Ons (CRUD)

    /history → View Booking History (Downloadable as Excel)

    /payment → Configure Payment Gateway

    /transaction → View Transactions and Invoices

    /select-invoice → Choose Invoice Templates

    /profile → Update Admin Profile

📬 Communication Features: 

✉️ Confirmation Email with Invoice

💬 WhatsApp Message after Successful Booking

📄 License:

This project is licensed under the MIT License.
