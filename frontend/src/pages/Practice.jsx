import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSiteData } from '../context/SiteDataContext';
import { useUI } from '../context/UIContext';
import { MODULE_NAMES, moduleLessons } from '../lib/data';
import PracticeExercise from '../components/PracticeExercises';

function safeMediaUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

const text = value => (typeof value === 'string' ? value.trim() : '');

function Field({ label, value, small }) {
  if (!text(value)) return null;
  return (
    <div className="mt-3">
      {small ? <h4 className="text-xs font-extrabold text-slate-500">{label}</h4> : <p className="text-xs font-bold text-slate-500">{label}</p>}
      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{text(value)}</p>
    </div>
  );
}

function Audio({ url, className = 'mt-3 w-full' }) {
  const src = safeMediaUrl(url);
  if (!src) return null;
  return <audio controls preload="none" className={className}><source src={src} />Your browser cannot play this audio.</audio>;
}

// Introductory section uploaded from the admin panel's "Home Section Upload".
function ModuleSection({ module }) {
  const { moduleSections } = useSiteData();
  const section = moduleSections[module];
  if (!section || typeof section !== 'object') return null;
  const details = {
    Reading: [['Reading focus', section.readingMaterial]],
    Listening: [['Transcript / listening focus', section.listeningMaterial]],
    Writing: [['Task type', section.taskType], ['Writing prompt', section.writingPrompt], ['Model answer / planning focus', section.writingMaterial]],
    Speaking: [['Cue-card topic', section.cueCard], ['Bullet points / model response', section.speakingMaterial]]
  }[module] || [];
  const hasAudio = module === 'Listening' && safeMediaUrl(section.audioUrl);
  if (!text(section.headline) && !text(section.summary) && !hasAudio && !details.some(([, value]) => text(value))) return null;

  return (
    <section className="rounded-3xl border border-forest-100 bg-forest-50/70 p-5 shadow-sm md:p-7">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-forest-600">Module section</p>
      {text(section.headline) && <h2 className="mt-1 text-lg font-extrabold text-slate-800">{text(section.headline)}</h2>}
      {text(section.summary) && <p className="mt-2 text-sm leading-6 text-slate-600">{text(section.summary)}</p>}
      {hasAudio && (
        <div className="mt-3">
          <p className="text-xs font-bold text-slate-500">Audio</p>
          <Audio url={section.audioUrl} className="mt-1 w-full" />
        </div>
      )}
      {details.map(([label, value]) => <Field key={label} label={label} value={value} />)}
    </section>
  );
}

// Content uploaded for the book and test the visitor last opened.
function UploadedContent({ module }) {
  const { content } = useSiteData();
  const { selection } = useUI();
  const records = content.filter(record =>
    record && record.module === module && record.book === selection.book && record.test === selection.test &&
    (module !== 'Reading' || ['title', 'passage', 'prompt', 'questions'].some(field => text(record[field])))
  );
  if (!records.length) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-4 border-b border-slate-100 pb-3">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-forest-600">{selection.book} · {selection.test}</p>
        <h2 className="mt-1 text-lg font-extrabold text-slate-800">Uploaded {module} content</h2>
      </div>
      <div className="space-y-3">
        {records.map((record, index) => (
          <article key={record.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-extrabold text-slate-800">{record.title || `${module} practice`}</h3>
            {module === 'Writing' && <Field small label="Task type" value={record.taskType} />}
            {module === 'Speaking' && <Field small label="Bullet points" value={record.bulletPoints} />}
            {module === 'Listening' && (
              <>
                <Audio url={record.audioUrl} />
                <Field small label="Transcript / instructions" value={record.transcript} />
                <Field small label="Questions & answers" value={record.questions} />
              </>
            )}
            {module === 'Writing' && (
              <>
                <Field small label="Task prompt" value={record.prompt} />
                <Field small label="Model answer / planning notes" value={record.modelAnswer} />
              </>
            )}
            {module === 'Speaking' && (
              <>
                <Field small label="Model answer / speaking notes" value={record.modelAnswer} />
                <Field small label="Useful vocabulary" value={record.vocabulary} />
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Practice() {
  const { module } = useParams();
  const navigate = useNavigate();
  if (!MODULE_NAMES.includes(module)) return <Navigate to="/" replace />;
  const lesson = moduleLessons[module];

  return (
    <div className="flex w-full flex-col space-y-5 p-4 md:p-0">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-8">
        <button type="button" onClick={() => navigate('/')} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-forest-700 hover:underline">
          <i className="fa-solid fa-arrow-left"></i> Back to dashboard
        </button>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-xl text-forest-700"><i className={`fa-solid ${lesson.icon}`}></i></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-forest-600">IELTS {module} Practice</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">{module} Exercise Lab</h1>
            <p className="mt-1 text-sm text-slate-500">{lesson.subtitle}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-lg font-extrabold text-slate-800">How to practise</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{lesson.explanation}</p>
        <ol className="mt-4 space-y-3">
          {lesson.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-100 text-xs font-extrabold text-forest-700">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <ModuleSection module={module} />
      <UploadedContent module={module} />

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-7">
        <PracticeExercise key={module} module={module} />
      </section>
    </div>
  );
}
