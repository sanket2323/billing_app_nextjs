"use client";
import React, { useState } from "react";
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
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Form schema
const formSchema = z.object({
  companyName: z
    .string()
    .min(2, { message: "कंपनीचे नाव किमान 2 अक्षरे असावे" })
    .max(100),
  registrationNumber: z
    .string()
    .min(1, { message: "नोंदणी क्रमांक आवश्यक आहे" }),
  gstNumber: z
    .string()
    .min(15, { message: "योग्य GST क्रमांक टाका" })
    .max(15, { message: "योग्य GST क्रमांक टाका" })
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "योग्य फोन क्रमांक टाका" }),
  alternatePhoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "योग्य पर्यायी फोन क्रमांक टाका" })
    .optional()
    .or(z.literal('')),
  address: z.string().min(3, { message: "पत्ता आवश्यक आहे" }),
  city: z.string().min(2, { message: "शहराचे नाव आवश्यक आहे" }),
  state: z.string().min(2, { message: "राज्याचे नाव आवश्यक आहे" }),
});

const CompanyRegistrationForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const toastId = toast.loading("कंपनीचे तपशील जतन करत आहे...");

    try {
      // Prepare the data for Firestore
      const companyData = {
        companyName: values.companyName,
        registrationNumber: values.registrationNumber,
        gstNumber: values.gstNumber || null, // Store as null if empty
        phoneNumber: values.phoneNumber,
        alternatePhoneNumber: values.alternatePhoneNumber || null,
        address: values.address,
        city: values.city,
        state: values.state,
        createdAt: new Date(), // Add timestamp
      };

      // Add to Firestore collection
      const docRef = await addDoc(collection(db, "company_details"), companyData);

      toast.success(`कंपनीचे तपशील यशस्वीरित्या जतन केले! ID: ${docRef.id}`, { 
        id: toastId 
      });

      // Reset form after successful submission
      form.reset();
      router.push("/"); // Redirect to home or another page

    } catch (error) {
      console.error("Firestore submission error:", error);
      toast.error("कंपनीचे तपशील जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.", { 
        id: toastId 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-5xl sm:p-8 md:p-10 rounded-xl shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">कंपनीचे नाव</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="कंपनीचे नाव टाका"
                      {...field}
                      className="bg-gray-800 text-white border-gray-700 focus:ring-1 focus:ring-blue-600 h-12 text-base"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Registration Number */}
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">नोंदणी क्रमांक</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="कंपनी नोंदणी क्रमांक"
                      {...field}
                      className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* GST Number and Primary Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">GST क्रमांक (पर्यायी)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="GST क्रमांक टाका (इच्छिक)"
                        {...field}
                        className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">प्राथमिक संपर्क क्रमांक*</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="संपर्क क्रमांक टाका"
                        {...field}
                        className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Secondary Contact */}
            <FormField
              control={form.control}
              name="alternatePhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">पर्यायी संपर्क क्रमांक (इच्छिक)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="पर्यायी संपर्क क्रमांक टाका"
                      {...field}
                      className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="border-b-2 border-gray-700"></div>

            {/* Address, City, State */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">पत्ता</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="पूर्ण पत्ता"
                      {...field}
                      className="bg-gray-800 text-white border-gray-700 h-12 text-base"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">शहर</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="शहर"
                        {...field}
                        className="bg-gray-800 text-white border-gray-700 h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">राज्य</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="राज्य"
                        {...field}
                        className="bg-gray-800 text-white border-gray-700 h-12 text-base"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-700 text-white hover:bg-blue-600 transition-colors h-12 text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
                  सेव करत आहे...
                </>
              ) : (
                "कंपनीचे तपशील जतन करा"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CompanyRegistrationForm;