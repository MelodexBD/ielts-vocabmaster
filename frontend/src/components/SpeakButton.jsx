import { useState } from 'react';
import { pronounce } from '../lib/pronounce';

// Round play button that reads the word aloud.
export default function SpeakButton({ word, small = false }) {
  const [speaking, setSpeaking] = useState(false);
  const play = () => {
    setSpeaking(true);
    pronounce(word, { onEnd: () => setSpeaking(false) });
    // Some browsers never report the end of speech; the button resets itself anyway.
    setTimeout(() => setSpeaking(false), 4000);
  };
  return (
    <button
      type="button"
      onClick={play}
      aria-label={`Play pronunciation of ${word}`}
      title="Play pronunciation"
      className={`flex shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 ${small ? 'h-7 w-7' : 'h-9 w-9'} ${speaking ? 'border-forest-600 bg-forest-600 text-white' : 'border-forest-200 bg-forest-50 text-forest-600 hover:bg-forest-600 hover:text-white'}`}
    >
      <i className={`fa-solid fa-volume-high ${small ? 'text-xs' : 'text-sm'} ${speaking ? 'animate-pulse' : ''}`}></i>
    </button>
  );
}
