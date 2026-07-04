"use client";

import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  format?: "CODE128" | "EAN13" | "CODE39";
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export default function BarcodeRenderer({
  value,
  format = "CODE128",
  width = 1.25,
  height = 40,
  displayValue = true,
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          background: "#ffffff",
          lineColor: "#000000",
          fontSize: 10,
          margin: 10,
        });
      } catch (err) {
        console.error("Barcode rendering error:", err);
      }
    }
  }, [value, format, width, height, displayValue]);

  if (!value) {
    return (
      <div className="flex h-16 items-center justify-center border border-dashed border-[var(--border)] rounded-lg text-[10px] text-[var(--muted-foreground)]">
        No Code
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center bg-white border border-[var(--border)] rounded-lg overflow-hidden p-1">
      <svg ref={svgRef} className="max-w-full" />
    </div>
  );
}
