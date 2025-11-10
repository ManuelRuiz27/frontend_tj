import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InputFile from '../components/InputFile';
import Snackbar, { SnackbarMessage } from '../components/Snackbar';
import { cardholderApi } from '../lib/api/cardholders';
import { isApiError } from '../lib/apiClient';
import { isValidCurp, normalizeCurp } from '../lib/curp';
import { isSecurePassword, isValidEmail } from '../lib/validators';
import './Register.css';

const DATE_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const PASSWORD_MIN_LENGTH = 8;
const POSTAL_CODE_REGEX = /^\d{5}$/;
const HOUSE_NUMBER_REGEX = /^[0-9]{1,5}[A-Z0-9\-]{0,4}$/;
const fileAccept = '.jpg,.jpeg,.png,.pdf';

type RegisterFormState = {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  curp: string;
  username: string;
  calle: string;
  numero: string;
  cp: string;
  colonia: string;
  password: string;
  aceptaTerminos: boolean;
};

type FileFieldState = {
  file: File | null;
  error: string;
};

type RegisterFilesState = {
  ine: FileFieldState;
  comprobante: FileFieldState;
  curpDoc: FileFieldState;
};

const createInitialFilesState = (): RegisterFilesState => ({
  ine: { file: null, error: '' },
  comprobante: { file: null, error: '' },
  curpDoc: { file: null, error: '' },
});

const initialFormState: RegisterFormState = {
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  curp: '',
  username: '',
  calle: '',
  numero: '',
  cp: '',
  colonia: '',
  password: '',
  aceptaTerminos: false,
};

const initialTouched: Record<keyof RegisterFormState, boolean> = {
  nombres: false,
  apellidos: false,
  fechaNacimiento: false,
  curp: false,
  username: false,
  calle: false,
  numero: false,
  cp: false,
  colonia: false,
  password: false,
  aceptaTerminos: false,
};

