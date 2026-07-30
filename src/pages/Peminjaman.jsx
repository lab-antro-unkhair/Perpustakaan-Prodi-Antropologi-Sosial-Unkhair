import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

function Peminjaman() {
  const [dataPeminjaman, setDataPeminjaman] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchBuku, setSearchBuku] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [anggotaList, setAnggotaList] = useState([])
  const [searchAnggota, setSearchAnggota] = useState('')
  const [showDropdownAnggota, setShowDropdownAnggota] = useState(false)
  const { toast, showToast } = useToast()
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
    fetchAnggota()
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
    const { data: buku } = await supabase
      .from('buku')
      .select('id, no_induk, judul')
      .order('no_induk')
  
    const { data: skripsi } = await supabase
      .from('skripsi_jurnal')
      .select('id, no, judul')
      .order('no')

    const bukuFormatted = (buku || []).map(b => ({ id: `buku-${b.id}`, judul: b.judul, label: `[Buku] ${b.no_induk} - ${b.judul}` }))
    const skripsiFormatted = (skripsi || []).map(s => ({ id: `skripsi-${s.id}`, judul: s.judul, label: `[Skripsi/Jurnal] ${s.no} - ${s.judul}` }))
  
    setBukuList([...bukuFormatted, ...skripsiFormatted])
  }

  async function fetchAnggota() {
  const { data } = await supabase
    .from('anggota')
    .select('id, nama, npm')
    .order('nama')
  setAnggotaList(data || [])
}

  async function handleSimpan() {
    if (!form.nama_anggota || !form.judul_buku || !form.tanggal_pinjam || !form.tanggal_kembali)
      return alert('Semua field wajib diisi!')

    await supabase.from('peminjaman').insert(form)
    setForm({ nama_anggota: '', npm: '', id_buku: '', judul_buku: '', tanggal_pinjam: '', tanggal_kembali: '', status: 'Dipinjam' })
    setShowForm(false)
    showToast('Data berhasil disimpan!')
    fetchPeminjaman()
  }

  async function handleKembali(id) {
    if (!confirm('Tandai buku ini sudah dikembalikan?')) return
    await supabase.from('peminjaman').update({ status: 'Dikembalikan' }).eq('id', id)
    showToast('Buku berhasil dikembalikan!')
    fetchPeminjaman()
  }

  async function handleHapus(id) {
    if (!confirm('Hapus data peminjaman ini?')) return
    await supabase.from('peminjaman').delete().eq('id', id)
    showToast('Data berhasil dihapus!', 'error')
    fetchPeminjaman()
  }

function handlePilihBuku(e) {
  const selected = bukuList.find(b => b.id === e.target.value)
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
            <div className="relative">
            <input
              type="text"
              placeholder="Cari nama anggota..."
              value={searchAnggota}
              onChange={e => {
                setSearchAnggota(e.target.value)
                setForm({ ...form, nama_anggota: e.target.value })
                setShowDropdownAnggota(true)
              }}
              onFocus={() => setShowDropdownAnggota(true)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showDropdownAnggota && searchAnggota && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
              {anggotaList
                .filter(a => a.nama?.toLowerCase().includes(searchAnggota.toLowerCase()))
                .map(a => (
            <div key={a.id}
              onClick={() => {
                setForm({ ...form, nama_anggota: a.nama, npm: a.npm })
                setSearchAnggota(a.nama)
                setShowDropdownAnggota(false)
                }}
              className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b last:border-0">
            <span className="font-medium">{a.nama}</span>
            <span className="text-gray-400 text-xs ml-2">{a.npm}</span>
            </div>
              ))
              }
              {anggotaList.filter(a => a.nama?.toLowerCase().includes(searchAnggota.toLowerCase())).length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-400">Anggota tidak ditemukan</div>
              )}
            </div>
              )}
            </div>
            <input placeholder="NPM" value={form.npm}
              onChange={e => setForm({ ...form, npm: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="relative">
            <input
              type="text"
              placeholder="Cari dan pilih buku/skripsi/jurnal..."
              value={searchBuku}
              onChange={e => { setSearchBuku(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showDropdown && searchBuku && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
              {bukuList
                .filter(b => b.label.toLowerCase().includes(searchBuku.toLowerCase()))
                .slice(0, 20)
                .map(b => (
            <div key={b.id}
              onClick={() => {
                setForm({ ...form, id_buku: b.id, judul_buku: b.judul })
                setSearchBuku(b.label)
                setShowDropdown(false)
                }}
              className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b last:border-0">
                {b.label}
            </div>
              ))
              }
              {bukuList.filter(b => b.label.toLowerCase().includes(searchBuku.toLowerCase())).length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-400">Tidak ditemukan</div>
              )}
            </div>
              )}
            </div>
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
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default Peminjaman