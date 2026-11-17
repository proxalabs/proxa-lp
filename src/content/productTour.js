// The four products as the home page's product tour shows them, in the order of the loop.
// `desktop` and `mobile` name real screens in content/images.js, and `body` says what is
// on them.
export const PRODUCT_TOUR = [
  {
    id: 'forge',
    name: 'Proxa Forge',
    body: 'A content workflow run by agents, from source intake to MLR review, sign-off and export to Cue.',
    desktop: 'forge-workflow-desktop',
    mobile: 'forge-agents-mobile',
    url: 'forge.proxalabs.com',
  },
  {
    id: 'cue',
    name: 'Proxa Cue',
    body: 'A sales rep scored against the competency framework for their role, with gaps flagged and next steps suggested.',
    desktop: 'cue-competencies-desktop',
    mobile: 'cue-dashboard-mobile',
    url: 'cue.proxalabs.com',
  },
  {
    id: 'stage',
    name: 'Proxa Stage',
    body: 'A live roleplay with an AI cardiologist: the character on video, the conversation so far and coaching tips for the next reply.',
    desktop: 'stage-session-desktop',
    mobile: 'stage-briefing-mobile',
    url: 'stage.proxalabs.com',
  },
  {
    id: 'trace',
    name: 'Proxa Trace',
    body: 'Readiness and completion by learning stage and region, in one report.',
    desktop: 'trace-report-desktop',
    mobile: 'trace-team-mobile',
    url: 'trace.proxalabs.com',
  },
]

/** The slide `delta` places on from `current`, going round at both ends. */
export function stepIndex(current, delta, count) {
  return (current + delta + count) % count
}

const SWIPE_MIN = 40

/**
 * What a finger that moved (dx, dy) pixels asked for: 1 for the next slide (a swipe to the
 * left), -1 for the previous one, 0 for a tap or a mostly vertical move (page scrolling).
 */
export function swipeStep(dx, dy) {
  if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) <= Math.abs(dy)) return 0
  return dx < 0 ? 1 : -1
}
