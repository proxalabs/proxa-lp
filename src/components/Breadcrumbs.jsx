import Link from 'next/link';
import { hrefFor } from '../lib/routes';
import './Breadcrumbs.css';

// Visible breadcrumb trail (Home › Section › Page). `items` = [{ name, page? }];
// items with a `page` key are links, ones without (the current page) are plain text.
export default function Breadcrumbs({ items }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span className="crumb" key={i}>
            {it.page
              ? <Link className="crumb-link as-btn" href={hrefFor(it.page)}>{it.name}</Link>
              : <span className="crumb-current" aria-current="page">{it.name}</span>}
            {!last && <span className="crumb-sep" aria-hidden="true">›</span>}
          </span>
        );
      })}
    </nav>
  );
}
