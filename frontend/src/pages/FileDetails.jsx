import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  validateShare,
  getShare,
  fetchFilePreview,
  getShareLink,
} from '../api/fileApi';
import { formatDate, getDaysUntilExpiry } from '../utils/date';
import {
  canPreviewInBrowser,
  getFileKind,
  getFileTypeLabel,
} from '../utils/allowedFiles';
import ShareAccessError from '../components/ShareAccessError';

export default function FileDetails() {
  const { id: requestId } = useParams();

  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeFileId, setActiveFileId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const files = share?.files || [];
  const activeFile = files.find((f) => f.id === activeFileId);
  const expiresAt = share?.expiresAt || files[0]?.expiresAt;
  const daysLeft = getDaysUntilExpiry(expiresAt);
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const showExpiry = Boolean(expiresAt && daysLeft !== null);

  const loadPreview = useCallback(async (file) => {
    setActiveFileId(file.id);
    setPreviewLoading(true);

    if (!canPreviewInBrowser(file.name, file.type)) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setPreviewLoading(false);
      return;
    }

    try {
      const blob = await fetchFilePreview(requestId, file.id);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch (err) {
      setError(err.message || 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  }, [requestId]);

  // 1. validate → 2. if 200 call getShare(id), if 401 show password → getShare(id, password)
  const loadFiles = useCallback(async (userPassword) => {
    setLoading(true);
    setAccessError('');
    setError('');
    setPasswordError('');

    try {
      if (!userPassword) {
        const result = await validateShare(requestId);

        if (result.status === 401 && result.passwordRequired) {
          setNeedsPassword(true);
          return;
        }

        if (result.status !== 200) {
          setAccessError(result.error || 'Unable to access files');
          return;
        }
      }

      const data = await getShare(requestId, userPassword);
      setShare(data);
      setNeedsPassword(false);

      if (data.files?.length > 0) {
        loadPreview(data.files[0]);
      }
    } catch (err) {
      if (userPassword) {
        setPasswordError(err.message || 'Invalid password');
      } else {
        setAccessError(err.message || 'Failed to load files');
      }
    } finally {
      setLoading(false);
    }
  }, [requestId, loadPreview]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Enter the password');
      return;
    }
    loadFiles(password.trim());
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getShareLink(requestId));
    } catch {
      // clipboard may fail
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(fileId, fileName) {
    try {
      setDownloadingId(fileId);
      const blob = await fetchFilePreview(requestId, fileId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="page file-details-page">
      <header className="file-details-header">
        <div>
          <Link to="/" className="btn btn-ghost file-details-back">
            ← Go back to home
          </Link>
          <h1 className="page-title">Shared files</h1>
          <p className="page-subtitle">
            Sharing number <code className="inline-code">{requestId}</code>
          </p>
        </div>
        <button
          className={`btn btn-secondary${copied ? ' btn-copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? 'Link copied' : 'Copy link'}
        </button>
      </header>

      {error && share && <div className="upload-error glass-card">{error}</div>}

      <div className="preview-layout glass-card">
        <aside className="file-column">
          <div className="file-column-header">
            <span className="section-label">Files</span>
            <span className="file-column-count">{files.length}</span>
          </div>

          <div className="file-column-list">
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                className={`file-column-item${activeFileId === file.id ? ' active' : ''}`}
                onClick={() => loadPreview(file)}
              >
                <div className="file-ext-badge sm">
                  {getFileTypeLabel(file.name)}
                </div>
                <div className="file-column-item-body">
                  <span className="file-column-name">{file.name}</span>
                  <span className="file-column-meta">
                    {file.size} · {formatDate(file.uploadedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {showExpiry && (
            <div className="file-column-footer">
              <div className="file-column-expiry">
                <span className={`badge${isExpiringSoon ? ' badge-warning' : daysLeft > 0 ? ' badge-success' : ' badge-warning'}`}>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                </span>
                <span className="file-column-meta">
                  Expires {formatDate(expiresAt)}
                </span>
              </div>
            </div>
          )}
        </aside>

        <section className="preview-panel">
          {loading ? (
            <div className="preview-empty">
              <span className="pulse-dot" />
              Loading...
            </div>
          ) : accessError ? (
            <ShareAccessError sharingNumber={requestId} message={accessError} />
          ) : needsPassword ? (
            <div className="preview-empty preview-password">
              <p>This share is password protected.</p>
              <form onSubmit={handlePasswordSubmit} className="preview-password-form">
                <input
                  type="password"
                  className="settings-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                />
                {passwordError && <p className="preview-password-error">{passwordError}</p>}
                <button type="submit" className="btn btn-primary">
                  Unlock
                </button>
              </form>
            </div>
          ) : activeFile ? (
            <>
              <div className="preview-panel-toolbar">
                <div className="preview-panel-info">
                  <h2 className="preview-panel-title">{activeFile.name}</h2>
                  <p className="preview-panel-meta">
                    {activeFile.size} · {getFileTypeLabel(activeFile.name, activeFile.type)} · Stored in S3
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDownload(activeFile.id, activeFile.name)}
                  disabled={downloadingId === activeFile.id}
                >
                  {downloadingId === activeFile.id ? 'Downloading...' : 'Download'}
                </button>
              </div>

              <div className="preview-panel-body">
                {previewLoading ? (
                  <div className="preview-loading">
                    <span className="pulse-dot" />
                    Loading preview...
                  </div>
                ) : previewUrl && getFileKind(activeFile.name, activeFile.type) === 'image' ? (
                  <div className="file-preview-image-wrap">
                    <img src={previewUrl} alt={activeFile.name} className="file-preview-image" />
                  </div>
                ) : previewUrl && getFileKind(activeFile.name, activeFile.type) === 'pdf' ? (
                  <iframe src={previewUrl} title={activeFile.name} className="pdf-preview-frame" />
                ) : !canPreviewInBrowser(activeFile.name, activeFile.type) ? (
                  <div className="preview-empty preview-unavailable">
                    <p>Preview not available for this file type.</p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleDownload(activeFile.id, activeFile.name)}
                    >
                      Download to view
                    </button>
                  </div>
                ) : (
                  <div className="preview-empty">
                    <p>Could not load preview</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="preview-empty">
              <p>No files to show</p>
            </div>
          )}
        </section>
      </div>

      {share && (
        <div className="file-details-meta glass-card">
          <div className="meta-chip">
            <span className="meta-label">Sharing number</span>
            <span className="meta-value">{requestId}</span>
          </div>
          <div className="meta-chip">
            <span className="meta-label">Files</span>
            <span className="meta-value">{share.totalFiles}</span>
          </div>
          <div className="meta-chip">
            <span className="meta-label">Cost</span>
            <span className="meta-value summary-value-free">Free</span>
          </div>
        </div>
      )}
    </div>
  );
}
