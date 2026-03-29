"use client"

import { Suspense } from "react"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { Shield, Eye, Lock, Users, Database, Globe, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

function PrivacyPolicyContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
          <Badge variant="outline" className="mt-4 bg-green-50 text-green-700 border-green-200">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Quick Summary */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Privacy Summary:</strong> We collect minimal data needed for service • Never sell personal info • Secure encryption • Full control over your data
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="space-y-8">

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We collect information to provide better services to all our users. Here's what we collect and why:
              </p>

              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    Personal Information
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Name and contact details (email, phone number)</li>
                    <li>• Shipping and billing addresses</li>
                    <li>• Payment information (processed securely by payment providers)</li>
                    <li>• Account preferences and communication preferences</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    Usage Information
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pages you visit and time spent on our website</li>
                    <li>• Search queries and product interactions</li>
                    <li>• Device information (browser type, operating system)</li>
                    <li>• IP address and general location information</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    Cookies & Tracking
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Essential cookies for website functionality</li>
                    <li>• Analytics cookies to improve user experience</li>
                    <li>• Preference cookies to remember your settings</li>
                    <li>• Marketing cookies (only with your consent)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Primary Uses</h4>
                <p className="text-green-800 text-sm">
                  We use your information primarily to provide, maintain, and improve our services.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Service Delivery</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Process and fulfill orders</li>
                    <li>• Send order confirmations and updates</li>
                    <li>• Provide customer support</li>
                    <li>• Handle returns and refunds</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Communication</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Send important account notifications</li>
                    <li>• Marketing emails (with consent)</li>
                    <li>• Product recommendations</li>
                    <li>• Customer satisfaction surveys</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Improvement</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Analyze website usage patterns</li>
                    <li>• Improve product recommendations</li>
                    <li>• Enhance user experience</li>
                    <li>• Develop new features</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Security & Legal</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Prevent fraud and abuse</li>
                    <li>• Comply with legal requirements</li>
                    <li>• Protect our users and business</li>
                    <li>• Resolve disputes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-zinc-600" />
                When We Share Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-900">We Never Sell Your Data</h4>
                </div>
                <p className="text-red-800 text-sm">
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </div>

              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Service Providers</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    We share information with trusted partners who help us operate our business:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Payment processors (Stripe, PayPal)</li>
                    <li>• Shipping companies (Emirates Post, Aramex)</li>
                    <li>• Email service providers</li>
                    <li>• Analytics providers (Google Analytics)</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Legal Requirements</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    We may share information when required by law or to protect our rights:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Comply with legal processes</li>
                    <li>• Respond to government requests</li>
                    <li>• Prevent fraud or illegal activities</li>
                    <li>• Protect safety of users</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                How We Protect Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Enterprise-Grade Security</h4>
                <p className="text-purple-800 text-sm">
                  We use industry-standard security measures to protect your personal information.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Technical Safeguards</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• SSL encryption for data transmission</li>
                    <li>• Encrypted data storage</li>
                    <li>• Regular security audits</li>
                    <li>• Secure payment processing</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Access Controls</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Limited employee access</li>
                    <li>• Two-factor authentication</li>
                    <li>• Regular access reviews</li>
                    <li>• Secure data centers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                You have the following rights regarding your personal information:
              </p>

              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Access & Download</h4>
                    <p className="text-green-800 text-sm">Request a copy of all personal data we have about you</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Correction & Update</h4>
                    <p className="text-blue-800 text-sm">Update or correct any inaccurate personal information</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Deletion</h4>
                    <p className="text-purple-800 text-sm">Request deletion of your personal data (subject to legal requirements)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-zinc-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-zinc-900">Opt-out</h4>
                    <p className="text-zinc-700 text-sm">Unsubscribe from marketing communications at any time</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">How to Exercise Your Rights</h4>
                <p className="text-gray-600 text-sm mb-2">Contact us using any of the methods below:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Email: motoclubkottakkal@gmail.com</li>
                  <li>• Phone: +971-XXX-XXXX</li>
                  <li>• Account Settings page</li>
                  <li>• Customer service chat</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cookies Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-zinc-600" />
                Cookies & Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We use cookies and similar technologies to enhance your experience on our website.
              </p>

              <div className="grid gap-3">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">Essential Cookies</h4>
                    <Badge className="bg-green-100 text-green-800">Required</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">Necessary for website functionality, shopping cart, and security.</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                    <Badge className="bg-blue-100 text-blue-800">Optional</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">Help us understand how visitors interact with our website.</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                    <Badge className="bg-zinc-100 text-zinc-800 border border-zinc-200">Your Choice</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">Used to show relevant ads and measure campaign effectiveness.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Cross-Border Data Processing</h4>
                <p className="text-blue-800 text-sm">
                  Your information may be processed in countries where our service providers operate, 
                  including the United States and European Union.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Users in India</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• We process data in line with applicable Indian law, including the Digital Personal Data Protection Act where it applies</li>
                  <li>• Sub-processors (e.g. payments, email) may be located outside India with appropriate safeguards</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Updates & Contact */}
          <Card className="bg-gray-900 text-white">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Shield className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Questions About Privacy?</h3>
                <p className="text-gray-300">
                  We're committed to transparency and protecting your privacy. Contact us anytime with questions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Privacy Officer Contact</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>📧 motoclubkottakkal@gmail.com</li>
                    <li>📱 WhatsApp: +971-XXX-XXXX</li>
                    <li>⏰ Mon-Fri: 9AM-6PM GST</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Policy Updates</h4>
                  <ul className="text-gray-300 space-y-1">
                    <li>• We notify users of important changes</li>
                    <li>• Updates posted on this page</li>
                    <li>• Email notifications for major changes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div>Loading privacy policy...</div>}>
      <PrivacyPolicyContent />
    </Suspense>
  )
}