"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Trash2, Loader2, Package, Plus, X } from "lucide-react";
import { getAdminReviews, deleteReview, adminCreateReview } from "@/actions/reviews";
import { getEnterpriseProducts } from "@/actions/pim-products";
import { toast } from "react-hot-toast";

interface Review {
  id: string;
  user_name: string;
  user_email?: string | null;
  rating: number;
  comment: string;
  order_id: string;
  createdAt: Date | string;
  product?: {
    name: string;
    featured_image?: string | null;
    slug: string;
  } | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add Review Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const [revRes, prodRes] = await Promise.all([
        getAdminReviews(),
        getEnterpriseProducts({ limit: 100 })
      ]);
      if (revRes.reviews) {
        setReviews(revRes.reviews as unknown as Review[]);
      }
      if (prodRes.products) {
        setProducts(prodRes.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !reviewerName.trim() || !comment.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const res = await adminCreateReview({
      productId: selectedProductId,
      userName: reviewerName,
      userEmail: reviewerEmail || undefined,
      rating,
      comment,
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Review added successfully!");
      setIsAddModalOpen(false);
      setSelectedProductId("");
      setReviewerName("");
      setReviewerEmail("");
      setRating(5);
      setComment("");
      fetchReviews();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer review?")) return;
    try {
      setDeletingId(id);
      const res = await deleteReview(id);
      if (res.success) {
        toast.success("Review removed successfully.");
        setReviews(prev => prev.filter(r => r.id !== id));
      } else {
        toast.error(res.error || "Failed to delete review.");
      }
    } catch (err) {
      toast.error("Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-500" /> Customer Product Reviews
          </h1>
          <p className="text-[11px] text-[var(--muted-foreground)]">Moderate customer ratings, product feedback, and add manual admin reviews across YazMart.</p>
        </div>

        <button
          onClick={() => {
            if (products.length > 0) setSelectedProductId(products[0].id);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add Admin Review
        </button>
      </div>

      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> All Product Reviews ({reviews.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-[var(--muted-foreground)]">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <span className="text-xs font-bold uppercase">Loading database reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted-foreground)] text-xs">
            No customer reviews submitted yet. Click "Add Admin Review" above to publish a manual review for any product.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider bg-zinc-50">
                  <th className="p-3">Product</th>
                  <th className="p-3">Reviewer</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Comment</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {r.product?.featured_image ? (
                          <img src={r.product.featured_image} alt="" className="w-8 h-8 rounded object-cover border border-[var(--border)]" />
                        ) : (
                          <Package className="w-6 h-6 text-zinc-400" />
                        )}
                        <div>
                          <p className="font-bold text-[var(--foreground)] line-clamp-1">{r.product?.name || "Product"}</p>
                          <p className="text-[9px] text-blue-500 font-mono">Order: #{r.order_id ? r.order_id.slice(0, 8).toUpperCase() : "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-[var(--foreground)]">{r.user_name}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">{r.user_email || "-"}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-zinc-300"}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3 max-w-[280px] text-[var(--foreground)] text-xs">{r.comment}</td>
                    <td className="p-3 font-mono text-[10px] text-[var(--muted-foreground)]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Create Admin Review
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Select Target Product *</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:outline-none cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reviewer Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Sumon Ahmed"
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reviewer Email (Optional)</label>
                  <input
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    placeholder="e.g. sumon@example.com"
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rating (1 to 5 Stars)</label>
                <div className="mt-1.5 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`h-7 w-7 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-zinc-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Review Content / Comment *</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write the review message here..."
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 rounded-full border border-zinc-200 py-3 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-950 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Publish Review"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
