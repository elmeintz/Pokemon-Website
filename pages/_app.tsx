/**
 * Entry point for the Next application. All components that
 * are rendered by Next are rendered through this file, taking
 * place of the <Component> tag in the return statement.
 */

import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
