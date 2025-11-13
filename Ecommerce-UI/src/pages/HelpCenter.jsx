import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  ChevronRight,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
  X,
  Clock,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const faqData = [
    {
      title: 'Orders & Checkout',
      questions: [
        {
          q: 'How do I place an order for electrical products?',
          a: 'Browse our catalog, add items to your cart, and proceed to checkout. You can pay via credit/debit card, UPI, net banking, or cash on delivery. Create an account for faster checkout and order tracking.'
        },
        {
          q: 'Can I buy in bulk or for commercial use?',
          a: 'Yes! We offer special bulk pricing for contractors, electricians, and businesses. Contact our B2B sales team at b2b@electrostore.com or call 1800-456-7891 for wholesale quotes and credit terms.'
        },
        {
          q: 'What payment methods are accepted?',
          a: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), UPI payments, net banking, digital wallets (Paytm, PhonePe, Google Pay), and cash on delivery for eligible orders.'
        },
        {
          q: 'Can I modify or cancel my order after placing it?',
          a: 'Yes, you can modify or cancel orders within 1 hour of placement through your account dashboard. After that, contact customer support immediately. Once shipped, cancellation isn\'t possible, but you can return items per our policy.'
        },
        {
          q: 'How do I apply discount or promo codes?',
          a: 'Enter your promo code in the "Apply Coupon" field during checkout before payment. Codes are case-sensitive. Check your email or our Offers page for current promotions. Only one code can be used per order.'
        },
      ],
    },
    {
      title: 'Shipping & Delivery',
      questions: [
        {
          q: 'What are your delivery charges?',
          a: 'Free delivery on orders above ₹500. Below that, charges are ₹50 for standard delivery. Express delivery costs ₹150 extra. Remote areas may have additional charges, which will be displayed at checkout.'
        },
        {
          q: 'How long does it take for delivery?',
          a: 'Standard delivery takes 3-5 business days for metro cities and 5-7 days for other areas. Express delivery is 1-2 days in select cities. You\'ll receive tracking details via SMS and email once shipped.'
        },
        {
          q: 'Do you offer same-day or express delivery?',
          a: 'Yes! Same-day delivery is available in major metros (Delhi, Mumbai, Bangalore, Chennai) for orders placed before 12 PM. Express delivery (1-2 days) is available in 50+ cities. Check availability at checkout.'
        },
        {
          q: 'How do I track my shipment?',
          a: 'Log into your account and go to "My Orders" to track in real-time. You\'ll also receive tracking links via SMS and email. Use the tracking number with our courier partner\'s website for detailed updates.'
        },
        {
          q: 'What happens if I miss my delivery?',
          a: 'Our courier will attempt delivery 3 times. You\'ll receive a call before each attempt. If missed, the package is held at the local hub for 5 days for self-pickup, or you can reschedule delivery through the tracking link.'
        },
      ],
    },
    {
      title: 'Returns & Refunds',
      questions: [
        {
          q: 'What is your return policy for electrical items?',
          a: '7-day return policy for most items (30 days for defective products with warranty). Items must be unused, in original packaging with all accessories, tags, and invoice. Certain items like cut cables, custom orders are non-returnable.'
        },
        {
          q: 'How do I request a product return or exchange?',
          a: 'Go to "My Orders" in your account, select the item, and click "Return/Exchange". Choose your reason, upload photos if required, and submit. We\'ll schedule a free pickup within 2-3 days. Approval takes 1-2 days after inspection.'
        },
        {
          q: 'How long does it take to get a refund?',
          a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount is credited to your original payment method. For prepaid orders, bank transfers may take 7-10 days to reflect.'
        },
        {
          q: 'Which items are non-returnable (e.g., cut cables)?',
          a: 'Non-returnable items include: cut wires/cables, installation materials (after opening), clearance/final sale items, custom-built electrical panels, intimate items, and products damaged due to misuse. These are clearly marked on product pages.'
        },
      ],
    },
    {
      title: 'Warranty & Product Support',
      questions: [
        {
          q: 'What warranty is provided for fans, cables, or switches?',
          a: 'Fans: 2-year manufacturer warranty. Cables: 1-year warranty on manufacturing defects. Switches: 1-2 years depending on brand. Warranty terms are mentioned on each product page. Keep your invoice for warranty claims.'
        },
        {
          q: 'How do I claim a warranty or repair service?',
          a: 'Contact us with your order number and issue description. We\'ll guide you to the nearest authorized service center or arrange pickup for repair/replacement. Most claims are resolved in 7-14 days. Extended warranties available at purchase.'
        },
        {
          q: 'Do you offer extended warranties for lighting products?',
          a: 'Yes! Extended warranty plans (1-3 additional years) are available for premium lighting, ceiling fans, and appliances. Add them at checkout or within 30 days of purchase. Plans cover manufacturing defects and electrical failures.'
        },
        {
          q: 'Is installation support available for large appliances?',
          a: 'Yes! Free installation assistance is included for ceiling fans, heavy-duty switches, and circuit breakers. For complete wiring or panel installation, we connect you with certified electricians. Service charges apply for complex installations.'
        },
      ],
    },
    {
      title: 'Account & Security',
      questions: [
        {
          q: 'How do I create or update my account?',
          a: 'Click "Sign Up" to create an account using your email or mobile number. To update details, go to "My Account" → "Profile Settings". You can modify name, phone, email, and addresses. Verify changes via OTP for security.'
        },
        {
          q: 'I forgot my password — how can I reset it?',
          a: 'Click "Forgot Password" on the login page. Enter your registered email/mobile number. You\'ll receive a reset link via email or OTP via SMS. Create a new strong password. For issues, contact support with ID proof.'
        },
        {
          q: 'Is my payment and data information secure?',
          a: 'Absolutely! We use 256-bit SSL encryption for all transactions. Payment details are processed through PCI-DSS certified gateways. We never store your CVV or card details. Your data is protected per our Privacy Policy and industry standards.'
        },
        {
          q: 'Can I save multiple delivery addresses?',
          a: 'Yes! Add unlimited addresses in "My Account" → "Address Book". Mark one as default for faster checkout. Each address can include special instructions for delivery. You can edit or delete addresses anytime.'
        },
      ],
    },
  ];

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('helpCenterSearchHistory') || '[]');
    const savedBookmarks = JSON.parse(localStorage.getItem('helpCenterBookmarks') || '[]');
    setSearchHistory(savedHistory);
    setBookmarkedQuestions(savedBookmarks);
  }, []);

  // Save search history to localStorage
  const saveSearchToHistory = (query) => {
    if (!query.trim() || query.length < 3) return;
    
    const newHistory = [
      query,
      ...searchHistory.filter(item => item !== query)
    ].slice(0, 5); // Keep only last 5 searches
    
    setSearchHistory(newHistory);
    localStorage.setItem('helpCenterSearchHistory', JSON.stringify(newHistory));
  };

  // Handle search with history
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      saveSearchToHistory(query);
    }
  };

  // Toggle bookmark
  const toggleBookmark = (categoryIdx, questionIdx) => {
    const bookmarkKey = `${categoryIdx}-${questionIdx}`;
    const isBookmarked = bookmarkedQuestions.includes(bookmarkKey);
    
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarkedQuestions.filter(bm => bm !== bookmarkKey);
    } else {
      newBookmarks = [...bookmarkedQuestions, bookmarkKey];
    }
    
    setBookmarkedQuestions(newBookmarks);
    localStorage.setItem('helpCenterBookmarks', JSON.stringify(newBookmarks));
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('helpCenterSearchHistory');
  };

  // Filter FAQs based on search
  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const displayCategories = searchQuery ? filteredFAQs : faqData;

  const handleQuestionClick = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setExpandedQuestion(expandedQuestion === key ? null : key);
  };

  const handleContactClick = (type) => {
    setSelectedContact(type);
  };

  const closeContactModal = () => {
    setSelectedContact(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 flex items-center">
            <HelpCircle size={28} className="mr-2 sm:mr-3 flex-shrink-0" /> 
            <span>Help Center</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-indigo-100">
            Get quick answers about orders, shipping, returns, and product support.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">How Can We Help You?</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Search our FAQs or browse categories below for help with electrical
            products, delivery, and support services.
          </p>

          {/* Search Bar */}
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => saveSearchToHistory(searchQuery)}
                onFocus={() => setShowHistory(true)}
                placeholder="Search for 'warranty', 'delivery', 'returns'..."
                className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 text-sm sm:text-base border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={18} />
                </button>
              )}
              
              {/* Search History Dropdown */}
              {showHistory && searchHistory.length > 0 && !searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600 flex items-center">
                      <Clock size={14} className="mr-1" /> Recent Searches
                    </span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleSearch(item);
                        setShowHistory(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {searchQuery && (
              <p className="mt-3 text-xs sm:text-sm text-gray-600">
                Found {displayCategories.reduce((acc, cat) => acc + cat.questions.length, 0)} results for "{searchQuery}"
              </p>
            )}
          </div>

          {/* Bookmarked Questions Section */}
          {bookmarkedQuestions.length > 0 && !searchQuery && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                <BookmarkCheck size={16} className="mr-2 text-yellow-600" />
                Your Bookmarked Questions ({bookmarkedQuestions.length})
              </h3>
              <div className="space-y-1">
                {bookmarkedQuestions.slice(0, 3).map((bookmark) => {
                  const [catIdx, qIdx] = bookmark.split('-').map(Number);
                  const question = faqData[catIdx]?.questions[qIdx];
                  if (!question) return null;
                  return (
                    <button
                      key={bookmark}
                      onClick={() => handleQuestionClick(catIdx, qIdx)}
                      className="block w-full text-left text-sm text-gray-700 hover:text-indigo-600 transition truncate"
                    >
                      • {question.q}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAQ Categories */}
          <div className="space-y-4 sm:space-y-6">
            {displayCategories.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 text-base sm:text-lg">No results found for "{searchQuery}"</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">Try different keywords or browse our categories</p>
              </div>
            ) : (
              displayCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      {category.title}
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="space-y-2">
                      {category.questions.map((item, qIdx) => {
                        const key = `${idx}-${qIdx}`;
                        const isExpanded = expandedQuestion === key;
                        const isBookmarked = bookmarkedQuestions.includes(key);
                        return (
                          <div key={qIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleQuestionClick(idx, qIdx)}
                                className="flex-1 flex justify-between items-center p-3 sm:p-3 bg-white hover:bg-indigo-50 transition text-left"
                              >
                                <span className="text-sm sm:text-base text-gray-700 font-medium pr-2">{item.q}</span>
                                {isExpanded ? (
                                  <ChevronDown size={18} className="text-indigo-500 flex-shrink-0" />
                                ) : (
                                  <ChevronRight size={18} className="text-indigo-500 flex-shrink-0" />
                                )}
                              </button>
                              <button
                                onClick={() => toggleBookmark(idx, qIdx)}
                                className="p-3 hover:bg-yellow-50 transition"
                                title={isBookmarked ? "Remove bookmark" : "Bookmark this question"}
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck size={18} className="text-yellow-600" />
                                ) : (
                                  <Bookmark size={18} className="text-gray-400" />
                                )}
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200">
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{item.a}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Contact Support CTA */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Still Need Help?</h3>
            <p className="mb-4 text-sm sm:text-base text-indigo-100">
              Our electrical support specialists are available 24/7 to assist with
              technical or order-related questions.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              <button 
                onClick={() => handleContactClick('phone')}
                className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition flex items-center justify-center"
              >
                <Phone size={16} className="mr-2" /> Call Us
              </button>
              <button 
                onClick={() => handleContactClick('chat')}
                className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition flex items-center justify-center"
              >
                <MessageCircle size={16} className="mr-2" /> Live Chat
              </button>
              <button 
                onClick={() => handleContactClick('email')}
                className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition flex items-center justify-center"
              >
                <Mail size={16} className="mr-2" /> Email Us
              </button>
            </div>
          </div>
        </div>

        {/* Contact Details Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <Phone size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Call Us</h3>
            <p className="text-sm text-gray-600 mb-2">Mon–Sat: 9AM – 9PM</p>
            <p className="text-indigo-600 font-bold">1800-456-7890</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <MessageCircle size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-2">24×7 Support Available</p>
            <button 
              onClick={() => handleContactClick('chat')}
              className="text-indigo-600 font-bold hover:underline"
            >
              Start Chat
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
              <Mail size={24} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Email Us</h3>
            <p className="text-sm text-gray-600 mb-2">Response within 24 hours</p>
            <p className="text-indigo-600 font-bold">support@electrostore.com</p>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={closeContactModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            {selectedContact === 'phone' && (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                  <Phone size={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">Call Our Support</h3>
                <p className="text-gray-600 text-center mb-4">
                  Available Mon–Sat: 9AM – 9PM
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600 mb-2">1800-456-7890</p>
                  <p className="text-sm text-gray-500">Toll-free number</p>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                  For B2B inquiries: 1800-456-7891
                </p>
              </>
            )}
            
            {selectedContact === 'chat' && (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <MessageCircle size={32} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">Live Chat Support</h3>
                <p className="text-gray-600 text-center mb-4">
                  Connect with our support team instantly
                </p>
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 mb-3">Chat is available 24×7 for:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Order tracking & updates</li>
                    <li>✓ Product recommendations</li>
                    <li>✓ Technical support</li>
                    <li>✓ Returns & refunds</li>
                  </ul>
                </div>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                  Start Chat Now
                </button>
              </>
            )}
            
            {selectedContact === 'email' && (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                  <Mail size={32} className="text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">Email Support</h3>
                <p className="text-gray-600 text-center mb-4">
                  We'll respond within 24 hours
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">General Support:</p>
                  <p className="text-lg font-semibold text-indigo-600 mb-3">support@electrostore.com</p>
                  <p className="text-sm text-gray-600 mb-2">Business Inquiries:</p>
                  <p className="text-lg font-semibold text-indigo-600">b2b@electrostore.com</p>
                </div>
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                  Compose Email
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close history */}
      {showHistory && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default HelpCenter;