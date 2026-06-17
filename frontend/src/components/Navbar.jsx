import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          {/* <span className="navbar-logo-mark">P</span> */}
          <span className="navbar-logo-text">
            Pass<span className="navbar-logo-accent">MyFiles.com</span>
          </span>
        </Link>

        <div className="navbar-actions">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink to="/upload" className="nav-btn">
            Upload
          </NavLink>
        </div>
      </div>
    </header>
  );
}
