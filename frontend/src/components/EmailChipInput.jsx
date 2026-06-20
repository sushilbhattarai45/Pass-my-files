import { useEffect, useMemo, useState } from 'react';
import { isValidEmail, normalizeEmail, MAX_EMAILS } from '../utils/shareSettings';

const SAVED_EMAILS_KEY = 'file-share:saved-emails';
const MAX_SAVED_EMAILS = 10;

function loadSavedEmails() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_EMAILS_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.map(normalizeEmail).filter(isValidEmail).slice(0, MAX_SAVED_EMAILS);
  } catch {
    return [];
  }
}

function persistSavedEmails(emails) {
  try {
    localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(emails.slice(0, MAX_SAVED_EMAILS)));
  } catch {
    // localStorage can be unavailable in private browsing or strict privacy modes.
  }
}

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
  const [savedEmails, setSavedEmails] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const atLimit = emails.length >= maxEmails;

  const suggestions = useMemo(() => {
    const search = normalizeEmail(draft);
    return savedEmails
      .filter((email) => !emails.includes(email))
      .filter((email) => !search || email.includes(search))
      .slice(0, 5);
  }, [draft, emails, savedEmails]);

  useEffect(() => {
    setSavedEmails(loadSavedEmails());
  }, []);

  function rememberEmail(email) {
    const next = [email, ...savedEmails.filter((saved) => saved !== email)];
    setSavedEmails(next);
    persistSavedEmails(next);
  }

  function rememberEmails(nextEmails) {
    const remembered = nextEmails.filter((email) => !emails.includes(email));
    if (remembered.length === 0) return;

    const next = [
      ...remembered,
      ...savedEmails.filter((saved) => !remembered.includes(saved)),
    ];
    setSavedEmails(next);
    persistSavedEmails(next);
  }

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
    rememberEmail(email);
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
    rememberEmails(next);
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
    setShowSuggestions(false);
  }

  function handleSuggestionClick(email) {
    addEmail(email);
    setShowSuggestions(false);
  }

  return (
    <div className="email-chip-input">
      <div className="email-chip-field-wrap">
        <input
          id={id}
          type="email"
          className={`settings-input email-chip-field${error ? ' email-chip-field-error' : ''}`}
          placeholder={emails.length ? 'Add another email' : 'email@example.com'}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setShowSuggestions(true);
            if (error) setError('');
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          disabled={disabled || atLimit}
          autoComplete="off"
        />

        {showSuggestions && !disabled && !atLimit && suggestions.length > 0 && (
          <div className="email-suggestions" role="listbox" aria-label="Saved email suggestions">
            {suggestions.map((email) => (
              <button
                key={email}
                type="button"
                className="email-suggestion"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(email)}
              >
                {email}
              </button>
            ))}
          </div>
        )}
      </div>

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
