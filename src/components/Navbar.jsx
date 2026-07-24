import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function Navbar() {
  const [user, setUser] = useState(null)
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
  }

  return (
    <nav className="bg-blue-800 text-white px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="font-bold text-sm md:text-base flex items-center gap-2">
        <img src="/logo.png" alt="logo" className="h-8 w-8 object-contain" />
          Perpustakaan Prodi Antropologi Sosial UNKHAIR
        </h1>
        <div className="flex gap-4 text-sm items-center">
          <Link to="/" className="hover:text-yellow-300">Beranda</Link>
          <Link to="/katalog" className="hover:text-yellow-300">Katalog</Link>
          <Link to="/peminjaman" className="hover:text-yellow-300">Peminjaman</Link>
          {user ? (
            <>
            <Link to="/anggota" className="hover:text-yellow-300">Anggota</Link>
              <Link to="/admin/buku" className="hover:text-yellow-300">Admin</Link>
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
    </nav>
  )
}

export default Navbar