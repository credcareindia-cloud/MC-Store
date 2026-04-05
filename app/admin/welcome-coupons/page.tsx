"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, Calendar, Star, DollarSign, Percent } from "lucide-react";

const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return "Invalid date";
  }
};

const isExpired = (dateString: string) => {
  if (!dateString) return false;
  try {
    const endDate = new Date(dateString);
    const today = new Date();
    return endDate < today;
  } catch {
    return false;
  }
};

export default function WelcomeCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const emptyForm = {
    code: "",
    title: "",
    description: "",
    discountType: "flat" as "flat" | "percent",
    discountValueInr: "",
    maxPurchaseInr: "",
    minimumPurchaseInr: "",
    userTypeRestriction: "all" as "all" | "new" | "returning",
    validFrom: "",
    validTo: "",
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);

  async function loadCoupons() {
    try {
      const res = await fetch("/api/admin/welcome-coupons");
      const data = await res.json();
      setCoupons(data || []);
    } catch (error) {
      console.error("Failed to load coupons:", error);
      setCoupons([]);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function handleSelect(coupon: any) {
    setSelected(coupon.id);
    setForm({
      code: coupon.code || "",
      title: coupon.title || "",
      description: coupon.description || "",
      discountType: coupon.discount_type || "flat",
      discountValueInr: coupon.discount_value_inr?.toString() || "",
      maxPurchaseInr: coupon.max_purchase_inr?.toString() || "",
      minimumPurchaseInr: coupon.minimum_purchase_inr?.toString() || "",
      userTypeRestriction: coupon.user_type_restriction || "all",
      validFrom: formatDateForInput(coupon.valid_from),
      validTo: formatDateForInput(coupon.valid_to),
      isActive: coupon.is_active ?? true,
    });
    setShowForm(true);
  }

  function updateForm(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.code.trim()) {
      alert("Coupon code is required");
      return;
    }
    
    if (!form.discountType) {
      alert("Discount type is required");
      return;
    }
    
    if (form.discountType === "percent") {
      if (form.discountValueInr) {
        const inrValue = Number(form.discountValueInr);
        if (inrValue < 1 || inrValue > 100) {
          alert("INR percentage discount must be between 1 and 100");
          return;
        }
      }
    } else if (form.discountType === "flat") {
      if (form.discountValueInr && Number(form.discountValueInr) <= 0) {
        alert("Flat discount must be a positive number");
        return;
      }
    }
    
    if (!form.discountValueInr) {
      alert("Please provide a discount value");
      return;
    }
    
    if (!form.validFrom || !form.validTo) {
      alert("Please set both start and end dates");
      return;
    }
    
    if (new Date(form.validFrom) >= new Date(form.validTo)) {
      alert("End date must be after start date");
      return;
    }

    setLoading(true);

    const body = {
      code: form.code,
      title: form.title || null,
      description: form.description || null,
      discountType: form.discountType,
      discountValueInr: form.discountValueInr ? Number(form.discountValueInr) : null,
      discountValueAed: null,
      maxPurchaseInr: form.maxPurchaseInr ? Number(form.maxPurchaseInr) : null,
      maxPurchaseAed: null,
      minimumPurchaseInr: Number(form.minimumPurchaseInr) || 0,
      minimumPurchaseAed: 0,
      userTypeRestriction: form.userTypeRestriction,
      validFrom: form.validFrom,
      validTo: form.validTo,
      isActive: form.isActive,
    };

    const url = selected
      ? `/api/admin/welcome-coupons/${selected}`
      : "/api/admin/welcome-coupons";

    const method = selected ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save coupon");
      }

      setSelected(null);
      setForm(emptyForm);
      setShowForm(false);
      loadCoupons();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save coupon";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/admin/welcome-coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      loadCoupons();
    } catch (error) {
      alert("Failed to delete coupon");
    }
  }

  function handleCancel() {
    setSelected(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  const getDiscountDisplay = (coupon: any) => {
    if (coupon.discount_type === "flat") {
      return coupon.discount_value_inr ? `₹${coupon.discount_value_inr}` : "";
    } else {
      return coupon.discount_value_inr ? `${coupon.discount_value_inr}%` : "";
    }
  };

  const getDiscountBadges = (coupon: any) => {
    const badges = [];
    if (coupon.discount_type === "flat") {
      if (coupon.discount_value_inr) {
        badges.push(
          <div key="inr" className="bg-orange-500 text-white px-4 py-2 rounded text-center font-medium">
            ₹{coupon.discount_value_inr} OFF
          </div>
        );
      }
    } else {
      if (coupon.discount_value_inr) {
        badges.push(
          <div key="inr" className="bg-green-500 text-white px-4 py-2 rounded text-center font-medium">
            {coupon.discount_value_inr}% OFF
          </div>
        );
      }
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6">
      {!showForm ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Welcome Coupons</h1>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add New Coupon
            </Button>
          </div>

          <div className="space-y-4">
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.valid_to);
              
              return (
                <Card key={coupon.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-blue-400">{coupon.code}</h2>
                          {expired ? (
                            <Badge className="bg-red-500 text-white hover:bg-red-600">
                              Expired
                            </Badge>
                          ) : (
                            <Badge 
                              className={coupon.is_active 
                                ? "bg-green-500 text-white hover:bg-green-600" 
                                : "bg-gray-500 text-white hover:bg-gray-600"}
                            >
                              {coupon.is_active ? "Active" : "Inactive"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xl text-white mb-1">
                          {coupon.title || "Untitled Coupon"}
                        </p>
                        <p className="text-sm text-gray-400">{coupon.description || "No description"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSelect(coupon)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="bg-red-500 hover:bg-red-600 text-white font-medium">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-800 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Coupon</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Are you sure you want to delete "{coupon.code}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(coupon.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">Type:</p>
                        <Badge className={coupon.discount_type === "flat" 
                          ? "bg-orange-500 text-white hover:bg-orange-600" 
                          : "bg-green-500 text-white hover:bg-green-600"}>
                          {coupon.discount_type === "flat" ? "$ Cash" : "% Percentage"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">Start:</p>
                        <p className="text-white">{formatDate(coupon.valid_from)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">End:</p>
                        <p className={expired ? "text-red-400 font-semibold" : "text-white"}>
                          {formatDate(coupon.valid_to)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-400 uppercase mb-1">User Type:</p>
                      <p className="text-white">
                        {coupon.user_type_restriction === "all" && "All Users"}
                        {coupon.user_type_restriction === "new" && "New Users Only"}
                        {coupon.user_type_restriction === "returning" && "Returning Users Only"}
                      </p>
                    </div>

                    <div>
                      <p className="text-white font-medium mb-2">Available Discounts:</p>
                      <div className="flex gap-2">
                        {getDiscountBadges(coupon)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {coupons.length === 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-400 text-lg mb-4">No coupons available</p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Coupon
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              {selected ? "Edit Coupon" : "Add New Coupon"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-white">Coupon Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., WELCOME50"
                  value={form.code}
                  onChange={(e) => updateForm("code", e.target.value.toUpperCase().replace(/\s/g, ''))}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Welcome Discount"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the coupon..."
                  value={form.description || ""}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountType" className="text-white">Discount Type *</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(value: "flat" | "percent") => updateForm("discountType", value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="flat">Cash (Flat Amount)</SelectItem>
                    <SelectItem value="percent">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType" className="text-white">User Type</Label>
                <Select
                  value={form.userTypeRestriction}
                  onValueChange={(value: "all" | "new" | "returning") => updateForm("userTypeRestriction", value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="new">New Users Only</SelectItem>
                    <SelectItem value="returning">Returning Users Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValueInr" className="text-white">
                  {form.discountType === "flat" ? "Discount Amount (₹)" : "Discount Percentage (%)"}
                </Label>
                <Input
                  id="discountValueInr"
                  type="number"
                  placeholder={form.discountType === "flat" ? "50" : "10"}
                  value={form.discountValueInr}
                  onChange={(e) => updateForm("discountValueInr", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minInr" className="text-white">Minimum Purchase (₹)</Label>
                <Input
                  id="minInr"
                  type="number"
                  placeholder="0"
                  value={form.minimumPurchaseInr}
                  onChange={(e) => updateForm("minimumPurchaseInr", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxInr" className="text-white">Max Purchase (₹)</Label>
                <Input
                  id="maxInr"
                  type="number"
                  placeholder="No limit"
                  value={form.maxPurchaseInr}
                  onChange={(e) => updateForm("maxPurchaseInr", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validFrom" className="text-white">Valid From *</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={form.validFrom}
                  onChange={(e) => updateForm("validFrom", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validTo" className="text-white">Valid To *</Label>
                <Input
                  id="validTo"
                  type="datetime-local"
                  value={form.validTo}
                  onChange={(e) => updateForm("validTo", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 col-span-2 p-4 rounded bg-slate-700">
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => updateForm("isActive", checked)}
                />
                <Label htmlFor="isActive" className="text-white">
                  {form.isActive ? "Coupon is Active" : "Coupon is Inactive"}
                </Label>
              </div>

              <div className="flex gap-3 col-span-2 pt-4">
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Saving..." : (selected ? "Update Coupon" : "Create Coupon")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}