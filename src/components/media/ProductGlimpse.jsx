import { BrowserFrame, PhoneFrame } from './DeviceFrames';
import FloatingFrame from './FloatingFrame';
import Photo from './Photo';

/**
 * A real product screen in a floating browser window, with the same product on a phone
 * in front of it. `desktop` and `mobile` are screenshot names from content/images.js.
 *
 * To show several products in the same frames, pass `slides` (each with `desktop`,
 * `mobile` and `url`) and the index of the `active` one: the screens cross-fade.
 */
export default function ProductGlimpse({ desktop, mobile, url, slides, active = 0 }) {
  const list = slides || [{ desktop, mobile, url }];
  const hasPhone = Boolean(list[0].mobile);
  const phone = hasPhone && (
    <div className="glimpse-phone">
      <PhoneFrame><Screens names={list.map((slide) => slide.mobile)} active={active} sizes="200px" /></PhoneFrame>
    </div>
  );
  return (
    <div className={hasPhone ? 'glimpse glimpse-with-phone' : 'glimpse'}>
      <FloatingFrame aspect="1800 / 1219" radius={14} overlay={phone} lift={46} amplitude={5}>
        <BrowserFrame url={list[active].url}>
          <Screens names={list.map((slide) => slide.desktop)} active={active} sizes="(max-width: 960px) 92vw, 640px" />
        </BrowserFrame>
      </FloatingFrame>
    </div>
  );
}

/** One screen, or several stacked in the same place with only the active one showing. */
function Screens({ names, active, sizes }) {
  if (names.length === 1) return <Photo name={names[0]} sizes={sizes} />;
  return (
    <div className="screen-stack">
      {names.map((name, i) => (
        <div key={name} className={i === active ? 'screen-stack-item is-active' : 'screen-stack-item'} aria-hidden={i !== active}>
          <Photo name={name} sizes={sizes} />
        </div>
      ))}
    </div>
  );
}
