import React from 'react';
import './FileUploader.css';

function FileUploader({ onFileUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
      e.target.value = null; // ताकि एक ही फ़ाइल को दोबारा सेलेक्ट कर सकें
    }
  };

  return (
    <div className="file-uploader">
      <label htmlFor="file-upload" className="file-upload-label">
        📎
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        className="hidden-file-input"
      />
    </div>
  );
}

export default FileUploader;