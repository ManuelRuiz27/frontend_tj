import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <p className="hero__eyebrow">Tarjeta Joven CDMX</p>
        <h1 id="hero-title" className="hero__title">
          Beneficios y oportunidades para jóvenes que transforman su ciudad
        </h1>
        <p className="hero__subtitle">
          Accede a descuentos, actividades culturales y programas pensados para ti.
          Regístrate en minutos y comienza a disfrutar de tu credencial digital.
        </p>
        <div className="hero__actions" role="group" aria-label="Acciones principales">
          <Link className="hero__cta hero__cta--primary" to="/registro">
            Registrarme
          </Link>
          <Link className="hero__cta hero__cta--outline" to="/login">
            Iniciar sesión
          </Link>
        </div>
      </div>
      <figure className="hero__figure">
        <img
          src="/icons/logo.svg"
          alt="Gobierno de la Ciudad de México"
          className="hero__image"
        />
        <figcaption className="hero__tagline">Construimos futuro contigo</figcaption>
      </figure>
    </section>
  );
};

export default Hero;
