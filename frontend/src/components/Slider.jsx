import { useCallback, useEffect, useState } from 'react';
import { useSiteData } from '../context/SiteDataContext';

const SLIDE_INTERVAL = 5000;

// Hero banner slider. The current slide sits in view, the one just left slides out to the left,
// and every other slide waits off-screen on the right, so motion is always right-to-left.
export default function Slider() {
  const { banners } = useSiteData();
  const [{ current, previous, animate }, setPosition] = useState({ current: 0, previous: -1, animate: false });
  const [timerKey, setTimerKey] = useState(0);

  // New banner list (e.g. loaded from Firestore): start again at the first slide.
  useEffect(() => {
    setPosition({ current: 0, previous: -1, animate: false });
  }, [banners]);

  const goTo = useCallback(index => {
    setPosition(state => (index === state.current ? state : { current: index, previous: state.current, animate: true }));
  }, []);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = setInterval(() => {
      setPosition(state => ({ current: (state.current + 1) % banners.length, previous: state.current, animate: true }));
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [banners.length, timerKey]);

  return (
    <section className="group relative h-[240px] select-none overflow-hidden rounded-3xl shadow-xl shadow-forest-900/15 md:h-[270px]">
      <div className="relative h-full w-full">
        {banners.map((banner, index) => {
          const isCurrent = index === current;
          const isPrevious = index === previous;
          return (
            <div
              key={banner.id || index}
              aria-hidden={!isCurrent}
              className="slide-item absolute inset-0 flex h-full w-full flex-col justify-between p-5 text-white md:p-8"
              style={{
                transition: animate && (isCurrent || isPrevious) ? 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                transform: isCurrent ? 'translateX(0)' : isPrevious ? 'translateX(-100%)' : 'translateX(100%)',
                zIndex: isCurrent || isPrevious ? 10 : 0
              }}
            >
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img src={banner.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-forest-900/95 via-forest-800/85"></div>
              </div>

              <div className="relative z-10 max-w-2xl space-y-2 md:space-y-3">
                <span className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 backdrop-blur-md md:px-3.5 md:py-1 md:text-xs">{banner.tag}</span>
                <h1 className="line-clamp-2 text-xl font-black leading-tight tracking-tight drop-shadow-sm md:text-2xl lg:text-3xl">{banner.title}</h1>
                <p className="line-clamp-2 max-w-xl text-xs font-medium leading-relaxed text-forest-100/90 md:text-sm">{banner.desc}</p>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/15 pt-2.5 text-[10px] font-semibold text-forest-100 md:pt-3 md:text-xs">
                {(banner.features || []).map((feature, featureIndex) => (
                  <span key={feature} className="flex items-center gap-x-3">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-circle-check text-[10px] text-emerald-300"></i>
                      <span>{feature}</span>
                    </span>
                    {featureIndex < banner.features.length - 1 && <span className="hidden text-white/30 sm:inline">•</span>}
                  </span>
                ))}
              </div>

              <div className="pointer-events-none absolute -bottom-5 -right-3 z-0 select-none text-[95px] font-black leading-none text-white/[0.05] md:-bottom-8 md:-right-6 md:text-[180px]">IELTS</div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-3.5 z-20 flex items-center justify-center gap-1.5">
        {banners.map((banner, index) => (
          <button
            key={banner.id || index}
            type="button"
            aria-label={`Slide ${index + 1}`}
            onClick={() => { goTo(index); setTimerKey(key => key + 1); }}
            className={`h-2 rounded-full transition-all md:h-2.5 ${index === current ? 'w-6 bg-white md:w-7' : 'w-2 bg-white/40 hover:bg-white/70 md:w-2.5'}`}
          />
        ))}
      </div>
    </section>
  );
}
