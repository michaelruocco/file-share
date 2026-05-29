import { useState } from 'react';

import { uploadFile } from '../api/files';
import type { UploadProgress } from '../api/multipart';
import { formatBytes } from '../util/format';

type Props = {
  onUploaded: () => void;
};

function formatProgress(progress: UploadProgress) {
  return `${formatPercentage(progress.percentage)} • ${formatBytesPerSecond(progress.bytesPerSecond)} • ${formatDuration(progress.remainingSeconds)} remaining`;
}

function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}

function formatBytesPerSecond(bytesPerSecond: number): string {
  const formatted = formatBytes(bytesPerSecond);
  return `${formatted}/s`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);

  return parts.join(' ');
}

export default function UploadForm({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  async function handleUpload() {
    setProgress(null);
    setResult('');
    setError('');

    if (!file) {
      setError('Please choose a file');
      return;
    }

    try {
      const uploadData = await uploadFile(file, (progress) => {
        setProgress(progress);
      });
      setResult(uploadData.key);
      onUploaded();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="panel upload-panel">
      <div className="upload-title">Upload files</div>

      <div className="upload-subtitle">Choose a file to upload</div>

      <input
        id="file-input"
        type="file"
        className="hidden-input"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        className="primary-button"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        Select file
      </button>

      {file && (
        <div>
          Selected: <strong>{file.name}</strong>
        </div>
      )}

      {progress && (
        <div className="progress-wrapper">
          <div
            className="progress-bar"
            style={{
              width: `${progress.percentage}%`
            }}
          />
          <span>{formatProgress(progress)}</span>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {result && <div className="success">Upload successful</div>}

      {file && (
        <button className="primary-button" onClick={handleUpload}>
          Upload
        </button>
      )}
    </div>
  );
}
