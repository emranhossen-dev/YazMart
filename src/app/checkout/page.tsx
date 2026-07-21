"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShopStore } from "@/store/shop-store";
import { useAuthStore } from "@/store/auth-store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createOrder } from "@/actions/orders";
import {
  CreditCard, ShoppingBag, ShieldCheck, Heart, ShoppingCart,
  Lock, Ticket, Truck, MapPin, Banknote, Smartphone, ChevronDown, ChevronUp, Check
} from "lucide-react";
import { validateCoupon } from "@/actions/coupons";
import { getUserCoins } from "@/actions/reviews";

const BD_DIVISIONS = [
  "Dhaka", "Chittagong", "Rajshahi", "Khulna",
  "Barishal", "Sylhet", "Rangpur", "Mymensingh",
];

const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka: [
    "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj",
    "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi",
    "Rajbari", "Shariatpur", "Tangail",
  ],
  Chittagong: [
    "Chattogram", "Bandarban", "Brahmanbaria", "Chandpur", "Cumilla",
    "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati",
  ],
  Rajshahi: [
    "Rajshahi", "Bogura", "Chapai Nawabganj", "Joypurhat",
    "Naogaon", "Natore", "Pabna", "Sirajganj",
  ],
  Khulna: [
    "Khulna", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah",
    "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
  ],
  Barishal: [
    "Barishal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur",
  ],
  Sylhet: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
  Rangpur: [
    "Rangpur", "Dinajpur", "Gaibandha", "Kurigram",
    "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon",
  ],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

