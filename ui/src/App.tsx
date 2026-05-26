import UploadForm from "./components/UploadForm";
import DownloadForm from "./components/DownloadForm";

export default function App() {
  return (
    <div>
      <h1>File Share</h1>

      <UploadForm />

      <hr />

      <DownloadForm />
    </div>
  );
}