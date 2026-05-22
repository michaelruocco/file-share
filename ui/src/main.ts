
const API_BASE_URL = "https://ltc01ebmr1.execute-api.eu-west-2.amazonaws.com";

const uploadButton = document.getElementById("uploadButton");
const uploadFileInput = document.getElementById(
  "uploadFile"
) as HTMLInputElement;
const uploadResult = document.getElementById("uploadResult");

const downloadButton = document.getElementById("downloadButton");
const downloadKeyInput = document.getElementById("downloadKey") as HTMLTextAreaElement;
const downloadResult = document.getElementById("downloadResult");

uploadButton.addEventListener("click", async () => {
    uploadResult.innerHTML = "";

    const file = uploadFileInput.files?.[0];

    if (!file) {
      uploadResult.innerHTML = '<span class="error">Please choose a file</span>';
      return;
    }

    try {
    // Step 1 - request upload URL
    const uploadUrlResponse = await fetch(`${API_BASE_URL}/upload-urls`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream"
        })
    });

    if (!uploadUrlResponse.ok) {
        throw new Error("Failed to get upload URL");
    }

    const uploadData = await uploadUrlResponse.json();

    // Step 2 - upload directly to S3
    const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: {
        "Content-Type": file.type || "application/octet-stream"
        },
        body: file
    });

    if (!uploadResponse.ok) {
        throw new Error("File upload failed");
    }

    uploadResult.innerHTML = `
        <div class="success">Upload successful</div>
        <br />
        <strong>Object key:</strong>
        <br />
        ${uploadData.key}
    `;
    } catch (err) {
    console.error(err);

    uploadResult.innerHTML = `
        <span class="error">${err.message}</span>
    `;
    }
});

downloadButton.addEventListener("click", async () => {
    downloadResult.innerHTML = "";

    const key = downloadKeyInput.value.trim();

    if (!key) {
    downloadResult.innerHTML = '<span class="error">Please provide an object key</span>';
    return;
    }

    try {
    const response = await fetch(`${API_BASE_URL}/download-urls`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({ key })
    });

    if (!response.ok) {
        throw new Error("Failed to generate download URL");
    }

    const data = await response.json();

    downloadResult.innerHTML = `
        <div class="success">Download URL generated</div>
        <br />
        <a href="${data.downloadUrl}" target="_blank">
        Download File
        </a>
    `;
    } catch (err) {
    console.error(err);

    downloadResult.innerHTML = `
        <span class="error">${err.message}</span>
    `;
    }
});