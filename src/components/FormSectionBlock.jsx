import CmsForm from './CmsForm';

// Embeds a CMS form inside a built page — lets a marketer place a form on any
// landing page. `form` is the public (stripped) definition, resolved on the server.
export default function FormSectionBlock({ form, heading }) {
  return (
    <section className="shell" style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px' }}>
      {heading && <h2 className="t-display" style={{ marginBottom: 20 }}>{heading}</h2>}
      {form ? <CmsForm form={form} /> : <p style={{ color: '#8a94a0' }}>This form isn’t available.</p>}
    </section>
  );
}
