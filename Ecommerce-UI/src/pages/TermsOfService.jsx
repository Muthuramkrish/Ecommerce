import React from 'react';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">Terms of Service</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: September 25, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Vikoshiya Technologies website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vikoshiya Technologies provides an online platform for purchasing high-quality electrical products. Our services include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Product catalog browsing and search functionality</li>
                <li>Online ordering and payment processing</li>
                <li>Customer support and technical assistance</li>
                <li>Order tracking and delivery services</li>
                <li>Warranty and return management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Account</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features of our service, you may be required to create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Promptly update account information to keep it accurate</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Orders and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When placing an order through our website:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All orders are subject to acceptance and availability</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be made in full before order processing</li>
                <li>We reserve the right to refuse or cancel orders in our sole discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Shipping and Delivery</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Delivery terms and conditions:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Risk of loss passes to you upon delivery</li>
                <li>Shipping costs are calculated at checkout</li>
                <li>Delivery is available within India as specified at checkout</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Returns and Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our return policy includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Returns must be initiated within 30 days of delivery</li>
                <li>Products must be in original condition and packaging</li>
                <li>Refunds will be processed within 7-10 business days</li>
                <li>Customer is responsible for return shipping costs unless the item is defective</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Product Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                All products sold through Vikoshiya Technologies come with manufacturer warranties as specified in the product descriptions. We will assist in warranty claims and provide support for covered defects and issues.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Vikoshiya Technologies shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The service and its original content, features, and functionality are and will remain the exclusive property of Vikoshiya Technologies and its licensors. The service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> support@vikoshiya.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +91 1234567890</p>
                <p className="text-gray-700"><strong>Address:</strong> Virudhunagar, Tamil Nadu, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;