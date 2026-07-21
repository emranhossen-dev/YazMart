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
  Lock, Ticket, Truck, MapPin, Banknote, Smartphone
} from "lucide-react";
import { validateCoupon } from "@/actions/coupons";
import { getUserCoins } from "@/actions/reviews";

// ───────────────────────────────────────────────
// Bangladesh full location data
// ───────────────────────────────────────────────
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
  // Dhaka Division
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
  Gazipur: [
    "Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Tongi",
  ],
  Narayanganj: [
    "Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon",
  ],
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

  // Chittagong Division
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

  // Rajshahi Division
  Rajshahi: ["Rajshahi Sadar", "Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"],
  Bogura: ["Bogura Sadar", "Adamdighi", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatola"],
  "Chapai Nawabganj": ["Chapai Nawabganj Sadar", "Bholahat", "Gomastapur", "Nachole", "Shibganj"],
  Joypurhat: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"],
  Naogaon: ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mahadebpur", "Mohadevpur", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
  Natore: ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Singra"],
  Pabna: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"],
  Sirajganj: ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Tarash", "Ullapara"],

  // Khulna Division
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

  // Barishal Division
  Barishal: ["Barishal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gournadi", "Hijla", "Mehendiganj", "Muladi", "Wazirpur"],
  Barguna: ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali"],
  Bhola: ["Bhola Sadar", "Borhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
  Jhalokati: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  Patuakhali: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali"],
  Pirojpur: ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"],

  // Sylhet Division
  Sylhet: ["Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmaninagar", "South Surma"],
  Habiganj: ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj"],
  Moulvibazar: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"],
  Sunamganj: ["Sunamganj Sadar", "Bishwamvarpur", "Chhatak", "Derai", "Dharmapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur"],

  // Rangpur Division
  Rangpur: ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
  Dinajpur: ["Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
  Gaibandha: ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
  Kurigram: ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Fulbari", "Nageshwari", "Rajarhat", "Rowmari", "Ulipur"],
  Lalmonirhat: ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"],
  Nilphamari: ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"],
  Panchagarh: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"],
  Thakurgaon: ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"],

  // Mymensingh Division
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
  const { cart, clearCart, wishlist } = useShopStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  
  // Coins discount (1 coin = 1 Taka discount)
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
        // Go to payment instruction page first
        router.push(`/checkout/payment/${res.orderId}`);
      } else {
        // COD → go straight to confirmation
        router.push(`/checkout/confirmation/${res.orderId}`);
      }
    }


    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Steps */}
        <div className="max-w-xl mx-auto flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="w-6 h-6 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-black text-emerald-600">✓</span>
            <span>Shopping Bag</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-500 mx-4" />
          <div className="flex items-center gap-2 text-[var(--foreground)]">
            <span className="w-6 h-6 rounded-full border-2 border-[var(--foreground)] flex items-center justify-center text-[10px] font-black">2</span>
            <span>Checkout</span>
          </div>
          <div className="flex-1 h-0.5 bg-zinc-200 mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border-2 border-zinc-200 flex items-center justify-center text-[10px] font-black">3</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
              <CreditCard className="h-7 w-7" /> Checkout
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Enter your delivery details and confirm your order.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-5 items-start">
          {/* ─── LEFT: Shipping Form ─── */}
          <div className="lg:col-span-3 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase text-[var(--foreground)] tracking-wider border-b border-[var(--border)] pb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Shipping Details
            </h3>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* Name + Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] font-medium transition-all"
                    placeholder="e.g. Emran Hossen"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] font-medium transition-all"
                    placeholder="e.g. emran@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] font-medium transition-all"
                  placeholder="e.g. 01700000000"
                />
              </div>

              {/* Division */}
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1.5">Division *</label>
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    setDistrict("");
                    setThana("");
                  }}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] font-medium transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Division</option>
                  {BD_DIVISIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* District + Thana */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1.5">District *</label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setThana("");
                    }}
                    required
                    disabled={!division}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>Select District</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1.5">Thana / Upazila *</label>
                  <select
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    required
                    disabled={!district}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                <div className={`flex items-center gap-3 rounded-xl p-3 text-xs font-semibold border ${
                  district === "Dhaka"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}>
                  <Truck className="h-4 w-4 shrink-0" />
                  {district === "Dhaka"
                    ? "Inside Dhaka — Delivery Charge: ৳60"
                    : `Outside Dhaka (${district}) — Delivery Charge: ৳120`}
                  <MapPin className="h-3.5 w-3.5 ml-auto shrink-0" />
                </div>
              )}

              {/* Address */}
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-1.5">House / Road / Area *</label>
                <textarea
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] font-medium transition-all resize-none"
                  placeholder="House no, road no, area / mohalla"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-500 mb-2">Payment Method *</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all text-left ${
                      paymentMethod === "COD"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-[var(--border)] hover:border-[var(--foreground)] bg-[var(--background)]"
                    }`}
                  >
                    <Banknote className={`h-5 w-5 mt-0.5 shrink-0 ${paymentMethod === "COD" ? "text-emerald-600" : "text-zinc-400"}`} />
                    <div>
                      <p className={`text-xs font-bold ${paymentMethod === "COD" ? "text-emerald-700" : "text-[var(--foreground)]"}`}>
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Pay when you receive the package</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all text-left ${
                      paymentMethod === "ONLINE"
                        ? "border-blue-500 bg-blue-50"
                        : "border-[var(--border)] hover:border-[var(--foreground)] bg-[var(--background)]"
                    }`}
                  >
                    <Smartphone className={`h-5 w-5 mt-0.5 shrink-0 ${paymentMethod === "ONLINE" ? "text-blue-600" : "text-zinc-400"}`} />
                    <div>
                      <p className={`text-xs font-bold ${paymentMethod === "ONLINE" ? "text-blue-700" : "text-[var(--foreground)]"}`}>
                        Online Payment
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">bKash · Nagad · Visa · MasterCard</p>
                    </div>
                  </button>
                </div>

                {/* Online payment note */}
                {paymentMethod === "ONLINE" && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[10px] text-blue-700 font-medium">
                    ℹ️ After placing your order, our team will contact you with payment instructions via phone or WhatsApp.
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  type="submit"
                  disabled={loading || cart.length === 0}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="h-4 w-4" />
                  {loading ? "Processing..." : `Confirm Order — ৳${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                </button>
                <p className="text-center text-[10px] text-zinc-400 mt-3">
                  Payment method: <strong>{paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</strong>
                </p>
              </div>
            </form>
          </div>

          {/* ─── RIGHT: Order Summary ─── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 border border-[var(--border)] bg-[var(--card)] rounded-2xl shadow-sm space-y-5">
              <h3 className="text-xs font-bold uppercase text-[var(--foreground)] tracking-wider border-b border-[var(--border)] pb-3">
                Order Summary
              </h3>

              {/* Cart items */}
              <div className="max-h-56 overflow-y-auto space-y-3 text-xs scrollbar-none pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-b-0">
                    <div className="min-w-0 pr-3 flex items-center gap-2">
                      {item.image && (
                        <div className="w-9 h-9 rounded-lg border border-[var(--border)] bg-white flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                          <img src={item.image} className="max-h-full max-w-full object-contain" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[var(--foreground)] line-clamp-1">{item.name}</p>
                        <p className="text-[9px] text-[var(--muted-foreground)] font-mono mt-0.5">Qty: {item.quantity} × ৳{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[var(--foreground)] shrink-0">৳{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--foreground)] font-bold uppercase tracking-wider bg-[var(--background)]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode}
                    className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-rose-500 font-semibold mt-1.5">{couponError}</p>}
                {discountAmount > 0 && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                    <Ticket className="h-3 w-3" /> Coupon Applied! −৳{discountAmount.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Reward Coins */}
              {user && userCoins > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold text-sm">🪙</span>
                    <div>
                      <p className="font-bold text-amber-900 dark:text-amber-200 text-[11px]">Use Reward Coins</p>
                      <p className="text-[9px] text-amber-700 dark:text-amber-400 font-medium">You have {userCoins} coins (Save up to ৳{Math.min(subtotal, userCoins)})</p>
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

              {/* Price breakdown */}
              <div className="divide-y divide-[var(--border)] text-xs font-medium border-t border-[var(--border)] pt-1">
                <div className="py-3 flex justify-between text-[var(--muted-foreground)]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[var(--foreground)]">৳{subtotal.toFixed(2)}</span>
                </div>

                <div className="py-3 flex justify-between text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" />
                    Delivery Charge
                    {district && <span className="text-[9px] ml-1 text-zinc-400">({district === "Dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>}
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {district ? `৳${deliveryCharge.toFixed(2)}` : <span className="text-zinc-400">Select district</span>}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="py-3 flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>−৳{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="py-4 flex justify-between text-sm font-bold border-t border-[var(--border)] text-[var(--foreground)]">
                  <span>Total Amount</span>
                  <span className="text-base" style={{ color: "var(--primary)" }}>
                    ৳{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--muted-foreground)] bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>Your order information is securely encrypted.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
