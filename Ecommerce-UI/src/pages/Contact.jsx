import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, Zap } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative h-[85vh] text-white overflow-hidden flex items-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-purple-900/80"></div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 animate-bounce opacity-20">
          <Zap className="w-16 h-16 text-yellow-300" />
        </div>
        <div className="absolute bottom-32 left-20 animate-pulse opacity-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
        </div>

                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
           <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-8">
              <MessageSquare className="w-10 h-10 text-blue-900" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Contact <span className="text-yellow-400">Us</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Have questions about our products or need technical support? We're here to help! 
              Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Phone */}
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-full flex flex-col justify-center group border border-gray-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <Phone className="w-8 h-8 text-green-600 group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Call Us</h3>
              <p className="text-gray-600 text-sm mb-4">Mon - Sat: 9:00 AM - 6:00 PM</p>
              <a href="tel:+911234567890" className="text-green-600 font-semibold hover:text-green-700 transition-colors text-lg">
                +91 1234567890
              </a>
            </div>

            {/* Email */}
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-full flex flex-col justify-center group border border-gray-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <Mail className="w-8 h-8 text-blue-600 group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Email Us</h3>
              <p className="text-gray-600 text-sm mb-4">We'll respond within 24 hours</p>
              <a href="mailto:support@vikoshiya.com" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-lg">
                support@vikoshiya.com
              </a>
            </div>

            {/* Location */}
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-full flex flex-col justify-center group border border-gray-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <MapPin className="w-8 h-8 text-purple-600 group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Visit Us</h3>
              <p className="text-gray-600 text-sm mb-4">Come see our showroom</p>
              <p className="text-purple-600 font-semibold text-lg">
                Virudhunagar, Tamil Nadu, India
              </p>
            </div>

            {/* Support */}
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 h-full flex flex-col justify-center group border border-gray-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <Headphones className="w-8 h-8 text-orange-600 group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Live Support</h3>
              <p className="text-gray-600 text-sm mb-4">Chat with our experts</p>
              <button className="text-orange-600 font-semibold hover:text-orange-700 transition-colors text-lg">
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Contact Form */}
            <div className="order-2 lg:order-1">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-500 hover:border-blue-300 focus:scale-105"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-500 hover:border-blue-300 focus:scale-105"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-500 hover:border-blue-300 focus:scale-105"
                      placeholder="+91 1234567890"
                    />
                  </div>
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-500 hover:border-blue-300 focus:scale-105"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="product">Product Information</option>
                      <option value="technical">Technical Support</option>
                      <option value="business">Business Partnership</option>
                      <option value="complaint">Complaint</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                    placeholder="Please provide detailed information about your inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-110 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span className="relative z-10">Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-5 h-5 mr-3 relative z-10 group-hover:animate-bounce" />
                      <span className="relative z-10">Send Message</span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div className="order-1 lg:order-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Our Location</h2>
                <p className="text-gray-600">
                  Visit our showroom to see our products in person and get expert advice from our team.
                </p>
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden shadow-lg mb-4 h-80 relative">
                <iframe
                  title="VIKOSHIYA Location"
                  src="https://www.google.com/maps?q=9.537215992996419,77.94851524232855&z=15&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="mb-8">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=9.537215992996419,77.94851524232855"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Get Directions
                </a>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold text-red-600">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Quick answers to common questions about our products and services
            </p>
          </div>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Do you provide installation services?</h3>
              <p className="text-gray-600 leading-relaxed">
                While we don't provide direct installation services, we work with a network of certified electricians 
                and contractors who can handle your installation needs. We can connect you with trusted professionals 
                in your area and provide technical support throughout the installation process.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What is your return policy?</h3>
              <p className="text-gray-600 leading-relaxed">
                We offer a 30-day return policy for unused products in original packaging. Items must be in 
                resalable condition with all accessories and documentation. Custom or special-order items may 
                have different return terms. Please contact us for specific return authorization procedures.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Do you offer bulk pricing for large orders?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes, we offer competitive bulk pricing for contractors, builders, and large projects. 
                Contact our sales team with your requirements, and we'll provide a customized quote. 
                We also offer flexible payment terms for qualified business customers.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How can I verify product authenticity?</h3>
              <p className="text-gray-600 leading-relaxed">
                All our products come with manufacturer warranties and authenticity certificates. 
                You can verify authenticity through manufacturer websites using product serial numbers 
                or QR codes. We're authorized dealers for all brands we carry and provide genuine products only.
              </p>
            </div>

            {/* FAQ Item 5 */}
            <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What areas do you deliver to?</h3>
              <p className="text-gray-600 leading-relaxed">
                We deliver throughout Tamil Nadu and surrounding regions. Delivery times vary by location, 
                typically 2-5 business days within Tamil Nadu. For remote areas or large orders, 
                please contact us for specific delivery arrangements and timelines.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;