import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/server/config/env";
import { ApiError } from "@/server/utils/http";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const CLOUDINARY_FOLDER_PREFIX = "arcetis";
let cloudinaryConfigured = false;

type SupportedImageFormat = {
  extension: ".png" | ".jpg" | ".gif" | ".webp" | ".avif";
  mimeType: "image/png" | "image/jpeg" | "image/gif" | "image/webp" | "image/avif";
};

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

function getBasename(originalName: string) {
  const dotIndex = originalName.lastIndexOf(".");
  if (dotIndex <= 0) {
    return originalName || "image";
  }

  return originalName.slice(0, dotIndex) || "image";
}

function matchesAscii(bytes: Uint8Array, offset: number, value: string) {
  return value.split("").every((character, index) => bytes[offset + index] === character.charCodeAt(0));
}

export function detectImageFormat(bytes: Uint8Array): SupportedImageFormat | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return {
      extension: ".png",
      mimeType: "image/png"
    };
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return {
      extension: ".jpg",
      mimeType: "image/jpeg"
    };
  }

  if (bytes.length >= 6 && (matchesAscii(bytes, 0, "GIF87A") || matchesAscii(bytes, 0, "GIF89A"))) {
    return {
      extension: ".gif",
      mimeType: "image/gif"
    };
  }

  if (
    bytes.length >= 12 &&
    matchesAscii(bytes, 0, "RIFF") &&
    matchesAscii(bytes, 8, "WEBP")
  ) {
    return {
      extension: ".webp",
      mimeType: "image/webp"
    };
  }

  if (
    bytes.length >= 12 &&
    matchesAscii(bytes, 4, "ftyp") &&
    (matchesAscii(bytes, 8, "avif") || matchesAscii(bytes, 8, "avis"))
  ) {
    return {
      extension: ".avif",
      mimeType: "image/avif"
    };
  }

  return null;
}

function buildFilename(originalName: string, extension: SupportedImageFormat["extension"]) {
  return `${Date.now()}-${randomUUID()}-${sanitizeFilename(getBasename(originalName))}${extension}`;
}

function getCloudinaryUploader() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new ApiError(500, "Image storage is not configured");
  }

  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true
    });
    cloudinaryConfigured = true;
  }

  return cloudinary.uploader;
}

function toPublicId(folder: string, filename: string) {
  const basename = getBasename(filename);
  return `${CLOUDINARY_FOLDER_PREFIX}/${folder}/${basename}`;
}

export function getManagedCloudinaryPublicId(imageUrl?: string | null, cloudName = env.CLOUDINARY_CLOUD_NAME) {
  if (!imageUrl || !cloudName) {
    return null;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return null;
  }

  if (parsedUrl.hostname !== "res.cloudinary.com") {
    return null;
  }

  const segments = parsedUrl.pathname.split("/").filter(Boolean);

  if (
    segments.length < 5 ||
    segments[0] !== cloudName ||
    segments[1] !== "image" ||
    segments[2] !== "upload"
  ) {
    return null;
  }

  const prefixIndex = segments.indexOf(CLOUDINARY_FOLDER_PREFIX);

  if (prefixIndex === -1) {
    return null;
  }

  const publicIdSegments = segments.slice(prefixIndex);

  if (!publicIdSegments.length) {
    return null;
  }

  const lastSegment = publicIdSegments[publicIdSegments.length - 1] ?? "";
  const extensionIndex = lastSegment.lastIndexOf(".");
  publicIdSegments[publicIdSegments.length - 1] =
    extensionIndex === -1 ? lastSegment : lastSegment.slice(0, extensionIndex);

  return publicIdSegments.join("/");
}

async function saveToCloudinary(
  folder: string,
  buffer: Buffer,
  filename: string
) {
  const uploader = getCloudinaryUploader();

  return new Promise<string>((resolve, reject) => {
    const stream = uploader.upload_stream(
      {
        public_id: toPublicId(folder, filename),
        resource_type: "image",
        overwrite: false,
        unique_filename: false,
        use_filename: false
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          console.error("Cloudinary upload failed", error);
          reject(new ApiError(502, "Image upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

export async function deleteManagedImage(imageUrl?: string | null) {
  const publicId = getManagedCloudinaryPublicId(imageUrl);

  if (!publicId) {
    return false;
  }

  try {
    const uploader = getCloudinaryUploader();
    const result = await uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true
    });

    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error("Cloudinary delete failed", error);
    return false;
  }
}

export async function deleteReplacedManagedImage(previousUrl?: string | null, nextUrl?: string | null) {
  const previousPublicId = getManagedCloudinaryPublicId(previousUrl);
  const nextPublicId = getManagedCloudinaryPublicId(nextUrl);

  if (!previousPublicId || previousPublicId === nextPublicId) {
    return false;
  }

  return deleteManagedImage(previousUrl);
}

export async function storeImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) {
    throw new ApiError(400, "Only image files are allowed");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(400, "Image must be 5MB or smaller");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const format = detectImageFormat(new Uint8Array(buffer));

  if (!format) {
    throw new ApiError(400, "Only PNG, JPEG, GIF, WebP, or AVIF images are allowed");
  }

  const filename = buildFilename(file.name, format.extension);
  return saveToCloudinary(folder, buffer, filename);
}
