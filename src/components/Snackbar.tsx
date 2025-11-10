import { useEffect } from 'react';
import './Snackbar.css';

export type SnackbarVariant = 'info' | 'success' | 'error';

export interface SnackbarMessage {
  message: string;
  variant?: SnackbarVariant;
}

interface SnackbarProps extends SnackbarMessage {
  onClose?: () => void;
  autoHideDuration?: number;
}

const Snackbar = ({ message, variant = 'info', onClose, autoHideDuration = 6000 }: SnackbarProps) => {
  useEffect(() => {
    if (!autoHideDuration) {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose?.();
    }, autoHideDuration);

    return () => window.clearTimeout(timer);
  }, [autoHideDuration, onClose, message]);

  return (
    <div className={`snackbar snackbar--${variant}`} role="status" aria-live="polite">
      <span className="snackbar__message">{message}</span>
      {onClose && (
        <button type="button" className="snackbar__close" onClick={onClose} aria-label="Cerrar notificacion">
          &times;
        </button>
      )}
    </div>
  );
};

export default Snackbar;
