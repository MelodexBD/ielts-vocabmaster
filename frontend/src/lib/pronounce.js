// Reads an English word aloud with the browser's built-in speech (British English first, as in IELTS).
// Browsers without speech (some in-app browsers) play Google's pronunciation audio instead.
let fallbackAudio = null;

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(voice => voice.lang === 'en-GB') || voices.find(voice => voice.lang === 'en-US') || voices.find(voice => voice.lang.startsWith('en'));
}

export function pronounce(word, { onEnd } = {}) {
  const text = String(word || '').trim();
  if (!text) return;
  if ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.85;
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utterance);
    return;
  }
  fallbackAudio?.pause();
  fallbackAudio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q=${encodeURIComponent(text)}`);
  fallbackAudio.onended = () => onEnd?.();
  fallbackAudio.onerror = () => {
    onEnd?.();
    window.notify('Pronunciation is not available in this browser. Please open the site in Chrome.', 'info');
  };
  fallbackAudio.play().catch(() => onEnd?.());
}
