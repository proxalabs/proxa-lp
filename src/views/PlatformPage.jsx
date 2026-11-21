import EditorialHero from '../components/sections/EditorialHero';
import ProductShowcase from '../components/sections/ProductShowcase';
import UpgradeComparison from '../components/sections/UpgradeComparison';
import ProductGlimpse from '../components/media/ProductGlimpse';
import LoopVisual from '../components/LoopVisual';
import { PRODUCT_TOUR } from '../content/productTour';
import { makeGetter } from '../lib/pageContent';
import { hrefFor } from '../lib/routes';

// A product's real screens, in a browser window with a phone in front: the same ones the
// home page's product tour shows for it.
function RealScreens({ app }) {
  const { name, desktop, mobile, url } = PRODUCT_TOUR.find((slide) => slide.id === app);
  return (
    <div className="product-showcase-real">
      <ProductGlimpse desktop={desktop} mobile={mobile} url={url} />
      <div className="product-showcase-real-note">{name}, running demo content</div>
    </div>
  );
}

// Plain-text defaults for headings that carry inline markup. When the override
// equals the default, render the rich (italic) JSX; otherwise render the plain string.
const HERO_HEADLINE_DEFAULT = 'One platform. Four products. A closed loop that never breaks.';

export default function PlatformPage({ content }) {
  const c = makeGetter(content);
  const hh = c('hero.headline');
  const heroHeadline = hh === HERO_HEADLINE_DEFAULT
    ? (
      // Each short sentence stays whole, so beside the diagram the lines break between them.
      <>
        <span className="hero-sentence">One platform.</span> <span className="hero-sentence">Four products.</span>{' '}
        <em>A closed loop that never breaks.</em>
      </>
    )
    : <>{hh}</>;
  return (
    <>
      <EditorialHero
        eyebrow={c('hero.eyebrow')}
        headline={heroHeadline}
        subhead={c('hero.subhead')}
        primaryCta={{ label: c('hero.ctaLabel'), href: hrefFor("contact") }}
        visual={<LoopVisual />}
        className="hero-with-loop"
      />

      <ProductShowcase
        id="forge"
        product="forge"
        eyebrow={c('forge.eyebrow')}
        tagline={c('forge.tagline')}
        body={c('forge.body')}
        bullets={[
          "Auto-generation from clinical data and PI",
          "Every claim cited — MLR artifacts auto-built",
          "Veeva PromoMats workflow integration",
          "Content Gap Analyzer feeds directly from Stage failures",
        ]}
        mockup={<RealScreens app="forge" />}
      />

      <ProductShowcase
        product="atlas"
        eyebrow={c('cue.eyebrow')}
        tagline={c('cue.tagline')}
        body={c('cue.body')}
        bullets={[
          "Competency-role mapping with behavioral rubrics",
          "Adaptive pathways that respond dynamically to gaps",
          "Manager dashboards with predictive readiness scoring",
          "Integrates with InsiteX LMS and Veeva",
        ]}
        mockup={<RealScreens app="cue" />}
        reverse
        background="tinted"
      />

      <ProductShowcase
        product="echo"
        eyebrow={c('stage.eyebrow')}
        tagline={c('stage.tagline')}
        body={c('stage.body')}
        bullets={[
          "8 HCP digital twin avatars with behavioral models",
          "ComplianceGuard: real-time compliance flagging",
          "Behavioral scorecard + industry benchmarks",
          "Gap payload triggers Forge auto-rebuild pipeline",
        ]}
        mockup={<RealScreens app="stage" />}
      />

      <ProductShowcase
        product="certify"
        eyebrow={c('trace.eyebrow')}
        tagline={c('trace.tagline')}
        body={c('trace.body')}
        bullets={[
          "Competency-gated — no attendance shortcuts",
          "Behavioral evidence for every issued certification",
          "SOC 2 Type II compliant, SHA-256 audit logs",
          "10-year retention for regulatory inspection",
        ]}
        mockup={<RealScreens app="trace" />}
        reverse
        background="tinted"
      />

      <UpgradeComparison
        eyebrow={c('compare.eyebrow')}
        heading={c('compare.heading')}
        lead={c('compare.lead')}
      />
    </>
  );
}
