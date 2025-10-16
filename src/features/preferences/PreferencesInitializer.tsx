import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.style.colorScheme = 'light';
  }
};

const applyLanguage = (language: 'es' | 'en') => {
  document.documentElement.setAttribute('lang', language);
};

const PreferencesInitializer = () => {
  const { theme, language } = useSelector((state: RootState) => state.preferences);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  return null;
};

export default PreferencesInitializer;
