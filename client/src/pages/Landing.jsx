import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Send, ShieldCheck, Settings2, Check, ArrowRight, FileText, Users, Type, Eye, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo-transparent.svg'

function Logo() {
  return (
    <div className="flex items-center gap-1">
      <img src={logo} alt="distribute" className="h-8 w-8" />
      <span className="text-sm font-semibold tracking-tight text-slate-50">distribute</span>
    </div>
  )
}

function Eyebrow({ children }) {
  return (
    <p className="inline-block rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-teal-300">
      {children}
    </p>
  )
}

function DataRow({ label, value, check }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center ${check ? 'text-teal-400' : 'text-slate-700'}`}>
        <Check className="h-3.5 w-3.5" />
      </span>
      <span className="w-24 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="truncate text-left text-sm font-medium text-slate-200">{value}</span>
    </div>
  )
}

function CertificateCard() {
  return (
    <div className="card w-full max-w-sm p-6 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-teal-400" />
          <span className="text-sm font-semibold text-slate-100">Course Completion</span>
        </div>
        <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-teal-300">
          PDF
        </span>
      </div>
      <div className="mt-4 border-t border-white/[0.06] pt-2">
        <DataRow label="Recipient" value="Sarah Kim" check />
        <DataRow label="Course" value="Frontend Fundamentals" check />
        <DataRow label="Issued" value="Sep 11, 2026" check />
        <DataRow label="Status" value="Sent" check />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500">1 of 1,240 delivered</span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-teal-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" /> in queue
        </span>
      </div>
    </div>
  )
}

function SendProgressCard() {
  const sent = 142
  const total = 178
  return (
    <div className="card w-full max-w-md p-6 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">June Cohort</p>
          <p className="truncate text-xs text-slate-500">Template: Course Completion</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
          Sending
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-5 text-sm">
        <span className="font-medium text-teal-300">Sent: {sent}</span>
        <span className="text-slate-400">Pending: {total - sent}</span>
        <span className="text-slate-400">Failed: 0</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-300"
          style={{ width: `${Math.round((sent / total) * 100)}%` }}
        />
      </div>
    </div>
  )
}

function RecipientsCard() {
  const rows = [
    { initials: 'SK', name: 'Sarah Kim', ready: true },
    { initials: 'AR', name: 'Ahmed Raza', ready: true },
    { initials: 'MP', name: 'Mei Park', ready: true },
  ]
  return (
    <div className="card w-full max-w-md p-6 text-left">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-teal-400" />
        <span className="text-sm font-semibold text-slate-100">June Cohort</span>
        <span className="ml-auto rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-400">
          1,240 rows
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-[10px] font-semibold text-teal-300">
              {r.initials}
            </div>
            <span className="flex-1 truncate text-sm text-slate-200">{r.name}</span>
            {r.ready && (
              <span className="flex items-center gap-1 text-xs font-medium text-teal-400">
                <Check className="h-3.5 w-3.5" /> Ready
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">…and 1,237 more from your Excel roster</p>
    </div>
  )
}

function AppMock() {
  const navs = [
    { label: 'Templates', icon: FileText },
    { label: 'Recipients', icon: Users },
    { label: 'Send', icon: Send, active: true },
    { label: 'Settings', icon: Settings2 },
  ]
  const stats = [
    { value: '1,240', label: 'Recipients' },
    { value: '3', label: 'Templates' },
    { value: '2', label: 'In queue' },
  ]
  return (
    <div className="card flex h-full min-h-[400px] overflow-hidden p-0 text-left">
      <aside className="hidden w-36 shrink-0 flex-col border-r border-white/[0.06] p-2.5 sm:flex">
        <div className="mb-3 flex items-center gap-2 px-1">
          <img src={logo} alt="distribute" className="h-6 w-6" />
          <span className="text-xs font-semibold tracking-tight text-slate-100">distribute</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {navs.map((n) => (
            <span
              key={n.label}
              className={`flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium ${n.active ? 'bg-teal-500/10 text-teal-300' : 'text-slate-400'}`}
            >
              <n.icon className="h-3 w-3" /> {n.label}
            </span>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-[9px] font-semibold text-teal-950">
            ML
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold text-slate-200">Maya Lindqvist</p>
            <p className="truncate text-[9px] text-slate-500">maya@acme.org</p>
          </div>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col p-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-slate-100">Send certificates</p>
          <span className="cursor-default rounded-md bg-teal-500 px-2 py-1 text-[10px] font-semibold text-teal-950">New batch</span>
        </div>
        <div className="mt-2.5 flex gap-2">
          {stats.map((s) => (
            <div key={s.label} className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5">
              <p className="text-sm font-semibold text-slate-100">{s.value}</p>
              <p className="text-[9px] uppercase tracking-wider text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-slate-200">June Cohort</p>
              <p className="truncate text-[10px] text-slate-500">Template: Course Completion</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[9px] font-medium text-teal-300">
              <span className="h-1 w-1 animate-pulse rounded-full bg-teal-400" /> Sending
            </span>
          </div>
          <div className="mt-2 flex gap-3 text-[11px]">
            <span className="font-medium text-teal-300">142 sent</span>
            <span className="text-slate-400">36 pending</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2">
          <span className="text-[9px] font-medium uppercase tracking-wider text-slate-500">Templates</span>
          <div className="flex gap-1">
            <span className="cursor-default rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-slate-300">Course Completion</span>
            <span className="cursor-default rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-slate-300">Workshop</span>
          </div>
        </div>
      </main>
    </div>
  )
}

function BatchesCard() {
  const batches = [
    { name: 'March Cohort', note: '1,240 of 1,240', done: true },
    { name: 'June Cohort', note: '142 of 178', sending: true },
    { name: 'July Cohort', note: 'Waiting in line', queued: true },
  ]
  return (
    <div className="card p-4 text-left">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-100">Send queue</span>
        <span className="text-[10px] text-slate-500">runs in order</span>
      </div>
      <div className="mt-2 divide-y divide-white/[0.05]">
        {batches.map((b) => (
          <div key={b.name} className="flex items-center justify-between gap-3 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-slate-200">{b.name}</p>
              <p className="truncate text-[10px] text-slate-500">{b.note}</p>
            </div>
            {b.sending && <span className="shrink-0 rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[9px] font-medium text-teal-300">Sending</span>}
            {b.done && <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-slate-400">Done</span>}
            {b.queued && <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-slate-400">Queued</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function CertificateEditorCard() {
  const vars = ['name', 'course', 'date']
  return (
    <div className="card w-full p-2.5 text-left">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex cursor-default items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-slate-200">
          <Type className="h-3 w-3" /> Add Text
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-flex cursor-default items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-slate-200">
            <Eye className="h-3 w-3" /> Preview
          </span>
          <span className="inline-flex cursor-default items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-300">
            <Trash2 className="h-3 w-3" /> Remove
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-center rounded-lg border border-white/[0.06] bg-slate-950/50 p-1.5">
          <div className="flex w-full aspect-[16/10] flex-col justify-center bg-white p-2.5 shadow-2xl ring-1 ring-black/30">
            <div className="flex h-full flex-col justify-center border-2 border-double border-teal-200 px-6 py-4 text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-teal-700">Certificate of Completion</p>
              <p className="mt-2 text-[10px] text-slate-500">This certifies that</p>
              <p className="mt-1 font-serif text-2xl font-semibold box-decoration-clone border-2 border-dashed border-indigo-400 px-2 text-teal-700">{'{name}'}</p>
              <p className="mt-1 text-[10px] text-slate-500">has successfully completed</p>
              <p className="font-serif text-base font-medium text-slate-700">{'{course}'}</p>
              <div className="mt-4 flex items-end justify-between px-2">
                <div className="text-left">
                  <p className="font-serif text-[11px] font-medium text-slate-700">{'{date}'}</p>
                  <p className="mt-0.5 text-[8px] uppercase tracking-wider text-slate-400">Date</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-base italic text-teal-800" style={{ fontFamily: 'Brush Script MT, cursive' }}>Maya Lindqvist</p>
                  <p className="mt-0.5 border-t border-slate-400 pt-0.5 text-[8px] uppercase tracking-wider text-slate-400">Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden w-40 shrink-0 flex-col gap-1.5 lg:flex">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
            <h4 className="mb-1 text-[11px] font-semibold text-slate-200">Text Properties</h4>
            <div className="space-y-1">
              <div>
                <p className="label !mb-0.5 !text-[9px] !text-slate-500">Font Size</p>
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-slate-950/70 px-2 py-0.5 text-[10px] text-slate-300">
                  36 <span className="font-mono text-slate-500">px</span>
                </div>
              </div>
              <div>
                <p className="label !mb-0.5 !text-[9px] !text-slate-500">Font</p>
                <div className="flex items-center justify-between rounded-md border border-white/10 bg-slate-950/70 px-2 py-0.5 text-[10px] text-slate-300">
                  Georgia, serif
                </div>
              </div>
              <div>
                <p className="label !mb-0.5 !text-[9px] !text-slate-500">Alignment</p>
                <div className="grid grid-cols-3 gap-0.5">
                  {['left', 'center', 'right'].map((a) => (
                    <span
                      key={a}
                      className={`cursor-default rounded py-0.5 text-center text-[9px] capitalize ${a === 'center' ? 'bg-teal-500 font-semibold text-teal-950' : 'bg-white/[0.05] text-slate-400'}`}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
            <h4 className="mb-1 text-[11px] font-semibold text-slate-200">Texts (3)</h4>
            <div className="space-y-0.5">
              <span className="flex cursor-default items-center border border-teal-400/40 bg-teal-400/10 px-1.5 py-0.5 text-[10px] text-slate-200">
                <span className="font-mono">{'{name}'}</span>
              </span>
              <span className="flex cursor-default items-center border border-white/[0.06] bg-slate-950/50 px-1.5 py-0.5 text-[10px] text-slate-300">
                <span className="font-mono">{'{course}'}</span>
              </span>
              <span className="flex cursor-default items-center border border-white/[0.06] bg-slate-950/50 px-1.5 py-0.5 text-[10px] text-slate-300">
                <span className="font-mono">{'{date}'}</span>
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
            <h4 className="mb-1 text-[11px] font-semibold text-slate-200">Variables</h4>
            <div className="flex flex-wrap gap-0.5">
              {vars.map((v) => (
                <span key={v} className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-slate-400">{'{'}{v}{'}'}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const { user } = useAuth()

  useEffect(() => {
    const reveal = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -40px' }
    )
    reveal.forEach((el) => io.observe(el))

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const bg = document.querySelector('[data-parallax]')
        if (bg) bg.style.transform = `translateY(${window.scrollY * 0.25}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const items = [
    'Share all participants their e-certificates at once',
    'Send completion certificates after every course',
    'Distribute workshop attendance letters in one batch',
    'Issue internship completion PDFs to your whole batch',
    'Email award certificates to event winners instantly',
    'Deliver training certificates without any manual work',
    'Notify every student with their personalized PDF',
    'Send seminar participation certificates to all attendees',
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              to="/docs"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-teal-300"
            >
              Docs
            </Link>
            <div className="flex items-center gap-2">
            {user ? (
              <Link to="/app" className="btn-primary">Open app</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Sign in</Link>
                <Link to="/login" className="btn-primary">Get started</Link>
              </>
            )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-14 pt-20 text-center">
        <div
          aria-hidden
          data-parallax
          className="pointer-events-none absolute inset-x-0 top-0 h-[800px] bg-[radial-gradient(circle,rgba(129,193,75,0.25)_1.25px,transparent_1.25px)] [background-size:22px_22px] [mask-image:radial-gradient(70%_60%_at_50%_38%,black_30%,transparent_80%)]"
        />
        <Eyebrow>PDF certificates, delivered by email</Eyebrow>
        <h1
          data-reveal
          style={{ '--reveal-delay': '80ms' }}
          className="font-stack mx-auto mt-8 max-w-3xl text-5xl font-semibold leading-[1.15] tracking-wide text-slate-50 md:text-6xl"
        >
          Personalized <span className="text-teal-500">certificates</span>, at scale.
        </h1>
        <p
          data-reveal
          style={{ '--reveal-delay': '180ms' }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400"
        >
          One template, one roster, thousands of personalized PDFs in minutes.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/login" className="btn-primary px-6 py-3 text-base">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how-it-works" className="btn-secondary px-6 py-3 text-base">How it works</a>
        </div>

<div data-reveal style={{ '--reveal-delay': '280ms' }} className="relative mx-auto mt-16 grid max-w-5xl gap-5 md:grid-cols-4">
          <div className="md:col-span-2 md:row-span-2 h-full">
            <AppMock />
          </div>
          <SendProgressCard />
          <CertificateCard />
          <div className="md:col-span-2">
            <BatchesCard />
          </div>
        </div>

        <div className="relative mt-16 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-10">
            {[...items, ...items].map((t, i) => (
              <span key={i} className="flex shrink-0 items-center gap-10 text-sm text-slate-500">
                <span className="truncate">{t}</span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-teal-500/50" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-[28vh]">
        <div data-reveal className="grid items-center gap-16 md:grid-cols-5">
          <div className="md:col-span-2">
            <Eyebrow>Design once</Eyebrow>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
              One template, every recipient's name on it
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Build an HTML template with simple placeholders like <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-sm text-teal-300">{"{name}"}</code>{' '}
              and <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-sm text-teal-300">{"{course}"}</code>. Each certificate renders as a branded PDF. No design software, no manual skipping.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                Reusable templates with ready-made starters
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                Live preview while you edit
              </li>
            </ul>
          </div>
          <div className="flex justify-center md:col-span-3 md:justify-end">
            <CertificateEditorCard />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <div className="order-2 flex justify-center md:order-1 md:justify-start">
            <div data-reveal className="w-full max-w-md"><RecipientsCard /></div>
          </div>
          <div data-reveal style={{ '--reveal-delay': '120ms' }} className="order-1 md:order-2">
            <Eyebrow>Upload a roster</Eyebrow>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
              Excel in, addresses out
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400">
              Drop in your spreadsheet, review a live preview, and catch bad emails before they leave. Roster data stays scoped to your account. Nothing shared, nothing leaked.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                Upload, preview, and re-import in seconds
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                Per-recipient send tracking, batch-by-batch
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <div data-reveal className="card p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10">
              <Send className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-100">Batch sending, queued</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Fire off as many batches as you like. They run one at a time per account, in order, so nothing collides.
            </p>
          </div>
          <div data-reveal style={{ '--reveal-delay': '120ms' }} className="card p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10">
              <ShieldCheck className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-100">Progress that survives</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Every single send is recorded as it happens. Restart the machine and a stuck batch just picks up where it left off.
            </p>
          </div>
          <div data-reveal style={{ '--reveal-delay': '240ms' }} className="card p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10">
              <Settings2 className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-100">Your SMTP, your reputation</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Each account brings its own mail server. Emails go out from your domain. Deliverability stays in your hands.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div data-reveal className="card rounded-2xl border-white/[0.08] px-8 py-16 text-center">
          <Eyebrow>Ready when you are</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-xl text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
            Start distributing today
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-400">
            Sign up, connect your mail server, and your first batch of certificates is minutes away.
          </p>
          <Link to="/login" className="btn-primary mt-8 px-6 py-3 text-base">
            Get started for free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-1">
            <img src={logo} alt="distribute" className="h-6 w-6" />
            <span className="text-xs font-semibold tracking-tight text-slate-400">distribute</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400 shadow-[0_0_10px_3px_rgba(87,170,67,0.7)] ml-2" />
          </div>
          <p className="text-xs text-slate-600">Batch PDF certificates over email. Quietly, reliably.</p>
        </div>
      </footer>
    </div>
  )
}