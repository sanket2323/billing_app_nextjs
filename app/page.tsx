"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Database, CreditCard, Zap, CheckCircle, BarChart2, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showcaseVisible, setShowcaseVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  console.log(currentFeature)
  const features = [
    {
      title: "Smart Invoice Generation",
      description: "Create professional, customizable invoices in seconds with intelligent templates and automation.",
      icon: <FileText className="text-blue-400 group-hover:text-white" size={28} />
    },
    {
      title: "Client Management",
      description: "Store and manage customer data securely with advanced search and filtering capabilities.",
      icon: <Database className="text-blue-400 group-hover:text-white" size={28} />
    },
    {
      title: "Payment Tracking",
      description: "Real-time payment status updates with automated reminders for overdue invoices.",
      icon: <CreditCard className="text-blue-400 group-hover:text-white" size={28} />
    }
  ];

  const gotoInvoiceForm = () => {
    router.push("/invoice");
  };

  // Initial page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setHeroVisible(true);
    }, 800);
    
    // Feature rotation
    const featureInterval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(featureInterval);
    };
  }, [features.length]);

  // Scroll-based animations
  useEffect(() => {
    const handleScroll = () => {
      
      const windowHeight = window.innerHeight;
      
      // Animate showcase section when scrolled into view
      const showcaseSection = document.getElementById('showcase-section');
      if (showcaseSection && !showcaseVisible) {
        const showcaseSectionTop = showcaseSection.getBoundingClientRect().top;
        if (showcaseSectionTop < windowHeight * 0.75) {
          setShowcaseVisible(true);
        }
      }
      
      // Animate stats section when scrolled into view
      const statsSection = document.getElementById('stats-section');
      if (statsSection && !statsVisible) {
        const statsSectionTop = statsSection.getBoundingClientRect().top;
        if (statsSectionTop < windowHeight * 0.75) {
          setStatsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showcaseVisible, statsVisible]);

  // Loader component
  // Loader component
const Loader = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-800 rounded-full opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-primary animate-pulse">Loading BillingFlow</p>
    </div>
  </div>
);

  // Custom CSS for animations and styling
  const dynamicStyles = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
      100% { transform: translateY(0px); }
    }
    
    @keyframes fadeUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    .animate-pulse-slow {
      animation: pulse 3s ease-in-out infinite;
    }
    
    .gradient-text {
      background: linear-gradient(90deg, #0284c7, #0ea5e9);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    
    .shimmer {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      background-size: 1000px 100%;
      animation: shimmer 2s infinite linear;
    }
    
    .hover-grow {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .hover-grow:hover {
      transform: scale(1.03);
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
    }
    
    .grid-pattern {
      background-image: radial-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px);
      background-size: 30px 30px;
    }
    
    @media (max-width: 640px) {
      .grid-pattern {
        background-size: 20px 20px;
      }
    }
  `;

  return (
    <div className="flex flex-col min-w-screen min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{dynamicStyles}</style>
      {loading && <Loader />}

      {/* No Navigation - Removed as requested */}

      {/* Hero Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 md:px-8 min-h-[80vh] md:min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="absolute -bottom-40 -right-40 w-64 sm:w-96 h-64 sm:h-96 bg-blue-600 rounded-full filter blur-[100px] sm:blur-[150px] opacity-5"></div>
        <div className="absolute -top-40 -left-40 w-64 sm:w-96 h-64 sm:h-96 bg-blue-400 rounded-full filter blur-[100px] sm:blur-[150px] opacity-5"></div>
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/5 w-20 sm:w-32 h-8 sm:h-12 bg-card border rounded-lg opacity-30 sm:opacity-40 animate-float" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/4 right-1/5 w-24 sm:w-40 h-10 sm:h-16 bg-card border rounded-lg opacity-30 sm:opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-16 sm:w-24 h-12 sm:h-20 bg-card border rounded-lg opacity-30 sm:opacity-40 animate-float" style={{animationDelay: '3.2s'}}></div>
        
        <div className={`max-w-6xl w-full mx-auto z-10 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col items-center gap-10 sm:gap-16">
            <div className="max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30 text-primary px-3 sm:px-4 py-1 inline-block animate-pulse-slow">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Next-Gen Billing Platform
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 relative">
                Generate, automate and <span className="gradient-text relative inline-block">transform
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform origin-left scale-x-0 transition-transform duration-1000 delay-500" style={{transform: heroVisible ? 'scaleX(1)' : 'scaleX(0)'}}></span>
                </span> your billing workflow
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 transition-all duration-1000 delay-300" style={{opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)'}}>
                AI-powered platform for creating invoices, tracking payments, and managing client relationships.
                Streamline your workflow and save time with automated billing solutions.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 transition-all duration-1000 delay-500" style={{opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)'}}>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-black px-4 sm:px-6 py-2 sm:py-3 h-12 sm:h-14 text-base sm:text-lg hover-grow relative overflow-hidden group"
                  onClick={gotoInvoiceForm}
                >
                  <span className="absolute inset-0 w-full h-full shimmer"></span>
                  <span className="relative z-10 flex items-center">
                    Start for free <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
                
                <Link href="https://github.com/your-repo">
                  <Button
                    variant="outline"
                    className="border-border hover:bg-accent text-white px-4 sm:px-6 py-2 sm:py-3 h-12 sm:h-14 text-base sm:text-lg hover-grow"
                  >
                    <div className="mr-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    Star on GitHub
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="showcase-section" className="py-16 sm:py-20 md:py-24 px-4 md:px-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 bg-primary/10 border-primary/30 text-primary px-3 sm:px-4 py-1 inline-block">
              Simple process
            </Badge>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 transition-all duration-700 ${showcaseVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className={`text-sm sm:text-base text-muted-foreground max-w-xl sm:max-w-2xl mx-auto transition-all duration-700 delay-200 ${showcaseVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Get started in minutes with our simple three-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-4">
            {[
              {
                step: "1",
                title: "Set Up Your Profile",
                description: "Create your account and customize your company profile with logo and details.",
                icon: <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              },
              {
                step: "2",
                title: "Create Invoices",
                description: "Generate professional invoices with automatic bill numbers and payment calculations.",
                icon: <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              },
              {
                step: "3",
                title: "Track Payments",
                description: "Monitor payment status and send automated reminders for overdue invoices.",
                icon: <BarChart2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className={`bg-card border hover:border-primary rounded-xl p-4 sm:p-6 hover-grow relative ${showcaseVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Step number badge */}
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xs sm:text-base">
                  {step.step}
                </div>
                
                {/* If not the last item, show connecting arrow */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-primary">
                    <ArrowRight size={20} />
                  </div>
                )}
                
                <div className="mb-4 sm:mb-6 flex justify-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-primary/20 rounded-lg flex items-center justify-center animate-pulse-slow" style={{animationDelay: `${index * 0.5}s`}}>
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-center">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section id="stats-section" className="py-16 sm:py-20 md:py-24 px-4 md:px-8 bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: "85%", label: "Time Saved", description: "Our users report saving significant time on billing tasks", icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" /> },
              { value: "100%", label: "Error Reduction", description: "Automated calculations eliminate manual errors", icon: <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" /> },
              { value: "24/7", label: "Access to Data", description: "Cloud-based platform accessible from anywhere", icon: <Database className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" /> },
              { value: "5,000+", label: "Businesses", description: "Companies trust BillingFlow for their billing needs", icon: <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" /> }
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`bg-card border hover:border-primary rounded-xl p-4 sm:p-6 text-center hover-grow transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 mb-3 sm:mb-4 animate-pulse-slow" style={{animationDelay: `${index * 0.5}s`}}>
                  {stat.icon}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <h4 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
                  {stat.label}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Simplified with better spacing */}
      <footer className="py-6 sm:py-8 px-4 md:px-8 bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-xs sm:text-sm mb-4 md:mb-0">
              © 2025 BillingFlow Limited. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="#terms" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm transition-colors">Terms</Link>
              <Link href="#privacy" className="text-muted-foreground hover:text-foreground text-xs sm:text-sm transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}