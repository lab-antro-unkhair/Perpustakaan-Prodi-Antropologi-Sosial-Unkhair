import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import * as XLSX from 'xlsx'

function Anggota() {
  const [anggotaList, setAnggotaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const { toast, showToast } = useToast()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    nama: '', npm: '', angkatan: '', no_hp: '', email: ''
  })

  useEffect(() => {
    fetchAnggota()
    cekUser()
  }, [])

  async function cekUser() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
  }

  async function fetchAnggota() {
    setLoading(true)
    const { data } = await supabase
      .from('anggota')
      .select('*')
      .order('nama', { ascending: true })
    setAnggotaList(data || [])
    setLoading(false)
  }

  async function handleSimpan() {
    if (!form.nama || !form.npm) return alert('Nama dan NPM wajib diisi!')
    if (editData) {
      await supabase.from('anggota').update(form).eq('id', editData.id)
    } else {
      await supabase.from('anggota').insert(form)
    }
    setForm({ nama: '', npm: '', angkatan: '', no_hp: '', email: '' })
    setEditData(null)
    setShowForm(false)
    showToast('Data berhasil disimpan!')
    fetchAnggota()
  }

  async function handleHapus(id) {
    if (!confirm('Yakin hapus anggota ini?')) return
    await supabase.from('anggota').delete().eq('id', id)
    showToast('Data berhasil dihapus!', 'error')
    fetchAnggota()
  }
  function handleExport() {
  const exportData = anggotaList.map(a => ({
    'Nama': a.nama,
    'NPM': a.npm,
    'Angkatan': a.angkatan,
    'No. HP': a.no_hp,
    'Email': a.email
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data Anggota')
  XLSX.writeFile(wb, 'data_anggota.xlsx')
  }

  function handleEdit(anggota) {
    setEditData(anggota)
    setForm({ nama: anggota.nama, npm: anggota.npm, angkatan: anggota.angkatan, no_hp: anggota.no_hp, email: anggota.email })
    setShowForm(true)
  }

  const filtered = anggotaList.filter(a =>
    a.nama?.toLowerCase().includes(search.toLowerCase()) ||
    a.npm?.toLowerCase().includes(search.toLowerCase()) ||
    a.angkatan?.toLowerCase().includes(search.toLowerCase())
  )

  if (!user && !loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Akses Terbatas</h2>
        <p className="text-gray-500 mb-6">Halaman ini hanya bisa diakses oleh admin yang sudah login.</p>
        <a href="/login" className="bg-blue-800 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          Login Sekarang
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Data Anggota</h2>
        {user && (
          <div className="flex gap-3">
          <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
  >
          ⬇ Download Excel
          </button>
          <button
              onClick={() => { setShowForm(true); setEditData(null); setForm({ nama: '', npm: '', angkatan: '', no_hp: '', email: '' }) }}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
          + Tambah Anggota
          </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-4">{editData ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nama *" value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="NPM *" value={form.npm}
              onChange={e => setForm({ ...form, npm: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Angkatan (contoh: 2022)" value={form.angkatan}
              onChange={e => setForm({ ...form, angkatan: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="No. HP" value={form.no_hp}
              onChange={e => setForm({ ...form, no_hp: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSimpan}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Simpan
            </button>
            <button onClick={() => { setShowForm(false); setEditData(null) }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition">
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-3 items-center">
        <input type="text" placeholder="Cari nama, NPM, atau angkatan..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="text-gray-400 text-sm">{filtered.length} anggota</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">NPM</th>
              <th className="px-4 py-3 text-left">Angkatan</th>
              <th className="px-4 py-3 text-left">No. HP</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-gray-400">Memuat data...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-10 text-gray-400">Belum ada data anggota.</td></tr>
            ) : filtered.map(anggota => (
              <tr key={anggota.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{anggota.nama}</td>
                <td className="px-4 py-3">{anggota.npm}</td>
                <td className="px-4 py-3">{anggota.angkatan}</td>
                <td className="px-4 py-3">{anggota.no_hp}</td>
                <td className="px-4 py-3">{anggota.email}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(anggota)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs transition">
                    Edit
                  </button>
                  <button onClick={() => handleHapus(anggota.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default Anggota