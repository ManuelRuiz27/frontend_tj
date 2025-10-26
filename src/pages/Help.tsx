import { FormEvent, useEffect, useMemo, useState } from 'react';
import { track } from '../lib/analytics';
import './Help.css';

type HelpCategory = 'program' | 'discounts' | 'support';

type FAQ = {
  id: string;
  category: HelpCategory;
  question: string;
  answer: string;
  details?: string[];
  links?: { label: string; url: string }[];
  tags?: string[];
};

const categories: { id: HelpCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'program', label: 'Programa' },
  { id: 'discounts', label: 'Descuentos' },
  { id: 'support', label: 'Soporte técnico' },
];

const faqs: FAQ[] = [
  {
    id: 'eligibility',
    category: 'program',
    question: '¿Quiénes pueden solicitar la Tarjeta Joven?',
    answer:
      'Está dirigida a jóvenes entre 14 y 28 años con documento de identidad colombiano vigente.',
    details: [
      'Puedes solicitarla desde cualquier municipio del país.',
      'Solo necesitas tu documento y un correo electrónico activo.',
    ],
    tags: ['requisitos', 'inscripción', 'documento'],
  },
  {
    id: 'digital-card',
    category: 'program',
    question: '¿La tarjeta es física o digital?',
    answer:
      'La tarjeta nace como una credencial digital para tu celular que puede integrarse con la wallet ciudadana.',
    details: [
      'Puedes mostrarla desde la aplicación incluso sin conexión.',
      'En próximas fases se habilitará la versión física según la demanda.',
    ],
    tags: ['credencial', 'wallet'],
  },
  {
    id: 'updates',
    category: 'program',
    question: '¿Cómo me entero de nuevas convocatorias o beneficios?',
    answer:
      'Activa las notificaciones desde Configuración y revisa la sección de Novedades cada semana.',
    links: [
      {
        label: 'Calendario de oportunidades',
        url: 'https://www.colombiajoven.gov.co/',
      },
    ],
    tags: ['notificaciones', 'convocatorias', 'novedades'],
  },
  {
    id: 'discounts-how',
    category: 'discounts',
    question: '¿Cómo aprovecho un descuento en un comercio aliado?',
    answer:
      'Busca el comercio en el catálogo o en el mapa, revisa las condiciones y presenta tu tarjeta desde el celular al momento de pagar.',
    details: [
      'Algunos descuentos aplican solo ciertos días u horarios.',
      'Otros requieren registro previo en la plataforma del aliado.',
    ],
    tags: ['beneficios', 'catalogo', 'mapa'],
  },
  {
    id: 'new-allies',
    category: 'discounts',
    question: '¿Con qué frecuencia se actualizan los descuentos?',
    answer:
      'Cada mes se suman nuevos aliados y se renuevan convenios existentes.',
    details: [
      'Recibirás una alerta cuando se publiquen beneficios cerca a tu municipio.',
      'Puedes sugerir aliados desde el formulario oficial.',
    ],
    links: [
      {
        label: 'Formulario para sugerir aliados',
        url: 'https://docs.google.com/forms/d/e/1FAIpQLSeAliados/viewform',
      },
    ],
    tags: ['aliados', 'actualización'],
  },
  {
    id: 'redeem-online',
    category: 'discounts',
    question: '¿Puedo redimir beneficios en línea?',
    answer:
      'Sí, algunos comercios ofrecen códigos digitales o enlaces directos. Revisa las instrucciones del beneficio antes de aplicar.',
    tags: ['online', 'códigos', 'redimir'],
  },
  {
    id: 'recover-access',
    category: 'support',
    question: 'Olvidé mi contraseña, ¿qué puedo hacer?',
    answer:
      'En la pantalla de ingreso selecciona “¿Olvidaste tu contraseña?” y recibirás un enlace de recuperación en tu correo.',
    tags: ['contraseña', 'seguridad', 'recuperar'],
  },
  {
    id: 'offline-mode',
    category: 'support',
    question: '¿La aplicación funciona sin conexión?',
    answer:
      'Sí, puedes acceder a tu credencial y al centro de ayuda aunque no tengas datos. El catálogo y mapa requieren conexión para mostrar información actualizada.',
    details: [
      'Cuando vuelvas a conectarte, la información se sincronizará automáticamente.',
    ],
    tags: ['offline', 'conexión'],
  },
  {
    id: 'contact',
    category: 'support',
    question: 'Necesito soporte técnico, ¿con quién hablo?',
    answer:
      'Escríbenos desde la app en Ajustes → Enviar comentario o utiliza la mesa de ayuda oficial.',
    links: [
      {
        label: 'Mesa de ayuda Tarjeta Joven',
        url: 'https://soporte.colombiajoven.gov.co/',
      },
      {
        label: 'Correo de soporte',
        url: 'mailto:soporte@tarjetajoven.gov.co',
      },
    ],
    tags: ['soporte', 'ayuda', 'contacto'],
  },
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | HelpCategory>('all');
  const [lastTrackedQuery, setLastTrackedQuery] = useState('');
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }
    return !navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStatusChange = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const normalizedTerm = useMemo(() => normalizeText(searchTerm.trim()), [searchTerm]);
  const hasActiveFilters = activeCategory !== 'all' || normalizedTerm.length > 0;

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      if (activeCategory !== 'all' && faq.category !== activeCategory) {
        return false;
      }

      if (!normalizedTerm) {
        return true;
      }

      const searchable = [
        faq.question,
        faq.answer,
        ...(faq.details ?? []),
        ...(faq.tags ?? []),
      ]
        .map((value) => normalizeText(value))
        .join(' ');

      return searchable.includes(normalizedTerm);
    });
  }, [activeCategory, normalizedTerm]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setLastTrackedQuery('');
      return;
    }

    if (trimmed === lastTrackedQuery) {
      return;
    }

    track('search', {
      origin: 'help',
      query: trimmed,
      category: activeCategory,
      results: filteredFaqs.length,
    });
    setLastTrackedQuery(trimmed);
  };

  const handleCategoryChange = (category: 'all' | HelpCategory) => {
    if (category === activeCategory) {
      return;
    }
    setActiveCategory(category);
    setLastTrackedQuery('');
    track('filter', {
      origin: 'help',
      category,
    });
  };

  const handleReset = () => {
    if (!hasActiveFilters) {
      return;
    }
    setSearchTerm('');
    setActiveCategory('all');
    setLastTrackedQuery('');
    track('filter', {
      origin: 'help',
      action: 'reset',
    });
  };

  return (
    <main className="help-page" aria-labelledby="help-title">
      <header className="help-page__header">
        <h1 id="help-title">Centro de ayuda</h1>
        <p className="help-page__intro">
          Encuentra respuestas rápidas sobre el programa, los descuentos y el soporte técnico de Tarjeta Joven.
        </p>
      </header>

      {isOffline && (
        <div className="help-page__offline" role="status">
          <span aria-hidden="true">📶</span>
          <p>Sin conexión. Mostrando contenido disponible sin internet.</p>
        </div>
      )}

      <form className="help-page__search" onSubmit={handleSearchSubmit}>
        <label htmlFor="help-search" className="help-page__search-label">
          ¿Qué necesitas saber?
        </label>
        <div className="help-page__search-bar">
          <input
            id="help-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Escribe palabras clave, por ejemplo “registro” o “soporte”"
            aria-describedby="help-search-hint"
          />
          <button type="submit" className="help-page__search-button">
            Buscar
          </button>
          <button
            type="button"
            className="help-page__reset-button"
            onClick={handleReset}
            aria-label="Limpiar búsqueda"
            disabled={!hasActiveFilters}
          >
            Limpiar
          </button>
        </div>
        <p id="help-search-hint" className="help-page__hint">
          El listado se actualiza al escribir; presiona “Buscar” para registrar la consulta en analítica.
        </p>
      </form>

      <div className="help-page__categories" role="group" aria-label="Filtrar preguntas frecuentes">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`help-page__category${activeCategory === category.id ? ' help-page__category--active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
            aria-pressed={activeCategory === category.id}
          >
            {category.label}
          </button>
        ))}
      </div>

      <section className="help-page__results" aria-live="polite" aria-busy={false}>
        {filteredFaqs.length === 0 ? (
          <p className="help-page__empty" role="status">
            No encontramos resultados. Ajusta tu búsqueda o filtra por otra categoría.
          </p>
        ) : (
          <ul className="help-page__list" role="list">
            {filteredFaqs.map((faq) => (
              <li key={faq.id} className="help-page__item">
                <details className="help-page__details">
                  <summary className="help-page__question">{faq.question}</summary>
                  <div className="help-page__answer">
                    <p>{faq.answer}</p>
                    {faq.details && (
                      <ul className="help-page__bullets">
                        {faq.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    )}
                    {faq.links && (
                      <div className="help-page__links">
                        {faq.links.map((link) => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default Help;
