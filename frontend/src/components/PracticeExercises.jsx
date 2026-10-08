import { useEffect, useRef, useState } from 'react';
import { practiceText } from '../lib/data';

function Feedback({ result, children }) {
  const color = result === null ? 'text-slate-600' : result ? 'text-emerald-700' : 'text-rose-600';
  return <p aria-live="polite" className={`mt-3 text-sm font-semibold ${color}`}>{children}</p>;
}

function ReadingPractice() {
  const [result, setResult] = useState(null);
  return (
    <>
      <h3 className="text-lg font-extrabold text-slate-800">Practice: True / False / Not Given</h3>
      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p><strong>Passage:</strong> Green roofs can lower building temperatures during summer. Some cities offer grants to encourage residents to install them. However, the long-term effect on local bird populations has not yet been studied.</p>
        <p><strong>Statement:</strong> Green roofs have been proven to increase the number of birds in cities.</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {['TRUE', 'FALSE', 'NOT GIVEN'].map(answer => (
          <button key={answer} type="button" onClick={() => setResult(answer === 'NOT GIVEN')} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:bg-forest-50">{answer}</button>
        ))}
      </div>
      <Feedback result={result}>{result === null ? practiceText.readingPrompt : result ? practiceText.readingCorrect : practiceText.readingWrong}</Feedback>
    </>
  );
}

function ListeningPractice() {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(practiceText.listeningPrompt);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const play = () => {
    if (!('speechSynthesis' in window)) {
      setMessage('Audio playback is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('The project meeting has been moved from Tuesday. It will now take place on Thursday at half past ten in the morning.');
    utterance.lang = 'en-GB';
    window.speechSynthesis.speak(utterance);
  };

  const check = () => {
    const correct = answer.trim().toLowerCase() === 'thursday';
    setResult(correct);
    setMessage(correct ? practiceText.listeningCorrect : practiceText.listeningWrong);
  };

  return (
    <>
      <h3 className="text-lg font-extrabold text-slate-800">Practice: Form Completion</h3>
      <p className="mt-2 text-sm text-slate-600">{practiceText.listeningInstruction}</p>
      <button type="button" onClick={play} className="mt-4 rounded-xl bg-forest-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-forest-700">
        <i className="fa-solid fa-volume-high mr-2"></i>Play audio
      </button>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input value={answer} onChange={event => setAnswer(event.target.value)} type="text" placeholder="Type the day" className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-forest-500" />
        <button type="button" onClick={check} className="rounded-xl bg-forest-600 px-4 py-3 text-sm font-bold text-white hover:bg-forest-700">Check answer</button>
      </div>
      <Feedback result={result}>{message}</Feedback>
    </>
  );
}

function WritingPractice() {
  const [plan, setPlan] = useState('');
  const [showSample, setShowSample] = useState(false);
  const words = plan.trim() ? plan.trim().split(/\s+/).length : 0;
  return (
    <>
      <h3 className="text-lg font-extrabold text-slate-800">Practice: Task 2 Essay Plan</h3>
      <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <strong>Question:</strong> Some people think public transport should be free in cities. To what extent do you agree or disagree?
      </p>
      <p className="mt-3 text-sm text-slate-600">{practiceText.writingInstruction}</p>
      <textarea value={plan} onChange={event => setPlan(event.target.value)} rows={6} placeholder="Write your position, reason 1, reason 2 and conclusion..." className="mt-4 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none focus:border-forest-500"></textarea>
      <p className="mt-2 text-right text-xs font-semibold text-slate-500">Planning words: <span>{words}</span></p>
      <button type="button" onClick={() => setShowSample(value => !value)} className="mt-3 rounded-xl border border-forest-200 bg-forest-50 px-4 py-2 text-sm font-bold text-forest-700">Show sample plan</button>
      {showSample && <p className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">{practiceText.writingSample}</p>}
    </>
  );
}

function SpeakingPractice() {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const start = () => {
    clearInterval(timer.current);
    setSecondsLeft(60);
    timer.current = setInterval(() => {
      setSecondsLeft(value => {
        if (value <= 1) {
          clearInterval(timer.current);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  };

  const label = secondsLeft === null || secondsLeft === 60 ? '01:00' : secondsLeft === 0 ? 'Now speak!' : `00:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <>
      <h3 className="text-lg font-extrabold text-slate-800">Practice: Speaking Part 2 Cue Card</h3>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        <p className="font-bold">Describe a skill you learned that was useful to you.</p>
        <ul className="mt-2 list-disc pl-5">
          <li>What the skill was</li>
          <li>When and how you learned it</li>
          <li>Why you decided to learn it</li>
          <li>And explain how it has helped you</li>
        </ul>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span aria-live="polite" className="text-2xl font-black text-forest-700">{label}</span>
        <button type="button" onClick={start} className="rounded-xl bg-forest-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-forest-700">Start 1-minute preparation</button>
      </div>
      <textarea rows={4} placeholder="Note key words while you prepare..." className="mt-4 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none focus:border-forest-500"></textarea>
      <p className="mt-2 text-xs text-slate-500">{practiceText.speakingNote}</p>
    </>
  );
}

const EXERCISES = { Reading: ReadingPractice, Listening: ListeningPractice, Writing: WritingPractice, Speaking: SpeakingPractice };

export default function PracticeExercise({ module }) {
  const Exercise = EXERCISES[module];
  return Exercise ? <Exercise /> : null;
}
