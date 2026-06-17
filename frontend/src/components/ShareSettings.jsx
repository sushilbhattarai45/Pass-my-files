import EmailChipInput from './EmailChipInput';
import { EXPIRY_OPTIONS } from '../utils/shareSettings';

export default function ShareSettings({
  expiry,
  onExpiryChange,
  passwordProtect,
  onPasswordChange,
  password,
  onPasswordInputChange,
  emails,
  onEmailsChange,
  disabled = false,
}) {
  return (
    <div className="share-settings">
      <h3 className="settings-title">Share settings</h3>

      <div className="settings-group">
        <label className="settings-label">Expires in</label>
        <div className="expiry-options">
          {EXPIRY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`expiry-chip${expiry === option.value ? ' active' : ''}`}
              onClick={() => onExpiryChange(option.value)}
              disabled={disabled}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-inline-row">
          <label className="settings-label settings-label-inline">Password</label>
          <button
            type="button"
            className={`toggle${passwordProtect ? ' on' : ''}`}
            onClick={() => onPasswordChange(!passwordProtect)}
            aria-pressed={passwordProtect}
            disabled={disabled}
          >
            <span className="toggle-knob" />
          </button>
        </div>
        {passwordProtect && (
          <input
            type="password"
            className="settings-input"
            placeholder="Download password"
            value={password}
            onChange={(e) => onPasswordInputChange(e.target.value)}
            disabled={disabled}
            autoComplete="new-password"
          />
        )}
      </div>

      <div className="settings-group">
        <label className="settings-label" htmlFor="notify-emails">
          Notify by email <span className="settings-optional">optional</span>
        </label>
        <EmailChipInput
          id="notify-emails"
          emails={emails}
          onEmailsChange={onEmailsChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
