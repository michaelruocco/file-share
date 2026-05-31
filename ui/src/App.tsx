import { useEffect, useState } from 'react';

import UploadForm from './components/UploadForm';
import FileList from './components/FileList';

import { getFiles, downloadFile, deleteFile } from './api/files';
import type { FileSummary } from './api/files';

export default function App() {
  const [files, setFiles] = useState<FileSummary[]>([]);

  async function refreshFiles() {
    const files = await getFiles();
    setFiles(files);
  }

  async function deleteFileAndRefresh(key: string) {
    await deleteFile(key);
    refreshFiles();
  }

  useEffect(() => {
    refreshFiles();
  }, []);

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <h1>File Share</h1>

          <p>Upload files to share</p>
        </header>

        <UploadForm onUploaded={refreshFiles} />

        <FileList files={files} onDownload={downloadFile} onDelete={deleteFileAndRefresh} />
      </div>
    </div>
  );
}
