import { Link } from 'react-router-dom'
import { BookOpen, FileText, Users, Settings, Send, Eye, HelpCircle, Mail, Table2, ShieldCheck, CheckCircle2, Layers, TriangleAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo-transparent.svg'

const sections = [
  { id: 'overview', label: 'How it works', icon: Layers },
  { id: 'getting-started', label: 'Getting started', icon: Mail },
  { id: 'templates', label: 'Create a template', icon: FileText },
  { id: 'recipients', label: 'Upload recipients', icon: Users },
  { id: 'variables', label: 'Map variables', icon: Table2 },
  { id: 'send', label: 'Send & queue', icon: Send },
  { id: 'tracking', label: 'Track sends', icon: Eye },
  { id: 'faq', label: 'Troubleshooting', icon: HelpCircle },
]

function H2({ id, icon: Icon, children }) {
  return (
    <h2 id={id} className="scroll-mt-24 flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-50">
      <Icon className="h-5 w-5 text-teal-400" />
      {children}
    </h2>
  )
}

function P({ children }) {
  return <p className="mt-3 text-sm leading-relaxed text-slate-400">{children}</p>
}

function Var({ children }) {
  return <code className="rounded border border-teal-500/20 bg-teal-500/10 px-1.5 py-0.5 text-xs font-medium text-teal-300">{children}</code>
}

function Step({ n, title, children }) {
  return (
    <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/15 text-xs font-semibold text-teal-300">{n}</span>
        <span className="text-sm font-medium text-slate-200">{title}</span>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-slate-400">{children}</div>
    </div>
  )
}

function Tip({ children }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-teal-500/20 bg-teal-500/[0.07] p-3 text-sm text-teal-200">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
      <span>{children}</span>
    </div>
  )
}

function Warn({ children }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] p-3 text-sm text-amber-200">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <span>{children}</span>
    </div>
  )
}

