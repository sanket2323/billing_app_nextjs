"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  farmerName: z.string().min(2, {
    message: "Farmer name must be at least 2 characters.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  billNumber: z.string().min(1, {
    message: "Bill number is required.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
});

export function FarmerProfileForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmerName: "",
      phoneNumber: "",
      city: "",
      billNumber: "",
    },
  });

  const onSubmit = (data: unknown) => {
    console.log("Submitted Data:", data);
    // You would handle form submission here (e.g., API call)
  };

  return (
    <div className="w-full">
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            <span className="text-blue-500">Farmer</span> Details
          </h2>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="farmerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Farmer Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          className="bg-gray-700 border-gray-600 text-white w-full"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-300 text-xs">
                        Enter the farmer&apos;s full name.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234567890"
                          {...field}
                          className="bg-gray-700 border-gray-600 text-white w-full"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-300 text-xs">
                        Contact phone number.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Farmville"
                          {...field}
                          className="bg-gray-700 border-gray-600 text-white w-full"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-300 text-xs">
                        Enter the city name.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Bill Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="BN12345"
                          {...field}
                          className="bg-gray-700 border-gray-600 text-white w-full"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-300 text-xs">
                        Enter the bill reference number.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6 max-w-md">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal flex justify-between items-center bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                                !field.value && "text-gray-400"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select a date</span>
                              )}
                              <CalendarIcon className="h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-gray-800 border-gray-700"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            className="bg-gray-800 text-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-gray-300 text-xs">
                        Select the billing date.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-8">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Invoice
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
