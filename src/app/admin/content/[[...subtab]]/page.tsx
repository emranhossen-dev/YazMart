"use client";

import React, { startTransition, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getContentPages, createContentPage, deleteContentPage } from "@/actions/finance";
import { FileText, HelpCircle, Image as ImageIcon, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  
  const pathname = usePathname();
  const activeTab = pathname.split("/").filter(Boolean)[2] || "blogs";
  const [loading, setLoading] = useState(true);

  // Data from DB
  const [blogs, setBlogs] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);

  // Blog form
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogBody, setBlogBody] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("");

  // FAQ form
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("");

  // Media form
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [mediaFileName, setMediaFileName] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaSize, setMediaSize] = useState("");

  
  const selectTab = (tabName: string) => { startTransition(() => { router.push(`/admin/content/${tabName}`); }); };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [blogRes, faqRes, mediaRes] = await Promise.all([
        getContentPages("blog"),
        getContentPages("faq"),
        getContentPages("media")
      ]);

      if (blogRes.success && blogRes.pages) setBlogs(blogRes.pages);
      if (faqRes.success && faqRes.pages) setFaqs(faqRes.pages);
      if (mediaRes.success && mediaRes.pages) setMedia(mediaRes.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle) { toast.error("Please enter a blog title."); return; }
    try {
      const res = await createContentPage({
        id: `BLG-${Math.floor(100 + Math.random() * 900)}`,
        type: "blog",
        title: blogTitle,
        body: blogBody,
        author: blogAuthor || "Admin",
        meta: "0 views",
        status: "PUBLISHED",
        created_at: new Date().toISOString().split("T")[0]
      });
      if (res.success) {
        toast.success("Blog article published to database.");
        setBlogTitle(""); setBlogBody(""); setBlogAuthor("");
        setShowAddBlog(false);
        fetchContent();
      } else { toast.error(res.error || "Failed."); }
    } catch { toast.error("Transaction failed."); }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion) { toast.error("Please enter a FAQ question."); return; }
    try {
      const res = await createContentPage({
        id: `FAQ-${Math.floor(10 + Math.random() * 90)}`,
        type: "faq",
        title: faqQuestion,
        body: faqAnswer,
        author: "",
        meta: faqCategory || "General",
        status: "ACTIVE",
        created_at: new Date().toISOString().split("T")[0]
      });
      if (res.success) {
        toast.success("FAQ entry saved to database.");
        setFaqQuestion(""); setFaqAnswer(""); setFaqCategory("");
        setShowAddFaq(false);
        fetchContent();
      } else { toast.error(res.error || "Failed."); }
    } catch { toast.error("Transaction failed."); }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFileName || !mediaUrl) { toast.error("Please fill in media details."); return; }
    try {
      const res = await createContentPage({
        id: `MED-${Math.floor(100 + Math.random() * 900)}`,
        type: "media",
        title: mediaFileName,
        body: mediaUrl,
        author: "",
        meta: mediaSize || "Unknown",
        status: "ACTIVE",
        created_at: new Date().toISOString().split("T")[0]
      });
      if (res.success) {
        toast.success("Media asset registered in database.");
        setMediaFileName(""); setMediaUrl(""); setMediaSize("");
        setShowAddMedia(false);
        fetchContent();
      } else { toast.error(res.error || "Failed."); }
    } catch { toast.error("Transaction failed."); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteContentPage(id);
      if (res.success) {
        toast.success("Content entry deleted.");
        fetchContent();
      } else { toast.error(res.error || "Failed."); }
    } catch { toast.error("Transaction failed."); }
  };

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Content Management</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Manage blog entries, FAQ matrices, and media library assets. All data persisted in database.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-px overflow-x-auto custom-scrollbar">
        {[
          { key: "blogs", label: "Blogs Management" },
          { key: "faq", label: "FAQ Matrix" },
          { key: "media", label: "Media Library" }
        ].map(t => (
          <Link href={`/admin/content/${t.key}`}
            key={t.key}
            
            className={`px-4 py-2 text-xs font-bold uppercase border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.key ? "border-blue-500 text-blue-500 bg-blue-500/5" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Content Container */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-[var(--muted-foreground)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs font-bold uppercase">Loading content from database...</span>
          </div>
        ) : (
          <>
            {activeTab === "blogs" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" /> Blog Articles Ledger
                  </h3>
                  <button
                    onClick={() => setShowAddBlog(!showAddBlog)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3 w-3" /> New Article
                  </button>
                </div>

                {showAddBlog && (
                  <form onSubmit={handleAddBlog} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                    <h4 className="text-xs font-bold uppercase text-blue-400">Compose Blog Article</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Article Title</label>
                        <input type="text" required value={blogTitle} onChange={e => setBlogTitle(e.target.value)} placeholder="e.g. Top 5 E-commerce Trends for 2026" className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Article Body</label>
                        <textarea value={blogBody} onChange={e => setBlogBody(e.target.value)} rows={3} placeholder="Write article content..." className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors resize-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Author Name</label>
                        <input type="text" value={blogAuthor} onChange={e => setBlogAuthor(e.target.value)} placeholder="e.g. Emran Admin" className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button type="button" onClick={() => setShowAddBlog(false)} className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm">Publish Article</button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                        <th className="pb-3">Article ID</th>
                        <th className="pb-3">Post Title</th>
                        <th className="pb-3">Author Profile</th>
                        <th className="pb-3">Impression Views</th>
                        <th className="pb-3">Creation Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] font-medium">
                      {blogs.length === 0 ? (
                        <tr><td colSpan={7} className="py-8 text-center text-[var(--muted-foreground)]">No blog articles found. Create one above.</td></tr>
                      ) : blogs.map(blog => (
                        <tr key={blog.id} className="hover:bg-[var(--background)]/50 transition-colors">
                          <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{blog.id}</td>
                          <td className="py-3.5 font-bold text-[var(--foreground)]">{blog.title}</td>
                          <td className="py-3.5 text-[var(--muted-foreground)]">{blog.author}</td>
                          <td className="py-3.5 font-mono text-[10px] text-[var(--foreground)]">{blog.meta}</td>
                          <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{blog.created_at}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${blog.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"}`}>{blog.status}</span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button onClick={() => handleDelete(blog.id)} className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-500" /> FAQ Matrices
                  </h3>
                  <button
                    onClick={() => setShowAddFaq(!showAddFaq)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3 w-3" /> New FAQ
                  </button>
                </div>

                {showAddFaq && (
                  <form onSubmit={handleAddFaq} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                    <h4 className="text-xs font-bold uppercase text-blue-400">Add FAQ Entry</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Question</label>
                        <input type="text" required value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} placeholder="e.g. What is the standard delivery timeline?" className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Answer</label>
                        <textarea value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} rows={2} placeholder="Write answer..." className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors resize-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Category</label>
                        <input type="text" value={faqCategory} onChange={e => setFaqCategory(e.target.value)} placeholder="e.g. Shipping" className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button type="button" onClick={() => setShowAddFaq(false)} className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm">Save FAQ</button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                        <th className="pb-3">FAQ Reference</th>
                        <th className="pb-3">FAQ Question Prompt</th>
                        <th className="pb-3">Help Category</th>
                        <th className="pb-3">Status Flag</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] font-medium">
                      {faqs.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-[var(--muted-foreground)]">No FAQ entries found. Add one above.</td></tr>
                      ) : faqs.map(faq => (
                        <tr key={faq.id} className="hover:bg-[var(--background)]/50 transition-colors">
                          <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{faq.id}</td>
                          <td className="py-3.5 font-bold text-[var(--foreground)]">{faq.title}</td>
                          <td className="py-3.5 text-[var(--muted-foreground)]">{faq.meta}</td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">{faq.status}</span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button onClick={() => handleDelete(faq.id)} className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-500" /> Uploaded CDN Assets Media
                  </h3>
                  <button
                    onClick={() => setShowAddMedia(!showAddMedia)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold uppercase transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3 w-3" /> Register Asset
                  </button>
                </div>

                {showAddMedia && (
                  <form onSubmit={handleAddMedia} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]/35 space-y-3 max-w-xl">
                    <h4 className="text-xs font-bold uppercase text-blue-400">Register Media Asset</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">File Name</label>
                        <input type="text" required value={mediaFileName} onChange={e => setMediaFileName(e.target.value)} placeholder="e.g. hero_banner.jpg" className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">URL / CDN Link</label>
                        <input type="text" required value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://..." className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">File Size</label>
                        <input type="text" value={mediaSize} onChange={e => setMediaSize(e.target.value)} placeholder="e.g. 384 KB" className="w-full bg-[var(--card)] border border-[var(--border)] rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button type="button" onClick={() => setShowAddMedia(false)} className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--accent)]/50 text-[9px] font-bold uppercase transition-all cursor-pointer">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase transition-all cursor-pointer shadow-sm">Register Asset</button>
                    </div>
                  </form>
                )}

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {media.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-[var(--muted-foreground)] text-xs">No media assets found. Register one above.</div>
                  ) : media.map(med => (
                    <div key={med.id} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] flex gap-3 items-center group relative">
                      <div className="w-12 h-12 rounded border border-[var(--border)] overflow-hidden bg-black flex items-center justify-center">
                        {med.body ? <img src={med.body} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="h-5 w-5 text-[var(--muted-foreground)]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate text-[var(--foreground)]">{med.title}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-mono">{med.meta}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {med.body && (
                          <a href={med.body} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-[var(--accent)] rounded text-[var(--muted-foreground)] hover:text-blue-500 transition-colors">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button onClick={() => handleDelete(med.id)} className="p-1.5 hover:bg-[var(--accent)] rounded text-rose-400 hover:text-rose-300 transition-colors cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
