import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import streamifier from "streamifier";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../config/secrets.js";

const hasCloudinaryConfig =
  !!CLOUDINARY_CLOUD_NAME && !!CLOUDINARY_API_KEY && !!CLOUDINARY_API_SECRET;

if (!hasCloudinaryConfig) {
  throw new Error("Cloudinary is not configured. Check your env variables.");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Generic: upload a buffer to Cloudinary via upload_stream
 * - resource_type: 'auto' | 'raw' | 'image' | 'video' | etc
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  options?: {
    folder?: string;
    public_id?: string;
    resource_type?: "auto" | "raw" | "image" | "video" | string;
  },
  client = cloudinary,
  uploaderFactory: (
    opts: any,
    cb: (err?: UploadApiErrorResponse, res?: UploadApiResponse) => void,
  ) => NodeJS.WritableStream = client.uploader.upload_stream.bind(
    client.uploader,
  ),
): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = uploaderFactory(
      {
        folder: options?.folder,
        public_id: options?.public_id,
        resource_type: options?.resource_type ?? "auto",
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Empty response from Cloudinary"));
        resolve(result);
      },
    );

    streamifier
      .createReadStream(buffer)
      .pipe(uploadStream as unknown as NodeJS.WritableStream);
  });
};

export const uploadImageBuffer = async (
  buffer: Buffer,
  options?: { folder?: string; public_id?: string },
  client = cloudinary,
) => {
  // resource_type 'auto' is suitable for images
  return uploadBufferToCloudinary(
    buffer,
    { ...options, resource_type: "auto" },
    client,
  );
};

export const removeImage = async (publicId: string, client = cloudinary) => {
  try {
    const result = await client.uploader.destroy(publicId);
    return result;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error("Internal Server Error (cloudinary removeImage)");
  }
};

export const removeMultipleImages = async (
  publicIds: string[],
  client = cloudinary,
) => {
  try {
    const result = await client.api.delete_resources(publicIds);
    return result;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error("Internal Server Error (cloudinary removeMultipleImages)");
  }
};

export default {
  uploadBufferToCloudinary,
  uploadImageBuffer,
  removeImage,
  removeMultipleImages,
};
