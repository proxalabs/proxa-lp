import { BrowserFrame, PhoneFrame } from './DeviceFrames';
import FloatingFrame from './FloatingFrame';
import Photo from './Photo';

/**
 * A real product screen in a floating browser window, with the same product on a phone
 * in front of it. `desktop` and `mobile` are screenshot names from content/images.js.
 */
export default function ProductGlimpse({ desktop, mobile, url }) {
  const phone = mobile && (
    <div className="glimpse-phone">
      <PhoneFrame><Photo name={mobile} sizes="200px" /></PhoneFrame>
    </div>
  );
  return (
    <div className={mobile ? 'glimpse glimpse-with-phone' : 'glimpse'}>
      <FloatingFrame aspect="1800 / 1219" radius={14} overlay={phone} lift={46} amplitude={5}>
        <BrowserFrame url={url}>
          <Photo name={desktop} sizes="(max-width: 960px) 92vw, 640px" />
        </BrowserFrame>
      </FloatingFrame>
    </div>
  );
}
