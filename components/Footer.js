export default function Footer() {
  return (
    <footer className="absolute bottom-0 w-full py-4 bg-transparent border-t border-white/5 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 text-center text-sm text-green-100/60 font-medium">
        <p>
          &copy; {new Date().getFullYear()} NalamAgri. Built with ❤️ by{' '}
          <a
            href="https://www.linkedin.com/in/vignesh-valluvan/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 hover:underline transition-colors duration-200"
          >
            Vignesh Valluvan
          </a>
        </p>
      </div>
    </footer>
  )
}
