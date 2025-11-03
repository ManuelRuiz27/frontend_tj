import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import './Login.css';

const CURP_REGEX =
  /^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM]{1}(?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]{1}\d{1}$/;
const PASSWORD_MIN_LENGTH = 8;

const Login = () => {
  const [curp, setCurp] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const { login, loginAsGuest, status: authStatus, errorMessage } = useAuth();
  const navigate = useNavigate();

  const isCurpValid = useMemo(() => CURP_REGEX.test(curp.trim()), [curp]);
  const isPasswordValid = password.length >= PASSWORD_MIN_LENGTH;
  const canSubmit = isCurpValid && isPasswordValid && authStatus !== 'loading';

  useEffect(() => {
    if (authStatus === 'authenticated') {
      setStatusMessage('Bienvenido. Te estamos redirigiendo a tu tablero.');
      setFormError('');
      navigate('/catalog', { replace: true });
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

    if (!isCurpValid) {
      setFormError('Verifica que tu CURP tenga 18 caracteres y sea valida.');
      return;
    }

    if (!isPasswordValid) {
      setFormError(`Tu contrasena debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }

    try {
      const normalizedCurp = curp.trim().toUpperCase();
      await login({
        curp: normalizedCurp,
        password,
      });
      setStatusMessage('Inicio de sesion exitoso. Cargando tu informacion...');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos iniciar sesion. Intenta nuevamente.';
      setFormError(message);
    }
  };

  const handleGuestAccess = () => {
    setFormError('');
    setStatusMessage('Ingresaste en modo de pruebas.');
    loginAsGuest();
  };

  return (
    <main className="login" aria-labelledby="login-title">
      <header className="login__header">
        <h1 id="login-title">Inicia sesion con tu CURP</h1>
        <p>Ingresa tu CURP y contrasena para acceder a tu cuenta.</p>
      </header>

      <section className="login__card" aria-labelledby="login-form">
        <h2 id="login-form">Acceso seguro</h2>
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <div className={`login__field ${curp && !isCurpValid ? 'is-invalid' : ''}`}>
            <label htmlFor="curp">CURP</label>
            <input
              id="curp"
              type="text"
              value={curp}
              onChange={(event) => {
                const normalized = event.target.value.replace(/\s+/g, '').toUpperCase();
                setCurp(normalized);
                setStatusMessage('');
              }}
              maxLength={18}
              placeholder="PEPJ800101HDFLLL01"
              autoComplete="username"
              required
            />
            {!isCurpValid && curp && <p className="login__error">Revisa tu CURP. Debe coincidir con el formato oficial.</p>}
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
          <button
            type="button"
            className="login__send"
            onClick={handleGuestAccess}
            disabled={authStatus === 'loading'}
          >
            Acceder sin credenciales
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
