"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Trash2, Loader2, Package } from "lucide-react";
import { getAdminReviews, deleteReview } from "@/actions/reviews";
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
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getAdminReviews();
      if (res.reviews) {
        setReviews(res.reviews as unknown as Review[]);
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
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)] flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-amber-500" /> Customer Product Reviews
        </h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Moderate customer ratings, product feedback, and reward coin triggers across YazMart.</p>
      </div>

      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Verified Purchase Reviews ({reviews.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-[var(--muted-foreground)]">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <span className="text-xs font-bold uppercase">Loading database reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted-foreground)] text-xs">
            No customer reviews submitted yet. Reviews will appear here when buyers write feedback after order delivery.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider bg-zinc-50">
                  <th className="p-3">Product</th>
                  <th className="p-3">Customer</th>
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
                          <p className="text-[9px] text-blue-500 font-mono">Order: #{r.order_id.slice(0, 8).toUpperCase()}</p>
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
    </div>
  );
}
