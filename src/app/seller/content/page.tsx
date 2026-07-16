"use client";

import React, { useState } from "react";
import { Plus, HelpCircle, Trash2, Edit } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const INITIAL_FAQS: FAQ[] = [
  { id: "FAQ-001", question: "What is your return policy?", answer: "We offer a 7-day hassle-free return policy for unused products in their original packaging." },
  { id: "FAQ-002", question: "Are your leather items authentic?", answer: "Yes, all our leather shoes and accessories are certified 100% genuine full-grain leather." },
];

export default function SellerContentPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(INITIAL_FAQS);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const newFaq: FAQ = {
      id: `FAQ-${Date.now().toString().slice(-3)}`,
      question,
      answer
    };

    setFaqs([...faqs, newFaq]);
    setQuestion("");
    setAnswer("");
  };

  const handleDelete = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 select-none font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Store FAQs & Content</h1>
        <p className="text-xs font-semibold text-zinc-400">Publish store-specific Frequently Asked Questions on your storefront page.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Creator Form */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-2">
            <Plus className="h-4 w-4 text-zinc-600" /> Create FAQ Entity
          </h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Question Headline *</label>
              <input 
                type="text" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none" 
                placeholder="e.g. Do you ship outside Dhaka?" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Answer Summary *</label>
              <textarea 
                rows={4}
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)} 
                required 
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none resize-none" 
                placeholder="Yes, we ship nationwide via Paperfly delivery service..." 
              />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-1.5 rounded-full bg-zinc-950 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 cursor-pointer">
              Publish FAQ
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-zinc-400">Published Store FAQs</h3>
          
          <div className="divide-y divide-zinc-100">
            {faqs.map((faq) => (
              <div key={faq.id} className="flex items-start justify-between py-4 first:pt-0 last:pb-0 gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="font-extrabold text-sm text-zinc-950 truncate">{faq.question}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed pl-6">{faq.answer}</p>
                </div>

                <button 
                  onClick={() => handleDelete(faq.id)} 
                  className="rounded-xl border border-zinc-200 p-2 text-zinc-400 hover:border-rose-500 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
