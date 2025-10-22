"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Save, SettingsIcon, Store, MapPin, CreditCard, Zap, Timer, ToggleLeft, CheckCircle, ExternalLink } from "lucide-react"
import { useShop } from "@/lib/contexts/shop-context"
import ImageUploadSingle from "@/components/ui/ImageUploadSingle"

interface Setting {
  id: number
  key: string
  value: string
  type: string
  category: string
  label: string
  description: string
}

interface OpeningHours {
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { shop, setShop } = useShop()
  const [openingHours, setOpeningHours] = useState<OpeningHours>({
    monday: "5:00 PM - 10:00 PM",
    tuesday: "5:00 PM - 10:00 PM",
    wednesday: "5:00 PM - 10:00 PM",
    thursday: "5:00 PM - 10:00 PM",
    friday: "5:00 PM - 11:00 PM",
    saturday: "5:00 PM - 11:00 PM",
    sunday: "4:00 PM - 9:00 PM",
  })
  const [shopFeaturesSettings, setShopFeaturesSettings] = useState({
    popup_enabled: 'false',
    popup_initial_delay: '10',
    popup_interval: '15',
    popup_max_shows: '2',
    floating_ad_enabled: 'false',
    floating_ad_scroll_trigger: '400',
    floating_ad_duration: '2',
    floating_ad_cooldown: '4',
    floating_ad_max_shows: '3',
    default_shop: 'A',
    shop_switch_enabled: 'true',
    default_currency: 'INR',
    currency_switch_enabled: 'true',
    available_currencies: 'AED,INR',
    shop_a_name: 'Motor Parts',
    shop_b_name: 'Fragrance'
  })
  
  // URL validation state
  const [urlValidation, setUrlValidation] = useState<{[key: string]: {isValid: boolean, isChecking: boolean}}>({
    social_facebook: { isValid: true, isChecking: false },
    social_instagram: { isValid: true, isChecking: false },
    social_twitter: { isValid: true, isChecking: false }
  })

  useEffect(() => {
    fetchSettings()
    fetchShopFeaturesSettings()
  }, [])

