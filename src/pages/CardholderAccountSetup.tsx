import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Snackbar, { SnackbarMessage } from '../components/Snackbar';
import { cardholderApi, CardholderLookupResponse } from '../lib/api/cardholders';
import { normalizeCurp } from '../lib/curp';
import { isApiError } from '../lib/apiClient';
import './CardholderAccountSetup.css';

const USERNAME_MIN_LENGTH = 3;
const PASSWORD_MIN_LENGTH = 8;

type LocationState = {
  lookup?: CardholderLookupResponse;
} | null;

const CardholderAccountSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lookup = (location.state as LocationState)?.lookup;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!lookup) {
      navigate('/registro/tarjeta-fisica', { replace: true });
    }
  }, [lookup, navigate]);

  const isUsernameValid = useMemo(() => username.trim().length >= USERNAME_MIN_LENGTH, [username]);
  const isPasswordValid = useMemo(() => password.length >= PASSWORD_MIN_LENGTH, [password]);
  const isConfirmValid = useMemo(() => confirmPassword === password && confirmPassword.length > 0, [confirmPassword, password]);
  const canSubmit = isUsernameValid && isPasswordValid && isConfirmValid && !isSubmitting && !isCompleted;

  if (!lookup) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isUsernameValid || !isPasswordValid || !isConfirmValid) {
      setSnackbar({ message: 'Revisa los datos capturados antes de continuar.', variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    setSnackbar(null);

    try {
      await cardholderApi.createAccount({
        curp: normalizeCurp(lookup.curp),
        username: username.trim(),
        password,
      });
      setIsCompleted(true);
      setSnackbar({
        message: 'Tu cuenta fue creada. Ahora puedes iniciar sesion con tu nuevo usuario.',
        variant: 'success',
      });
    } catch (error) {
      const message =
        isApiError(error) && error.status === 409
          ? 'Esta tarjeta ya cuenta con un usuario asignado. Intenta recuperar tu acceso desde el login.'
          : isApiError(error) && error.message
            ? error.message
            : 'No pudimos crear tu cuenta. Intenta nuevamente.';

      setSnackbar({ message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="cardholder-account" aria-labelledby="cardholder-account-title">
      <section className="cardholder-account__card">
        <p className="cardholder-account__step">Paso 2 de 2</p>
        <h1 id="cardholder-account-title">Crea tu cuenta digital</h1>
        <p className="cardholder-account__description">
          Confirma tus datos y define un usuario y contrasena para acceder a Tarjeta Joven.
        </p>

        <div className="cardholder-account__summary" aria-live="polite">
          <p>
            <strong>Titular:</strong> {lookup.nombres} {lookup.apellidos}
          </p>
          <p>
            <strong>CURP:</strong> {lookup.curp}
          </p>
          {lookup.municipio && (
            <p>
              <strong>Municipio:</strong> {lookup.municipio}
            </p>
          )}
        </div>

        <form className="cardholder-account__form" onSubmit={handleSubmit} noValidate>
          <div className={`cardholder-account__field ${username && !isUsernameValid ? 'is-invalid' : ''}`}>
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength={USERNAME_MIN_LENGTH}
              placeholder="usuario.tj"
              autoComplete="username"
              disabled={isCompleted}
              required
            />
            <p className="cardholder-account__hint">Debe tener al menos {USERNAME_MIN_LENGTH} caracteres.</p>
          </div>

          <div className={`cardholder-account__field ${password && !isPasswordValid ? 'is-invalid' : ''}`}>
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={PASSWORD_MIN_LENGTH}
              placeholder="********"
              autoComplete="new-password"
              disabled={isCompleted}
              required
            />
            <p className="cardholder-account__hint">Minimo {PASSWORD_MIN_LENGTH} caracteres.</p>
          </div>

          <div className={`cardholder-account__field ${confirmPassword && !isConfirmValid ? 'is-invalid' : ''}`}>
            <label htmlFor="confirmPassword">Confirma tu contrasena</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="********"
              autoComplete="new-password"
              disabled={isCompleted}
              required
            />
            <p className="cardholder-account__hint">Debe coincidir con la contrasena anterior.</p>
          </div>

          <button type="submit" className="cardholder-account__submit" disabled={!canSubmit}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="cardholder-account__links">
          <Link to="/registro/tarjeta-fisica">Volver al paso anterior</Link>
          <Link to="/login">Ir al login</Link>
        </div>
      </section>
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          onClose={() => setSnackbar(null)}
        />
      )}
    </main>
  );
};

export default CardholderAccountSetup;
