import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Noto_Sans_SC } from "next/font/google";

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${notoSansSC.variable} font-sans`}>
      <Component {...pageProps} />
    </main>
  );
}