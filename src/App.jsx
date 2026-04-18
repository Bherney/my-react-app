import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const SCHOLARSHIPS = [
  { id:1, title:"Chevening Scholarship", funder:"UK Foreign Commonwealth Office", value:"Full Funding (~£18,000)", deadline:"2025-11-07", field:["All Fields"], nationality:["Nigerian","African"], type:"Merit", match:96, tags:["International","UK","Masters"], description:"The UK government's global scholarship programme, making awards to outstanding emerging leaders from around the world to pursue a one-year master's degree in the UK.", link:"https://chevening.org" },
  { id:2, title:"DAAD Scholarship", funder:"German Academic Exchange Service", value:"Full Funding (€1,200/mo)", deadline:"2025-10-31", field:["STEM","Engineering","Social Sciences"], nationality:["All"], type:"Merit", match:91, tags:["International","Germany","Masters","PhD"], description:"One of the world's largest funding organisations for international educational exchange, offering scholarships for all subjects at German universities.", link:"https://daad.de" },
  { id:3, title:"Mastercard Foundation Scholars Program", funder:"Mastercard Foundation", value:"Full Funding", deadline:"2025-09-30", field:["All Fields"], nationality:["African"], type:"Merit+Need", match:89, tags:["Africa","Masters","Leadership"], description:"Supports talented young Africans with the skills and opportunities they need to lead change in their communities and across the continent.", link:"https://mastercardfdn.org" },
  { id:4, title:"Fulbright Program", funder:"US Department of State", value:"Full Funding (~$30,000)", deadline:"2025-10-14", field:["All Fields"], nationality:["Nigerian"], type:"Merit", match:85, tags:["International","USA","Masters","Research"], description:"The flagship international educational exchange program sponsored by the U.S. government, designed to forge lasting connections between the people of the United States and the people of other countries.", link:"https://fulbrightprogram.org" },
  { id:5, title:"MTN Foundation Scholarship", funder:"MTN Nigeria Foundation", value:"₦500,000", deadline:"2025-08-15", field:["STEM","Social Sciences"], nationality:["Nigerian"], type:"Merit+Need", match:82, tags:["Nigeria","Masters"], description:"MTN Foundation scholarship supporting Nigerian graduate students in STEM and social science fields with demonstrated academic excellence.", link:"https://mtnfoundation.org" },
  { id:6, title:"Commonwealth Scholarship", funder:"Commonwealth Scholarship Commission", value:"Full Funding", deadline:"2025-11-20", field:["All Fields"], nationality:["Commonwealth"], type:"Merit+Development", match:88, tags:["International","UK","Masters","PhD"], description:"For talented and motivated individuals from Commonwealth countries who, without this opportunity, would not be able to study in the UK.", link:"https://cscuk.fcdo.gov.uk" },
  { id:7, title:"Gates Cambridge Scholarship", funder:"Gates Cambridge Trust", value:"Full Funding (~£50,000)", deadline:"2025-10-12", field:["All Fields"], nationality:["All"], type:"Merit", match:72, tags:["International","UK","PhD","Masters"], description:"Full-cost scholarships to outstanding applicants from outside the UK to pursue a full-time postgraduate degree in any subject available at the University of Cambridge.", link:"https://gatescambridge.org" },
  { id:8, title:"Erasmus Mundus", funder:"European Commission", value:"Full Funding (€1,400/mo)", deadline:"2025-11-14", field:["All Fields"], nationality:["All"], type:"Merit", match:78, tags:["International","Europe","Masters"], description:"Joint Master's Degrees funded by the European Union, involving study periods in at least two different EU countries.", link:"https://erasmus-plus.ec.europa.eu" },
  { id:9, title:"AfDB Scholarship Program", funder:"African Development Bank", value:"Full Funding", deadline:"2025-07-31", field:["Economics","Development","Engineering"], nationality:["African"], type:"Merit+Need", match:84, tags:["Africa","Masters","Development"], description:"Provides scholarships for postgraduate studies in development-related fields to citizens of African Development Bank member countries.", link:"https://afdb.org" },
  { id:10, title:"PTDF Overseas Scholarship", funder:"Petroleum Technology Dev. Fund", value:"Full Funding", deadline:"2025-09-01", field:["STEM","Oil & Gas","Engineering"], nationality:["Nigerian"], type:"Merit", match:79, tags:["Nigeria","International","Masters","PhD"], description:"The PTDF overseas scholarship provides for Nigerians to undertake full-time postgraduate programmes in top UK, European, and other international universities.", link:"https://ptdf.gov.ng" },
  { id:11, title:"Aga Khan Foundation Scholarship", funder:"Aga Khan Foundation", value:"Full Funding", deadline:"2025-08-31", field:["Development","Social Sciences","Health"], nationality:["African","Asian"], type:"Need+Merit", match:76, tags:["International","Masters","Development"], description:"Provides a limited number of scholarships each year for postgraduate studies to outstanding students from developing countries who have no other means of financing their studies.", link:"https://akdn.org" },
  { id:12, title:"MEXT Japanese Government Scholarship", funder:"Japanese Government", value:"Full Funding + Stipend", deadline:"2025-06-30", field:["All Fields"], nationality:["All"], type:"Merit", match:70, tags:["International","Japan","Masters","PhD"], description:"Japanese Government (MEXT) Scholarships for foreign students wishing to study at Japanese universities as research students.", link:"https://studyjapan.go.jp" },
];

const APPLICATIONS = [
  { id:1, scholarshipId:1, scholarship:"Chevening Scholarship", status:"In Progress", deadline:"2025-11-07", match:96, lastUpdated:"2025-04-10" },
  { id:2, scholarshipId:3, scholarship:"Mastercard Foundation", status:"Not Started", deadline:"2025-09-30", match:89, lastUpdated:"2025-04-08" },
  { id:3, scholarshipId:5, scholarship:"MTN Foundation Scholarship", status:"Submitted", deadline:"2025-08-15", match:82, lastUpdated:"2025-04-15" },
];

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
const C = {
  navy:"#0B1F3A", navy2:"#122845", navy3:"#1A3A5C",
  gold:"#C9A84C", gold2:"#E8C76A", goldLight:"#F0E6C8",
  cream:"#FAF7F0", white:"#FFFFFF",
  red:"#E8441A", green:"#1A7A4A", greenLight:"#D6F0E0",
  gray:"#6B7280", grayLight:"#F3F4F6", border:"#E5E7EB",
};

// ─── TINY UTILITIES ───────────────────────────────────────────────────────────
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
const urgencyColor = (days) => days < 30 ? C.red : days < 60 ? "#D97706" : C.green;
const statusColors = {
  "Not Started":{ bg:"#F3F4F6", text:"#6B7280", dot:"#9CA3AF" },
  "In Progress":{ bg:"#FEF3C7", text:"#92400E", dot:"#F59E0B" },
  "Submitted":  { bg:"#DBEAFE", text:"#1E40AF", dot:"#3B82F6" },
  "Won ✓":      { bg:C.greenLight, text:C.green, dot:C.green },
  "Rejected":   { bg:"#FEE2E2", text:"#991B1B", dot:C.red },
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Logo = ({ size=24, dark=false }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <div style={{ width:size, height:size, background:`linear-gradient(135deg,${C.gold},${C.gold2})`, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:size*0.55, lineHeight:1 }}>🎓</span>
    </div>
    <span style={{ fontFamily:"'Lora',Georgia,serif", fontWeight:700, fontSize:size*0.85, color: dark ? C.navy : C.white, letterSpacing:-0.5 }}>
      Scholar<span style={{ color:C.gold }}>Win</span>
    </span>
  </div>
);

const Badge = ({ children, color=C.gold, bg }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, background: bg || color+"22", color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, border:`1px solid ${color}44`, fontFamily:"system-ui", letterSpacing:0.5, textTransform:"uppercase" }}>
    {children}
  </span>
);

const MatchBar = ({ score }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <div style={{ flex:1, height:6, background:"#E5E7EB", borderRadius:3, overflow:"hidden" }}>
      <div style={{ width:`${score}%`, height:"100%", background:`linear-gradient(90deg,${C.gold},${C.gold2})`, borderRadius:3, transition:"width 1s ease" }} />
    </div>
    <span style={{ fontSize:13, fontWeight:700, color:score>85?C.green:score>70?"#D97706":C.gray, minWidth:32 }}>{score}%</span>
  </div>
);

