/**
 * Utility to print a professional product label/memo containing SKU, Barcode, price, stock, and a scanable Code 128 barcode.
 */
export const handlePrintMemo = (product: {
  name: string;
  sku: string;
  barcode: string;
  selling_price: number | string;
  current_stock?: number | string;
}) => {
  const printWindow = window.open("", "_blank", "width=600,height=650");
  if (!printWindow) {
    alert("Please allow popups to print product memos.");
    return;
  }

  const name = product.name || "N/A";
  const sku = product.sku || "N/A";
  const barcode = product.barcode || "N/A";
  const price = product.selling_price || "0";
  const stock = product.current_stock !== undefined ? product.current_stock : "N/A";

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Product Memo - YazMart</title>
        <style>
          @page {
            size: auto;
            margin: 0mm;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #ffffff;
            color: #000000;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .memo-card {
            border: 2px solid #000000;
            border-radius: 8px;
            padding: 15px;
            width: 320px;
            box-sizing: border-box;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .brand-title {
            font-size: 16px;
            font-weight: 900;
            text-align: center;
            letter-spacing: 1px;
            border-bottom: 2px solid #000000;
            padding-bottom: 6px;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          .product-title {
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 10px;
            text-align: center;
            line-height: 1.3;
            height: 34px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 15px;
          }
          .info-table td {
            padding: 4px 0;
            border-bottom: 1px dashed #cccccc;
          }
          .info-table td.label {
            color: #555555;
            font-weight: 500;
          }
          .info-table td.value {
            text-align: right;
            font-weight: 700;
          }
          .barcode-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-top: 10px;
            padding-top: 5px;
          }
          #barcode-svg {
            width: 100%;
            max-height: 70px;
          }
          .barcode-footer {
            font-size: 10px;
            font-family: monospace;
            font-weight: bold;
            margin-top: 4px;
            letter-spacing: 2px;
          }
          .footer-text {
            font-size: 8px;
            text-align: center;
            color: #777777;
            margin-top: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="memo-card">
          <div class="brand-title">YAZMART INVENTORY</div>
          <div class="product-title">${name}</div>
          
          <table class="info-table">
            <tr>
              <td class="label">SKU ID:</td>
              <td class="value">${sku}</td>
            </tr>
            <tr>
              <td class="label">Numeric Barcode:</td>
              <td class="value">${barcode}</td>
            </tr>
            <tr>
              <td class="label">Selling Price:</td>
              <td class="value">${price} BDT</td>
            </tr>
            <tr>
              <td class="label">Stock Available:</td>
              <td class="value">${stock} Units</td>
            </tr>
          </table>
          
          <div class="barcode-wrap">
            <div id="barcode-target"></div>
            <div class="barcode-footer">${sku}</div>
          </div>
          
          <div class="footer-text">
            YazMart E-Commerce Platform
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = function() {
            try {
              var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              svg.setAttribute("id", "barcode-svg");
              document.getElementById("barcode-target").appendChild(svg);
              
              JsBarcode("#barcode-svg", "${sku}", {
                format: "CODE128",
                width: 1.25,
                height: 50,
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
