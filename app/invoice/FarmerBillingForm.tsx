"use client";
import React, { useState, useMemo, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { getUserSession } from "@/app/actions/auth-actions";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import FarmerBillingPDF from "../pdf/FarmerBillingPDF";

interface CompanyDetails {
  address: string;
  alternatePhoneNumber?: string | null;
  city: string;
  companyName: string;
  createdAt: string; // You can use Date if you plan to convert it
  gstNumber?: string | null;
  phoneNumber: string;
  registrationNumber: string;
  state: string;
}
// type Bill = {
//   id: string;
//   billDate: { seconds: number; nanoseconds: number };
//   billNumber: string;
//   amount?: number;
//   expense: Expenses;
//   city: string;
//   farmerName: string;
//   product: Product[];
//   totalExpense: number;
//   totalPayableAmount: number;
//   totalValue: number;
// };

// Form schema
const formSchema = z.object({
  farmerName: z
    .string()
    .min(2, { message: "शेतकऱ्याचे नाव किमान 2 अक्षरे असावे" })
    .max(50),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "योग्य फोन क्रमांक टाका" }),
  city: z
    .string()
    .min(2, { message: "शहराचे नाव किमान 2 अक्षरे असावे" })
    .max(50),
  billNumber: z.string().min(1, { message: "बिल क्रमांक आवश्यक आहे" }),
  billDate: z.date(),
});

// Product input schema
const productSchema = z.object({
  productType: z.string().min(1, { message: "मालाचा प्रकार आवश्यक आहे" }),
  quantity: z.number().min(0, { message: "वैध संख्या टाका" }),
  rate: z.number().min(0, { message: "वैध दर टाका" }),
});

type Product = z.infer<typeof productSchema> & { id: string };

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

const FarmerBillingForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmerName: "",
      phoneNumber: "",
      city: "",
      billNumber: "",
      billDate: new Date(),
    },
  });

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productType: "",
      quantity: 0,
      rate: 0,
    },
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [totalValueOfProducts, setTotalValueOfProducts] = useState(0);
  const [expenses, setExpenses] = useState<Expenses>({
    adat: 0,
    hamali: 0,
    tolai: 0,
    varai: 0,
    bharai: 0,
    motorBhade: 0,
    uchhal: 0,
    bardana: 0,
    itar: 0,
  });
  const [loading, setLoading] = useState(false);

  const totalValueOfProductsFunction = (updatedProducts: Product[]) => {
    const total = updatedProducts.reduce(
      (sum, product) => sum + product.quantity * product.rate,
      0
    );
    setTotalValueOfProducts(total);
  };

  const addProduct = (data: z.infer<typeof productSchema>) => {
    const newProduct: Product = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    totalValueOfProductsFunction(updatedProducts);
    productForm.reset();
  };

  const removeProduct = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    totalValueOfProductsFunction(updatedProducts);
  };

  const handleExpenseChange = (field: keyof Expenses, value: string) => {
    let processedValue = value;
    if (value.length > 1 && value.startsWith("0")) {
      processedValue = value.replace(/^0+/, "");
    }

    setExpenses((prev) => ({
      ...prev,
      [field]: processedValue === "" ? 0 : Number(processedValue),
    }));
  };

  const totalExpense = useMemo(() => {
    return Object.values(expenses).reduce((sum, value) => sum + value, 0);
  }, [expenses]);

  const totalPayableAmount = totalValueOfProducts - totalExpense;
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateAndDownloadPDF = async (billData: any) => {
    if (!companyDetails) {
      const fetchedCompanyDetails = await fetchCompanyDetails();
      if (!fetchedCompanyDetails) {
        toast.error("Cannot generate PDF without company details");
        return;
      }

      const blob = await pdf(
        <FarmerBillingPDF
          billData={billData}
          companyDetails={fetchedCompanyDetails}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bill_${billData.billNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const blob = await pdf(
        <FarmerBillingPDF billData={billData} companyDetails={companyDetails} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bill_${billData.billNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const session = await getUserSession();
      if (!session?.user?.id) {
        toast.error("Please sign in to access company details.");
        return null;
      }
      const userId = session.user.id;
      const userDocRef = doc(db, "users", userId);
      const companyRef = collection(userDocRef, "company_details");
      const querySnapshotCompany = await getDocs(companyRef);

      if (!querySnapshotCompany.empty) {
        // Get the first company details document
        const companyData =
          querySnapshotCompany.docs[0].data() as CompanyDetails;
        setCompanyDetails(companyData);
        return companyData;
      } else {
        toast.error(
          "No company details found. Please set up your company profile first."
        );
        return null;
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
      toast.error("Failed to fetch company data");
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCompanyDetails();
    })();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const completeSubmission = {
      ...values,
      products,
      totalValue: totalValueOfProducts,
      expenses,
      totalExpense,
      totalPayableAmount,
    };
    setLoading(true);
    const toastId = toast.loading("Saving bill to Firestore...");
    console.log(completeSubmission);
    try {
      const session = await getUserSession();
      if (!session?.user?.id) {
        toast.error("Please sign in to save a bill.", { id: toastId });
        setLoading(false);
        return;
      }

      const userID = session.user.id;
      const userDocRef = doc(db, "users", userID);
      const billDocRef = doc(
        collection(userDocRef, "bills"),
        values.billNumber
      );

      const billSnapshot = await getDoc(billDocRef);
      if (billSnapshot.exists()) {
        toast.error(
          "Bill number already exists for this user. Please use a unique bill number.",
          { id: toastId }
        );
        setLoading(false);
        return;
      }

      const billData = {
        farmerName: values.farmerName,
        phoneNumber: values.phoneNumber,
        city: values.city,
        billNumber: values.billNumber,
        billDate: values.billDate,
        products: products.map((product) => ({
          productType: product.productType,
          quantity: product.quantity,
          rate: product.rate,
        })),
        totalValue: totalValueOfProducts,
        expenses,
        totalExpense,
        totalPayableAmount,
      };

      await setDoc(billDocRef, billData);
      await generateAndDownloadPDF(billData);

      toast.success("Bill saved successfully to Firestore!", { id: toastId });

      form.reset();
      setProducts([]);
      setExpenses({
        adat: 0,
        hamali: 0,
        tolai: 0,
        varai: 0,
        bharai: 0,
        motorBhade: 0,
        uchhal: 0,
        bardana: 0,
        itar: 0,
      });

      router.push("/");
    } catch (error) {
      console.error("Error saving bill to Firestore:", error);
      toast.error("Failed to save bill. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  const handleAddProduct = () => {
    productForm.handleSubmit(addProduct)();
  };
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(
    null
  );
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-5xl sm:p-8 md:p-10 rounded-xl shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="farmerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">
                    शेतकऱ्याचे नाव
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="शेतकऱ्याचे नाव टाका"
                      {...field}
                      className="bg-gray-800 text-white border-gray-700 focus:ring-1 focus:ring-blue-600 h-12 text-base"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">फोन क्रमांक</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="फोन क्रमांक टाका"
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
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">शहर</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="शहराचे नाव टाका"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="billDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">बिल तारीख</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal h-12 text-base",
                              "bg-gray-800 text-white border-gray-700 hover:bg-gray-700",
                              !field.value && "text-gray-500"
                            )}
                            disabled={loading}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>बिलाची तारीख निवडा</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-gray-400" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="bg-gray-900 text-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">बिल क्रमांक</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="बिल क्रमांक"
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
            <div className="border-b-2"></div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FormField
                control={productForm.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      मालाचा प्रकार
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="मालाचा प्रकार"
                        {...field}
                        className="bg-gray-800 text-white border-gray-700"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">नग</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="नग"
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          // If the field is empty, set it to 0 in the form state,
                          // but display empty string in the input
                          field.onChange(value === "" ? 0 : Number(value));
                        }}
                        className="bg-gray-800 text-white border-gray-700"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">दर</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="दर"
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : Number(value));
                        }}
                        className="bg-gray-800 text-white border-gray-700"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="button"
              onClick={handleAddProduct}
              className="bg-blue-700 text-white hover:bg-blue-600 transition-colors"
              disabled={loading}
              aria-label="Add Product"
            >
              <PlusIcon className="mr-2 h-4 w-4" /> माल जोडा
            </Button>

            <div className="w-full">
              <Table className="w-full">
                <TableCaption>मालाचा तपशील</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">मालाचा प्रकार</TableHead>
                    <TableHead className="w-[100px]">नग</TableHead>
                    <TableHead className="w-[100px]">दर</TableHead>
                    <TableHead className="w-[100px] text-right">
                      रक्कम
                    </TableHead>
                    <TableHead className="w-[100px] text-center">
                      क्रिया
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.productType}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.rate}</TableCell>
                      <TableCell className="text-right">
                        {product.quantity * product.rate}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeProduct(product.id)}
                          className="bg-red-600 hover:bg-red-500"
                          disabled={loading}
                          aria-label="Remove Product"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>एकूण किंमत:</TableCell>
                    <TableCell className="text-right">
                      {totalValueOfProducts}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            <div className="border-b-2"></div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-300">
                  खर्चाचा तपशील
                </h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
                {Object.entries(expenses).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-gray-300 mb-1">
                      {key === "adat"
                        ? "आडत"
                        : key === "hamali"
                        ? "हमाली"
                        : key === "tolai"
                        ? "तोलाई"
                        : key === "varai"
                        ? "वराई"
                        : key === "bharai"
                        ? "भराई"
                        : key === "motorBhade"
                        ? "मोटर भाडे"
                        : key === "uchhal"
                        ? "उच्छल"
                        : key === "bardana"
                        ? "बर्दाना"
                        : "इतर"}
                    </label>
                    <Input
                      type="number"
                      value={value === 0 ? "" : value}
                      onChange={(e) =>
                        handleExpenseChange(
                          key as keyof Expenses,
                          e.target.value
                        )
                      }
                      className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                      placeholder={
                        key === "adat"
                          ? "आडत"
                          : key === "hamali"
                          ? "हमाली"
                          : key === "tolai"
                          ? "तोलाई"
                          : key === "varai"
                          ? "वराई"
                          : key === "bharai"
                          ? "भराई"
                          : key === "motorBhade"
                          ? "मोटर भाडे"
                          : key === "uchhal"
                          ? "उच्छल"
                          : key === "bardana"
                          ? "बर्दाना"
                          : "इतर"
                      }
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <p className="text-gray-300 mt-4">
                  एकूण खर्च:{" "}
                  <span className="font-semibold">{totalExpense}</span>
                </p>
              </div>
            </div>
            <div className="border-b-2"></div>

            <div className="flex justify-end">
              <p className="text-gray-300 text-lg">
                एकूण देय रक्कम:{" "}
                <span className="font-semibold">{totalPayableAmount}</span>
              </p>
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
                  Saving...
                </>
              ) : (
                "बिल जतन करा आणि डाउनलोड करा"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default FarmerBillingForm;
