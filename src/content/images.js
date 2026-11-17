// Every photograph and product screenshot the pages use, with the pixel size and
// description each <img> needs. Files live in public/assets and are made with
// scripts/optimize-image.mjs.
//
// PHOTOS are stock photographs from Pexels (free to use, including commercially, without
// attribution: https://www.pexels.com/license/). `source` records where each one came
// from. The people in them are models, not Proxa Labs staff or customers, so never place
// one next to a named quote or present it as a real person.
//
// SCREENS are real screens of the four Proxa apps, captured from local runs on throwaway
// data holding demo content only (made-up organisations, people and training text).

export const PHOTOS = {
  'advisor-conversation': {
    base: '/assets/photos/advisor-conversation',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'Two colleagues talking over a printed report in a bright office',
    source: 'https://www.pexels.com/photo/man-and-woman-having-a-discussion-5918205/',
  },
  'author-at-laptop': {
    base: '/assets/photos/author-at-laptop',
    widths: [800, 1600],
    width: 1600,
    height: 1068,
    alt: 'A woman working at a laptop beside a large window',
    source: 'https://www.pexels.com/photo/woman-in-white-crew-neck-shirt-wearing-brown-framed-eyeglasses-using-macbook-3768161/',
  },
  'colleagues-at-laptop': {
    base: '/assets/photos/colleagues-at-laptop',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'Two colleagues talking through their notes at a laptop',
    source: 'https://www.pexels.com/photo/men-sitting-by-the-table-with-laptop-5256991/',
  },
  'doctor-and-rep': {
    base: '/assets/photos/doctor-and-rep',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A physician going through a folder with a visitor in a clinic',
    source: 'https://www.pexels.com/photo/male-doctor-talking-to-a-patient-6129441/',
  },
  'employee-at-laptop': {
    base: '/assets/photos/employee-at-laptop',
    widths: [800, 1600],
    width: 1600,
    height: 2400,
    alt: 'A man in glasses working at a laptop in a bright office',
    source: 'https://www.pexels.com/photo/brunette-man-in-eyeglasses-working-on-a-laptop-12903252/',
  },
  'lab-flasks': {
    base: '/assets/photos/lab-flasks',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'Laboratory flasks of blue, green and orange liquid on a bench',
    source: 'https://www.pexels.com/photo/glassware-with-colorful-liquid-substances-on-a-lab-desk-8540819/',
  },
  // Edited from the original: widened from 3:2 to 16:9 by continuing the plain wall past the
  // right edge, so the man sits in the middle of a wide band, and the wall evened out and
  // brightened to white. Also made at 2400px because it is shown full width, where a 1600px
  // file looks soft on a high-density screen.
  'laptop-white-wall': {
    base: '/assets/photos/laptop-white-wall',
    widths: [800, 1600, 2400],
    width: 2400,
    height: 1350,
    alt: 'A man in glasses working on a laptop in front of a plain white wall',
    source: 'https://www.pexels.com/photo/a-man-using-a-laptop-7583973/',
    photographer: 'Mikhail Nilov',
  },
  'meeting-by-window': {
    base: '/assets/photos/meeting-by-window',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'Two colleagues working at laptops at a long table beside a wide window',
    source: 'https://www.pexels.com/photo/smiling-colleagues-in-a-meeting-7993951/',
  },
  'sticky-notes-glass': {
    base: '/assets/photos/sticky-notes-glass',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A team arranging sticky notes on a glass wall',
    source: 'https://www.pexels.com/photo/colleagues-looking-at-sticky-notes-9301872/',
  },
  'strategy-whiteboard': {
    base: '/assets/photos/strategy-whiteboard',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'Four people planning together at a whiteboard wall',
    source: 'https://www.pexels.com/photo/engineers-planning-structure-3862370/',
    photographer: 'ThisIsEngineering',
  },
  'team-chart-review': {
    base: '/assets/photos/team-chart-review',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'Three colleagues talking beside a board of charts while a fourth works at a laptop',
    source: 'https://www.pexels.com/photo/colleagues-working-in-an-office-7876739/',
  },
  'team-data-briefing': {
    base: '/assets/photos/team-data-briefing',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A presenter standing at a large screen of charts, speaking to seated colleagues',
    source: 'https://www.pexels.com/photo/a-man-making-a-business-presentation-to-colleagues-9301257/',
  },
  'team-loft-table': {
    base: '/assets/photos/team-loft-table',
    widths: [800, 1600],
    width: 1600,
    height: 1058,
    alt: 'A senior colleague talking a small team through their work at a table in a bright loft office',
    source: 'https://www.pexels.com/photo/people-having-a-meeting-3860801/',
  },
  'team-round-table': {
    base: '/assets/photos/team-round-table',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A team meeting around a round table in a sunlit office',
    source: 'https://www.pexels.com/photo/a-group-of-people-having-a-meeting-in-the-office-6248989/',
  },
  // Edited from the original: the heading printed on the lower chart sheet ("Finance review")
  // was painted out, because the page it is on is about AI training.
  'trainer-with-charts': {
    base: '/assets/photos/trainer-with-charts',
    widths: [800, 1600],
    width: 1600,
    height: 2400,
    alt: 'A trainer pointing to charts on a flip chart',
    source: 'https://www.pexels.com/photo/a-man-in-corporate-attire-pointing-at-charts-on-a-whiteboard-7877029/',
  },
}

