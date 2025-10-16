/**
 * Entry point for the Next application. All components that
 * are rendered by Next are rendered through this file, taking
 * place of the <Component> tag in the return statement.
 */

import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
 
// STEP 1: Create the object that will manage queries across the app.
const queryClient = new QueryClient();
 
export default function App({ Component, pageProps }: AppProps) {
    return (
      <>
        { /* STEP 2: Wrap the entire app in the QueryClientProvider */ }
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </>
      );
}