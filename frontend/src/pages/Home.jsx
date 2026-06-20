import { Link } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  Zap,
  Activity,
  KeyRound,
  ChevronRight,
  Upload,
  Share2,
  FolderOpen,
} from 'lucide-react';
import SharingNumberAccess from '../components/SharingNumberAccess';

const FEATURES = [
  { icon: Zap, label: 'Instant delivery', desc: 'Files shared in seconds' },
  { icon: Activity, label: 'Live preview', desc: 'See every file in one place' },
  { icon: KeyRound, label: 'Optional password', desc: 'Add access protection' },
];

const PIPELINE_STEPS = [
  { label: 'Upload' },
  { label: 'Store' },
  { label: 'Share' },
];

const HOW_IT_WORKS = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload',
    desc: 'Drop your files on the upload page.',
  },
  {
    icon: Share2,
    step: '02',
    title: 'Get your number',
    desc: 'Receive a unique sharing number.',
  },
  {
    icon: FolderOpen,
    step: '03',
    title: 'Share or access',
    desc: 'Send the number — recipients open files directly.',
  },
];

const VISUAL_STEPS = [
  { title: 'Choose files', desc: 'PDFs, Word docs, and images only' },
  { title: 'Upload securely', desc: 'Files are checked before sharing' },
  { title: 'Copy the link', desc: 'Share the generated link or number' },
];

function SharePreview() {
  return (
    <div className="visual-wrap">
      <div className="visual-glow" aria-hidden />
      <div className="hero-visual">
        <div className="visual-header">
          <span className="visual-label">Sharing flow</span>
          <span className="visual-live">ready after upload</span>
        </div>

        <div className="visual-body">
          {VISUAL_STEPS.map((step) => (
            <div key={step.title} className="visual-file-row visual-step-row">
              <div className="visual-file-icon">
                <FileText />
              </div>
              <div className="visual-file-info">
                <span className="visual-file-name">{step.title}</span>
                <span className="visual-file-size">{step.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="visual-pipeline">
          <div className="visual-pipeline-inner">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="visual-pipeline-step">
                <div className="visual-pipeline-cell">
                  <span className="visual-pipeline-dot" />
                  <span className="visual-pipeline-label">{step.label}</span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ChevronRight className="visual-pipeline-chevron" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <FileText className="hero-eyebrow-icon" />
            <span>
              <span className="hero-eyebrow-accent">Simple</span>Share · File Sharing Platform
            </span>
          </p>

          <h1 className="hero-title">
            Simple, <span className="hero-title-accent">fast</span>
            <br />
            <span className="hero-title-muted">file sharing.</span>
          </h1>

          <p className="hero-lead">
            Upload files, get a sharing number, and let anyone access them.
            Shares expire in 7 days by default, with options up to 30 days.
          </p>

          <div className="hero-ctas">
            <Link to="/upload" className="btn btn-primary btn-hero">
              Upload a file
              <ArrowRight className="btn-icon" />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-hero">
              How it works
            </a>
          </div>

          <div className="hero-pills">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="hero-pill">
                <Icon className="hero-pill-icon" />
                <div className="hero-pill-label">{label}</div>
                <div className="hero-pill-desc">{desc}</div>
              </div>
            ))}
          </div>

          <SharingNumberAccess />
        </div>

        <div className="hero-visual-col">
          <SharePreview />
        </div>
      </section>

      <section className="landing-how" id="how-it-works">
        <p className="how-title">How it works</p>
        <div className="how-panel">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }, i) => (
            <div key={step} className={`how-item${i > 0 ? ' how-item-divider' : ''}`}>
              <div className="how-item-icon-col">
                <span className="how-num">{step}</span>
                <div className="how-icon-box">
                  <Icon className="how-icon" />
                </div>
              </div>
              <div className="how-item-copy">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
