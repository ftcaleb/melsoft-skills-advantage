import { MAIN_SITE } from "./event.js";

/* The melsoftacademy.com floating pill nav, without its nav links: the same
   pill shape, width, shadow and logo, but solid white instead of frosted
   glass, and it does not shrink on scroll. The event name sits on the right,
   set like the page title. Values are in page.css under "Nav". */
export default function Nav() {
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
          <span className="sa-nav-event">
            Skills <span>Advantage</span>
          </span>
        </nav>
      </div>
    </div>
  );
}
