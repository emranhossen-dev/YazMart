"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { 
  getEnterpriseProducts, 
  deleteEnterpriseProduct, 
  deleteMultipleProducts,
  duplicateEnterpriseProduct,
  bulkImportEnterpriseProducts, 
  getPimCategories,
  getBrands
} from "@/actions/pim-products";
import { 
  ImageIcon, FileSpreadsheet, Trash2, UploadCloud, 
  Download, Edit3, Copy, Eye, Plus, Search, Tag, Package, ChevronLeft, ChevronRight, X 
} from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  product_code?: string | null;
  status: string;
  product_type: string;
  buying_price: number;
  selling_price: number;
  compare_price?: number | null;
  current_stock: number;
  low_stock_alert: number;
  weight?: number | null;
  shipping_charge?: number | null;
  cod_available: boolean;
  short_desc?: string | null;
  full_desc?: string | null;
  usability?: string | null;
  package_includes?: string | null;
  warranty?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  is_featured: boolean;
  is_trending: boolean;
  is_best_seller: boolean;
  is_flash_sale: boolean;
  is_new_arrival: boolean;
  featured_image?: string | null;
  gallery_images?: string[];
  specifications?: any;
  stock_status: string;
  category?: {
    id: string;
    name: string;
  } | null;
  brand?: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

