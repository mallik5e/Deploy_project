import React from 'react'
import { RxCross1 } from "react-icons/rx";
import { HiXCircle } from "react-icons/hi";

const PaymentFailure = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
    <div className="bg-red-200 shadow-lg rounded-2xl m-1 p-6 md:p-28 flex flex-col items-center">
      <RxCross1 className="text-red-500 w-26 h-26 mb-4" />
      <h1 className="text-4xl font-bold text-red-600">Failed</h1>
      <p className="text-xl font-bold text-gray-700 mt-3">Payment Wasn't Successful</p>
      <a
        href="/"
        className="mt-6 px-6 py-2 bg-green-500 text-white rounded-full text-lg font-medium hover:bg-green-600 transition"
      >
        Go to Homepage
      </a>
      <p className='mt-3 text-md font-semibold'><span className='text-red-500 text-xl mt-1'>*</span> We'll reach out to you as soon as possible.</p>
    </div>
  </div>
  )
}

export default PaymentFailure