"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  createEnterpriseProduct, 
  getEnterpriseProduct, 
  getPimCategories, 
  getBrands,
  runSchemaMigration,
  updateProductStockItems
} from "@/actions/pim-products";
import ImageUploader from "@/components/ImageUploader";
import { 
  Settings, ImageIcon, Tag, Package, Plus, Trash2, X, UploadCloud, Search, CheckCircle, Store, ArrowLeft
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import BarcodeRenderer from "@/components/BarcodeRenderer";

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

function SellerProductAddFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const storeId = searchParams.get("store_id");

  const [loading, setLoading] = useState(false);
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
    product_code: "",
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
    meta_keywords: "",
    category_id: "",
    brand_id: "",
    is_featured: false,
    is_trending: false,
    is_best_seller: false,
    is_flash_sale: false,
    is_new_arrival: false,
  });

  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(false);
  const [isBarcodeManuallyEdited, setIsBarcodeManuallyEdited] = useState(false);
  const [serialMode, setSerialMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [manualSerials, setManualSerials] = useState<string>("");

  const convertSkuToNumericBarcode = (sku: string): string => {
    if (!sku) return "";
    let hash = 0;
    for (let i = 0; i < sku.length; i++) {
      hash = (hash * 31 + sku.charCodeAt(i)) >>> 0;
    }
    return String(hash).padStart(12, "0").substring(0, 12);
  };

  const handleManualSerialsChange = (value: string) => {
    setManualSerials(value);
    const count = value.split("\n").map(s => s.trim()).filter(Boolean).length;
    setFormData((p: any) => ({ ...p, current_stock: count }));
  };

  const loadData = async () => {
    setLoading(true);
    await runSchemaMigration();
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
      setIsSkuManuallyEdited(true);
      setIsBarcodeManuallyEdited(true);
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
        current_stock: Number(p.current_stock || 0),
        low_stock_alert: Number(p.low_stock_alert || 5),
        weight: Number(p.weight || 0),
        shipping_charge: Number(p.shipping_charge || 0),
        cod_available: p.cod_available ?? true,
        short_desc: p.short_desc || "",
        full_desc: p.full_desc || "",
        usability: p.usability || "",
        package_includes: p.package_includes || "",
        warranty: p.warranty || "",
        meta_title: p.meta_title || "",
        meta_desc: p.meta_desc || "",
        meta_keywords: p.meta_keywords || "",
        category_id: p.category_id || "",
        brand_id: p.brand_id || "",
        is_featured: p.is_featured || false,
        is_trending: p.is_trending || false,
        is_best_seller: p.is_best_seller || false,
        is_flash_sale: p.is_flash_sale || false,
        is_new_arrival: p.is_new_arrival || false,
      });

      setFeaturedImage(p.featured_image || "");
      setGalleryImages(Array.isArray(p.gallery_images) ? p.gallery_images : []);

      if (p.specifications && typeof p.specifications === "object") {
        const specArr = Object.entries(p.specifications).map(([key, value]) => ({
          key,
          value: String(value)
        }));
        if (specArr.length > 0) setSpecifications(specArr);
      }
    }
    setLoading(false);
  };

  const handleNameChange = (v: string) => {
    setFormData((p: any) => {
      const generatedSlug = v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      let updatedSku = p.sku;
      let updatedBarcode = p.barcode;

      if (!isSkuManuallyEdited) {
        const titleSlug = v.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 4) || "PROD";
        const randomCode = Math.floor(100 + Math.random() * 900);
        updatedSku = `${titleSlug}-${randomCode}`;

        if (!isBarcodeManuallyEdited) {
          updatedBarcode = convertSkuToNumericBarcode(updatedSku);
        }
      }

      return {
        ...p,
        name: v,
        slug: generatedSlug,
        sku: updatedSku,
        barcode: updatedBarcode
      };
    });
  };

  const handleInputChange = (field: string, value: any) => {
    if (field === "sku") {
      setIsSkuManuallyEdited(value.trim().length > 0);
      setFormData((p: any) => {
        const next = { ...p, sku: value };
        if (!isBarcodeManuallyEdited) {
          next.barcode = convertSkuToNumericBarcode(value);
        }
        return next;
      });
    } else if (field === "barcode") {
      const numericVal = value.replace(/[^0-9]/g, "");
      setIsBarcodeManuallyEdited(numericVal.trim().length > 0);
      setFormData((p: any) => ({ ...p, barcode: numericVal }));
    } else {
      setFormData((p: any) => ({ ...p, [field]: value }));
    }
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
      store_id: storeId || undefined,
      featured_image: featuredImage, 
      gallery_images: galleryImages,
      specifications: specObj 
    };

    const res = await createEnterpriseProduct(payload);
    if (res.error) {
      toast.error(res.error);
    } else {
      const savedProdId = res.product?.id || formData.id || "";
      let serials: string[] = [];

      if (serialMode === "AUTO") {
        const skuPrefix = payload.sku || "PROD";
        for (let i = 1; i <= payload.current_stock; i++) {
          serials.push(`${skuPrefix}-${String(i).padStart(3, "0")}`);
        }
      } else {
        serials = manualSerials.split("\n").map(s => s.trim()).filter(Boolean);
      }

      if (serials.length > 0 && savedProdId) {
        await updateProductStockItems(savedProdId, serials);
      }

      toast.success("Product successfully saved to your store catalog!");
      const returnUrl = storeId ? `/seller/products?store_id=${storeId}` : "/seller/products";
      router.push(returnUrl);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-[1200px] mx-auto p-1 text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 text-[11px] font-bold mb-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Products List
          </button>
          <h1 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
            {formData.id ? "Modify Store Product" : "Add Store Product (Full Admin Dashboard Parity)"}
          </h1>
          <p className="text-[10px] text-zinc-500">
            Define detailed specifications, descriptions, SEO metadata, warranty, multi-images with progress bar, and IMEIs/serials.
          </p>
        </div>
      </div>      

      <div className="space-y-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl p-5 shadow-xs w-full">
        <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
          {[
            { id: "general", name: "1. Basic Specs", icon: Settings },
            { id: "seo", name: "2. Descriptions & SEO", icon: Search },
            { id: "extended", name: "3. Specifications & Warranty", icon: Tag },
            { id: "media", name: "4. Media Assets (Progress Upload)", icon: ImageIcon }
          ].map(tab => (
            <button 
              key={tab.id} 
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id 
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleCreateProductSubmit} className="space-y-6 pt-2">
          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Row 1: Title, Category, Brand */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Product Title *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => handleNameChange(e.target.value)} 
                    required 
                    placeholder="e.g. Wireless Noise Cancelling Headphones" 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900 font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Category *</label>
                  <select 
                    value={formData.category_id} 
                    onChange={(e) => handleInputChange("category_id", e.target.value)} 
                    required
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none cursor-pointer font-bold"
                  >
                    <option value="">Select Category Taxonomy</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.parent ? `${c.parent.name} > ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Brand Mapping</label>
                  <select 
                    value={formData.brand_id} 
                    onChange={(e) => handleInputChange("brand_id", e.target.value)} 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="">No Specific Brand (Generic)</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: SKU, Barcode, Product Code, Status */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">SKU Identification</label>
                  <input 
                    type="text" 
                    value={formData.sku} 
                    onChange={(e) => handleInputChange("sku", e.target.value)} 
                    placeholder="e.g. AUD-901" 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Numeric EAN/UPC Barcode</label>
                  <input 
                    type="text" 
                    value={formData.barcode} 
                    onChange={(e) => handleInputChange("barcode", e.target.value)} 
                    placeholder="12 digit barcode" 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Product Model Code</label>
                  <input 
                    type="text" 
                    value={formData.product_code} 
                    onChange={(e) => handleInputChange("product_code", e.target.value)} 
                    placeholder="e.g. WH-1000XM5" 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Visibility Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => handleInputChange("status", e.target.value)} 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none cursor-pointer font-bold"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live in Store)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Prices */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Cost / Buying Price (৳)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.buying_price} 
                    onChange={(e) => handleInputChange("buying_price", Number(e.target.value))} 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Selling Price (৳) *</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.selling_price} 
                    onChange={(e) => handleInputChange("selling_price", Number(e.target.value))} 
                    required 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900 font-bold font-mono text-emerald-600" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Compare / Regular Price (৳)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.compare_price} 
                    onChange={(e) => handleInputChange("compare_price", Number(e.target.value))} 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none font-mono text-zinc-400" 
                  />
                </div>
              </div>

              {/* Row 4: Stock & Shipping */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Stock Count</label>
                  <input 
                    type="number" 
                    value={formData.current_stock} 
                    onChange={(e) => handleInputChange("current_stock", parseInt(e.target.value) || 0)} 
                    disabled={serialMode === "MANUAL"}
                    className={`w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none font-bold font-mono ${serialMode === "MANUAL" ? "opacity-60 cursor-not-allowed" : ""}`} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Low Stock Warning Limit</label>
                  <input 
                    type="number" 
                    value={formData.low_stock_alert} 
                    onChange={(e) => handleInputChange("low_stock_alert", parseInt(e.target.value) || 5)} 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.weight} 
                    onChange={(e) => handleInputChange("weight", Number(e.target.value))} 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Shipping Charge (৳)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.shipping_charge} 
                    onChange={(e) => handleInputChange("shipping_charge", Number(e.target.value))} 
                    placeholder="0 for Free Delivery" 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none font-mono" 
                  />
                </div>
              </div>

              {/* Serial Stock Settings Panel */}
              <div className="p-4 border border-zinc-200 bg-zinc-50/50 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-zinc-900">Inventory Serial Barcode Tracking</h4>
                    <p className="text-[10px] text-zinc-500">Generate serial barcodes or input individual IMEIs/Serials per item unit.</p>
                  </div>
                  <div className="flex bg-white border border-zinc-200 rounded p-0.5 text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setSerialMode("AUTO")}
                      className={`px-3 py-1.5 rounded transition-all cursor-pointer ${serialMode === "AUTO" ? "bg-zinc-900 text-white font-black" : "text-zinc-500"}`}
                    >
                      AUTO GENERATE SERIALS
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerialMode("MANUAL")}
                      className={`px-3 py-1.5 rounded transition-all cursor-pointer ${serialMode === "MANUAL" ? "bg-zinc-900 text-white font-black" : "text-zinc-500"}`}
                    >
                      MANUAL SERIALS/IMEIs
                    </button>
                  </div>
                </div>

                {serialMode === "MANUAL" ? (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500">
                      Unique Serial Numbers / IMEIs (One per line)
                    </label>
                    <textarea
                      rows={4}
                      value={manualSerials}
                      onChange={(e) => handleManualSerialsChange(e.target.value)}
                      placeholder="e.g.&#10;IMEI-98273982713&#10;IMEI-98273982714&#10;IMEI-98273982715"
                      className="w-full px-3 py-2 text-xs font-mono rounded bg-white border border-zinc-200 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                ) : (
                  <div className="text-[10px] text-zinc-500 bg-white p-2.5 rounded border border-zinc-200">
                    ℹ️ Sequential barcodes will be auto-generated as <strong className="font-mono text-amber-600">{formData.sku || "SKU"}-001</strong> up to the stock quantity ({formData.current_stock} units).
                  </div>
                )}
              </div>

              {/* Visibility Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_featured} onChange={(e) => handleInputChange("is_featured", e.target.checked)} className="rounded text-amber-500 cursor-pointer" /> Featured
                </label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_new_arrival} onChange={(e) => handleInputChange("is_new_arrival", e.target.checked)} className="rounded text-amber-500 cursor-pointer" /> New Arrival
                </label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_best_seller} onChange={(e) => handleInputChange("is_best_seller", e.target.checked)} className="rounded text-amber-500 cursor-pointer" /> Best Seller
                </label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_trending} onChange={(e) => handleInputChange("is_trending", e.target.checked)} className="rounded text-amber-500 cursor-pointer" /> Trending
                </label>
                <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                  <input type="checkbox" checked={formData.is_flash_sale} onChange={(e) => handleInputChange("is_flash_sale", e.target.checked)} className="rounded text-amber-500 cursor-pointer" /> Flash Sale
                </label>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Short Summary Description</label>
                <textarea 
                  rows={2} 
                  value={formData.short_desc} 
                  onChange={(e) => handleInputChange("short_desc", e.target.value)} 
                  placeholder="Key highlight points of the product..." 
                  className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Full Detailed Product Specifications (Rich HTML / Description)</label>
                <textarea 
                  rows={8} 
                  value={formData.full_desc} 
                  onChange={(e) => handleInputChange("full_desc", e.target.value)} 
                  placeholder="Comprehensive description of product features, dimensions, usage..." 
                  className="w-full px-3 py-2 text-xs font-mono rounded bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900" 
                />
              </div>

              <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50 space-y-3">
                <h4 className="text-xs font-black uppercase text-zinc-900 flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-amber-500" /> Search Engine Optimization (SEO Metadata)
                </h4>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500">Meta Title</label>
                    <span className="text-[9px] font-bold font-mono text-zinc-400">
                      {formData.meta_title?.length || 0}/60 chars
                    </span>
                  </div>
                  <input 
                    type="text" 
                    value={formData.meta_title} 
                    onChange={(e) => handleInputChange("meta_title", e.target.value)} 
                    placeholder="SEO title tag" 
                    className="w-full px-3 py-2 text-xs rounded bg-white border border-zinc-200 focus:outline-none" 
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500">Meta Description</label>
                    <span className="text-[9px] font-bold font-mono text-zinc-400">
                      {formData.meta_desc?.length || 0}/160 chars
                    </span>
                  </div>
                  <input 
                    type="text" 
                    value={formData.meta_desc} 
                    onChange={(e) => handleInputChange("meta_desc", e.target.value)} 
                    placeholder="SEO description tag" 
                    className="w-full px-3 py-2 text-xs rounded bg-white border border-zinc-200 focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Search Keywords (Comma separated)</label>
                  <input 
                    type="text" 
                    value={formData.meta_keywords} 
                    onChange={(e) => handleInputChange("meta_keywords", e.target.value)} 
                    placeholder="e.g. headset, bluetooth, gaming" 
                    className="w-full px-3 py-2 text-xs rounded bg-white border border-zinc-200 focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "extended" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Warranty Information</label>
                  <input 
                    type="text" 
                    value={formData.warranty} 
                    onChange={(e) => handleInputChange("warranty", e.target.value)} 
                    placeholder="e.g., 6 Months Replacement Warranty" 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Box Package Content</label>
                  <input 
                    type="text" 
                    value={formData.package_includes} 
                    onChange={(e) => handleInputChange("package_includes", e.target.value)} 
                    placeholder="e.g., Device, Charging Cable, User Manual" 
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500">Dynamic Product Specifications</label>
                  <button 
                    type="button" 
                    onClick={handleAddSpec}
                    className="px-3 py-1 bg-zinc-900 text-white rounded text-[10px] font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Spec Parameter
                  </button>
                </div>
                <div className="space-y-2">
                  {specifications.map((spec, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="Key (e.g. Battery Life)" 
                        value={spec.key} 
                        onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none" 
                      />
                      <input 
                        type="text" 
                        placeholder="Value (e.g. 30 Hours)" 
                        value={spec.value} 
                        onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none" 
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSpec(idx)} 
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-6">
              {/* Featured Main Image */}
              <ImageUploader
                label="Featured Main Image (Primary Thumbnail)"
                value={featuredImage}
                onChange={(url) => {
                  setFeaturedImage(url);
                  setFormData((p: any) => ({ ...p, featured_image: url }));
                }}
                multiple={false}
              />

              {/* Multiple Gallery Images */}
              <ImageUploader
                label="Gallery Images (Multiple Upload with Progress Bar)"
                value={galleryImages}
                onChange={(urls) => setGalleryImages(urls)}
                multiple={true}
                maxFiles={12}
              />

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">YouTube Video Embed URL</label>
                <input 
                  type="url" 
                  value={formData.video_url || ""} 
                  onChange={(e) => handleInputChange("video_url", e.target.value)} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className="w-full px-3 py-2 text-xs rounded bg-zinc-50 border border-zinc-200 focus:outline-none" 
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-extrabold uppercase tracking-wider transition-opacity cursor-pointer shadow-md"
            >
              {loading ? "Saving to Database..." : formData.id ? "Update Product Record" : "Publish Product Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SellerProductAddPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs font-bold text-zinc-500">Loading Product Editor...</div>}>
      <SellerProductAddFormContent />
    </Suspense>
  );
}
