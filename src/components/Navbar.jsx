import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-blue-800 text-white px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="font-bold text-sm md:text-base">
          Perpustakaan Prodi Antropologi Sosial UNKHAIR
        </h1>
        <div className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-yellow-300">Beranda</Link>
          <Link to="/katalog" className="hover:text-yellow-300">Katalog</Link>
          <Link to="/peminjaman" className="hover:text-yellow-300">Peminjaman</Link>
          <Link to="/login" className="hover:text-yellow-300">Login</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar