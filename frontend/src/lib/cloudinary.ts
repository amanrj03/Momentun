import { UploadProgress } from "@/lib/types";
import { apiClient } from "@/lib/api";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  duration?: number;
  format: string;
  resource_type: string;
}

export async function uploadToCloudinary(
  file: File,
  type: "video" | "image",
  onProgress?: (progress: UploadProgress) => void
): Promise<CloudinaryUploadResult> {
  return new Promise(async (resolve, reject) => {
    try {
      // Get upload signature from backend
      const signatureResponse = await apiClient.getUploadSignature(type);
      
      if (!signatureResponse.success || !signatureResponse.data) {
        throw new Error("Failed to get upload signature");
      }

      const { signature, timestamp, cloudName, apiKey, folder } = signatureResponse.data as any;
      console.log("Upload signature data:", { signature, timestamp, cloudName, apiKey, folder });

      // Prepare form data for Cloudinary (signed upload)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("folder", folder);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          console.log("Cloudinary upload successful:", response);
          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id,
            duration: response.duration,
            format: response.format,
            resource_type: response.resource_type,
          });
        } else {
          console.error("Cloudinary upload failed:", xhr.status, xhr.responseText);
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed due to network error"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was cancelled"));
      });

      // Upload to Cloudinary
      const resourceType = type === "video" ? "video" : "image";
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
      xhr.send(formData);

    } catch (error) {
      reject(error);
    }
  });
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
