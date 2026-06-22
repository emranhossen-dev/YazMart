"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads folder inside public if not exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Sanitize filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = file.name.split(".").pop();
    const fileName = `${uniqueSuffix}.${fileExt}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("❌ IMAGE UPLOAD ERROR:", error);
    return { error: `Upload failed: ${error?.message || "Internal Server Error"}` };
  }
}
