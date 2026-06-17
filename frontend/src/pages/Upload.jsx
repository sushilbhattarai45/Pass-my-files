import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Turnstile from 'react-turnstile';
import UploadBox from '../components/UploadBox';
import ShareSettings from '../components/ShareSettings';
import TrustPanel from '../components/TrustPanel';
import { INVALID_FILES_MESSAGE } from '../utils/allowedFiles';
import { expiryToDays } from '../utils/shareSettings';
import { uploadFiles, getShareLink, extractRequestId } from '../api/fileApi';

const MAX_FILES = 10;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(name) {
  const parts = name.split('.');
  if (parts.length < 2) return 'FILE';
  return parts.pop().slice(0, 4).toUpperCase();
}

function fileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergeFiles(existing, incoming) {
  const map = new Map(existing.map((f) => [fileKey(f), f]));
  incoming.forEach((f) => map.set(fileKey(f), f));
  return Array.from(map.values());
}

const PERKS = ['Instant link', 'Encrypted', '7-day default', 'Up to 30 days'];
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function Upload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [expiry, setExpiry] = useState('7d');
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [password, setPassword] = useState('');
  const [emails, setEmails] = useState([]);
  const [sharingNumber, setSharingNumber] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [numberCopied, setNumberCopied] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);

  function handleAddFiles(newFiles) {
    setError('');
    setFiles((prev) => {
      const merged = mergeFiles(prev, newFiles);
      if (merged.length > MAX_FILES) {
        setError(`You can upload up to ${MAX_FILES} files at once`);
        return prev;
      }
      return merged;
    });
  }

  function handleRemoveFile(key) {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== key));
    setError('');
  }

  function resetTurnstile() {
    setTurnstileToken('');
    setTurnstileKey((key) => key + 1);
  }

  async function handleUpload() {
    if (files.length === 0) return;

    if (!turnstileToken) {
      setError('Complete the security check before uploading');
      return;
    }

    if (passwordProtect && !password.trim()) {
      setError('Enter a password or turn off password protection');
      return;
    }

    setUploading(true);
    setUploadComplete(false);
    setProgress(0);
    setShareLink('');
    setSharingNumber('');
    setError('');

    try {
      const data = await uploadFiles(
        files,
        {
          daysToExpire: expiryToDays(expiry),
          password: passwordProtect ? password.trim() : undefined,
          emails,
          turnstileToken,
        },
        setProgress,
      );
      const id = extractRequestId(data.link);
      setSharingNumber(id);
      setShareLink(getShareLink(id));
      setUploadComplete(true);
    } catch (err) {
      setError(err.message || 'Upload failed');
      resetTurnstile();
    } finally {
      setUploading(false);
    }
  }

  function handlePasswordProtectChange(enabled) {
    setPasswordProtect(enabled);
    if (!enabled) setPassword('');
  }

  async function handleCopyLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      // clipboard may fail
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyNumber() {
    if (!sharingNumber) return;
    try {
      await navigator.clipboard.writeText(sharingNumber);
    } catch {
      // clipboard may fail
    }
    setNumberCopied(true);
    setTimeout(() => setNumberCopied(false), 2000);
  }

  function handleReset() {
    setFiles([]);
    setUploading(false);
    setUploadComplete(false);
    setProgress(0);
    setShareLink('');
    setSharingNumber('');
    setExpiry('7d');
    setPasswordProtect(false);
    setPassword('');
    setEmails([]);
    setError('');
    resetTurnstile();
  }

  return (
    <div className="page upload-page-full">
      <div className="upload-layout">
        <div className="upload-main">
          {error && (
            <div className="upload-error glass-card">{error}</div>
          )}

          {!uploadComplete ? (
            <>
              <div className="upload-hero-bar">
                <div>
                  <h1 className="upload-hero-title">
                    {uploading ? 'Uploading' : files.length > 0 ? 'Your documents' : 'Upload a file'}
                  </h1>
                  <p className="upload-hero-sub">
                    {uploading
                      ? 'Sending your files to the server'
                      : files.length > 0
                        ? `${files.length} of ${MAX_FILES} selected · Add more or upload`
                        : 'Free · No account · Link ready in seconds'}
                  </p>
                </div>
                <div className="upload-hero-badge glass-card">
                  <span className="pulse-dot" />
                  Online
                </div>
              </div>

              {files.length === 0 ? (
                <div className="upload-zone-wrap glass-card glow-border">
                  <UploadBox
                    onFileSelect={handleAddFiles}
                    onInvalidFiles={() => setError(INVALID_FILES_MESSAGE)}
                    large
                    disabled={uploading}
                  />
                </div>
              ) : (
                <div className="glass-card file-queue-card glow-border">
                  <div className="file-queue-header">
                    <span className="section-label">Selected files</span>
                    <span className="file-queue-count">{files.length}/{MAX_FILES}</span>
                  </div>

                  <div className="file-preview-list">
                    {files.map((file) => (
                      <div key={fileKey(file)} className="preview-file file-queue-item">
                        <div className="file-ext-badge">{getFileExtension(file.name)}</div>
                        <div className="file-queue-item-body">
                          <div className="preview-file-name">{file.name}</div>
                          <div className="preview-file-size">{formatFileSize(file.size)}</div>
                        </div>
                        {!uploading && (
                          <button
                            type="button"
                            className="file-remove-btn"
                            onClick={() => handleRemoveFile(fileKey(file))}
                            aria-label={`Remove ${file.name}`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {files.length < MAX_FILES && !uploading && (
                    <div className="add-more-zone">
                      <UploadBox
                        onFileSelect={handleAddFiles}
                        onInvalidFiles={() => setError(INVALID_FILES_MESSAGE)}
                        compact
                        disabled={uploading}
                      />
                    </div>
                  )}

                  {uploading && (
                    <div className="progress-container">
                      <div className="progress-label">
                        <span>Uploading</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  {!uploading && (
                    <div className="file-queue-settings">
                      <ShareSettings
                        expiry={expiry}
                        onExpiryChange={setExpiry}
                        passwordProtect={passwordProtect}
                        onPasswordChange={handlePasswordProtectChange}
                        password={password}
                        onPasswordInputChange={setPassword}
                        emails={emails}
                        onEmailsChange={setEmails}
                        disabled={uploading}
                      />
                    </div>
                  )}

                  {!uploading && (
                    <div className="file-queue-actions">
                      {TURNSTILE_SITE_KEY ? (
                        <div className="turnstile-wrap">
                          <Turnstile
                            key={turnstileKey}
                            sitekey={TURNSTILE_SITE_KEY}
                            theme="dark"
                            fixedSize
                            onVerify={(token) => {
                              setTurnstileToken(token);
                              setError('');
                            }}
                            onExpire={() => setTurnstileToken('')}
                            onError={() => {
                              setTurnstileToken('');
                              setError('Security check failed. Please try again.');
                            }}
                          />
                        </div>
                      ) : (
                        <p className="turnstile-missing">
                          Turnstile site key missing. Set VITE_TURNSTILE_SITE_KEY in .env
                        </p>
                      )}
                      <button
                        className="btn btn-primary btn-lg btn-full glow-btn"
                        onClick={handleUpload}
                        disabled={!turnstileToken}
                      >
                        Upload {files.length} file{files.length !== 1 ? 's' : ''}
                      </button>
                      <button className="btn btn-ghost" onClick={handleReset}>
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              )}

              {files.length === 0 && !uploading && (
                <div className="upload-perks">
                  {PERKS.map((perk) => (
                    <div key={perk} className="perk-chip glass-card">{perk}</div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="upload-result">
              <div className="upload-hero-bar">
                <div>
                  <h1 className="upload-hero-title">Ready to share</h1>
                  <p className="upload-hero-sub">
                    {files.length} file{files.length !== 1 ? 's' : ''} uploaded · Copy your link below
                  </p>
                </div>
                <div className="upload-hero-badge glass-card success-badge">
                  Complete
                </div>
              </div>

              <div className="glass-card file-ready-card glow-border">
                <div className="file-preview-list">
                  {files.map((file) => (
                    <div key={fileKey(file)} className="preview-file" style={{ marginBottom: 0 }}>
                      <div className="file-ext-badge">{getFileExtension(file.name)}</div>
                      <div>
                        <div className="preview-file-name">{file.name}</div>
                        <div className="preview-file-size">
                          {formatFileSize(file.size)} · Stored in S3
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card sharing-number-card glow-border">
                <span className="section-label">Your sharing number</span>
                <div className="sharing-number-row">
                  <code className="sharing-number-value">{sharingNumber}</code>
                  <button
                    type="button"
                    className={`btn btn-secondary${numberCopied ? ' btn-copied' : ''}`}
                    onClick={handleCopyNumber}
                  >
                    {numberCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="sharing-number-hint">
                  Others can enter this number on the home page to access your files directly.
                </p>
              </div>

              <div className="share-actions">
                <div className="share-success glass-card glow-border">
                  <div className="share-success-label">
                    <span className="pulse-dot green" />
                    Your link is ready
                  </div>
                  <div className="sharing-number-row" style={{ marginBottom: '0.5rem' }}>
                    <code className="sharing-number-value">{sharingNumber}</code>
                    <button
                      type="button"
                      className={`btn btn-secondary${numberCopied ? ' btn-copied' : ''}`}
                      onClick={handleCopyNumber}
                    >
                      {numberCopied ? 'Copied' : 'Copy number'}
                    </button>
                  </div>
                  <div className="link-preview">
                    <input type="text" readOnly value={shareLink} />
                    <button
                      className={`btn btn-secondary${copied ? ' btn-copied' : ''}`}
                      onClick={handleCopyLink}
                    >
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                  <div className="share-success-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/file/${sharingNumber}`)}
                    >
                      Open file page
                    </button>
                    <button className="btn btn-ghost" onClick={handleReset}>
                      Upload another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <TrustPanel />
      </div>
    </div>
  );
}
