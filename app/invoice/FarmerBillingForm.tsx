"use client";
import React, { useState, useMemo } from "react";
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
import { db } from "@/lib/firebaseConfig"; // Adjust the path to your firebase.js file
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

// Define the product type explicitly
type Product = z.infer<typeof productSchema> & { id: string };

// Define the expense type
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
  // Main form
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

  // Product input form
  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productType: "",
      quantity: 0,
      rate: 0,
    },
  });

  // State to store products and total value
  const [products, setProducts] = useState<Product[]>([]);
  const [totalValueOfProducts, setTotalValueOfProducts] = useState(0);

  // State to store expenses
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

  // Add a loading state
  const [loading, setLoading] = useState(false);

  // Function to calculate total value of products
  const totalValueOfProductsFunction = (updatedProducts: Product[]) => {
    const total = updatedProducts.reduce(
      (sum, product) => sum + product.quantity * product.rate,
      0
    );
    setTotalValueOfProducts(total);
  };

  // Add product to the list
  const addProduct = (data: z.infer<typeof productSchema>) => {
    const newProduct: Product = {
      ...data,
      id: Math.random().toString(36).substr(2, 9), // Generate unique ID
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    totalValueOfProductsFunction(updatedProducts); // Update total after adding
    productForm.reset();
  };

  // Remove product from the list
  const removeProduct = (id: string) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    totalValueOfProductsFunction(updatedProducts); // Update total after removing
  };

  // Handle expense input change
  const handleExpenseChange = (field: keyof Expenses, value: string) => {
    setExpenses((prev) => ({
      ...prev,
      [field]: Number(value) || 0, // Convert to number, default to 0 if invalid
    }));
  };

  // Calculate total expense using useMemo to avoid unnecessary recalculations
  const totalExpense = useMemo(() => {
    return Object.values(expenses).reduce((sum, value) => sum + value, 0);
  }, [expenses]);

  // Calculate total payable amount
  const totalPayableAmount = totalValueOfProducts - totalExpense;
  const router = useRouter();

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const completeSubmission = {
      ...values,
      products: products,
      totalValue: totalValueOfProducts,
      expenses: expenses,
      totalExpense: totalExpense,
      totalPayableAmount: totalPayableAmount,
    };

    // Start loading state
    setLoading(true);

    // Show a loading toast
    const toastId = toast.loading("Saving bill to Firestore...");

    try {
      const session = await getUserSession();
      if (!session?.user?.id) {
        toast.error("Please sign in to save a bill.", { id: toastId });
        setLoading(false);
        return;
      }

      console.log(completeSubmission);
      const userID = session.user.id;
      const userDocRef = doc(db, "users", userID);

      const billDocRef = doc(collection(userDocRef, "bills"), values.billNumber);

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
        billDate: values.billDate, // Firestore will automatically convert Date to Timestamp
        products: products.map((product) => ({
          productType: product.productType,
          quantity: product.quantity,
          rate: product.rate,
        })), // Remove the temporary 'id' field
        totalValue: totalValueOfProducts,
        expenses: expenses,
        totalExpense: totalExpense,
        totalPayableAmount: totalPayableAmount,
      };

      await setDoc(billDocRef, billData);

      // Update toast to success
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
      router.replace("/");
    } catch (error) {
      console.error("Error saving bill to Firestore:", error);
      // Update toast to error
      toast.error("Failed to save bill. Please try again.", { id: toastId });
    } finally {
      // Stop loading state
      setLoading(false);
    }
  }

  // Combined handler for adding product
  const handleAddProduct = () => {
    productForm.handleSubmit(addProduct)();
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-5xl sm:p-8 md:p-10 rounded-xl shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Farmer Name - Full Row */}
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
                      disabled={loading} // Disable input during loading
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            {/* Phone Number & City - Responsive Grid */}
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
                        disabled={loading} // Disable input during loading
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
                        disabled={loading} // Disable input during loading
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Bill Date & Bill Number - Responsive Grid */}
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
                            disabled={loading} // Disable button during loading
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
                        disabled={loading} // Disable input during loading
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
            <div className="border-b-2"></div>

            {/* Product Input Section */}
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
                        disabled={loading} // Disable input during loading
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
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                        className="bg-gray-800 text-white border-gray-700"
                        disabled={loading} // Disable input during loading
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
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                        className="bg-gray-800 text-white border-gray-700"
                        disabled={loading} // Disable input during loading
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Add Product Button */}
            <Button
              type="button"
              onClick={handleAddProduct}
              className="bg-blue-700 text-white hover:bg-blue-600 transition-colors"
              disabled={loading} // Disable button during loading
            >
              <PlusIcon className="mr-2 h-4 w-4" /> माल जोडा
            </Button>

            {/* Product Details Table */}
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
                          disabled={loading} // Disable button during loading
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

            {/* Expense Cost Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-300">
                  खर्चाचा तपशील
                </h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
                {/* आडत */}
                <div>
                  <label className="block text-gray-300 mb-1">आडत</label>
                  <Input
                    type="number"
                    value={expenses.adat}
                    onChange={(e) => handleExpenseChange("adat", e.target.value)}
                    className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                    placeholder="आडत"
                    disabled={loading} // Disable input during loading
                  />
                </div>

                {/* हमाली */}
                <div>
                  <label className="block text-gray-300 mb-1">हमाली</label>
                  <Input
                    type="number"
                    value={expenses.hamali}
                    onChange={(e) =>
                      handleExpenseChange("hamali", e.target.value)
                    }
                    className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                    placeholder="हमाली"
                    disabled={loading} // Disable input during loading
                  />
                </div>

                {/* तोलाई */}
                <div>
                  <label className="block text-gray-300 mb-1">तोलाई</label>
                  <Input
                    type="number"
                    value={expenses.tolai}
                    onChange={(e) =>
                      handleExpenseChange("tolai", e.target.value)
                    }
                    className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                    placeholder="तोलाई"
                    disabled={loading} // Disable input during loading
                  />
                </div>

                {/* वराई */}
                <div>
                  <label className="block text-gray-300 mb-1">वराई</label>
                  <Input
                    type="number"
                    value={expenses.varai}
                    onChange={(e) =>
                      handleExpenseChange("varai", e.target.value)
                    }
                    className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                    placeholder="वराई"
                    disabled={loading} // Disable input during loading
                  />
                </div>

                {/* भराई */}
                <div>
                  <label className="block text-gray-300 mb-1">भराई</label>
                  <Input
                    type="number"
                    value={expenses.bharai}
                    onChange={(e) =>
                      handleExpenseChange("bharai", e.target.value)
                    }
                    className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                    placeholder="भराई"
                    disabled={loading} // Disable input during loading
                  />
                </div>

                {/* मोटर भाडे */}
                <div>
                  <label className="block text-gray-300 mb-1">मोटर भाडे</label>
                  <Input
                    type="number"
                    value={expenses.motorBhade}
                    onChange={(e) =>
                      handleExpenseChange("motorBhade", e.target.value)
                    }
                    className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                    placeholder="मोटर भाडे"
                    disabled={loading} // Disable input during loading
                  />
                </div>

                {/* उच्छल */}
                <div>
                  <label className="block text-gray-300 mb-1">उच्छल</label>
                  <Input
                    type="number"
                    value={expenses.uchhal}
                    onChange={(e) =>
                      handleExpenseChange("uchhal", e.target.value)
                    }
                    className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                    placeholder="उच्छल"
                    disabled={loading} // Disable input during loading
                  />
                </div>

                {/* बर्दाना */}
                <div>
                  <label className="block text-gray-300 mb-1">बर्दाना</label>
                  <Input
                    type="number"
                    value={expenses.bardana}
                    onChange={(e) =>
                      handleExpenseChange("bardana", e.target.value)
                    }
                    className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                    placeholder="बर्दाना"
                    disabled={loading} // Disable input during loading
                  />
                </div>

                {/* इतर */}
                <div>
                  <label className="block text-gray-300 mb-1">इतर</label>
                  <Input
                    type="number"
                    value={expenses.itar}
                    onChange={(e) =>
                      handleExpenseChange("itar", e.target.value)
                    }
                    className="bg-gray-800 text-white border-gray-700 focus:ring-2 focus:ring-blue-600 h-12 text-base"
                    placeholder="इतर"
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <p className="text-gray-300 mt-4 justify-end">
                  एकूण खर्च:{" "}
                  <span className="font-semibold">{totalExpense}</span>
                </p>
              </div>
            </div>
            <div className="border-b-2"></div>

            {/* Total Payable Amount */}
            <div className="flex justify-end">
              <p className="text-gray-300 text-lg">
                एकूण देय रक्कम:{" "}
                <span className="font-semibold">{totalPayableAmount}</span>
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-700 text-white hover:bg-blue-600 transition-colors h-12 text-base"
              disabled={loading} // Disable button during loading
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "बिल जतन करा"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default FarmerBillingForm;