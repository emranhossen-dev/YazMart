"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  ShieldCheck, Users, KeyRound, Clock, Plus, 
  Trash2, Save, AlertCircle, RefreshCw, CheckCircle2 
} from "lucide-react";
import { 
  getStaffMembers, 
  getSystemRoles, 
  updateStaffMemberRole, 
  createOrUpdateRole, 
  deleteRole,
  createStaffMember
} from "@/actions/staff";
import { toast } from "react-hot-toast";

const PERMISSION_KEYS = [
  { key: "products", label: "Catalog Products", desc: "All Products dashboard, product insertions and modifications" },
  { key: "categories", label: "Catalog Categories", desc: "Manage product categorization schemas" },
  { key: "brands", label: "Catalog Brands", desc: "Manage supplier brand directories" },
  { key: "attributes", label: "Catalog Attributes", desc: "Manage product variant attributes mapping" },
  { key: "tags", label: "Catalog Tags", desc: "Manage product catalog groupings tags" },
  { key: "orders", label: "Sales Orders Logs", desc: "Inspect order lists, returns and refund configurations" },
  { key: "inventory", label: "Master Inventory Ledger", desc: "Inspect warehouse stocks, allocations & transfers logs" },
  { key: "purchase", label: "Purchase & Suppliers PO", desc: "Supervise purchase orders and vendor directories" },
  { key: "customers", label: "Customers Profiles & CMS", desc: "Supervise directories, tickets, and review approvals" },
  { key: "finance", label: "Finance & Bookkeeping", desc: "Inspect sales margin tables, ledgers, and profits" },
  { key: "marketing", label: "Vouchers & Campaigns", desc: "Manage vouchers, newsletters and sliding banners" },
  { key: "content", label: "Blogs & Media Storage", desc: "Manage company blog posts, media assets, and FAQs" },
  { key: "reports", label: "Business Analytics Reports", desc: "Inspect sales, inventory, and finance reports" },
  { key: "staff", label: "Staff & RBAC Permissions", desc: "Supervise system operators and security policies" },
  { key: "settings", label: "System Config settings", desc: "Homepage layout builder, payment gateways, and SEO" }
];

interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = pathname.split("/").filter(Boolean)[2] || "directory";

  const [staffList, setStaffList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Selected role for the editor panel
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  // Invite staff states
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRoleId, setAddRoleId] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes] = await Promise.all([
        getStaffMembers(),
        getSystemRoles()
      ]);
      if (staffRes.staff) setStaffList(staffRes.staff);
      if (rolesRes.roles) setRolesList(rolesRes.roles);
    } catch (err) {
      toast.error("Failed to load staff metadata.");
    } finally {
      setLoading(false);
    }
  };

  // Sync session and fetch data
  useEffect(() => {
    fetchData();
    
    // Sync activity logs from local storage
    if (typeof window !== "undefined") {
      const storedLogs = localStorage.getItem("yazmart_security_audit");
      if (storedLogs) {
        setAuditLogs(JSON.parse(storedLogs));
      } else {
        const initialLogs = [
          { id: "SEC-901", user: "System Monitor", action: "Initialized RBAC Guard", target: "Permissions policy kernel", time: new Date().toLocaleString() }
        ];
        setAuditLogs(initialLogs);
        localStorage.setItem("yazmart_security_audit", JSON.stringify(initialLogs));
      }
    }
  }, []);

  const pushAuditLog = (action: string, target: string) => {
    const newLog: AuditLog = {
      id: `SEC-${Math.floor(1000 + Math.random() * 9000)}`,
      user: "Current Admin",
      action,
      target,
      time: new Date().toLocaleString()
    };
    
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem("yazmart_security_audit", JSON.stringify(updated));
      return updated;
    });
  };

  // 1. Assign role to a staff member
  const handleRoleChange = async (profileId: string, roleId: string, staffName: string) => {
    try {
      const selectedRoleObj = rolesList.find(r => r.id === roleId);
      const res = await updateStaffMemberRole(profileId, roleId);
      if (res.success) {
        toast.success(`Role updated for ${staffName}!`);
        pushAuditLog("Reassigned Operator Role", `${staffName} -> ${selectedRoleObj?.name || "Member"}`);
        fetchData();
      } else {
        toast.error(res.error || "Failed to update role.");
      }
    } catch (err) {
      toast.error("Role update transaction failed.");
    }
  };

  // 2. Select a role to configure in editor panel
  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setEditRoleName(role.name);
    setEditPermissions(role.permissions || []);
  };

  // 3. Prepare to create a new role
  const handleCreateNewRole = () => {
    setSelectedRole({ id: "" }); // empty ID indicates new
    setEditRoleName("");
    setEditPermissions([]);
  };

  // 4. Toggle a checklist checkbox
  const togglePermission = (key: string) => {
    setEditPermissions((prev) => 
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  // 5. Save/create the role policy
  const handleSaveRolePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleName.trim()) {
      toast.error("Role name cannot be empty.");
      return;
    }
    
    try {
      setSavingRole(true);
      const isNew = !selectedRole?.id;
      const res = await createOrUpdateRole(editRoleName, editPermissions, selectedRole?.id || undefined);
      
      if (res.success) {
        toast.success(isNew ? "Created new system security role!" : "Role security policy updated!");
        pushAuditLog(isNew ? "Created Security Role" : "Modified Security Policies", editRoleName);
        fetchData();
        setSelectedRole(null);
      } else {
        toast.error(res.error || "Failed to save role.");
      }
    } catch (err) {
      toast.error("Policy transaction failed.");
    } finally {
      setSavingRole(false);
    }
  };

  // 6. Delete role policy
  const handleDeleteRolePolicy = async (roleId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the security role "${name}"?`)) return;
    
    try {
      const res = await deleteRole(roleId);
      if (res.success) {
        toast.success("Role security policy purged successfully.");
        pushAuditLog("Deleted Security Role", name);
        fetchData();
        setSelectedRole(null);
      } else {
        toast.error(res.error || "Failed to delete role.");
      }
    } catch (err) {
      toast.error("Delete role policy transaction failed.");
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addEmail || !addPassword || !addRoleId) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      setAddingStaff(true);
      const res = await createStaffMember(addName, addEmail, addPassword, addRoleId);
      if (res.success) {
        toast.success(`Operator ${addName} registered successfully!`);
        pushAuditLog("Registered Staff Account", `${addName} (${addEmail})`);
        
        // Reset states
        setAddName("");
        setAddEmail("");
        setAddPassword("");
        setAddRoleId("");
        setShowAddStaff(false);
        fetchData();
      } else {
        toast.error(res.error || "Failed to create staff member.");
      }
    } catch (err) {
      toast.error("Registration transaction failed.");
    } finally {
      setAddingStaff(false);
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Staff & Permissions Deck</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Supervise team access permissions, edit dynamic RBAC policies, and audit administrative trail logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px">
        <button 
          onClick={() => router.push('/admin/staff/users')}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            activeTab === "users" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Staff Directory
        </button>
        <button 
          onClick={() => router.push('/admin/staff/roles')}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            activeTab === "roles" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Roles & RBAC
        </button>
        <button 
          onClick={() => router.push('/admin/staff/logs')}
          className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-colors cursor-pointer ${
            activeTab === "logs" ? "border-blue-500 text-blue-500" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Audit logs
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
          <span className="text-xs text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">Syncing Security Core...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Tab 1: Staff Directory */}
          {activeTab === "users" && (
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" /> Active System Administrators
                </h3>
                <button
                  onClick={() => setShowAddStaff(!showAddStaff)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Invite Operator
                </button>
              </div>

              {/* Add Staff Form */}
              {showAddStaff && (
                <form onSubmit={handleInviteStaff} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                  <h4 className="text-xs font-bold uppercase text-blue-400">Register Staff Operator</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        placeholder="john@yazmart.com"
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Security Password</label>
                      <input
                        type="password"
                        required
                        value={addPassword}
                        onChange={(e) => setAddPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Assigned Security Role</label>
                      <select
                        required
                        value={addRoleId}
                        onChange={(e) => setAddRoleId(e.target.value)}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        <option value="" disabled>Select Role...</option>
                        {rolesList.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddStaff(false)}
                      className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingStaff}
                      className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {addingStaff ? "Registering..." : "Register Operator"}
                    </button>
                  </div>
                </form>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                      <th className="pb-3">Staff ID</th>
                      <th className="pb-3">Full Name</th>
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3">Security Clearances</th>
                      <th className="pb-3">Security Role Assignment</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {staffList.map((st) => (
                      <tr key={st.id} className="hover:bg-[var(--background)]/50 transition-colors">
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{st.id.slice(0, 8)}</td>
                        <td className="py-3.5 font-bold text-[var(--foreground)]">{st.full_name || "Enterprise User"}</td>
                        <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{st.email || "No Email"}</td>
                        <td className="py-3.5">
                          {st.roles?.name === "admin" || st.roles?.name === "Super Admin" ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                              ROOT ACCESS
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-[280px]">
                              {st.roles?.permissions && (st.roles.permissions as string[]).length > 0 ? (
                                (st.roles.permissions as string[]).map((p: string) => (
                                  <span key={p} className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-800 text-slate-300 uppercase tracking-tight">
                                    {p}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Zero Clearance</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5">
                          {/* Super Admin cannot be downgraded directly from normal dashboard */}
                          {st.roles?.name === "Super Admin" ? (
                            <span className="font-bold text-blue-500 text-[11px] uppercase tracking-wider">{st.roles?.name}</span>
                          ) : (
                            <select
                              value={st.role_id || ""}
                              onChange={(e) => handleRoleChange(st.id, e.target.value, st.full_name || "Enterprise User")}
                              className="bg-[var(--background)] border border-[var(--border)] rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors cursor-pointer"
                            >
                              <option value="" disabled>Select Role...</option>
                              {rolesList.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Roles & RBAC Configuration (Split Layout Master-Detail) */}
          {activeTab === "roles" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Panel: Roles Master List */}
              <div className="lg:col-span-5 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4 h-fit">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-blue-500" /> Security Roles Registry
                  </h3>
                  <button
                    onClick={handleCreateNewRole}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Role
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                        <th className="pb-3">Security Role</th>
                        <th className="pb-3">Assigned</th>
                        <th className="pb-3 text-right">Clearance Policy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] font-medium">
                      {rolesList.map((rl) => (
                        <tr 
                          key={rl.id} 
                          className={`hover:bg-[var(--background)]/50 transition-colors ${selectedRole?.id === rl.id ? "bg-blue-600/5 text-blue-400" : ""}`}
                        >
                          <td className="py-3.5">
                            <p className="font-bold text-slate-200">{rl.name}</p>
                            <span className="text-[9px] text-[var(--muted-foreground)] uppercase font-mono tracking-tighter">
                              {rl.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-300 font-bold">{rl.usersCount} Staff</td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleEditRole(rl)}
                              className="px-2 py-0.5 rounded border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-[9px] font-bold uppercase transition-all cursor-pointer"
                            >
                              Edit Rules
                            </button>
                            {rl.name !== "Super Admin" && rl.name !== "admin" && (
                              <button
                                onClick={() => handleDeleteRolePolicy(rl.id, rl.name)}
                                className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                                title="Purge Role Policy"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Panel: Role Detail Clearance Editor */}
              <div className="lg:col-span-7 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
                {selectedRole ? (
                  <form onSubmit={handleSaveRolePolicy} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                      <h3 className="text-xs font-black uppercase text-blue-400 flex items-center gap-2">
                        <ShieldCheck className="h-4.5 w-4.5" /> 
                        {selectedRole.id ? "Alter Access Policy Rules" : "Compile New Security Clearance Role"}
                      </h3>
                      {selectedRole.id && (selectedRole.name === "Super Admin" || selectedRole.name === "admin") && (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-widest">
                          ROOT RULE
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Role Title Designation</label>
                      <input
                        type="text"
                        value={editRoleName}
                        onChange={(e) => setEditRoleName(e.target.value)}
                        placeholder="e.g. Inventory Controller, Accounts executive"
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                        disabled={selectedRole.name === "Super Admin" || selectedRole.name === "admin"}
                      />
                    </div>

                    {/* Checkbox Grid */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">System Route CLEARANCE MAPPINGS</label>
                      
                      {selectedRole.name === "Super Admin" || selectedRole.name === "admin" ? (
                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs flex gap-3 text-blue-400/90 leading-relaxed font-medium">
                          <AlertCircle className="h-5 w-5 shrink-0" />
                          <span>This is a system root administrative role. All security clearances and path matrices are fully unlocked by default and cannot be restricted.</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2.5">
                          {PERMISSION_KEYS.map((perm) => {
                            const active = editPermissions.includes(perm.key);
                            return (
                              <div
                                key={perm.key}
                                onClick={() => togglePermission(perm.key)}
                                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex gap-3 select-none hover:bg-[var(--accent)]/30 ${
                                  active 
                                    ? "border-blue-500/50 bg-blue-500/5" 
                                    : "border-[var(--border)] bg-[var(--background)]/40"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={() => {}} // handled by click
                                  className="mt-0.5 h-3.5 w-3.5 accent-blue-500 cursor-pointer pointer-events-none"
                                />
                                <div className="space-y-0.5">
                                  <p className="font-bold text-[11px] text-slate-200">{perm.label}</p>
                                  <p className="text-[9px] text-[var(--muted-foreground)] leading-normal">{perm.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {!(selectedRole.name === "Super Admin" || selectedRole.name === "admin") && (
                      <div className="flex gap-3 justify-end pt-3 border-t border-[var(--border)]">
                        <button
                          type="button"
                          onClick={() => setSelectedRole(null)}
                          className="px-4 py-2 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[10px] font-bold uppercase transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingRole}
                          className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase transition-all cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {savingRole ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          Save Policy
                        </button>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <ShieldCheck className="h-10 w-10 text-[var(--muted-foreground)] opacity-30 animate-[pulse_4s_infinite]" />
                    <div>
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Access Clearance Deck</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] max-w-xs leading-normal mt-1">
                        Select a dynamic security role policy from the registry list to modify its path permissions, or compile a new security role.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Security logs */}
          {activeTab === "logs" && (
            <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" /> Administrative Security Audit Trail
                </h3>
                <button
                  onClick={() => {
                    localStorage.removeItem("yazmart_security_audit");
                    setAuditLogs([]);
                    toast.success("Security logs cleared.");
                  }}
                  className="px-3 py-1 rounded border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                      <th className="pb-3">Audit ID</th>
                      <th className="pb-3">Operating User</th>
                      <th className="pb-3">Performed Action</th>
                      <th className="pb-3">Target policy Node</th>
                      <th className="pb-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[var(--muted-foreground)]">
                          No audit trails found.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((act) => (
                        <tr key={act.id} className="hover:bg-[var(--background)]/50 transition-colors">
                          <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{act.id}</td>
                          <td className="py-3.5 font-bold text-slate-200">{act.user}</td>
                          <td className="py-3.5 text-blue-400 font-semibold">{act.action}</td>
                          <td className="py-3.5 text-[var(--muted-foreground)]">{act.target}</td>
                          <td className="py-3.5 text-right font-mono text-[10px] text-[var(--muted-foreground)]">{act.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