function ProductsManagementContent() {
  const router = useRouter();

  // Search & Filter state variables
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Tab State: "general" = Products Directory, "bulk" = JSON/CSV Importer
  const [activeTab, setActiveTab] = useState<"general" | "bulk">("general");

  // Bulk Upload States
  const [bulkMode, setBulkMode] = useState<"json" | "csv">("json");
  const [jsonInput, setJsonInput] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvTextInput, setCsvTextInput] = useState("");
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [overviewProduct, setOverviewProduct] = useState<any | null>(null);

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

  const parseCSVText = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^["']|["']$/g, ""));
    const parsedData = lines.slice(1).map(line => {
      const values = parseCSVLine(line).map(v => v.trim().replace(/^["']|["']$/g, ""));
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });
      return rowObj;
    });
    return parsedData;
  };

  const handleCsvFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const csvText = evt.target?.result as string;
      setCsvTextInput(csvText);
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) {
        toast.error("CSV file needs a header row and at least one product data row.");
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
      toast.success(`Loaded ${parsedData.length} records. Check preview below before importing.`);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCsv = () => {
    if (categories.length === 0) {
      toast.error("Please create at least one category first!");
      return;
    }

    const headers = [
      "name", "sku", "barcode", "product_code", "product_type", "status",
      "featured_image", "gallery_images", "video_url", "buying_price", "selling_price",
      "compare_price", "current_stock", "low_stock_alert", "weight", "shipping_charge",
      "cod_available", "short_desc", "full_desc", "meta_title", "meta_desc",
      "is_featured", "is_trending", "is_best_seller", "is_flash_sale", "is_new_arrival",
      "specifications", "warranty", "category_id", "brand_id", "usability", "package_includes"
    ];

    const row1 = [
      `"Luxury Smart Sunglasses"`,
      `"SKU-GLASS-${Math.floor(1000 + Math.random() * 9000)}"`,
      `"123456789012"`,
      `"PC-GLASS-001"`,
      `"PHYSICAL"`,
      `"PUBLISHED"`,
      `"https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop"`,
      `"https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop,https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop"`,
      `"https://www.youtube.com/watch?v=dQw4w9WgXcQ"`,
      "90.00",
      "180.00",
      "220.00",
      "40",
      "5",
      "0.25",
      "15.00",
      "true",
      `"Premium smart polarized sunglasses with audio integration."`,
      `"Experience the ultimate fusion of style and modern intelligence."`,
      `"Luxury Smart Sunglasses - YazMart Elite"`,
      `"Shop luxury smart sunglasses with audio integration at YazMart."`,
      "true",
      "false",
      "true",
      "false",
      "true",
      `"Lens Material: Polarized TAC, Connectivity: Bluetooth 5.2"`,
      `"1 Year Brand Warranty"`,
      `"${categories[0]?.id || "category_uuid_here"}"`,
      `"${brands[0]?.id || "brand_uuid_here"}"`,
      `"Usage: Charge fully before first use."`,
      `"Adapter, charging cable, user manual"`
    ];

    const row2 = [
      `"Mechanical Gaming Keyboard"`,
      `"SKU-KEY-${Math.floor(1000 + Math.random() * 9000)}"`,
      `"987654321098"`,
      `"PC-KEY-002"`,
      `"PHYSICAL"`,
      `"PUBLISHED"`,
      `"https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop"`,
      `"https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop"`,
      `""`,
      "45.00",
      "85.00",
      "110.00",
      "75",
      "8",
      "0.95",
      "20.00",
      "true",
      `"High performance mechanical keyboard with customizable RGB lights."`,
      `"Engineered for durability and gaming responsiveness."`,
      `"RGB Gaming Keyboard - YazMart Pro"`,
      `"Buy custom mechanical gaming keyboards at YazMart."`,
      "false",
      "true",
      "false",
      "true",
      "false",
      `"Switch Type: Blue Switches, Layout: Tenkeyless"`,
      `"6 Months Warranty"`,
      `"${categories[0]?.id || "category_uuid_here"}"`,
      `"${brands[0]?.id || "brand_uuid_here"}"`,
      `"Usage: Do not spill liquids on surface."`,
      `"Keyboard, Keycap puller, usb-c cable"`
    ];

    const sampleCsvData = headers.join(",") + "\n" + row1.join(",") + "\n" + row2.join(",");
    setCsvTextInput(sampleCsvData);
    
    // Create preview
    const lines = sampleCsvData.split(/\r?\n/).filter(line => line.trim() !== "");
    const parsedData = lines.slice(1).map(line => {
      const values = parseCSVLine(line).map(v => v.trim().replace(/^["']|["']$/g, ""));
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || "";
      });
      return rowObj;
    });

    setBulkPreview(parsedData);
    toast.success("Loaded sample CSV data containing all enterprise PIM properties!");
  };

  const downloadSampleCsv = () => {
    const headers = [
      "name", "sku", "barcode", "product_code", "product_type", "status",
      "featured_image", "gallery_images", "video_url", "buying_price", "selling_price",
      "compare_price", "current_stock", "low_stock_alert", "weight", "shipping_charge",
      "cod_available", "short_desc", "full_desc", "meta_title", "meta_desc",
      "is_featured", "is_trending", "is_best_seller", "is_flash_sale", "is_new_arrival",
      "specifications", "warranty", "category_id", "brand_id", "usability", "package_includes"
    ];
    const row = [
      `"Luxury Smart Sunglasses"`,
      `"SKU-GLASS-101"`,
      `"123456789012"`,
      `"PC-GLASS-001"`,
      `"PHYSICAL"`,
      `"PUBLISHED"`,
      `"https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop"`,
      `"https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop,https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=400&auto=format&fit=crop"`,
      `"https://www.youtube.com/watch?v=dQw4w9WgXcQ"`,
      "90.00",
      "180.00",
      "220.00",
      "40",
      "5",
      "0.25",
      "15.00",
      "true",
      `"Premium smart polarized sunglasses with audio integration."`,
      `"Experience the ultimate fusion of style and modern intelligence."`,
      `"Luxury Smart Sunglasses - YazMart Elite"`,
      `"Shop luxury smart sunglasses with audio integration at YazMart."`,
      "true",
      "false",
      "true",
      "false",
      "true",
      `"Lens Material: Polarized TAC, Connectivity: Bluetooth 5.2"`,
      `"1 Year Brand Warranty"`,
      `"${categories[0]?.id || "category_uuid"}"`,
      `"${brands[0]?.id || "brand_uuid"}"`,
      `"Usage: Charge fully before first use."`,
      `"Adapter, charging cable, user manual"`
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + row.join(",");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", "enterprise_bulk_sample.csv");
    downloadAnchor.click();
  };

  const handleLoadSampleJsonData = () => {
    const sample = [
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
        "buying_price": 45.00,
        "selling_price": 85.00,
        "compare_price": 110.00,
        "current_stock": 75,
        "low_stock_alert": 8,
        "weight": 0.95,
        "shipping_charge": 20.00,
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
    toast.success("Loaded sample JSON data! Click copy to copy to clipboard or import to commit.");
  };

  const executeBulkImport = async () => {
    let importList = [];
    if (bulkMode === "json") {
      try {
        importList = JSON.parse(jsonInput);
        if (!Array.isArray(importList)) {
          toast.error("JSON data must be a valid array of product objects.");
          return;
        }
      } catch {
        toast.error("Invalid JSON syntax. Please verify commas and double quotes.");
        return;
      }
    } else {
      if (bulkPreview.length === 0 && csvTextInput) {
        try {
          importList = parseCSVText(csvTextInput);
        } catch {
          toast.error("Failed to parse pasted CSV text.");
          return;
        }
      } else {
        importList = bulkPreview;
      }
      if (importList.length === 0) {
        toast.error("Please upload a CSV file or enter CSV text first.");
        return;
      }
    }

    setLoading(true);
    const res = await bulkImportEnterpriseProducts(importList);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success || "Import completed successfully!");
      setJsonInput("");
      setCsvTextInput("");
      setBulkPreview([]);
      setCsvFile(null);
      await loadData();
    }
    setLoading(false);
  };

  const handleDuplicate = async (id: string) => {
    const result = await Swal.fire({
      title: "Duplicate Product?",
      text: "Are you sure you want to duplicate this product record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Duplicate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#4b5563",
      background: "var(--card)",
      color: "var(--foreground)"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    const res = await duplicateEnterpriseProduct(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success || "Product duplicated.");
      await loadData();
    }
    setLoading(false);
  };

  const handlePurge = async (id: string) => {
    const result = await Swal.fire({
      title: "Purge Product?",
      text: "Purge product node? This action is irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Purge",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#4b5563",
      background: "var(--card)",
      color: "var(--foreground)"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    const res = await deleteEnterpriseProduct(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success || "Product purged.");
      await loadData();
    }
    setLoading(false);
  };

  const handleBulkDeleteProducts = async () => {
    if (selectedProductIds.length === 0) return;

    const result = await Swal.fire({
      title: "Purge Products?",
      text: `Purge ${selectedProductIds.length} product records? This action is irreversible.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Purge All",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#4b5563",
      background: "var(--card)",
      color: "var(--foreground)"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    const res = await deleteMultipleProducts(selectedProductIds);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success || "Selected products deleted.");
      setSelectedProductIds([]);
      await loadData();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-[1700px] mx-auto p-1 text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight">Products Inventory Ledger</h1>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Manage multi-warehouse quantities, product status matrix, and bulk data imports.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/products/add")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shadow-md animate-in fade-in zoom-in duration-200"
        >
          <Plus className="h-4 w-4" /> Register Product Node
        </button>
      </div>

      {/* Primary Sub Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab("general");
            setBulkPreview([]);
            setJsonInput("");
            setCsvTextInput("");
          }}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "general" ? "bg-blue-600 text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
          }`}
        >
          📂 Products Directory List
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("bulk");
          }}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "bulk" ? "bg-blue-600 text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
          }`}
        >
          📥 JSON / CSV Bulk Import
        </button>
      </div>

      {/* GENERAL TAB CONTENT */}
      {activeTab === "general" && (
        <div className="space-y-4">
          {/* Filters controls panel */}
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-6 items-end bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
            <div className="md:col-span-2">
              <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Search SKU / Title</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} 
                  placeholder="Enter keyword query..." 
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Category Hub</label>
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="w-full px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none font-bold">
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Brand Mapping</label>
              <select value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }} className="w-full px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none">
                <option value="all">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Stock Status</label>
              <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} className="w-full px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none">
                <option value="all">All Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_stock">Low Stock Warning</option>
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase text-[var(--muted-foreground)] mb-1">Sorting Sequence</label>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="w-full px-2 py-1.5 text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none">
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
                <option value="stock_desc">Stock: High to Low</option>
              </select>
            </div>
          </div>

          {/* Directory actions bar */}
          <div className="flex justify-between items-center bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] shadow-2xs">
            <h3 className="text-xs font-black uppercase text-[var(--muted-foreground)]">Products Matrix Ledger</h3>
            {selectedProductIds.length > 0 && (
              <button 
                type="button" 
                onClick={handleBulkDeleteProducts}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] uppercase tracking-wider cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Trash2 className="h-3 w-3" /> Purge Selected ({selectedProductIds.length})
              </button>
            )}
          </div>

          {/* Products grid table */}
          <div className="border border-[var(--border)] bg-[var(--card)] rounded-xl p-5 shadow-xs">
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
                            <button 
                              type="button" 
                              onClick={() => setOverviewProduct(p)}
                              className="font-bold tracking-tight text-sm text-blue-500 hover:text-blue-600 hover:underline text-left cursor-pointer focus:outline-none"
                            >
                              {p.name}
                            </button>
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
                            <span className={`px-2 py-0.5 rounded-[3px] text-[9px] font-black tracking-wider ${p.status === "PUBLISHED" ? "bg-emerald-600/15 text-emerald-500" : "bg-zinc-600/15 text-zinc-400"}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right space-x-0.5">
                            <button type="button" onClick={() => router.push(`/admin/products/add?id=${p.id}`)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded cursor-pointer" title="Edit Specs"><Edit3 className="h-3.5 w-3.5" /></button>
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
      )}

      {/* BULK TAB CONTENT */}
      {activeTab === "bulk" && (
        <div className="space-y-4 border border-[var(--border)] bg-[var(--card)] rounded-xl p-5 shadow-xs">
          <div className="flex bg-[var(--background)] border border-[var(--border)] p-0.5 rounded-md text-[10px] font-bold uppercase w-fit select-none">
            <button 
              type="button" 
              onClick={() => { setBulkMode("json"); setBulkPreview([]); }} 
              className={`px-4 py-1.5 rounded-[4px] cursor-pointer ${bulkMode === "json" ? "bg-blue-600 text-white" : ""}`}
            >
              JSON Import
            </button>
            <button 
              type="button" 
              onClick={() => { setBulkMode("csv"); setBulkPreview([]); }} 
              className={`px-4 py-1.5 rounded-[4px] cursor-pointer ${bulkMode === "csv" ? "bg-blue-600 text-white" : ""}`}
            >
              CSV Import
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
                      toast.success("Copied sample JSON array to clipboard!", {
                        style: {
                          background: "var(--card)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }
                      });
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
                rows={8} 
                value={jsonInput} 
                onChange={(e) => setJsonInput(e.target.value)} 
                className="w-full p-3 font-mono text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none" 
                placeholder='Paste JSON array: [{"name": "P1", "sku": "S1", "buying_price": 10, "selling_price": 20, "current_stock": 5, "category_id": "uuid"}]' 
              />
            </div>
          )}

          {bulkMode === "csv" && (
            <div className="space-y-4">
              <div className="border border-dashed border-[var(--border)] p-4 rounded text-center bg-[var(--background)]/30">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleCsvFileLoad} 
                  className="text-xs" 
                />
                <p className="text-[10px] text-[var(--muted-foreground)] mt-2">Upload your custom CSV file following the blueprint structure</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-[var(--muted-foreground)]">Or Paste CSV Text</label>
                <textarea 
                  rows={8}
                  value={csvTextInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCsvTextInput(val);
                    try {
                      const parsed = parseCSVText(val);
                      setBulkPreview(parsed);
                    } catch {}
                  }}
                  placeholder="name,sku,buying_price,selling_price,current_stock,category_id,brand_id...&#10;Product Title,SKU-123,100.00,150.00,20,uuid,uuid..."
                  className="w-full p-3 font-mono text-xs rounded bg-[var(--background)] border border-[var(--border)] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Preview Loaded Data */}
          {bulkPreview.length > 0 && (
            <div className="p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg space-y-2">
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">Preview Loaded Data ({bulkPreview.length} rows)</p>
              <div className="max-h-48 overflow-y-auto text-[10px] font-mono">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold">
                      <th className="pb-1">Name</th>
                      <th className="pb-1">SKU</th>
                      <th className="pb-1">Buying (৳)</th>
                      <th className="pb-1">Selling (৳)</th>
                      <th className="pb-1">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkPreview.map((r, i) => (
                      <tr key={i} className="border-b border-[var(--border)]/30 text-[var(--foreground)]">
                        <td className="py-1 truncate max-w-[120px]">{r.name}</td>
                        <td className="py-1 font-mono">{r.sku}</td>
                        <td className="py-1">{r.buying_price}</td>
                        <td className="py-1 font-bold text-blue-500">{r.selling_price}</td>
                        <td className="py-1">{r.current_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button 
              type="button" 
              onClick={() => { setBulkPreview([]); setJsonInput(""); setCsvTextInput(""); }}
              className="px-4 py-2 border border-[var(--border)] rounded text-xs font-bold hover:bg-[var(--accent)] cursor-pointer"
            >
              Clear Preview
            </button>
            <button 
              type="button" 
              disabled={loading} 
              onClick={executeBulkImport}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {loading ? "Importing..." : "Execute Bulk Import Ledger"}
            </button>
          </div>
        </div>
      )}

      {/* Product Details Overview Modal */}
      {overviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative custom-scrollbar animate-in fade-in zoom-in duration-200 text-xs">
            
            {/* Close Button */}
            <button 
              type="button" 
              onClick={() => setOverviewProduct(null)} 
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-[var(--border)] pr-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-blue-600/10 text-blue-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[9px] border border-blue-500/15">
                    {overviewProduct.product_type}
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[9px] border ${
                    overviewProduct.status === "PUBLISHED" ? "bg-emerald-600/10 text-emerald-500 border-emerald-500/15" : "bg-zinc-600/10 text-zinc-400 border-zinc-500/15"
                  }`}>
                    {overviewProduct.status}
                  </span>
                  {overviewProduct.is_featured && <span className="bg-amber-600/10 text-amber-500 border border-amber-500/15 font-bold px-2 py-0.5 rounded text-[9px]">FEATURED</span>}
                  {overviewProduct.is_trending && <span className="bg-indigo-600/10 text-indigo-500 border border-indigo-500/15 font-bold px-2 py-0.5 rounded text-[9px]">TRENDING</span>}
                </div>
                <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">{overviewProduct.name}</h2>
                <div className="flex gap-4 font-mono text-[9px] text-[var(--muted-foreground)]">
                  <span>SKU: <b className="text-[var(--foreground)]">{overviewProduct.sku}</b></span>
                  {overviewProduct.barcode && <span>Barcode: <b className="text-[var(--foreground)]">{overviewProduct.barcode}</b></span>}
                  {overviewProduct.product_code && <span>Product Code: <b className="text-[var(--foreground)]">{overviewProduct.product_code}</b></span>}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Media / Images Carousel */}
              <div className="space-y-4">
                <div className="border border-[var(--border)] rounded-xl bg-[var(--background)] p-2 flex items-center justify-center h-64 overflow-hidden">
                  {overviewProduct.featured_image ? (
                    <img src={overviewProduct.featured_image} className="max-h-full max-w-full object-contain rounded" alt={overviewProduct.name} />
                  ) : (
                    <div className="text-[var(--muted-foreground)] flex flex-col items-center gap-2">
                      <Package className="h-12 w-12 text-[var(--border)]" />
                      <span>No Main Image Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Gallery preview */}
                {overviewProduct.gallery_images && overviewProduct.gallery_images.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[var(--muted-foreground)] uppercase text-[9px] mb-2">Media Gallery ({overviewProduct.gallery_images.length})</h4>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {overviewProduct.gallery_images.map((img: string, idx: number) => (
                        <div key={idx} className="w-14 h-14 border border-[var(--border)] rounded bg-[var(--background)] p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img src={img} className="max-h-full max-w-full object-contain rounded-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Specifications / Metadata Details */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3.5 bg-[var(--background)]/30 border border-[var(--border)] p-4 rounded-xl">
                  <div>
                    <span className="block text-[9px] text-[var(--muted-foreground)] uppercase font-bold">Selling Price</span>
                    <span className="text-sm font-black text-blue-500">৳{overviewProduct.selling_price}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-[var(--muted-foreground)] uppercase font-bold">Buying Price</span>
                    <span className="text-xs text-[var(--foreground)] font-bold">৳{overviewProduct.buying_price}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-[var(--muted-foreground)] uppercase font-bold">Low stock warning</span>
                    <span className="text-xs text-[var(--foreground)] font-bold">{overviewProduct.low_stock_alert} units</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-[var(--muted-foreground)] uppercase font-bold">Current stock</span>
                    <span className={`text-xs font-bold ${overviewProduct.current_stock === 0 ? "text-rose-500" : "text-emerald-500"}`}>
                      {overviewProduct.current_stock} pcs ({overviewProduct.stock_status})
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-[var(--muted-foreground)] uppercase font-bold">Shipping Charge</span>
                    <span className="text-xs text-[var(--foreground)] font-semibold">
                      {overviewProduct.shipping_charge ? `৳${overviewProduct.shipping_charge}` : "Free Delivery"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-[var(--muted-foreground)] uppercase font-bold">COD Option</span>
                    <span className="text-xs text-[var(--foreground)] font-semibold">{overviewProduct.cod_available ? "Enabled" : "Disabled"}</span>
                  </div>
                  {overviewProduct.weight && (
                    <div>
                      <span className="block text-[9px] text-[var(--muted-foreground)] uppercase font-bold">Weight</span>
                      <span className="text-xs text-[var(--foreground)] font-semibold">{overviewProduct.weight} kg</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[9px] text-[var(--muted-foreground)] uppercase font-bold">Taxonomy Matrix</span>
                    <span className="text-xs text-blue-500 font-bold">{overviewProduct.category?.name || "Unassigned"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[9px] text-[var(--muted-foreground)] uppercase font-bold">Warranty / Box Content</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[var(--accent)]/30 border border-[var(--border)] p-2 rounded">
                      <span className="text-[9px] text-[var(--muted-foreground)] uppercase font-bold block mb-0.5">Warranty Details</span>
                      <span className="font-semibold">{overviewProduct.warranty || "No warranty provided"}</span>
                    </div>
                    <div className="bg-[var(--accent)]/30 border border-[var(--border)] p-2 rounded">
                      <span className="text-[9px] text-[var(--muted-foreground)] uppercase font-bold block mb-0.5">Package Contents</span>
                      <span className="font-semibold">{overviewProduct.package_includes || "Standard retail box"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extended specifications and technical specs table */}
            <div className="grid gap-6 md:grid-cols-2 border-t border-[var(--border)] pt-5">
              {/* Short & Full Descriptions */}
              <div className="space-y-4">
                {overviewProduct.short_desc && (
                  <div>
                    <h4 className="font-bold text-[var(--muted-foreground)] uppercase text-[9px] mb-1">Short Description Overview</h4>
                    <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">{overviewProduct.short_desc}</p>
                  </div>
                )}
                
                {overviewProduct.usability && (
                  <div>
                    <h4 className="font-bold text-[var(--muted-foreground)] uppercase text-[9px] mb-1">Usability Guides</h4>
                    <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)] bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-lg">
                      {overviewProduct.usability}
                    </p>
                  </div>
                )}

                {overviewProduct.full_desc && (
                  <div>
                    <h4 className="font-bold text-[var(--muted-foreground)] uppercase text-[9px] mb-1.5">Extended Details (HTML Rich content)</h4>
                    <div 
                      className="text-[11px] leading-relaxed text-[var(--muted-foreground)] max-h-40 overflow-y-auto border border-[var(--border)] rounded-lg p-3 bg-[var(--background)]/30 custom-scrollbar" 
                      dangerouslySetInnerHTML={{ __html: overviewProduct.full_desc }}
                    />
                  </div>
                )}
              </div>

              {/* Technical features specifications matrix */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-[var(--muted-foreground)] uppercase text-[9px] mb-2">Technical Properties Matrix</h4>
                  {overviewProduct.specifications && typeof overviewProduct.specifications === "object" && Object.keys(overviewProduct.specifications).length > 0 ? (
                    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="bg-[var(--accent)]/30 border-b border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[9px] uppercase">
                            <th className="px-3 py-2">Parameter Key</th>
                            <th className="px-3 py-2">Property Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {Object.entries(overviewProduct.specifications).map(([key, val]: any, idx) => (
                            <tr key={idx} className="hover:bg-[var(--accent)]/10">
                              <td className="px-3 py-2 font-bold text-[var(--foreground)]">{key}</td>
                              <td className="px-3 py-2 text-[var(--muted-foreground)]">{String(val)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-6 border border-[var(--border)] border-dashed rounded-xl text-[var(--muted-foreground)] font-semibold">
                      No custom specifications matrix configured.
                    </div>
                  )}
                </div>

                {overviewProduct.video_url && (
                  <div>
                    <h4 className="font-bold text-[var(--muted-foreground)] uppercase text-[9px] mb-1">Attached Video Feed URL</h4>
                    <a href={overviewProduct.video_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-mono text-[10px] truncate block">
                      🔗 {overviewProduct.video_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setOverviewProduct(null)}
                className="px-4 py-2 border border-[var(--border)] rounded text-xs font-bold hover:bg-[var(--accent)] transition-colors cursor-pointer"
              >
                Close Overview
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/admin/products/add?id=${overviewProduct.id}`);
                  setOverviewProduct(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                Modify Product Specs
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--muted-foreground)]">Loading products directory...</div>}>
      <ProductsManagementContent />
    </Suspense>
  );
}