import { useEffect, useMemo, useState } from 'react';
import './Onboarding.css';

const STORAGE_KEY = 'tj_hasOnboarded';

const steps = [
  {
    title: '¿Qué es Tarjeta Joven?',
    description:
      'Tu identidad digital para acceder a servicios públicos y privados, con seguridad y validación oficial en todo momento.',
    details: [
      'Digital y gratuita, diseñada para jóvenes de 12 a 29 años que residen en el estado de San Luis Potosí.',
      'Funciona como credencial interoperable con la wallet ciudadana.',
    ],
  },
  {
    title: 'Beneficios principales',
    description: 'Suma experiencias, descuentos y oportunidades pensadas para tu proyecto de vida.',
    details: [
      'Promociones exclusivas en comercios aliados y difusion de eventos publicos.',
      'Integración con movilidad, salud y programas sociales.',
    ],
  },
  {
    title: 'Cómo instalar la app',
    description: 'Lleva Tarjeta Joven siempre contigo instalando la PWA en tu dispositivo.',
    details: [
      'Desde el navegador, toca “Agregar a pantalla de inicio”.',
      'Sigue las instrucciones para crear el acceso directo.',
      'Activa las notificaciones para recibir novedades y beneficios.',
    ],
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

const Onboarding = () => {
  const { hasOnboarded, completeOnboarding } = useHasOnboarded();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasOnboarded) {
      setVisible(true);
    }
  }, [hasOnboarded]);

  useEffect(() => {
    if (!visible) {
      document.body.style.removeProperty('overflow');
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }
    completeOnboarding();
    setVisible(false);
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const skip = () => {
    completeOnboarding();
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div>
            <p className="onboarding-step__badge">Paso {currentStep + 1} de {steps.length}</p>
            <h2 id="onboarding-title" className="onboarding-title">
              {step.title}
            </h2>
          </div>
          <button type="button" className="onboarding-close" aria-label="Cerrar" onClick={skip}>
            ✕
          </button>
        </div>
        <div className="onboarding-step">
          <div className="onboarding-step__content">
            <p>{step.description}</p>
            <ul>
              {step.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="onboarding-actions">
          <div className="onboarding-actions__left">
            <button
              type="button"
              onClick={goBack}
              className="onboarding-button onboarding-button--secondary"
              disabled={currentStep === 0}
            >
              Anterior
            </button>
            <button type="button" onClick={skip} className="onboarding-button onboarding-button--secondary">
              Omitir
            </button>
          </div>
          <div className="onboarding-progress" aria-hidden="true">
            {steps.map((_, index) => (
              <span
                key={_.title}
                className={`onboarding-progress__dot ${index === currentStep ? 'onboarding-progress__dot--active' : ''}`}
              />
            ))}
          </div>
          <button type="button" onClick={goNext} className="onboarding-button onboarding-button--primary">
            {currentStep === steps.length - 1 ? 'Comenzar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
