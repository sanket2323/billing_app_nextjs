"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getUserSession } from "../actions/auth-actions";
import { toast } from "sonner";
import { Loader2, X, Download, ArrowLeft } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import FarmerBillingPDF from "../pdf/FarmerBillingPDF";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Type definitions (same as in your bills page)
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

type Bill = {
  id: string;
  billDate: FirestoreTimestamp;
  billNumber: string;
  amount?: number;
  expenses: Expenses;
  city: string;
  farmerName: string;
  products: Product[];
  totalExpense: number;
  totalPayableAmount: number;
  totalValue: number;
  phoneNumber: string;
};

type Product = {
  productType: string;
  quantity: number;
  rate: number;
  weight: number;
};

type Expenses = {
  adat: number;
  hamali: number;
  tolai: number;
  varai: number;
  bharai: number;
  motorBhade: number;
  uchhal: number;
  bardana: number;
  itar: number;
};

interface CompanyDetails {
  address: string;
  alternatePhoneNumber?: string | null;
  city: string;
  companyName: string;
  createdAt: string;
  gstNumber?: string | null;
  phoneNumber: string;
  registrationNumber: string;
  state: string;
}

const formatFirestoreDate = (timestamp: FirestoreTimestamp): string => {
  try {
    if (!timestamp || typeof timestamp.seconds !== "number") {
      return "N/A";
    }

    const fireBaseTime = new Date(
      timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
    );

    if (isNaN(fireBaseTime.getTime())) {
      return "N/A";
    }

    return fireBaseTime.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error in formatFirestoreDate:", error);
    return "N/A";
  }
};

const BillDetailModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billNumber = searchParams.get("bill_no");
  
  const [billData, setBillData] = useState<Bill | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Fetch company details (needed for PDF generation)
  const fetchCompanyDetails = async () => {
    try {
      const session = await getUserSession();
      if (!session?.user?.id) {
        return null;
      }
      const userId = session.user.id;
      const userDocRef = doc(db, "users", userId);
      const companyRef = collection(userDocRef, "company_details");
      const querySnapshotCompany = await getDocs(companyRef);

      if (!querySnapshotCompany.empty) {
        const companyData =
          querySnapshotCompany.docs[0].data() as CompanyDetails;
        setCompanyDetails(companyData);
        return companyData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching company details:", error);
      return null;
    }
  };

  // Generate and download PDF for the current bill
  const generateAndDownloadPDF = async () => {
    if (!billData) return;
    
    setGeneratingPdf(true);
    try {
      const toastId = toast.loading("PDF तयार करत आहे...");

      // Ensure we have company details
      let companyData = companyDetails;
      if (!companyData) {
        companyData = await fetchCompanyDetails();
        if (!companyData) {
          toast.error("कंपनीचा तपशील उपलब्ध नाही", { id: toastId });
          setGeneratingPdf(false);
          return;
        }
      }

      // Generate the PDF
      const blob = await pdf(
        <FarmerBillingPDF
          billData={{
            ...billData,
            billDate: new Date(
              billData.billDate.seconds * 1000 +
                (billData.billDate.nanoseconds || 0) / 1000000
            ),
          }}
          companyDetails={{
            ...companyData,
            gstNumber: companyData.gstNumber ?? undefined,
          }}
        />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bill_${billData.billNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF डाउनलोड यशस्वी", { id: toastId });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("PDF तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा।");
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Fetch bill data
  const fetchBillData = async () => {
    if (!billNumber) return;
    
    setLoading(true);
    try {
      const session = await getUserSession();
      if (!session?.user?.id) {
        toast.error("कृपया साइन इन करा");
        return;
      }

      const userID = session.user.id;
      const userDocRef = doc(db, "users", userID);
      const billDocRef = doc(collection(userDocRef, "bills"), billNumber);
      const billSnapshot = await getDoc(billDocRef);

      if (!billSnapshot.exists()) {
        toast.error("बिल डेटा आढळला नाही");
        return;
      }

      // Get the bill data
      const bill = {
        ...(billSnapshot.data() as Bill),
        id: billSnapshot.id,
      };
      
      setBillData(bill);
      
      // Also fetch company details if needed
      if (!companyDetails) {
        fetchCompanyDetails();
      }
    } catch (error) {
      console.error("Error fetching bill data:", error);
      toast.error("बिल डेटा लोड करण्यात अयशस्वी");
    } finally {
      setLoading(false);
    }
  };

  // Close the modal by removing the query parameter
  const handleClose = () => {
    router.push("./billing_statements", { scroll: false });
  };

  // Fetch data when bill number changes
  useEffect(() => {
    if (billNumber) {
      fetchBillData();
    }
  }, [billNumber]);

  // Is the modal open?
  const isOpen = !!billNumber;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Always provide a DialogTitle for accessibility, even if loading */}
          <DialogTitle className="text-xl">
            {loading ? "बिल डेटा लोड करत आहे..." : 
             !billData ? "बिल माहिती" : 
             `बिल क्रमांक: ${billData.billNumber}`}
          </DialogTitle>
          
          {/* Only show close/download buttons if we have data */}
          {billData && (
            <div className="flex items-center space-x-2 mt-2">
              <button
                onClick={generateAndDownloadPDF}
                disabled={generatingPdf}
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 bg-primary  hover:bg-primary/90 transition-colors text-black"
                title="PDF डाउनलोड करा"
              >
                {generatingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>डाउनलोड करत आहे...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    <span>Pdf डाउनलोड करा</span>
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                className="inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">बंद करा</span>
              </button>
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">बिल डेटा लोड होत आहे...</span>
          </div>
        ) : !billData ? (
          <div className="text-center py-16">
            <p>बिल डेटा आढळला नाही</p>
            <button 
              onClick={handleClose}
              className="mt-4 flex items-center justify-center mx-auto text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              मागे जा
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Farmer Details */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="text-lg font-semibold mb-3">शेतकऱ्याचे तपशील</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">शेतकऱ्याचे नाव</p>
                  <p className="font-semibold">{billData.farmerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">फोन नंबर</p>
                  <p className="font-semibold">{billData.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">पत्ता</p>
                  <p className="font-semibold">{billData.city}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">बिल तारीख</p>
                  <p className="font-semibold">{formatFirestoreDate(billData.billDate)}</p>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">उत्पादने</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">उत्पादन प्रकार</th>
                      <th className="text-right py-2">वजन (किलो)</th>
                      <th className="text-right py-2">दर (₹)</th>
                      <th className="text-right py-2">संख्या</th>
                      <th className="text-right py-2">एकूण मूल्य (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billData.products.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-muted/20">
                        <td className="py-2">{product.productType}</td>
                        <td className="text-right py-2">{product.weight}</td>
                        <td className="text-right py-2">{product.rate}</td>
                        <td className="text-right py-2">{product.quantity}</td>
                        <td className="text-right py-2 font-medium">
                          {(product.weight * product.rate).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-medium">
                      <td colSpan={4} className="text-right py-2">एकूण:</td>
                      <td className="text-right py-2">{billData.totalValue.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">खर्च</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(billData.expenses).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-muted-foreground text-sm capitalize">
                      {key}
                    </p>
                    <p className="font-medium">₹ {Number(value).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 flex justify-between">
                <p className="font-semibold">एकूण खर्च:</p>
                <p className="font-semibold">₹ {billData.totalExpense.toFixed(2)}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <h3 className="text-lg font-semibold mb-3">बिल सारांश</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">एकूण मूल्य:</p>
                  <p className="font-medium">₹ {billData.totalValue.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">एकूण खर्च:</p>
                  <p className="font-medium">₹ {billData.totalExpense.toFixed(2)}</p>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <p className="font-bold">एकूण देय रक्कम:</p>
                  <p className="font-bold text-xl">₹ {billData.totalPayableAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillDetailModal;