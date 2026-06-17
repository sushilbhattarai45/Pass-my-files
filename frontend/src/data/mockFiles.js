export const mockFiles = [
  {
    id: 'f1a2b3c4',
    name: 'project-brief.pdf',
    size: '2.4 MB',
    sizeBytes: 2516582,
    type: 'application/pdf',
    uploadedAt: '2026-06-10T14:30:00Z',
    expiresAt: '2026-07-10T14:30:00Z',
    downloads: 12,
    link: 'https://passmyfiles.app/f/f1a2b3c4',
    encrypted: true,
  },
  {
    id: 'd5e6f7g8',
    name: 'design-mockups.zip',
    size: '18.7 MB',
    sizeBytes: 19608371,
    type: 'application/zip',
    uploadedAt: '2026-06-09T09:15:00Z',
    expiresAt: '2026-06-23T09:15:00Z',
    downloads: 5,
    link: 'https://passmyfiles.app/f/d5e6f7g8',
    encrypted: true,
  },
  {
    id: 'h9i0j1k2',
    name: 'presentation.pptx',
    size: '5.1 MB',
    sizeBytes: 5347737,
    type: 'application/vnd.ms-powerpoint',
    uploadedAt: '2026-06-08T16:45:00Z',
    expiresAt: '2026-06-22T16:45:00Z',
    downloads: 28,
    link: 'https://passmyfiles.app/f/h9i0j1k2',
    encrypted: true,
  },
  {
    id: 'l3m4n5o6',
    name: 'screenshot.png',
    size: '890 KB',
    sizeBytes: 910336,
    type: 'image/png',
    uploadedAt: '2026-06-07T11:20:00Z',
    expiresAt: '2026-06-21T11:20:00Z',
    downloads: 3,
    link: 'https://passmyfiles.app/f/l3m4n5o6',
    encrypted: true,
  },
  {
    id: 'p7q8r9s0',
    name: 'source-code.tar.gz',
    size: '42.3 MB',
    sizeBytes: 44354764,
    type: 'application/gzip',
    uploadedAt: '2026-06-05T08:00:00Z',
    expiresAt: '2026-07-05T08:00:00Z',
    downloads: 47,
    link: 'https://passmyfiles.app/f/p7q8r9s0',
    encrypted: true,
  },
];

export const mockStats = {
  totalUploads: 24,
  totalDownloads: 156,
  storageUsed: 2.4,
  storageTotal: 5,
  activeLinks: 8,
};

export function getFileById(id) {
  return mockFiles.find((file) => file.id === id);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysUntilExpiry(dateString) {
  const now = new Date();
  const expiry = new Date(dateString);
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return diff;
}
