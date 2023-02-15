import './globals.css';
import './override.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
          <header>
              <h1>CapDémat utilitaires</h1>
          </header>
          {children}
          <footer>
              <p>&#169; Capsule corp. 2023</p>
          </footer>
      </body>
    </html>
  )
}
