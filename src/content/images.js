// Every photograph and product screenshot the pages use, with the pixel size and
// description each <img> needs. Files live in public/assets and are made with
// scripts/optimize-image.mjs.
//
// PHOTOS are stock photographs from Pexels (free to use, including commercially, without
// attribution: https://www.pexels.com/license/). `source` records where each one came
// from. The people in them are models, not Proxa Labs staff or customers, so never place
// one next to a named quote or present it as a real person.
//
// SCREENS are real screens of the Proxa apps, captured from a local preview running demo
// content.

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
  'doctor-and-rep': {
    base: '/assets/photos/doctor-and-rep',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A physician going through a folder with a visitor in a clinic',
    source: 'https://www.pexels.com/photo/male-doctor-talking-to-a-patient-6129441/',
  },
  'doctor-conversation': {
    base: '/assets/photos/doctor-conversation',
    widths: [800, 1600],
    width: 1600,
    height: 864,
    alt: 'A physician and a visitor talking across a desk in a bright office',
    source: 'https://www.pexels.com/photo/doctor-talking-with-woman-in-white-long-sleeve-shirt-12599544/',
  },
  'lab-flasks': {
    base: '/assets/photos/lab-flasks',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'Laboratory flasks of blue, green and orange liquid on a bench',
    source: 'https://www.pexels.com/photo/glassware-with-colorful-liquid-substances-on-a-lab-desk-8540819/',
  },
  'learner-laptop': {
    base: '/assets/photos/learner-laptop',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A woman studying at a laptop in front of a large window',
    source: 'https://www.pexels.com/photo/woman-in-white-crew-neck-t-shirt-using-white-laptop-3866279/',
  },
  'learner-window-desk': {
    base: '/assets/photos/learner-window-desk',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A woman working at a laptop at a white desk by a window',
    source: 'https://www.pexels.com/photo/woman-in-black-long-blazer-using-a-laptop-7679583/',
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
  'team-at-laptop': {
    base: '/assets/photos/team-at-laptop',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'Three colleagues reviewing work together on a laptop',
    source: 'https://www.pexels.com/photo/a-group-of-people-having-a-meeting-in-the-office-6248988/',
  },
  'team-round-table': {
    base: '/assets/photos/team-round-table',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A team meeting around a round table in a sunlit office',
    source: 'https://www.pexels.com/photo/a-group-of-people-having-a-meeting-in-the-office-6248989/',
  },
  'training-question': {
    base: '/assets/photos/training-question',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A participant raising a hand during a training session',
    source: 'https://www.pexels.com/photo/a-woman-doing-a-presentation-using-graphs-on-a-whiteboard-9034268/',
  },
  'training-session': {
    base: '/assets/photos/training-session',
    widths: [800, 1600],
    width: 1600,
    height: 1067,
    alt: 'A facilitator presenting a chart to a seated group',
    source: 'https://www.pexels.com/photo/business-woman-discussing-in-a-meeting-9034755/',
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
  'cue-lms-desktop': {
    base: '/assets/product/cue-lms-desktop',
    widths: [900, 1800],
    width: 1800,
    height: 1125,
    alt: 'Proxa Cue course library showing three demo courses',
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
  'cue-lms-mobile': {
    base: '/assets/product/cue-lms-mobile',
    widths: [390, 780],
    width: 780,
    height: 1688,
    alt: 'Proxa Cue course library on a phone',
  },
  'cue-competencies-mobile': {
    base: '/assets/product/cue-competencies-mobile',
    widths: [390, 780],
    width: 780,
    height: 1688,
    alt: 'Proxa Cue competency scores on a phone',
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
