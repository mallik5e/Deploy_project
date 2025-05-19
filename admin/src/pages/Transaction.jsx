import React, { useState, useEffect } from "react";
import { IoMdDownload } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { RxReader } from "react-icons/rx";
import axios from "axios";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceTemplate,setInvoiceTemplate] = useState("")

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/admin/view");
        const data = response.data;
        const successfulPayments = data.filter(transaction => transaction.paymentStatus === "success");
        setTransactions(successfulPayments);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

   useEffect(() => {
           axios
             .get("http://localhost:5000/api/admin/get-invoiceinfo")
             .then((response) => {
               const template = (response.data.invoice.invoiceTemplate);
               setInvoiceTemplate(template);
             })
             .catch((error) => {
               console.error("Error fetching invoice:", error);
             });
         }, []);

  const navigate = useNavigate();

  const handleRead = (transaction) => {
    //navigate("/invoice", { state: { transaction } });
    console.log("transaction: ",transaction)
    switch (invoiceTemplate) {
          case "template1":
           navigate(`/invoice-temp1/${transaction._id}`);
            break;
          case "template2":
             navigate(`/invoice-temp2/${transaction._id}`);
            break;
          case "template3":
             navigate(`/invoice-temp3/${transaction._id}`);
            break;
          case "template4":
             navigate(`/invoice-temp4/${transaction._id}`);
            break;
          case "template":
             navigate(`/invoice-temp5/${transaction._id}`);
            break;
          default:
            return;
        }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction?.userInfo?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction?.userInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-8 p-4">
      <div className="flex justify-between">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Transaction Details</h3>

        <div className="w-1/2 mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="px-4 py-2 border rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* {loading && <p className="text-center text-gray-500">Loading...</p>} */}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-indigo-500 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Amount Paid</th> 
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              [...filteredTransactions]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Latest first
              .map((transaction, index) => (
                <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                  <td className="px-6 py-4">{transaction.userInfo.fullName}</td>
                  <td className="px-6 py-4">{transaction.userInfo.email}</td>
                 <td className="px-6 py-4">₹{transaction.priceSummary.totalAmount ? transaction.priceSummary.totalAmount : 1490}.00</td> 
                  <td className="px-6 py-4 text-green-500 font-medium">Success</td>
                  <td className="px-7 py-4">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleRead(transaction)}
                    >
                      <RxReader size={24} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
                <tr>   
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                <div className="flex justify-center items-center py-10">
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xl font-semibold text-gray-400"></span>
            </div>
                </td>
              </tr> 
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transaction;