const Register = () => {
  const [formData, setFormData] = useState<RegisterFormState>(initialFormState);
  const [touched, setTouched] = useState(initialTouched);
  const [files, setFiles] = useState<RegisterFilesState>(() => createInitialFilesState());
  const [statusMessage, setStatusMessage] = useState('');
  const [snackbar, setSnackbar] = useState<SnackbarMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileResetKey, setFileResetKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const locationSnackbar = (location.state as { snackbar?: SnackbarMessage } | null)?.snackbar;

  useEffect(() => {
    if (locationSnackbar) {
      setSnackbar(locationSnackbar);
      navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [locationSnackbar, location.pathname, navigate]);

  const validateText = (value: string) => value.trim().length >= 2;

  const validateDate = (value: string) => {
    if (!DATE_REGEX.test(value)) {
      return false;
    }

    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      year <= new Date().getFullYear() - 15
    );
  };

  const validateCurp = (value: string) => isValidCurp(value);
  const validateUsername = (value: string) => isValidEmail(value);
  const validatePassword = (value: string) => isSecurePassword(value, PASSWORD_MIN_LENGTH);
  const validateStreetNumber = (value: string) => {
    const normalized = value.trim();
    if (!normalized) {
      return false;
    }
    if (normalized.toUpperCase() === 'S/N') {
      return true;
    }
    const compact = normalized.replace(/\s+/g, '').toUpperCase();
    return HOUSE_NUMBER_REGEX.test(compact);
  };
  const validatePostalCode = (value: string) => POSTAL_CODE_REGEX.test(value.trim());

  const validateFile = (file: File | null) => {
    if (!file) {
      return 'Este archivo es obligatorio.';
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return 'Formato no valido. Usa JPG, PNG o PDF.';
    }

    if (file.size > 2 * 1024 * 1024) {
      return 'El archivo debe pesar maximo 2MB.';
    }

    return '';
  };

  const errors = useMemo(
    () => ({
      nombres: validateText(formData.nombres) ? '' : 'Ingresa tu nombre completo.',
      apellidos: validateText(formData.apellidos) ? '' : 'Ingresa tus apellidos.',
      fechaNacimiento: validateDate(formData.fechaNacimiento)
        ? ''
        : 'Usa el formato DD/MM/AAAA y verifica que seas mayor de 15 anos.',
      curp: validateCurp(formData.curp) ? '' : 'Revisa tu CURP. Debe coincidir con el formato oficial.',
      username: validateUsername(formData.username)
        ? ''
        : 'Ingresa un correo electronico valido.',
      calle: validateText(formData.calle) ? '' : 'Ingresa la calle donde resides.',
      numero: validateStreetNumber(formData.numero)
        ? ''
        : 'Ingresa un numero exterior valido (usa S/N si aplica).',
      cp: validatePostalCode(formData.cp) ? '' : 'El codigo postal debe tener 5 digitos.',
      colonia: validateText(formData.colonia) ? '' : 'Ingresa la colonia donde resides.',
      password: validatePassword(formData.password)
        ? ''
        : 'Tu contrasena debe tener al menos 8 caracteres e incluir mayusculas, minusculas y numeros.',
      aceptaTerminos: formData.aceptaTerminos ? '' : 'Debes aceptar los terminos y politicas.',
    }),
    [formData],
  );

  const handleInputChange = (field: keyof RegisterFormState, value: string | boolean) => {
    setStatusMessage('');
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field: keyof RegisterFormState) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleFileChange = (key: keyof RegisterFilesState, file: File | null) => {
    setStatusMessage('');
    setFiles((prev) => {
      const errorMessage = file ? validateFile(file) : 'Este archivo es obligatorio.';
      return {
        ...prev,
        [key]: { file: errorMessage ? null : file, error: errorMessage },
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({
      nombres: true,
      apellidos: true,
      fechaNacimiento: true,
      curp: true,
      username: true,
      calle: true,
      numero: true,
      cp: true,
      colonia: true,
      password: true,
      aceptaTerminos: true,
    });

    const fileErrors = {
      ine: validateFile(files.ine.file),
      comprobante: validateFile(files.comprobante.file),
      curpDoc: validateFile(files.curpDoc.file),
    };

    const hasErrors =
      Object.values(errors).some(Boolean) || Object.values(fileErrors).some((message) => message !== '');

    setFiles((prev) => ({
      ine: { file: fileErrors.ine ? null : prev.ine.file, error: fileErrors.ine },
      comprobante: { file: fileErrors.comprobante ? null : prev.comprobante.file, error: fileErrors.comprobante },
      curpDoc: { file: fileErrors.curpDoc ? null : prev.curpDoc.file, error: fileErrors.curpDoc },
    }));

    if (hasErrors) {
      setStatusMessage('Por favor corrige los campos resaltados.');
      return;
    }

    const ineFile = files.ine.file;
    const comprobanteFile = files.comprobante.file;
    const curpDocFile = files.curpDoc.file;

    if (!ineFile || !comprobanteFile || !curpDocFile) {
      setStatusMessage('Por favor adjunta los documentos requeridos.');
      return;
    }

    setIsSubmitting(true);
    setSnackbar(null);
    setStatusMessage('Enviando registro...');

    try {
      await cardholderApi.submitRegistration({
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        fechaNacimiento: formData.fechaNacimiento.trim(),
        curp: normalizeCurp(formData.curp),
        username: formData.username.trim().toLowerCase(),
        calle: formData.calle.trim(),
        numero: formData.numero.trim(),
        cp: formData.cp.trim(),
        colonia: formData.colonia.trim(),
        password: formData.password,
        aceptaTerminos: formData.aceptaTerminos,
        ine: ineFile,
        comprobante: comprobanteFile,
        curpDoc: curpDocFile,
      });

      setStatusMessage('Registro enviado. Te avisaremos por correo cuando sea validado.');
      setSnackbar({
        message: 'Recibimos tu solicitud. Te contactaremos al validar tu documentacion.',
        variant: 'success',
      });
      setFormData(initialFormState);
      setTouched(initialTouched);
      setFiles(createInitialFilesState());
      setFileResetKey((value) => value + 1);
    } catch (error) {
      const message =
        isApiError(error) && error.message
          ? error.message
          : 'No pudimos enviar tu registro. Intenta nuevamente.';
      setStatusMessage(message);
      setSnackbar({ message, variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="register" aria-labelledby="register-title">
      <header className="register__header">
        <h1 id="register-title">Registro Tarjeta Joven</h1>
        <p>Completa la informacion. Validaremos tus documentos en un maximo de 48 horas.</p>
      </header>
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          onClose={() => setSnackbar(null)}
        />
      )}
      <form className="register__form" onSubmit={handleSubmit} noValidate>
        <fieldset className="register__fieldset">
          <legend>Datos personales</legend>
          <div className="register__grid">
            <div className={`register__field ${touched.nombres && errors.nombres ? 'is-invalid' : ''}`}>
              <label htmlFor="nombres">Nombre(s)</label>
              <input
                id="nombres"
                name="nombres"
                type="text"
                value={formData.nombres}
                onChange={(event) => handleInputChange('nombres', event.target.value)}
                onBlur={() => handleBlur('nombres')}
                required
              />
              {touched.nombres && errors.nombres && <p className="register__error">{errors.nombres}</p>}
            </div>
            <div className={`register__field ${touched.apellidos && errors.apellidos ? 'is-invalid' : ''}`}>
              <label htmlFor="apellidos">Apellidos</label>
              <input
                id="apellidos"
                name="apellidos"
                type="text"
                value={formData.apellidos}
                onChange={(event) => handleInputChange('apellidos', event.target.value)}
                onBlur={() => handleBlur('apellidos')}
                required
              />
              {touched.apellidos && errors.apellidos && <p className="register__error">{errors.apellidos}</p>}
            </div>
          </div>
          <div className="register__grid">
            <div className={`register__field ${touched.fechaNacimiento && errors.fechaNacimiento ? 'is-invalid' : ''}`}>
              <label htmlFor="fechaNacimiento">Fecha de nacimiento (DD/MM/AAAA)</label>
              <input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                value={formData.fechaNacimiento}
                onChange={(event) => handleInputChange('fechaNacimiento', event.target.value)}
                onBlur={() => handleBlur('fechaNacimiento')}
                required
              />
              {touched.fechaNacimiento && errors.fechaNacimiento && (
                <p className="register__error">{errors.fechaNacimiento}</p>
              )}
            </div>
            <div className={`register__field ${touched.curp && errors.curp ? 'is-invalid' : ''}`}>
              <label htmlFor="curp">CURP</label>
              <input
                id="curp"
                name="curp"
                type="text"
                value={formData.curp}
                onChange={(event) => handleInputChange('curp', event.target.value.toUpperCase())}
                onBlur={() => handleBlur('curp')}
                maxLength={18}
                required
              />
              {touched.curp && errors.curp && <p className="register__error">{errors.curp}</p>}
            </div>
          </div>
          <div className="register__grid">
            <div className={`register__field ${touched.calle && errors.calle ? 'is-invalid' : ''}`}>
              <label htmlFor="calle">Calle</label>
              <input
                id="calle"
                name="calle"
                type="text"
                value={formData.calle}
                onChange={(event) => handleInputChange('calle', event.target.value)}
                onBlur={() => handleBlur('calle')}
                autoComplete="address-line1"
                required
              />
              {touched.calle && errors.calle && <p className="register__error">{errors.calle}</p>}
            </div>
            <div className={`register__field ${touched.numero && errors.numero ? 'is-invalid' : ''}`}>
              <label htmlFor="numero">Numero exterior</label>
              <input
                id="numero"
                name="numero"
                type="text"
                value={formData.numero}
                onChange={(event) => handleInputChange('numero', event.target.value)}
                onBlur={() => handleBlur('numero')}
                placeholder="123 o S/N"
                autoComplete="address-line2"
                required
              />
              {touched.numero && errors.numero && <p className="register__error">{errors.numero}</p>}
            </div>
            <div className={`register__field ${touched.cp && errors.cp ? 'is-invalid' : ''}`}>
              <label htmlFor="cp">Codigo postal (CP)</label>
              <input
                id="cp"
                name="cp"
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={formData.cp}
                onChange={(event) => handleInputChange('cp', event.target.value)}
                onBlur={() => handleBlur('cp')}
                autoComplete="postal-code"
                required
              />
              {touched.cp && errors.cp && <p className="register__error">{errors.cp}</p>}
            </div>
          </div>
          <div className={`register__field ${touched.colonia && errors.colonia ? 'is-invalid' : ''}`}>
            <label htmlFor="colonia">Colonia</label>
            <input
              id="colonia"
              name="colonia"
              type="text"
              value={formData.colonia}
              onChange={(event) => handleInputChange('colonia', event.target.value)}
              onBlur={() => handleBlur('colonia')}
              autoComplete="address-level3"
              required
            />
            {touched.colonia && errors.colonia && <p className="register__error">{errors.colonia}</p>}
          </div>
          <div className={`register__field ${touched.username && errors.username ? 'is-invalid' : ''}`}>
            <label htmlFor="username">Correo electronico</label>
            <input
              id="username"
              name="username"
              type="email"
              value={formData.username}
              onChange={(event) => handleInputChange('username', event.target.value)}
              onBlur={() => handleBlur('username')}
              placeholder="correo@dominio.com"
              inputMode="email"
              autoComplete="username"
              required
            />
            {touched.username && errors.username && (
              <p className="register__error">{errors.username}</p>
            )}
          </div>
          <div className={`register__field ${touched.password && errors.password ? 'is-invalid' : ''}`}>
            <label htmlFor="password">Contrasena de acceso</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(event) => handleInputChange('password', event.target.value)}
              onBlur={() => handleBlur('password')}
              minLength={PASSWORD_MIN_LENGTH}
              placeholder="Define una contrasena segura"
              autoComplete="new-password"
              required
            />
            {touched.password && errors.password && <p className="register__error">{errors.password}</p>}
          </div>
        </fieldset>

        <fieldset className="register__fieldset">
          <legend>Documentos</legend>
          <InputFile
            key={`ine-${fileResetKey}`}
            label="Identificacion oficial (INE)"
            accept={fileAccept}
            required
            helperText="Formatos aceptados: JPG, PNG o PDF. Maximo 2MB."
            error={files.ine.error}
            onFileSelect={(file) => handleFileChange('ine', file)}
          />
          <InputFile
            key={`comprobante-${fileResetKey}`}
            label="Comprobante de domicilio"
            accept={fileAccept}
            required
            helperText="Formatos aceptados: JPG, PNG o PDF. Maximo 2MB."
            error={files.comprobante.error}
            onFileSelect={(file) => handleFileChange('comprobante', file)}
          />
          <InputFile
            key={`curpDoc-${fileResetKey}`}
            label="CURP digital"
            accept={fileAccept}
            required
            helperText="Formatos aceptados: JPG, PNG o PDF. Maximo 2MB."
            error={files.curpDoc.error}
            onFileSelect={(file) => handleFileChange('curpDoc', file)}
          />
        </fieldset>

        <div className={`register__checkbox ${touched.aceptaTerminos && errors.aceptaTerminos ? 'is-invalid' : ''}`}>
          <input
            id="aceptaTerminos"
            name="aceptaTerminos"
            type="checkbox"
            checked={formData.aceptaTerminos}
            onChange={(event) => handleInputChange('aceptaTerminos', event.target.checked)}
            onBlur={() => handleBlur('aceptaTerminos')}
            required
          />
          <label htmlFor="aceptaTerminos">
            He leido y acepto los <a href="#terminos">Terminos de uso</a> y la{' '}
            <a href="#privacidad">Politica de privacidad</a>.
          </label>
        </div>
        {touched.aceptaTerminos && errors.aceptaTerminos && (
          <p className="register__error">{errors.aceptaTerminos}</p>
        )}

        <div className="register__actions">
          <button type="submit" className="register__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando registro...' : 'Enviar registro'}
          </button>
          <p className="register__status" role="status" aria-live="polite">
            {statusMessage}
          </p>
        </div>
      </form>
    </main>
  );
};

export default Register;
