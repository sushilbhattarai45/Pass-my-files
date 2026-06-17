import { useState, useRef } from 'react';
import {
  ACCEPT_ATTR,
  FORMATS_LABEL,
  FORMATS_LABEL_COMPACT,
  filterAllowedFiles,
} from '../utils/allowedFiles';

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4M12 4L8 8M12 4L16 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16V17C4 18.1 4.9 19 6 19H18C19.1 19 20 18.1 20 17V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function UploadBox({
  onFileSelect,
  onInvalidFiles,
  large = false,
  compact = false,
  disabled = false,
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const allowed = filterAllowedFiles(fileList);
    if (allowed.length === 0) {
      onInvalidFiles?.();
      return;
    }
    onFileSelect(allowed);
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleChange(e) {
    handleFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <div
      className={`upload-box${large ? ' large' : ''}${compact ? ' compact' : ''}${dragging ? ' dragging' : ''}${disabled ? ' disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <input
        ref={inputRef}
        type="file"
        className="upload-input"
        accept={ACCEPT_ATTR}
        multiple
        disabled={disabled}
        onChange={handleChange}
      />
      <div className="upload-icon">
        <UploadIcon />
      </div>
      <p className="upload-title">
        {dragging
          ? 'Release to add'
          : compact
            ? 'Add more files'
            : 'Drag and drop your files'}
      </p>
      {!compact && (
        <>
          <p className="upload-hint">
            or <span>browse</span> from your device
          </p>
          <p className="upload-formats">{FORMATS_LABEL}</p>
        </>
      )}
      {compact && (
        <p className="upload-formats">{FORMATS_LABEL_COMPACT}</p>
      )}
    </div>
  );
}
