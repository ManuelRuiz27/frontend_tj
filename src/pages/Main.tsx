import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import './Main.css';

const highlights = [
  {
    title: 'Descuentos exclusivos',
    description: 'Aprovecha promociones en comercios aliados, eventos culturales y transporte.'
  },
  {
    title: 'Programas sociales',
    description: 'Accede a convocatorias para becas, emprendimiento y formación continua.'
  },
  {
    title: 'Experiencias únicas',
    description: 'Participa en actividades deportivas, artísticas y de voluntariado con otros jóvenes.'
  }
];

const Main = () => {
  return (
    <main className="main" aria-labelledby="main-title">
      <Hero />
      <section className="main__section" aria-labelledby="main-title">
        <div className="main__header">
          <h2 id="main-title">¿Por qué solicitar tu Tarjeta Joven?</h2>
          <p>
            Diseñamos un ecosistema digital con identidad verificable, seguro y listo para integrarse con la
            wallet ciudadana en próximas fases.
          </p>
        </div>
        <div className="main__grid">
          {highlights.map((item) => (
            <article key={item.title} className="main__card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="main__cta" aria-labelledby="cta-title">
        <div>
          <h2 id="cta-title">Comienza hoy mismo</h2>
          <p>Regístrate en línea y recibe tu credencial digital al instante.</p>
        </div>
        <Link to="/registro" className="main__cta-button">
          Quiero registrarme
        </Link>
      </section>
    </main>
  );
};

export default Main;
