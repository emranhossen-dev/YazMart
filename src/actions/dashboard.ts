"use server";

import { prisma } from "../lib/prisma";

// ১. ড্যাশবোর্ডের রিয়াল-টাইম পরিসংখ্যান বা স্ট্যাটস নিয়ে আসা
export async function getDashboardStats() {
  try {
    const [productCount, categoryCount, customerCount] = await Promise.all([
      prisma.products.count(),
      prisma.categories.count(),
      prisma.profiles.count(), // টোটাল রেজিস্টার্ড প্রোফাইল/কাস্টমার সংখ্যা
    ]);

    return {
      products: productCount,
      categories: categoryCount,
      customers: customerCount,
      revenue: 45231.89, // ডেমো রেভিনিউ ভ্যালু ট্র্যাকিং
    };
  } catch (error) {
    console.error("❌ DASHBOARD STATS ERROR:", error);
    return { products: 0, categories: 0, customers: 0, revenue: 0 };
  }
}

// ২. সব কাস্টমারদের প্রোফাইল লিস্ট নিয়ে আসা
export async function getCustomersList() {
  try {
    const profiles = await prisma.profiles.findMany({
      orderBy: { id: "desc" },
      include: {
        users: {
          select: {
            email: true,
            phone: true
          }
        },
        roles: true
      }
    });

    const orderCounts = await prisma.orderMatrix.groupBy({
      by: ['customer_email'],
      _count: {
        id: true
      }
    });

    const orderCountMap = new Map();
    orderCounts.forEach(o => {
      if (o.customer_email) orderCountMap.set(o.customer_email, o._count.id);
    });

    const registeredEmails = new Set(profiles.map(p => p.users?.email).filter(Boolean));
    
    // Fetch unique customer info from OrderMatrix for guests
    const guestOrders = await prisma.orderMatrix.findMany({
      select: {
        customer_email: true,
        customer_name: true,
        phone: true,
      },
      distinct: ['customer_email'],
    });

    const guests = guestOrders
      .filter(g => g.customer_email && !registeredEmails.has(g.customer_email))
      .map((g, index) => ({
        id: `GUEST-${index}`,
        full_name: g.customer_name || "Guest User",
        role_id: null,
        roles: { name: "guest" },
        email: g.customer_email,
        phone: g.phone || "No phone number",
        order_count: orderCountMap.get(g.customer_email) || 0
      }));

    const registeredCustomers = profiles.map(p => ({
      id: p.id,
      full_name: p.full_name,
      role_id: p.role_id,
      roles: p.roles,
      email: p.users?.email || null,
      phone: p.users?.phone || null,
      order_count: orderCountMap.get(p.users?.email) || 0
    }));

    const customers = [...registeredCustomers, ...guests];

    return { customers };
  } catch (error) {
    console.error("❌ FETCH CUSTOMERS ERROR:", error);
    return { error: "Failed to load customers.", customers: [] };
  }
}

// ৩. কাস্টমারের ডিটেইলস এবং অর্ডার হিস্ট্রি নিয়ে আসা
export async function getCustomerDetails(email: string) {
  if (!email) return { error: "Email is required to fetch customer history." };
  
  try {
    const orders = await prisma.orderMatrix.findMany({
      where: { customer_email: email },
      orderBy: { createdAt: "desc" }
    });

    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

    return { 
      success: true, 
      orders, 
      analytics: {
        totalOrders: orders.length,
        totalSpent,
        avgOrderValue
      }
    };
  } catch (error) {
    console.error("❌ GET CUSTOMER DETAILS ERROR:", error);
    return { error: "Failed to fetch customer history." };
  }
}
