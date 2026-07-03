import localFont from "next/font/local";

export const neueMontreal = localFont({
  src: "../../public/fonts/base/NeueMontreal-Medium.otf",
  variable: "--font-neue-montreal",
  weight: "500",
  display: "swap",
});

export const libreBaskerville = localFont({
  src: "../../public/fonts/special-fonts/LibreBaskerville-Italic.ttf",
  variable: "--font-libre-baskerville",
  style: "italic",
  display: "swap",
});

export const neueMontrealBold = localFont({
  src: "../../public/fonts/base/NeueMontreal-Bold.otf",
  variable: "--font-neue-montreal-bold",
  weight: "700",
  display: "swap",
});