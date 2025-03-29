"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { getUserSession } from "../actions/auth-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "@/components/ui/pagination";

type Bill = {
  id: string;
  billDate: { seconds: number; nanoseconds: number };
  billNumber: string;
  amount?: number;
  expense: Expenses;
  city: string;
  farmerName: string;
  product: Product[];
  totalExpense: number;
  totalPayableAmount: number;
  totalValue: number;
};

type Product = {
  productType: string;
  quantity: number;
  rate: number;
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

const formatFirestoreDate = (timestamp: {
  seconds: number;
  nanoseconds: number;
}): string => {
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
  console.log(hasMore)
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
        ...doc.data() as Bill,
        id: doc.id,
      }));

      setBills(newBills);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === BILLS_PER_PAGE);
      
      // For demo purposes, we'll assume 5 pages total
      // In a real app, you'd need to get the total count from Firestore
      setTotalPages(5);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("बिले लोड करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा।");
    } finally {
      setIsLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
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
    <div className="min-w-screen p-2 flex flex-col gap-4">
      <Table>
        <TableCaption>तुमच्या अलीकडील बिलांची यादी</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">शेतकऱ्याचे नाव</TableHead>
            <TableHead>बिल क्रमांक</TableHead>
            <TableHead>खर्च</TableHead>
            <TableHead className="text-right">देय रक्कम</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span>बिले लोड होत आहेत...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : bills.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                कोणतीही बिले सापडली नाहीत
              </TableCell>
            </TableRow>
          ) : (
            bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium flex flex-col">

                  {bill.farmerName}
                  <span>
                  {formatFirestoreDate(bill.billDate)}
                  </span>
                </TableCell>
                <TableCell>{bill.billNumber}</TableCell>
                <TableCell>₹{bill.totalExpense?.toFixed(2) || "0.00"}</TableCell>
                <TableCell className="text-right">
                  ₹{Number(bill.totalPayableAmount || 0).toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ShadCN Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
              isActive={currentPage > 1}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
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

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNum);
                  }}
                  isActive={pageNum === currentPage}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
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
                handlePageChange(currentPage + 1);
              }}
              isActive={currentPage < totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Page;