const Btn = ({ children, variant="primary", onClick, style={}, disabled=false, size="md" }) => {
  const [hov, setHov] = useState(false);
  const pad = size==="sm" ? "8px 18px" : size==="lg" ? "16px 36px" : "11px 26px";
  const fs = size==="sm" ? 13 : size==="lg" ? 17 : 14;
  const styles = {
    primary:{ background: hov ? C.gold2 : C.gold, color:C.navy, border:"none" },
    outline:{ background:"transparent", color: hov ? C.gold : C.white, border:`1.5px solid ${hov?C.gold:C.white+"66"}` },
    outlineDark:{ background:"transparent", color: hov ? C.gold : C.navy, border:`1.5px solid ${hov?C.gold:C.navy+"44"}` },
    ghost:{ background: hov ? C.grayLight : "transparent", color:C.gray, border:"none" },
    danger:{ background: hov ? "#dc2626" : C.red, color:C.white, border:"none" },
    navy:{ background: hov ? C.navy3 : C.navy, color:C.white, border:"none" },
  };
  return (
    <button disabled={disabled} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{ ...styles[variant], padding:pad, borderRadius:8, fontSize:fs, fontWeight:700, cursor:disabled?"not-allowed":"pointer", transition:"all .18s", fontFamily:"system-ui", display:"inline-flex", alignItems:"center", gap:6, opacity:disabled?.5:1, transform:hov&&!disabled?"translateY(-1px)":"none", boxShadow:variant==="primary"&&hov?"0 4px 14px rgba(201,168,76,.35)":"none", ...style }}>
      {children}
    </button>
  );
};

