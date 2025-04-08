"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Database, CreditCard, Zap, CheckCircle, BarChart2, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  console.log("Current Stat:", currentStat);
  const gotoInvoiceForm = () => {
    router.push("/invoice");
  };

  // Initial page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setHeroVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Scroll-based animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      console.log(scrollPosition)
      // Animate features section when scrolled into view
      const featuresSection = document.getElementById('features-section');
      if (featuresSection && !featuresVisible) {
        const featuresSectionTop = featuresSection.getBoundingClientRect().top;
        if (featuresSectionTop < windowHeight * 0.75) {
          setFeaturesVisible(true);
        }
      }
      
      // Animate stats section when scrolled into view
      const statsSection = document.getElementById('stats-section');
      if (statsSection && !animatedStats) {
        const statsSectionTop = statsSection.getBoundingClientRect().top;
        if (statsSectionTop < windowHeight * 0.75) {
          setAnimatedStats(true);
          startStatAnimation();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [featuresVisible, animatedStats]);

  // Stat animation effect
  const startStatAnimation = () => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  };

  // Loader component
  const Loader = () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-blue-500 animate-pulse">Loading BillingFlow</p>
      </div>
    </div>
  );

  // Add this to your globals.css or in a style tag
  const dynamicStyles = `
    @keyframes float {
      0% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
      100% { transform: translateY(0px) rotate(0deg); }
    }
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    .gradient-text {
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .hover-grow {
      transition: transform 0.3s ease;
    }
    .hover-grow:hover {
      transform: scale(1.05);
    }
  `;

  return (
    <div className="flex flex-col w-full min-h-screen bg-black text-white overflow-x-hidden">
      <style>{dynamicStyles}</style>
      {loading && <Loader />}

      {/* Hero Section - Full Width and Height */}
      <section className="flex items-center justify-center w-screen py-16 px-4 md:px-8 min-h-[90vh] bg-gradient-to-br from-[#070711] via-[#0a0a1a] to-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[url('/dots-pattern.png')] opacity-5"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600 rounded-full filter blur-[100px] opacity-20"></div>
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600 rounded-full filter blur-[100px] opacity-20"></div>
        
        {/* Floating animated circles */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-blue-500 rounded-full opacity-70 animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-purple-500 rounded-full opacity-70 animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-cyan-500 rounded-full opacity-70 animate-float" style={{animationDelay: '2.5s'}}></div>

        <div className={`max-w-6xl w-full mx-auto z-10 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Badge variant="outline" className="mb-4 bg-blue-900/20 border-blue-700 text-blue-400 hover:bg-blue-900/30 px-4 py-1 hover-grow">
            <Zap className="w-4 h-4 mr-2" /> New Feature
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="gradient-text relative inline-block">
              Automate
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 origin-left transition-transform duration-1000 delay-500" style={{transform: heroVisible ? 'scaleX(1)' : 'scaleX(0)'}}></span>
            </span> Your Billing <br />In <span className="gradient-text">Minutes</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl transition-all duration-1000 delay-300" style={{opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)'}}>
            Transform manual billing into a streamlined digital workflow.
            Generate invoices, track payments, and manage client data
            efficiently with our AI-powered platform.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4 transition-all duration-1000 delay-500" style={{opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)'}}>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white relative overflow-hidden group hover-grow" 
              onClick={gotoInvoiceForm}
              size="lg"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center">
                Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>

            <Link href="/demo">
              <Button
                variant="outline"
                className="bg-[#111] border-gray-700 hover:bg-[#181818] hover:border-gray-600 transition-colors duration-300 hover-grow"
                size="lg"
              >
                Live Demo
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center gap-6 text-gray-400 text-sm transition-all duration-1000 delay-700" style={{opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)'}}>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span>Trusted by 5,000+ businesses</span>
            </div>
            <div className="flex items-center">
              <BarChart2 className="w-4 h-4 mr-2 text-blue-500" />
              <span>98% customer satisfaction</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-purple-500" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Full Width */}
      <section id="features-section" className="w-screen py-16 md:py-24 px-4 md:px-8 bg-[#050710] relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900 rounded-full filter blur-[150px] opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-900 rounded-full filter blur-[150px] opacity-10"></div>
        
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-16">
            <h2 className={`text-2xl md:text-4xl font-bold mb-4 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="gradient-text">Powerful Features</span> to Streamline Your Workflow
            </h2>
            <p className={`text-gray-400 max-w-2xl mx-auto transition-all duration-700 delay-200 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Everything you need to manage your billing efficiently in one place
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="text-blue-400 group-hover:text-white" size={28} />,
                title: "Smart Invoice Generation",
                description: "Create professional, customizable invoices in seconds with our AI-powered templates.",
                features: ["Auto-calculations", "Multiple currencies", "Brand customization"]
              },
              {
                icon: <Database className="text-blue-400 group-hover:text-white" size={28} />,
                title: "Client Management",
                description: "Store all customer data securely with advanced search and filtering capabilities.",
                features: ["Unlimited clients", "Import/export data", "Activity history"]
              },
              {
                icon: <CreditCard className="text-blue-400 group-hover:text-white" size={28} />,
                title: "Payment Tracking",
                description: "Real-time payment status updates with automated reminders for overdue invoices.",
                features: ["Multiple payment methods", "Auto-reconciliation", "Late fee calculation"]
              },
              {
                icon: <Users className="text-blue-400 group-hover:text-white" size={28} />,
                title: "Team Collaboration",
                description: "Invite team members with role-based permissions for seamless collaboration.",
                features: ["Multi-user access", "Activity logs", "Comment threads"]
              },
              {
                icon: <BarChart2 className="text-blue-400 group-hover:text-white" size={28} />,
                title: "Advanced Analytics",
                description: "Visual reports and insights to help you understand your business performance.",
                features: ["Custom reports", "Export to PDF/Excel", "Real-time dashboards"]
              },
              {
                icon: <CheckCircle className="text-blue-400 group-hover:text-white" size={28} />,
                title: "Integrations",
                description: "Connect with your favorite accounting, CRM and payment platforms.",
                features: ["QuickBooks", "Stripe/PayPal", "Zapier", "API access"]
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className={`group bg-[#0d0f1a] border border-gray-800 hover:border-blue-900 hover:bg-[#13152b] transition-all duration-500 hover-grow ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <CardHeader className="flex flex-col items-start">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:from-blue-700 group-hover:to-blue-500">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-left text-lg md:text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-left">
                  <p className="text-gray-400 mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section - Full Width with Background */}
      <section id="stats-section" className="w-screen py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-[#040912] via-[#0a0a1a] to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-[0.02]"></div>
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { 
                value: "85%", 
                label: "Time Saved", 
                description: "Our users report saving significant time on billing tasks",
                icon: <Clock className="w-8 h-8 text-blue-400" />
              },
              { 
                value: "100%", 
                label: "Error Reduction", 
                description: "Automated calculations eliminate manual errors",
                icon: <CheckCircle className="w-8 h-8 text-blue-400" />
              },
              { 
                value: "24/7", 
                label: "Access to Data", 
                description: "Cloud-based platform accessible from anywhere",
                icon: <Database className="w-8 h-8 text-blue-400" />
              }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-900/20 mb-6 transition-all duration-1000 ${animatedStats ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                  style={{ transitionDelay: `${index * 200}ms` }}>
                  {stat.icon}
                </div>
                <h3 
                  className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transition-all duration-1000 ${animatedStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  {stat.value}
                </h3>
                <h4 
                  className={`text-xl font-semibold mb-2 transition-all duration-700 ${animatedStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${(index * 200) + 300}ms` }}
                >
                  {stat.label}
                </h4>
                <p 
                  className={`text-gray-400 transition-all duration-700 ${animatedStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${(index * 200) + 500}ms` }}
                >
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* Animated testimonials */}
          {/* <div className={`mt-20 max-w-4xl mx-auto bg-[#0d0f1a] border border-gray-800 rounded-xl p-8 md:p-10 transition-all duration-1000 ${animatedStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mb-6 md:mb-0 md:mr-8">
                {currentStat === 0 ? "JS" : currentStat === 1 ? "AM" : "TK"}
              </div>
              <div className="text-center md:text-left">
                <p className="text-lg italic mb-4">
                  {currentStat === 0 ? 
                    "BillingFlow cut our invoice processing time by 80%. The automation features are game-changing for our accounting team." : 
                    currentStat === 1 ? 
                    "As a small business owner, I've saved 10+ hours per week since switching to BillingFlow. The mobile access is incredibly convenient." : 
                    "The reporting dashboard gives us real-time insights into cash flow. Our finance team loves the clean interface and powerful features."}
                </p>
                <div className="font-semibold">
                  {currentStat === 0 ? "— Jamie S., CFO at TechCorp" : 
                   currentStat === 1 ? "— Alex M., Owner at Bloom Cafe" : 
                   "— Taylor K., Finance Director at SwiftCo"}
                </div>
                <div className="flex justify-center md:justify-start mt-4 space-x-1">
                  {[0, 1, 2].map((i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentStat(i)}
                      className={`w-3 h-3 rounded-full transition-all ${i === currentStat ? 'bg-blue-500 w-6' : 'bg-gray-700'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div> */}
            <div className={`mt-20 max-w-5xl mx-auto transition-all duration-1000 ${animatedStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
  <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
    <span className="gradient-text">How It Works</span>
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[
      {
        step: "1",
        title: "Upload Company Details",
        description: "Set up your business profile with company information, logo, and contact details.",
        icon: <Database className="w-8 h-8 text-blue-400" />
      },
      {
        step: "2",
        title: "Create Invoices",
        description: "Generate professional invoices with automatic bill numbers and payment calculations.",
        icon: <FileText className="w-8 h-8 text-blue-400" />
      },
      {
        step: "3",
        title: "Access Reports",
        description: "View and export detailed financial reports to track your business performance.",
        icon: <BarChart2 className="w-8 h-8 text-blue-400" />
      }
    ].map((item, index) => (
      <div key={index} className="bg-[#0d0f1a] border border-gray-800 hover:border-blue-900 rounded-xl p-6 transition-all duration-500 hover-grow relative">
        {/* Step number badge */}
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
          {item.step}
        </div>
        
        {/* If not the last item, show connecting arrow */}
        {index < 2 && (
          <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-500">
            <ArrowRight size={24} />
          </div>
        )}
        
        <div className="mb-4 mt-2 flex justify-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
            {item.icon}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 text-center">{item.title}</h3>
        <p className="text-gray-400 text-center">{item.description}</p>
      </div>
    ))}
  </div>
  
  {/* Action button below the flow */}
  {/* <div className="flex justify-center mt-10">
    <Button 
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white relative overflow-hidden group hover-grow"
      onClick={gotoInvoiceForm}
      size="lg"
    >
      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
      <span className="relative z-10 flex items-center">
        Get Started Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
      </span>
    </Button>
  </div> */}
</div>
        </div>
      </section>

      {/* Call to Action Section - Full Width */}
      <section className="w-screen py-16 md:py-24 px-4 md:px-8 bg-[#030e20] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/dots-pattern.png')] opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900 rounded-full filter blur-[150px] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge variant="outline" className="mb-6 bg-blue-900/20 border-blue-700 text-blue-400 hover:bg-blue-900/30 px-4 py-1 hover-grow">
            No credit card required
          </Badge>
          
          <h2 className="text-2xl md:text-4xl font-bold mb-6">
            Ready to <span className="gradient-text">transform</span> your billing process?
          </h2>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses that have already automated their billing workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 h-auto text-base md:text-lg hover-grow">
                Start Free 14-Day Trial
              </Button>
            </Link>
            
            <Link href="/demo">
              <Button variant="outline" className="bg-transparent border-gray-700 text-white hover:bg-gray-900/50 hover:border-gray-600 px-8 py-6 h-auto text-base md:text-lg hover-grow">
                Schedule a Demo
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>7-day money back guarantee • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-screen py-12 px-4 md:px-8 bg-black border-t border-gray-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">BillingFlow</h3>
            <p className="text-gray-400 text-sm">
              The modern billing platform for businesses of all sizes.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Integrations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Updates</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Guides</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2023 BillingFlow. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}