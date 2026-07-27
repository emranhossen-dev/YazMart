import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // 1. Attempt writing to local disk
      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${uniqueSuffix}.${fileExt}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);
      return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
    } catch (fsErr: any) {
      console.warn("⚠️ Disk write failed, falling back to Base64 Data URL:", fsErr?.message);
      // 2. Fallback to Base64 Data URL for serverless / read-only filesystems
      const mimeType = file.type || "image/jpeg";
      const base64String = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64String}`;
      return NextResponse.json({ success: true, url: dataUrl });
    }
  } catch (error: any) {
    console.error("❌ IMAGE UPLOAD ROUTE ERROR:", error);
    return NextResponse.json({ error: `Upload failed: ${error?.message || "Internal Server Error"}` }, { status: 500 });
  }
}
