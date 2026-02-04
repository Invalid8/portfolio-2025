export async function uploadToCloudinary(file: File): Promise<string> {
  const signRes = await fetch("/api/admin/cloudinary/sign", { method: "POST" });
  const { timestamp, signature, cloudName, apiKey } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", "portfolio");

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await uploadRes.json();
  return data.secure_url;
}
