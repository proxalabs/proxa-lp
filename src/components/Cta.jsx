import Link from 'next/link';

// A call to action that navigates is a real link: crawlable, prefetchable and
// middle-clickable. `cta` is { label, href }.
export default function Cta({ cta, className, style, children }) {
  if (!cta || !cta.href) return null;
  return (
    <Link href={cta.href} className={`${className} as-btn`} style={style}>
      {cta.label}
      {children}
    </Link>
  );
}
