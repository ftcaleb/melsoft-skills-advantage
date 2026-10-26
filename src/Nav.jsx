import { MAIN_SITE } from "./event.js";

/* The melsoftacademy.com floating pill nav, without its nav links: the same
   glass pill, width, shadow, logo and button styling. Unlike the main site
   it does not shrink on scroll — it stays at full size with the full logo.

   The button reads "RSVP now" (the main site's says "Apply now") and scrolls
   to the form. Values are in page.css under "Nav". */
export default function Nav({ onRsvp, showRsvp = true }) {
  return (
    <div className="sa-nav">
      <div className="sa-nav-row">
        <nav className="sa-nav-pill" aria-label="Main">
          <a href={MAIN_SITE} className="sa-nav-logo" aria-label="Melsoft Academy home">
            {/* logo-light.webp is 702x302 */}
            <img
              src="/images/logo-light.webp"
              alt="Melsoft Academy"
              width={88}
              height={38}
              fetchPriority="high"
              decoding="sync"
            />
          </a>
          {showRsvp && (
            <button type="button" className="sa-nav-cta" onClick={onRsvp}>
              RSVP now
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
