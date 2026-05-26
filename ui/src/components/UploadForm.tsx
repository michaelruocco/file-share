import { useState } from "react";
import { uploadFile } from "../api/files";

type Props = {
  onUploaded: () => void;
};


export default function UploadForm({onUploaded}: Props) {

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
      const uploadData = await uploadFile(file);
      setResult(uploadData.key);
      onUploaded();
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
    <div className="panel upload-panel">
        <div className="upload-title">
        Upload files
        </div>

        <div className="upload-subtitle">
        Choose a file to upload
        </div>

        <input
        id="file-input"
        type="file"
        className="hidden-input"
        onChange={(e) =>
            setFile(e.target.files?.[0] ?? null)
        }
        />

        <button
        className="primary-button"
        onClick={() =>
            document
            .getElementById("file-input")
            ?.click()
        }
        >
        Select file
        </button>

        {file && (
        <div>
            Selected:
            {" "}
            <strong>{file.name}</strong>
        </div>
        )}

        {error && (
        <div className="error">
            {error}
        </div>
        )}

        {result && (
        <div className="success">
            Upload successful
        </div>
        )}

        {file && (
        <button
            className="primary-button"
            onClick={handleUpload}
        >
            Upload
        </button>
        )}
    </div>
  );
}