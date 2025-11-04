import { ChangeEvent, useRef, useState } from 'react';
import './Profile.css';

const DEFAULT_PROFILE = {
  name: 'Itzel Martinez',
  age: 22,
  id: 'TJ-894512-2025',
};

const Profile = () => {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHeroImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setHeroImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="profile-page" aria-labelledby="profile-title">
      <header className="profile-page__header">
        <h1 id="profile-title">Tu perfil</h1>
        <p>Visualiza la credencial digital y personaliza la portada de tu Tarjeta Joven.</p>
      </header>

      <section className="profile-card" aria-labelledby="profile-credential-title">
        <div className="profile-card__background" aria-hidden="true" />
        <div className="profile-card__content">
          <div className="profile-card__photo" role="img" aria-label="Fotografía de la persona usuaria" />
          <div className="profile-card__details">
            <h2 id="profile-credential-title">Credencial Tarjeta Joven</h2>
            <dl className="profile-card__list">
              <div className="profile-card__item">
                <dt>Nombre</dt>
                <dd>{DEFAULT_PROFILE.name}</dd>
              </div>
              <div className="profile-card__item">
                <dt>Edad</dt>
                <dd>{DEFAULT_PROFILE.age} anios</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="profile-card__barcode" aria-hidden="true">
          <span className="profile-card__barcode-lines" />
        </div>
        <p className="profile-card__id" aria-label={`Identificador ${DEFAULT_PROFILE.id}`}>
          {DEFAULT_PROFILE.id}
        </p>
      </section>

      <section className="profile-page__hero" aria-labelledby="profile-hero-title">
        <div
          className={`profile-page__hero-image${heroImage ? ' profile-page__hero-image--filled' : ''}`}
          style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
        >
          {!heroImage && (
            <p className="profile-page__hero-placeholder">
              Anade una imagen panoramica para personalizar tu experiencia.
            </p>
          )}
        </div>
        <div className="profile-page__hero-footer">
          <h2 id="profile-hero-title">Portada personalizable</h2>
          <p>Selecciona una imagen desde tu dispositivo y úsala como imagen principal.</p>
          <div className="profile-page__hero-actions">
            <input
              ref={fileInputRef}
              id="hero-image"
              type="file"
              accept="image/*"
              className="profile-page__file-input"
              onChange={handleHeroImageChange}
            />
            <button type="button" className="profile-page__upload-button" onClick={openFilePicker}>
              Elegir imagen
            </button>
            {heroImage && (
              <button
                type="button"
                className="profile-page__upload-button profile-page__upload-button--ghost"
                onClick={() => setHeroImage(null)}
              >
                Quitar imagen
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Profile;
