/* global React, ReactDOM, COPY */
const { useState, useEffect, useMemo, useRef, useCallback } = React;

/* ------------------------------ helpers ------------------------------ */
const useLang = () => {
  const [lang, setLang] = useState("id");
  const t = useCallback((key) => {
    const entry = COPY[key];
    if (!entry) return key;
    return entry[lang] ?? entry.en ?? key;
  }, [lang]);
  return { lang, setLang, t };
};

const fmtIDR = (n) => "Rp " + n.toLocaleString("id-ID");

const WA_NUMBER = "6281382032506";
const WA_MSG = encodeURIComponent("Halo, saya ingin menanyakan reservasi di Hotel Nusantara.");
const WA_HREF = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;

const HERO_PHOTO = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80";

const ROOMS = [
  {
    id: "heritage",
    nameKey: "room_a_name", descKey: "room_a_desc",
    bedKey: "bed_king", guestsKey: "guests_2", viewKey: "view_city",
    price: 4250000, photo: "Heritage Room",
    photoNote: "interior, evening light",
    photoUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "thamrin",
    nameKey: "room_b_name", descKey: "room_b_desc",
    bedKey: "bed_suite", guestsKey: "guests_3", viewKey: "view_pool",
    price: 8750000, photo: "Thamrin Suite",
    photoNote: "sitting room, morning",
    tagKey: "popular",
    photoUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "diplomat",
    nameKey: "room_c_name", descKey: "room_c_desc",
    bedKey: "bed_suite", guestsKey: "guests_4", viewKey: "view_sky",
    price: 22500000, photo: "Diplomat Suite",
    photoNote: "corner suite, golden hour",
    photoUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80",
  },
];

const WaIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className="wa-ico" aria-hidden="true">
    <path d="M19.05 4.91A10 10 0 0 0 12 2C6.5 2 2 6.5 2 12c0 1.76.46 3.45 1.34 4.95L2 22l5.25-1.38A10 10 0 0 0 12 22c5.5 0 10-4.5 10-10 0-2.67-1.04-5.18-2.95-7.09zM12 20.4a8.4 8.4 0 0 1-4.27-1.17l-.31-.18-3.12.82.84-3.04-.2-.31A8.4 8.4 0 1 1 20.4 12c0 4.63-3.77 8.4-8.4 8.4zm4.6-6.3c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.56.13s-.65.81-.79.97c-.14.16-.29.18-.54.06-.25-.13-1.06-.39-2.02-1.25-.74-.66-1.25-1.48-1.4-1.73-.14-.25-.02-.39.11-.51.12-.11.25-.29.38-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.13.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.3z"/>
  </svg>
);

/* striped placeholder */
const Placeholder = ({ label, corner, src, className = "", style = {} }) => (
  <div className={`ph ${src ? "ph-photo" : ""} ${className}`} style={style}>
    {src ? <img src={src} alt={label || ""} className="ph-img" loading="lazy" /> : <span className="ph-label">{label}</span>}
    {corner ? <span className="ph-corner">{corner}</span> : null}
  </div>
);

/* ------------------------------ topbar ------------------------------ */
const Topbar = ({ t, lang, setLang, onCall, currentStep, onJumpHome }) => {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const opts = { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false };
      setNow(new Intl.DateTimeFormat("en-GB", opts).format(d));
    };
    tick();
    const id = setInterval(tick, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="topbar">
      <div className="brand" onClick={onJumpHome} style={{ cursor: "pointer" }}>
        <div className="brand-mark">N</div>
        <div>
          <div className="brand-name">{t("brand_name")}</div>
          <div className="brand-sub">{t("brand_sub")}</div>
        </div>
      </div>
      <nav className="center">
        <button className={`nav-link ${currentStep === 0 ? "active" : ""}`} onClick={onJumpHome}>{t("nav_stay")}</button>
        <button className="nav-link">{t("nav_dine")}</button>
        <button className="nav-link">{t("nav_heritage")}</button>
        <button className="nav-link">{t("nav_contact")}</button>
      </nav>
      <div className="right">
        <div className="time-stamp">
          <span className="now">{now || "—:—"}</span>
          <span className="label">{t("time_label")}</span>
        </div>
        <div className="lang-toggle">
          <button className={lang === "id" ? "active" : ""} onClick={() => setLang("id")}>ID</button>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
        <button className="call-pill" onClick={onCall}>
          <span className="live-dot"></span>
          {t("call_pill")}
        </button>
      </div>
    </header>
  );
};

