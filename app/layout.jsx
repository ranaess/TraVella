import './globals.css'

export const metadata = {
  title: 'TraVella',
  description: 'Best place to book hotels, flights, and more',
  generator: 'TraVella',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 