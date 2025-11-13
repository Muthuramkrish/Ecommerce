import React, { useEffect, useState } from "react";
import {
  UserX,
  UserCheck,
  Shield,
  Trash2,
  User,
  AlertTriangle,
  PlusCircle,
  Pencil,
  Briefcase,
  Zap,
  RefreshCw,
} from "lucide-react";

import {
  getAllUsers,
  updateUserRole,
  changeUserStatus,
  deleteUser,
} from "../api/admin"; // ✅ Use shared backend helpers
import { API_BASE_URL } from "../api/client";

const ALL_ROLES = ["user", "manager", "admin", "superadmin"];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [showUpsertModal, setShowUpsertModal] = useState(false);
  const [upsertingUser, setUpsertingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // ===============================
  // 📦 Fetch Users
  // ===============================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers(`${API_BASE_URL}/api/admin/users`);
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (
        err.message.includes("Session expired") ||
        err.message.includes("User not found")
      ) {
        localStorage.removeItem("currentAdmin");
        window.location.href = "/admin/login";
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===============================
  // 🧑‍💼 User Management Handlers
  // ===============================
  const handleOpenUpsertModal = (user = null) => {
    setUpsertingUser(user);
    setShowUpsertModal(true);
  };

  const getPermissionsForRole = (role) => {
    const permissions = {
      user: {
        canManageOrders: false,
        canManageProducts: false,
        canManageUsers: false,
        canViewReports: false,
      },
      manager: {
        canManageOrders: true,
        canManageProducts: false,
        canManageUsers: false,
        canViewReports: true,
      },
      admin: {
        canManageOrders: true,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
      },
      superadmin: {
        canManageOrders: true,
        canManageProducts: true,
        canManageUsers: true,
        canViewReports: true,
      },
    };
    return permissions[role] || permissions.user;
  };

  const handleSaveUpsert = async (userData) => {
    try {
      setSaving(true);
      if (userData._id) {
        await updateUserRole(
          userData._id,
          userData.role,
          getPermissionsForRole(userData.role)
        );
      } else {
        alert(
          "Creating new users should be done through signup. This panel is for managing existing users."
        );
      }

      await fetchUsers();
      setShowUpsertModal(false);
      setUpsertingUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
      alert(`Failed to save user: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await changeUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, status: newStatus } : u
        )
      );
    } catch (err) {
      console.error("Error toggling status:", err);
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      await deleteUser(userToDelete._id);
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      setShowModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(`Failed to delete user: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // ===============================
  // 🎨 Badge Helpers
  // ===============================
  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700 ring-green-500/20",
      inactive: "bg-gray-200 text-gray-600 ring-gray-500/20",
      suspended: "bg-red-100 text-red-700 ring-red-500/20",
    };
    return (
      <span
        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${
          styles[status] || styles.inactive
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      user: "bg-yellow-100 text-yellow-700 ring-yellow-500/20",
      manager: "bg-teal-100 text-teal-700 ring-teal-500/20",
      admin: "bg-blue-100 text-blue-700 ring-blue-500/20",
      superadmin: "bg-red-100 text-red-700 ring-red-500/20",
    };

    let IconComponent = User;
    if (role === "manager") IconComponent = Briefcase;
    if (role === "admin") IconComponent = Shield;
    if (role === "superadmin") IconComponent = Zap;

    const formattedRole = role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${
          styles[role] || styles.user
        }`}
      >
        <IconComponent size={12} className="mr-1" /> {formattedRole}
      </span>
    );
  };

  // ===============================
  // ⚠️ Modals
  // ===============================
  const ConfirmationModal = () =>
    showModal && userToDelete ? (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          <div className="flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Confirm User Deletion
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to permanently delete{" "}
              <strong>{userToDelete.fullName}</strong> ({userToDelete.email})?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4 w-full">
              <button
                onClick={() => setShowModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition flex items-center disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw size={16} className="mr-1 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-1" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  const UpsertUserModal = () => {
    if (!showUpsertModal) return null;
    const isEdit = !!upsertingUser;
    const initialData = upsertingUser || {
      fullName: "",
      email: "",
      role: "user",
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        _id: initialData._id,
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        role: formData.get("role"),
      };
      handleSaveUpsert(data);
    };

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {isEdit ? "Edit User Role" : "Add New User"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  disabled={isEdit}
                  defaultValue={initialData.fullName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  disabled={isEdit}
                  defaultValue={initialData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Role
                </label>
                <select
                  name="role"
                  defaultValue={initialData.role}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowUpsertModal(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition flex items-center disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} className="mr-1" />
                    {isEdit ? "Save Changes" : "Create User"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ===============================
  // 💻 UI States
  // ===============================
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-red-800 mb-2 text-center">
            Error Loading Users
          </h3>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ===============================
  // 🧾 Main UI
  // ===============================
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <User className="text-blue-700 w-7 h-7" /> User Management
        </h2>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition flex items-center shadow"
        >
          <RefreshCw size={18} className="mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-800 text-white text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 text-left font-medium">Name</th>
              <th className="p-4 text-left font-medium hidden sm:table-cell">
                Email
              </th>
              <th className="p-4 text-center font-medium">Role</th>
              <th className="p-4 text-center font-medium hidden md:table-cell">
                Joined
              </th>
              <th className="p-4 text-center font-medium">Status</th>
              <th className="p-4 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-gray-800">
            {users.length > 0 ? (
              users.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-blue-50/50 transition duration-150"
                >
                  <td className="p-4 font-medium">{u.fullName}</td>
                  <td className="p-4 text-gray-500 hidden sm:table-cell">
                    {u.email}
                  </td>
                  <td className="p-4 text-center">{getRoleBadge(u.role)}</td>
                  <td className="p-4 text-gray-500 text-sm hidden md:table-cell">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(u.status)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => toggleStatus(u._id, u.status)}
                        title={
                          u.status === "active"
                            ? "Deactivate User"
                            : "Activate User"
                        }
                        className={`p-2 rounded-lg border transition shadow-sm ${
                          u.status === "active"
                            ? "border-amber-500 text-amber-500 hover:bg-amber-50"
                            : "border-green-500 text-green-500 hover:bg-green-50"
                        }`}
                      >
                        {u.status === "active" ? (
                          <UserX size={16} />
                        ) : (
                          <UserCheck size={16} />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenUpsertModal(u)}
                        title="Edit User Role"
                        className="p-2 rounded-lg border border-indigo-500 text-indigo-500 hover:bg-indigo-50 transition shadow-sm"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(u)}
                        title="Delete User"
                        className="p-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-12 text-lg text-gray-500"
                >
                  <UserX className="inline-block mr-3 text-gray-400 w-6 h-6" />
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal />
      <UpsertUserModal />
    </div>
  );
};

export default AdminUsers;