/* ------------------------------ progress ------------------------------ */
const Progress = ({ t, step }) => {
  const steps = [
    { k: "step_landing" },
    { k: "step_room" },
    { k: "step_dates" },
    { k: "step_info" },
    { k: "step_confirm" },
  ];
  return (
    <div className="progress">
      {steps.map((s, i) => {
        const cls = i === step ? "current" : (i < step ? "done" : "");
        return (
          <div key={s.k} className={`step ${cls}`}>
            <span className="num"><span>{String(i + 1).padStart(2, "0")}</span></span>
            <span>{t(s.k)}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------ hero ------------------------------ */
const Hero = ({ t, onBegin, onCall }) => (
  <>
    <section className="hero">
      <div className="hero-left">
        <div className="eyebrow">
          {t("hero_eyebrow_pre")}<span className="dot"></span>{t("hero_eyebrow_post")}
        </div>
        <h1 className="hero-title">
          {t("hero_title_a")} <em>{t("hero_title_em")}</em><br />
          {t("hero_title_b")}
        </h1>
        <p className="hero-lede">{t("hero_lede")}</p>
        <div className="hero-cta-row">
          <button className="btn" onClick={onBegin}>
            {t("hero_cta_book")} <span className="arr">→</span>
          </button>
          <button className="btn ghost" onClick={onCall}>
            {t("hero_cta_call")}
          </button>
        </div>
      </div>
      <div className="hero-right">
        <Placeholder
          className="hero-image"
          label="Hero · 16:9"
          src={HERO_PHOTO}
          corner="lobby — golden hour"
        />
        <div className="concierge-card">
          <div className="concierge-head">
            <span className="eyebrow">{t("call_pill")}</span>
            <span className="live"><span className="live-dot"></span>{t("conc_live")}</span>
          </div>
          <h3 className="concierge-title">{t("conc_title")}</h3>
          <p className="concierge-body">{t("conc_body")}</p>
          <div className="concierge-foot" style={{ flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn brass" onClick={onCall}>
                {t("hero_cta_call")} <span className="arr">→</span>
              </button>
              <a className="wa-btn" href={WA_HREF} target="_blank" rel="noopener noreferrer">
                <WaIcon size={14} />
                {t("hero_cta_wa")}
              </a>
            </div>
            <span className="powered">{t("conc_powered")}</span>
          </div>
        </div>
      </div>
    </section>
    <div className="hero-strip">
      <div className="fact"><span className="k">{t("fact_rooms_k")}</span><span className="v">{t("fact_rooms_v")}</span></div>
      <div className="fact"><span className="k">{t("fact_dining_k")}</span><span className="v">{t("fact_dining_v")}</span></div>
      <div className="fact"><span className="k">{t("fact_loc_k")}</span><span className="v">{t("fact_loc_v")}</span></div>
      <div className="fact"><span className="k">{t("fact_check_k")}</span><span className="v">{t("fact_check_v")}</span></div>
    </div>
  </>
);

/* ------------------------------ room pick ------------------------------ */
const RoomPick = ({ t, lang, selected, setSelected, onNext, onBack }) => (
  <div className="wizard-main fade-enter">
    <div className="eyebrow">{t("step_room")}<span className="dot"></span>02 / 04</div>
    <h2 className="section-title">{t("room_title")}</h2>
    <p className="section-lede">{t("room_lede")}</p>
    <div className="rooms">
      {ROOMS.map((r, i) => (
        <button
          key={r.id}
          className={`room-card ${selected === r.id ? "selected" : ""}`}
          onClick={() => setSelected(r.id)}
        >
          <Placeholder label={r.photo} src={r.photoUrl} corner={r.photoNote} />
          {r.tagKey ? <span className="tag-strip">{t(r.tagKey)}</span> : null}
          <div className="room-body">
            <div className="room-name">{t(r.nameKey)}</div>
            <div className="room-meta">
              <span>{t(r.bedKey)}</span>
              <span>·</span>
              <span>{t(r.guestsKey)}</span>
              <span>·</span>
              <span>{t(r.viewKey)}</span>
            </div>
            <p className="room-desc">{t(r.descKey)}</p>
            <div className="room-foot">
              <span className="price">{fmtIDR(r.price)} <small>{t("per_night")}</small></span>
              <span className="pick">{selected === r.id ? t("picked") : t("pick")}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
    <div className="foot-cta" style={{ maxWidth: "none" }}>
      <button className="back" onClick={onBack}>← {t("back")}</button>
      <button className="btn" disabled={!selected} onClick={onNext}>
        {t("continue")} <span className="arr">→</span>
      </button>
    </div>
  </div>
);

/* ------------------------------ calendar ------------------------------ */
const monthsID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const monthsEN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dowID = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
const dowEN = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const Calendar = ({ lang, arrival, departure, setArrival, setDeparture }) => {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const months = lang === "id" ? monthsID : monthsEN;
  const dows = lang === "id" ? dowID : dowEN;

  const cells = useMemo(() => {
    const y = view.getFullYear(), m = view.getMonth();
    const first = new Date(y, m, 1);
    // Make Mon = 0
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(y, m, d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [view]);

  const onClickDay = (d) => {
    if (!arrival || (arrival && departure)) {
      setArrival(d); setDeparture(null);
    } else if (d <= arrival) {
      setArrival(d); setDeparture(null);
    } else {
      setDeparture(d);
    }
  };

  const sameDay = (a, b) => a && b && a.getTime() === b.getTime();
  const inRange = (d) => arrival && departure && d > arrival && d < departure;

  return (
    <div className="cal">
      <div className="cal-head">
        <div className="month">{months[view.getMonth()]} {view.getFullYear()}</div>
        <div className="navs">
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>‹</button>
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>›</button>
        </div>
      </div>
      <div className="cal-grid">
        {dows.map((d) => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i}></div>;
          const isToday = d.getTime() === today.getTime();
          const isStart = sameDay(d, arrival);
          const isEnd = sameDay(d, departure);
          const muted = d < today;
          let cls = "cal-day";
          if (muted) cls += " muted";
          if (isToday) cls += " today";
          if (isStart || isEnd) cls += " endpoint";
          if (inRange(d)) cls += " in-range";
          return (
            <button key={i} className={cls} onClick={() => !muted && onClickDay(d)}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const fmtDate = (d, lang) => {
  if (!d) return "—";
  const months = lang === "id" ? monthsID : monthsEN;
  return `${d.getDate()} ${months[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
};

/* ------------------------------ dates + guests ------------------------------ */
const DatesGuests = ({ t, lang, arrival, departure, setArrival, setDeparture, guests, setGuests, rooms, setRooms, onNext, onBack, canContinue }) => {
  const change = (k, delta, min = 0, max = 6) => {
    setGuests((g) => ({ ...g, [k]: Math.max(min, Math.min(max, g[k] + delta)) }));
  };
  const Row = ({ k, subK, val, onMinus, onPlus, minDisabled }) => (
    <div className="guests-row">
      <div>
        <div className="label">{t(k)}</div>
        <div className="sub">{t(subK)}</div>
      </div>
      <div className="stepper">
        <button onClick={onMinus} disabled={minDisabled}>−</button>
        <span className="val">{val}</span>
        <button onClick={onPlus}>+</button>
      </div>
    </div>
  );
  return (
    <div className="wizard-main fade-enter">
      <div className="eyebrow">{t("step_dates")}<span className="dot"></span>03 / 04</div>
      <h2 className="section-title">{t("dates_title")}</h2>
      <p className="section-lede">{t("dates_lede")}</p>
      <div className="two-col">
        <Calendar lang={lang} arrival={arrival} departure={departure} setArrival={setArrival} setDeparture={setDeparture} />
        <div className="guests-panel">
          <Row k="adults" subK="adults_sub" val={guests.adults}
            onMinus={() => change("adults", -1, 1)} onPlus={() => change("adults", 1)} minDisabled={guests.adults <= 1} />
          <Row k="children" subK="children_sub" val={guests.children}
            onMinus={() => change("children", -1)} onPlus={() => change("children", 1)} minDisabled={guests.children <= 0} />
          <Row k="infants" subK="infants_sub" val={guests.infants}
            onMinus={() => change("infants", -1)} onPlus={() => change("infants", 1)} minDisabled={guests.infants <= 0} />
          <div className="guests-row" style={{ borderTop: "1px solid var(--rule-soft)", paddingTop: 14, borderBottom: 0 }}>
            <div>
              <div className="label">{t("rooms_label")}</div>
              <div className="sub">—</div>
            </div>
            <div className="stepper">
              <button onClick={() => setRooms(Math.max(1, rooms - 1))} disabled={rooms <= 1}>−</button>
              <span className="val">{rooms}</span>
              <button onClick={() => setRooms(rooms + 1)}>+</button>
            </div>
          </div>
        </div>
      </div>
      <div className="foot-cta" style={{ maxWidth: "none" }}>
        <button className="back" onClick={onBack}>← {t("back")}</button>
        <button className="btn" disabled={!canContinue} onClick={onNext}>{t("continue")} <span className="arr">→</span></button>
      </div>
    </div>
  );
};

/* ------------------------------ guest info ------------------------------ */
const GuestInfo = ({ t, info, setInfo, errors, onSubmit, onBack }) => {
  const set = (k, v) => setInfo({ ...info, [k]: v });
  return (
    <div className="wizard-main fade-enter">
      <div className="eyebrow">{t("step_info")}<span className="dot"></span>04 / 04</div>
      <h2 className="section-title">{t("info_title")}</h2>
      <p className="section-lede">{t("info_lede")}</p>
      <div className="form-grid">
        <div className={`field ${errors.first ? "err" : ""}`}>
          <label>{t("first_name")} <span className="req">*</span></label>
          <input value={info.first} onChange={(e) => set("first", e.target.value)} placeholder="—" />
          {errors.first ? <span className="err-msg">{t(errors.first)}</span> : null}
        </div>
        <div className={`field ${errors.last ? "err" : ""}`}>
          <label>{t("last_name")} <span className="req">*</span></label>
          <input value={info.last} onChange={(e) => set("last", e.target.value)} placeholder="—" />
          {errors.last ? <span className="err-msg">{t(errors.last)}</span> : null}
        </div>
        <div className={`field ${errors.email ? "err" : ""}`}>
          <label>{t("email")} <span className="req">*</span></label>
          <input value={info.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@email.com" />
          {errors.email ? <span className="err-msg">{t(errors.email)}</span> : <span className="hint">{t("email_hint")}</span>}
        </div>
        <div className={`field ${errors.phone ? "err" : ""}`}>
          <label>{t("phone")} <span className="req">*</span></label>
          <input value={info.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+62 …" />
          {errors.phone ? <span className="err-msg">{t(errors.phone)}</span> : <span className="hint">{t("phone_hint")}</span>}
        </div>
        <div className="field full">
          <label>{t("requests")}</label>
          <textarea value={info.requests} onChange={(e) => set("requests", e.target.value)} placeholder={t("requests_hint")} />
        </div>
      </div>
      <div className="consent" dangerouslySetInnerHTML={{
        __html: t("consent").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
      }} />
      <div className="foot-cta" style={{ maxWidth: "none" }}>
        <button className="back" onClick={onBack}>← {t("back")}</button>
        <button className="btn" onClick={onSubmit}>{t("confirm_cta")} <span className="arr">→</span></button>
      </div>
    </div>
  );
};

/* ------------------------------ summary ------------------------------ */
const SummaryPanel = ({ t, lang, room, arrival, departure, guests, rooms }) => {
  const nights = useMemo(() => {
    if (!arrival || !departure) return 0;
    return Math.round((departure - arrival) / (1000 * 60 * 60 * 24));
  }, [arrival, departure]);
  const subtotal = room ? room.price * nights * rooms : 0;
  const tax = Math.round(subtotal * 0.21);
  const total = subtotal + tax;

  if (!room) {
    return (
      <aside className="wizard-summary summary">
        <div className="eyebrow">{t("summary_title")}</div>
        <p className="placeholder">{t("s_empty")}</p>
      </aside>
    );
  }

  return (
    <aside className="wizard-summary summary">
      <div className="eyebrow">{t("summary_title")}</div>
      <Placeholder className="room-thumb" label={room.photo} src={room.photoUrl} corner={room.photoNote} />
      <h4>{t(room.nameKey)}</h4>
      <div>
        <div className="row"><span className="k">{t("s_arrival")}</span><span className="v">{fmtDate(arrival, lang)}</span></div>
        <div className="row"><span className="k">{t("s_departure")}</span><span className="v">{fmtDate(departure, lang)}</span></div>
        <div className="row"><span className="k">{t("s_nights")}</span><span className="v">{nights || "—"}</span></div>
        <div className="row"><span className="k">{t("s_guests")}</span><span className="v">{guests.adults + guests.children} <small>{rooms} {t("rooms_label").toLowerCase()}</small></span></div>
        {nights > 0 ? (
          <>
            <div className="row"><span className="k">{t("s_subtotal")}</span><span className="v">{fmtIDR(subtotal)}</span></div>
            <div className="row"><span className="k">{t("s_taxes")}</span><span className="v">{fmtIDR(tax)}</span></div>
          </>
        ) : null}
      </div>
      {nights > 0 ? (
        <div className="total">
          <span className="k">{t("s_total")}</span>
          <span className="v">{fmtIDR(total)}</span>
        </div>
      ) : null}
    </aside>
  );
};

/* ------------------------------ confirmation ------------------------------ */
const Confirmation = ({ t, lang, info, room, arrival, departure, guests, rooms, onAnother }) => {
  const ref = useMemo(() => {
    return "NUS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }, []);
  const nights = arrival && departure ? Math.round((departure - arrival) / (1000 * 60 * 60 * 24)) : 0;
  return (
    <div className="confirm fade-enter">
      <div className="confirm-left">
        <div className="seal">N</div>
        <h1>{t("conf_title_a")} <em>{t("conf_title_em")}</em></h1>
        <p className="body">{t("conf_body")}</p>
        <div className="confirm-actions">
          <button className="btn" onClick={onAnother}>{t("another")}</button>
          <button className="btn ghost">{t("download")}</button>
        </div>
      </div>
      <div className="confirm-card">
        <span className="conf-eye">{t("conf_eye")}</span>
        <div className="ref">{ref} <small>{t("conf_ref")}</small></div>
        <div className="conf-grid">
          <div><div className="k">{t("s_room")}</div><div className="v">{room ? t(room.nameKey) : "—"}</div></div>
          <div><div className="k">{t("s_guests")}</div><div className="v">{guests.adults + guests.children} · {rooms} {t("rooms_label").toLowerCase()}</div></div>
          <div><div className="k">{t("s_arrival")}</div><div className="v">{fmtDate(arrival, lang)}</div></div>
          <div><div className="k">{t("s_departure")}</div><div className="v">{fmtDate(departure, lang)}</div></div>
          <div><div className="k">{t("s_nights")}</div><div className="v">{nights}</div></div>
          <div><div className="k">{t("email")}</div><div className="v" style={{ fontSize: 15, fontFamily: "var(--mono)", letterSpacing: 0.04 + "em" }}>{info.email || "—"}</div></div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ call modal (REAL WEBEX SDK) ------------------------------ */
const CALL_TOKEN_ENDPOINT = "/.netlify/functions/get-call-token";

/* Helper: stop microphone stream — handle multiple SDK API shapes */
const stopAudioStream = (stream) => {
  if (!stream) return;
  try {
    if (typeof stream.stop === "function") { stream.stop(); return; }
    if (stream.outputStream?.getTracks) { stream.outputStream.getTracks().forEach((track) => track.stop()); return; }
    if (stream.getTracks) { stream.getTracks().forEach((track) => track.stop()); return; }
    if (stream.outputStream?.getAudioTracks) { stream.outputStream.getAudioTracks().forEach((track) => track.stop()); return; }
  } catch (e) { console.warn("stopAudioStream error:", e); }
};

const CallModal = ({ t, onClose }) => {
  // phase: connecting | ringing | live | failed
  const [phase, setPhase] = useState("connecting");
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  // Refs untuk hold state SDK yang tidak boleh trigger re-render
  const webexCallingRef = useRef(null);
  const currentCallRef = useRef(null);
  const localStreamRef = useRef(null);

  // ----- timer untuk durasi panggilan -----
  useEffect(() => {
    if (phase !== "live") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ----- core: start call ketika modal mounted -----
  useEffect(() => {
    let cancelled = false;

    const startCall = async () => {
      if (typeof window.Calling === "undefined") {
        if (!cancelled) {
          setPhase("failed");
          setErrorMsg("Webex SDK tidak tersedia. Coba refresh halaman.");
        }
        return;
      }

      try {
        // 1) Ambil JWE + guest token dari Netlify Function
        const res = await fetch(CALL_TOKEN_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestName: "Nusantara Guest" }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        const tokens = await res.json();
        if (cancelled) return;

        // 2) Build configs
        const webexConfig = {
          config: {
            logger: { level: "info" },
            meetings: { reconnection: { enabled: true }, enableRtx: true },
            encryption: { kmsInitialTimeout: 8000, kmsMaxTimeout: 40000, batcherMaxCalls: 30 },
          },
          credentials: { access_token: tokens.guestAccessToken },
        };
        const callingConfig = {
          clientConfig: { calling: true, callHistory: true },
          callingClientConfig: {
            logger: { level: "info" },
            discovery: { region: "AP-SOUTHEAST", country: "ID" },
            serviceData: { indicator: "guestcalling", domain: "", guestName: tokens.guestName },
            jwe: tokens.callToken,
          },
          logger: { level: "info" },
        };

        // 3) Initialize SDK
        const webexCalling = await window.Calling.init({ webexConfig, callingConfig });
        if (cancelled) return;
        webexCallingRef.current = webexCalling;

        // 4) Wait for ready, register, get line
        const webexLine = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("SDK ready timeout (30s)")), 30000);
          webexCalling.on("ready", () => {
            clearTimeout(timeout);
            webexCalling.register().then(() => {
              const callingClient = webexCalling.callingClient;
              if (!callingClient || typeof callingClient.getLines !== "function") {
                reject(new Error("callingClient.getLines tidak tersedia."));
                return;
              }
              const lines = callingClient.getLines();
              const line = Object.values(lines)[0];
              if (!line) { reject(new Error("Tidak ada line tersedia")); return; }
              line.on("registered", () => resolve(line));
              line.register();
            }).catch(reject);
          });
        });
        if (cancelled) return;

        // 5) Mic stream
        const stream = await window.Calling.createMicrophoneStream({ audio: true });
        if (cancelled) {
          stopAudioStream(stream);
          return;
        }
        localStreamRef.current = stream;

        // 6) makeCall + event listeners
        const call = webexLine.makeCall();
        currentCallRef.current = call;

        call.on("progress", () => { if (!cancelled) setPhase("ringing"); });
        call.on("connect", () => { if (!cancelled) setPhase("ringing"); });
        call.on("established", () => { if (!cancelled) setPhase("live"); });
        call.on("remote_media", (track) => {
          const audio = document.getElementById("remote-audio");
          if (audio) audio.srcObject = new MediaStream([track]);
        });
        call.on("disconnect", () => {
          if (!cancelled) {
            setPhase("connecting");
            setTimeout(() => onClose(), 800);
          }
        });

        // 7) Dial
        await call.dial(stream);
      } catch (err) {
        console.error("[Webex] Call error:", err);
        if (!cancelled) {
          setPhase("failed");
          setErrorMsg(err.message || "Tidak dapat memulai panggilan.");
        }
      }
    };

    startCall();

    // CLEANUP on unmount
    return () => {
      cancelled = true;
      // End call jika masih ada
      const call = currentCallRef.current;
      if (call) {
        const methodsToTry = ["end", "disconnect", "hangup", "terminate", "close", "bye"];
        for (const method of methodsToTry) {
          if (typeof call[method] === "function") {
            try { call[method](); break; } catch (e) { /* ignore */ }
          }
        }
      }
      stopAudioStream(localStreamRef.current);
      if (webexCallingRef.current) {
        try { webexCallingRef.current.deregister(); } catch (e) { /* ignore */ }
      }
      currentCallRef.current = null;
      localStreamRef.current = null;
      webexCallingRef.current = null;
    };
  }, []); // mount-only

  // ----- handle mute toggle -----
  const handleMute = () => {
    const call = currentCallRef.current;
    if (!call) { setMute(!mute); return; }
    try {
      if (mute) {
        // currently muted → unmute
        try { call.unmute(localStreamRef.current); }
        catch (e1) { try { call.unmute(); } catch (e2) { console.warn("Unmute failed", e1, e2); } }
      } else {
        // currently not muted → mute
        try { call.mute(localStreamRef.current); }
        catch (e1) { try { call.mute(); } catch (e2) { console.warn("Mute failed", e1, e2); } }
      }
      setMute(!mute);
    } catch (e) {
      console.warn("Mute toggle outer error:", e);
      setMute(!mute);
    }
  };

  // ----- handle end (close modal) -----
  const handleEnd = () => {
    onClose(); // cleanup terjadi di useEffect return
  };

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  // ----- status row text -----
  const renderStatus = () => {
    if (phase === "failed") {
      return <span style={{ color: "#FFB4AB" }}>{errorMsg || "Panggilan gagal"}</span>;
    }
    if (phase === "live") {
      return <span>{t("call_live")} · {mmss}</span>;
    }
    // connecting | ringing
    return (
      <>
        <span>{phase === "ringing" ? "" : t("call_connecting")}</span>
        <span className="dots"><span></span><span></span><span></span></span>
      </>
    );
  };

  // ----- title text -----
  const titleText = () => {
    if (phase === "failed") return "Tidak tersambung";
    if (phase === "live") return t("call_attendant");
    return t("call_ringing"); // both connecting & ringing
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>✕</button>
        <div className="m-eye">{t("call_eye")}</div>
        <h3 className="m-title">{titleText()}</h3>
        <div className={`avatar ${phase !== "live" ? "ringing" : ""}`}>HN</div>
        <div className="m-status">
          <span className="live-dot"></span>
          {renderStatus()}
        </div>
        {phase === "live" ? <div className="m-meta">{t("call_intro")}</div> : null}
        <div className="modal-or">{t("call_or")}</div>
        <a className="modal-wa" href={WA_HREF} target="_blank" rel="noopener noreferrer">
          <WaIcon size={16} />
          {t("call_wa_alt")}
        </a>
        <div className="m-controls">
          <button
            className={`ctrl ${mute ? "active" : ""}`}
            onClick={handleMute}
            disabled={phase !== "live"}
          >
            <span className="ico">{mute ? "🔇" : "🎙"}</span>
            <span>{t("call_mute")}</span>
          </button>
          <button className={`ctrl ${speaker ? "active" : ""}`} onClick={() => setSpeaker(!speaker)}>
            <span className="ico">{speaker ? "🔊" : "🔈"}</span>
            <span>{t("call_speaker")}</span>
          </button>
          <button className="ctrl end" onClick={handleEnd}>
            <span className="ico">✕</span>
            <span>{t("call_end")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ footer ------------------------------ */
const Footer = ({ t }) => (
  <footer className="footer">
    <div>{t("foot_addr")}</div>
    <div className="links">
      <a href="#">{t("foot_phone")}</a>
      <a href="#">{t("foot_email")}</a>
    </div>
    <div>{t("foot_legal")}</div>
  </footer>
);

/* ------------------------------ app ------------------------------ */
const validate = (info) => {
  const errs = {};
  if (!info.first.trim()) errs.first = "err_required";
  if (!info.last.trim()) errs.last = "err_required";
  if (!info.email.trim()) errs.email = "err_required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) errs.email = "err_email";
  if (!info.phone.trim()) errs.phone = "err_required";
  else if (info.phone.replace(/\D/g, "").length < 9) errs.phone = "err_phone";
  return errs;
};

const App = () => {
  const { lang, setLang, t } = useLang();
  const [step, setStep] = useState(0);
  const [room, setRoom] = useState(null);
  const [arrival, setArrival] = useState(null);
  const [departure, setDeparture] = useState(null);
  const [guests, setGuests] = useState({ adults: 2, children: 0, infants: 0 });
  const [rooms, setRooms] = useState(1);
  const [info, setInfo] = useState({ first: "", last: "", email: "", phone: "", requests: "" });
  const [errors, setErrors] = useState({});
  const [callOpen, setCallOpen] = useState(false);
  const roomObj = ROOMS.find((r) => r.id === room) || null;

  const onSubmit = () => {
    const errs = validate(info);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(4);
  };
  const onAnother = () => {
    setStep(0); setRoom(null); setArrival(null); setDeparture(null);
    setGuests({ adults: 2, children: 0, infants: 0 }); setRooms(1);
    setInfo({ first: "", last: "", email: "", phone: "", requests: "" });
    setErrors({});
  };

  return (
    <div className="app">
      <Topbar t={t} lang={lang} setLang={setLang} onCall={() => setCallOpen(true)} currentStep={step} onJumpHome={() => setStep(0)} />
      {step > 0 && step < 4 ? <Progress t={t} step={step} /> : null}

      {step === 0 ? <Hero t={t} onBegin={() => setStep(1)} onCall={() => setCallOpen(true)} /> : null}

      {step >= 1 && step <= 3 ? (
        <div className="wizard">
          {step === 1 ? <RoomPick t={t} lang={lang} selected={room} setSelected={setRoom} onNext={() => setStep(2)} onBack={() => setStep(0)} /> : null}
          {step === 2 ? <DatesGuests t={t} lang={lang} arrival={arrival} departure={departure} setArrival={setArrival} setDeparture={setDeparture} guests={guests} setGuests={setGuests} rooms={rooms} setRooms={setRooms} canContinue={!!(arrival && departure)} onNext={() => setStep(3)} onBack={() => setStep(1)} /> : null}
          {step === 3 ? <GuestInfo t={t} info={info} setInfo={setInfo} errors={errors} onSubmit={onSubmit} onBack={() => setStep(2)} /> : null}
          <SummaryPanel t={t} lang={lang} room={roomObj} arrival={arrival} departure={departure} guests={guests} rooms={rooms} />
        </div>
      ) : null}

      {step === 4 ? (
        <Confirmation t={t} lang={lang} info={info} room={roomObj} arrival={arrival} departure={departure} guests={guests} rooms={rooms} onAnother={onAnother} />
      ) : null}

      <Footer t={t} />

      {step > 0 && step < 4 ? (
        <div className="floating-cluster">
          <a className="floating-call wa" href={WA_HREF} target="_blank" rel="noopener noreferrer">
            <WaIcon size={14} />
            WhatsApp
          </a>
          <button className="floating-call" onClick={() => setCallOpen(true)}>
            <span className="live-dot"></span>
            {t("call_pill")}
          </button>
        </div>
      ) : null}

      {callOpen ? <CallModal t={t} onClose={() => setCallOpen(false)} /> : null}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
