"use client"

import { Suspense } from "react"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { FileText, Shield, Users, CreditCard, AlertTriangle, CheckCircle, Scale, Ban } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

function TermsOfServiceContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our services. By using our website, you agree to these terms.
          </p>
          <Badge variant="outline" className="mt-4 bg-blue-50 text-blue-700 border-blue-200">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Important Notice */}
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Important:</strong> By accessing or using our services, you agree to be bound by these terms. If you disagree with any part, please discontinue use.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Agreement Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Agreement Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                This Terms of Service agreement ("Terms") governs your access to and use of SabsOnline's website, 
                mobile application, and services (collectively, the "Services").
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Key Points</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• These terms form a legally binding agreement between you and SabsOnline</li>
                  <li>• By using our services, you accept these terms in full</li>
                  <li>• We may update these terms from time to time</li>
                  <li>• Continued use after changes means you accept the new terms</li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Who We Are</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• SabsOnline LLC</li>
                    <li>• Registered in UAE</li>
                    <li>• E-commerce platform</li>
                    <li>• Beauty & Style products</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Who Can Use</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Age 18 or older</li>
                    <li>• Legal capacity to contract</li>
                    <li>• Residents of UAE & India</li>
                    <li>• Accept these terms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Account Registration & Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Account Creation
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Provide accurate and complete information</li>
                    <li>• Maintain and update your account information</li>
                    <li>• You're responsible for account activity</li>
                    <li>• One account per person</li>
                    <li>• Notify us immediately of unauthorized access</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Ban className="w-4 h-4 text-red-600" />
                    Prohibited Uses
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Illegal or unauthorized purposes</li>
                    <li>• Violating any laws or regulations</li>
                    <li>• Infringing on intellectual property rights</li>
                    <li>• Transmitting harmful or malicious content</li>
                    <li>• Interfering with service operation</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Account Security
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Keep login credentials confidential</li>
                    <li>• Use strong passwords</li>
                    <li>• Log out from shared devices</li>
                    <li>• Report suspicious activity</li>
                    <li>• Enable two-factor authentication when available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Products, Pricing & Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Product Information</h4>
                <p className="text-purple-800 text-sm">
                  We strive to provide accurate product information, but cannot guarantee that all details, 
                  images, or prices are completely accurate or up-to-date.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Pricing & Availability</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Prices displayed in AED and INR</li>
                    <li>• Prices subject to change without notice</li>
                    <li>• Product availability not guaranteed</li>
                    <li>• We reserve the right to limit quantities</li>
                    <li>• Pricing errors may be corrected</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Order Acceptance</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Order confirmation email required</li>
                    <li>• We may reject orders at our discretion</li>
                    <li>• Payment authorization required</li>
                    <li>• Address verification may be necessary</li>
                    <li>• Bulk orders may require approval</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Payment Terms</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Payment due at time of order</li>
                    <li>• Accepted methods: Credit/Debit cards, COD</li>
                    <li>• Currency conversion rates apply</li>
                    <li>• Failed payments may cancel orders</li>
                    <li>• Refunds processed per our policy</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Shipping, Delivery & Risk Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Shipping and delivery terms are detailed in our Shipping Policy. Key points include:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Our Responsibilities</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Package items securely</li>
                    <li>• Use reliable shipping partners</li>
                    <li>• Provide tracking information</li>
                    <li>• Handle delivery issues</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Your Responsibilities</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Provide accurate shipping address</li>
                    <li>• Be available for delivery</li>
                    <li>• Inspect packages upon receipt</li>
                    <li>• Report damage within 24 hours</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">Risk of Loss</h4>
                <p className="text-amber-800 text-sm">
                  Risk of loss and title for items pass to you upon delivery to the carrier. 
                  We're not responsible for lost or stolen packages after delivery confirmation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Our Content</h4>
                <p className="text-blue-800 text-sm">
                  All content on our website, including text, images, logos, and software, 
                  is owned by or licensed to SabsOnline and protected by copyright laws.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">What You Can Do</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• View content for personal use</li>
                    <li>• Share product links</li>
                    <li>• Print pages for personal reference</li>
                    <li>• Use as intended for shopping</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">What You Cannot Do</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Copy or redistribute content</li>
                    <li>• Use for commercial purposes</li>
                    <li>• Modify or create derivatives</li>
                    <li>• Remove copyright notices</li>
                  </ul>
                </div>
              </div>

              <div class="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">User Content</h4>
                <p className="text-sm text-gray-600 mb-2">
                  By submitting reviews, photos, or other content, you grant us rights to use, modify, and display such content.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You retain ownership of your content</li>
                  <li>• You grant us license to use it</li>
                  <li>• Content must not infringe others' rights</li>
                  <li>• We may remove inappropriate content</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Limitation of Liability & Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Important Legal Notice</h4>
                <p className="text-red-800 text-sm">
                  Please read this section carefully as it limits our liability and contains important disclaimers.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Service "As Is"</h4>
                  <p className="text-sm text-gray-600 mb-2">Our services are provided "as is" without warranties of any kind, either express or implied.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• No guarantee of uninterrupted service</li>
                    <li>• No warranty of accuracy or completeness</li>
                    <li>• No guarantee of fitness for particular purpose</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Liability Limitations</h4>
                  <p className="text-sm text-gray-600 mb-2">Our total liability to you shall not exceed the amount you paid for the specific product or service.</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• No liability for indirect damages</li>
                    <li>• No liability for consequential losses</li>
                    <li>• No liability for lost profits or data</li>
                    <li>• Claims must be made within reasonable time</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Exceptions</h4>
                  <p className="text-sm text-gray-600 mb-2">These limitations don't apply to:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Death or personal injury caused by our negligence</li>
                    <li>• Fraud or fraudulent misrepresentation</li>
                    <li>• Violations of consumer protection laws</li>
                    <li>• Other liability that cannot be excluded by law</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-600" />
                Dispute Resolution & Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Preferred Resolution</h4>
                <p className="text-purple-800 text-sm">
                  We prefer to resolve disputes through friendly discussion. Please contact our customer service team first.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">UAE Customers</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Governed by UAE laws</li>
                    <li>• Dubai courts have jurisdiction</li>
                    <li>• Consumer protection laws apply</li>
                    <li>• Mediation preferred</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Indian Customers</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Governed by Indian laws</li>
                    <li>• Local jurisdiction applies</li>
                    <li>• Consumer forums available</li>
                    <li>• Alternative dispute resolution</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-600" />
                Account Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Either party may terminate this agreement under certain circumstances:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">You May Terminate</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Stop using our services anytime</li>
                    <li>• Close your account</li>
                    <li>• Delete your data (subject to legal requirements)</li>
                    <li>• No termination fees</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">We May Terminate For</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Violation of these terms</li>
                    <li>• Illegal or harmful activities</li>
                    <li>• Suspicious account activity</li>
                    <li>• Non-payment of fees</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">Effect of Termination</h4>
                <ul className="text-amber-800 text-sm space-y-1">
                  <li>• Outstanding orders will be fulfilled</li>
                  <li>• Refunds processed per our policies</li>
                  <li>• Account data may be retained per privacy policy</li>
                  <li>• Some provisions survive termination</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Updates */}
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Questions About Terms?</h3>
                <p className="text-gray-300">
                  We're here to help clarify any questions about our terms of service.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Legal Contact</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>📧 legal@sabsonline.com</li>
                    <li>📱 Customer Service</li>
                    <li>⏰ Business Hours</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Terms Updates</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Check this page for updates</li>
                    <li>• Major changes will be notified</li>
                    <li>• Effective date shown at top</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-xs">
                <p>By continuing to use our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={<div>Loading terms of service...</div>}>
      <TermsOfServiceContent />
    </Suspense>
  )
}