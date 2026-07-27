"use client";

import React, { useState } from "react";
import { createEnterpriseProduct } from "@/actions/pim-products";
import { deleteSellerProduct } from "@/actions/seller";
import { uploadImage } from "@/actions/upload";
import { 
  Plus, Edit, Trash2, X, ShoppingBag, Loader2, Search, SlidersHorizontal, UploadCloud, ImageIcon 
} from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface SellerProductsClientProps {
  storeId: string;
  initialProducts: any[];
  categories: Category[];
  brands: Brand[];
}

export default function SellerProductsClient({
  storeId,
  initialProducts,
  categories,
  brands,
}: SellerProductsClientProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [shortDesc, setShortDesc] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadImage(fd);
    if (res.error) {
      toast.error(res.error);
    } else if (res.url) {
      setFeaturedImage(res.url);
      toast.success("Main thumbnail image uploaded!");
    }
    setUploadingImage(false);
  };

  const handleGalleryUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadImage(fd);
      if (res.url) {
        uploadedUrls.push(res.url);
      }
    }

    if (uploadedUrls.length > 0) {
      setGalleryImages(prev => [...prev, ...uploadedUrls]);
      toast.success(`Uploaded ${uploadedUrls.length} additional image(s)!`);
    } else {
      toast.error("Failed to upload gallery images.");
    }
    setUploadingGallery(false);
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setGalleryImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setSku("");
    setCategoryId(categories[0]?.id || "");
    setBrandId("");
    setBuyingPrice("");
    setSellingPrice("");
    setComparePrice("");
    setCurrentStock("10");
    setFeaturedImage("");
    setGalleryImages([]);
    setShortDesc("");
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setName(product.name || "");
    setSku(product.sku || "");
    setCategoryId(product.category_id || "");
    setBrandId(product.brand_id || "");
    setBuyingPrice(String(product.buying_price || ""));
    setSellingPrice(String(product.selling_price || ""));
    setComparePrice(String(product.compare_price || ""));
    setCurrentStock(String(product.current_stock || "0"));
    setFeaturedImage(product.featured_image || "");
    setGalleryImages(Array.isArray(product.gallery_images) ? product.gallery_images : []);
    setShortDesc(product.short_desc || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !buyingPrice || !sellingPrice || !currentStock) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        id: editingProduct?.id || undefined,
        name: name.trim(),
        sku: sku.trim() || undefined,
        category_id: categoryId,
        brand_id: brandId || null,
        buying_price: parseFloat(buyingPrice),
        selling_price: parseFloat(sellingPrice),
        compare_price: comparePrice ? parseFloat(comparePrice) : null,
        current_stock: parseInt(currentStock),
        featured_image: featuredImage.trim() || (galleryImages.length > 0 ? galleryImages[0] : null),
        gallery_images: galleryImages,
        short_desc: shortDesc.trim(),
        store_id: storeId,
        status: "PUBLISHED",
      };

      const res = await createEnterpriseProduct(payload);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editingProduct ? "Product updated." : "Product added.");
        // Refresh products list locally or refresh page
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to save product database entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await deleteSellerProduct(productId, storeId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Product deleted.");
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      toast.error("Failed to delete product.");
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" ? true :
                          statusFilter === "IN_STOCK" ? product.current_stock > 0 :
                          product.current_stock === 0;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950">Store Inventory</h1>
          <p className="text-xs font-semibold text-zinc-400">Manage, add, or edit your store's products list.</p>
        </div>

        <a
          href={`/seller/products/add?store_id=${storeId}`}
          className="flex items-center justify-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Product (Full Studio)
        </a>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Status selection */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 focus:border-zinc-900 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Inventory</option>
            <option value="IN_STOCK">In Stock Only</option>
            <option value="OUT_OF_STOCK">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* Products list table */}
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-zinc-600">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category / Brand</th>
                <th className="px-6 py-4">Prices</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400">
                    <ShoppingBag className="mx-auto h-10 w-10 opacity-45 mb-2" />
                    No products matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white p-1">
                          {product.featured_image ? (
                            <img src={product.featured_image} alt={product.name} className="max-h-full max-w-full object-contain rounded-lg" />
                          ) : (
                            <ShoppingBag className="h-5 w-5 text-zinc-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-zinc-950 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-[10px] text-zinc-400 font-bold truncate max-w-[200px]">{product.short_desc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-zinc-800">{product.sku}</td>
                    <td className="px-6 py-4">
                      <p className="text-zinc-800">{product.category?.name || "Uncategorized"}</p>
                      <p className="text-[10px] text-zinc-400">{product.brand?.name || "No Brand"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900">৳{product.selling_price.toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-400">Buying: ৳{product.buying_price.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.current_stock > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                          {product.current_stock} In Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-50/10 px-2.5 py-1 text-[10px] font-bold text-rose-500">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/seller/products/add?id=${product.id}&store_id=${storeId}`}
                          className="rounded-xl border border-zinc-200 p-2 text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900 cursor-pointer"
                          title="Full Product Studio Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-xl border border-zinc-200 p-2 text-zinc-400 transition-colors hover:border-rose-500 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative flex h-full max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-6 py-4">
              <h3 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">
                {editingProduct ? "Edit Product Details" : "Add New Store Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-200 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apex Men's Leather Sneaker"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">SKU (Optionally Custom)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Product Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Product Brand (Optional)</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="">No Brand Relation</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    placeholder="10"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Buying Price * (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(e.target.value)}
                    placeholder="৳900"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Selling Price * (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="৳1,200"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Compare (Market) Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="৳1,500"
                    className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Main Product Thumbnail Image</label>
                  
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 relative ${
                      dragActive ? "border-[#ff6600] bg-orange-50/50" : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
                    }`}
                  >
                    {featuredImage ? (
                      <div className="flex items-center gap-4 w-full">
                        <img src={featuredImage} className="h-16 w-16 rounded-xl object-contain border border-zinc-200 bg-white p-1" />
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">{featuredImage}</p>
                          <button
                            type="button"
                            onClick={() => setFeaturedImage("")}
                            className="text-[10px] text-rose-500 font-bold hover:underline mt-0.5 cursor-pointer"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 text-zinc-400" />
                        <p className="text-xs font-bold text-zinc-700">Drag and drop thumbnail image here, or click to upload</p>
                        <p className="text-[10px] text-zinc-400">Supports JPG, PNG, WEBP files</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase shrink-0">Or Paste Image URL:</span>
                    <input
                      type="url"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Multiple Images / Gallery Section */}
                <div className="sm:col-span-2 space-y-3 pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Product Gallery (Multiple Images)
                    </label>
                    <span className="text-[10px] font-semibold text-zinc-400">
                      {galleryImages.length} image(s) attached
                    </span>
                  </div>

                  {/* Thumbnail Gallery Grid */}
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {galleryImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl border border-zinc-200 bg-zinc-50 p-1 overflow-hidden">
                          <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md opacity-90 hover:opacity-100 cursor-pointer transition-opacity"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gallery Upload Box */}
                  <div className="relative border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50 rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center gap-1.5">
                    {uploadingGallery ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                        <Loader2 className="h-4 w-4 animate-spin text-[#ff6600]" /> Uploading gallery images...
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-zinc-400" />
                        <p className="text-xs font-bold text-zinc-700">Click to upload multiple additional images</p>
                        <p className="text-[10px] text-zinc-400">You can select multiple files at once</p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleGalleryUpload(e.target.files);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Product Short Description</label>
                  <textarea
                    rows={3}
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Provide a quick summary or bullet specifications for the product card..."
                    className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Submit footer */}
              <div className="flex gap-3 border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-full border border-zinc-200 py-3 text-xs font-bold uppercase tracking-wider text-zinc-600 transition-colors hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-950 py-3 text-xs font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Record...
                    </>
                  ) : (
                    "Save Product"
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
