import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function AdminBuku() {
  const [bukuList, setBukuList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({ no_induk: '', judul: '', pengarang: '', penerbit: '', stok: 1 })
  const navigate = useNavigate()

  useEffect(() => {
    cekAuth()
    fetchBuku()
  }, [])

  async function cekAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/login')
  }

  async function fetchBuku() {
    setLoading(true)
    const { data } = await supabase.from('buku').select('*').order('no_induk')
    setBukuList(data || [])
    setLoading(false)
  }

  async function handleSimpan() {
    if (!form.judul || !form.pengarang) return alert('Judul dan pengarang wajib diisi!')

    if (editData) {
      await supabase.from('buku').update(form).eq('id', editData.id)
    } else {
      await supabase.from('buku').insert(form)
    }

    setForm({ no_induk: '', judul: '', pengarang: '', penerbit: '', stok: 1 })
    setEditData(null)
    setShowForm(false)
    fetchBuku()
  }

  async function handleHapus(id) {
    if (!confirm('Yakin hapus buku ini?')) return
    await supabase.from('buku').delete().eq('id', id)
    fetchBuku()
  }

  function handleEdit(buku) {
    setEditData(buku)
    setForm({ no_induk: buku.no_induk, judul: buku.judul, pengarang: buku.pengarang, penerbit: buku.penerbit, stok: buku.stok })
    setShowForm(true)
  }

  const filtered = bukuList.filter(b =>
    b.judul?.toLowerCase().includes(search.toLowerCase()) ||
    b.pengarang?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Kelola Buku</h2>
        <button
          onClick={() => { setShowForm(true); setEditData(null); setForm({ no_induk: '', judul: '', pengarang: '', penerbit: '', stok: 1 }) }}
          className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + Tambah Buku
        </button>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-4">{editData ? 'Edit Buku' : 'Tambah Buku Baru'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="No. Induk" value={form.no_induk} onChange={e => setForm({ ...form, no_induk: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Judul Buku *" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Pengarang *" value={form.pengarang} onChange={e => setForm({ ...form, pengarang: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Penerbit" value={form.penerbit} onChange={e => setForm({ ...form, penerbit: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" placeholder="Stok" value={form.stok} onChange={e => setForm({ ...form, stok: parseInt(e.target.value) })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSimpan} className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Simpan
            </button>
            <button onClick={() => { setShowForm(false); setEditData(null) }} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input type="text" placeholder="Cari judul atau pengarang..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">No. Induk</th>
              <th className="px-4 py-3 text-left">Judul</th>
              <th className="px-4 py-3 text-left">Pengarang</th>
              <th className="px-4 py-3 text-left">Stok</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">Memuat data...</td></tr>
            ) : filtered.map(buku => (
              <tr key={buku.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{buku.no_induk}</td>
                <td className="px-4 py-3">{buku.judul}</td>
                <td className="px-4 py-3">{buku.pengarang}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${buku.stok > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {buku.stok}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(buku)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-xs transition">Edit</button>
                  <button onClick={() => handleHapus(buku.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminBuku