"use client";
import * as React from "react";
import { getUserSession } from "@/app/actions/auth-actions";
import {
  Building,
  Bot,
  SquareTerminal,
  Home,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { CompanySwitcher } from "./team-switcher";

// Default guest user data
const guestUser = {
  name: "Guest",
  email: "Guest@email.com",
  avatar: "DN",
  isLoggedIn: false,
};

// Default company data
const defaultCompany = {
  companyName: "Your Company",
  registrationNumber: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "Set up your details",
};

// This is sample data.
interface User {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
}

export interface CompanyDetails {
  companyName: string;
  registrationNumber: string;
  gstNumber?: string | null;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  address: string;
  city: string;
  state: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [hasCompanyDetails, setHasCompanyDetails] = useState(false);
  const [user, setUser] = useState<User>(guestUser);
  
  const data = {
    navMain: [
      {
        title:"Home",
        url: "/",
        icon: Home,
        isActive: true,
      },
      {
        title: "Create New Bill",
        url: "/invoice",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: "Billing Statements",
        url: "/billing_statements",
        icon: Bot,
      },
    ],
  };

  // Function to load company details
  const loadCompanyDetails = async () => {
    const session = await getUserSession();
    if (!session?.user?.id) {
      console.log("No active session for company details");
      setCompanyDetails(defaultCompany);
      setHasCompanyDetails(false);
      return;
    }
    
    const userId = session.user.id;
    const userDocRef = doc(db, "users", userId);
    const companyCollection = collection(userDocRef, "company_details");
    
    try {
      const querySnapShotCompany = await getDocs(companyCollection);
      if (!querySnapShotCompany.empty) {
        const companyDoc = querySnapShotCompany.docs[0]; // assuming only one document
        const companyData = companyDoc.data() as CompanyDetails;
        setCompanyDetails(companyData);
        setHasCompanyDetails(true); // Set flag to true when we have company details
        console.log("Company Data loaded:", companyData);
      } else {
        console.log("No company details found");
        // Set a default placeholder for company
        setCompanyDetails(defaultCompany);
        setHasCompanyDetails(false); // Set flag to false when no company details found
      }
    } catch (error) {
      console.log(error);
      toast.error("Fetching error for company details");
      setCompanyDetails(defaultCompany);
      setHasCompanyDetails(false);
    }
  };

  // Watch for changes to user.isLoggedIn
  useEffect(() => {
    // If user is not logged in, reset company details
    if (!user.isLoggedIn) {
      setCompanyDetails(defaultCompany);
      setHasCompanyDetails(false);
      console.log("User logged out, company details reset");
    } else {
      // If user is logged in, load their company details
      loadCompanyDetails();
    }
  }, [user.isLoggedIn]); // This will run whenever isLoggedIn changes

  useEffect(() => {
    async function loadSession() {
      const session = await getUserSession();
      if (session && session.user) {
        const newUser = {
          name: session.user.name ?? "Guest",
          email: session.user.email ?? "Guest@email.com",
          avatar: session.user.image ?? "DN",
          isLoggedIn: true,
        };
        setUser(newUser);
        toast("User Logged In Successfully");
      } else {
        setUser(guestUser);
      }
    }

    loadSession();
  }, []);

  // Prepare the company object for CompanySwitcher
  const company = {
    companyName: companyDetails?.companyName || "Your Company",
    state: companyDetails?.state || "Set up your details",
    logo: Building  // Using Building icon as default
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher 
          companyDetails={company} 
          hasCompanyDetails={hasCompanyDetails} 
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} setUser={setUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}