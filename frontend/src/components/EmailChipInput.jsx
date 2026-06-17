import { useState } from 'react';
import { isValidEmail, normalizeEmail, MAX_EMAILS } from '../utils/shareSettings';

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EmailChipInput({ emails, onEmailsChange, disabled = false, id, maxEmails = MAX_EMAILS }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const atLimit = emails.length >= maxEmails;

  function addEmail(raw) {
    const email = normalizeEmail(raw);
    if (!email) return true;

    if (atLimit) {
      setError(`You can add up to ${maxEmails} email addresses`);
      return false;
    }

    if (!isValidEmail(email)) {
      setError('Enter a valid email address');
      return false;
    }

    if (emails.includes(email)) {
      setError('This email is already added');
      return false;
    }

    onEmailsChange([...emails, email]);
    setDraft('');
    setError('');
    return true;
  }

  function addMany(raw) {
    const parts = raw.split(/[,;\n\s]+/).map(normalizeEmail).filter(Boolean);
    if (parts.length === 0) return;

    const next = [...emails];
    let invalid = false;
    let skippedLimit = false;

    for (const part of parts) {
      if (next.length >= maxEmails) {
        skippedLimit = true;
        break;
      }
      if (!isValidEmail(part)) {
        invalid = true;
        continue;
      }
      if (!next.includes(part)) next.push(part);
    }

    onEmailsChange(next);
    setDraft('');
    if (skippedLimit) {
      setError(`You can add up to ${maxEmails} email addresses`);
    } else if (invalid) {
      setError('Some addresses were skipped — check the format');
    } else {
      setError('');
    }
  }

  function removeEmail(email) {
    onEmailsChange(emails.filter((e) => e !== email));
    setError('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(draft);
      return;
    }

    if (e.key === 'Backspace' && !draft && emails.length > 0) {
      onEmailsChange(emails.slice(0, -1));
      setError('');
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text');
    if (!/[,;\n\s]/.test(text)) return;

    e.preventDefault();
    addMany(draft ? `${draft} ${text}` : text);
  }

  function handleBlur() {
    if (draft.trim()) addEmail(draft);
  }

  return (
    <div className="email-chip-input">
      <input
        id={id}
        type="email"
        className={`settings-input email-chip-field${error ? ' email-chip-field-error' : ''}`}
        placeholder={emails.length ? 'Add another email' : 'email@example.com'}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          if (error) setError('');
        }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        disabled={disabled || atLimit}
        autoComplete="off"
      />

      {emails.length > 0 && (
        <ul className="email-chip-list">
          {emails.map((email) => (
            <li key={email} className="email-chip">
              <span className="email-chip-text">{email}</span>
              <button
                type="button"
                className="email-chip-remove"
                onClick={() => removeEmail(email)}
                disabled={disabled}
                aria-label={`Remove ${email}`}
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="email-chip-error">{error}</p>}
      {!error && !atLimit && emails.length === 0 && (
        <p className="email-chip-hint">Press Enter to add each address (max {maxEmails})</p>
      )}
      {!error && !atLimit && emails.length > 0 && (
        <p className="email-chip-hint">{emails.length} of {maxEmails} added</p>
      )}
      {!error && atLimit && (
        <p className="email-chip-hint">Maximum of {maxEmails} email addresses reached</p>
      )}
    </div>
  );
}
