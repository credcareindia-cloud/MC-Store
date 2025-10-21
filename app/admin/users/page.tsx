"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Calendar,
  Eye,
  EyeOff,
  Crown
} from "lucide-react"
import toast from "react-hot-toast"
import { useAdminAuth } from "@/lib/contexts/admin-auth-context"

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  isCurrentUser: boolean
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAdminAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  
  // Check if current user is super admin
  const isSuperAdmin = currentUser?.role === 'super_admin'
  
  // Create user dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin"
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)

  // Edit user dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin"
  })
  const [editLoading, setEditLoading] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Fetch admin users
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include"
      })
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        setCurrentUserId(data.currentUserId)
      } else {
        toast.error("Failed to fetch admin users")
      }
    } catch (error) {
      toast.error("Error fetching admin users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Create new admin user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createForm)
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Admin user created successfully")
        setCreateDialogOpen(false)
        setCreateForm({ name: "", email: "", password: "", role: "admin" })
        fetchUsers()
      } else {
        toast.error(data.message || "Failed to create admin user")
      }
    } catch (error) {
      toast.error("Error creating admin user")
    } finally {
      setCreateLoading(false)
    }
  }

  // Edit admin user
  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role
    })
    setEditDialogOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setEditLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm)
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Admin user updated successfully")
        setEditDialogOpen(false)
        setEditingUser(null)
        setEditForm({ name: "", email: "", password: "", role: "admin" })
        fetchUsers()
      } else {
        toast.error(data.message || "Failed to update admin user")
      }
    } catch (error) {
      toast.error("Error updating admin user")
    } finally {
      setEditLoading(false)
    }
  }

  // Delete admin user
  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include"
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Admin user deleted successfully")
        fetchUsers()
      } else {
        toast.error(data.message || "Failed to delete admin user")
      }
    } catch (error) {
      toast.error("Error deleting admin user")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin users...</p>
        </div>
      </div>
    )
  }

  // Check if user has super admin permissions
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">Only Super Admin can manage admin users.</p>
          <p className="text-sm text-gray-500">Contact your Super Admin for access.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-500" />
            Admin Users
          </h1>
          <p className="text-gray-400 mt-2">Manage admin users and their permissions</p>
        </div>

        {/* Create User Button */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Admin User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Admin User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-gray-300">Name</Label>
                <Input
                  id="create-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email" className="text-gray-300">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showCreatePassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role" className="text-gray-300">Role</Label>
                <select
                  id="create-role"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createLoading ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Admins</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Verified</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.isVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Max Allowed</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Created</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">
                    {user.name}
                    {user.isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs border-blue-500 text-blue-400">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.isVerified ? "default" : "destructive"}
                      className={user.isVerified ? "bg-green-600" : "bg-red-600"}
                    >
                      {user.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!user.isCurrentUser && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Admin User</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Admin User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-300">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-gray-300">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-gray-300">
                New Password (leave blank to keep current)
              </Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  value={editForm.password}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  placeholder="Enter new password or leave blank"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-gray-300">Role</Label>
              <select
                id="edit-role"
                value={editForm.role}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editLoading ? "Updating..." : "Update User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
