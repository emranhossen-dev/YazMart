"use client";

import React, { useState } from "react";
import { MessageSquare, Star, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

const INITIAL_REVIEWS: Review[] = [
  { id: "REV-501", customerName: "Mahmud Hasan", productName: "Premium Leather Shoes", rating: 5, comment: "Absolutely top notch quality! Highly recommended.", date: "2026-06-20", approved: true },
  { id: "REV-502", customerName: "Farhana Yasmin", productName: "Noise Cancelling Headphones", rating: 4, comment: "Great sound quality, though the head strap is slightly tight.", date: "2026-06-19", approved: false },
  { id: "REV-503", customerName: "Tanvir Ahmed", productName: "Mechanical Keyboard RGB", rating: 5, comment: "The switches feel amazing and the LED configs look sleek.", date: "2026-06-18", approved: true },
  { id: "REV-504", customerName: "Sajid Khan", productName: "Minimalist Chronograph Watch", rating: 3, comment: "It is decent but the date sub-dial is slightly misaligned.", date: "2026-06-15", approved: false }
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const toggleApproval = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, approved: !r.approved } : r));
  };

  const handleDelete = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight">Customer Reviews</h1>
        <p className="text-[11px] text-[var(--muted-foreground)]">Audit ratings, remarks, and storefront approval credentials from verified purchasers.</p>
      </div>

      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" /> Catalog Review Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                <th className="pb-3">Review ID</th>
                <th className="pb-3">User & Product</th>
                <th className="pb-3">Rating Score</th>
                <th className="pb-3">Comment Text</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Approval State</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-medium">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-[var(--background)]/50 transition-colors">
                  <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{rev.id}</td>
                  <td className="py-3.5">
                    <p className="font-bold text-[var(--foreground)]">{rev.customerName}</p>
                    <p className="text-[10px] text-blue-500 font-semibold">{rev.productName}</p>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-amber-500" : "text-zinc-600"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 text-[var(--muted-foreground)] max-w-xs truncate" title={rev.comment}>
                    {rev.comment}
                  </td>
                  <td className="py-3.5 font-mono text-[10px] text-[var(--muted-foreground)]">{rev.date}</td>
                  <td className="py-3.5">
                    <button 
                      onClick={() => toggleApproval(rev.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                        rev.approved 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/10"
                      }`}
                    >
                      {rev.approved ? "Approved" : "Pending Audit"}
                    </button>
                  </td>
                  <td className="py-3.5 text-right">
                    <button onClick={() => handleDelete(rev.id)} className="p-1 hover:bg-rose-500/10 text-rose-500 rounded cursor-pointer transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
