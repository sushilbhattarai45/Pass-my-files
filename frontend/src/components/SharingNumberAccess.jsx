import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SharingNumberAccess() {
  const navigate = useNavigate();
  const [sharingNumber, setSharingNumber] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = sharingNumber.trim();

    if (!trimmed) {
      setError('Enter your sharing number');
      return;
    }

    setError('');
    navigate(`/file/${trimmed}`);
  }

  return (
    <form className="access-inline" onSubmit={handleSubmit}>
      <span className="access-inline-label">Have a sharing number?</span>
      <div className="access-inline-row">
        <input
          type="text"
          className="access-input"
          placeholder="Paste your sharing number"
          value={sharingNumber}
          onChange={(e) => {
            setSharingNumber(e.target.value);
            setError('');
          }}
          spellCheck={false}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-secondary access-inline-btn">
          Open files
        </button>
      </div>
      {error && <p className="access-error">{error}</p>}
    </form>
  );
}
