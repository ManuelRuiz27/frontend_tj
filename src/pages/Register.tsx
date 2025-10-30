import { FormEvent, useMemo, useState } from 'react';
import InputFile from '../components/InputFile';
import './Register.css';

const CURP_REGEX =
  /^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM]{1}(?:AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]{1}\d{1}$/;
const DATE_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const PASSWORD_MIN_LENGTH = 8;
const fileAccept = '.jpg,.jpeg,.png,.pdf';

type RegisterFormState = {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  curp: string;
  colonia: string;
  password: string;
  aceptaTerminos: boolean;
};

const initialFormState: RegisterFormState = {
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  curp: '',
  colonia: '',
  password: '',
  aceptaTerminos: false,
};

const initialTouched: Record<keyof RegisterFormState, boolean> = {
  nombres: false,
  apellidos: false,
  fechaNacimiento: false,
  curp: false,
  colonia: false,
  password: false,
  aceptaTerminos: false,
};

const Register = () => {
  const [formData, setFormData] = useState<RegisterFormState>(initialFormState);
  const [touched, setTouched] = useState(initialTouched);
  const [files, setFiles] = useState({
    ine: { file: null as File | null, error: '' },
    comprobante: { file: null as File | null, error: '' },
    curpDoc: { file: null as File | null, error: '' },
  });
  const [statusMessage, setStatusMessage] = useState('');

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

  const validateCurp = (value: string) => CURP_REGEX.test(value.toUpperCase());
  const validatePassword = (value: string) => value.trim().length >= PASSWORD_MIN_LENGTH;

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
      colonia: validateText(formData.colonia) ? '' : 'Ingresa la colonia donde resides.',
      password: validatePassword(formData.password)
        ? ''
        : `Tu contrasena debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
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

  const handleFileChange = (key: keyof typeof files, file: File | null) => {
    setStatusMessage('');
    setFiles((prev) => {
      const errorMessage = file ? validateFile(file) : 'Este archivo es obligatorio.';
      return {
        ...prev,
        [key]: { file: errorMessage ? null : file, error: errorMessage },
      };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({
      nombres: true,
      apellidos: true,
      fechaNacimiento: true,
      curp: true,
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

    if (!hasErrors) {
      setStatusMessage('Registro enviado. Te avisaremos por correo cuando sea validado.');
    } else {
      setStatusMessage('Por favor corrige los campos resaltados.');
    }
  };

  return (
    <main className="register" aria-labelledby="register-title">
      <header className="register__header">
        <h1 id="register-title">Registro Tarjeta Joven</h1>
        <p>Completa la informacion. Validaremos tus documentos en un maximo de 48 horas.</p>
      </header>
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
          <div className={`register__field ${touched.colonia && errors.colonia ? 'is-invalid' : ''}`}>
            <label htmlFor="colonia">Colonia</label>
            <input
              id="colonia"
              name="colonia"
              type="text"
              value={formData.colonia}
              onChange={(event) => handleInputChange('colonia', event.target.value)}
              onBlur={() => handleBlur('colonia')}
              required
            />
            {touched.colonia && errors.colonia && <p className="register__error">{errors.colonia}</p>}
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
            label="Identificacion oficial (INE)"
            accept={fileAccept}
            required
            helperText="Formatos aceptados: JPG, PNG o PDF. Maximo 2MB."
            error={files.ine.error}
            onFileSelect={(file) => handleFileChange('ine', file)}
          />
          <InputFile
            label="Comprobante de domicilio"
            accept={fileAccept}
            required
            helperText="Formatos aceptados: JPG, PNG o PDF. Maximo 2MB."
            error={files.comprobante.error}
            onFileSelect={(file) => handleFileChange('comprobante', file)}
          />
          <InputFile
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
          <button type="submit" className="register__submit">
            Enviar registro
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
