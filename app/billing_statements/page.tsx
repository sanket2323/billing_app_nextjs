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
import { collection, doc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { getUserSession } from "../actions/auth-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

// Enhanced utility function to convert Firestore timestamp to formatted date
const formatFirestoreDate = (timestamp: {
  seconds: number;
  nanoseconds: number;
}): string => {
  try {
    // Validate timestamp object
    if (!timestamp || typeof timestamp.seconds !== "number") {
      console.error("Invalid timestamp object:", timestamp);
      return "N/A";
    }

    // Create Date object
    const fireBaseTime = new Date(
      timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
    );

    // Validate created date
    if (isNaN(fireBaseTime.getTime())) {
      console.error("Invalid date creation:", timestamp);
      return "N/A";
    }

    // Format date as DD/MM/YYYY
    return fireBaseTime.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error in formatFirestoreDate:", error);
    console.error("Timestamp causing error:", timestamp);
    return "N/A";
  }
};

const Page = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setPageLoading(true);
        
        const session = await getUserSession();
        if (!session?.user?.id) {
          toast.error("कृपया बिल पाहण्यासाठी साइन इन करा।");
          setPageLoading(false);
          return;
        }
        
        const userID = session.user.id;
        const userDocRef = doc(db, "users", userID);
        const billsCollectionRef = collection(userDocRef, "bills");
        const querySnapshot = await getDocs(billsCollectionRef);
        const billsData = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Bill;
          return {
            ...data, // Spread bill data first
            id: doc.id, // Then explicitly set the id to ensure it's not overwritten
          };
        });

        setBills(billsData);
      } catch (error) {
        console.error("Error fetching session or user data:", error);
        toast.error("बिले लोड करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा।");
      } finally {
        setIsLoading(false);
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

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
    <div className="min-w-screen p-2">
      <Table>
        <TableCaption>तुमच्या अलीकडील बिलांची यादी</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">शेतकऱ्याचे नाव</TableHead>
            <TableHead>बिल क्रमांक</TableHead>
            <TableHead>खर्च</TableHead>
            <TableHead className="text-right">देय रक्कम</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span>बिले लोड होत आहेत...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : bills.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                कोणतीही बिले सापडली नाहीत
              </TableCell>
            </TableRow>
          ) : (
            bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{bill.farmerName}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatFirestoreDate(bill.billDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{bill.id}</TableCell>
                <TableCell>{bill.totalExpense || 0}</TableCell>
                <TableCell className="text-right">
                  ₹{Number(bill.totalPayableAmount || 0).toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;