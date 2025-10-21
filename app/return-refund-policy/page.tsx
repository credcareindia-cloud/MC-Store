"use client"

import { Suspense } from "react"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

function ReturnRefundPolicyContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <RotateCcw className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Return & Refund Policy</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We want you to be completely satisfied with your purchase. Learn about our return and refund process.
          </p>
          <Badge variant="outline" className="mt-4 bg-green-50 text-green-700 border-green-200">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Quick Info */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Easy Returns:</strong> 7-day return window • Free return shipping for defective items • Quick refund processing
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Return Window */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Return Window
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">7-Day Return Policy</h4>
                </div>
                <p className="text-blue-800 text-sm">
                  You have 7 days from the date of delivery to initiate a return for eligible items.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Eligible for Return
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Items in original packaging</li>
                    <li>• Unworn and unused items</li>
                    <li>• Unboxing video required</li>
                    <li>• Defective or damaged products</li>
                    <li>• Wrong items received</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Not Eligible for Return
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Worn or used items</li>
                    <li>• Items without original tags</li>
                    <li>• Damaged by customer</li>
                    <li>• Personalized/custom items</li>
                    <li>• Items after 7 days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                How to Return Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Initiate Return Request</h4>
                    <p className="text-gray-600 text-sm">Contact our customer service or use the return form on your order page within 7 days of delivery.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Get Return Authorization</h4>
                    <p className="text-gray-600 text-sm">We'll provide you with a return authorization number and shipping instructions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Package & Ship</h4>
                    <p className="text-gray-600 text-sm">Carefully package the item in its original condition and ship it back using our provided label.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Processing & Refund</h4>
                    <p className="text-gray-600 text-sm">Once we receive and inspect your return, we'll process your refund within 3-5 business days.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Exchange Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                Exchange Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Size & Color Exchanges</h4>
                <p className="text-blue-800 text-sm">
                  We offer size and color exchanges for the same product within 7 days, subject to availability.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Exchange Process</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Contact customer service</li>
                    <li>• Check size/color availability</li>
                    <li>• Return original item</li>
                    <li>• Receive replacement</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Exchange Shipping</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Free return shipping</li>
                    <li>• Free replacement shipping</li>
                    <li>• Same day processing</li>
                    <li>• 2-3 days delivery</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Special Circumstances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-red-400 bg-red-50 p-4">
                <h4 className="font-medium text-red-900 mb-2">Damaged or Defective Items</h4>
                <p className="text-red-800 text-sm">
                  If you receive a damaged or defective item, please contact us within 24 hours. 
                  We'll provide a prepaid return label and expedite your refund or replacement.
                </p>
              </div>

              <div className="border-l-4 border-orange-400 bg-orange-50 p-4">
                <h4 className="font-medium text-orange-900 mb-2">Wrong Item Received</h4>
                <p className="text-orange-800 text-sm">
                  If you receive the wrong item, we'll cover all return shipping costs and send the correct item immediately. 
                  No questions asked!
                </p>
              </div>

              <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Late Delivery Compensation</h4>
                <p className="text-yellow-800 text-sm">
                  If your order arrives significantly later than promised, you may be eligible for a partial refund or store credit as compensation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quality Guarantee */}
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">100% Quality Guarantee</h3>
                <p className="text-green-100 mb-4">
                  We stand behind the quality of our products. If you're not completely satisfied, 
                  we'll make it right with a full refund or replacement.
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Quality Assured
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Easy Returns
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Fast Refunds
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Need Help with Returns?</h3>
              <p className="text-gray-300 mb-4">
                Our friendly customer service team is here to assist you with any return or refund questions.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span>📧 returns@sabsonline.com</span>
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

export default function ReturnRefundPolicyPage() {
  return (
    <Suspense fallback={<div>Loading return & refund policy...</div>}>
      <ReturnRefundPolicyContent />
    </Suspense>
  )
}