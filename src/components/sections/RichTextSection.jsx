import './RichTextSection.css';

// A formatted-text section (heading + rich body). The body HTML is produced on
// the server from CMS rich text by lexicalToHtml, which escapes all text.
export default function RichTextSection({ heading, body }) {
  if (!heading && !body) return null;
  return (
    <section className="richtext-section">
      <div className="richtext-section-inner">
        {heading && <h2 className="t-display richtext-section-h">{heading}</h2>}
        {body && <div className="richtext-section-body" dangerouslySetInnerHTML={{ __html: body }} />}
      </div>
    </section>
  );
}
