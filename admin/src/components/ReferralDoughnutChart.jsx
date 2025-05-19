import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444']; // Consistent colors


const ReferralDoughnutChart = () => {
  const [referralData, setReferralData] = useState([]);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/view');
      const bookings = res.data;
      console.log("booking data: ",bookings)
      const sourceCounts = {
        'Social Media': 0,
        'Friend/Family': 0,
        'Search Engine': 0,
        'Other': 0,
      };

      const referralMap = {
        socialmedia: 'Social Media',
        friend: 'Friend/Family',
        searchengine: 'Search Engine',
      };
      
      bookings.forEach(booking => {
        const rawSource = booking.userInfo?.referralSource || 'other';
        const normalizedSource = rawSource.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const matchedSource = referralMap[normalizedSource] || 'Other';
        sourceCounts[matchedSource] += 1;
      });

      const total = Object.values(sourceCounts).reduce((acc, count) => acc + count, 0);

      const formattedData = Object.entries(sourceCounts).map(([source, count]) => ({
        name: source,
        value: total ? Math.round((count / total) * 10000) / 100 : 0
      }));
      

      setReferralData(formattedData);
    } catch (error) {
      console.error("Error fetching referral data:", error);
    }
  };

  return (
    <div className="w-full h-[200px]">
     <h1 className='text-gray-600 mb-2'>Refferal Source Breakdown:</h1>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={referralData}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={80}
          >
            {referralData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value}%`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReferralDoughnutChart;
