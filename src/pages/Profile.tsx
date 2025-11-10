import { useMemo } from 'react';
import { useAuth } from '../lib/useAuth';
import './Profile.css';

const DEFAULT_PROFILE = {
  name: 'Itzel Martinez',
  age: 22,
  barcode: 'TJ-894512-2025',
};

const getBirthDateFromCurp = (curp: string): Date | null => {
  const match = curp?.toUpperCase().match(/^[A-Z]{4}(\d{2})(\d{2})(\d{2})/);
  if (!match) {
    return null;
  }

  const [, yy, mm, dd] = match;
  const year = Number(yy);
  const month = Number(mm);
  const day = Number(dd);
  if (!year && !month && !day) {
    return null;
  }

  const currentYearShort = new Date().getFullYear() % 100;
  const century = year <= currentYearShort ? 2000 : 1900;
  const fullYear = century + year;
  const birthDate = new Date(fullYear, month - 1, day);

  return Number.isNaN(birthDate.getTime()) ? null : birthDate;
};

const getAgeFromCurp = (curp: string): number | null => {
  const birthDate = getBirthDateFromCurp(curp);
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

const Profile = () => {
  const { user } = useAuth();

  const displayName = useMemo(() => {
    const parts = [user?.nombre, user?.apellidos].filter(Boolean);
    return parts.length ? parts.join(' ') : DEFAULT_PROFILE.name;
  }, [user?.nombre, user?.apellidos]);

  const displayAge = useMemo(() => {
    if (typeof user?.edad === 'number' && !Number.isNaN(user.edad)) {
      return user.edad;
    }
    return user?.curp ? getAgeFromCurp(user.curp) ?? DEFAULT_PROFILE.age : DEFAULT_PROFILE.age;
  }, [user?.edad, user?.curp]);

  const barcodeValue = useMemo(
    () => user?.barcodeValue ?? user?.curp ?? DEFAULT_PROFILE.barcode,
    [user?.barcodeValue, user?.curp],
  );

  return (
    <main className="profile-page" aria-labelledby="profile-title">
      <h1 id="profile-title" className="profile-page__sr-only">
        Perfil de tu Tarjeta Joven
      </h1>

      <section className="profile-card" aria-labelledby="profile-credential-title">
        <div className="profile-card__background" aria-hidden="true" />
        <div className="profile-card__content">
          <div className="profile-card__details">
            <h2 id="profile-credential-title">Tarjeta Joven</h2>
            <dl className="profile-card__list">
              <div className="profile-card__item">
                <dt>Nombre</dt>
                <dd>{displayName}</dd>
              </div>
              <div className="profile-card__item">
                <dt>Edad</dt>
                <dd>{displayAge} anios</dd>
              </div>
            </dl>
          </div>
        </div>
        <div
          className="profile-card__barcode"
          role="img"
          aria-label={`Codigo de barras asignado ${barcodeValue}`}
          data-barcode={barcodeValue}
          title={barcodeValue}
        >
          <span className="profile-card__barcode-lines" />
        </div>
      </section>

      <div
        className="profile-banner"
        role="img"
        aria-label="Imagen representativa de Tarjeta Joven"
      />
    </main>
  );
};

export default Profile;
