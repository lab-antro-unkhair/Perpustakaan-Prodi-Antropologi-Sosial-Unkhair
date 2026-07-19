import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Katalog from './pages/Katalog'
import Peminjaman from './pages/Peminjaman'
import Login from './pages/Login'
import AdminBuku from './pages/AdminBuku'
import Anggota from './pages/Anggota'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/katalog" element={<Katalog />} />
        <Route path="/peminjaman" element={<Peminjaman />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/buku" element={<AdminBuku />} />
        <Route path="/anggota" element={<Anggota />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App