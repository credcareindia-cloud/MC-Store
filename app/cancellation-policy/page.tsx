"use client"

import { Suspense } from "react"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { XCircle, Clock, CheckCircle, AlertCircle, CreditCard, Ban } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

function CancellationPolicyContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <XCircle className="w-8 h-8 text-zinc-700" />
            <h1 className="text-3xl font-bold text-gray-900">Cancellation Policy</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Need to cancel your order? Learn about our cancellation process and refund timelines.
          </p>
          <Badge variant="outline" className="mt-4 bg-zinc-50 text-zinc-700 border-zinc-200">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Quick Info */}
        <Alert className="mb-8 border-zinc-200 bg-zinc-50">
          <AlertCircle className="h-4 w-4 text-zinc-600" />
          <AlertDescription className="text-zinc-800">
            <strong>Quick Cancellation:</strong> Cancel within 2 hours for instant refund • Partial cancellations available • 24/7 customer support
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Cancellation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-600" />
                Cancellation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-zinc-600" />
                    <h4 className="font-semibold text-zinc-900">Within 2 Hours of Ordering</h4>
                  </div>
                  <p className="text-zinc-700 text-sm mb-2">Full cancellation with 100% refund</p>
                  <ul className="text-xs text-zinc-600 space-y-1">
                    <li>• Instant cancellation</li>
                    <li>• No cancellation fees</li>
                    <li>• Full refund processed immediately</li>
                    <li>• Available for all payment methods</li>
                  </ul>
                </div>

                <div className="bg-zinc-100 border border-zinc-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-zinc-600" />
                    <h4 className="font-semibold text-zinc-900">2-24 Hours After Ordering</h4>
                  </div>
                  <p className="text-zinc-700 text-sm mb-2">Cancellation subject to processing status</p>
                  <ul className="text-xs text-zinc-600 space-y-1">
                    <li>• 95% refund if not processed</li>
                    <li>• 5% processing fee may apply</li>
                    <li>• Refund within 24-48 hours</li>
                    <li>• Contact customer service required</li>
                  </ul>
                </div>

                <div className="bg-zinc-50 border border-zinc-300 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Ban className="w-5 h-5 text-zinc-700" />
                    <h4 className="font-semibold text-zinc-900">After Order is Shipped</h4>
                  </div>
                  <p className="text-zinc-700 text-sm mb-2">Cancellation not possible - Return policy applies</p>
                  <ul className="text-xs text-zinc-600 space-y-1">
                    <li>• Order cannot be cancelled</li>
                    <li>• Must follow return policy</li>
                    <li>• 7-day return window available</li>
                    <li>• Return shipping may apply</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Cancel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-purple-600" />
                How to Cancel Your Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Multiple Ways to Cancel</h4>
                  <p className="text-purple-800 text-sm">Choose the most convenient method for you to cancel your order quickly and easily.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <span className="bg-zinc-200 text-zinc-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                      Online Cancellation
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Log into your account</li>
                      <li>• Go to "My Orders"</li>
                      <li>• Click "Cancel Order"</li>
                      <li>• Confirm cancellation</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <span className="bg-zinc-200 text-zinc-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                      Customer Service
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Call our support line</li>
                      <li>• WhatsApp customer service</li>
                      <li>• Email with order details</li>
                      <li>• Live chat support</li>
                    </ul>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-zinc-200 text-zinc-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                    Required Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Order number</li>
                      <li>• Registered email address</li>
                      <li>• Phone number</li>
                    </ul>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Reason for cancellation</li>
                      <li>• Preferred refund method</li>
                      <li>• Order date</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partial Cancellation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-zinc-600" />
                Partial Order Cancellation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                <h4 className="font-semibold text-zinc-900 mb-2">Cancel Specific Items</h4>
                <p className="text-zinc-700 text-sm">
                  You can cancel individual items from your order if the entire order hasn't been processed yet.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Eligible Items</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Items not yet processed</li>
                    <li>• In-stock regular items</li>
                    <li>• Non-customized products</li>
                    <li>• Standard shipping items</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Refund Calculation</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Item price refunded</li>
                    <li>• Proportional tax refund</li>
                    <li>• Shipping cost adjusted</li>
                    <li>• Discount recalculated</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-zinc-600" />
                Refund Process for Cancelled Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">Credit/Debit Card</h4>
                      <Badge className="bg-zinc-100 text-zinc-800 border border-zinc-200">3-5 days</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">Refunds processed back to your original payment method automatically.</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">Cash on Delivery (COD)</h4>
                      <Badge className="bg-zinc-100 text-zinc-800 border border-zinc-200">1-2 days</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">Bank transfer to your provided account details (account details required).</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">Digital Wallet</h4>
                      <Badge className="bg-purple-100 text-purple-800">1-3 days</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">Instant refund for early cancellations, 1-3 days for processed orders.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Cases */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-zinc-600" />
                Special Cancellation Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-zinc-400 bg-zinc-50 p-4">
                <h4 className="font-medium text-zinc-900 mb-2">Pre-Order Items</h4>
                <p className="text-zinc-700 text-sm">
                  Pre-order items can be cancelled anytime before the official release date with full refund. 
                  Cancellation fees may apply if cancelled within 24 hours of release.
                </p>
              </div>

              <div className="border-l-4 border-zinc-400 bg-zinc-50 p-4">
                <h4 className="font-medium text-zinc-900 mb-2">Custom/Personalized Items</h4>
                <p className="text-zinc-700 text-sm">
                  Custom items can only be cancelled within 1 hour of ordering. Once production starts, 
                  cancellation is not possible due to the personalized nature.
                </p>
              </div>

              <div className="border-l-4 border-zinc-400 bg-zinc-50 p-4">
                <h4 className="font-medium text-zinc-900 mb-2">Sale/Clearance Items</h4>
                <p className="text-zinc-700 text-sm">
                  Sale items follow the same cancellation policy but may have limited availability for re-ordering 
                  if you change your mind later.
                </p>
              </div>

              <div className="border-l-4 border-zinc-500 bg-zinc-100 p-4">
                <h4 className="font-medium text-zinc-900 mb-2">International Orders</h4>
                <p className="text-zinc-700 text-sm">
                  International orders can be cancelled within 4 hours due to customs documentation requirements. 
                  Extended processing times apply for refunds.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Rights */}
          <Card className="bg-zinc-900 text-white border-0">
            <CardContent className="p-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                <h3 className="text-xl font-semibold mb-2">Your cancellation rights</h3>
                <p className="text-zinc-300 mb-4">
                  We respect your right to change your mind. Our flexible cancellation policy ensures 
                  you can cancel orders easily with minimal fees.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 mb-2" />
                    <span>Easy Cancellation</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 mb-2" />
                    <span>Quick Refunds</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 mb-2" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Need Help Cancelling?</h3>
              <p className="text-gray-300 mb-4">
                Our customer service team is available 24/7 to help you with order cancellations.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span>📧 motoclubkottakkal@gmail.com</span>
                <span>📱 WhatsApp: +971-56666-7178</span>
                <span>⏰ Available 24/7</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default function CancellationPolicyPage() {
  return (
    <Suspense fallback={<div>Loading cancellation policy...</div>}>
      <CancellationPolicyContent />
    </Suspense>
  )
}