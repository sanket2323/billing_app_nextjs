"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getUserSession } from "@/app/actions/auth-actions";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Form schema
const companyFormSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  registrationNumber: z.string().min(1, { message: "Registration number is required" }),
  gstNumber: z.string().optional(),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, { message: "Please enter a valid 10-digit phone number" }),
  alternatePhoneNumber: z.string().regex(/^[0-9]{10}$/, { message: "Please enter a valid 10-digit phone number" }).optional().or(z.literal("")),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City name must be at least 2 characters" }),
  state: z.string().min(2, { message: "State name must be at least 2 characters" }),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export default function EditCompanyDetails() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "",
      registrationNumber: "",
      gstNumber: "",
      phoneNumber: "",
      alternatePhoneNumber: "",
      address: "",
      city: "",
      state: "",
    },
  });

  // Use a separate state to control rendering
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Immediately invoke an async function
    (async () => {
      try {
        const session = await getUserSession();
        
        if (!session?.user?.id) {
          toast.error("Please sign in to access company details");
          setIsAuthenticated(false);
          // This will happen synchronously after state update
          router.replace("/");
          return;
        }
        
        setIsAuthenticated(true);
        
        // Only fetch data if authenticated
        const userId = session.user.id;
        const userDocRef = doc(db, "users", userId);
        const companyRef = collection(userDocRef, "company_details");
        const querySnapshotCompany = await getDocs(companyRef);

        if (!querySnapshotCompany.empty) {
          const companyData = querySnapshotCompany.docs[0].data();
          
          // Update form values with fetched data
          form.reset({
            companyName: companyData.companyName || "",
            registrationNumber: companyData.registrationNumber || "",
            gstNumber: companyData.gstNumber || "",
            phoneNumber: companyData.phoneNumber || "",
            alternatePhoneNumber: companyData.alternatePhoneNumber || "",
            address: companyData.address || "",
            city: companyData.city || "",
            state: companyData.state || "",
          });
        }
      } catch (error) {
        console.error("Error checking auth or fetching data:", error);
        toast.error("An error occurred while loading your data");
        setIsAuthenticated(false);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [form, router]);
  const Loader = () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-blue-500 animate-pulse">Loading Edit Screen</p>
      </div>
    </div>
  );
  // Show loading spinner while checking authentication
  if (loading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full fixed inset-0 bg-white bg-opacity-90 z-50">
`        <Loader /> 
      </div>
    );
  }

  // Don't render the form at all if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  async function onSubmit(values: CompanyFormValues) {
    setLoading(true);
    const toastId = toast.loading("Saving company details...");

    try {
      const session = await getUserSession();
      if (!session?.user?.id) {
        toast.error("Session expired. Please sign in again", { id: toastId });
        router.replace("/");
        return;
      }

      const userId = session.user.id;
      const userDocRef = doc(db, "users", userId);
      const companyCollectionRef = collection(userDocRef, "company_details");
      
      // Get existing company documents
      const querySnapshot = await getDocs(companyCollectionRef);
      
      // Data to save with timestamp
      const companyData = {
        ...values,
        createdAt: new Date().toISOString(),
      };

      if (querySnapshot.empty) {
        // Create a new company document if none exists
        const newCompanyDocRef = doc(companyCollectionRef);
        await setDoc(newCompanyDocRef, companyData);
      } else {
        // Update the first company document (assuming only one company per user)
        const existingDocRef = doc(companyCollectionRef, querySnapshot.docs[0].id);
        await setDoc(existingDocRef, companyData, { merge: true });
      }

      toast.success("Company details saved successfully", { id: toastId });
      router.push("/"); // Redirect to home page or dashboard
    } catch (error) {
      console.error("Error saving company details:", error);
      toast.error("Failed to save company details", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center p-4 min-w-screen">
      <div className="w-full max-w-3xl sm:p-8 md:p-10 rounded-xl shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Company Details</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter company name"
                      {...field}
                      className="h-12 text-base"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter registration number"
                        {...field}
                        className="h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter GST number"
                        {...field}
                        className="h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        {...field}
                        className="h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="alternatePhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter alternate phone number"
                        {...field}
                        className="h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter company address"
                      {...field}
                      className="h-12 text-base"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter city"
                        {...field}
                        className="h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter state"
                        {...field}
                        className="h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base"
                disabled={loading}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Company Details"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}