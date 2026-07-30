import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function Navbar() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
    setMenuOpen(false)
  }

  return (
    <nav className="bg-blue-800 text-white px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo + Nama */}
        <h1 className="font-bold text-sm md:text-base flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="h-8 w-8 object-contain" />
          <span className="hidden sm:block">Perpustakaan Prodi Antropologi Sosial UNKHAIR</span>
          <span className="block sm:hidden">Perpus Antsos UNKHAIR</span>
        </h1>

        {/* Hamburger button - mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1 p-2"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>

        {/* Menu desktop */}
        <div className="hidden md:flex gap-4 text-sm items-center">
          <Link to="/" className="hover:text-yellow-300">Beranda</Link>
          <Link to="/katalog" className="hover:text-yellow-300">Katalog</Link>
          <Link to="/skripsi-jurnal" className="hover:text-yellow-300">Skripsi & Jurnal</Link>
          <Link to="/peminjaman" className="hover:text-yellow-300">Peminjaman</Link>
          {user ? (
            <>
              <Link to="/anggota" className="hover:text-yellow-300">Anggota</Link>
              <Link to="/admin/buku" className="hover:text-yellow-300">Admin</Link>
              <Link to="/admin/skripsi-jurnal" className="hover:text-yellow-300">Admin Skripsi</Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-white text-sm transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-yellow-300">Login</Link>
          )}
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-3 text-sm border-t border-blue-700 pt-4">
          <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Beranda</Link>
          <Link to="/katalog" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Katalog</Link>
          <Link to="/skripsi-jurnal" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Skripsi & Jurnal</Link>
          <Link to="/peminjaman" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Peminjaman</Link>
          {user ? (
            <>
              <Link to="/anggota" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Anggota</Link>
              <Link to="/admin/buku" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Admin Buku</Link>
              <Link to="/admin/skripsi-jurnal" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Admin Skripsi</Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-white text-sm transition text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-yellow-300">Login</Link>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar