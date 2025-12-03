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
  { id: 'all', label: 'Todo' },
  { id: 'program', label: 'Programa' },
  { id: 'discounts', label: 'Descuentos' },
  { id: 'support', label: 'Soporte t�cnico' },
];

const faqs: FAQ[] = [
  {
    id: 'eligibility',
    category: 'program',
    question: '�Qui�n puede solicitar la Tarjeta Joven?',
    answer: 'J�venes de 12 a 29 a�os con identificaci�n vigente y un correo activo.',
    details: [
      'Puedes registrarte en l�nea o acudir a un m�dulo del INPOJUVE.',
      'Solo necesitas tu CURP, identificaci�n y comprobante de domicilio.',
    ],
    tags: ['requisitos', 'registro'],
  },
  {
    id: 'digital-card',
    category: 'program',
    question: '�La tarjeta es digital o f�sica?',
    answer: 'Nace digital y puedes vincularla con tu tarjeta f�sica si ya la tienes.',
    details: ['Funciona incluso sin datos. Solo abre la app y muestra tu credencial.'],
    tags: ['credencial', 'digital'],
  },
  {
    id: 'updates',
    category: 'program',
    question: '�C�mo me entero de nuevas convocatorias?',
    answer: 'Activa las notificaciones y revisa la secci�n Novedades una vez por semana.',
    links: [
      {
        label: 'Calendario de oportunidades',
        url: 'https://whatsapp.com/channel/0029VbB6m3M42DcWMy5Wwh2S',
      },
    ],
    tags: ['notificaciones', 'convocatorias'],
  },
  {
    id: 'discounts-how',
    category: 'discounts',
    question: '�C�mo uso un descuento en un aliado?',
    answer:
      'Busca el comercio en el cat�logo o mapa, revisa las condiciones y muestra tu tarjeta desde el celular al pagar.',
    details: ['Algunos aliados solo aplican el beneficio en d�as u horarios espec�ficos.'],
    tags: ['beneficios', 'mapa'],
  },
  {
    id: 'new-allies',
    category: 'discounts',
    question: '�Cada cu�ndo hay nuevos descuentos?',
    answer: 'Cada mes se suman alianzas y renovamos convenios.',
    details: [
      'Te avisaremos cuando haya beneficios cerca de ti.',
      'Puedes sugerir aliados con este formulario.',
    ],
    links: [
      {
        label: 'Sugerir un nuevo aliado',
        url: 'https://forms.cloud.microsoft/r/bXgU9VqpkN',
      },
    ],
    tags: ['aliados', 'actualizaciones'],
  },
  {
    id: 'redeem-online',
    category: 'discounts',
    question: '�Puedo redimir beneficios en l�nea?',
    answer:
      'S�. Algunos aliados entregan c�digos o enlaces directos. Sigue las instrucciones del beneficio antes de aplicarlo.',
    tags: ['online', 'c�digos'],
  },
  {
    id: 'recover-access',
    category: 'support',
    question: 'Olvid� mi contrase�a, �qu� hago?',
    answer:
      'En la pantalla de ingreso selecciona ��Olvidaste tu contrase�a?� y te enviaremos un enlace de recuperaci�n.',
    tags: ['contrase�a', 'seguridad'],
  },
  {
    id: 'offline-mode',
    category: 'support',
    question: '�La app funciona sin conexi�n?',
    answer:
      'S�. Tu credencial y este centro de ayuda est�n disponibles sin datos. El cat�logo y el mapa necesitan conexi�n para mostrar informaci�n actualizada.',
    details: ['Cuando vuelvas a conectarte sincronizaremos todo autom�ticamente.'],
    tags: ['offline', 'conexi�n'],
  },
  {
    id: 'contact',
    category: 'support',
    question: 'Necesito ayuda, �con qui�n hablo?',
    answer: 'Escr�benos desde Ajustes ? Enviar comentario o usa la mesa de ayuda oficial.',
    links: [
      {
        label: 'Mesa de ayuda Tarjeta Joven',
        url: 'https://www.instagram.com/inpojuve?igsh=MW9uc3E2eTkxcWU1bg==',
      },
    ],
    tags: ['soporte', 'contacto'],
  },
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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
          Resuelve tus dudas del programa, los descuentos y el soporte técnico en minutos.
        </p>
      </header>

      {isOffline && (
        <div className="help-page__offline" role="status">
          <span aria-hidden="true" role="img">
            ⚠️
          </span>
          <p>Sin conexión. Mostramos la información guardada.</p>
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
            placeholder="Escribe palabras clave como 'registro' o 'soporte'."
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
          La lista se actualiza al escribir. Presiona “Buscar” para guardar la consulta.
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
            No encontramos coincidencias. Cambia las palabras o prueba otra categoría.
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
