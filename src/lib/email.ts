export interface OrderInvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  phone: string;
  totalAmount: number;
  subtotal?: number;
  deliveryCharge?: number;
  discount?: number;
  paymentMethod?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  createdAt?: Date | string;
}

export async function sendOrderInvoiceEmail(data: OrderInvoiceData) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY is not configured in .env. Skipping email dispatch.");
    return { success: false, reason: "RESEND_API_KEY_MISSING" };
  }

  const itemsTableHtml = data.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; vertical-align: middle;">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px; vertical-align: middle; margin-right: 8px;" />`
              : ""
          }
          <span style="font-weight: 600; color: #111827;">${item.name}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; color: #4b5563; font-weight: 500;">x${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #111827; font-weight: 700;">৳${(
          item.price * item.quantity
        ).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice #${data.orderId.slice(0, 8).toUpperCase()}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px 12px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background-color: #09090b; padding: 24px 28px; text-align: center;">
        <img src="https://yazmart.com/logo%20yazmart.png" alt="YazMart Logo" style="height: 44px; width: auto; max-width: 220px; object-fit: contain; margin: 0 auto 6px auto; display: block; background-color: #ffffff; padding: 6px 14px; border-radius: 10px;" />
        <p style="color: #a1a1aa; margin: 6px 0 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Official Purchase Invoice</p>
      </div>

      <!-- Content -->
      <div style="padding: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px dashed #f3f4f6; padding-bottom: 16px;">
          <div>
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700;">Customer</p>
            <h3 style="margin: 4px 0 0 0; font-size: 16px; font-weight: 800; color: #111827;">${data.customerName}</h3>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #4b5563;">${data.customerEmail}</p>
            <p style="margin: 2px 0 0 0; font-size: 13px; color: #4b5563;">📞 ${data.phone}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700;">Order ID</p>
            <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 800; font-family: monospace; color: #2563eb;">#${data.orderId.slice(0, 8).toUpperCase()}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">${formattedDate}</p>
          </div>
        </div>

        <div style="margin-bottom: 24px; background-color: #f9fafb; padding: 16px; border-radius: 12px; border: 1px solid #f3f4f6;">
          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700;">Shipping Address</p>
          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1f2937;">${data.shippingAddress}</p>
          <p style="margin: 8px 0 0 0; font-size: 11px; text-transform: uppercase; color: #6b7280; font-weight: 700;">Payment Method</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: 700; color: #059669;">${data.paymentMethod || "Cash On Delivery (COD)"}</p>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb; background-color: #f9fafb;">
              <th style="padding: 10px 8px; text-align: left; color: #6b7280; font-size: 11px; text-transform: uppercase;">Product</th>
              <th style="padding: 10px 8px; text-align: center; color: #6b7280; font-size: 11px; text-transform: uppercase;">Qty</th>
              <th style="padding: 10px 8px; text-align: right; color: #6b7280; font-size: 11px; text-transform: uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableHtml}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="border-top: 2px solid #f3f4f6; pt: 16px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #4b5563;">
            <span>Subtotal</span>
            <span style="font-weight: 600;">৳${(data.subtotal ?? data.totalAmount).toLocaleString()}</span>
          </div>
          ${
            data.deliveryCharge !== undefined
              ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #4b5563;">
            <span>Delivery Fee</span>
            <span style="font-weight: 600;">৳${data.deliveryCharge.toLocaleString()}</span>
          </div>`
              : ""
          }
          ${
            data.discount
              ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #dc2626;">
            <span>Discount</span>
            <span style="font-weight: 600;">-৳${data.discount.toLocaleString()}</span>
          </div>`
              : ""
          }
          <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 2px solid #111827; font-size: 18px; font-weight: 900; color: #111827;">
            <span>Total Paid</span>
            <span style="color: #2563eb;">৳${data.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div style="margin-top: 32px; padding: 16px; background-color: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe; text-align: center;">
          <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1d4ed8;">🚚 Track Your Order Live</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #3b82f6;">Log in to your YazMart account profile to view live parcel updates.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280;">Thank you for shopping with YazMart!</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af;">Questions? Contact shop@yazmart.com</p>
      </div>

    </div>
  </body>
  </html>
  `;

    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "YazMart Shop <shop@yazmart.com>";

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [data.customerEmail],
          subject: `Order Invoice #${data.orderId.slice(0, 8).toUpperCase()} - YazMart`,
          html: emailHtml,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        console.error("❌ Resend Email API Error:", resData);
        return { success: false, error: resData };
      }

      console.log(`✅ Invoice email sent successfully via Resend from ${fromEmail}:`, resData);
      return { success: true, resData };
    } catch (err) {
      console.error("❌ Failed to send Resend email:", err);
      return { success: false, error: err };
    }
  }
