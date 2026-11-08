'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import siteAPI, { LoginSlide } from '@/app/API/site';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export const SLIDE_INTERVAL_MS = 5000;

/**
 * Login page hero. Shows the admin-managed slides as a cross-fading slideshow,
 * or the default mosque photo when none are configured (or the API is unreachable).
 */
export const LoginSlideshow: React.FC = () => {
  const [slides, setSlides] = useState<LoginSlide[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let active = true;
    siteAPI.listLoginSlides()
      .then((data) => { if (active) setSlides(data); })
      .catch(() => { /* keep the default image */ });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const hasSlides = slides.length > 0;

  return (
    <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
      {hasSlides ? (
        slides.map((slide, index) => (
          // eslint-disable-next-line @next/next/no-img-element -- images come from the API origin
          <img
            key={slide.id}
            src={slide.url}
            alt=""
            aria-hidden={index !== current}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out',
              index === current ? 'opacity-100' : 'opacity-0'
            )}
          />
        ))
      ) : (
        <Image src="/masjid.jpg" alt={t('المسجد النبوي الشريف')} fill className="object-cover" priority />
      )}

      {/* Photo only (no caption); a soft shade keeps the slide dots readable */}
      {slides.length > 1 && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-8 inset-x-0 flex justify-center gap-2" role="tablist" aria-label={t('صور صفحة الدخول')}>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === current}
                aria-label={t('الصورة {number}', { number: index + 1 })}
                onClick={() => setCurrent(index)}
                className={cn('h-1.5 rounded-full transition-all', index === current ? 'w-8 bg-amber-400' : 'w-3 bg-white/60 hover:bg-white/90')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
