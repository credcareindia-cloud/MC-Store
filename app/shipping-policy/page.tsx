"use client"

import { Suspense } from "react"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { Truck, Clock, MapPin, Package, AlertCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function ShippingPolicyContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Truck className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Shipping Policy</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn about our shipping methods, delivery times, and policies for both domestic and international orders.
          </p>
          <Badge variant="outline" className="mt-4 bg-blue-50 text-blue-700 border-blue-200">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-blue-900">Processing Time</p>
              <p className="text-sm text-blue-700">1-2 business days in UAE, 3-6 business days in India</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900">Free Shipping</p>
              <p className="text-sm text-green-700">Orders over AED 200 or ₹3000</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="font-semibold text-orange-900">Delivery</p>
              <p className="text-sm text-orange-700">UAE & India</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Processing Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Order Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Standard Processing</p>
                    <p className="text-blue-700 text-sm">All orders are processed within 1-2 business days in UAE, 3-6 business days in India (Monday to Friday, excluding holidays).</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Orders placed before 11:00 AM are typically processed the same day</li>
                <li>• Orders placed on weekends or holidays will be processed the next business day</li>
                <li>• You will receive an email confirmation once your order has been processed and shipped</li>
                <li>• Custom or personalized items may require additional processing time</li>
              </ul>
            </CardContent>
          </Card>

          {/* Shipping Methods UAE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                UAE Shipping Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">Express Delivery</h4>
                    <Badge className="bg-green-100 text-blue-800">AED 10</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">Next Working day delivery in all over UAE</p>
                  <p className="text-xs text-gray-500">Same day delivery available for orders placed before 11:00 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Methods India */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                India Shipping Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">Express Delivery</h4>
                    <Badge className="bg-orange-100 text-blue-800">₹ 70</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">Delivery within 2-5 business days</p>
                  <p className="text-xs text-gray-500">All India Delivery Available</p>
                </div>

                
              </div>
            </CardContent>
          </Card>

          {/* Special Circumstances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Delivery Delays</h4>
                <p className="text-amber-800 text-sm">
                  During peak seasons (Ramadan, Eid, Diwali) or adverse weather conditions, 
                  deliveries may take longer than usual. We appreciate your patience.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Address Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complete and accurate address</li>
                    <li>• Working phone number</li>
                    <li>• Landmark references (if needed)</li>
                    <li>• Apartment/Villa number</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Attempts</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 3 delivery attempts will be made</li>
                    <li>• SMS/Call before delivery</li>
                    <li>• Packages held for 7 days</li>
                    <li>• Return shipping may apply</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Order Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Once your order is shipped, you will receive a tracking number via email and SMS. 
                You can track your package using:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900">UAE Tracking</h4>
                  <p className="text-sm text-purple-700">Emirates Post, Aramex, or local courier partners</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900">India Tracking</h4>
                  <p className="text-sm text-purple-700">DTDC, or India Post tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Need Help with Shipping?</h3>
              <p className="text-gray-300 mb-4">
                Our customer service team is here to help with any shipping questions or concerns.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span>📧 support@sabsonline.com</span>
                <span>📱 WhatsApp: +971-56666-7178</span>
                <span>⏰ Sun-Thu: 9AM-6PM GST</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default function ShippingPolicyPage() {
  return (
    <Suspense fallback={<div>Loading shipping policy...</div>}>
      <ShippingPolicyContent />
    </Suspense>
  )
}