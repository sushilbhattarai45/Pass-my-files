import { Link } from 'react-router-dom';
import { FileX, Clock, AlertCircle } from 'lucide-react';

export function getAccessErrorInfo(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('expired')) {
    return {
      icon: Clock,
      variant: 'warning',
      title: 'This share has expired',
      description:
        'These files are no longer available. Ask the sender to upload again or create your own share.',
    };
  }

  if (msg.includes('not found')) {
    return {
      icon: FileX,
      variant: 'error',
      title: 'Share not found',
      description:
        'This sharing number does not exist or may have been removed or expired. Double-check the number and try again.',
    };
  }

  return {
    icon: AlertCircle,
    variant: 'error',
    title: 'Unable to open share',
    description: message || 'Something went wrong while loading this share.',
  };
}

export default function ShareAccessError({ sharingNumber, message }) {
  const { icon: Icon, variant, title, description } = getAccessErrorInfo(message);

  return (
    <div className="share-access-error">
      <div className={`share-access-error-icon share-access-error-icon-${variant}`}>
        <Icon />
      </div>
      <h2 className="share-access-error-title">{title}</h2>
      <p className="share-access-error-desc">{description}</p>
      {sharingNumber && (
        <div className="share-access-error-code">
          <span className="share-access-error-code-label">Sharing number</span>
          <code>{sharingNumber}</code>
        </div>
      )}
      <div className="share-access-error-actions">
        <Link to="/upload" className="btn btn-primary">
          Upload a file
        </Link>
        <Link to="/" className="btn btn-secondary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
