import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import * as XLSX from 'xlsx'

function AdminBuku() {
  const [bukuList, setBukuList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [form, setForm] = useState({ no_induk: '', judul: '', pengarang: '', penerbit: '', stok: 1 })
  const [coverFile, setCoverFile] = useState(null)
  const [selected, setSelected] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const { toast, showToast } = useToast()
  const scrollRef = useRef(0)
  const navigate = useNavigate()

  useEffect(() => {
    cekAuth()
    fetchBuku()
  }, [])

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: scrollRef.current })
    }
  }, [loading])

  useEffect(() => {
    if (editId) {
      const el = document.getElementById(`edit-row-${editId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [editId])

  async function cekAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/login')
  }

  async function fetchBuku() {
    scrollRef.current = window.scrollY
    setLoading(true)
    const { data } = await supabase.from('buku').select('*').order('no_induk')
    setBukuList(data || [])
    setLoading(false)
  }

  async function handleTambah() {
    if (!form.judul || !form.pengarang) return alert('Judul dan pengarang wajib diisi!')
    await supabase.from('buku').insert(form)
    setForm({ no_induk: '', judul: '', pengarang: '', penerbit: '', stok: 1 })
    setShowForm(false)
    showToast('Data berhasil disimpan!')
    fetchBuku()
  }

  async function handleUploadCover(file, bukuId) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${bukuId}.${fileExt}`
    const { error } = await supabase.storage
      .from('covers')
      .upload(fileName, file, { upsert: true })
    if (error) {
      alert('Gagal upload foto!')
      return null
    }
    const { data } = supabase.storage.from('covers').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleSimpanEdit(id) {
    if (!editForm.judul || !editForm.pengarang) return alert('Judul dan pengarang wajib diisi!')
    let updatedForm = { ...editForm }
    if (coverFile) {
      const url = await handleUploadCover(coverFile, id)
      if (url) updatedForm.cover_url = url
    }
    await supabase.from('buku').update(updatedForm).eq('id', id)
    setEditId(null)
    setCoverFile(null)
    showToast('Data berhasil diperbarui!')
    fetchBuku()
  }
  async function handleToggleVisible(id, currentStatus) {
  await supabase.from('buku').update({ is_visible: !currentStatus }).eq('id', id)
  showToast(currentStatus ? 'Buku disembunyikan!' : 'Buku ditampilkan!', currentStatus ? 'error' : 'success')
  fetchBuku()
  }
  async function handleBulkAction() {
  if (!bulkAction) return alert('Pilih aksi dulu!')
  if (selected.length === 0) return alert('Pilih buku dulu!')

  const isVisible = bulkAction === 'tampil'
  await supabase.from('buku').update({ is_visible: isVisible }).in('id', selected)
  showToast(isVisible ? `${selected.length} buku ditampilkan!` : `${selected.length} buku disembunyikan!`, isVisible ? 'success' : 'error')
  setSelected([])
  setBulkAction('')
  fetchBuku()
  }

  function handleSelectAll() {
    if (selected.length === filtered.length) {
    setSelected([])
    } else {
    setSelected(filtered.map(b => b.id))
    }
    }

  async function handleHapus(id) {
    if (!confirm('Yakin hapus buku ini?')) return
    await supabase.from('buku').delete().eq('id', id)
    showToast('Data berhasil dihapus!', 'error')
    fetchBuku()
  }
  function handleExport() {
  const exportData = bukuList.map(b => ({
    'No. Induk': b.no_induk,
    'Judul': b.judul,
    'Pengarang': b.pengarang,
    'Penerbit': b.penerbit,
    'Stok': b.stok
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Katalog Buku')
  XLSX.writeFile(wb, 'katalog_buku.xlsx')
}
  function handleEdit(buku) {
    setEditId(buku.id)
    setEditForm({ no_induk: buku.no_induk, judul: buku.judul, pengarang: buku.pengarang, penerbit: buku.penerbit, stok: buku.stok, cover_url: buku.cover_url })
  }

  const filtered = bukuList.filter(b =>
    b.judul?.toLowerCase().includes(search.toLowerCase()) ||
    b.pengarang?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Kelola Buku</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
          >
            ⬇ Download Excel
          </button>
          <button
            onClick={() => { setShowForm(true); setEditId(null) }}
            className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            + Tambah Buku
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-4">Tambah Buku Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="No. Induk" value={form.no_induk}
              onChange={e => setForm({ ...form, no_induk: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Judul Buku *" value={form.judul}
              onChange={e => setForm({ ...form, judul: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Pengarang *" value={form.pengarang}
              onChange={e => setForm({ ...form, pengarang: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Penerbit" value={form.penerbit}
              onChange={e => setForm({ ...form, penerbit: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" placeholder="Stok" value={form.stok}
              onChange={e => setForm({ ...form, stok: parseInt(e.target.value) })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleTambah}
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

      <div className="mb-4">
        <input type="text" placeholder="Cari judul atau pengarang..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Bulk action toolbar */}
      <div className="mb-4 flex gap-3 items-center">
      <select
          value={bulkAction}
          onChange={e => setBulkAction(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
      <option value="">-- Pilih Aksi --</option>
      <option value="tampil">👁 Tampilkan</option>
      <option value="hidden">🙈 Sembunyikan</option>
    </select>
    <button
            onClick={handleBulkAction}
            className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
            Terapkan ({selected.length} dipilih)
  </button>
            {selected.length > 0 && (
    <button
      onClick={() => setSelected([])}
      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition"
      >
      Batal Pilih
    </button>
    )}
  `</div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-3">
          <input type="checkbox"
                checked={selected.length === filtered.length && filtered.length > 0}
                onChange={handleSelectAll}
                className="cursor-pointer"
          />
          </th>
              <th className="px-4 py-3 text-left">No. Induk</th>
              <th className="px-4 py-3 text-left">Judul</th>
              <th className="px-4 py-3 text-left">Pengarang</th>
              <th className="px-4 py-3 text-left">Penerbit</th>
              <th className="px-4 py-3 text-left">Stok</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-gray-400">Memuat data...</td></tr>
            ) : filtered.map(buku => (
              <React.Fragment key={buku.id}>
                <tr className={`border-b hover:bg-gray-50 ${editId === buku.id ? 'bg-blue-50' : ''} ${selected.includes(buku.id) ? 'bg-blue-50' : ''}`}>
  <td className="px-4 py-3">
    <input type="checkbox"
      checked={selected.includes(buku.id)}
      onChange={() => setSelected(prev =>
        prev.includes(buku.id) ? prev.filter(id => id !== buku.id) : [...prev, buku.id]
      )}
      className="cursor-pointer"
      />
      </td>
                  <td className="px-4 py-3">{buku.no_induk}</td>
                  <td className="px-4 py-3">{buku.judul}</td>
                  <td className="px-4 py-3">{buku.pengarang}</td>
                  <td className="px-4 py-3">{buku.penerbit}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${buku.stok > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {buku.stok}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleVisible(buku.id, buku.is_visible)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                      buku.is_visible
                      ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                      : 'bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700'
                      }`}>
                      {buku.is_visible ? '👁 Tampil' : '🙈 Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => editId === buku.id ? setEditId(null) : handleEdit(buku)}
                      className={`${editId === buku.id ? 'bg-gray-400 hover:bg-gray-500' : 'bg-yellow-400 hover:bg-yellow-500'} text-white px-3 py-1 rounded text-xs transition`}>
                      {editId === buku.id ? 'Tutup' : 'Edit'}
                    </button>
                    <button onClick={() => handleHapus(buku.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">
                      Hapus
                    </button>
                  </td>
                </tr>

                {editId === buku.id && (
                  <tr id={`edit-row-${buku.id}`}>
                    <td colSpan="7" className="px-4 py-4 bg-blue-50 border-b-2 border-blue-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">No. Induk</label>
                          <input value={editForm.no_induk}
                            onChange={e => setEditForm({ ...editForm, no_induk: e.target.value })}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Judul *</label>
                          <input value={editForm.judul}
                            onChange={e => setEditForm({ ...editForm, judul: e.target.value })}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Pengarang *</label>
                          <input value={editForm.pengarang}
                            onChange={e => setEditForm({ ...editForm, pengarang: e.target.value })}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Penerbit</label>
                          <input value={editForm.penerbit}
                            onChange={e => setEditForm({ ...editForm, penerbit: e.target.value })}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Stok</label>
                          <input type="number" value={editForm.stok}
                            onChange={e => setEditForm({ ...editForm, stok: parseInt(e.target.value) })}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Cover Buku</label>
                          {editForm.cover_url && (
                            <img src={editForm.cover_url} alt="cover" className="w-16 h-20 object-cover rounded mb-2" />
                          )}
                          <input type="file" accept="image/*"
                            onChange={e => setCoverFile(e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <button onClick={() => handleSimpanEdit(buku.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition">
                          Simpan
                        </button>
                        <button onClick={() => setEditId(null)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition">
                          Batal
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default AdminBuku