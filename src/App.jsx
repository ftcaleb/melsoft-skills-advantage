import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import Nav from "./Nav.jsx";
import { EVENT, ATTENDANCE, ROLES, MAIN_SITE } from "./event.js";
import { sendRegistration, registrationConfigured, getLeadSource } from "./registration.js";

/* ── The Skills Advantage — RSVP page ──────────────────────────────────
   One page: the heading, event banner and details on the left, the RSVP
   form on the right. Submissions go to apps-script/Code.gs (see registration.js).
   Event copy lives in event.js. */

const FIELDS = [
  { key: "fullName", label: "Name", type: "text", placeholder: "Full name", autoComplete: "name" },
  { key: "workEmail", label: "Corporate email", type: "email", placeholder: "you@company.co.za", autoComplete: "email" },
  { key: "phone", label: "Phone number", type: "tel", placeholder: "082 123 4567", autoComplete: "tel" },
  { key: "role", label: "Job title / Designation", placeholder: "Select one", options: ROLES },
  { key: "company", label: "Company / Organisation", type: "text", placeholder: "Company name", autoComplete: "organization" },
];

const smoothScroll = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export default function App() {
  const [data, setData] = useState({
    fullName: "", role: "", workEmail: "", phone: "", company: "", dietary: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const cardRef = useRef(null);

  const toForm = () => cardRef.current?.scrollIntoView({ behavior: smoothScroll(), block: "start" });

  // The confirmation replaces the form in place, so bring the card back
  // into view — the visitor is scrolled to the bottom of a taller form.
  useEffect(() => {
    if (submitted) toForm();
  }, [submitted]);

  const update = (key, value) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!data.fullName.trim()) errs.fullName = "Enter your name";
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(data.workEmail)) errs.workEmail = "Enter a valid work email";
    if (!data.phone.trim()) errs.phone = "Enter a phone number";
    if (!data.role) errs.role = "Choose your job title";
    if (!data.company.trim()) errs.company = "Enter your company";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!registrationConfigured()) {
      setSubmitError("Registration isn't live yet — please check back shortly or contact us directly.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await sendRegistration({
        timestamp: new Date().toISOString(),
        event: EVENT.id,
        name: data.fullName.trim(),
        email: data.workEmail.trim(),
        phone: data.phone.trim(),
        role: data.role,
        company: data.company.trim(),
        attendance: ATTENDANCE,
        dietary: data.dietary.trim(),
        source: getLeadSource(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Registration failed:", err);
      setSubmitError("Sorry, we couldn't complete your registration. Please check your network or try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldProps = (key) => ({
    id: key,
    value: data[key],
    onChange: (e) => update(key, e.target.value),
    disabled: submitting,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-err` : undefined,
  });

  return (
    <>
      <Nav />
      <div className="sa-nav-spacer" aria-hidden="true" />

      <main className="page-enter wr-page">
        <div className="wr-layout">
        <section className="wr-hero">
          {/* 1. Heading */}
          <div className="wr-hero-head">
            <span className="wr-rule" aria-hidden="true" />
            <h1 className="wr-title">
              <span>{EVENT.titleLead}</span> <span className="wr-accent">{EVENT.titleAccent}</span>
            </h1>
            <p className="wr-subtitle">
              {EVENT.subtitle} <em>{EVENT.year}</em>
            </p>
            <p className="wr-intro">{EVENT.intro}</p>
          </div>

          {/* 2. Photo */}
          <div className="wr-hero-media">
            <img
              src="/images/event-space.webp"
              alt="A speaker addressing a seated audience at a Melsoft Academy event, beneath the Melsoft Academy logo"
              width={2172}
              height={724}
              fetchPriority="high"
            />
          </div>

          {/* 3. Event details */}
          <ul className="wr-details">
            {EVENT.details.map((d) => (
              <li key={d.icon}>
                <Icon name={d.icon} size={20} />
                <span className="wr-detail-main">
                  {d.main}
                  {d.note && <span className="wr-detail-note">{d.note}</span>}
                </span>
              </li>
            ))}
          </ul>

          {!submitted && (
            <button type="button" className="wr-jump" onClick={toForm}>
              Reserve your place
              <Icon name="chevron-down" size={16} strokeWidth={2} />
            </button>
          )}
        </section>

        <section className="wr-reserve" aria-labelledby="wr-card-title">
          <div className="wr-card" ref={cardRef}>
            <span className="wr-rule" aria-hidden="true" />

            {submitted ? (
              <div className="wr-done" role="status">
                <h2 id="wr-card-title" className="wr-card-title">You're on the list.</h2>
                <p className="wr-done-copy">
                  We've saved your place at {EVENT.name}. Keep an eye on{" "}
                  <strong>{data.workEmail}</strong> for the details.
                </p>
                <dl className="wr-summary">
                  <div>
                    <dt>Attending</dt>
                    <dd>{ATTENDANCE}</dd>
                  </div>
                  <div>
                    <dt>Name</dt>
                    <dd>{data.fullName}</dd>
                  </div>
                </dl>
                <a className="wr-back" href={MAIN_SITE}>
                  Visit melsoftacademy.com
                  <Icon name="arrow-right" size={16} strokeWidth={2} />
                </a>
              </div>
            ) : (
              <>
                <h2 id="wr-card-title" className="wr-card-title">Reserve your place</h2>
                <p className="wr-card-kicker">Takes less than a minute</p>

                <form className="wr-form" noValidate onSubmit={handleSubmit}>
                  {FIELDS.map((f) => (
                    <div key={f.key} className={"wr-field" + (errors[f.key] ? " is-error" : "")}>
                      <label className="wr-label" htmlFor={f.key}>
                        {f.label} <span className="wr-req" aria-hidden="true">*</span>
                      </label>
                      {f.options ? (
                        <div className="wr-select">
                          <select
                            className={"wr-input" + (data[f.key] ? "" : " is-empty")}
                            required
                            {...fieldProps(f.key)}
                          >
                            <option value="" disabled>{f.placeholder}</option>
                            {f.options.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                          <Icon name="chevron-down" size={16} strokeWidth={2} />
                        </div>
                      ) : (
                        <input
                          className="wr-input"
                          type={f.type}
                          placeholder={f.placeholder}
                          autoComplete={f.autoComplete}
                          required
                          {...fieldProps(f.key)}
                        />
                      )}
                      {errors[f.key] && <span id={`${f.key}-err`} className="wr-err">{errors[f.key]}</span>}
                    </div>
                  ))}

                  <div className="wr-field">
                    <label className="wr-label" htmlFor="dietary">
                      Dietary requirements <span className="wr-opt">Optional</span>
                    </label>
                    <input
                      className="wr-input"
                      type="text"
                      placeholder="Any dietary requirements or allergies"
                      {...fieldProps("dietary")}
                    />
                  </div>

                  {submitError && <div className="wr-alert" role="alert">{submitError}</div>}

                  <button type="submit" className="wr-submit" disabled={submitting}>
                    {submitting ? "Confirming…" : "Confirm RSVP"}
                    {!submitting && <Icon name="arrow-right" size={16} strokeWidth={2} />}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
        </div>
      </main>

      <footer className="sa-footer">
        <p className="sa-footer-mark">Melsoft Academy</p>
        <p className="sa-footer-links">
          © {new Date().getFullYear()} Melsoft Academy ·{" "}
          <a href={MAIN_SITE}>melsoftacademy.com</a> ·{" "}
          <a href={`${MAIN_SITE}/privacy-policy`}>Privacy Policy</a>
        </p>
      </footer>
    </>
  );
}
