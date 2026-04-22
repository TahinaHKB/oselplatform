import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore";
import { db } from "@/firebase";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  X,
  ArrowUpDown,
  Users,
  UserCheck,
  UserX,
  Bell,
  MoreVertical,
  Trash2,
  Edit2,
  Filter,
  Download,
  Shield,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Inactive";
  createdAt: string;
  type_account?: string;
}

const PAGE_SIZE = 10;

export type UserFormData = Omit<User, "id" | "createdAt">;

const STORAGE_KEY = "userhub_users_v2";

export default function ManageUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof User>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  // 🔥 élément sentinel (en bas)
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  // 🔹 premier load
  const loadInitial = async () => {
    setLoading(true);

    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE),
    );

    const snapshot = await getDocs(q);

    const userList: User[] = await Promise.all(
      snapshot.docs.map(async (docItem) => {
        const data = docItem.data() as any;

        if (data.type_account.includes("vendeur")) data.role = "Editor";
        else if (data.type_account.includes("vendeur")) data.role = "Admin";
        else data.role = "Viewer";
        return {
          id: docItem.id,
          ...data,
          role: data.role,
          name: data.username
        };
      }),
    );

    setUsers(userList);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

    if (snapshot.empty || snapshot.docs.length < PAGE_SIZE) {
      setHasMore(false);
    }

    setLoading(false);
  };

  // 🔹 load more
  const loadMore = async () => {
    if (!lastDoc) return;

    setLoading(true);

    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE),
    );

    const snapshot = await getDocs(q);

    const userList: User[] = await Promise.all(
      snapshot.docs.map(async (docItem) => {
        const data = docItem.data() as any;

        if (data.type_account.includes("vendeur")) data.role = "Editor";
        else if (data.type_account.includes("vendeur")) data.role = "Admin";
        else data.role = "Viewer";
        return {
          id: docItem.id,
          ...data,
          role: data.role,
          name: data.username,
        };
      }),
    );

    setUsers((prev) => [...prev, ...userList]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

    if (snapshot.empty || snapshot.docs.length < PAGE_SIZE) {
      setHasMore(false);
    }

    setLoading(false);
  };

  // Stats calculation
  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "Active").length,
      inactive: users.filter((u) => u.status === "Inactive").length,
    }),
    [users],
  );

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  }, [users]);

  const addUser = (userData: UserFormData) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    setIsFormOpen(false);
  };

  const updateUser = (userData: UserFormData) => {
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)),
    );
    setEditingUser(null);
    setIsFormOpen(false);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
          : u,
      ),
    );
  };

  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.role.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        const fieldA = String(a[sortField]).toLowerCase();
        const fieldB = String(b[sortField]).toLowerCase();
        if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [users, searchQuery, sortField, sortOrder]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex w-full h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Pages</span>
            <span>/</span>
            <span className="text-slate-900 font-medium text-slate-900">
              Users
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Find a user..."
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-transparent rounded-full text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Team Members
                </h1>
                <p className="text-slate-500 mt-1">
                  Manage users, their roles and access levels.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Plus size={18} />
                  Add User
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value={stats.total}
                icon={<Users className="text-indigo-600" />}
                trend="+4% from last month"
                bgColor="bg-indigo-50"
              />
              <StatCard
                title="Active Accounts"
                value={stats.active}
                icon={<UserCheck className="text-emerald-600" />}
                trend="2 new today"
                bgColor="bg-emerald-50"
              />
              <StatCard
                title="Inactive Restricted"
                value={stats.inactive}
                icon={<UserX className="text-amber-600" />}
                trend="Requires review"
                bgColor="bg-amber-50"
              />
            </div>

            {/* Main Table Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-lg text-slate-900">
                    All Members
                  </h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    {filteredAndSortedUsers.length} Results
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                    <Filter size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                      <th
                        className="px-6 py-4 font-bold text-xs uppercase tracking-wider cursor-pointer group"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          User
                          <ArrowUpDown
                            className={`transition-opacity ${sortField === "name" ? "opacity-100 text-indigo-500" : "opacity-0 group-hover:opacity-100"}`}
                            size={14}
                          />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 font-bold text-xs uppercase tracking-wider cursor-pointer group"
                        onClick={() => handleSort("role")}
                      >
                        <div className="flex items-center gap-2">
                          Role
                          <ArrowUpDown
                            className={`transition-opacity ${sortField === "role" ? "opacity-100 text-indigo-500" : "opacity-0 group-hover:opacity-100"}`}
                            size={14}
                          />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 font-bold text-xs uppercase tracking-wider cursor-pointer group"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          <ArrowUpDown
                            className={`transition-opacity ${sortField === "status" ? "opacity-100 text-indigo-500" : "opacity-0 group-hover:opacity-100"}`}
                            size={14}
                          />
                        </div>
                      </th>
                      <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider transition-opacity">
                        Activity
                      </th>
                      <th className="px-6 py-4 font-bold text-xs text-right uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                      {filteredAndSortedUsers.length > 0 ? (
                        filteredAndSortedUsers.map((user, index) => {
                          const isLast =
                            index === filteredAndSortedUsers.length - 1;
                          return (
                            <motion.tr
                              key={user.id}
                              ref={isLast ? lastElementRef : null}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="group hover:bg-slate-50/50 transition-all"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110 ${getAvatarColor(user.role)}`}
                                  >
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 leading-tight">
                                      {user.name}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {user.email}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                  {getRoleIcon(user.role)}
                                  <span>{user.role}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => toggleStatus(user.id)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 transition-all active:scale-95 ${
                                    user.status === "Active"
                                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
                                      : "bg-slate-100 text-slate-600 ring-slate-200 hover:bg-slate-200"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}
                                  ></span>
                                  {user.status}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-slate-400 tabular-nums">
                                  {new Date(
                                    user.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingUser(user);
                                      setIsFormOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                                    title="Edit User"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(user.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                                    title="Delete User"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-20">
                            <div className="flex flex-col items-center justify-center text-center">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-slate-400" size={24} />
                              </div>
                              <p className="font-bold text-slate-900 text-lg">
                                No members found
                              </p>
                              <p className="text-slate-500 max-w-xs mt-1">
                                We couldn't find any results matching "
                                {searchQuery}". Try a different search term.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs font-medium text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Storage persistent
                  </span>
                  <span className="w-px h-3 bg-slate-300"></span>
                  <span>v2.0.4-stable</span>
                </div>
                <div>
                  Showing 1 - {filteredAndSortedUsers.length} of {users.length}{" "}
                  members
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <Plus className="text-indigo-600" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                      {editingUser ? "Update Profile" : "Invite Member"}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-slate-500 text-sm">
                  {editingUser
                    ? "Modify team member credentials and permission scope."
                    : "Sent an invitation to a new person to join your project space."}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                <UserForm
                  initialData={editingUser || undefined}
                  onSubmit={editingUser ? updateUser : addUser}
                  onCancel={() => setIsFormOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl z-[70] border border-slate-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="text-rose-500" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Are you absolutely sure?
                </h3>
                <p className="text-slate-500 mt-3 leading-relaxed">
                  This action cannot be undone. This will permanently remove the
                  user and revoke all their access rights.
                </p>
                <div className="flex items-center gap-3 w-full mt-8">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="text-3xl font-black text-slate-900 mt-1">{value}</div>
        <p className="text-xs text-slate-400 mt-1 font-medium italic">
          {trend}
        </p>
      </div>
    </div>
  );
}

function getAvatarColor(role: User["role"]) {
  switch (role) {
    case "Admin":
      return "bg-indigo-100 text-indigo-700";
    case "Editor":
      return "bg-amber-100 text-amber-700";
    case "Viewer":
      return "bg-slate-100 text-slate-700";
  }
}

function getRoleIcon(role: User["role"]) {
  switch (role) {
    case "Admin":
      return <Shield size={14} className="text-indigo-500" />;
    case "Editor":
      return <Edit2 size={14} className="text-amber-500" />;
    case "Viewer":
      return <Eye size={14} className="text-slate-400" />;
  }
}

function UserForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: UserFormData;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<UserFormData>(
    initialData || {
      name: "",
      email: "",
      username: "",
      role: "Viewer",
      status: "Active",
    },
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof UserFormData, string>>
  >({});

  const validate = () => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid business email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 space-y-8 h-full flex flex-col"
    >
      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            Identity Details
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Sarah Connor"
              className={`w-full px-5 py-4 bg-slate-50 border ${errors.name ? "border-rose-400 ring-4 ring-rose-50" : "border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"} rounded-2xl outline-none transition-all font-medium text-slate-900`}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            {errors.name && (
              <p className="text-xs font-bold text-rose-500 mt-2 ml-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            Email Connection
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="sarah@skynet.com"
              className={`w-full px-5 py-4 bg-slate-50 border ${errors.email ? "border-rose-400 ring-4 ring-rose-50" : "border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"} rounded-2xl outline-none transition-all font-medium text-slate-900`}
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            {errors.email && (
              <p className="text-xs font-bold text-rose-500 mt-2 ml-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            Security Scope (Role)
          </label>
          <div className="grid grid-cols-1 gap-3">
            {(["Admin", "Editor", "Viewer"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role }))}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  formData.role === role
                    ? "bg-indigo-50 border-indigo-600 ring-4 ring-indigo-50"
                    : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.role === role ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  {getRoleIcon(role)}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-bold ${formData.role === role ? "text-indigo-900" : "text-slate-900"}`}
                  >
                    {role}
                  </span>
                  <span className="text-xs text-slate-500">
                    {role === "Admin"
                      ? "Full system access & control"
                      : role === "Editor"
                        ? "Read and write modifications"
                        : "Read-only workspace access"}
                  </span>
                </div>
                <div
                  className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.role === role ? "border-indigo-600 bg-indigo-600" : "border-slate-200"}`}
                >
                  {formData.role === role && (
                    <CheckCircle2 className="text-white" size={14} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
            Lifecycle Status
          </label>
          <div className="flex gap-4">
            {(["Active", "Inactive"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status }))}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all focus:ring-4 focus:ring-slate-100 ${
                  formData.status === status
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-100 text-slate-400"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-8 sticky bottom-0 bg-white border-t border-slate-100 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
        >
          Discard
        </button>
        <button
          type="submit"
          className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
        >
          {initialData ? "Apply Changes" : "Confirm Invite"}
        </button>
      </div>
    </form>
  );
}
