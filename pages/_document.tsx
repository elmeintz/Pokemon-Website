/**
 * This file is used to override the default Next.js document,
 * which is used to modify the initial HTML and body tags that
 * are rendered by the application.
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
