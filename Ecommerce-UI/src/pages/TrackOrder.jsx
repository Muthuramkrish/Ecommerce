import React, { useState } from 'react';

function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    // Placeholder: integrate with tracking API later
    setStatus('Your order is being processed.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
      <p className="text-gray-600 mb-6">Enter your Order ID to check the latest status.</p>
      <form onSubmit={handleTrack} className="bg-white shadow rounded-lg p-6 flex flex-col sm:flex-row gap-3">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., ORD123456"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Track</button>
      </form>
      {status && (
        <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">{status}</div>
      )}
    </div>
  );
}

export default TrackOrder;


