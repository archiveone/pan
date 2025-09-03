"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { MapPin, Home, Calendar, Ruler, FileText, Clock, DollarSign } from "lucide-react";

const formSchema = z.object({
    propertyAddress: z.string().min(1, "Property address is required"),
    propertyType: z.enum(["HOUSE", "APARTMENT", "COMMERCIAL", "LAND"]),
    bedrooms: z.coerce.number().optional(),
    bathrooms: z.coerce.number().optional(),
    squareFootage: z.coerce.number().optional(),
    yearBuilt: z.coerce.number().optional(),
    description: z.string().optional(),
    urgency: z.enum(["URGENT", "STANDARD", "FLEXIBLE"]).default("STANDARD"),
    requestType: z.enum(["MARKET_VALUE", "INSURANCE", "MORTGAGE", "PROBATE", "TAX_ASSESSMENT"]).default("MARKET_VALUE"),
});

type FormData = z.infer<typeof formSchema>;

const propertyTypeOptions = [
  { value: "HOUSE", label: "House", icon: Home },
  { value: "APARTMENT", label: "Apartment", icon: Home },
  { value: "COMMERCIAL", label: "Commercial", icon: Home },
  { value: "LAND", label: "Land", icon: Home },
  ];

const urgencyOptions = [
  { value: "URGENT", label: "Urgent (1-2 days)", color: "destructive" },
  { value: "STANDARD", label: "Standard (3-5 days)", color: "default" },
  { value: "FLEXIBLE", label: "Flexible (1-2 weeks)", color: "secondary" },
  ];

const requestTypeOptions = [
  { value: "MARKET_VALUE", label: "Market Value", description: "Current market price estimation" },
  { value: "INSURANCE", label: "Insurance", description: "For insurance coverage purposes" },
  { value: "MORTGAGE", label: "Mortgage", description: "For mortgage application" },
  { value: "PROBATE", label: "Probate", description: "For estate settlement" },
  { value: "TAX_ASSESSMENT", label: "Tax Assessment", description: "For tax purposes" },
  ];

export function ValuationRequestForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

  const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
                urgency: "STANDARD",
                requestType: "MARKET_VALUE",
        },
  });

  const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);

        try {
                const response = await fetch("/api/valuations", {
                          method: "POST",
                          headers: {
                                      "Content-Type": "application/json",
                          },
                          body: JSON.stringify(data),
                });

          if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || "Failed to submit valuation request");
          }

          const result = await response.json();

          toast.success("Valuation request submitted successfully!", {
                    description: "You'll receive bids from qualified agents soon.",
          });

          // Redirect to the valuation dashboard or request details
          router.push(`/valuations/${result.id}`);
        } catch (error) {
                console.error("Error submitting valuation request:", error);
                toast.error("Failed to submit valuation request", {
                          description: error instanceof Error ? error.message : "Please try again later.",
                });
        } finally {
                setIsSubmitting(false);
        }
  };

  const selectedUrgency = urgencyOptions.find(option => option.value === form.watch("urgency"));

  return (
        <div className="max-w-4xl mx-auto p-6 space-y
