'use client';

import TiltedCard from '../reactbits/TiltedCard';

/**
 * Makes its content float: it drifts gently, tilts towards the pointer, and anything
 * passed as `overlay` sits a little in front and moves with more depth. This is React
 * Bits' TiltedCard with the site's settings (no flip, no gyroscope prompt on phones, no
 * entrance animation, so an image inside can be the first thing painted).
 * `aspect` is the CSS aspect-ratio of the frame; the content fills it.
 */
export default function FloatingFrame({ aspect, radius = 24, overlay = null, lift = 36, amplitude = 6, className, children }) {
  return (
    <TiltedCard
      className={className}
      style={{ aspectRatio: aspect }}
      containerWidth="100%"
      containerHeight="auto"
      imageWidth="100%"
      imageHeight="100%"
      radius={radius}
      rotateAmplitude={amplitude}
      scaleOnHover={1.015}
      glare={0.18}
      shadow={0.28}
      floating
      gyroscope={false}
      intro={false}
      showTooltip={false}
      flipOnClick={false}
      overlayContent={overlay}
      displayOverlayContent={Boolean(overlay)}
      overlayDepth={lift}
    >
      {children}
    </TiltedCard>
  );
}
