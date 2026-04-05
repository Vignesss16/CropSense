import './globals.css'
import { LanguageProvider } from '@/lib/LanguageContext'

export const metadata = {
  title: 'NalamAgri — AI Crop Health Assistant',
  description: 'Smart farming assistant that diagnoses crop diseases using AI and recommends actionable fixes for farmers.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-field noise antialiased">
        <LanguageProvider>
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}
