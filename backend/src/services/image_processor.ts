import { v2 as cloudinary } from "cloudinary";
import { config } from "../core/config.ts";
import { AppError } from "../lib/errors.ts";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const TEMP_FOLDER = "img_studio/temp";
const POLL_ATTEMPTS = 20;
const POLL_DELAY_MS = 2000;

/** Chained: remove background first, then flip. Output PNG for transparency. */
const PROCESSED_TRANSFORMATION = [
  { effect: "background_removal" },
  { angle: "hflip" },
] as const;

async function fetchImageBytes(url: string): Promise<Uint8Array> {
  for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt++) {
    const res = await fetch(url);
    if (res.ok) {
      return new Uint8Array(await res.arrayBuffer());
    }

    // Background removal is generated on first delivery request.
    if (res.status === 423 || res.status === 503) {
      await Bun.sleep(POLL_DELAY_MS);
      continue;
    }

    const body = await res.text().catch(() => "");
    console.error("[cloudinary] download failed", {
      status: res.status,
      statusText: res.statusText,
      url,
      body: body.slice(0, 500),
    });
    throw new Error(`Cloudinary download failed: ${res.status}`);
  }

  throw new Error("Cloudinary download timed out");
}

function processedDeliveryUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "image",
    type: "upload",
    transformation: [...PROCESSED_TRANSFORMATION],
    format: "png",
    secure: true,
  });
}

export async function processImage(sourceUrl: string): Promise<Uint8Array> {
  let publicId: string | undefined;

  try {
    // Store original in Cloudinary temporarily; do not use legacy upload-time removal.
    const result = await cloudinary.uploader.upload(sourceUrl, {
      resource_type: "image",
      folder: TEMP_FOLDER,
      eager: [
        {
          transformation: [...PROCESSED_TRANSFORMATION],
          format: "png",
        },
      ],
      eager_async: false,
    });

    publicId = result.public_id;

    const eagerUrl = result.eager?.[0]?.secure_url;
    const deliveryUrl = processedDeliveryUrl(publicId);
    const downloadUrl = eagerUrl ?? deliveryUrl;

    console.info("[processImage] downloading transformed asset", {
      publicId,
      usedEager: Boolean(eagerUrl),
    });

    return await fetchImageBytes(downloadUrl);
  } catch (error) {
    console.error("[processImage]", error);
    if (error instanceof AppError) throw error;
    throw new AppError("PROCESSING_FAILED", "Image processing failed.", 500);
  } finally {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId).catch((err) => {
        console.error("[processImage] destroy failed", { publicId, err });
      });
    }
  }
}
