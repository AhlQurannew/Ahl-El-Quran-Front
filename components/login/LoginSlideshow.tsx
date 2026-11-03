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

  const hasCustomSlides = slides.length > 0;

  return (
    <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
      {hasCustomSlides ? (
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

      {/* layered overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

      {/* bottom caption */}
      <div className="absolute bottom-12 inset-s-10 inset-e-10 text-white">
        <span className="inline-block bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-4">
          {t('منصة أهل القرآن')}
        </span>
        {hasCustomSlides ? (
          <>
            <h2 className="text-4xl font-bold leading-tight drop-shadow-lg">{t('أهل القرآن')}</h2>
            <p className="text-sm text-white/60 mt-2 font-light">{t('منصة إدارة المدارس القرآنية')}</p>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold leading-tight drop-shadow-lg">
              {t('المسجد النبوي')}<br />{t('الشريف')}
            </h2>
            <p className="text-sm text-white/60 mt-2 font-light">{t('المدينة المنورة — المملكة العربية السعودية')}</p>
          </>
        )}
        <div className="mt-5 w-12 h-0.5 bg-amber-400/70 rounded-full" />

        {slides.length > 1 && (
          <div className="mt-6 flex gap-2" role="tablist" aria-label={t('صور صفحة الدخول')}>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === current}
                aria-label={t('الصورة {number}', { number: index + 1 })}
                onClick={() => setCurrent(index)}
                className={cn('h-1.5 rounded-full transition-all', index === current ? 'w-8 bg-amber-400' : 'w-3 bg-white/50 hover:bg-white/80')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
