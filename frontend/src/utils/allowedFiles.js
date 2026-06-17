const VIDEO_EXTENSIONS = [
  '.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv', '.m4v', '.mpeg', '.mpg', '.3gp',
];

const EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];

const MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/doc',
  'application/docx',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
]);

export const ACCEPT_ATTR =
  '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*';

export const INVALID_FILES_MESSAGE =
  'Only PDF, Word (DOC/DOCX), and images are allowed. Videos are not supported (max 5 MB each)';

export const FORMATS_LABEL = 'PDF, DOC, DOCX & images · No videos · Max 5 MB each · Up to 10 files';
export const FORMATS_LABEL_COMPACT = 'PDF, DOC, DOCX & images · No videos · 5 MB max · Up to 10 total';

function getExtension(name) {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf('.');
  if (dot === -1) return '';
  return lower.slice(dot);
}

function isVideoFile(file) {
  const ext = getExtension(file.name);
  if (VIDEO_EXTENSIONS.includes(ext)) return true;
  if (file.type?.startsWith('video/')) return true;
  return false;
}

export function isAllowedFile(file) {
  if (isVideoFile(file)) return false;
  const ext = getExtension(file.name);
  if (EXTENSIONS.includes(ext)) return true;
  if (file.type && MIME_TYPES.has(file.type)) return true;
  if (file.type?.startsWith('image/')) return true;
  return false;
}

export function filterAllowedFiles(fileList) {
  return Array.from(fileList).filter(isAllowedFile);
}

export function getFileKind(name, mimeType = '') {
  const ext = getExtension(name);
  if (ext === '.pdf' || mimeType === 'application/pdf') return 'pdf';
  if (['.doc', '.docx'].includes(ext) || mimeType.includes('word') || mimeType.includes('doc')) {
    return 'document';
  }
  if (
    ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'].includes(ext) ||
    mimeType.startsWith('image/')
  ) {
    return 'image';
  }
  return 'unknown';
}

export function getFileTypeLabel(name, mimeType = '') {
  const kind = getFileKind(name, mimeType);
  if (kind === 'pdf') return 'PDF';
  if (kind === 'document') return getExtension(name).slice(1).toUpperCase() || 'DOC';
  if (kind === 'image') return getExtension(name).slice(1).toUpperCase() || 'Image';
  return 'File';
}

export function canPreviewInBrowser(name, mimeType = '') {
  const kind = getFileKind(name, mimeType);
  return kind === 'pdf' || kind === 'image';
}
