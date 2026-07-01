"use client";

import React, { useState, useEffect } from "react";
import { 
  createEnterpriseProduct, 
  getEnterpriseProducts, 
  deleteEnterpriseProduct, 
  deleteMultipleProducts,
  duplicateEnterpriseProduct,
  bulkImportEnterpriseProducts, 
  getPimCategories,
  getBrands,
  createBrand
} from "@/actions/pim-products";
import { uploadImage } from "@/actions/upload";
import { 
  Settings, ImageIcon, FileSpreadsheet, Trash2, UploadCloud, 
  Download, Edit3, Copy, Eye, Plus, Search, Tag, Package, ChevronLeft, ChevronRight, Check, X 
} from "lucide-react";

export default function UltimateShopifyPimDashboard() {
  const [activeTab, setActiveTab] = useState("general"); // general, details, media, bulk
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; details?: string[] } | null>(null);

  // Pagination & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk Upload States
  const [bulkMode, setBulkMode] = useState<"json" | "csv">("json");
  const [jsonInput, setJsonInput] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Brand Modal/Add States
  const [newBrandName, setNewBrandName] = useState("");

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

  const profit = formData.selling_price - formData.buying_price;
  const profitMargin = formData.selling_price > 0 ? ((profit / formData.selling_price) * 100).toFixed(1) : "0";

  const loadData = async () => {
    setLoading(true);
    const prodRes = await getEnterpriseProducts({
      search: searchQuery,
      category_id: categoryFilter,
      brand_id: brandFilter,
      status: statusFilter,
      stock_status: stockFilter,
      sortBy,
      page,
      limit: 10
    });
    const catRes = await getPimCategories();
    const brandRes = await getBrands();

    if (prodRes.products) setProducts(prodRes.products);
    if (prodRes.totalPages) setTotalPages(prodRes.totalPages);
    if (catRes.categories) setCategories(catRes.categories);
    if (brandRes.brands) setBrands(brandRes.brands);
    setSelectedProductIds([]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, categoryFilter, brandFilter, statusFilter, stockFilter, sortBy, page]);

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
    setMessage(null);

    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      const res = await uploadImage(fd);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
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

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    const res = await createBrand(newBrandName);
    if (res.success) {
      setNewBrandName("");
      const brandRes = await getBrands();
      if (brandRes.brands) setBrands(brandRes.brands);
      setMessage({ type: "success", text: "Brand created successfully!" });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create brand" });
    }
  };

  const startEditProduct = (p: any) => {
    setFormData({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      barcode: p.barcode || "",
      product_code: p.product_code || "",
      status: p.status,
      product_type: p.product_type || "PHYSICAL",
      buying_price: p.buying_price,
      selling_price: p.selling_price,
      compare_price: p.compare_price || 0,
      current_stock: p.current_stock,
      low_stock_alert: p.low_stock_alert,
      weight: p.weight || 0,
      shipping_charge: p.shipping_charge || 0,
      cod_available: p.cod_available,
      short_desc: p.short_desc || "",
      full_desc: p.full_desc || "",
      usability: p.usability || "",
      package_includes: p.package_includes || "",
      warranty: p.warranty || "",
      meta_title: p.meta_title || "",
      meta_desc: p.meta_desc || "",
      category_id: p.category_id,
      brand_id: p.brand_id || "",
      is_featured: p.is_featured || false,
      is_trending: p.is_trending || false,
      is_best_seller: p.is_best_seller || false,
      is_flash_sale: p.is_flash_sale || false,
      is_new_arrival: p.is_new_arrival || false,
    });
    setFeaturedImage(p.featured_image || "");
    setGalleryImages(p.gallery_images || []);

    if (p.specifications && typeof p.specifications === "object") {
      const parsedSpecs = Object.entries(p.specifications).map(([key, value]) => ({
        key,
        value: String(value)
      }));
      setSpecifications(parsedSpecs.length > 0 ? parsedSpecs : [{ key: "Color", value: "" }]);
    } else {
      setSpecifications([{ key: "Color", value: "" }]);
    }

    setActiveTab("general");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm("Are you sure you want to duplicate this product record?")) return;
    setLoading(true);
    const res = await duplicateEnterpriseProduct(id);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "Product duplicated." });
      await loadData();
    }
    setLoading(false);
  };

  const handlePurge = async (id: string) => {
    if (!confirm("Purge product node? This action is irreversible.")) return;
    setLoading(true);
    const res = await deleteEnterpriseProduct(id);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "Product purged." });
      await loadData();
    }
    setLoading(false);
  };

  const handleBulkDeleteProducts = async () => {
    if (!confirm(`Purge ${selectedProductIds.length} product records? This action is irreversible.`)) return;
    setLoading(true);
    const res = await deleteMultipleProducts(selectedProductIds);
    if (res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: res.success || "Selected products deleted." });
      setSelectedProductIds([]);
      await loadData();
    }
    setLoading(false);
  };

  // CSV Parsing helper (supports quotes)
  const parseCSVLine = (text: string) => {
    let p = '', r = [];
    let q = false;
    for (let i = 0; i < text.length; i++) {
      let c = text[i];
      if (c === '"') { q = !q; }
      else if (c === ',' && !q) { r.push(p); p = ''; }
      else { p += c; }
    }
    r.push(p);
    return r;
  };

  const handleCsvFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const csvText = evt.target?.result as string;
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) {
        setMessage({ type: "error", text: "CSV file needs a header row and at least one product data row." });
        return;
      }

      const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^["']|["']$/g, ""));
      const parsedData = lines.slice(1).map(line => {
        const values = parseCSVLine(line).map(v => v.trim().replace(/^["']|["']$/g, ""));
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || "";
        });
        return rowObj;
      });

      setBulkPreview(parsedData);
      setMessage({ type: "success", text: `Loaded ${parsedData.length} records. Check preview below before importing.` });
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCsv = () => {
    const sampleCsvData = 
`name,sku,buying_price,selling_price,current_stock,category_id
"Ultra Premium Watch","SKU-ULTRA-WATCH",250,450,50,"${categories[0]?.id || "category_uuid_here"}"
"Ergonomic Keyboard","SKU-ERGO-KEY",80,140,100,"${categories[0]?.id || "category_uuid_here"}"`;
    
    // Create preview
    const lines = sampleCsvData.split(/\r?\n/).filter(line => line.trim() !== "");
    const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^["']|["']$/g, ""));
    const parsedData = lines.slice(1).map(line => {
      const values = parseCSVLine(line).map(v => v.trim().replace(/^["']|["']$/g, ""));
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });
      return rowObj;
    });

    setBulkPreview(parsedData);
    setMessage({ type: "success", text: "Loaded sample CSV data! Click import to commit." });
  };

  const downloadSampleCsv = () => {
    const headers = ["name", "sku", "buying_price", "selling_price", "current_stock", "category_id"];
    const row = [`"Sample Leather Bag"`, `"SKU-BAG-101"`, "40", "75", "120", `"${categories[0]?.id || "category_uuid"}"`];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + row.join(",");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", "enterprise_bulk_sample.csv");
    downloadAnchor.click();
  };

  const handleLoadSampleJsonData = () => {
    if (categories.length === 0) {
      setMessage({
        type: "error",
        text: "Please create at least one category in the Category Taxonomy Deck first, so we can link the sample products to a valid Category ID!"
      });
      return;
    }

    const sample = [
      {
        "name": "Luxury Smart Sunglasses",
        "sku": `SKU-GLASS-${Math.floor(1000 + Math.random() * 9000)}`,
        "barcode": "123456789012",
        "product_code": "PC-GLASS-001",
        "product_type": "PHYSICAL",
        "status": "PUBLISHED",
        "featured_image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop",
        "gallery_images": [
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop"
        ],
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "buying_price": 90.00,
        "selling_price": 180.00,
        "compare_price": 220.00,
        "current_stock": 40,
        "low_stock_alert": 5,
        "weight": 0.25,
        "shipping_charge": 15.00,
        "cod_available": true,
        "short_desc": "Premium smart polarized sunglasses with audio integration.",
        "full_desc": "<p>Experience the ultimate fusion of style and modern intelligence. Crafted with lightweight carbon fiber frames and premium polarized lenses.</p>",
        "meta_title": "Luxury Smart Sunglasses - YazMart Elite",
        "meta_desc": "Shop luxury smart sunglasses with audio integration at YazMart. Exclusive premium collection.",
        "is_featured": true,
        "is_trending": false,
        "is_best_seller": true,
        "is_flash_sale": false,
        "is_new_arrival": true,
        "specifications": {
          "Lens Material": "Polarized TAC",
          "Frame Type": "Full Rim",
          "Connectivity": "Bluetooth 5.2",
          "Battery Life": "Up to 6 hours"
        },
        "warranty": "1 Year Brand Warranty",
        "category_id": categories[0]?.id || "category_uuid_here",
        "brand_id": brands[0]?.id || "brand_uuid_here"
      },
      {
        "name": "Mechanical Gaming Keyboard",
        "sku": `SKU-KEY-${Math.floor(1000 + Math.random() * 9000)}`,
        "barcode": "987654321098",
        "product_code": "PC-KEY-002",
        "product_type": "PHYSICAL",
        "status": "PUBLISHED",
        "featured_image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop",
        "gallery_images": [
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop"
        ],
        "video_url": "",
        "buying_price": 50.00,
        "selling_price": 95.00,
        "compare_price": 120.00,
        "current_stock": 75,
        "low_stock_alert": 10,
        "weight": 0.85,
        "shipping_charge": 10.00,
        "cod_available": true,
        "short_desc": "Tactile blue switch RGB mechanical keyboard with hot-swappable keys.",
        "full_desc": "<p>Premium gaming keyboard featuring dynamic per-key RGB backlighting, aircraft-grade anodized aluminum frame, and 100% anti-ghosting.</p>",
        "meta_title": "Mechanical Gaming Keyboard - RGB Hot-swappable",
        "meta_desc": "Buy premium mechanical gaming keyboard at YazMart. Hot-swappable switches, dynamic RGB backlight.",
        "is_featured": false,
        "is_trending": true,
        "is_best_seller": false,
        "is_flash_sale": true,
        "is_new_arrival": true,
        "specifications": {
          "Switch Type": "Cherry MX Blue",
          "Layout": "ANSI Full Size",
          "Backlight": "RGB Dynamic",
          "Interface": "Wired USB Type-C"
        },
        "warranty": "2 Years Limited Warranty",
        "category_id": categories[0]?.id || "category_uuid_here",
        "brand_id": brands[0]?.id || "brand_uuid_here"
      }
    ];
    setJsonInput(JSON.stringify(sample, null, 2));
    setMessage({ type: "success", text: "Loaded sample JSON data! Click copy to copy to clipboard or import to commit." });
  };

  const executeBulkImport = async () => {
    let importList = [];
    setMessage(null);

    if (bulkMode === "json") {
      try {
        importList = JSON.parse(jsonInput);
        if (!Array.isArray(importList)) {
          setMessage({ type: "error", text: "JSON data must be a valid array of product objects." });
          return;
        }
      } catch {
        setMessage({ type: "error", text: "Invalid JSON syntax. Please verify commas and double quotes." });
        return;
      }
    } else {
      if (bulkPreview.length === 0) {
        setMessage({ type: "error", text: "Please upload a CSV file or load sample data first." });
        return;
      }
      importList = bulkPreview;
    }

    setLoading(true);
    const res = await bulkImportEnterpriseProducts(importList);
    if (res.error) {
      setMessage({ 
        type: "error", 
        text: "Import Validation Failed. Please resolve these errors before re-submitting:", 
        details: res.details || [res.error] 
      });
    } else {
      setMessage({ type: "success", text: res.success || "Import completed successfully!" });
      setJsonInput("");
      setBulkPreview([]);
      setCsvFile(null);
      await loadData();
    }
    setLoading(false);
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      setMessage({ type: "error", text: "General Error: Product Title and Category selection are mandatory fields." });
      return;
    }

    setLoading(true);
    // Convert specifications key-value array to simple JSON object
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
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Product successfully saved to master database nodes!" });
      // Reset form
      setFeaturedImage("");
      setGalleryImages([]);
      setSpecifications([{ key: "Color", value: "" }]);
      setFormData({
        id: null, name: "", slug: "", sku: "", barcode: "", status: "PUBLISHED",
        product_type: "PHYSICAL", buying_price: 0, selling_price: 0, compare_price: 0,
        current_stock: 0, low_stock_alert: 5, weight: 0, shipping_charge: 0, cod_available: true,
        short_desc: "", full_desc: "", usability: "", package_includes: "", warranty: "",
        meta_title: "", meta_desc: "", category_id: "", brand_id: "",
        is_featured: false, is_trending: false, is_best_seller: false, is_flash_sale: false, is_new_arrival: false,
      });
      await loadData();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto p-1 font-sans select-none">
      <div className="border-b border-[var(--border)] pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Product Information Deck (PIM OS)</h2>
          <p className="text-[11px] text-[var(--muted-foreground)]">Manage active inventory, product categories, metadata configurations, and CSV imports.</p>
        </div>

        {/* Brand Generator Sidepanel Shortcut */}
        <form onSubmit={handleCreateBrand} className="flex gap-2 items-center bg-[var(--card)] border border-[var(--border)] p-2 rounded-lg">
          <Tag className="h-4 w-4 text-blue-500" />
          <input 
            type="text" 
            placeholder="Add new Brand..." 
            value={newBrandName} 
            onChange={(e) => setNewBrandName(e.target.value)}
            className="px-2 py-1 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold"
          />
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold uppercase cursor-pointer hover:bg-blue-700">Add</button>
        </form>
      </div>

      {message && (
        <div className={`p-4 rounded text-xs font-bold border ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/15" : "bg-rose-500/10 text-rose-500 border-rose-500/15"
        }`}>
          <p>{message.text}</p>
          {message.details && (
            <ul className="list-disc pl-5 mt-2 space-y-1 font-mono text-[11px]">
              {message.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3 items-start">
        {/* LEFT FORM WORKING CANVAS */}
        <div className="xl:col-span-2 space-y-4 border border-[var(--border)] bg-[var(--card)] rounded-xl p-5 shadow-xs">
          <div className="flex gap-1 border-b border-[var(--border)] pb-2 overflow-x-auto">
            {[
              { id: "general", name: "1. Basic Specs", icon: Settings },
              { id: "details", name: "2. Extended Details", icon: Tag },
              { id: "media", name: "3. Media Assets", icon: ImageIcon },
              { id: "bulk", name: "4. Bulk Import", icon: FileSpreadsheet }
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Product Title *</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={handleNameChange} 
                      required 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-bold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Slug (URL Route)</label>
                    <input 
                      type="text" 
                      value={formData.slug} 
                      onChange={(e) => handleInputChange("slug", e.target.value)} 
                      className="w-full px-3 py-2 text-xs font-mono rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
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
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
                    >
                      <option value="">No Brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Buying Price</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formData.buying_price || ""} 
                      onChange={(e) => handleInputChange("buying_price", parseFloat(e.target.value) || 0)} 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Selling Price *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formData.selling_price || ""} 
                      onChange={(e) => handleInputChange("selling_price", parseFloat(e.target.value) || 0)} 
                      required 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold text-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Compare Price (Discount Reference)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={formData.compare_price || ""} 
                      onChange={(e) => handleInputChange("compare_price", parseFloat(e.target.value) || 0)} 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Current Stock *</label>
                    <input 
                      type="number" 
                      value={formData.current_stock || ""} 
                      onChange={(e) => handleInputChange("current_stock", parseInt(e.target.value) || 0)} 
                      required 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Low Stock Alert Trigger</label>
                    <input 
                      type="number" 
                      value={formData.low_stock_alert} 
                      onChange={(e) => handleInputChange("low_stock_alert", parseInt(e.target.value) || 5)} 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Publish Status</label>
                    <select 
                      value={formData.status} 
                      onChange={(e) => handleInputChange("status", e.target.value)} 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
                    >
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="HIDDEN">HIDDEN</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => handleInputChange("is_featured", e.target.checked)} className="rounded" /> Featured
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                    <input type="checkbox" checked={formData.is_new_arrival} onChange={(e) => handleInputChange("is_new_arrival", e.target.checked)} className="rounded" /> New Arrival
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                    <input type="checkbox" checked={formData.is_best_seller} onChange={(e) => handleInputChange("is_best_seller", e.target.checked)} className="rounded" /> Best Seller
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                    <input type="checkbox" checked={formData.is_trending} onChange={(e) => handleInputChange("is_trending", e.target.checked)} className="rounded" /> Trending
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                    <input type="checkbox" checked={formData.is_flash_sale} onChange={(e) => handleInputChange("is_flash_sale", e.target.checked)} className="rounded" /> Flash Sale
                  </label>
                </div>
              </div>
            )}

            {activeTab === "details" && (
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
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Full Rich Text Description</label>
                  <textarea 
                    value={formData.full_desc} 
                    onChange={(e) => handleInputChange("full_desc", e.target.value)} 
                    rows={4} 
                    placeholder="Provide full specifications and detailed reviews..." 
                    className="w-full p-3 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
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
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Usability / usage guidelines</label>
                    <input 
                      type="text" 
                      value={formData.usability} 
                      onChange={(e) => handleInputChange("usability", e.target.value)} 
                      placeholder="Usage instructions..." 
                      className="w-full px-3 py-2 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                    />
                  </div>
                </div>

                {/* Dynamic Specifications */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Technical Specifications</label>
                    <button 
                      type="button" 
                      onClick={handleAddSpec} 
                      className="text-[10px] bg-blue-600/10 hover:bg-blue-600/25 text-blue-500 px-2 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Row
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="Feature Key (e.g. Weight)" 
                          value={spec.key} 
                          onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold" 
                        />
                        <input 
                          type="text" 
                          placeholder="Feature Value (e.g. 1.2kg)" 
                          value={spec.value} 
                          onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSpec(index)}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
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
                {/* Featured Image */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Featured Main Image</label>
                  <div className="flex gap-3 items-center">
                    {featuredImage ? (
                      <div className="relative w-20 h-20 border border-[var(--border)] rounded bg-[var(--background)] overflow-hidden">
                        <img src={featuredImage} className="w-full h-full object-contain" />
                        <button 
                          type="button" 
                          onClick={() => setFeaturedImage("")} 
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                        >
                          Remove
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
                  <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center bg-[var(--background)]/30 flex flex-col items-center justify-center cursor-pointer">
                    <UploadCloud className="h-8 w-8 text-[var(--muted-foreground)] mb-2" />
                    <p className="text-xs font-bold">Select or drag/drop multiple gallery files</p>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, false)} 
                      className="mt-2 text-xs" 
                    />
                  </div>
                  
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-6 gap-2 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)] mt-3">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="h-16 border border-[var(--border)] relative group rounded overflow-hidden">
                          <img src={img} className="w-full h-full object-contain" />
                          <button 
                            type="button" 
                            onClick={() => setGalleryImages(p => p.filter((_, i) => i !== idx))} 
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "bulk" && (
              <div className="space-y-4 p-1">
                <div className="flex bg-[var(--background)] border border-[var(--border)] p-0.5 rounded-md text-[10px] font-bold uppercase w-fit select-none">
                  <button 
                    type="button" 
                    onClick={() => setBulkMode("json")} 
                    className={`px-4 py-1.5 rounded-[4px] cursor-pointer ${bulkMode === "json" ? "bg-blue-600 text-white" : ""}`}
                  >
                    JSON Importer
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setBulkMode("csv")} 
                    className={`px-4 py-1.5 rounded-[4px] cursor-pointer ${bulkMode === "csv" ? "bg-blue-600 text-white" : ""}`}
                  >
                    CSV Importer
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                  {bulkMode === "json" ? (
                    <>
                      <button type="button" onClick={handleLoadSampleJsonData} className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded text-xs cursor-pointer hover:bg-emerald-700">⚡ Load Sample JSON</button>
                      {jsonInput && (
                        <button 
                          type="button" 
                          onClick={() => {
                            navigator.clipboard.writeText(jsonInput);
                            alert("Copied sample JSON array to clipboard!");
                          }}
                          className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-800 text-white font-bold rounded text-xs cursor-pointer flex items-center gap-1"
                        >
                          📋 Copy JSON
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={handleLoadSampleCsv} className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded text-xs cursor-pointer hover:bg-emerald-700">⚡ Load Sample CSV</button>
                      <button type="button" onClick={downloadSampleCsv} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded text-xs flex items-center gap-1 cursor-pointer hover:bg-blue-700"><Download className="h-3.5 w-3.5" /> Download Blueprint</button>
                    </>
                  )}
                </div>

                {bulkMode === "json" && (
                  <div className="space-y-2">
                    <textarea 
                      rows={6} 
                      value={jsonInput} 
                      onChange={(e) => setJsonInput(e.target.value)} 
                      className="w-full p-3 font-mono text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                      placeholder='Paste JSON array: [{"name": "P1", "sku": "S1", "buying_price": 10, "selling_price": 20, "current_stock": 5, "category_id": "uuid"}]' 
                    />
                  </div>
                )}

                {bulkMode === "csv" && (
                  <div className="space-y-2">
                    <div className="border border-dashed border-[var(--border)] p-4 rounded text-center">
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleCsvFileLoad} 
                        className="text-xs" 
                      />
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-2">Upload your custom CSV file following the blueprint structure</p>
                    </div>
                  </div>
                )}

                {/* Bulk Import Preview Table */}
                {bulkPreview.length > 0 && (
                  <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Preview Loaded Data ({bulkPreview.length} rows)</p>
                    <div className="max-h-48 overflow-y-auto text-[10px] font-mono">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold">
                            <th>Name</th>
                            <th>SKU</th>
                            <th>Buy Price</th>
                            <th>Sell Price</th>
                            <th>Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkPreview.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="border-b border-[var(--border)]/50">
                              <td>{row.name}</td>
                              <td>{row.sku}</td>
                              <td>${row.buying_price}</td>
                              <td>${row.selling_price}</td>
                              <td>{row.current_stock}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {bulkPreview.length > 5 && <p className="text-[9px] text-[var(--muted-foreground)] mt-1">Showing first 5 items...</p>}
                    </div>
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={executeBulkImport} 
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded uppercase tracking-wider cursor-pointer"
                >
                  {loading ? "Validating & Processing..." : "Execute Bulk Import"}
                </button>
              </div>
            )}

            {activeTab !== "bulk" && (
              <div className="pt-2 border-t border-[var(--border)] flex justify-end gap-2">
                {formData.id && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData({
                        id: null, name: "", slug: "", sku: "", barcode: "", status: "PUBLISHED",
                        product_type: "PHYSICAL", buying_price: 0, selling_price: 0, compare_price: 0,
                        current_stock: 0, low_stock_alert: 5, weight: 0, shipping_charge: 0, cod_available: true,
                        short_desc: "", full_desc: "", usability: "", package_includes: "", warranty: "",
                        meta_title: "", meta_desc: "", category_id: "", brand_id: "",
                        is_featured: false, is_trending: false, is_best_seller: false, is_flash_sale: false, is_new_arrival: false,
                      });
                      setFeaturedImage("");
                      setGalleryImages([]);
                      setSpecifications([{ key: "Color", value: "" }]);
                      setMessage(null);
                    }} 
                    className="px-4 py-2 border border-[var(--border)] rounded text-xs font-bold cursor-pointer hover:bg-[var(--accent)]"
                  >
                    Cancel Edit
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={loading || uploading} 
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  {loading ? "Saving..." : formData.id ? "Update Product Record" : "Commit Entity & Publish"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT METRICS LOG PREVIEW */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-5 xl:sticky xl:top-20 text-xs">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Live Form Metric Summary</p>
            <h3 className="text-sm font-bold mt-1 tracking-tight line-clamp-1">{formData.name || "Untitled PIM Record Node"}</h3>
          </div>
          {featuredImage && (
            <div className="h-32 rounded border border-[var(--border)] overflow-hidden flex items-center justify-center p-1 bg-[var(--background)]">
              <img src={featuredImage} className="h-full object-contain" />
            </div>
          )}
          <div className="divide-y divide-[var(--border)] font-medium">
            <div className="py-2 flex justify-between"><span>Tracking SKU</span><span className="font-mono text-blue-500 font-bold">{formData.sku || "Auto Generation"}</span></div>
            <div className="py-2 flex justify-between"><span>Net Profit</span><span className="font-black text-emerald-500">${profit.toFixed(2)}</span></div>
            <div className="py-2 flex justify-between"><span>Profit Margin</span><span className="font-black text-emerald-500">{profitMargin}%</span></div>
            <div className="py-2 flex justify-between"><span>Stock Alert Status</span><span>{formData.current_stock > formData.low_stock_alert ? <span className="text-emerald-500 font-bold">In Stock</span> : <span className="text-rose-500 font-bold">Low/No Stock</span>}</span></div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS FOR PRODUCTS DIRECTORY */}
      <div className="p-5 border border-[var(--border)] bg-[var(--card)] rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)] tracking-wider">Master Inventory Stock Ledger Directory</h3>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input 
                type="text" 
                placeholder="Search name, SKU..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-8 pr-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-blue-500 font-medium w-48"
              />
            </div>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
              value={brandFilter} 
              onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
              className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
            >
              <option value="all">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
            >
              <option value="all">All Status</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="HIDDEN">HIDDEN</option>
            </select>

            <select 
              value={stockFilter} 
              onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
              className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
            >
              <option value="all">All Stock Status</option>
              <option value="IN_STOCK">IN_STOCK</option>
              <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price Low-High</option>
              <option value="price_desc">Price High-Low</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
            </select>
          </div>
          {selectedProductIds.length > 0 && (
            <button 
              type="button" 
              onClick={handleBulkDeleteProducts}
              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Trash2 className="h-3 w-3" /> Purge Selected ({selectedProductIds.length})
            </button>
          )}
        </div>

        {/* PRODUCTS LIST TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase tracking-wider">
                <th className="pb-3 w-8">
                  <input 
                    type="checkbox" 
                    checked={products.length > 0 && selectedProductIds.length === products.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProductIds(products.map(p => p.id));
                      } else {
                        setSelectedProductIds([]);
                      }
                    }}
                    className="rounded bg-[var(--background)] border-[var(--border)] text-blue-500 h-3.5 w-3.5 cursor-pointer"
                  />
                </th>
                <th className="pb-3">Thumbnail</th>
                <th className="pb-3">Product Name & SKU</th>
                <th className="pb-3">Taxonomy</th>
                <th className="pb-3">Brand</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock Vault</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-medium">
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center text-[var(--muted-foreground)]">Loading operational directory ledger nodes...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={9} className="py-4 text-center text-[var(--muted-foreground)]">No master data node entities found inside directory repository.</td></tr>
              ) : (
                products.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-[var(--background)]/40 transition-colors">
                      <td className="py-2.5">
                        <input 
                          type="checkbox"
                          checked={selectedProductIds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds([...selectedProductIds, p.id]);
                            } else {
                              setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                            }
                          }}
                          className="rounded bg-[var(--background)] border-[var(--border)] text-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5">
                        <div className="w-10 h-10 border border-[var(--border)] rounded bg-[var(--background)] flex items-center justify-center overflow-hidden p-0.5">
                          {p.featured_image ? <img src={p.featured_image} className="w-full h-full object-contain" /> : <Package className="h-4 w-4 text-[var(--border)]" />}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <p className="font-bold tracking-tight text-sm text-[var(--foreground)]">{p.name}</p>
                        <p className="font-mono text-[9px] text-[var(--muted-foreground)] mt-0.5">{p.sku}</p>
                      </td>
                      <td className="py-2.5 text-[var(--muted-foreground)]">{p.category ? p.category.name : "Unassigned"}</td>
                      <td className="py-2.5 text-[var(--muted-foreground)]">{p.brand ? p.brand.name : "-"}</td>
                      <td className="py-2.5 font-mono">
                        <span className="text-blue-500 font-bold">৳{p.selling_price.toFixed(2)}</span>
                        {p.compare_price && <span className="line-through text-[var(--muted-foreground)] ml-1.5 text-[10px]">৳{p.compare_price.toFixed(2)}</span>}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold ${p.current_stock === 0 ? "bg-rose-500/10 text-rose-500" : p.current_stock < p.low_stock_alert ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                          {p.current_stock} pcs ({p.stock_status})
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold ${p.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-500" : p.status === "DRAFT" ? "bg-zinc-500/10 text-zinc-500" : "bg-rose-500/10 text-rose-500"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-1 whitespace-nowrap">
                        <button type="button" onClick={() => startEditProduct(p)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded cursor-pointer" title="Edit Specs"><Edit3 className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => handleDuplicate(p.id)} className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded cursor-pointer" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => handlePurge(p.id)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer" title="Purge Record"><Trash2 className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs">
            <span className="text-[var(--muted-foreground)]">Showing page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button 
                type="button" 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 border border-[var(--border)] rounded hover:bg-[var(--accent)] disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                type="button" 
                disabled={page === totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-[var(--border)] rounded hover:bg-[var(--accent)] disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}