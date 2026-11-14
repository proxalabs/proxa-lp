// Default title, description and indexing rule for each fixed route. The CMS can
// override title/description/image per page; these are the fallbacks.

export const PAGE_TITLES = {
  home: "Proxa Labs · AI-First Commercial Learning for Biopharma",
  platform: "AI Platform · Forge, Cue, Stage & Trace · Proxa Labs",
  advisory: "Advisory Services · AI Strategy for Biopharma L&D · Proxa Labs",
  literacy: "AI Literacy Program · Role-Targeted AI Fluency · Proxa Labs",
  insitex: "InsiteX LMS · Enterprise Learning for Biopharma · Proxa Labs",
  content: "Content Development · MLR-Compliant Biopharma Content · Proxa Labs",
  proxalab: "The Lab · Structured AI Experimentation · Proxa Labs",
  about: "About Proxa Labs · Innovation-Led Biopharma L&D",
  news: "Announcements · Latest from Proxa Labs",
  resources: "Resources · Frameworks, Guides & Templates · Proxa Labs",
  newsletter: "Newsletter · Stay Ahead of AI in Biopharma · Proxa Labs",
  contact: "Contact Proxa Labs · Start a Conversation",
  futureproof: "Future-Proof Your Organization · Proxa Labs",
  innovation: "Proxa Labs Innovation Collective",
  blog: "Blog · Proxa Labs",
  newsHub: "News · Proxa Labs",
  caseStudies: "Case Studies · Proxa Labs",
  videos: "Videos · Proxa Labs",
  search: "Search · Proxa Labs",
  notfound: "Page not found · Proxa Labs",
};

export const PAGE_DESCRIPTIONS = {
  home: "Proxa Labs is the AI implementation partner built for biopharma commercial learning. Advisory, platform, and experimentation — methodology-first, compliance by design.",
  platform: "The only closed-loop AI platform in biopharma: Forge builds content, Cue delivers learning, Stage assesses readiness, Trace confirms competency.",
  advisory: "AI strategy, readiness assessments, governance frameworks, and infrastructure planning — advisory services purpose-built for biopharma commercial L&D.",
  literacy: "Role-targeted AI literacy tracks for every part of your commercial organization. Build fluency before deploying tools.",
  insitex: "Enterprise learning management built for biopharma compliance. SCORM, AICC, and PMRC compliance. The foundation the AI platform builds on.",
  content: "MLR-compliant content development — AI-powered (Forge) or traditional instructional design. Built by biopharma commercial practitioners.",
  proxalab: "Structured AI experimentation for biopharma. Define the right use case, design the experiment, measure what matters, build the business case.",
  about: "Proxa Labs brings 25 years of biopharma commercial learning expertise to AI implementation. Innovation-led, compliance by design.",
  news: "Announcements, partnerships, product updates, and research milestones from Proxa Labs and The Lab.",
  resources: "Frameworks, guides, templates, and research from 25 years of biopharma commercial L&D expertise.",
  newsletter: "Frameworks, research, and field notes from Proxa Labs' practitioners. Sent when there's something worth saying.",
  contact: "Start a conversation with Proxa Labs. Ready to talk, want to learn first, or just exploring — we'll meet you where you are.",
  futureproof: "An executive brief from Proxa Labs on building durable AI capability across biopharma commercial organizations.",
  innovation: "An invitation-only working session for commercial L&D leaders in life sciences on the state of AI. By invitation only.",
  blog: "Field notes and frameworks from Proxa Labs on commercial readiness, AI evidence, and closing the gap between training and a field that can perform.",
  newsHub: "Product releases, company announcements, and research milestones from Proxa Labs and The Lab.",
  caseStudies: "Real biopharma commercial teams, real results — the challenge, what Proxa Labs did, and the outcomes.",
  videos: "Short, practical videos on AI in biopharma commercial learning — strategy, evidence, and the field.",
  search: "Search Proxa Labs.",
  notfound: "The page you're looking for doesn't exist or has moved.",
};

// Campaign, placeholder and private pages that must not be indexed.
export const NOINDEX_PAGES = new Set(["futureproof", "innovation", "notfound", "search"]);
