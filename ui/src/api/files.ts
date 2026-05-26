import { API_BASE_URL } from "../config";

export type FileSummary = {
  key: string;
  size: number;
  lastModified?: string;
};

export async function getFiles(): Promise<FileSummary[]> {
  const response = await fetch(`${API_BASE_URL}/files`);

  if (!response.ok) {
    throw new Error("Failed to list files");
  }

  return await response.json();
}

export async function createUploadUrl(
  filename: string,
  contentType: string
) {
  const response = await fetch(
    `${API_BASE_URL}/upload-urls`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filename,
        contentType
      })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get upload URL");
  }

  return response.json();
}

export async function uploadFile(
  uploadUrl: string,
  file: File
) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type":
        file.type || "application/octet-stream"
    },
    body: file
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }
}

export async function downloadFile(key: string): Promise<void> {
  const body = await createDownloadUrl(key);
  window.open(body.downloadUrl, "_blank");
}

export async function createDownloadUrl(
  key: string
) {
  const response = await fetch(
    `${API_BASE_URL}/download-urls`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ key })
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to generate download URL"
    );
  }

  return response.json();
}