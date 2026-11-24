import Link from 'next/link';
import SearchBox from '../components/SearchBox';
import '../components/ArticleLayout.css';
import './SearchPage.css';

// Site search. Results are rendered on the server from the ?q= parameter; the box
// updates the URL as you type.
export default function SearchPage({ query, results }) {
  const q = (query || '').trim();
  return (
    <div className="proxa-article">
      <section className="shell blog-index">
        <h1 className="blog-title">Search</h1>
        <SearchBox initialQuery={query || ''} />
        {!q ? <p className="blog-sub">Type above to search the site.</p>
          : results.length === 0 ? <p className="blog-sub">No results for “{q}”.</p>
            : (
              <ul className="search-results">
                {results.map((r, i) => (
                  <li key={i}>
                    <Link href={r.url}>
                      <span className="search-type">{r.type}</span>
                      <span className="search-title">{r.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
      </section>
    </div>
  );
}
