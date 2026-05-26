import type { FileSummary } from "../api/files";

type Props = {
  files: FileSummary[];
  onDownload: (key: string) => void;
};

export default function FileList({
  files,
  onDownload
}: Props) {

  if (files.length === 0) {
    return <p>No uploaded files</p>;
  }

  return (
    <div className="card">

      <h2>Files</h2>

      {files.map(file => (
        <div
          key={file.key}
          className="file-row"
        >
          <div>
            <strong>{file.key}</strong>
            <br />

            {file.size} bytes
          </div>

          <button
            onClick={() =>
              onDownload(file.key)
            }
          >
            Download
          </button>
        </div>
      ))}
    </div>
  );
}