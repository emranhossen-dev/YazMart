/**
 * Utility to print a professional customer order memo / invoice containing Order ID, Customer info, items, totals, and a scanable Code 128 barcode.
 */
export const handlePrintOrderMemo = (order: {
  id: string;
  customer_name: string;
  customer_email: string;
  phone?: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  createdAt: Date | string;
}) => {
  const printWindow = window.open("", "_blank", "width=650,height=700");
  if (!printWindow) {
    alert("Please allow popups to print order invoices.");
    return;
  }

  const id = order.id || "N/A";
  const name = order.customer_name || "N/A";
  const email = order.customer_email || "N/A";
  const phone = order.phone || "N/A";
  const address = order.shipping_address || "N/A";
  const total = order.total_amount || 0;
  const status = order.status || "PENDING";
  const dateStr = new Date(order.createdAt).toLocaleDateString() + " " + new Date(order.createdAt).toLocaleTimeString();

  printWindow.document.write(`
    <html>
      <head>
        <title>Order Invoice #${id}</title>
        <style>
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            color: #000000;
          }
          .invoice-box {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 13px;
            line-height: 1.6;
            color: #333;
            border-radius: 8px;
          }
          .title-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .brand-name {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 1px;
            color: #000000;
          }
          .invoice-label {
            text-align: right;
          }
          .invoice-label h2 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
          }
          .details-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .details-section h4 {
            margin: 0 0 8px 0;
            text-transform: uppercase;
            font-size: 11px;
            color: #888;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
          }
          .details-section p {
            margin: 3px 0;
            font-size: 12px;
          }
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .invoice-table th {
            background-color: #f7f7f7;
            border-bottom: 2px solid #ddd;
            padding: 8px;
            font-weight: bold;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
          }
          .invoice-table td {
            border-bottom: 1px solid #eee;
            padding: 10px 8px;
            font-size: 12px;
          }
          .total-row {
            text-align: right;
            font-size: 14px;
            font-weight: bold;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px solid #eee;
          }
          .barcode-area {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px dashed #ccc;
          }
          #barcode-svg {
            max-width: 250px;
            height: 50px;
          }
          .barcode-val {
            font-family: monospace;
            font-size: 10px;
            margin-top: 5px;
            letter-spacing: 3px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            color: #777;
            margin-top: 30px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="title-section">
            <div class="brand-name">YAZMART</div>
            <div class="invoice-label">
              <h2>Invoice / Memo</h2>
              <span style="font-size: 11px; font-family: monospace; font-weight: bold;">Ref: #${id.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="details-section">
              <h4>Customer Information</h4>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>
            <div class="details-section" style="text-align: right;">
              <h4>Billing & Ship Node</h4>
              <p><strong>Address:</strong> ${address}</p>
              <p><strong>Date Placed:</strong> ${dateStr}</p>
              <p><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">${status}</span></p>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Order Transaction Bundle - Items Checkout Package</td>
                <td style="text-align: right; font-weight: bold;">${total} BDT</td>
              </tr>
            </tbody>
          </table>

          <div class="total-row">
            Grand Total: ${total} BDT
          </div>

          <div class="barcode-area">
            <div id="barcode-target"></div>
            <div class="barcode-val">${id.substring(0, 8).toUpperCase()}</div>
          </div>

          <div class="footer">
            Thank you for shopping at YazMart!
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = function() {
            try {
              var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              svg.setAttribute("id", "barcode-svg");
              document.getElementById("barcode-target").appendChild(svg);
              
              JsBarcode("#barcode-svg", "${id.substring(0, 8).toUpperCase()}", {
                format: "CODE128",
                width: 1.25,
                height: 40,
                displayValue: false,
                margin: 0
              });
              
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            } catch(err) {
              console.error("Barcode rendering failed:", err);
              window.print();
            }
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
