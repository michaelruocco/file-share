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

  function displayName(key: string): string {
    return key.split("/").pop() ?? key;
  }

  return (
    <div>

        <h2 className="section-title">
        Files
        </h2>

        <div className="panel files-panel">

        {files.length === 0 && (
            <div className="empty-state">
            No files yet.
            </div>
        )}

        {files.map(file => (

            <div
            key={file.key}
            className="file-row"
            >

            <div>

                <div className="file-name">
                {displayName(file.key)}
                </div>

                <div className="file-meta">
                {file.size} bytes
                </div>

            </div>

            <button
                className="secondary-button"
                onClick={() =>
                onDownload(file.key)
                }
            >
                Download
            </button>

            </div>
        ))}

        </div>

    </div>
  );
}