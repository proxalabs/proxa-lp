import { jsonLdString } from '../lib/jsonLd';

// Structured data rendered into the server HTML, so crawlers and AI tools read it
// without running any JavaScript.
export default function JsonLd({ data }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
