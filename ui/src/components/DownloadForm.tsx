import { useState } from "react";

import {
  createDownloadUrl
} from "../api/files";

export default function DownloadForm() {

  const [key, setKey] =
    useState("");

  const [downloadUrl, setDownloadUrl] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleDownload() {

    setDownloadUrl("");
    setError("");

    if (!key.trim()) {
      setError("Please provide an object key");
      return;
    }

    try {

      const data =
        await createDownloadUrl(key);

      setDownloadUrl(data.downloadUrl);

    } catch (err) {

      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Download failed"
      );
    }
  }

  return (
    <div>

      <h2>Download</h2>

      <textarea
        value={key}
        onChange={(e) =>
          setKey(e.target.value)
        }
      />

      <button onClick={handleDownload}>
        Generate Download URL
      </button>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {downloadUrl && (
        <div className="success">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
          >
            Download File
          </a>
        </div>
      )}

    </div>
  );
}