  const fetchShopFeaturesSettings = async () => {
    try {
      const response = await fetch('/api/admin/shop-features')
      if (response.ok) {
        const data = await response.json()
        setShopFeaturesSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch shop features settings:', error)
    }
  }

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/settings")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: Setting[] = await response.json()
      setSettings(data)

      // Parse opening hours
      const hoursSettings = data.find((s) => s.key === "opening_hours")
      if (hoursSettings?.value) {
        try {
          const hours = JSON.parse(hoursSettings.value)
          setOpeningHours(hours)
        } catch (e) {
          console.error("Failed to parse opening hours:", e)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Failed to fetch settings: ${message}`)
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => {
      const existingIndex = prev.findIndex((setting) => setting.key === key)
      if (existingIndex >= 0) {
        // Update existing setting
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], value }
        return updated
      } else {
        // Add new setting if it doesn't exist
        const newSetting: Setting = {
          id: Date.now(), // temporary ID
          key,
          value,
          type: "text",
          category: "general",
          label: key,
          description: "",
        }
        return [...prev, newSetting]
      }
    })
  }

  const getSetting = (key: string): string => {
    return settings.find((s) => s.key === key)?.value || ""
  }

  const updateShopFeaturesSetting = (key: string, value: string) => {
    setShopFeaturesSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const getShopFeaturesSetting = (key: string): string => {
    return shopFeaturesSettings[key as keyof typeof shopFeaturesSettings] || ""
  }

  // URL validation functions
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true // Empty URLs are valid (optional)
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const validateSocialUrl = async (key: string, url: string) => {
    if (!url.trim()) {
      setUrlValidation(prev => ({
        ...prev,
        [key]: { isValid: true, isChecking: false }
      }))
      return
    }

    setUrlValidation(prev => ({
      ...prev,
      [key]: { isValid: true, isChecking: true }
    }))

    // Basic URL format validation
    const isValidFormat = validateUrl(url)
    
    // Platform-specific validation
    let isValidPlatform = true
    if (key === 'social_facebook' && url) {
      isValidPlatform = url.includes('facebook.com') || url.includes('fb.com')
    } else if (key === 'social_instagram' && url) {
      isValidPlatform = url.includes('instagram.com')
    } else if (key === 'social_twitter' && url) {
      isValidPlatform = url.includes('twitter.com') || url.includes('x.com')
    }

    const isValid = isValidFormat && isValidPlatform

    setTimeout(() => {
      setUrlValidation(prev => ({
        ...prev,
        [key]: { isValid, isChecking: false }
      }))
    }, 500) // Small delay to show checking state
  }

  const saveShopFeaturesSettings = async () => {
    setSaving(true)
    try {
      // Save each setting individually
      const promises = Object.entries(shopFeaturesSettings).map(([key, value]) =>
        fetch('/api/admin/shop-features', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key, value }),
        })
      )

      await Promise.all(promises)
      
      // Show success message
      setError(null)
      // You could add a success toast here
      
    } catch (error) {
      console.error('Failed to save shop features settings:', error)
      setError('Failed to save shop features settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update opening hours in settings
      const updatedSettings = settings.map((setting) =>
        setting.key === "opening_hours" ? { ...setting, value: JSON.stringify(openingHours) } : setting,
      )

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: updatedSettings }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save settings")
      }

      alert("Settings saved successfully!")
      // Refresh settings to get any server-side updates
      await fetchSettings()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to save settings: ${message}`)
      console.error("Failed to save settings:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Settings</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <Button onClick={fetchSettings} className="mt-3 bg-red-600 hover:bg-red-700" size="sm">
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-transparent p-2 sm:p-4 md:p-6 rounded-none sm:rounded-lg shadow-lg overflow-y-auto max-h-[95vh]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Settings</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-bold"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
      <div className="sticky top-0 z-20 bg-gray-900/95 shadow-lg px-4 py-2">
  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
    <TabsList className="flex gap-3 min-w-max">
      <TabsTrigger
        value="general"
        className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-white hover:bg-gray-700 transition-all duration-200 whitespace-nowrap"
      >
        <Store className="w-4 h-4" />
        General
      </TabsTrigger>

      <TabsTrigger
        value="contact"
        className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-white hover:bg-gray-700 transition-all duration-200 whitespace-nowrap"
      >
        <MapPin className="w-4 h-4" />
        Contact
      </TabsTrigger>

      <TabsTrigger
        value="payment"
        className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-white hover:bg-gray-700 transition-all duration-200 whitespace-nowrap"
      >
        <CreditCard className="w-4 h-4" />
        Payment
      </TabsTrigger>

      <TabsTrigger
        value="appearance"
        className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-white hover:bg-gray-700 transition-all duration-200 whitespace-nowrap"
      >
        <SettingsIcon className="w-4 h-4" />
        Appearance
      </TabsTrigger>

      <TabsTrigger
        value="shop-features"
        className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-white hover:bg-gray-700 transition-all duration-200 whitespace-nowrap"
      >
        <Zap className="w-4 h-4" />
        Shop Features
      </TabsTrigger>
    </TabsList>
  </div>
</div>


        <TabsContent value="general">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="restaurant_name" className="text-white">Company Name</Label>
                <Input
                  id="restaurant_name"
                  value={getSetting("restaurant_name")}
                  onChange={(e) => updateSetting("restaurant_name", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white h-12"
                />
              </div>

              <div>
                <Label className="text-white">Opening Hours</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {Object.entries(openingHours).map(([day, hours]) => (
                    <div key={day}>
                      <Label htmlFor={day} className="capitalize text-white">
                        {day}
                      </Label>
                      <Input
                        id={day}
                        value={hours}
                        onChange={(e) => setOpeningHours({ ...openingHours, [day]: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white h-12"
                        placeholder="5:00 PM - 10:00 PM"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    value={getSetting("phone")}
                    onChange={(e) => updateSetting("phone", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={getSetting("email")}
                    onChange={(e) => updateSetting("email", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-white">Website URL</Label>
                <Input
                  id="website"
                  value={getSetting("website")}
                  onChange={(e) => updateSetting("website", e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white h-12"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-white">Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address_line1" className="text-white">Address Line 1</Label>
                    <Input
                      id="address_line1"
                      value={getSetting("address_line1")}
                      onChange={(e) => updateSetting("address_line1", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_line2" className="text-white">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      value={getSetting("address_line2")}
                      onChange={(e) => updateSetting("address_line2", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-white">City</Label>
                    <Input
                      id="city"
                      value={getSetting("city")}
                      onChange={(e) => updateSetting("city", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-white">State/Province</Label>
                    <Input
                      id="state"
                      value={getSetting("state")}
                      onChange={(e) => updateSetting("state", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code" className="text-white">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={getSetting("postal_code")}
                      onChange={(e) => updateSetting("postal_code", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-white">Country</Label>
                    <Input
                      id="country"
                      value={getSetting("country")}
                      onChange={(e) => updateSetting("country", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-white">Social Media</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="social_facebook" className="text-white">Facebook URL</Label>
                    <div className="relative">
                      <Input
                        id="social_facebook"
                        value={getSetting("social_facebook")}
                        onChange={(e) => {
                          updateSetting("social_facebook", e.target.value)
                          validateSocialUrl("social_facebook", e.target.value)
                        }}
                        className={`bg-gray-700 border-gray-600 text-white h-12 pr-10 ${
                          !urlValidation.social_facebook.isValid ? 'border-red-500' : 
                          getSetting("social_facebook") && urlValidation.social_facebook.isValid ? 'border-green-500' : ''
                        }`}
                        placeholder="https://facebook.com/yourpage"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {urlValidation.social_facebook.isChecking ? (
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : getSetting("social_facebook") ? (
                          urlValidation.social_facebook.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )
                        ) : null}
                      </div>
                    </div>
                    {getSetting("social_facebook") && urlValidation.social_facebook.isValid && (
                      <Button
                        onClick={() => window.open(getSetting("social_facebook"), '_blank')}
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs h-7 border-blue-600 text-blue-400 hover:bg-blue-600/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Check Link
                      </Button>
                    )}
                    {getSetting("social_facebook") && !urlValidation.social_facebook.isValid && (
                      <p className="text-red-400 text-xs mt-1">Please enter a valid Facebook URL</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="social_instagram" className="text-white">Instagram URL</Label>
                    <div className="relative">
                      <Input
                        id="social_instagram"
                        value={getSetting("social_instagram")}
                        onChange={(e) => {
                          updateSetting("social_instagram", e.target.value)
                          validateSocialUrl("social_instagram", e.target.value)
                        }}
                        className={`bg-gray-700 border-gray-600 text-white h-12 pr-10 ${
                          !urlValidation.social_instagram.isValid ? 'border-red-500' : 
                          getSetting("social_instagram") && urlValidation.social_instagram.isValid ? 'border-green-500' : ''
                        }`}
                        placeholder="https://instagram.com/yourprofile"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {urlValidation.social_instagram.isChecking ? (
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : getSetting("social_instagram") ? (
                          urlValidation.social_instagram.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )
                        ) : null}
                      </div>
                    </div>
                    {getSetting("social_instagram") && urlValidation.social_instagram.isValid && (
                      <Button
                        onClick={() => window.open(getSetting("social_instagram"), '_blank')}
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs h-7 border-pink-600 text-pink-400 hover:bg-pink-600/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Check Link
                      </Button>
                    )}
                    {getSetting("social_instagram") && !urlValidation.social_instagram.isValid && (
                      <p className="text-red-400 text-xs mt-1">Please enter a valid Instagram URL</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="social_twitter" className="text-white">Twitter/X URL</Label>
                    <div className="relative">
                      <Input
                        id="social_twitter"
                        value={getSetting("social_twitter")}
                        onChange={(e) => {
                          updateSetting("social_twitter", e.target.value)
                          validateSocialUrl("social_twitter", e.target.value)
                        }}
                        className={`bg-gray-700 border-gray-600 text-white h-12 pr-10 ${
                          !urlValidation.social_twitter.isValid ? 'border-red-500' : 
                          getSetting("social_twitter") && urlValidation.social_twitter.isValid ? 'border-green-500' : ''
                        }`}
                        placeholder="https://twitter.com/yourprofile"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {urlValidation.social_twitter.isChecking ? (
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : getSetting("social_twitter") ? (
                          urlValidation.social_twitter.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )
                        ) : null}
                      </div>
                    </div>
                    {getSetting("social_twitter") && urlValidation.social_twitter.isValid && (
                      <Button
                        onClick={() => window.open(getSetting("social_twitter"), '_blank')}
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs h-7 border-blue-600 text-blue-400 hover:bg-blue-600/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Check Link
                      </Button>
                    )}
                    {getSetting("social_twitter") && !urlValidation.social_twitter.isValid && (
                      <p className="text-red-400 text-xs mt-1">Please enter a valid Twitter/X URL</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Settings */}
              <div className="space-y-4">
                <Label className="text-white">Footer Settings</Label>
                
                {/* Footer Description */}
                <div>
                  <Label htmlFor="footer_description" className="text-white">Footer Description</Label>
                  <textarea
                    id="footer_description"
                    value={getSetting("footer_description") || "Sabs Online Store story began in 2015 in Dubai. we have created a niche for our customers with our high-quality products and our attention to detail in service."}
                    onChange={(e) => updateSetting("footer_description", e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 text-white h-20 mt-2 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    placeholder="Enter footer description text"
                  />
                  <p className="text-gray-400 text-xs mt-1">Description text shown in the footer</p>
                </div>




              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency_code" className="text-white">Currency Code</Label>
                  <Input
                    id="currency_code"
                    value={getSetting("currency_code")}
                    onChange={(e) => updateSetting("currency_code", e.target.value.toUpperCase())}
                    className="bg-gray-700 border-gray-600 text-white h-12"
                    placeholder="USD"
                  />
                  <p className="text-gray-400 text-sm mt-1">ISO currency code (USD, EUR, GBP, etc.)</p>
                </div>
                <div>
                  <Label htmlFor="currency_symbol" className="text-white">Currency Symbol</Label>
                  <Input
                    id="currency_symbol"
                    value={getSetting("currency_symbol")}
                    onChange={(e) => updateSetting("currency_symbol", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-12"
                    placeholder="$"
                  />
                  <p className="text-gray-400 text-sm mt-1">Symbol to display with prices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-white">
              <ImageUploadSingle
                value={getSetting("restaurant_logo")}
                onChange={(url) => updateSetting("restaurant_logo", url)}
                label="Logo"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop-features">
          <div className="space-y-6">
            {/* General Shop Settings */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  General Shop Settings
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Configure default shop behavior and shop switching functionality
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Shop Names Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="shop_a_name" className="text-white">Shop A Name</Label>
                    <Input
                      id="shop_a_name"
                      value={getShopFeaturesSetting("shop_a_name") || "Motor Parts"}
                      onChange={(e) => updateShopFeaturesSetting("shop_a_name", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="Motor Parts"
                    />
                    <p className="text-gray-400 text-xs mt-1">Display name for Shop A (appears in navbar and UI)</p>
                  </div>

                  <div>
                    <Label htmlFor="shop_b_name" className="text-white">Shop B Name</Label>
                    <Input
                      id="shop_b_name"
                      value={getShopFeaturesSetting("shop_b_name") || "Fragrance"}
                      onChange={(e) => updateShopFeaturesSetting("shop_b_name", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="Fragrance"
                    />
                    <p className="text-gray-400 text-xs mt-1">Display name for Shop B (appears in navbar and UI)</p>
                  </div>
                </div>

                {/* Shop Taglines Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="shop_a_tagline" className="text-white">Shop A Tagline</Label>
                    <Input
                      id="shop_a_tagline"
                      value={getShopFeaturesSetting("shop_a_tagline") || "Motor Parts & Spare Parts"}
                      onChange={(e) => updateShopFeaturesSetting("shop_a_tagline", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="Motor Parts & Spare Parts"
                    />
                    <p className="text-gray-400 text-xs mt-1">Category tagline for Shop A (appears in footer and other places)</p>
                  </div>

                  <div>
                    <Label htmlFor="shop_b_tagline" className="text-white">Shop B Tagline</Label>
                    <Input
                      id="shop_b_tagline"
                      value={getShopFeaturesSetting("shop_b_tagline") || "Premium Fragrances and Perfumes"}
                      onChange={(e) => updateShopFeaturesSetting("shop_b_tagline", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="Premium Fragrances and Perfumes"
                    />
                    <p className="text-gray-400 text-xs mt-1">Category tagline for Shop B (appears in footer and other places)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="default_shop" className="text-white">Default Shop</Label>
                    <select
                      id="default_shop"
                      value={getShopFeaturesSetting("default_shop") || "A"}
                      onChange={(e) => updateShopFeaturesSetting("default_shop", e.target.value)}
                      className="w-full bg-gray-700 border-gray-600 text-white h-10 mt-2 rounded-md px-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="A">Shop A - {getShopFeaturesSetting("shop_a_name") || "Motor Parts"}</option>
                      <option value="B">Shop B - {getShopFeaturesSetting("shop_b_name") || "Fragrance"}</option>
                    </select>
                    <p className="text-gray-400 text-xs mt-1">Shop that users see when they first visit the site</p>
                  </div>

                  <div>
                    <Label htmlFor="shop_switch_enabled" className="text-white">Enable Shop Switching</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="shop_switch_enabled"
                        checked={getShopFeaturesSetting("shop_switch_enabled") === "true"}
                        onChange={(e) => updateShopFeaturesSetting("shop_switch_enabled", e.target.checked.toString())}
                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                      />
                      <span className="text-gray-300 text-sm">Allow users to switch between shops</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Controls the shop switcher in the header</p>
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Current Shop Configuration
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>• Shop A Name: <strong>{getShopFeaturesSetting("shop_a_name") || "Motor Parts"}</strong></p>
                    <p>• Shop A Tagline: <strong>{getShopFeaturesSetting("shop_a_tagline") || "Motor Parts & Spare Parts"}</strong></p>
                    <p>• Shop B Name: <strong>{getShopFeaturesSetting("shop_b_name") || "Fragrance"}</strong></p>
                    <p>• Shop B Tagline: <strong>{getShopFeaturesSetting("shop_b_tagline") || "Premium Fragrances and Perfumes"}</strong></p>
                    <p>• Default Shop: <strong>{getShopFeaturesSetting("default_shop") === "B" ? `Shop B - ${getShopFeaturesSetting("shop_b_name") || "Fragrance"}` : `Shop A - ${getShopFeaturesSetting("shop_a_name") || "Motor Parts"}`}</strong></p>
                    <p>• Shop Switching: <span className={getShopFeaturesSetting("shop_switch_enabled") === "true" ? "text-green-400" : "text-red-400"}>
                      {getShopFeaturesSetting("shop_switch_enabled") === "true" ? "Enabled" : "Disabled"}
                    </span></p>
                    <p>• Current Admin Shop: <strong>Shop {shop} - {shop === "A" ? (getShopFeaturesSetting("shop_a_name") || "Motor Parts") : (getShopFeaturesSetting("shop_b_name") || "Fragrance")}</strong></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Settings */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Currency Settings
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Configure default currency and currency switching functionality
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="default_currency" className="text-white">Default Currency</Label>
                    <select
                      id="default_currency"
                      value={getShopFeaturesSetting("default_currency") || "INR"}
                      onChange={(e) => updateShopFeaturesSetting("default_currency", e.target.value)}
                      className="w-full bg-gray-700 border-gray-600 text-white h-10 mt-2 rounded-md px-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="AED">AED (UAE Dirham)</option>
                      <option value="INR">INR (Indian Rupee)</option>
                    </select>
                    <p className="text-gray-400 text-xs mt-1">Currency that users see when they first visit the site</p>
                  </div>

                  <div>
                    <Label htmlFor="currency_switch_enabled" className="text-white">Enable Currency Switching</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="currency_switch_enabled"
                        checked={getShopFeaturesSetting("currency_switch_enabled") === "true"}
                        onChange={(e) => updateShopFeaturesSetting("currency_switch_enabled", e.target.checked.toString())}
                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                      />
                      <span className="text-gray-300 text-sm">Allow users to switch between currencies</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Controls the currency switcher in the header</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="available_currencies" className="text-white">Available Currencies</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="currency_aed"
                        checked={getShopFeaturesSetting("available_currencies")?.includes("AED") !== false}
                        onChange={(e) => {
                          const current = getShopFeaturesSetting("available_currencies") || "AED,INR"
                          const currencies = current.split(",").filter(c => c.trim())
                          if (e.target.checked) {
                            if (!currencies.includes("AED")) currencies.push("AED")
                          } else {
                            const index = currencies.indexOf("AED")
                            if (index > -1) currencies.splice(index, 1)
                          }
                          updateShopFeaturesSetting("available_currencies", currencies.join(","))
                        }}
                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                      />
                      <span className="text-gray-300 text-sm">AED (UAE Dirham)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="currency_inr"
                        checked={getShopFeaturesSetting("available_currencies")?.includes("INR") !== false}
                        onChange={(e) => {
                          const current = getShopFeaturesSetting("available_currencies") || "AED,INR"
                          const currencies = current.split(",").filter(c => c.trim())
                          if (e.target.checked) {
                            if (!currencies.includes("INR")) currencies.push("INR")
                          } else {
                            const index = currencies.indexOf("INR")
                            if (index > -1) currencies.splice(index, 1)
                          }
                          updateShopFeaturesSetting("available_currencies", currencies.join(","))
                        }}
                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                      />
                      <span className="text-gray-300 text-sm">INR (Indian Rupee)</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Select which currencies are available to users</p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Current Currency Configuration
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>• Default Currency: <strong>{getShopFeaturesSetting("default_currency") === "AED" ? "AED (UAE Dirham)" : "INR (Indian Rupee)"}</strong></p>
                    <p>• Currency Switching: <span className={getShopFeaturesSetting("currency_switch_enabled") === "true" ? "text-green-400" : "text-red-400"}>
                      {getShopFeaturesSetting("currency_switch_enabled") === "true" ? "Enabled" : "Disabled"}
                    </span></p>
                    <p>• Available Currencies: <strong>{getShopFeaturesSetting("available_currencies") || "AED, INR"}</strong></p>
                    {getShopFeaturesSetting("currency_switch_enabled") === "false" && (
                      <p className="text-amber-400">• Country selection modal will be hidden when currency switching is disabled</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shop Switch Popup Settings */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ToggleLeft className="w-5 h-5" />
                  Shop Switch Popup Settings
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Control when and how often the shop switch popup appears to encourage users to explore both shops
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="popup_enabled" className="text-white">Enable Shop Switch Popup</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="popup_enabled"
                        checked={getShopFeaturesSetting("popup_enabled") === "true"}
                        onChange={(e) => updateShopFeaturesSetting("popup_enabled", e.target.checked.toString())}
                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                      />
                      <span className="text-gray-300 text-sm">Show popup to encourage shop switching</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="popup_initial_delay" className="text-white">Initial Delay (minutes)</Label>
                    <Input
                      id="popup_initial_delay"
                      type="number"
                      min="1"
                      max="60"
                      value={getShopFeaturesSetting("popup_initial_delay") || "10"}
                      onChange={(e) => updateShopFeaturesSetting("popup_initial_delay", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="10"
                    />
                    <p className="text-gray-400 text-xs mt-1">Wait time before showing first popup</p>
                  </div>

                  <div>
                    <Label htmlFor="popup_interval" className="text-white">Show Interval (minutes)</Label>
                    <Input
                      id="popup_interval"
                      type="number"
                      min="5"
                      max="120"
                      value={getShopFeaturesSetting("popup_interval") || "15"}
                      onChange={(e) => updateShopFeaturesSetting("popup_interval", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="15"
                    />
                    <p className="text-gray-400 text-xs mt-1">Time between popup appearances</p>
                  </div>

                  <div>
                    <Label htmlFor="popup_max_shows" className="text-white">Max Shows Per Session</Label>
                    <Input
                      id="popup_max_shows"
                      type="number"
                      min="1"
                      max="10"
                      value={getShopFeaturesSetting("popup_max_shows") || "2"}
                      onChange={(e) => updateShopFeaturesSetting("popup_max_shows", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="2"
                    />
                    <p className="text-gray-400 text-xs mt-1">Maximum times to show per user session</p>
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Current Settings Preview
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>• Popup will appear after <strong>{getShopFeaturesSetting("popup_initial_delay") || "10"} minutes</strong> of browsing</p>
                    <p>• Then every <strong>{getShopFeaturesSetting("popup_interval") || "15"} minutes</strong> thereafter</p>
                    <p>• Maximum <strong>{getShopFeaturesSetting("popup_max_shows") || "2"} times</strong> per session</p>
                    <p>• Status: <span className={getShopFeaturesSetting("popup_enabled") === "true" ? "text-green-400" : "text-red-400"}>
                      {getShopFeaturesSetting("popup_enabled") === "true" ? "Enabled" : "Disabled"}
                    </span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Shop Ad Settings */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Floating Shop Ad Settings
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Configure the floating advertisement that promotes the other shop while users browse
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="floating_ad_enabled" className="text-white">Enable Floating Shop Ad</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="floating_ad_enabled"
                        checked={getShopFeaturesSetting("floating_ad_enabled") === "true"}
                        onChange={(e) => updateShopFeaturesSetting("floating_ad_enabled", e.target.checked.toString())}
                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                      />
                      <span className="text-gray-300 text-sm">Show floating ad to promote other shop</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="floating_ad_scroll_trigger" className="text-white">Scroll Trigger (pixels)</Label>
                    <Input
                      id="floating_ad_scroll_trigger"
                      type="number"
                      min="100"
                      max="1000"
                      value={getShopFeaturesSetting("floating_ad_scroll_trigger") || "400"}
                      onChange={(e) => updateShopFeaturesSetting("floating_ad_scroll_trigger", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="400"
                    />
                    <p className="text-gray-400 text-xs mt-1">Show ad after scrolling this many pixels</p>
                  </div>

                  <div>
                    <Label htmlFor="floating_ad_duration" className="text-white">Display Duration (minutes)</Label>
                    <Input
                      id="floating_ad_duration"
                      type="number"
                      min="1"
                      max="10"
                      value={getShopFeaturesSetting("floating_ad_duration") || "2"}
                      onChange={(e) => updateShopFeaturesSetting("floating_ad_duration", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="2"
                    />
                    <p className="text-gray-400 text-xs mt-1">How long to show the ad</p>
                  </div>

                  <div>
                    <Label htmlFor="floating_ad_cooldown" className="text-white">Cooldown Period (minutes)</Label>
                    <Input
                      id="floating_ad_cooldown"
                      type="number"
                      min="1"
                      max="30"
                      value={getShopFeaturesSetting("floating_ad_cooldown") || "4"}
                      onChange={(e) => updateShopFeaturesSetting("floating_ad_cooldown", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="4"
                    />
                    <p className="text-gray-400 text-xs mt-1">Wait time before showing ad again</p>
                  </div>

                  <div>
                    <Label htmlFor="floating_ad_max_shows" className="text-white">Max Shows Per Session</Label>
                    <Input
                      id="floating_ad_max_shows"
                      type="number"
                      min="1"
                      max="10"
                      value={getShopFeaturesSetting("floating_ad_max_shows") || "3"}
                      onChange={(e) => updateShopFeaturesSetting("floating_ad_max_shows", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-10 mt-2"
                      placeholder="3"
                    />
                    <p className="text-gray-400 text-xs mt-1">Maximum times to show per user session</p>
                  </div>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Current Settings Preview
                  </h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>• Ad appears after scrolling <strong>{getShopFeaturesSetting("floating_ad_scroll_trigger") || "400"} pixels</strong></p>
                    <p>• Displays for <strong>{getShopFeaturesSetting("floating_ad_duration") || "2"} minutes</strong></p>
                    <p>• Cooldown of <strong>{getShopFeaturesSetting("floating_ad_cooldown") || "4"} minutes</strong> between shows</p>
                    <p>• Maximum <strong>{getShopFeaturesSetting("floating_ad_max_shows") || "3"} times</strong> per session</p>
                    <p>• Status: <span className={getShopFeaturesSetting("floating_ad_enabled") === "true" ? "text-green-400" : "text-red-400"}>
                      {getShopFeaturesSetting("floating_ad_enabled") === "true" ? "Enabled" : "Disabled"}
                    </span></p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-700">
                  <Button
                    onClick={saveShopFeaturesSettings}
                    disabled={saving}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6"
                  >
                    {saving ? "Saving..." : "Save Shop Features Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>


          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
