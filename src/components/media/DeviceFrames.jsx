/** A browser window around a screenshot. `url` is shown in the address bar. */
export function BrowserFrame({ url, children }) {
  return (
    <div className="frame-browser">
      <div className="frame-browser-bar" aria-hidden="true">
        <i /><i /><i />
        {url && <span className="frame-browser-url">{url}</span>}
      </div>
      <div className="frame-browser-screen">{children}</div>
    </div>
  );
}

/** A phone around a screenshot. */
export function PhoneFrame({ children }) {
  return (
    <div className="frame-phone">
      <div className="frame-phone-body">
        <div className="frame-phone-screen">{children}</div>
      </div>
    </div>
  );
}
