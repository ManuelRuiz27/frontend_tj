import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOTP } from '../lib/useOTP';
import { useAuth } from '../lib/useAuth';
import './Login.css';

const CURP_REGEX =
  /^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM]{1}(?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]{1}\d{1}$/;

const Login = () => {
  const [curp, setCurp] = useState('');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const { status, attempts, requestOTP, validateOTP } = useOTP();
  const { login } = useAuth();

  const isCurpValid = useMemo(() => CURP_REGEX.test(curp), [curp]);
  const otpDisabled = status !== 'sent' || attempts >= 3;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (attempts >= 3) {
      setStatusMessage('Has alcanzado el número máximo de intentos. Vuelve a solicitar un nuevo código.');
    }
  }, [attempts]);

  const handleSendCode = async () => {
    try {
      await requestOTP(curp);
      setCooldown(60);
      setStatusMessage('Código enviado. Revisa tu bandeja de SMS o correo.');
      setOtpError('');
    } catch (error) {
      setStatusMessage('No pudimos enviar el código. Verifica tu CURP.');
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otpDisabled) return;
    if (otp.length !== 6) {
      setOtpError('Ingresa el código de 6 dígitos.');
      return;
    }

    try {
      await validateOTP(otp);
      await login();
      setOtp('');
      setOtpError('');
      setStatusMessage('¡Bienvenido! Estamos redirigiéndote a tu tablero.');
    } catch (error) {
      setOtpError('El código no es válido. Intenta nuevamente.');
    }
  };

  return (
    <main className="login" aria-labelledby="login-title">
      <header className="login__header">
        <h1 id="login-title">Inicia sesión con tu CURP</h1>
        <p>
          Enviaremos un código de verificación a tus medios registrados. Mantén a la mano tu CURP y tu
          dispositivo móvil.
        </p>
      </header>

      <section className="login__card" aria-labelledby="login-form">
        <h2 id="login-form">Verificación segura</h2>
        <form className="login__form" onSubmit={handleVerify} noValidate>
          <div className={`login__field ${curp && !isCurpValid ? 'is-invalid' : ''}`}>
            <label htmlFor="curp">CURP</label>
            <input
              id="curp"
              type="text"
              value={curp.toUpperCase()}
              onChange={(event) => {
                setCurp(event.target.value.toUpperCase());
                setStatusMessage('');
              }}
              maxLength={18}
              required
            />
            {!isCurpValid && curp && <p className="login__error">Verifica que tu CURP tenga 18 caracteres.</p>}
          </div>

          <button
            type="button"
            className="login__send"
            onClick={handleSendCode}
            disabled={!isCurpValid || cooldown > 0 || status === 'pending'}
          >
            {cooldown > 0 ? `Reenviar código en ${cooldown}s` : 'Enviar código'}
          </button>

          <div className="login__field">
            <label htmlFor="otp">Código de verificación</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              maxLength={6}
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/[^0-9]/g, ''));
                setOtpError('');
              }}
              placeholder="Ingresa los 6 dígitos"
              disabled={otpDisabled}
              required
            />
            {otpError && <p className="login__error">{otpError}</p>}
            {attempts > 0 && (
              <p className="login__hint">Intentos restantes: {Math.max(0, 3 - attempts)}</p>
            )}
          </div>

          <button type="submit" className="login__submit" disabled={otpDisabled}>
            Verificar código
          </button>
          <p className="login__status" role="status" aria-live="polite">
            {statusMessage}
          </p>
        </form>
      </section>

      <footer className="login__footer">
        <p>¿Aún no tienes cuenta?</p>
        <Link to="/registro">Registrarme ahora</Link>
      </footer>
    </main>
  );
};

export default Login;
