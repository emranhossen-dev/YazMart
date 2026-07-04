"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getReviews, toggleReviewApproval, deleteReview } from "@/actions/finance";
import { toast } from "react-hot-toast";

interface Review {
  id: string;
  customer_name: string;
  product_name: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getReviews();
      if (res.success && res.reviews) {
        setReviews(res.reviews as Review[]);
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

  const handleToggleApproval = async (id: string, currentApproved: boolean) => {
    try {
      const res = await toggleReviewApproval(id, !currentApproved);
      if (res.success) {
        toast.success(`Review ${!currentApproved ? "approved" : "unapproved"} successfully.`);
        fetchReviews();
      } else {
        toast.error(res.error || "Failed to update review.");
      }
    } catch (err) {
      toast.error("Failed to update review.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteReview(id);
      if (res.success) {
        toast.success("Review deleted from database.");
        fetchReviews();
      } else {
        toast.error(res.error || "Failed to delete review.");
      }
    } catch (err) {
      toast.error("Failed to delete review.");
    }
  };

  return (
    <div className="space-y-6 select-none font-sans text-slate-100">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Customer Reviews</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Audit ratings, remarks, and storefront approval credentials from verified purchasers. All data persisted in database.</p>
      </div>

      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" /> Catalog Review Ledger
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-[var(--muted-foreground)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs font-bold uppercase">Loading reviews from database...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted-foreground)] text-xs">
            No reviews found in the database. Reviews will appear here when customers submit them.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                  <th className="pb-3">Review ID</th>
                  <th className="pb-3">User & Product</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Comment</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-center">Approved</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--background)]/50 transition-colors">
                    <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{r.id}</td>
                    <td className="py-3.5">
                      <p className="font-bold text-[var(--foreground)]">{r.customer_name}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">{r.product_name}</p>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-[var(--border)]"}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 max-w-[250px] truncate text-[var(--muted-foreground)]">{r.comment}</td>
                    <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{r.date}</td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleToggleApproval(r.id, r.approved)}
                        className="cursor-pointer transition-colors"
                        title={r.approved ? "Click to unapprove" : "Click to approve"}
                      >
                        {r.approved ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
