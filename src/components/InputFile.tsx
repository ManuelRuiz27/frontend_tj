import { ChangeEvent, useId, useState } from 'react';
import './InputFile.css';

type InputFileProps = {
  label: string;
  accept: string;
  onFileSelect: (file: File | null) => void;
  required?: boolean;
  error?: string;
  helperText?: string;
};

const InputFile = ({ label, accept, onFileSelect, required, error, helperText }: InputFileProps) => {
  const inputId = useId();
  const [fileName, setFileName] = useState<string>('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setFileName(file ? file.name : '');
    onFileSelect(file);
  };

  return (
    <div className={`input-file ${error ? 'input-file--error' : ''}`}>
      <label className="input-file__label" htmlFor={inputId}>
        {label}
        {required && <span aria-hidden> *</span>}
      </label>
      <label className="input-file__button" htmlFor={inputId}>
        <span>Adjuntar archivo</span>
        {fileName && <span className="input-file__filename">{fileName}</span>}
      </label>
      <input
        id={inputId}
        type="file"
        className="input-file__input"
        accept={accept}
        required={required}
        onChange={handleChange}
      />
      <div className="input-file__hint" role="status" aria-live="polite">
        {error ? <span className="input-file__error">{error}</span> : helperText}
      </div>
    </div>
  );
};

export default InputFile;
