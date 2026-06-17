import api from './axios.js';

export function getShareLink(requestId) {
  return `${window.location.origin}/file/${requestId}`;
}

export async function uploadFiles(files, settings = {}, onProgress) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  if (settings.daysToExpire != null) {
    formData.append('daysToExpire', String(settings.daysToExpire));
  }

  if (settings.password) {
    formData.append('password', settings.password);
  }

  if (settings.emails?.length > 0) {
    formData.append('emails', JSON.stringify(settings.emails));
  }

  if (settings.turnstileToken) {
    formData.append('cf-turnstile-response', settings.turnstileToken);
  }

  const { data } = await api.post('/files/upload', formData, {
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return data;
}

export async function validateShare(requestId) {
  const { status, data } = await api.get(`/files/validate/${requestId}`, {
    validateStatus: () => true,
  });

  return {
    status,
    error: data?.error,
    passwordRequired: status === 401 && data?.error === 'Password is required',
  };
}

export async function getShare(requestId, password) {
  const body = { id: requestId };
  if (password) {
    body.userPassword = password;
  }

  const { data } = await api.post('/files/share', body);
  return data;
}

export async function fetchFilePreview(requestId, fileId) {
  const { data } = await api.post(
    '/files/preview',
    { requestId, fileId },
    { responseType: 'blob' }
  );
  return data;
}

export function extractRequestId(link) {
  if (!link) return null;
  const parts = link.split('/');
  return parts[parts.length - 1];
}
