import { useEffect, useMemo, useState } from 'react';
import './Onboarding.css';

const STORAGE_KEY = 'tj_hasOnboarded';

type Slide = {
  title: string;
  description: string;
  highlights: string[];
  illustration: 'identity' | 'benefits' | 'install';
};

const slides: Slide[] = [
  {
    title: 'Activa tu identidad',
    description: 'Tu credencial digital segura para moverte por todo San Luis Potosí.',
    highlights: ['Gratis para jóvenes de 12 a 29 años', 'Funciona con la wallet ciudadana'],
    illustration: 'identity',
  },
  {
    title: 'Suma beneficios',
    description: 'Descuentos, becas y experiencias llegan directo a la app.',
    highlights: ['Aliados nuevos cada mes', 'Convocatorias sin burocracia'],
    illustration: 'benefits',
  },
  {
    title: 'Instala la app',
    description: 'Agrega la PWA a tu pantalla de inicio y ten tu credencial siempre a la mano.',
    highlights: ['Toca “Agregar a pantalla de inicio”', 'Activa notificaciones para no perderte nada'],
    illustration: 'install',
  },
];

const useHasOnboarded = () => {
  const [hasOnboarded, setHasOnboarded] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const completeOnboarding = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    }
    setHasOnboarded(true);
  };

  return useMemo(
    () => ({ hasOnboarded, completeOnboarding }),
    [hasOnboarded]
  );
};

const SlideIllustration = ({ type }: { type: Slide['illustration'] }) => {
  switch (type) {
    case 'benefits':
      return (
        <svg width="200" height="140" viewBox="0 0 200 140" role="img" aria-hidden="true" focusable="false">
          <rect width="200" height="140" rx="24" fill="#F7FAF2" />
          <rect x="30" y="30" width="140" height="16" rx="8" fill="#338C36" opacity="0.95" />
          <rect x="30" y="56" width="100" height="12" rx="6" fill="#055A1C" opacity="0.4" />
          <rect x="30" y="76" width="120" height="12" rx="6" fill="#E60064" opacity="0.55" />
          <rect x="30" y="96" width="80" height="12" rx="6" fill="#DDDC00" opacity="0.7" />
          <circle cx="60" cy="30" r="16" fill="#FFFFFF" stroke="#E3EAD8" strokeWidth="4" />
          <path d="M53 31l5 5 11-11" stroke="#338C36" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'install':
      return (
        <svg width="200" height="140" viewBox="0 0 200 140" role="img" aria-hidden="true" focusable="false">
          <rect width="200" height="140" rx="24" fill="#FFFFFF" />
          <rect x="50" y="20" width="100" height="100" rx="24" fill="#F4F7EE" stroke="#E3EAD8" strokeWidth="4" />
          <rect x="68" y="36" width="64" height="14" rx="7" fill="#338C36" />
          <rect x="68" y="58" width="50" height="10" rx="5" fill="#055A1C" opacity="0.4" />
          <rect x="68" y="76" width="50" height="10" rx="5" fill="#055A1C" opacity="0.2" />
          <path d="M100 90v32" stroke="#E60064" strokeWidth="6" strokeLinecap="round" />
          <path d="M88 104l12 12 12-12" stroke="#E60064" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'identity':
    default:
      return (
        <svg width="200" height="140" viewBox="0 0 200 140" role="img" aria-hidden="true" focusable="false">
          <rect width="200" height="140" rx="24" fill="#FFFFFF" />
          <rect x="20" y="18" width="90" height="104" rx="18" fill="#F7FAF2" stroke="#E3EAD8" strokeWidth="4" />
          <rect x="36" y="36" width="58" height="16" rx="8" fill="#338C36" />
          <rect x="36" y="60" width="58" height="10" rx="5" fill="#055A1C" opacity="0.4" />
          <circle cx="65" cy="96" r="12" fill="#DDDC00" opacity="0.8" />
          <rect x="120" y="36" width="60" height="16" rx="8" fill="#E60064" opacity="0.7" />
          <rect x="120" y="60" width="60" height="16" rx="8" fill="#055A1C" opacity="0.2" />
          <rect x="120" y="84" width="60" height="16" rx="8" fill="#338C36" opacity="0.5" />
        </svg>
      );
  }
};

const Onboarding = () => {
  const { hasOnboarded, completeOnboarding } = useHasOnboarded();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasOnboarded);
  }, [hasOnboarded]);

  if (!visible) {
    return null;
  }

  const skip = () => {
    completeOnboarding();
    setVisible(false);
  };

  const goNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((slide) => slide + 1);
      return;
    }
    skip();
  };

  const goPrev = () => {
    setCurrentSlide((slide) => Math.max(slide - 1, 0));
  };

  return (
    <section className="welcome-carousel" aria-label="Bienvenida Tarjeta Joven">
      <div className="welcome-carousel__head">
        <span className="welcome-carousel__tag">Bienvenida</span>
        <button type="button" className="welcome-carousel__skip" onClick={skip}>
          Saltar introducción
        </button>
      </div>

      <div className="welcome-carousel__viewport" role="group" aria-live="polite">
        <div className="welcome-carousel__track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide, index) => (
            <article
              key={slide.title}
              className="welcome-carousel__slide"
              aria-hidden={index !== currentSlide}
            >
              <div className="welcome-carousel__media" aria-hidden="true">
                <SlideIllustration type={slide.illustration} />
              </div>
              <div className="welcome-carousel__content">
                <p className="welcome-carousel__step">
                  {String(index + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
                </p>
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
                <ul>
                  {slide.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="welcome-carousel__footer">
        <div className="welcome-carousel__indicators" role="tablist" aria-label="Paso actual">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={`welcome-carousel__indicator${
                index === currentSlide ? ' welcome-carousel__indicator--active' : ''
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ver paso ${index + 1} de ${slides.length}`}
              aria-pressed={index === currentSlide}
            />
          ))}
        </div>
        <div className="welcome-carousel__nav">
          <button type="button" onClick={goPrev} disabled={currentSlide === 0}>
            Anterior
          </button>
          <button type="button" onClick={goNext}>
            {currentSlide === slides.length - 1 ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Onboarding;
