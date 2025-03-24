"use client"
import Link from "next/link";
import { ArrowRight, FileText, Database, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  const gotoInvoiceForm = () => {
    router.push("/invoice")
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section - Full Width and Height */}
      <section className="flex items-center justify-center w-screen py-16 px-4 md:px-8 min-h-[80vh] bg-gradient-to-r from-[#070711] to-black relative">
        <div className="absolute inset-0 bg-[url('/dots-pattern.png')] opacity-5"></div>
        <div className="max-w-6xl w-full mx-auto z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-blue-600">Automate</span> Your Billing Process
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl">
            Transform manual billing into a streamlined digital workflow.
            Generate invoices, track payments, and manage client data
            efficiently.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            
              <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={gotoInvoiceForm}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

            <Link href="/demo">
              <Button
                variant="outline"
                className="bg-[#111] border-gray-700 hover:bg-[#181818] hover:border-gray-600"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Full Width - Made Darker */}
      <section className="w-screen py-16 md:py-20 px-4 md:px-8 bg-[#050710]">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 md:mb-16">
            Streamline Your Billing Workflow
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <Card className="bg-[#0d0f1a] border-0 shadow-md">
              <CardHeader className="flex flex-col items-center">
                <div className="h-16 w-16 bg-blue-800 rounded-full flex items-center justify-center mb-2">
                  <FileText className="text-blue-400" size={28} />
                </div>
                <CardTitle className="text-center">
                  Generate Professional Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center">
                  Generate professional invoices automatically with just a few
                  clicks.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0d0f1a] border-0 shadow-md">
              <CardHeader className="flex flex-col items-center">
                <div className="h-16 w-16 bg-blue-800 rounded-full flex items-center justify-center mb-2">
                  <Database className="text-blue-400" size={28} />
                </div>
                <CardTitle className="text-center">
                  Store Customer Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center">
                  Store all customer data and transactions securely in our
                  database.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0d0f1a] border-0 shadow-md">
              <CardHeader className="flex flex-col items-center">
                <div className="h-16 w-16 bg-blue-800 rounded-full flex items-center justify-center mb-2">
                  <CreditCard className="text-blue-400" size={28} />
                </div>
                <CardTitle className="text-center">Track Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center">
                  Keep track of all payments and outstanding invoices in
                  real-time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section - Full Width with Background - Made Darker */}
      <section className="w-screen py-16 md:py-20 px-4 md:px-8 bg-gradient-to-r from-[#040912] to-black">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="text-center p-6">
                <Badge className="text-4xl md:text-5xl font-bold bg-blue-900/10 text-blue-400 px-6 py-4 mb-3 rounded-lg">
                  85%
                </Badge>
                <p className="text-gray-300 mt-3 text-lg">Time Saved</p>
              </CardContent>
            </Card>

            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="text-center p-6">
                <Badge className="text-4xl md:text-5xl font-bold bg-blue-900/10 text-blue-400 px-6 py-4 mb-3 rounded-lg">
                  100%
                </Badge>
                <p className="text-gray-300 mt-3 text-lg">Error Reduction</p>
              </CardContent>
            </Card>

            <Card className="bg-transparent border-0 shadow-none">
              <CardContent className="text-center p-6">
                <Badge className="text-4xl md:text-5xl font-bold bg-blue-900/10 text-blue-400 px-6 py-4 mb-3 rounded-lg">
                  24/7
                </Badge>
                <p className="text-gray-300 mt-3 text-lg">Access to Data</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section - Full Width with Much Darker Blue */}
      <section className="w-screen py-16 md:py-20 px-4 md:px-8 bg-[#030e20]">
        <Card className="max-w-4xl mx-auto text-center border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Ready to transform your billing process?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-xl mb-8 md:mb-10">
              Join thousands of businesses that have already automated their
              billing workflows.
            </p>
            <Link href="/signup">
              <Button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-6 h-auto text-base md:text-lg">
                Start Free Trial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
