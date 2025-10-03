import React from 'react';

function HelpCenter() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Help Center & FAQs</h1>
      <p className="text-gray-600 mb-6">Find answers to common questions about orders, payments, and products.</p>
      <div className="bg-white shadow rounded-lg p-6">
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>How do I place an order?</li>
          <li>What payment methods are accepted?</li>
          <li>How can I contact support?</li>
        </ul>
      </div>
    </div>
  );
}

export default HelpCenter;


