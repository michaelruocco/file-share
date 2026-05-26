import { useState } from "react";

import {
  createUploadUrl,
  uploadFile
} from "../api/files";

export default function UploadForm() {

  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<string>("");

  const [error, setError] =
    useState<string>("");

  async function handleUpload() {

    setResult("");
    setError("");

    if (!file) {
      setError("Please choose a file");
      return;
    }

    try {

      const uploadData =
        await createUploadUrl(
          file.name,
          file.type || "application/octet-stream"
        );

      await uploadFile(uploadData.uploadUrl, file);

      setResult(uploadData.key);

    } catch (err) {

      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Upload failed"
      );
    }
  }

  return (
    <div>

      <h2>Upload</h2>

      <input
        type="file"
        onChange={(e) =>
          setFile(e.target.files?.[0] ?? null)
        }
      />

      <button onClick={handleUpload}>
        Upload
      </button>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result && (
        <div className="success">
          Upload successful
          <br />
          <strong>Object key:</strong>
          <br />
          {result}
        </div>
      )}

    </div>
  );
}