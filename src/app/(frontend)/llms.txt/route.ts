import { getIndexable, type Listed } from '@/lib/data/listing'
import { SITE_URL } from '@/lib/site'

// llms.txt: an always-current index of the site for AI crawlers and assistants.
// The fixed pages are hand-described; every published post, case study, video and
// landing page is appended the moment it is published.
export const revalidate = 300

const HEADER = `# Proxa Labs

> Proxa Labs is the AI implementation partner built for biopharma commercial learning — advisory, an AI platform, and structured experimentation. Methodology-first, compliance by design.

## Pages
- [Platform](%o/platform): The closed-loop AI platform — Forge builds content, Cue delivers learning, Stage assesses readiness, Trace confirms competency.
- [Advisory](%o/advisory): AI strategy, readiness assessments, governance, and infrastructure planning for biopharma commercial L&D.
- [AI Literacy](%o/ai-literacy): Role-targeted AI fluency tracks for the commercial organization.
- [InsiteX LMS](%o/insitex-lms): Enterprise learning management built for biopharma compliance.
- [Content Development](%o/content-development): MLR-compliant content development, AI-powered or traditional.
- [The Lab](%o/the-lab): Structured AI experimentation — define the use case, design the experiment, measure what matters.
- [News](%o/news): Product releases, company announcements, and research milestones from Proxa Labs.
- [About](%o/about): 25 years of biopharma commercial learning expertise applied to AI implementation.
- [Contact](%o/contact): Start a conversation.`

const line = (d: Listed) => {
  const desc = String(d.description || '').replace(/\s+/g, ' ').trim().slice(0, 220)
  return `- [${d.title}](${SITE_URL}${d.path})${desc ? `: ${desc}` : ''}`
}
const section = (heading: string, docs: Listed[]) => (docs.length ? `\n\n## ${heading}\n${docs.map(line).join('\n')}` : '')

export async function GET() {
  const { posts, caseStudies, videos, pages } = await getIndexable()
  const body =
    HEADER.replace(/%o/g, SITE_URL) +
    section('Blog posts', posts) +
    section('Case studies', caseStudies) +
    section('Videos', videos) +
    section('More pages', pages) +
    '\n'
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
