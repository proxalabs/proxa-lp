import Link from 'next/link';

export default function QuietLink({ href, children, color }) {
  return (
    <Link className="quiet-link as-btn" href={href} style={color ? { color } : undefined}>
      {children}
      <span className="quiet-link-arrow">→</span>
    </Link>
  );
}
