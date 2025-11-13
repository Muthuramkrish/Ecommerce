import React from 'react';
import { Users, Award, Clock, Shield, Zap, Target, Eye, Heart } from 'lucide-react';
const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative h-[85vh] text-white overflow-hidden flex items-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80')`,
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
              <Users className="w-10 h-10 text-blue-900" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About <span className="text-yellow-400">VIKOSHIYA</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your trusted partner in electrical solutions since inception. We're committed to 
              powering your world with quality, safety, and innovation.
            </p>
          </div>
        </div>
      </section>
      {/* Company Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  At Vikoshiya Technologies, we're more than just an IT company — we're part of a journey that started back in 2012.
                </p>
                <p>
                  It all began in Singapore, where we laid our foundation in the electrical and instrumentation field. Over the years, we've expanded into media (2015) and infrastructure (2016), and now, in 2025, we've stepped into the world of technology with a new chapter based in Virudhunagar, India.
                </p>
                <p>
                  With over a decade of experience behind us, we understand what it takes to build something that lasts. Whether it's a circuit, a building, a brand, or a website — we believe in doing things with quality, care, and commitment.
                </p>
                <p>
                  Vikoshiya Technologies is a full-stack web solutions provider, offering modern IT services, design, and digital transformation. Alongside our core tech services, we also operate a specialized eCommerce platform vikoshiya india Shop, delivering handpicked tech and utility products to customers nationwide.
                </p>
                <p>
                  We're a small team with big values — honest work, lasting relationships, and smart solutions that actually work. If you're looking for a tech partner who's in it for the long run, we'd love to be part of your journey.
                </p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
                  alt="Our workshop and team"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Mission, Vision, Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Foundation</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <Target className="w-8 h-8 text-blue-600 group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide high-quality electrical products and exceptional service that 
                empowers our customers to build safer, more efficient electrical systems 
                for their homes and businesses.
              </p>
            </div>
            {/* Vision */}
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <Eye className="w-8 h-8 text-purple-600 group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the most trusted electrical solutions provider in Tamil Nadu, 
                known for innovation, reliability, and customer satisfaction in every 
                interaction and product we deliver.
              </p>
            </div>
            {/* Values */}
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <Heart className="w-8 h-8 text-red-600 group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Values</h3>
              <p className="text-gray-600 leading-relaxed">
                Quality first, customer-centric approach, integrity in business, 
                continuous innovation, and commitment to safety standards that 
                protect lives and property.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose VIKOSHIYA?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're more than just an electrical supplier - we're your partners in creating safe, 
              efficient, and reliable electrical solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Quality Assurance */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <Shield className="w-10 h-10 text-white group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Quality Assurance</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every product undergoes rigorous quality checks and meets international 
                safety standards before reaching our customers.
              </p>
            </div>

            {/* Expert Support */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <Users className="w-10 h-10 text-white group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Expert Support</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our knowledgeable team provides technical guidance and support to help 
                you make the right choices for your projects.
              </p>
            </div>

            {/* Fast Service */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <Clock className="w-10 h-10 text-white group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Fast Service</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Quick order processing, fast delivery, and responsive customer service 
                to keep your projects moving forward.
              </p>
            </div>

            {/* Trusted Brands */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <Award className="w-10 h-10 text-white group-hover:animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Trusted Brands</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We partner with leading manufacturers to offer authentic products 
                with full warranty coverage and after-sales support.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Work with Us?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience the VIKOSHIYA difference. Let us help you find the perfect electrical solutions for your needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#home" className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-110 transition-all duration-500 group relative overflow-hidden">
              <span className="relative z-10">Browse Products</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent"></div>
            </a>
            <a href="#contact" className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-bold text-lg hover:bg-white/30 hover:scale-110 transition-all duration-500 border border-white/30 hover:shadow-2xl group relative overflow-hidden">
              <span className="relative z-10">Contact Us</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
export default About;