export const SCREENS = {
  'cue-dashboard-desktop': {
    base: '/assets/product/cue-dashboard-desktop',
    widths: [900, 1800],
    width: 1800,
    height: 1125,
    alt: 'Proxa Cue learner dashboard with suggested next steps and the active pathway',
  },
  'cue-lesson-desktop': {
    base: '/assets/product/cue-lesson-desktop',
    widths: [900, 1800],
    width: 1800,
    height: 1125,
    alt: 'A lesson in a Proxa Cue demo course, with the course outline beside the lesson text',
  },
  'cue-competencies-desktop': {
    base: '/assets/product/cue-competencies-desktop',
    widths: [900, 1800],
    width: 1800,
    height: 1125,
    alt: 'Proxa Cue competency framework with scores and gaps for a sales rep',
  },
  'cue-dashboard-mobile': {
    base: '/assets/product/cue-dashboard-mobile',
    widths: [390, 780],
    width: 780,
    height: 1688,
    alt: 'Proxa Cue learner dashboard on a phone',
  },
  'cue-lesson-mobile': {
    base: '/assets/product/cue-lesson-mobile',
    widths: [390, 780],
    width: 780,
    height: 1688,
    alt: 'A lesson in a Proxa Cue demo course on a phone',
  },
  'cue-competencies-mobile': {
    base: '/assets/product/cue-competencies-mobile',
    widths: [390, 780],
    width: 780,
    height: 1688,
    alt: 'Proxa Cue competency scores on a phone',
  },
  'forge-workflow-desktop': {
    base: '/assets/product/forge-workflow-desktop',
    widths: [900, 1800],
    width: 1800,
    height: 1125,
    alt: 'Proxa Forge workflow canvas: a training content pipeline of seven agents, an approval step and an export to Cue',
  },
  'forge-agents-mobile': {
    base: '/assets/product/forge-agents-mobile',
    widths: [390, 780],
    width: 780,
    height: 1688,
    alt: 'Proxa Forge list of agents on a phone',
  },
  // A frame from a live roleplay run locally: the character is one of HeyGen's public
  // avatars, and the learner's camera tile shows a Pexels photo standing in for a webcam
  // (https://www.pexels.com/photo/man-in-blue-long-sleeve-shirt-holding-8867257/).
  'stage-session-desktop': {
    base: '/assets/product/stage-session-desktop',
    widths: [900, 1800],
    width: 1800,
    height: 1125,
    alt: 'A live roleplay in Proxa Stage: an AI cardiologist speaking on video, with the learner’s camera, the conversation and coaching suggestions beside it',
  },
  'stage-roleplays-desktop': {
    base: '/assets/product/stage-roleplays-desktop',
    widths: [900, 1800],
    width: 1800,
    height: 1125,
    alt: 'Proxa Stage roleplay library with assigned practice conversations and their last scores',
  },
  'stage-briefing-mobile': {
    base: '/assets/product/stage-briefing-mobile',
    widths: [390, 780],
    width: 780,
    height: 1688,
    alt: 'Proxa Stage briefing for a roleplay with a cardiologist, on a phone',
  },
  'trace-report-desktop': {
    base: '/assets/product/trace-report-desktop',
    widths: [900, 1800],
    width: 1800,
    height: 1125,
    alt: 'Proxa Trace programme health report with a readiness index and completion rates by stage and region',
  },
  'trace-team-mobile': {
    base: '/assets/product/trace-team-mobile',
    widths: [390, 780],
    width: 780,
    height: 1688,
    alt: 'Proxa Trace team report on a phone, showing the readiness index',
  },
}

/**
 * The attributes an <img> needs for one of the images above: the largest file as the
 * fallback, every size in srcSet, and the intrinsic size so the browser reserves the space.
 * `sizes` says how wide the image is shown, e.g. '(max-width: 960px) 100vw, 560px'.
 */
export function imageProps(image, sizes = '100vw') {
  return {
    src: `${image.base}-${image.width}.webp`,
    srcSet: image.widths.map((w) => `${image.base}-${w}.webp ${w}w`).join(', '),
    sizes,
    width: image.width,
    height: image.height,
    alt: image.alt,
  }
}