const BD_THANAS: Record<string, string[]> = {
  Dhaka: [
    "Adabor", "Badda", "Bangshal", "Cantonment", "Chawkbazar",
    "Dakshinkhan", "Demra", "Dhanmondi", "Gendaria", "Gulshan",
    "Hazaribagh", "Jatrabari", "Kadamtali", "Kafrul", "Kalabagan",
    "Khilgaon", "Khilkhet", "Kotwali", "Lalbagh", "Mirpur",
    "Mohammadpur", "Motijheel", "New Market", "Pallabi", "Paltan",
    "Ramna", "Rayer Bazar", "Sabujbagh", "Shah Ali", "Shahbagh",
    "Sher-e-Bangla Nagar", "Shyampur", "Sutrapur", "Tejgaon",
    "Tejgaon Industrial", "Turag", "Uttara", "Uttarkhan", "Vatara",
    "Wari",
  ],
  Gazipur: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Tongi"],
  Narayanganj: ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"],
  Narsingdi: ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"],
  Manikganj: ["Manikganj Sadar", "Daulatpur", "Ghior", "Harirampur", "Saturia", "Shivalaya", "Singair"],
  Munshiganj: ["Munshiganj Sadar", "Gazaria", "Louhajang", "Sirajdikhan", "Sreenagar", "Tongibari"],
  Faridpur: ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
  Gopalganj: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
  Kishoreganj: ["Kishoreganj Sadar", "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"],
  Madaripur: ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"],
  Rajbari: ["Rajbari Sadar", "Baliakandi", "Goalanda", "Pangsha"],
  Shariatpur: ["Shariatpur Sadar", "Bhedarganj", "Damudya", "Gosairhat", "Naria", "Zanjira"],
  Tangail: ["Tangail Sadar", "Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur"],
  Chattogram: [
    "Chandgaon", "Chittagong Port", "Double Mooring", "Halishahar",
    "Karnaphuli", "Khulshi", "Kotwali", "Pahartali", "Panchlaish",
    "Patenga", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda",
  ],
  Bandarban: ["Bandarban Sadar", "Alikadam", "Lama", "Naikhyangchhari", "Rowangchhari", "Ruma", "Thanchi"],
  Brahmanbaria: ["Brahmanbaria Sadar", "Ashuganj", "Bancharampur", "Bijoynagar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail"],
  Chandpur: ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"],
  Cumilla: ["Cumilla Sadar", "Barura", "Brahmanpara", "Burichong", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Meghna", "Monohorgonj", "Muradnagar", "Nangalkot", "Titas"],
  "Cox's Bazar": ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Maheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhia"],
  Feni: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Sonagazi"],
  Khagrachari: ["Khagrachari Sadar", "Dighinala", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"],
  Lakshmipur: ["Lakshmipur Sadar", "Kamalnagar", "Raipur", "Ramganj", "Ramgati"],
  Noakhali: ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Senbagh", "Subarnachar"],
  Rangamati: ["Rangamati Sadar", "Bagaichhari", "Barkal", "Belaichhari", "Juraichhari", "Kaptai", "Kawkhali", "Langadu", "Naniarchar", "Rajasthali"],
  Rajshahi: ["Rajshahi Sadar", "Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"],
  Bogura: ["Bogura Sadar", "Adamdighi", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatola"],
  "Chapai Nawabganj": ["Chapai Nawabganj Sadar", "Bholahat", "Gomastapur", "Nachole", "Shibganj"],
  Joypurhat: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"],
  Naogaon: ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mahadebpur", "Mohadevpur", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
  Natore: ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Singra"],
  Pabna: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"],
  Sirajganj: ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Tarash", "Ullapara"],
  Khulna: ["Khulna Sadar", "Batiaghata", "Dacope", "Dighalia", "Dumuria", "Harintana", "Khalishpur", "Khan Jahan Ali", "Koyra", "Paikgachha", "Phultala", "Rupsa", "Sonadanga", "Terokhada"],
  Bagerhat: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
  Chuadanga: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"],
  Jessore: ["Jessore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
  Jhenaidah: ["Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
  Kushtia: ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Mirpur"],
  Magura: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
  Meherpur: ["Meherpur Sadar", "Gangni", "Mujibnagar"],
  Narail: ["Narail Sadar", "Kalia", "Lohagara"],
  Satkhira: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"],
  Barishal: ["Barishal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gournadi", "Hijla", "Mehendiganj", "Muladi", "Wazirpur"],
  Barguna: ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali"],
  Bhola: ["Bhola Sadar", "Borhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
  Jhalokati: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  Patuakhali: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali"],
  Pirojpur: ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"],
  Sylhet: ["Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmaninagar", "South Surma"],
  Habiganj: ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj"],
  Moulvibazar: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"],
  Sunamganj: ["Sunamganj Sadar", "Bishwamvarpur", "Chhatak", "Derai", "Dharmapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur"],
  Rangpur: ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
  Dinajpur: ["Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
  Gaibandha: ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
  Kurigram: ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Fulbari", "Nageshwari", "Rajarhat", "Rowmari", "Ulipur"],
  Lalmonirhat: ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"],
  Nilphamari: ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"],
  Panchagarh: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],
  Thakurgaon: ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"],
  Mymensingh: ["Mymensingh Sadar", "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail", "Phulpur", "Trishal"],
  Jamalpur: ["Jamalpur Sadar", "Bakshiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"],
  Netrokona: ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri", "Madan", "Mohanganj", "Purbadhala"],
  Sherpur: ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"],
};

function calcDeliveryCharge(district: string): number {
  return district === "Dhaka" ? 60 : 120;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useShopStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile order summary dropdown toggle
  const [showMobileOrderSummary, setShowMobileOrderSummary] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Coins
  const [userCoins, setUserCoins] = useState(0);
  const [useCoins, setUseCoins] = useState(false);

  // Form fields
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Location
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [addressLine, setAddressLine] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");

  // Fetch user coins
  React.useEffect(() => {
    if (user?.id) {
      getUserCoins(user.id).then(res => {
        if (res.coins) setUserCoins(res.coins);
      });
    }
  }, [user]);

  // Derived values
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const customShippingSum = cart.reduce((sum, item) => sum + ((item.shipping_charge || 0) * item.quantity), 0);
  const defaultDeliveryCharge = district ? calcDeliveryCharge(district) : 0;
  const deliveryCharge = customShippingSum > 0 ? customShippingSum : defaultDeliveryCharge;
  
  const coinsDiscount = useCoins ? Math.min(subtotal, userCoins) : 0;
  const coinsRedeemed = coinsDiscount;

  const totalDiscount = discountAmount + coinsDiscount;
  const total = Math.max(0, subtotal + deliveryCharge - totalDiscount);

  const availableDistricts = division ? (BD_DISTRICTS[division] || []) : [];
  const availableThanas = district ? (BD_THANAS[district] || [`${district} Sadar`]) : [];

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    setCouponError(null);
    const res = await validateCoupon(couponCode, subtotal);
    if (res.error) {
      setCouponError(res.error);
      setDiscountAmount(0);
    } else if (res.success && res.coupon) {
      setDiscountAmount(res.coupon.discount_amount);
      setCouponError(null);
    }
    setApplyingCoupon(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError("Your cart is empty. Add products before placing an order.");
      return;
    }
    if (!division || !district || !thana) {
      setError("Please select your Division, District, and Thana.");
      return;
    }

    setLoading(true);

    const payload = {
      customer_id: user?.id,
      customer_name: name,
      customer_email: email,
      shipping_address: `${addressLine}, ${thana}, ${district}, ${division}`,
      phone,
      total_amount: total,
      subtotal,
      delivery_charge: deliveryCharge,
      discount: totalDiscount,
      coupon_code: discountAmount > 0 ? couponCode : undefined,
      coins_redeemed: coinsRedeemed,
      payment_method: paymentMethod,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        sku: item.sku,
        image: item.image,
      })),
    };

    const res = await createOrder(payload);

    if (res.error) {
      setError(res.error);
    } else if (res.success && res.orderId) {
      clearCart();
      if (paymentMethod === "ONLINE") {
        router.push(`/checkout/payment/${res.orderId}`);
      } else {
        router.push(`/checkout/confirmation/${res.orderId}`);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans pb-24 lg:pb-0">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8 space-y-6">
        
        {/* Responsive Steps Bar */}
        <div className="max-w-xl mx-auto flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-600">✓</span>
            <span className="hidden sm:inline">Shopping</span> Bag
          </div>
          <div className="flex-1 h-0.5 bg-emerald-500 mx-2 sm:mx-4" />
          <div className="flex items-center gap-1.5 text-slate-900 font-black">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#ff6600] text-white flex items-center justify-center text-[10px] font-black">2</span>
            <span>Checkout</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-2 sm:mx-4" />
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-400">3</span>
            <span className="hidden sm:inline">Confirmation</span>
          </div>
        </div>

        {/* MOBILE ONLY: Accordion summary preview at top */}
        <div className="lg:hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <button
            type="button"
            onClick={() => setShowMobileOrderSummary(!showMobileOrderSummary)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#ff6600]" />
              <span>Order Summary ({cart.length} items)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-950">৳{total.toLocaleString()}</span>
              {showMobileOrderSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {showMobileOrderSummary && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150 text-xs">
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {item.image && (
                        <img src={item.image} className="w-8 h-8 rounded-md object-contain border border-slate-100 shrink-0" />
                      )}
                      <p className="font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                    </div>
                    <span className="font-bold text-slate-950 shrink-0">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-2 text-[11px] font-semibold text-slate-600 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-slate-900">{district ? `৳${deliveryCharge}` : "Select district"}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-extrabold">
                    <span>Discount</span>
                    <span>−৳{totalDiscount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            ⚠️ {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-5 items-start">
          
          {/* ─── LEFT: Shipping Form ─── */}
          <div className="lg:col-span-3 p-4 sm:p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-6">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-[#ff6600]" /> Shipping & Contact Info
            </h3>

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4 sm:space-y-5">
              
              {/* Name + Email */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#ff6600] font-semibold text-slate-900"
                    placeholder="e.g. Rahim Ahmed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#ff6600] font-semibold text-slate-900"
                    placeholder="e.g. rahim@gmail.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#ff6600] font-semibold text-slate-900"
                  placeholder="e.g. 01700000000"
                />
              </div>

              {/* Division */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Division *</label>
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    setDistrict("");
                    setThana("");
                  }}
                  required
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#ff6600] font-bold text-slate-900 cursor-pointer"
                >
                  <option value="" disabled>Select Division</option>
                  {BD_DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* District + Thana */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">District *</label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setThana("");
                    }}
                    required
                    disabled={!division}
                    className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#ff6600] font-bold text-slate-900 cursor-pointer disabled:opacity-40"
                  >
                    <option value="" disabled>Select District</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Thana / Upazila *</label>
                  <select
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    required
                    disabled={!district}
                    className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#ff6600] font-bold text-slate-900 cursor-pointer disabled:opacity-40"
                  >
                    <option value="" disabled>Select Thana</option>
                    {availableThanas.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery charge indicator */}
              {district && (
                <div className={`flex items-center gap-2.5 rounded-xl p-3 text-xs font-bold border ${
                  district === "Dhaka"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}>
                  <Truck className="h-4 w-4 shrink-0 text-[#ff6600]" />
                  <span>
                    {district === "Dhaka"
                      ? "Inside Dhaka — Delivery Fee: ৳60"
                      : `Outside Dhaka (${district}) — Delivery Fee: ৳120`}
                  </span>
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Detailed Address *</label>
                <textarea
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#ff6600] font-semibold text-slate-900 resize-none"
                  placeholder="House no, Road no, Village / Area..."
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Payment Method *</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                      paymentMethod === "COD"
                        ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-300/40"
                        : "border-slate-200 hover:border-slate-400 bg-slate-50"
                    }`}
                  >
                    <Banknote className={`h-5 w-5 mt-0.5 shrink-0 ${paymentMethod === "COD" ? "text-emerald-600" : "text-slate-400"}`} />
                    <div>
                      <p className={`text-xs font-black ${paymentMethod === "COD" ? "text-emerald-800" : "text-slate-900"}`}>
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">Pay cash when package arrives</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                      paymentMethod === "ONLINE"
                        ? "border-[#ff6600] bg-orange-50/60 ring-2 ring-orange-300/40"
                        : "border-slate-200 hover:border-slate-400 bg-slate-50"
                    }`}
                  >
                    <Smartphone className={`h-5 w-5 mt-0.5 shrink-0 ${paymentMethod === "ONLINE" ? "text-[#ff6600]" : "text-slate-400"}`} />
                    <div>
                      <p className={`text-xs font-black ${paymentMethod === "ONLINE" ? "text-[#ff6600]" : "text-slate-900"}`}>
                        Online Payment
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">bKash · Nagad · Visa · Card</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* DESKTOP Submit Button */}
              <div className="hidden lg:block pt-2">
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full py-4 bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-2xl text-sm font-black uppercase tracking-wider shadow-lg shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  {loading ? "Processing Order..." : `Confirm Order — ৳${total.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>

          {/* ─── RIGHT: Order Summary (Desktop Side Panel) ─── */}
          <div className="hidden lg:block lg:col-span-2 space-y-5">
            <div className="p-6 border border-slate-200/80 bg-white rounded-3xl shadow-xs space-y-5">
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-100 pb-3">
                Order Items ({cart.length})
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 text-xs scrollbar-none pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
                    <div className="min-w-0 pr-3 flex items-center gap-2.5">
                      {item.image && (
                        <div className="w-10 h-10 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                          <img src={item.image} className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold text-slate-900 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Qty: {item.quantity} × ৳{item.price}</p>
                      </div>
                    </div>
                    <span className="font-black text-slate-950 shrink-0">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#ff6600] font-black uppercase tracking-wider bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer hover:bg-slate-800"
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-rose-500 font-bold">{couponError}</p>}
                {discountAmount > 0 && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Ticket className="h-3 w-3" /> Coupon Applied! −৳{discountAmount}
                  </p>
                )}
              </div>

              {/* Reward Coins */}
              {user && userCoins > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold text-base">🪙</span>
                    <div>
                      <p className="font-bold text-amber-900 text-[11px]">Use Reward Coins</p>
                      <p className="text-[9px] text-amber-700 font-medium">You have {userCoins} coins (Save up to ৳{Math.min(subtotal, userCoins)})</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useCoins}
                    onChange={(e) => setUseCoins(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Price Breakdown */}
              <div className="divide-y divide-slate-100 text-xs font-bold border-t border-slate-100 pt-1">
                <div className="py-2.5 flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-950 font-extrabold">৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="py-2.5 flex justify-between text-slate-500">
                  <span>Delivery Fee</span>
                  <span className="text-slate-950 font-extrabold">{district ? `৳${deliveryCharge}` : "Select district"}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="py-2.5 flex justify-between text-emerald-600 font-black">
                    <span>Total Discount</span>
                    <span>−৳{totalDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="py-3 flex justify-between text-base font-black border-t border-slate-100 text-slate-950">
                  <span>Total Payable</span>
                  <span className="text-[#ff6600] text-lg">৳{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE STICKY BOTTOM ORDER BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</p>
          <p className="text-lg font-black text-slate-950 leading-tight">৳{total.toLocaleString()}</p>
        </div>

        <button
          form="checkout-form"
          type="submit"
          disabled={loading || cart.length === 0}
          className="flex-1 py-3 bg-[#ff6600] hover:bg-[#e65c00] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 max-w-[200px]"
        >
          <Lock className="h-3.5 w-3.5" />
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>

      <Footer />
    </div>
  );
}
