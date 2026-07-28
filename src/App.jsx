import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Katalog from './pages/Katalog'
import SkripsiJurnal from './pages/SkripsiJurnal'
import Peminjaman from './pages/Peminjaman'
import Login from './pages/Login'
import AdminBuku from './pages/AdminBuku'
import AdminSkripsiJurnal from './pages/AdminSkripsiJurnal'
import Anggota from './pages/Anggota'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/katalog" element={<Katalog />} />
        <Route path="/skripsi-jurnal" element={<SkripsiJurnal />} />
        <Route path="/peminjaman" element={<Peminjaman />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/buku" element={<AdminBuku />} />
        <Route path="/admin/skripsi-jurnal" element={<AdminSkripsiJurnal />} />
        <Route path="/anggota" element={<Anggota />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App