import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { isSecurePassword, isValidEmail } from '../lib/validators';
import './Login.css';

const PASSWORD_MIN_LENGTH = 8;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const { login, status: authStatus, errorMessage } = useAuth();
  const navigate = useNavigate();

  const isUsernameValid = useMemo(() => isValidEmail(username), [username]);
  const isPasswordValid = useMemo(() => isSecurePassword(password, PASSWORD_MIN_LENGTH), [password]);
  const canSubmit = isUsernameValid && isPasswordValid && authStatus !== 'loading';

  useEffect(() => {
    if (authStatus === 'authenticated') {
      setStatusMessage('Bienvenido. Te estamos redirigiendo a tu tablero.');
      setFormError('');
      navigate('/perfil', { replace: true });
    }
  }, [authStatus, navigate]);

  useEffect(() => {
    if (errorMessage && authStatus !== 'authenticated') {
      setFormError(errorMessage);
    }
  }, [errorMessage, authStatus]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setStatusMessage('');

    if (!isUsernameValid) {
      setFormError('Ingresa un correo electronico valido.');
      return;
    }

    if (!isPasswordValid) {
      setFormError(
        'Tu contrasena debe tener al menos 8 caracteres e incluir mayusculas, minusculas y numeros.',
      );
      return;
    }

    try {
      const normalizedUsername = username.trim().toLowerCase();
      await login({
        username: normalizedUsername,
        password,
      });
      setStatusMessage('Inicio de sesion exitoso. Cargando tu informacion...');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos iniciar sesion. Intenta nuevamente.';
      setFormError(message);
    }
  };

  const handlePhysicalCardClick = () => {
    navigate('/registro/tarjeta-fisica');
  };

  return (
    <main className="login" aria-labelledby="login-title">
      <header className="login__header">
        <div className="login__logo" aria-hidden="true">
          <img src="/icons/logo.svg" alt="Tarjeta Joven" />
        </div>
        <h1 id="login-title" className="visually-hidden">
          Inicia sesion con tu usuario
        </h1>
      </header>

      <section className="login__card" aria-labelledby="login-form">
        <h2 id="login-form">Acceso seguro</h2>
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <div className={`login__field ${username && !isUsernameValid ? 'is-invalid' : ''}`}>
            <label htmlFor="username">Correo electronico</label>
            <input
              id="username"
              type="email"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setStatusMessage('');
              }}
              inputMode="email"
              placeholder="correo@dominio.com"
              autoComplete="username"
              required
            />
            {!isUsernameValid && username && (
              <p className="login__error">Debes capturar un correo electronico valido.</p>
            )}
          </div>

          <div className={`login__field ${password && !isPasswordValid ? 'is-invalid' : ''}`}>
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setStatusMessage('');
              }}
              minLength={PASSWORD_MIN_LENGTH}
              placeholder="Ingresa tu contrasena"
              autoComplete="current-password"
              required
            />
            {!isPasswordValid && password && (
              <p className="login__error">
                Debe tener al menos 8 caracteres e incluir mayusculas, minusculas y numeros.
              </p>
            )}
          </div>

          <button type="submit" className="login__submit" disabled={!canSubmit}>
            {authStatus === 'loading' ? 'Verificando...' : 'Iniciar sesion'}
          </button>
          <button type="button" className="login__secondary" onClick={handlePhysicalCardClick}>
            Ya tengo tarjeta fisica
          </button>
          <p className="login__status" role="status" aria-live="polite">
            {formError || statusMessage}
          </p>
        </form>
      </section>

      <footer className="login__footer">
        <p>Aun no tienes cuenta?</p>
        <Link to="/registro">Registrarme ahora</Link>
      </footer>
    </main>
  );
};

export default Login;
