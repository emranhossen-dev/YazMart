/**
 * Utility to print professional customer order memos / invoices for single or multiple orders (Batch Print).
 * Supports Date-wise printing, Status filtered printing, itemized lists, pricing, shipping logistics, and scannable CODE128 barcodes.
 */

export interface PrintableOrder {
  id: string;
  customer_name: string;
  customer_email?: string;
  phone?: string;
  shipping_address?: string;
  total_amount: number;
  status: string;
  createdAt: Date | string;
  items?: any;
  sub_orders?: any[];
  payment_method?: string;
  delivery_charge?: number;
  discount?: number;
  subtotal?: number;
}

function parseOrderItems(rawItems: any): any[] {
  try {
    if (typeof rawItems === "string") {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return parsed.list || [];
    }
    if (Array.isArray(rawItems)) return rawItems;
    if (rawItems && typeof rawItems === "object") return rawItems.list || [];
  } catch (e) {
    console.warn("Item parsing error:", e);
  }
  return [];
}

export const handlePrintOrderMemo = (order: PrintableOrder) => {
  handleBatchPrintOrderMemos([order]);
};

export const handleBatchPrintOrderMemos = (orders: PrintableOrder[]) => {
  if (!orders || orders.length === 0) {
    alert("No orders selected for printing.");
    return;
  }

  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Please allow popups in your browser to print order invoices.");
    return;
  }

  const invoicesHtml = orders
    .map((order, idx) => {
      const id = order.id || "N/A";
      const shortId = id.slice(0, 8).toUpperCase();
      const name = order.customer_name || "Valued Customer";
      const email = order.customer_email || "N/A";
      const phone = order.phone || "N/A";
      const address = order.shipping_address || "N/A";
      const total = Number(order.total_amount || 0);
      const status = order.status || "PENDING";
      const paymentMethod = order.payment_method || "Cash On Delivery (COD)";

      const items = parseOrderItems(order.items);
      const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const itemsRowsHtml = items.length > 0
        ? items
            .map((item: any, i: number) => {
              const itemTitle = item.name || item.title || `Item #${i + 1}`;
              const itemQty = Number(item.quantity || 1);
              const itemPrice = Number(item.price || 0);
              const itemTotal = itemPrice * itemQty;
              const variant = [item.color, item.size, item.variantName].filter(Boolean).join(" / ");

              return `
                <tr>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb;">
                    <div style="font-weight: 700; color: #111827; font-size: 13px;">${itemTitle}</div>
                    ${variant ? `<div style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Variant: ${variant}</div>` : ""}
                  </td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 700; font-family: monospace;">${itemQty}</td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: monospace;">৳${itemPrice.toLocaleString()}</td>
                  <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 800; font-family: monospace; color: #2563eb;">৳${itemTotal.toLocaleString()}</td>
                </tr>
              `;
            })
            .join("")
        : `
            <tr>
              <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">Standard Purchase Checkout Package</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">1</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">৳${total.toLocaleString()}</td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 800; color: #2563eb;">৳${total.toLocaleString()}</td>
            </tr>
          `;

      return `
        <div class="invoice-page">
          <div class="invoice-box">
            <!-- Title / Header -->
            <div class="header">
              <div class="brand">
                <img src="/logo yazmart.png" alt="YazMart Logo" style="height: 46px; width: auto; max-width: 220px; object-fit: contain; display: block; margin-bottom: 4px;" />
                <p style="margin: 2px 0 0 0; font-size: 10px; color: #6b7280; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">Official Purchase Memo</p>
              </div>
              <div class="invoice-meta">
                <h2>INVOICE</h2>
                <div class="ref-badge">REF: #${shortId}</div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${dateStr}</div>
              </div>
            </div>

            <!-- Customer & Shipping Logistics -->
            <div class="details-grid">
              <div class="card">
                <div class="card-title">Customer Information</div>
                <div class="card-val" style="font-size: 14px; font-weight: 800; color: #111827;">${name}</div>
                <div class="card-val">📧 ${email}</div>
                <div class="card-val">📞 ${phone}</div>
              </div>
              <div class="card">
                <div class="card-title">Shipping Logistics & Payment</div>
                <div class="card-val">📍 <strong>Address:</strong> ${address}</div>
                <div class="card-val">💳 <strong>Payment Method:</strong> ${paymentMethod}</div>
                <div class="card-val">📦 <strong>Status:</strong> <span class="status-tag status-${status.toLowerCase()}">${status}</span></div>
              </div>
            </div>

            <!-- Itemized Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align: left;">Product Item Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            <!-- Summary Totals -->
            <div class="totals-container">
              <div class="total-row">
                <span>Grand Total Amount:</span>
                <span class="total-price">৳${total.toLocaleString()}</span>
              </div>
            </div>

            <!-- Barcode Area -->
            <div class="barcode-wrapper">
              <svg id="barcode-svg-${idx}"></svg>
              <div class="barcode-label">#${shortId}</div>
            </div>

            <!-- Footer Note -->
            <div class="footer">
              <p style="margin: 0; font-weight: 700; color: #374151;">Thank you for shopping with YazMart!</p>
              <p style="margin: 3px 0 0 0; font-size: 10px; color: #9ca3af;">For queries or returns, visit yazmart.com or contact shop@yazmart.com</p>
            </div>
          </div>
        </div>
        ${idx < orders.length - 1 ? '<div class="page-break"></div>' : ""}
      `;
    })
    .join("");

  const scriptBarcodeCalls = orders
    .map(
      (order, idx) => `
      try {
        JsBarcode("#barcode-svg-${idx}", "${(order.id || "ORDER").slice(0, 8).toUpperCase()}", {
          format: "CODE128",
          width: 1.5,
          height: 45,
          displayValue: false,
          margin: 0
        });
      } catch(err) {
        console.warn("Barcode error for index ${idx}:", err);
      }
    `
    )
    .join("\n");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Batch Invoice Print (${orders.length} Invoices) - YazMart</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
            color: #111827;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-page {
            padding: 10px;
          }
          .invoice-box {
            max-width: 750px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #111827;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -0.5px;
          }
          .invoice-meta {
            text-align: right;
          }
          .invoice-meta h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 1px;
            color: #1f2937;
          }
          .ref-badge {
            display: inline-block;
            margin-top: 4px;
            padding: 2px 8px;
            background-color: #eff6ff;
            color: #2563eb;
            font-weight: 800;
            font-family: monospace;
            font-size: 12px;
            border-radius: 6px;
            border: 1px solid #bfdbfe;
          }
          .details-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
          }
          .card {
            background-color: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 10px;
            padding: 14px;
          }
          .card-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #6b7280;
            margin-bottom: 6px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          .card-val {
            font-size: 12px;
            margin-top: 4px;
            color: #374151;
            line-height: 1.4;
          }
          .status-tag {
            font-weight: 800;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .status-delivered, .status-completed { background: #dcfce7; color: #15803d; }
          .status-confirmed, .status-taken { background: #fef3c7; color: #b45309; }
          .status-shipped, .status-processed { background: #e0e7ff; color: #4338ca; }
          .status-cancelled { background: #ffe4e6; color: #be123c; }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .items-table th {
            background-color: #f3f4f6;
            border-bottom: 2px solid #e5e7eb;
            padding: 10px 8px;
            font-weight: 800;
            font-size: 10px;
            text-transform: uppercase;
            color: #4b5563;
          }
          .totals-container {
            border-top: 2px solid #111827;
            padding-top: 12px;
            margin-bottom: 20px;
            text-align: right;
          }
          .total-row {
            font-size: 18px;
            font-weight: 900;
            color: #111827;
          }
          .total-price {
            color: #2563eb;
            margin-left: 12px;
            font-family: monospace;
          }
          .barcode-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px dashed #d1d5db;
          }
          .barcode-wrapper svg {
            max-width: 220px;
            height: 45px;
          }
          .barcode-label {
            font-family: monospace;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 2px;
            margin-top: 4px;
            color: #4b5563;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #f3f4f6;
          }

          @media print {
            body {
              background: #ffffff;
            }
            .invoice-box {
              border: none;
              box-shadow: none;
              padding: 0;
            }
            .page-break {
              display: block;
              page-break-after: always;
              break-after: page;
            }
          }
        </style>
      </head>
      <body>
        ${invoicesHtml}

        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = function() {
            ${scriptBarcodeCalls}
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