const Input = ({ label, type="text", value, onChange, placeholder, icon }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
    {label && <label style={{ fontSize:13, fontWeight:600, color:C.navy, fontFamily:"system-ui" }}>{label}</label>}
    <div style={{ position:"relative" }}>
      {icon && <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>{icon}</span>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding: icon ? "11px 14px 11px 38px" : "11px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:14, fontFamily:"system-ui", outline:"none", background:C.white, color:C.navy, boxSizing:"border-box", transition:"border .15s" }}
        onFocus={e=>e.target.style.borderColor=C.gold}
        onBlur={e=>e.target.style.borderColor=C.border}
      />
    </div>
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
    {label && <label style={{ fontSize:13, fontWeight:600, color:C.navy, fontFamily:"system-ui" }}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ padding:"11px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:14, fontFamily:"system-ui", outline:"none", background:C.white, color:C.navy, cursor:"pointer" }}>
      {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  </div>
);

const Card = ({ children, style={}, hover=false }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>hover&&setHov(true)} onMouseLeave={()=>hover&&setHov(false)}
      style={{ background:C.white, borderRadius:14, border:`1.5px solid ${hov?C.gold+"66":C.border}`, padding:24, transition:"all .2s", boxShadow: hov ? "0 8px 32px rgba(0,0,0,.08)" : "0 1px 4px rgba(0,0,0,.04)", ...style }}>
      {children}
    </div>
  );
};

const Stat = ({ icon, label, value, sub, color=C.navy }) => (
  <Card style={{ flex:1, minWidth:160 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <p style={{ fontSize:12, color:C.gray, fontFamily:"system-ui", marginBottom:4, fontWeight:500 }}>{label}</p>
        <p style={{ fontSize:28, fontWeight:800, color, fontFamily:"system-ui", lineHeight:1 }}>{value}</p>
        {sub && <p style={{ fontSize:11, color:C.gray, marginTop:4, fontFamily:"system-ui" }}>{sub}</p>}
      </div>
      <span style={{ fontSize:26 }}>{icon}</span>
    </div>
  </Card>
);

// ─── PAGES ────────────────────────────────────────────────────────────────────

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
const LandingPage = ({ onNav }) => {
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const features = [
    { icon:"🤖", title:"AI Scholarship Matching", desc:"Your profile is analyzed and matched against our scholarship database in real time. Ranked by fit, explained in plain English." },
    { icon:"📊", title:"Application Tracker", desc:"Kanban-style pipeline to manage every application from 'Not Started' to 'Won'. Never miss a deadline again." },
    { icon:"✍️", title:"AI Statement Assistant", desc:"Draft, refine, and perfect your personal statement with AI coaching trained on winning applications." },
    { icon:"📅", title:"Deadline Calendar", desc:"Every scholarship deadline visualised. Automated email reminders at 30, 7, and 1 day before closing." },
    { icon:"📁", title:"Document Vault", desc:"Upload your CV, transcripts, and certificates once. Attach to any application instantly." },
    { icon:"🌍", title:"100+ Scholarships", desc:"Continuously updated database covering Nigerian, African, UK, European, US, and Asian funding opportunities." },
  ];

  const plans = [
    { name:"Free", price:"₦0", period:"forever", color:C.gray, features:["Profile builder","5 scholarship previews","1 AI match preview","Basic deadline alerts"], cta:"Get Started Free", variant:"outlineDark" },
    { name:"Pro", price:"₦7,500", period:"/month", color:C.gold, popular:true, features:["Full scholarship database (100+)","AI matching with explanations","Unlimited application tracking","Personal statement AI coach","Document vault (500MB)","Priority email support","30-day action plan"], cta:"Start Pro Free Trial", variant:"primary" },
    { name:"Premium", price:"₦15,000", period:"/month", color:C.navy, features:["Everything in Pro","AI statement reviewer","1-on-1 mentor session/month","Early scholarship alerts","University partnership perks","Dedicated success manager"], cta:"Go Premium", variant:"navy" },
  ];

  const testimonials = [
    { name:"Adaeze Okonkwo", role:"MSc Environmental Eng, UniLag", text:"I found 4 scholarships I qualify for in one afternoon. 6 months of searching before this produced nothing.", award:"Chevening Semi-Finalist" },
    { name:"Emeka Taiwo", role:"Public Health PhD Candidate", text:"The AI matching explained exactly why I qualify for each scholarship. It felt like having a personal scholarship advisor.", award:"DAAD Awardee" },
    { name:"Fatima Aliyu", role:"Environmental Science MSc", text:"I didn't even know DAAD, Fulbright, and Erasmus were options for me until ScholarWin showed me. 2 applications in progress.", award:"Commonwealth Shortlisted" },
  ];

  return (
    <div style={{ fontFamily:"system-ui", background:C.cream, minHeight:"100vh" }}>
      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background: scrolled ? "rgba(11,31,58,.97)" : C.navy, backdropFilter:"blur(12px)", borderBottom: scrolled ? "1px solid rgba(201,168,76,.2)" : "none", transition:"all .3s", padding:"0 5%" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:68 }}>
          <Logo />
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Btn variant="ghost" style={{ color:"rgba(255,255,255,.7)" }} onClick={()=>onNav("login")}>Sign In</Btn>
            <Btn variant="primary" size="sm" onClick={()=>onNav("signup")}>Get Started Free</Btn>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navy3} 100%)`, padding:"100px 5% 80px", position:"relative", overflow:"hidden" }}>
        {/* Decorative */}
        <div style={{ position:"absolute", top:-100, right:-100, width:600, height:600, borderRadius:"50%", background:`radial-gradient(circle, ${C.gold}18 0%, transparent 70%)`, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-200, left:-100, width:500, height:500, borderRadius:"50%", background:`radial-gradient(circle, ${C.navy3}80 0%, transparent 70%)`, pointerEvents:"none" }} />
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${C.gold}18`, border:`1px solid ${C.gold}44`, borderRadius:99, padding:"6px 16px", marginBottom:24 }}>
              <span style={{ fontSize:14 }}>✨</span>
              <span style={{ color:C.gold, fontSize:13, fontWeight:600, letterSpacing:0.5 }}>AI-Powered Scholarship Intelligence</span>
            </div>
            <h1 style={{ fontFamily:"'Lora',Georgia,serif", fontSize:"clamp(36px,4vw,58px)", fontWeight:900, color:C.white, lineHeight:1.05, marginBottom:20 }}>
              Stop Searching.<br/>
              <span style={{ color:C.gold }}>Start Winning</span><br/>
              Scholarships.
            </h1>
            <p style={{ color:"rgba(255,255,255,.72)", fontSize:17, lineHeight:1.7, marginBottom:32, maxWidth:480 }}>
              ScholarWin matches you to scholarships you actually qualify for — using AI trained on your profile, goals, and background. No more guessing. No more wasted applications.
            </p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <Btn size="lg" onClick={()=>onNav("signup")}>🚀 Get Started Free</Btn>
              <Btn size="lg" variant="outline" onClick={()=>onNav("dashboard")}>View Demo Dashboard</Btn>
            </div>
            <div style={{ display:"flex", gap:24, marginTop:28 }}>
              {[["500+","Students"],["100+","Scholarships"],["₦50M+","Funding Found"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{ color:C.gold, fontWeight:800, fontSize:22, fontFamily:"system-ui" }}>{v}</div>
                  <div style={{ color:"rgba(255,255,255,.5)", fontSize:12 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Dashboard Preview Card */}
          <div style={{ position:"relative" }}>
            <div style={{ background:"rgba(255,255,255,.05)", backdropFilter:"blur(20px)", border:`1px solid rgba(255,255,255,.12)`, borderRadius:20, padding:20, boxShadow:"0 40px 80px rgba(0,0,0,.4)" }}>
              <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                {["#FF5F57","#FFBD2E","#28CA41"].map(c=><div key={c} style={{ width:12,height:12,borderRadius:"50%",background:c }} />)}
              </div>
              <div style={{ background:C.navy2, borderRadius:12, padding:16, marginBottom:12 }}>
                <p style={{ color:C.gold, fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:8 }}>🤖 AI MATCHES FOR YOUR PROFILE</p>
                {SCHOLARSHIPS.slice(0,3).map(s=>(
                  <div key={s.id} style={{ background:"rgba(255,255,255,.06)", borderRadius:8, padding:"10px 12px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <p style={{ color:C.white, fontSize:13, fontWeight:600 }}>{s.title}</p>
                      <p style={{ color:"rgba(255,255,255,.45)", fontSize:11 }}>{s.value}</p>
                    </div>
                    <div style={{ background:`${C.gold}22`, border:`1px solid ${C.gold}44`, borderRadius:6, padding:"4px 10px", color:C.gold, fontSize:12, fontWeight:700 }}>{s.match}%</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[["14","Matched"],["3","Applied"],["1","Won 🏆"],["8","Saved"]].map(([v,l])=>(
                  <div key={l} style={{ background:"rgba(255,255,255,.05)", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                    <div style={{ color:C.gold, fontWeight:800, fontSize:20 }}>{v}</div>
                    <div style={{ color:"rgba(255,255,255,.45)", fontSize:11 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position:"absolute", top:-12, right:-12, background:C.red, borderRadius:99, padding:"8px 16px", color:C.white, fontSize:12, fontWeight:700, boxShadow:"0 4px 12px rgba(232,68,26,.4)" }}>96% Match 🎯</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"80px 5%", background:C.white }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <Badge>Platform Features</Badge>
            <h2 style={{ fontFamily:"'Lora',Georgia,serif", fontSize:40, fontWeight:800, color:C.navy, margin:"12px 0 16px" }}>Everything you need to win.</h2>
            <p style={{ color:C.gray, fontSize:17, maxWidth:520, margin:"0 auto" }}>One platform. Every tool. From profile to award letter.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {features.map(f=>(
              <Card key={f.title} hover style={{ padding:28 }}>
                <div style={{ fontSize:36, marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontFamily:"system-ui", fontWeight:700, fontSize:17, color:C.navy, marginBottom:8 }}>{f.title}</h3>
                <p style={{ color:C.gray, fontSize:14, lineHeight:1.65 }}>{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:"80px 5%", background:C.cream }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <Badge>How It Works</Badge>
            <h2 style={{ fontFamily:"'Lora',Georgia,serif", fontSize:40, fontWeight:800, color:C.navy, margin:"12px 0" }}>Four steps to your scholarship.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:24 }}>
            {[
              { step:"01", icon:"👤", title:"Build Your Profile", desc:"Tell us your field, background, goals, and identity. Takes 10 minutes." },
              { step:"02", icon:"🤖", title:"Get AI Matches", desc:"Our AI scores every scholarship in the database against your profile instantly." },
              { step:"03", icon:"✍️", title:"Apply with Confidence", desc:"Use our statement templates, tracker, and document vault to submit strong applications." },
              { step:"04", icon:"🏆", title:"Win Funding", desc:"Track results, follow up, reapply with advantage. The system works if you do." },
            ].map((s,i)=>(
              <div key={s.step} style={{ textAlign:"center", position:"relative" }}>
                {i<3 && <div style={{ position:"absolute", top:28, left:"60%", width:"80%", height:2, background:`linear-gradient(90deg,${C.gold}44,transparent)`, zIndex:0 }} />}
                <div style={{ width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.gold2})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:26, position:"relative", zIndex:1, boxShadow:`0 4px 16px ${C.gold}44` }}>{s.icon}</div>
                <div style={{ fontSize:11, fontWeight:800, color:C.gold, letterSpacing:2, marginBottom:6 }}>STEP {s.step}</div>
                <h3 style={{ fontWeight:700, fontSize:16, color:C.navy, marginBottom:8, fontFamily:"system-ui" }}>{s.title}</h3>
                <p style={{ color:C.gray, fontSize:13, lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding:"80px 5%", background:C.navy }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <Badge>Student Stories</Badge>
            <h2 style={{ fontFamily:"'Lora',Georgia,serif", fontSize:40, fontWeight:800, color:C.white, margin:"12px 0" }}>Real students. Real results.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {testimonials.map(t=>(
              <div key={t.name} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:28 }}>
                <div style={{ color:C.gold, fontSize:28, marginBottom:12 }}>"</div>
                <p style={{ color:"rgba(255,255,255,.82)", fontSize:15, lineHeight:1.7, marginBottom:20, fontStyle:"italic" }}>{t.text}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                  <div>
                    <p style={{ color:C.white, fontWeight:700, fontSize:14 }}>{t.name}</p>
                    <p style={{ color:"rgba(255,255,255,.45)", fontSize:12 }}>{t.role}</p>
                  </div>
                  <Badge>{t.award}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding:"80px 5%", background:C.white }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <Badge>Pricing</Badge>
            <h2 style={{ fontFamily:"'Lora',Georgia,serif", fontSize:40, fontWeight:800, color:C.navy, margin:"12px 0" }}>Invest in your future.</h2>
            <p style={{ color:C.gray, fontSize:16 }}>Less than a dinner out. Potentially worth millions.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24, alignItems:"start" }}>
            {plans.map(p=>(
              <div key={p.name} style={{ borderRadius:16, border:`2px solid ${p.popular?C.gold:C.border}`, padding:32, position:"relative", background: p.popular ? `linear-gradient(160deg,${C.navy},${C.navy3})` : C.white, boxShadow: p.popular ? `0 20px 60px ${C.gold}22` : "none" }}>
                {p.popular && <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:C.gold, color:C.navy, fontSize:11, fontWeight:800, padding:"4px 16px", borderRadius:99, letterSpacing:1, whiteSpace:"nowrap" }}>MOST POPULAR</div>}
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:2, color:p.popular?C.gold:C.gray, marginBottom:8 }}>{p.name.toUpperCase()}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:6 }}>
                  <span style={{ fontSize:42, fontWeight:900, color:p.popular?C.white:C.navy, fontFamily:"system-ui" }}>{p.price}</span>
                  <span style={{ color:p.popular?"rgba(255,255,255,.5)":C.gray, fontSize:14 }}>{p.period}</span>
                </div>
                <div style={{ height:1, background:p.popular?"rgba(255,255,255,.12)":C.border, margin:"20px 0" }} />
                <ul style={{ listStyle:"none", padding:0, margin:"0 0 28px", display:"flex", flexDirection:"column", gap:10 }}>
                  {p.features.map(f=>(
                    <li key={f} style={{ display:"flex", gap:10, alignItems:"flex-start", color:p.popular?"rgba(255,255,255,.82)":C.gray, fontSize:14 }}>
                      <span style={{ color:C.gold, fontSize:15, flexShrink:0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Btn variant={p.variant} style={{ width:"100%", justifyContent:"center" }} onClick={()=>onNav("signup")}>{p.cta}</Btn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section style={{ background:`linear-gradient(135deg,${C.navy},${C.navy3})`, padding:"72px 5%", textAlign:"center" }}>
        <h2 style={{ fontFamily:"'Lora',Georgia,serif", fontSize:42, fontWeight:900, color:C.white, marginBottom:16 }}>Your next scholarship<br/><span style={{ color:C.gold }}>is waiting for you.</span></h2>
        <p style={{ color:"rgba(255,255,255,.6)", fontSize:17, marginBottom:36 }}>Join 500+ graduate students who found their funding path on ScholarWin.</p>
        <Btn size="lg" onClick={()=>onNav("signup")}>🎓 Start For Free Today</Btn>
      </section>

      {/* FOOTER */}
      <footer style={{ background:C.navy, borderTop:`1px solid rgba(255,255,255,.08)`, padding:"32px 5%", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <Logo />
        <p style={{ color:"rgba(255,255,255,.35)", fontSize:12 }}>© 2025 ScholarWin · Built for African graduate students · Powered by AI</p>
        <div style={{ display:"flex", gap:16 }}>
          {["Privacy","Terms","Contact"].map(l=><a key={l} href="#" style={{ color:"rgba(255,255,255,.4)", fontSize:12, textDecoration:"none" }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
};

// ── AUTH PAGES ─────────────────────────────────────────────────────────────────
const AuthPage = ({ mode, onNav, onAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onAuth(); }, 1200);
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${C.navy} 0%,${C.navy3} 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-100, right:-100, width:500, height:500, borderRadius:"50%", background:`radial-gradient(${C.gold}15,transparent 70%)`, pointerEvents:"none" }} />
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:32, cursor:"pointer" }} onClick={()=>onNav("landing")}><Logo size={32} /></div>
        <Card style={{ padding:36 }}>
          <h2 style={{ fontFamily:"'Lora',Georgia,serif", fontSize:28, fontWeight:800, color:C.navy, marginBottom:6, textAlign:"center" }}>
            {isLogin ? "Welcome back 👋" : "Start winning scholarships"}
          </h2>
          <p style={{ color:C.gray, fontSize:14, textAlign:"center", marginBottom:28 }}>
            {isLogin ? "Sign in to your ScholarWin dashboard" : "Create your free account — no credit card needed"}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {!isLogin && <Input label="Full Name" value={name} onChange={setName} placeholder="e.g. Adaeze Okonkwo" icon="👤" />}
            <Input label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@university.edu" icon="✉️" />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder={isLogin?"Enter your password":"Create a strong password"} icon="🔒" />
          </div>
          {isLogin && <div style={{ textAlign:"right", marginTop:8 }}><a href="#" style={{ color:C.gold, fontSize:13, textDecoration:"none" }}>Forgot password?</a></div>}
          <Btn style={{ width:"100%", justifyContent:"center", marginTop:24 }} size="lg" disabled={loading} onClick={handleSubmit}>
            {loading ? "⏳ Please wait..." : isLogin ? "Sign In →" : "Create Free Account →"}
          </Btn>
          <div style={{ position:"relative", margin:"20px 0", textAlign:"center" }}>
            <div style={{ height:1, background:C.border }} />
            <span style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", background:C.white, padding:"0 12px", color:C.gray, fontSize:12 }}>or</span>
          </div>
          <button onClick={()=>{setLoading(true);setTimeout(()=>{setLoading(false);onAuth();},1000)}}
            style={{ width:"100%", padding:"11px", border:`1.5px solid ${C.border}`, borderRadius:8, background:C.white, cursor:"pointer", fontSize:14, fontFamily:"system-ui", display:"flex", alignItems:"center", justifyContent:"center", gap:10, color:C.navy, fontWeight:600 }}>
            <span>🔵</span> Continue with Google
          </button>
          <p style={{ textAlign:"center", fontSize:13, color:C.gray, marginTop:20 }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={()=>onNav(isLogin?"signup":"login")}>
              {isLogin ? "Sign up free" : "Sign in"}
            </span>
          </p>
        </Card>
        {!isLogin && <p style={{ textAlign:"center", color:"rgba(255,255,255,.35)", fontSize:11, marginTop:16 }}>By signing up, you agree to our Terms of Service and Privacy Policy.</p>}
      </div>
    </div>
  );
};

// ── DASHBOARD SHELL ────────────────────────────────────────────────────────────
const DashboardShell = ({ onNav, children, activePage, setPage }) => {
  const navItems = [
    { id:"home", icon:"🏠", label:"Dashboard" },
    { id:"matches", icon:"🤖", label:"AI Matches" },
    { id:"scholarships", icon:"🎓", label:"Scholarships" },
    { id:"tracker", icon:"📊", label:"Tracker" },
    { id:"calendar", icon:"📅", label:"Calendar" },
    { id:"documents", icon:"📁", label:"Documents" },
    { id:"profile", icon:"👤", label:"My Profile" },
    { id:"settings", icon:"⚙️", label:"Settings" },
  ];
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8F9FC", fontFamily:"system-ui" }}>
      {/* SIDEBAR */}
      <aside style={{ width:240, background:C.navy, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", flexShrink:0 }}>
        <div style={{ padding:"20px 20px 12px", borderBottom:"1px solid rgba(255,255,255,.08)", cursor:"pointer" }} onClick={()=>onNav("landing")}>
          <Logo size={22} />
        </div>
        <nav style={{ flex:1, padding:"12px 12px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
          {navItems.map(item=>{
            const active = activePage===item.id;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, border:"none", background: active ? `${C.gold}22` : "transparent", color: active ? C.gold : "rgba(255,255,255,.6)", cursor:"pointer", fontSize:13, fontWeight: active ? 700 : 400, textAlign:"left", transition:"all .15s", borderLeft: active ? `3px solid ${C.gold}` : "3px solid transparent" }}>
                <span style={{ fontSize:16 }}>{item.icon}</span>{item.label}
              </button>
            );
          })}
        </nav>
        {/* Upgrade nudge */}
        <div style={{ margin:12, padding:16, background:`${C.gold}18`, border:`1px solid ${C.gold}33`, borderRadius:12 }}>
          <p style={{ color:C.gold, fontSize:12, fontWeight:700, marginBottom:4 }}>🚀 Upgrade to Pro</p>
          <p style={{ color:"rgba(255,255,255,.55)", fontSize:11, lineHeight:1.5, marginBottom:10 }}>Unlock AI matching & full scholarship access</p>
          <button style={{ background:C.gold, color:C.navy, border:"none", borderRadius:6, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", width:"100%" }}>Upgrade ₦7,500/mo</button>
        </div>
        <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},${C.gold2})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>
          <div>
            <p style={{ color:C.white, fontSize:13, fontWeight:600, margin:0 }}>Adaeze O.</p>
            <p style={{ color:"rgba(255,255,255,.4)", fontSize:11, margin:0 }}>Free Plan</p>
          </div>
          <button onClick={()=>onNav("landing")} style={{ marginLeft:"auto", background:"transparent", border:"none", color:"rgba(255,255,255,.3)", cursor:"pointer", fontSize:16 }} title="Sign out">⬅</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, overflowY:"auto" }}>
        {/* Top bar */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
          <div>
            <h1 style={{ fontSize:18, fontWeight:800, color:C.navy, margin:0, fontFamily:"'Lora',Georgia,serif" }}>{navItems.find(n=>n.id===activePage)?.label || "Dashboard"}</h1>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <button style={{ background:"transparent", border:`1.5px solid ${C.border}`, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13, color:C.gray }}>🔔 3</button>
            <Btn size="sm" onClick={()=>setPage("matches")}>🤖 Get AI Matches</Btn>
          </div>
        </div>
        <div style={{ padding:32 }}>{children}</div>
      </main>
    </div>
  );
};

// ── DASHBOARD HOME ─────────────────────────────────────────────────────────────
const DashHome = ({ setPage }) => {
  const urgent = SCHOLARSHIPS.filter(s=>daysUntil(s.deadline)<60).slice(0,3);
  return (
    <div>
      {/* Welcome */}
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navy3})`, borderRadius:16, padding:"28px 32px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ color:C.white, fontFamily:"'Lora',Georgia,serif", fontSize:26, fontWeight:800, marginBottom:6 }}>Good morning, Adaeze 👋</h2>
          <p style={{ color:"rgba(255,255,255,.65)", fontSize:15 }}>You have <strong style={{ color:C.gold }}>3 deadlines</strong> in the next 60 days and <strong style={{ color:C.gold }}>14 new matches</strong> since last visit.</p>
        </div>
        <Btn onClick={()=>setPage("matches")}>🤖 View My Matches</Btn>
      </div>
      {/* Stats */}
      <div style={{ display:"flex", gap:16, marginBottom:24, flexWrap:"wrap" }}>
        <Stat icon="🎯" label="AI Matches" value="14" sub="Based on your profile" color={C.navy} />
        <Stat icon="📝" label="Applications" value="3" sub="2 in progress" color={C.navy3} />
        <Stat icon="⏰" label="Next Deadline" value="28d" sub="MTN Foundation" color={C.red} />
        <Stat icon="🏆" label="Won" value="1" sub="AfDB Scholarship" color={C.green} />
      </div>
      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24 }}>
        {/* Urgent Deadlines */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ fontWeight:700, color:C.navy, fontSize:16 }}>⏰ Upcoming Deadlines</h3>
            <Btn size="sm" variant="ghost" onClick={()=>setPage("calendar")}>View Calendar</Btn>
          </div>
          {urgent.map(s=>{
            const days = daysUntil(s.deadline);
            return (
              <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
                <div>
                  <p style={{ fontWeight:600, color:C.navy, fontSize:14, marginBottom:2 }}>{s.title}</p>
                  <p style={{ color:C.gray, fontSize:12 }}>{s.value}</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:urgencyColor(days), fontWeight:700, fontSize:14 }}>{days} days</div>
                  <div style={{ color:C.gray, fontSize:11 }}>{s.deadline}</div>
                </div>
              </div>
            );
          })}
          <Btn size="sm" variant="outlineDark" style={{ marginTop:14, width:"100%", justifyContent:"center" }} onClick={()=>setPage("scholarships")}>Browse All Scholarships →</Btn>
        </Card>
        {/* Application Pipeline */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <h3 style={{ fontWeight:700, color:C.navy, fontSize:16 }}>📊 My Applications</h3>
            <Btn size="sm" variant="ghost" onClick={()=>setPage("tracker")}>Full Tracker</Btn>
          </div>
          {APPLICATIONS.map(a=>{
            const sc = statusColors[a.status]||statusColors["Not Started"];
            return (
              <div key={a.id} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <p style={{ fontWeight:600, color:C.navy, fontSize:13 }}>{a.scholarship}</p>
                  <span style={{ background:sc.bg, color:sc.text, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99 }}>{a.status}</span>
                </div>
                <MatchBar score={a.match} />
              </div>
            );
          })}
          <Btn size="sm" variant="outlineDark" style={{ marginTop:14, width:"100%", justifyContent:"center" }} onClick={()=>setPage("tracker")}>Manage Applications →</Btn>
        </Card>
      </div>
      {/* Profile Completion */}
      <Card style={{ marginTop:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <h3 style={{ fontWeight:700, color:C.navy, fontSize:16, marginBottom:4 }}>👤 Complete Your Profile</h3>
            <p style={{ color:C.gray, fontSize:13 }}>A complete profile unlocks 8 more scholarship matches.</p>
          </div>
          <Btn size="sm" onClick={()=>setPage("profile")}>Complete Profile</Btn>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ flex:1, height:10, background:C.grayLight, borderRadius:5, overflow:"hidden" }}>
            <div style={{ width:"65%", height:"100%", background:`linear-gradient(90deg,${C.gold},${C.gold2})`, borderRadius:5 }} />
          </div>
          <span style={{ fontWeight:700, color:C.navy, fontSize:14 }}>65%</span>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
          {["✅ Academic Background","✅ Nationality","✅ Field of Study","❌ Career Goals","❌ Financial Need","❌ Identity Tags"].map(t=>(
            <span key={t} style={{ fontSize:12, padding:"3px 10px", borderRadius:99, background:t.startsWith("✅")?C.greenLight:"#FEF3C7", color:t.startsWith("✅")?C.green:"#92400E" }}>{t}</span>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── AI MATCHES PAGE ────────────────────────────────────────────────────────────
const MatchesPage = ({ setPage }) => {
  const [loading, setLoading] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const [selected, setSelected] = useState(null);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setRefreshed(true); }, 2200);
  };

  const reasons = {
    1:["Your Nigerian nationality matches the target demographic","MSc in Environmental Engineering aligns perfectly with development focus","Leadership experience in community NGO demonstrates required commitment"],
    2:["STEM field matches DAAD priority subjects","GPA 4.2 exceeds minimum 3.5 requirement","Research proposal experience directly applicable"],
    3:["African nationality is core eligibility requirement","Community development work shows required leadership profile","Financial need documentation will strengthen application"],
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navy3})`, borderRadius:16, padding:"24px 28px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h2 style={{ color:C.white, fontFamily:"'Lora',Georgia,serif", fontSize:22, fontWeight:800, marginBottom:4 }}>🤖 Your AI Scholarship Matches</h2>
          <p style={{ color:"rgba(255,255,255,.6)", fontSize:14 }}>Ranked by profile fit · Last updated: Today</p>
        </div>
        <Btn onClick={refresh} disabled={loading}>
          {loading ? "⏳ Analysing..." : "🔄 Refresh Matches"}
        </Btn>
      </div>

      {loading && (
        <Card style={{ textAlign:"center", padding:48 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
          <h3 style={{ color:C.navy, fontFamily:"'Lora',Georgia,serif", fontSize:22, marginBottom:8 }}>AI is analysing your profile...</h3>
          <p style={{ color:C.gray, fontSize:14, marginBottom:24 }}>Comparing your background against 100+ scholarships</p>
          <div style={{ width:320, height:6, background:C.grayLight, borderRadius:3, margin:"0 auto", overflow:"hidden" }}>
            <div style={{ height:"100%", background:`linear-gradient(90deg,${C.gold},${C.gold2})`, borderRadius:3, animation:"load 2.2s ease forwards", width:"0%" }} />
          </div>
          <style>{`@keyframes load{to{width:100%}}`}</style>
        </Card>
      )}

      {!loading && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:24 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {refreshed && (
              <div style={{ background:C.greenLight, border:`1px solid ${C.green}44`, borderRadius:10, padding:"12px 16px", display:"flex", gap:10, alignItems:"center" }}>
                <span>✅</span><p style={{ color:C.green, fontSize:13, fontWeight:600 }}>Matches refreshed! 2 new scholarships found.</p>
              </div>
            )}
            {SCHOLARSHIPS.sort((a,b)=>b.match-a.match).map(s=>(
              <div key={s.id} onClick={()=>setSelected(s)}
                style={{ background: selected?.id===s.id ? `linear-gradient(135deg,${C.navy},${C.navy3})` : C.white, border:`2px solid ${selected?.id===s.id?C.gold:C.border}`, borderRadius:12, padding:"16px 18px", cursor:"pointer", transition:"all .18s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, color:selected?.id===s.id?C.white:C.navy, fontSize:14, marginBottom:2 }}>{s.title}</p>
                    <p style={{ color:selected?.id===s.id?"rgba(255,255,255,.5)":C.gray, fontSize:12 }}>{s.funder}</p>
                  </div>
                  <div style={{ background:`${C.gold}22`, border:`1px solid ${C.gold}55`, borderRadius:8, padding:"4px 12px", color:C.gold, fontWeight:800, fontSize:14, flexShrink:0, marginLeft:10 }}>{s.match}%</div>
                </div>
                <MatchBar score={s.match} />
                <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                  {s.tags.slice(0,3).map(t=><Badge key={t}>{t}</Badge>)}
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          <div style={{ position:"sticky", top:92 }}>
            {selected ? (
              <Card style={{ padding:28 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div>
                    <Badge style={{ marginBottom:8 }}>Match Score: {selected.match}%</Badge>
                    <h2 style={{ fontFamily:"'Lora',Georgia,serif", fontSize:22, fontWeight:800, color:C.navy, marginTop:8 }}>{selected.title}</h2>
                    <p style={{ color:C.gray, fontSize:13 }}>{selected.funder}</p>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                  {[["💰 Value",selected.value],["📅 Deadline",selected.deadline],["🎓 Type",selected.type],["⏰ Days Left",`${daysUntil(selected.deadline)} days`]].map(([l,v])=>(
                    <div key={l} style={{ background:C.grayLight, borderRadius:8, padding:"10px 14px" }}>
                      <p style={{ color:C.gray, fontSize:11, marginBottom:2 }}>{l}</p>
                      <p style={{ color:C.navy, fontWeight:700, fontSize:13 }}>{v}</p>
                    </div>
                  ))}
                </div>
                <p style={{ color:C.gray, fontSize:14, lineHeight:1.65, marginBottom:20 }}>{selected.description}</p>
                <div style={{ background:`${C.green}12`, border:`1px solid ${C.green}33`, borderRadius:10, padding:16, marginBottom:20 }}>
                  <p style={{ color:C.green, fontWeight:700, fontSize:13, marginBottom:10 }}>🤖 Why You Match</p>
                  {(reasons[selected.id]||["Your profile aligns well with this scholarship","Academic background meets minimum requirements","Nationality matches eligibility criteria"]).map((r,i)=>(
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                      <span style={{ color:C.green, fontSize:13, flexShrink:0, marginTop:1 }}>✓</span>
                      <p style={{ color:C.gray, fontSize:13, lineHeight:1.5 }}>{r}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <Btn style={{ flex:1, justifyContent:"center" }}>Start Application</Btn>
                  <Btn variant="outlineDark" style={{ flex:1, justifyContent:"center" }}>Save Scholarship</Btn>
                </div>
              </Card>
            ) : (
              <Card style={{ padding:48, textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>👆</div>
                <h3 style={{ color:C.navy, fontFamily:"'Lora',Georgia,serif", fontSize:20, marginBottom:8 }}>Select a scholarship</h3>
                <p style={{ color:C.gray, fontSize:14 }}>Click any match on the left to see why you qualify and how to apply.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── SCHOLARSHIPS PAGE ──────────────────────────────────────────────────────────
const ScholarshipsPage = () => {
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [sort, setSort] = useState("match");

  const filtered = SCHOLARSHIPS
    .filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.funder.toLowerCase().includes(search.toLowerCase()))
    .filter(s => filterField==="All" || s.field.includes(filterField) || s.field.includes("All Fields"))
    .filter(s => filterType==="All" || s.type.includes(filterType))
    .sort((a,b)=> sort==="match" ? b.match-a.match : sort==="deadline" ? new Date(a.deadline)-new Date(b.deadline) : b.value.localeCompare(a.value));

  return (
    <div>
      {/* Filters */}
      <Card style={{ marginBottom:20, padding:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto auto", gap:12, alignItems:"end" }}>
          <Input value={search} onChange={setSearch} placeholder="🔍  Search scholarships..." />
          <Select value={filterField} onChange={setFilterField} options={["All","STEM","Engineering","Social Sciences","Health","Economics"]} />
          <Select value={filterType} onChange={setFilterType} options={["All","Merit","Merit+Need","Need+Merit","Merit+Development"]} />
          <Select value={sort} onChange={setSort} options={[{value:"match",label:"Sort: Best Match"},{value:"deadline",label:"Sort: Deadline"},{value:"value",label:"Sort: Value"}]} />
        </div>
      </Card>
      <p style={{ color:C.gray, fontSize:13, marginBottom:16 }}>{filtered.length} scholarships found</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:18 }}>
        {filtered.map(s=>{
          const days = daysUntil(s.deadline);
          return (
            <Card key={s.id} hover style={{ padding:22 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontWeight:700, color:C.navy, fontSize:15, marginBottom:3 }}>{s.title}</h3>
                  <p style={{ color:C.gray, fontSize:12 }}>{s.funder}</p>
                </div>
                <div style={{ background:`${C.gold}18`, border:`1px solid ${C.gold}44`, borderRadius:8, padding:"6px 12px", textAlign:"center", flexShrink:0, marginLeft:12 }}>
                  <div style={{ color:C.gold, fontWeight:800, fontSize:15 }}>{s.match}%</div>
                  <div style={{ color:C.gray, fontSize:10 }}>Match</div>
                </div>
              </div>
              <MatchBar score={s.match} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, margin:"14px 0" }}>
                <div style={{ background:C.grayLight, borderRadius:6, padding:"8px 10px" }}>
                  <p style={{ color:C.gray, fontSize:10 }}>Value</p>
                  <p style={{ color:C.navy, fontWeight:700, fontSize:12 }}>{s.value}</p>
                </div>
                <div style={{ background:C.grayLight, borderRadius:6, padding:"8px 10px" }}>
                  <p style={{ color:C.gray, fontSize:10 }}>Deadline</p>
                  <p style={{ color:urgencyColor(days), fontWeight:700, fontSize:12 }}>{days}d — {s.deadline}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                {s.tags.map(t=><Badge key={t}>{t}</Badge>)}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn size="sm" style={{ flex:1, justifyContent:"center" }}>Start Applying</Btn>
                <Btn size="sm" variant="outlineDark">Save</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ── APPLICATION TRACKER ────────────────────────────────────────────────────────
const TrackerPage = () => {
  const [apps, setApps] = useState(APPLICATIONS);
  const statuses = ["Not Started","In Progress","Submitted","Won ✓","Rejected"];

  const updateStatus = (id, status) => setApps(prev => prev.map(a => a.id===id ? {...a,status} : a));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <p style={{ color:C.gray, fontSize:14 }}>{apps.length} applications tracked</p>
        <Btn size="sm">+ Add Application</Btn>
      </div>
      {/* Pipeline Kanban */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, overflowX:"auto" }}>
        {statuses.map(status=>{
          const col = apps.filter(a=>a.status===status);
          const sc = statusColors[status];
          return (
            <div key={status}>
              <div style={{ background:sc.bg, borderRadius:8, padding:"8px 12px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ color:sc.text, fontSize:12, fontWeight:700 }}>{status}</span>
                <span style={{ background:sc.dot, borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontSize:11, fontWeight:700 }}>{col.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {col.map(app=>(
                  <Card key={app.id} hover style={{ padding:14 }}>
                    <p style={{ fontWeight:700, color:C.navy, fontSize:13, marginBottom:4 }}>{app.scholarship}</p>
                    <MatchBar score={app.match} />
                    <div style={{ marginTop:8 }}>
                      <p style={{ color:C.gray, fontSize:11, marginBottom:4 }}>⏰ {daysUntil(app.deadline)}d left</p>
                      <select value={app.status} onChange={e=>updateStatus(app.id,e.target.value)}
                        style={{ width:"100%", padding:"5px 8px", border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, fontFamily:"system-ui", cursor:"pointer", color:C.navy }}>
                        {statuses.map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </Card>
                ))}
                {col.length===0 && <div style={{ border:`2px dashed ${C.border}`, borderRadius:8, padding:20, textAlign:"center", color:C.gray, fontSize:12 }}>Drop here</div>}
              </div>
            </div>
          );
        })}
      </div>
      {/* List view */}
      <Card style={{ marginTop:24 }}>
        <h3 style={{ fontWeight:700, color:C.navy, fontSize:16, marginBottom:16 }}>All Applications</h3>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`2px solid ${C.border}` }}>
              {["Scholarship","Match","Deadline","Days Left","Status","Actions"].map(h=>(
                <th key={h} style={{ textAlign:"left", padding:"10px 12px", fontSize:12, color:C.gray, fontWeight:700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apps.map(a=>{
              const sc = statusColors[a.status];
              const days = daysUntil(a.deadline);
              return (
                <tr key={a.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:"12px", fontSize:14, fontWeight:600, color:C.navy }}>{a.scholarship}</td>
                  <td style={{ padding:"12px", width:120 }}><MatchBar score={a.match} /></td>
                  <td style={{ padding:"12px", fontSize:13, color:C.gray }}>{a.deadline}</td>
                  <td style={{ padding:"12px" }}><span style={{ color:urgencyColor(days), fontWeight:700, fontSize:13 }}>{days}d</span></td>
                  <td style={{ padding:"12px" }}><span style={{ background:sc.bg, color:sc.text, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99 }}>{a.status}</span></td>
                  <td style={{ padding:"12px" }}><div style={{ display:"flex", gap:6 }}><Btn size="sm">Edit</Btn><Btn size="sm" variant="ghost">🗑</Btn></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ── CALENDAR PAGE ──────────────────────────────────────────────────────────────
const CalendarPage = () => {
  const months = ["May 2025","June 2025","July 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025"];
  const byMonth = {
    "July 2025": SCHOLARSHIPS.filter(s=>s.deadline.startsWith("2025-07")),
    "Aug 2025":  SCHOLARSHIPS.filter(s=>s.deadline.startsWith("2025-08")),
    "Sep 2025":  SCHOLARSHIPS.filter(s=>s.deadline.startsWith("2025-09")),
    "Oct 2025":  SCHOLARSHIPS.filter(s=>s.deadline.startsWith("2025-10")),
    "Nov 2025":  SCHOLARSHIPS.filter(s=>s.deadline.startsWith("2025-11")),
  };
  return (
    <div>
      <div style={{ display:"flex", gap:16, marginBottom:24, overflowX:"auto", paddingBottom:4 }}>
        {months.map(m=>{
          const count = (byMonth[m]||[]).length;
          return (
            <div key={m} style={{ flexShrink:0, background: count>0?C.navy:C.white, border:`1.5px solid ${count>0?C.gold:C.border}`, borderRadius:10, padding:"10px 16px", textAlign:"center", minWidth:90 }}>
              <p style={{ fontWeight:700, color:count>0?C.gold:C.navy, fontSize:13 }}>{m}</p>
              {count>0 && <p style={{ color:"rgba(255,255,255,.6)", fontSize:11 }}>{count} deadline{count>1?"s":""}</p>}
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {Object.entries(byMonth).filter(([,v])=>v.length).map(([month, items])=>(
          <div key={month}>
            <h3 style={{ fontWeight:800, color:C.navy, fontSize:15, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
              📅 {month}
              <span style={{ background:C.gold, color:C.navy, borderRadius:99, padding:"2px 10px", fontSize:11 }}>{items.length}</span>
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {items.map(s=>{
                const days = daysUntil(s.deadline);
                return (
                  <Card key={s.id} hover style={{ padding:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <p style={{ fontWeight:700, color:C.navy, fontSize:13 }}>{s.title}</p>
                      <span style={{ color:urgencyColor(days), fontWeight:700, fontSize:12 }}>{days}d</span>
                    </div>
                    <p style={{ color:C.gray, fontSize:11, marginBottom:8 }}>{s.deadline} · {s.value}</p>
                    <div style={{ display:"flex", gap:6 }}><Btn size="sm">Apply</Btn><Btn size="sm" variant="ghost">⏰ Alert</Btn></div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── DOCUMENTS PAGE ─────────────────────────────────────────────────────────────
const DocumentsPage = () => {
  const docs = [
    { name:"Curriculum Vitae (CV)", type:"CV", size:"245 KB", updated:"Apr 10, 2025", icon:"📄" },
    { name:"University Transcript", type:"Transcript", size:"1.2 MB", updated:"Mar 22, 2025", icon:"🎓" },
    { name:"International Passport", type:"ID", size:"890 KB", updated:"Jan 5, 2025", icon:"📔" },
    { name:"IELTS Certificate", type:"Language", size:"320 KB", updated:"Feb 14, 2025", icon:"🌐" },
  ];
  return (
    <div>
      {/* Storage bar */}
      <Card style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <h3 style={{ fontWeight:700, color:C.navy }}>Storage Used</h3>
          <span style={{ color:C.gray, fontSize:13 }}>2.6 MB / 50 MB (Free Plan)</span>
        </div>
        <div style={{ height:8, background:C.grayLight, borderRadius:4, overflow:"hidden" }}>
          <div style={{ width:"5%", height:"100%", background:`linear-gradient(90deg,${C.gold},${C.gold2})`, borderRadius:4 }} />
        </div>
        <p style={{ color:C.gray, fontSize:12, marginTop:8 }}>Upgrade to Pro for 500 MB storage</p>
      </Card>
      {/* Upload zone */}
      <div style={{ border:`2px dashed ${C.gold}66`, borderRadius:14, padding:40, textAlign:"center", background:`${C.gold}06`, marginBottom:24, cursor:"pointer" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>📤</div>
        <h3 style={{ color:C.navy, fontWeight:700, marginBottom:6 }}>Upload Document</h3>
        <p style={{ color:C.gray, fontSize:14 }}>Drag & drop or click to select · PDF, DOCX, JPG, PNG</p>
        <Btn style={{ marginTop:16 }}>Choose File</Btn>
      </div>
      {/* Documents list */}
      <Card>
        <h3 style={{ fontWeight:700, color:C.navy, marginBottom:16 }}>Your Documents ({docs.length})</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {docs.map(d=>(
            <div key={d.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", background:C.grayLight, borderRadius:8 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <span style={{ fontSize:28 }}>{d.icon}</span>
                <div>
                  <p style={{ fontWeight:600, color:C.navy, fontSize:14 }}>{d.name}</p>
                  <p style={{ color:C.gray, fontSize:12 }}>{d.type} · {d.size} · Updated {d.updated}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn size="sm" variant="outlineDark">Preview</Btn>
                <Btn size="sm" variant="outlineDark">📎 Attach</Btn>
                <Btn size="sm" variant="ghost">🗑</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── PROFILE PAGE ───────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const [tab, setTab] = useState("academic");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    degree:"MSc Environmental Engineering", institution:"University of Lagos",
    gpa:"4.2", nationality:"Nigerian", goals:"Water infrastructure policy in West Africa",
    field:"Engineering", financial:"yes", gender:"Female"
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 2500); };

  const tabs = [
    { id:"academic", label:"🎓 Academic" },
    { id:"personal", label:"👤 Personal" },
    { id:"goals", label:"🎯 Goals" },
    { id:"identity", label:"🌟 Identity" },
  ];

  return (
    <div style={{ maxWidth:820 }}>
      {/* Completion */}
      <Card style={{ marginBottom:24, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div>
            <h3 style={{ fontWeight:700, color:C.navy }}>Profile Completion</h3>
            <p style={{ color:C.gray, fontSize:13 }}>Complete all sections to unlock maximum scholarship matches</p>
          </div>
          <span style={{ fontWeight:800, color:C.navy, fontSize:24 }}>65%</span>
        </div>
        <div style={{ height:10, background:C.grayLight, borderRadius:5, overflow:"hidden" }}>
          <div style={{ width:"65%", height:"100%", background:`linear-gradient(90deg,${C.gold},${C.gold2})`, borderRadius:5 }} />
        </div>
      </Card>

      {saved && (
        <div style={{ background:C.greenLight, border:`1px solid ${C.green}44`, borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", gap:10 }}>
          <span>✅</span><p style={{ color:C.green, fontSize:14, fontWeight:600 }}>Profile saved! Your AI matches will update shortly.</p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:C.grayLight, padding:4, borderRadius:10 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ flex:1, padding:"10px", border:"none", borderRadius:8, background:tab===t.id?C.white:"transparent", color:tab===t.id?C.navy:C.gray, fontWeight:tab===t.id?700:400, cursor:"pointer", fontSize:13, transition:"all .15s", boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,.1)":"none" }}>
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab==="academic" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
            <Input label="Degree Programme" value={form.degree} onChange={v=>set("degree",v)} placeholder="e.g. MSc Environmental Engineering" />
            <Input label="University / Institution" value={form.institution} onChange={v=>set("institution",v)} />
            <Input label="Current GPA" value={form.gpa} onChange={v=>set("gpa",v)} placeholder="e.g. 4.2 / 5.0" />
            <Select label="Field of Study" value={form.field} onChange={v=>set("field",v)} options={["Engineering","STEM","Social Sciences","Humanities","Health","Economics","Law","Education"]} />
            <div style={{ gridColumn:"1 / -1" }}>
              <label style={{ fontSize:13, fontWeight:600, color:C.navy, display:"block", marginBottom:6 }}>Academic Awards & Publications</label>
              <textarea rows={3} placeholder="e.g. Faculty Innovation Prize 2023, co-authored paper on..."
                style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:14, fontFamily:"system-ui", outline:"none", resize:"vertical", boxSizing:"border-box" }} />
            </div>
          </div>
        )}
        {tab==="personal" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
            <Select label="Nationality" value={form.nationality} onChange={v=>set("nationality",v)} options={["Nigerian","Ghanaian","Kenyan","South African","Ethiopian","Other African","Non-African"]} />
            <Select label="Gender" value={form.gender} onChange={v=>set("gender",v)} options={["Female","Male","Non-binary","Prefer not to say"]} />
            <Select label="Financial Need" value={form.financial} onChange={v=>set("financial",v)} options={[{value:"yes",label:"Yes — I need financial support"},{value:"partial",label:"Partial — some support available"},{value:"no",label:"No — self-funded"}]} />
            <Select label="Degree Level" value="masters" onChange={()=>{}} options={["Masters (MSc/MA/MBA)","PhD / Doctorate","Postdoctoral","Professional"]} />
            <div style={{ gridColumn:"1 / -1" }}>
              <Input label="Languages Spoken" value="" onChange={()=>{}} placeholder="e.g. English (Fluent), Yoruba (Native), French (Basic)" />
            </div>
          </div>
        )}
        {tab==="goals" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:C.navy, display:"block", marginBottom:6 }}>Career Goal (5–10 years)</label>
              <textarea rows={3} value={form.goals} onChange={e=>set("goals",e.target.value)}
                placeholder="Be specific — sector, role, location..."
                style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:14, fontFamily:"system-ui", outline:"none", resize:"vertical", boxSizing:"border-box" }} />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:C.navy, display:"block", marginBottom:6 }}>Why This Degree? (2–3 sentences)</label>
              <textarea rows={3} placeholder="The real reason — what experience or problem drove you here..."
                style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:14, fontFamily:"system-ui", outline:"none", resize:"vertical", boxSizing:"border-box" }} />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:C.navy, display:"block", marginBottom:6 }}>Your Compelling Story</label>
              <textarea rows={4} placeholder="The moment, challenge, or motivation that defines your academic path..."
                style={{ width:"100%", padding:"11px 14px", border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:14, fontFamily:"system-ui", outline:"none", resize:"vertical", boxSizing:"border-box" }} />
            </div>
          </div>
        )}
        {tab==="identity" && (
          <div>
            <p style={{ color:C.gray, fontSize:14, marginBottom:16 }}>These tags help us find scholarships specifically targeting your background. All fields are optional.</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                ["First-generation graduate student","🎓"],
                ["Female / Women-identifying","👩"],
                ["Student with disability","♿"],
                ["Conflict-affected / Displaced","🕊️"],
                ["Underrepresented ethnic group","🌍"],
                ["From rural / underserved community","🏘️"],
                ["Religious minority","🤲"],
                ["Young professional (under 35)","⚡"],
              ].map(([label,icon])=>{
                const [checked, setChecked] = useState(false);
                return (
                  <label key={label} style={{ display:"flex", gap:10, alignItems:"center", padding:"12px 14px", border:`1.5px solid ${checked?C.gold:C.border}`, borderRadius:10, cursor:"pointer", background:checked?`${C.gold}0A`:C.white, transition:"all .15s" }}>
                    <input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)} style={{ accentColor:C.gold, width:16, height:16 }} />
                    <span style={{ fontSize:18 }}>{icon}</span>
                    <span style={{ fontSize:13, color:C.navy, fontWeight:checked?700:400 }}>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ marginTop:24, paddingTop:16, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"flex-end", gap:10 }}>
          <Btn variant="outlineDark">Cancel</Btn>
          <Btn onClick={save}>💾 Save Profile</Btn>
        </div>
      </Card>
    </div>
  );
};

// ── SETTINGS PAGE ──────────────────────────────────────────────────────────────
const SettingsPage = ({ onNav }) => (
  <div style={{ maxWidth:720 }}>
    {[
      { title:"Account", icon:"👤", items:[
        { label:"Full Name", value:"Adaeze Okonkwo", type:"input" },
        { label:"Email", value:"adaeze@unilag.edu.ng", type:"input" },
        { label:"Change Password", value:"", type:"button" },
      ]},
      { title:"Subscription", icon:"💳", items:[
        { label:"Current Plan", value:"Free Plan", type:"display" },
        { label:"Upgrade to Pro (₦7,500/mo)", value:"", type:"cta" },
        { label:"Upgrade to Premium (₦15,000/mo)", value:"", type:"cta2" },
      ]},
      { title:"Notifications", icon:"🔔", items:[
        { label:"Deadline reminders (30 days before)", value:true, type:"toggle" },
        { label:"Deadline reminders (7 days before)", value:true, type:"toggle" },
        { label:"New scholarship alerts", value:true, type:"toggle" },
        { label:"AI match updates", value:false, type:"toggle" },
        { label:"Weekly progress digest", value:true, type:"toggle" },
      ]},
      { title:"Danger Zone", icon:"⚠️", items:[
        { label:"Delete Account", value:"", type:"danger" },
      ]},
    ].map(section=>(
      <Card key={section.title} style={{ marginBottom:20 }}>
        <h3 style={{ fontWeight:700, color:C.navy, fontSize:16, marginBottom:16 }}>{section.icon} {section.title}</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {section.items.map(item=>(
            <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:14, color:C.navy, fontWeight:500 }}>{item.label}</span>
              {item.type==="input" && <input defaultValue={item.value} style={{ padding:"6px 12px", border:`1px solid ${C.border}`, borderRadius:6, fontSize:13, fontFamily:"system-ui", width:240 }} />}
              {item.type==="toggle" && (
                <div style={{ width:44, height:24, borderRadius:12, background:item.value?C.gold:C.grayLight, position:"relative", cursor:"pointer", transition:"background .2s" }}>
                  <div style={{ position:"absolute", top:3, left:item.value?22:3, width:18, height:18, borderRadius:"50%", background:C.white, boxShadow:"0 1px 4px rgba(0,0,0,.2)", transition:"left .2s" }} />
                </div>
              )}
              {item.type==="display" && <Badge>{item.value}</Badge>}
              {item.type==="button" && <Btn size="sm" variant="outlineDark">Change</Btn>}
              {item.type==="cta" && <Btn size="sm">Upgrade</Btn>}
              {item.type==="cta2" && <Btn size="sm" variant="navy">Upgrade</Btn>}
              {item.type==="danger" && <Btn size="sm" variant="danger">Delete Account</Btn>}
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// ── ROOT APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [dashPage, setDashPage] = useState("home");
  const [authed, setAuthed] = useState(false);

  const navigate = (dest) => {
    if(dest==="dashboard"){ setAuthed(true); setPage("dashboard"); }
    else setPage(dest);
    window.scrollTo(0,0);
  };

  const handleAuth = () => { setAuthed(true); setPage("dashboard"); window.scrollTo(0,0); };

  if(page==="landing") return <LandingPage onNav={navigate} />;
  if(page==="login")   return <AuthPage mode="login"  onNav={navigate} onAuth={handleAuth} />;
  if(page==="signup")  return <AuthPage mode="signup" onNav={navigate} onAuth={handleAuth} />;

  if(page==="dashboard") {
    const pageMap = {
      home:        <DashHome setPage={setDashPage} />,
      matches:     <MatchesPage setPage={setDashPage} />,
      scholarships:<ScholarshipsPage />,
      tracker:     <TrackerPage />,
      calendar:    <CalendarPage />,
      documents:   <DocumentsPage />,
      profile:     <ProfilePage />,
      settings:    <SettingsPage onNav={navigate} />,
    };
    return (
      <DashboardShell onNav={navigate} activePage={dashPage} setPage={setDashPage}>
        {pageMap[dashPage] || pageMap.home}
      </DashboardShell>
    );
  }
  return null;
}
