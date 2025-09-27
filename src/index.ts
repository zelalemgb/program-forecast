// Main application exports
export * from './components';
export * from './pages';
export * from './hooks';
export * from './utils';
export * from './types';
export * from './context';
export * from './config';

// Direct re-exports for convenience
export { default as App } from './App';
export { supabase } from './integrations/supabase/client';