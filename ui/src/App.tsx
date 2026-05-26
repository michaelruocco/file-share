import { useEffect, useState } from "react";

import UploadForm from "./components/UploadForm";
import FileList from "./components/FileList";

import { getFiles, downloadFile } from "./api/files";
import type { FileSummary } from "./api/files";

export default function App() {
  const [files, setFiles] = useState<FileSummary[]>([]);

  async function refreshFiles() {
    const files = await getFiles();
    setFiles(files);
  }

  useEffect(() => {
    refreshFiles();
  }, []);

  return (
    <div>
      <h1>File Share</h1>

      <UploadForm onUploaded={refreshFiles}/>

      <FileList files={files} onDownload={downloadFile} />
    </div>
  );
}