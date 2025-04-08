"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  getDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { getUserSession } from "../actions/auth-actions";
import { toast } from "sonner";
import { Loader2, FileText, Calendar, Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";
import FarmerBillingPDF from "../pdf/FarmerBillingPDF";

// Type for Firestore timestamp
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

const BILLS_PER_PAGE = 15;

const Page = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<unknown>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(
    null
  );
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

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

  // Generate and download PDF for a specific bill
  const generateAndDownloadPDF = async (billNumber: string) => {
    setGeneratingPdf(billNumber);
    try {
      const toastId = toast.loading("PDF तयार करत आहे...");

      // Ensure we have company details
      let companyData = companyDetails;
      if (!companyData) {
        companyData = await fetchCompanyDetails();
        if (!companyData) {
          toast.error("कंपनीचा तपशील उपलब्ध नाही", { id: toastId });
          setGeneratingPdf(null);
          return;
        }
      }

      // Fetch the full bill data
      const session = await getUserSession();
      if (!session?.user?.id) {
        toast.error("कृपया साइन इन करा", { id: toastId });
        setGeneratingPdf(null);
        return;
      }

      const userID = session.user.id;
      const userDocRef = doc(db, "users", userID);
      const billDocRef = doc(collection(userDocRef, "bills"), billNumber);
      const billSnapshot = await getDoc(billDocRef);

      if (!billSnapshot.exists()) {
        toast.error("बिल डेटा आढळला नाही", { id: toastId });
        setGeneratingPdf(null);
        return;
      }

      // Get the bill data
      const billData = billSnapshot.data() as Bill;

      // Generate the PDF - now the component will handle the date correctly
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
      link.download = `bill_${billNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF डाउनलोड यशस्वी", { id: toastId });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("PDF तयार करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा।");
    } finally {
      setGeneratingPdf(null);
    }
  };

  const fetchBills = async (page: number) => {
    try {
      setIsLoading(true);
      const session = await getUserSession();
      if (!session?.user?.id) {
        toast.error("कृपया बिल पाहण्यासाठी साइन इन करा।");
        return;
      }

      const userID = session.user.id;
      const userDocRef = doc(db, "users", userID);
      const billsCollectionRef = collection(userDocRef, "bills");

      // First query to get total count
      if (page === 1) {
        const countQuery = query(billsCollectionRef);
        const countSnapshot = await getDocs(countQuery);
        const totalBills = countSnapshot.size;
        const calculatedTotalPages = Math.max(
          1,
          Math.ceil(totalBills / BILLS_PER_PAGE)
        );
        setTotalPages(calculatedTotalPages);

        // If user is trying to access a page that doesn't exist, redirect to page 1
        if (page > calculatedTotalPages && page !== 1) {
          setCurrentPage(1);
          return;
        }
      }

      // Now get the actual data for the requested page
      let q;
      if (page > 1 && lastDoc) {
        q = query(
          billsCollectionRef,
          orderBy("billDate", "desc"),
          startAfter(lastDoc),
          limit(BILLS_PER_PAGE)
        );
      } else {
        q = query(
          billsCollectionRef,
          orderBy("billDate", "desc"),
          limit(BILLS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const newBills = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Bill),
        id: doc.id,
      }));

      setBills(newBills);

      // Only update lastDoc if we have results
      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      // If we got fewer results than requested, we're on the last page
      setHasMore(querySnapshot.docs.length === BILLS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("बिले लोड करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा।");
    } finally {
      setIsLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    // Fetch company details when the component loads
    fetchCompanyDetails();

    // If going back to page 1, reset lastDoc
    if (currentPage === 1) {
      setLastDoc(null);
    }
    fetchBills(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (pageLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">पृष्ठ लोड होत आहे...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)]">
      {/* Table Container - Takes remaining height with scrolling */}
      <div className="flex-1 overflow-auto px-4 pb-16">
        <div className="rounded-lg w-full overflow-hidden">
          <Table className="w-full table-fixed">
            <TableHeader className="sticky top-0">
              <TableRow>
                <TableHead className="w-[30%]">शेतकऱ्याचे नाव</TableHead>
                <TableHead className="w-[20%]">बिल क्रमांक</TableHead>
                <TableHead className="w-[20%]">पत्ता</TableHead>
                <TableHead className="w-[20%] text-right">देय रक्कम</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <span>बिले लोड होत आहेत...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-10 w-10 mb-2 opacity-20" />
                      <p>कोणतीही बिले सापडली नाहीत</p>
                      <p className="text-sm">
                        अजून बिले नाहीत? नवीन बिल तयार करण्यासाठी वर जा
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((bill, index) => (
                  <TableRow
                    key={bill.id}
                    className={index % 2 === 0 ? "bg-muted/10" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="truncate">{bill.farmerName}</div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          {bill.phoneNumber}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatFirestoreDate(bill.billDate)}
                      </div>
                    </TableCell>
                    <TableCell className="truncate text-primary">
                      <div className="flex  items-center">
                      {bill.billNumber}
                      <button
                        onClick={() => generateAndDownloadPDF(bill.billNumber)}
                        disabled={generatingPdf === bill.billNumber}
                        className="inline-flex items-center justify-center rounded-md h-10 w-10 text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="PDF डाउनलोड करा"
                      >
                        {generatingPdf === bill.billNumber ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Download className="h-5 w-5" />
                        )}
                      </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">{bill.city}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className="text-muted-foreground">₹</span>
                      <span>
                        {Number(bill.totalPayableAmount || 0).toFixed(2)}
                      </span>
                    </TableCell>
                    
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Fixed to bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-3 px-4 flex justify-center items-center shadow-md z-10">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
                className={`${
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                } transition-all duration-200`}
              />
            </PaginationItem>

            {/* Pagination numbers */}
            {totalPages > 0 &&
              Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (pageNum <= totalPages) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        isActive={pageNum === currentPage}
                        className="transition-all duration-200 hover:scale-105"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages && hasMore) {
                    handlePageChange(currentPage + 1);
                  }
                }}
                className={`${
                  !hasMore || currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                } transition-all duration-200`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="text-sm text-muted-foreground ml-4">
          पृष्ठ {currentPage} / {totalPages}
        </div>
      </div>
    </div>
  );
};

export default Page;
