import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Peminjaman() {
  const [dataPeminjaman, setDataPeminjaman] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    nama_anggota: '',
    npm: '',
    id_buku: '',
    judul_buku: '',
    tanggal_pinjam: '',
    tanggal_kembali: '',
    status: 'Dipinjam'
  })
  const [bukuList, setBukuList] = useState([])

  useEffect(() => {
    fetchPeminjaman()
    fetchBuku()
    cekUser()
  }, [])

  async function cekUser() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
  }

  async function fetchPeminjaman() {
    setLoading(true)
    const { data } = await supabase
      .from('peminjaman')
      .select('*')
      .order('id', { ascending: false })
    setDataPeminjaman(data || [])
    setLoading(false)
  }

  async function fetchBuku() {
    const { data } = await supabase
      .from('buku')
      .select('id, no_induk, judul')
      .order('no_induk')
    setBukuList(data || [])
  }

  async function handleSimpan() {
    if (!form.nama_anggota || !form.judul_buku || !form.tanggal_pinjam || !form.tanggal_kembali)
      return alert('Semua field wajib diisi!')

    await supabase.from('peminjaman').insert(form)
    setForm({ nama_anggota: '', npm: '', id_buku: '', judul_buku: '', tanggal_pinjam: '', tanggal_kembali: '', status: 'Dipinjam' })
    setShowForm(false)
    fetchPeminjaman()
  }

  async function handleKembali(id) {
    if (!confirm('Tandai buku ini sudah dikembalikan?')) return
    await supabase.from('peminjaman').update({ status: 'Dikembalikan' }).eq('id', id)
    fetchPeminjaman()
  }

  async function handleHapus(id) {
    if (!confirm('Hapus data peminjaman ini?')) return
    await supabase.from('peminjaman').delete().eq('id', id)
    fetchPeminjaman()
  }

  function handlePilihBuku(e) {
    const selected = bukuList.find(b => b.id === parseInt(e.target.value))
    if (selected) {
      setForm({ ...form, id_buku: selected.id, judul_buku: selected.judul })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Data Peminjaman</h2>
        {user && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            + Tambah Peminjaman
          </button>
        )}
      </div>

      {/* Form tambah */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-4">Tambah Data Peminjaman</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nama Anggota *" value={form.nama_anggota}
              onChange={e => setForm({ ...form, nama_anggota: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="NPM" value={form.npm}
              onChange={e => setForm({ ...form, npm: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select onChange={handlePilihBuku}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Pilih Buku --</option>
              {bukuList.map(b => (
                <option key={b.id} value={b.id}>{b.no_induk} - {b.judul}</option>
              ))}
            </select>
            <input placeholder="Judul Buku (otomatis terisi)" value={form.judul_buku} readOnly
              className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-500" />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tanggal Pinjam *</label>
              <input type="date" value={form.tanggal_pinjam}
                onChange={e => setForm({ ...form, tanggal_pinjam: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tanggal Kembali *</label>
              <input type="date" value={form.tanggal_kembali}
                onChange={e => setForm({ ...form, tanggal_kembali: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSimpan}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Simpan
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">NPM</th>
              <th className="px-4 py-3 text-left">Judul Buku</th>
              <th className="px-4 py-3 text-left">Tgl Pinjam</th>
              <th className="px-4 py-3 text-left">Tgl Kembali</th>
              <th className="px-4 py-3 text-left">Status</th>
              {user && <th className="px-4 py-3 text-left">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-10 text-gray-400">Memuat data...</td></tr>
            ) : dataPeminjaman.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-10 text-gray-400">Belum ada data peminjaman.</td></tr>
            ) : dataPeminjaman.map(item => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{item.nama_anggota}</td>
                <td className="px-4 py-3">{item.npm}</td>
                <td className="px-4 py-3">{item.judul_buku}</td>
                <td className="px-4 py-3">{item.tanggal_pinjam}</td>
                <td className="px-4 py-3">{item.tanggal_kembali}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Dipinjam'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                {user && (
                  <td className="px-4 py-3 flex gap-2">
                    {item.status === 'Dipinjam' && (
                      <button onClick={() => handleKembali(item.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition">
                        Kembali
                      </button>
                    )}
                    <button onClick={() => handleHapus(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">
                      Hapus
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Peminjaman