export default function Docs() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-1">
            <img src={logo} alt="distribute" className="h-8 w-8" />
            <span className="text-sm font-semibold tracking-tight text-slate-50">distribute</span>
          </Link>
          <Link to={user ? '/app' : '/login'} className="btn-primary">Open app</Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-10 md:grid-cols-[220px_1fr]">
        <nav className="hidden h-fit md:sticky md:top-20 md:block">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-slate-500">On this page</p>
          <ul className="space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/[0.03] hover:text-slate-100"
                >
                  <Icon className="h-3.5 w-3.5 text-slate-600" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="max-w-2xl">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-400" />
            <p className="text-sm font-medium uppercase tracking-widest text-slate-400">distribute guide</p>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
            Personalized certificates, <span className="text-teal-500">at scale.</span>
          </h1>
          <P>
            distribute generates a custom PDF certificate for every row of your roster and emails it to the right address,
            no copy-paste fatigue or third-party mail merge. This guide walks you through the whole flow in about five minutes.
          </P>

          <section className="mt-10">
            <H2 id="overview" icon={Layers}>How it works</H2>
            <P>Every send follows the same three steps:</P>
            <Step n={1} title="Design one template">
              Add placeholders like <Var>{'{name}'}</Var>, <Var>{'{course}'}</Var> and <Var>{'{date}'}</Var>. The template is the
              base of every certificate you send; design it once, reuse it forever.
            </Step>
            <Step n={2} title="Upload your roster">
              Upload an Excel file where every row is a recipient. Map the columns to your template variables and preview
              the first rows before anything is sent.
            </Step>
            <Step n={3} title="Distribute">
              Pick a template, pick your recipients, and send. Each person receives an email with their own certificate
              attached.
            </Step>
          </section>

          <section className="mt-10">
            <H2 id="getting-started" icon={Mail}>Getting started</H2>
            <Step n={1} title="Create an account">
              Sign up with your email and password, then sign in. Everything you build is private to your account.
            </Step>
            <Step n={2} title="Verify your email">
              In Settings, send yourself a verification code and enter it. This keeps your sending identity confirmed.
            </Step>
            <Step n={3} title="Send">
              Nothing to wire up. Mail goes out from the platform&apos;s verified domain; the application marks every message
              with the account it was sent by.
            </Step>
            <Tip>
              A test send from the Send page is the fastest way to confirm everything is wired up.
            </Tip>
          </section>

          <section className="mt-10">
            <H2 id="templates" icon={FileText}>Create a template</H2>
            <P>
              On the <span className="text-slate-200">Templates</span> page, create a new template with a name, a subject line,
              an email body, and a certificate design.
            </P>
            <Step n={1} title="Write the email">
              The body can use the same placeholders as the certificate, so every recipient sees <em>their</em> details in
              the message too.
            </Step>
            <Step n={2} title="Design the certificate">
              In the certificate editor, lay out the headline, your recipient line, and any supporting text. Use
              placeholders wherever the value changes per person.
            </Step>
            <Step n={3} title="Save it">
              Templates are saved to your account and stay available for future sends. You can edit them anytime.
            </Step>
            <Warn>
              Two recipients must never share an email in one batch; each row is a unique person. Deduplicate the roster
              before uploading if you suspect repeats.
            </Warn>
          </section>

          <section className="mt-10">
            <H2 id="recipients" icon={Users}>Upload recipients</H2>
            <P>
              Prepare an Excel file where each <em>row</em> is one recipient and each <em>column</em> is one field (name,
              email, course, date…). Keep the first row as column headers.
            </P>
            <Step n={1} title="Upload">
              Go to <span className="text-slate-200">Recipients</span> and upload your file. You can also wipe the current
              roster and start over.
            </Step>
            <Step n={2} title="Check the preview">
              Review the parsed columns and the first rows. Fix the file and re-upload if anything looks wrong.
            </Step>
            <Step n={3} title="Keep it current">
              Your recipients list is reused across sends until you replace it. Upload a fresh roster whenever the audience
              changes.
            </Step>
            <Tip>
              You only need one &quot;email&quot; column for delivery; every other column becomes a placeholder you can reference
              in the template.
            </Tip>
          </section>

          <section className="mt-10">
            <H2 id="variables" icon={Table2}>Map variables</H2>
            <P>
              Variables are the bridge between your column headers and your certificate text. You write a placeholder like{' '}
              <Var>{'{course}'}</Var> in the template, and distribute fills it with the value from the matching column.
            </P>
            <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-relaxed text-slate-400">
              <p><span className="text-slate-200">Headers in roster:</span> name, email, course, date</p>
              <p className="mt-1">
                <span className="text-slate-200">Template text:</span> Congratulations {`{'{name}'}`}, you completed{' '}
                {`{'{course}'}`} on {`{'{date}'}`}.
              </p>
              <p className="mt-1"><span className="text-slate-200">Generated:</span> Congratulations Sarah, you completed Frontend Fundamentals on Sep 11, 2026.</p>
            </div>
            <P>
              When you upload a roster, the mapping screen lets you confirm each column header matches the variable you
              intend to fill. Headers and placeholders are matched by name.
            </P>
            <Warn>
              If a placeholder has no matching column, it stays as-is in the generated certificate. Keep placeholders and
              column headers spelled identically.
            </Warn>
          </section>

          <section className="mt-10">
            <H2 id="send" icon={Send}>Send &amp; queue</H2>
            <Step n={1} title="Pick template and recipients">
              On the <span className="text-slate-200">Send</span> page, choose the template to use and confirm your recipient
              count.
            </Step>
            <Step n={2} title="Send">
              Hit Send Emails. Rows are processed one by one, in the order you uploaded them.
            </Step>
            <Step n={3} title="Wait for the queue">
              Batch jobs run safely in the background. Each account runs one job at a time, and jobs from different accounts
              are fairly interleaved; nothing is dropped or reordered.
            </Step>
            <P>
              You can leave the page while a job runs; it continues in the background and your Recent Sends reflect the
              progress when you come back.
            </P>
          </section>

          <section className="mt-10">
            <H2 id="tracking" icon={Eye}>Track sends</H2>
            <P>
              The Send page shows your <span className="text-slate-200">Active Sends</span> (jobs currently queued or
              running) and a <span className="text-slate-200">Recent Sends</span> list with per-recipient results: sent,
              skipped, or failed, with the reason on failure.
            </P>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-slate-300">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
              Delivery guarantees: a batch is processed exactly once per recipient, always in roster order, and failures are
              recorded so you can see exactly who was missed.
            </div>
          </section>

          <section className="mt-10">
            <H2 id="faq" icon={HelpCircle}>Troubleshooting</H2>
            <P className="font-medium text-slate-200">My send fails</P>
            <P>
              Check the Recent Sends entry for that recipient; the failure reason is stored. Invalid addresses, full inboxes,
              and provider rejections each show their own message.
            </P>
            <P className="mt-5 font-medium text-slate-200">My placeholder shows up as raw text</P>
            <P>
              The column header doesn&apos;t match the placeholder name. Compare them exactly (case-sensitive) and re-upload
              or re-map.
            </P>
            <P className="mt-5 font-medium text-slate-200">A recipient didn&apos;t get their email</P>
            <P>
              Check the Recent Sends entry for that person; the failure reason is stored. An invalid address, a full inbox,
              or a provider rejection each show their own message.
            </P>
            <P className="mt-5 font-medium text-slate-200">Can I send to the same person twice?</P>
            <P>
              Within one batch, no; every row must be a unique email. To re-send a certificate later, upload a fresh roster
              with that person once and run another send.
            </P>
          </section>

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-8">
            <Link to={user ? '/app' : '/login'} className="btn-primary">
              {user ? 'Open the app' : 'Get started for free'}
            </Link>
            <Link to="/" className="btn-secondary">Back to home</Link>
          </div>
        </article>
      </div>
    </div>
  )
}