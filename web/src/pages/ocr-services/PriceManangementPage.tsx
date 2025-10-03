"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge.tsx';
import { Separator } from '../../components/ui/separator';
import { ChevronDown, ChevronUp, FileText, Image, Activity } from "lucide-react"
import { useSubIdContext } from '../../contexts/SubIdContext';

export function PriceManagementPage() {
  const { subId } = useSubIdContext();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  // Sample data for Usage Breakdown
  const sampleData = {
    categories: [
      {
        id: "ocr",
        name: "OCR Processing",
        icon: FileText,
        count: 1245,
        unitPrice: "฿2.50 per request",
        cost: 3112.50,
        description: "Optical Character Recognition processing for document digitization"
      },
      {
        id: "storage",
        name: "Image Storage",
        icon: Image,
        count: 15,
        unitPrice: "฿10.00 per GB",
        cost: 150.00,
        description: "Secure cloud storage for processed images and documents"
      },
      {
        id: "api",
        name: "API Calls",
        icon: Activity,
        count: 3456,
        unitPrice: "฿0.05 per call",
        cost: 172.80,
        description: "REST API calls for data access and processing"
      }
    ],
    subtotalBeforeCredits: 3435.30,
    credits: -500.00,
    totalAfterCredits: 2935.30
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const getCurrentUTCDateRange = () => {
    const now = new Date()
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000)

    const year = utcNow.getUTCFullYear()
    const month = utcNow.getUTCMonth()
    const currentDay = utcNow.getUTCDate()

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const monthName = monthNames[month]
    return `${monthName} 1 - ${currentDay}, ${year}`
  }

  

  
    

  // Check if all sections are currently expanded
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Month-to-Date Summary {getCurrentUTCDateRange()}</h1>
          <p className="">These charges are factored into your account balance.</p>
          <p className=" text-sm mt-1">
            Organization: <span className="font-semibold">{subId}</span>
          </p>
        </div>
      </div>

      {/* Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
          <CardDescription>Detailed cost breakdown by service category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sampleData.categories.map((category) => {
            const Icon = category.icon
            const isExpanded = expandedCategories.includes(category.id)

            return (
              <div key={category.id} className="border rounded-lg">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">
                        {category.name} ({category.count.toLocaleString()})
                      </h3>
                      <p className="text-sm text-muted-foreground">{category.unitPrice}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-bold">
                      ฿{category.cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t bg-muted/20">
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                      <Button variant="outline" size="sm">
                        View {category.name} Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Estimate Summary & Credits Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estimate Summary */}
        <Card className="w-full bg-white border rounded-2xl shadow-sm p-6">
          <CardHeader>
            <CardTitle>Monthly Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                ฿{sampleData.totalAfterCredits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground">Current month projection</p>
            </div>
          </CardContent>
        </Card>

        {/* Credits & Adjustments */}
        <Card className="w-full bg-white border rounded-2xl shadow-sm p-6">
          <CardHeader>
            <CardTitle>Credits & Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-medium">
                  ฿{sampleData.subtotalBeforeCredits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span>Credits Applied</span>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    Saved ฿{Math.abs(sampleData.credits).toLocaleString()}
                  </Badge>
                </div>
                <span className="font-medium text-green-600">
                  ฿{sampleData.credits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Grand Total</span>
                <span>฿{sampleData.totalAfterCredits.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <p className="text-sm ">
        View past invoices in your{" "}
        <Button variant="link" className="p-0 h-auto text-blue-600">
          Billing History
        </Button>
        .
      </p>
    </div>
  );
}