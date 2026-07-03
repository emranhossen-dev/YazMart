"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  createEnterpriseProduct, 
  getEnterpriseProduct, 
  getPimCategories, 
  getBrands
} from "@/actions/pim-products";
import { uploadImage } from "@/actions/upload";
import { 
  Settings, ImageIcon, Tag, Package, Plus, Trash2, X, UploadCloud, Search
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  parent?: {
    name: string;
  } | null;
}

interface Brand {
  id: string;
  name: string;
}

function ProductAddFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Product Images
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState("");

  // Specifications state (Key-Value Dynamic Inputs)
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([
    { key: "Color", value: "" },
    { key: "Material", value: "" }
  ]);

  // Master Form State
  const [formData, setFormData] = useState<any>({
    id: null,
    name: "",
    slug: "",
    sku: "",
    barcode: "",
    status: "PUBLISHED",
    product_type: "PHYSICAL",
    buying_price: 0,
    selling_price: 0,
    compare_price: 0,
    current_stock: 0,
    low_stock_alert: 5,
    weight: 0,
    shipping_charge: 0,
    cod_available: true,
    short_desc: "",
    full_desc: "",
    usability: "",
    package_includes: "",
    warranty: "",
    meta_title: "",
    meta_desc: "",
    category_id: "",
    brand_id: "",
    is_featured: false,
    is_trending: false,
    is_best_seller: false,
    is_flash_sale: false,
    is_new_arrival: false,
  });

  const loadData = async () => {
    setLoading(true);
    const catRes = await getPimCategories();
    const brandRes = await getBrands();
    if (catRes.categories) setCategories(catRes.categories);
    if (brandRes.brands) setBrands(brandRes.brands);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (productId) {
      loadProductToEdit(productId);
    }
  }, [productId]);

  const loadProductToEdit = async (id: string) => {
    setLoading(true);
    const res = await getEnterpriseProduct(id);
    if (res.product) {
      const p = res.product;
      setFormData({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        barcode: p.barcode || "",
        product_code: p.product_code || "",
        status: p.status,
        product_type: p.product_type || "PHYSICAL",
        buying_price: Number(p.buying_price),
        selling_price: Number(p.selling_price),
        compare_price: Number(p.compare_price || 0),
        current_stock: p.current_stock,
        low_stock_alert: p.low_stock_alert,
        weight: Number(p.weight || 0),
        shipping_charge: Number(p.shipping_charge || 0),
        cod_available: p.cod_available,
        short_desc: p.short_desc || "",
        full_desc: p.full_desc || "",
        usability: p.usability || "",
        package_includes: p.package_includes || "",
        warranty: p.warranty || "",
        meta_title: p.meta_title || "",
        meta_desc: p.meta_desc || "",
        category_id: p.category_id || "",
        brand_id: p.brand_id || "",
        is_featured: p.is_featured,
        is_trending: p.is_trending,
        is_best_seller: p.is_best_seller,
        is_flash_sale: p.is_flash_sale,
        is_new_arrival: p.is_new_arrival,
      });
      setFeaturedImage(p.featured_image || "");
      setGalleryImages(p.gallery_images || []);
      
      const parsedSpecs = [];
      if (p.specifications && typeof p.specifications === "object") {
        for (const [key, val] of Object.entries(p.specifications)) {
          parsedSpecs.push({ key, value: String(val) });
        }
      }
      setSpecifications(parsedSpecs.length > 0 ? parsedSpecs : [{ key: "Color", value: "" }]);
    } else {
      toast.error(res.error || "Failed to load product details.");
    }
    setLoading(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setFormData((p: any) => ({
      ...p,
      name: v,
      slug: v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      sku: p.sku || `SKU-${v.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((p: any) => ({ ...p, [field]: value }));
  };


  const handleAddSpec = () => {
    setSpecifications(prev => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecifications(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: "key" | "value", val: string) => {
    setSpecifications(prev => {
      const copy = [...prev];
      copy[idx][field] = val;
      return copy;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFeatured: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      const res = await uploadImage(fd);
      if (res.error) {
        toast.error(res.error);
        break;
      } else if (res.url) {
        if (isFeatured) {
          setFeaturedImage(res.url);
          setFormData((p: any) => ({ ...p, featured_image: res.url }));
        } else {
          setGalleryImages(prev => [...prev, res.url]);
        }
      }
    }
    setUploading(false);
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      toast.error("Product Title and Category selection are mandatory fields.");
      return;
    }

    setLoading(true);
    const specObj: any = {};
    specifications.forEach(spec => {
      if (spec.key.trim()) {
        specObj[spec.key.trim()] = spec.value.trim();
      }
    });

    const payload = { 
      ...formData, 
      featured_image: featuredImage, 
      gallery_images: galleryImages,
      specifications: specObj 
    };

    const res = await createEnterpriseProduct(payload);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Product successfully saved to master database!");
      router.push("/admin/products");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-[1200px] mx-auto p-1 text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight">
            {formData.id ? "Modify Product Specifications" : "Register Product Node"}
          </h1>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Define basic properties, inventory dimensions, taxonomy levels, image assets, and technical specs.
          </p>
        </div>
      </div>      
      <div className="space-y-4 border border-[var(--border)] bg-[var(--card)] rounded-xl p-5 shadow-xs w-full">
        <div className="flex gap-1 border-b border-[var(--border)] pb-2 overflow-x-auto">
          {[
            { id: "general", name: "1. Basic Specs", icon: Settings },
            { id: "seo", name: "2. Descriptions & SEO", icon: Search },
            { id: "extended", name: "3. Specifications & Warranty", icon: Tag },
            { id: "media", name: "4. Media Assets", icon: ImageIcon }
          ].map(tab => (
            <button 
              key={tab.id} 
              type="button" 
              onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? "bg-blue-600 text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" /> 
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleCreateProductSubmit} className="space-y-5 pt-2">
          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Row 1: Title, Slug, Status */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Product Title *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={handleNameChange} 
                    required 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Slug (URL Route)</label>
                  <input 
                    type="text" 
                    value={formData.slug} 
                    onChange={(e) => handleInputChange("slug", e.target.value)} 
                    className="w-full px-3 py-2 text-xs font-mono rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Status Matrix</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => handleInputChange("status", e.target.value)} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              {/* Row 2: SKU, Barcode, Product Code, Category, Brand */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">SKU *</label>
                  <input 
                    type="text" 
                    value={formData.sku} 
                    onChange={(e) => handleInputChange("sku", e.target.value)} 
                    required 
                    placeholder="e.g., SKU-123" 
                    className="w-full px-3 py-2 text-xs font-mono rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Barcode</label>
                  <input 
                    type="text" 
                    value={formData.barcode} 
                    onChange={(e) => handleInputChange("barcode", e.target.value)} 
                    placeholder="UPC/EAN" 
                    className="w-full px-3 py-2 text-xs font-mono rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Product Code</label>
                  <input 
                    type="text" 
                    value={formData.product_code} 
                    onChange={(e) => handleInputChange("product_code", e.target.value)} 
                    placeholder="Internal Code" 
                    className="w-full px-3 py-2 text-xs font-mono rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Category Hub *</label>
                  <select 
                    value={formData.category_id} 
                    onChange={(e) => handleInputChange("category_id", e.target.value)} 
                    required 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
                  >
                    <option value="">Choose Taxonomy</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.parent ? `${c.parent.name} > ` : ""}{c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Brand</label>
                  <select 
                    value={formData.brand_id} 
                    onChange={(e) => handleInputChange("brand_id", e.target.value)} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-medium"
                  >
                    <option value="">No Brand</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Model, COD, Buying Price, Selling Price, Compare Price */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Flow Model</label>
                  <select 
                    value={formData.product_type} 
                    onChange={(e) => handleInputChange("product_type", e.target.value)} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-medium"
                  >
                    <option value="PHYSICAL">Physical Delivery</option>
                    <option value="DIGITAL">Digital Download</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">COD Option</label>
                  <select 
                    value={formData.cod_available ? "true" : "false"} 
                    onChange={(e) => handleInputChange("cod_available", e.target.value === "true")} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-medium"
                  >
                    <option value="true">COD Allowed</option>
                    <option value="false">Pre-payment Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Buying price (৳)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.buying_price} 
                    onChange={(e) => handleInputChange("buying_price", Number(e.target.value))} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Selling price (৳) *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.selling_price} 
                    onChange={(e) => handleInputChange("selling_price", Number(e.target.value))} 
                    required 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Compare Price (৳)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.compare_price} 
                    onChange={(e) => handleInputChange("compare_price", Number(e.target.value))} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-mono text-[var(--muted-foreground)]" 
                  />
                </div>
              </div>

              {/* Row 4: Stock, Low Warning, Weight, Shipping, Profit Margins */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Stock Vault Count</label>
                  <input 
                    type="number" 
                    value={formData.current_stock} 
                    onChange={(e) => handleInputChange("current_stock", parseInt(e.target.value) || 0)} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Low Warning Limit</label>
                  <input 
                    type="number" 
                    value={formData.low_stock_alert} 
                    onChange={(e) => handleInputChange("low_stock_alert", parseInt(e.target.value) || 5)} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.weight} 
                    onChange={(e) => handleInputChange("weight", Number(e.target.value))} 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Shipping Fee (৳)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.shipping_charge} 
                    onChange={(e) => handleInputChange("shipping_charge", Number(e.target.value))} 
                    placeholder="System Default" 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Profit margins</label>
                  <div className="bg-[var(--background)] px-3 py-2 border border-[var(--border)] rounded text-xs text-[var(--muted-foreground)] font-bold flex items-center justify-between h-[34px]">
                    <span>Margin:</span>
                    <span className="font-mono text-blue-500">
                      {formData.selling_price > 0 
                        ? `${(((formData.selling_price - formData.buying_price) / formData.selling_price) * 100).toFixed(1)}%` 
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges / Quick Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_featured} onChange={(e) => handleInputChange("is_featured", e.target.checked)} className="rounded text-blue-600 bg-[var(--background)] border-[var(--border)] cursor-pointer" /> Featured
                </label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_new_arrival} onChange={(e) => handleInputChange("is_new_arrival", e.target.checked)} className="rounded text-blue-600 bg-[var(--background)] border-[var(--border)] cursor-pointer" /> New Arrival
                </label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_best_seller} onChange={(e) => handleInputChange("is_best_seller", e.target.checked)} className="rounded text-blue-600 bg-[var(--background)] border-[var(--border)] cursor-pointer" /> Best Seller
                </label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_trending} onChange={(e) => handleInputChange("is_trending", e.target.checked)} className="rounded text-blue-600 bg-[var(--background)] border-[var(--border)] cursor-pointer" /> Trending
                </label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_flash_sale} onChange={(e) => handleInputChange("is_flash_sale", e.target.checked)} className="rounded text-blue-600 bg-[var(--background)] border-[var(--border)] cursor-pointer" /> Flash Sale
                </label>
              </div>
            </div>
          )}

            {activeTab === "seo" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Short Description</label>
                  <input 
                    type="text" 
                    value={formData.short_desc} 
                    onChange={(e) => handleInputChange("short_desc", e.target.value)} 
                    placeholder="Short punchy summary..." 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Product Description</label>
                  <textarea 
                    id="full_desc"
                    value={formData.full_desc} 
                    onChange={(e) => handleInputChange("full_desc", e.target.value)} 
                    rows={6} 
                    placeholder="Provide full specifications and detailed reviews..." 
                    className="w-full p-3 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                  />
                </div>

                {/* SEO specifications */}
                <div className="grid gap-4 sm:grid-cols-2 bg-[var(--background)]/20 p-4 border border-[var(--border)] rounded-xl">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Meta Title (SEO Title)</label>
                      <span className={`text-[9px] font-bold font-mono ${
                        (formData.meta_title?.length || 0) > 60 ? "text-rose-500" : (formData.meta_title?.length || 0) >= 50 ? "text-emerald-500" : "text-zinc-500"
                      }`}>
                        {formData.meta_title?.length || 0}/60 chars (Target: 50-60)
                      </span>
                    </div>
                    <input 
                      type="text" 
                      value={formData.meta_title} 
                      onChange={(e) => handleInputChange("meta_title", e.target.value)} 
                      placeholder="SEO optimized title" 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Meta Description (SEO Description)</label>
                      <span className={`text-[9px] font-bold font-mono ${
                        (formData.meta_desc?.length || 0) > 160 ? "text-rose-500" : (formData.meta_desc?.length || 0) >= 120 ? "text-emerald-500" : "text-zinc-500"
                      }`}>
                        {formData.meta_desc?.length || 0}/160 chars (Target: 120-160)
                      </span>
                    </div>
                    <input 
                      type="text" 
                      value={formData.meta_desc} 
                      onChange={(e) => handleInputChange("meta_desc", e.target.value)} 
                      placeholder="SEO search snippet summary description" 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "extended" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Warranty Details</label>
                    <input 
                      type="text" 
                      value={formData.warranty} 
                      onChange={(e) => handleInputChange("warranty", e.target.value)} 
                      placeholder="e.g., 1 Year Brand Warranty" 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Box Content / Package Includes</label>
                    <input 
                      type="text" 
                      value={formData.package_includes} 
                      onChange={(e) => handleInputChange("package_includes", e.target.value)} 
                      placeholder="e.g., Adapter, Cable, Manual" 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Detailed Usability & Usage Guidelines</label>
                  <textarea 
                    id="usability"
                    value={formData.usability || ""} 
                    onChange={(e) => handleInputChange("usability", e.target.value)} 
                    rows={5} 
                    placeholder="Specify step-by-step instructions, initial configuration guidelines, safety precautions, or user instructions..." 
                    className="w-full p-3 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                  />
                </div>

                {/* Technical Specifications Matrix */}
                <div className="space-y-2 border-t border-[var(--border)] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Technical specifications matrix list</span>
                    <button 
                      type="button" 
                      onClick={handleAddSpec} 
                      className="px-2.5 py-1 bg-zinc-800 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Spec parameter
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {specifications.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="Spec parameter (e.g. Color)" 
                          value={spec.key} 
                          onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                        />
                        <input 
                          type="text" 
                          placeholder="Spec value (e.g. Midnight Black)" 
                          value={spec.value} 
                          onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSpec(idx)} 
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-4">
                {/* Featured Main Image */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Featured Main Image (Primary Thumbnail)</label>
                  <div className="flex gap-4 items-center bg-[var(--background)]/20 p-4 border border-[var(--border)] rounded-xl">
                    {featuredImage ? (
                      <div className="w-20 h-20 border border-[var(--border)] rounded bg-[var(--background)] flex items-center justify-center overflow-hidden p-1 relative">
                        <img src={featuredImage} className="w-full h-full object-contain" />
                        <button 
                          type="button" 
                          onClick={() => {
                            setFeaturedImage("");
                            setFormData((p: any) => ({ ...p, featured_image: "" }));
                          }} 
                          className="absolute -top-1 -right-1 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 border border-dashed border-[var(--border)] rounded flex items-center justify-center text-[var(--muted-foreground)]">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, true)} 
                        className="hidden" 
                        id="featured-image-file" 
                      />
                      <label 
                        htmlFor="featured-image-file" 
                        className="inline-block px-4 py-2 bg-[var(--background)] hover:bg-[var(--accent)] border border-[var(--border)] text-xs font-bold uppercase rounded cursor-pointer transition-colors"
                      >
                        {uploading ? "Uploading..." : "Select Main Image"}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Multiple Gallery Images */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Gallery Images (Unlimited)</label>
                  <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center bg-[var(--background)]/30 flex flex-col items-center justify-center cursor-pointer relative">
                    <UploadCloud className="h-8 w-8 text-[var(--muted-foreground)] mb-2" />
                    <p className="text-xs font-bold">Select or drag/drop multiple gallery files</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => handleImageUpload(e, false)} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>

                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-4">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="aspect-square border border-[var(--border)] bg-[var(--background)] rounded p-1 flex items-center justify-center overflow-hidden relative">
                          <img src={img} className="max-h-full max-w-full object-contain rounded" />
                          <button 
                            type="button" 
                            onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))} 
                            className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 cursor-pointer"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">YouTube Video embed URL</label>
                  <input 
                    type="url" 
                    value={formData.video_url || ""} 
                    onChange={(e) => handleInputChange("video_url", e.target.value)} 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <button 
                type="submit" 
                disabled={loading || uploading} 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
              >
                {loading ? "Saving..." : formData.id ? "Update Product Record" : "Commit Entity & Publish"}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}

export default function ProductAddFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--muted-foreground)]">Loading product creator module...</div>}>
      <ProductAddFormContent />
    </Suspense>
  );
}
