
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="min-h-100" suppressHydrationWarning>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Roboto&display=swap" rel="stylesheet"></link>
          {/* icon */}
          
          <title>
            Leis PI
          </title>
        </head>

        <body
         className="bg-white dark:bg-black text-black dark:text-white h-100">
          <ThemeProvider>
              {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
