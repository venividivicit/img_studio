import { v2 as cloudinary } from "cloudinary";
import { config } from "../core/config.ts";
import { AppError } from "../lib/errors.ts";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const TRANSFORMATION = "e_background_removal/a_hflip";

export async function processImage(sourceUrl: string): Promise<Uint8Array> {
  const upload = await cloudinary.uploader.upload(sourceUrl, {
    resource_type: "image",
    // temp asset for transformation pipeline
    folder: "img_studio/temp",
  });
  try {
    const transformedUrl = cloudinary.url(upload.public_id, {
      transformation: TRANSFORMATION,
      format: "png",
      resource_type: "image",
    });
    const res = await fetch(transformedUrl);
    if (!res.ok) {
      throw new Error(`Cloudinary fetch failed: ${res.status}`);
    }
    return new Uint8Array(await res.arrayBuffer());
  } catch (error) {
    throw new AppError("PROCESSING_FAILED", "Image processing failed.", 500);
  } finally {
    await cloudinary.uploader.destroy(upload.public_id);
  }
}
