import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

// Generate upload signature for frontend direct upload
export function generateUploadSignature(folder: string = "videos") {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const params = {
    timestamp,
    folder,
    // Remove upload_preset requirement for now
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    config.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    cloudName: config.CLOUDINARY_CLOUD_NAME,
    apiKey: config.CLOUDINARY_API_KEY,
    folder,
  };
}

// Delete a file from Cloudinary
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "video" | "image" = "video"
) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

// Get video details from Cloudinary
export async function getVideoDetails(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
    });
    return result;
  } catch (error) {
    console.error("Error getting video details:", error);
    throw error;
  }
}

export default cloudinary;
