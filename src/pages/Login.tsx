import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import './Login.css';

const USERNAME_MIN_LENGTH = 3;
const PASSWORD_MIN_LENGTH = 8;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const { login, status: authStatus, errorMessage } = useAuth();
  const navigate = useNavigate();

  const isUsernameValid = useMemo(() => username.trim().length >= USERNAME_MIN_LENGTH, [username]);
  const isPasswordValid = password.length >= PASSWORD_MIN_LENGTH;
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
      setFormError('Ingresa tu usuario tal como fue asignado.');
      return;
    }

    if (!isPasswordValid) {
      setFormError(`Tu contrasena debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }

    try {
      const normalizedUsername = username.trim();
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
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setStatusMessage('');
              }}
              minLength={USERNAME_MIN_LENGTH}
              placeholder="usuario.tj"
              autoComplete="username"
              required
            />
            {!isUsernameValid && username && (
              <p className="login__error">Tu usuario debe tener al menos {USERNAME_MIN_LENGTH} caracteres.</p>
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
              <p className="login__error">Tu contrasena debe tener al menos {PASSWORD_MIN_LENGTH} caracteres.</p>
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
