import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function AdminSkripsiJurnal() {
  const [dataList, setDataList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [form, setForm] = useState({ no: '', nama: '', tipe: 'SKRIPSI DAN JURNAL', judul: '', prodi: '' })
  const scrollRef = useRef(0)
  const navigate = useNavigate()

  useEffect(() => {
    cekAuth()
    fetchData()
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

  async function fetchData() {
    scrollRef.current = window.scrollY
    setLoading(true)
    const { data } = await supabase.from('skripsi_jurnal').select('*').order('no')
    setDataList(data || [])
    setLoading(false)
  }

  async function handleTambah() {
    if (!form.judul || !form.nama) return alert('Judul dan nama wajib diisi!')
    await supabase.from('skripsi_jurnal').insert(form)
    setForm({ no: '', nama: '', tipe: 'SKRIPSI DAN JURNAL', judul: '', prodi: '' })
    setShowForm(false)
    fetchData()
  }

  async function handleSimpanEdit(id) {
    if (!editForm.judul || !editForm.nama) return alert('Judul dan nama wajib diisi!')
    await supabase.from('skripsi_jurnal').update(editForm).eq('id', id)
    setEditId(null)
    fetchData()
  }

  async function handleHapus(id) {
    if (!confirm('Yakin hapus data ini?')) return
    await supabase.from('skripsi_jurnal').delete().eq('id', id)
    fetchData()
  }

  function handleEdit(item) {
    setEditId(item.id)
    setEditForm({ no: item.no, nama: item.nama, tipe: item.tipe, judul: item.judul, prodi: item.prodi })
  }

  const filtered = dataList.filter(d =>
    d.judul?.toLowerCase().includes(search.toLowerCase()) ||
    d.nama?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Kelola Skripsi & Jurnal</h2>
        <button
          onClick={() => { setShowForm(true); setEditId(null) }}
          className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + Tambah Data
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-4">Tambah Data Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="No." value={form.no}
              onChange={e => setForm({ ...form, no: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Nama Penulis *" value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={form.tipe}
              onChange={e => setForm({ ...form, tipe: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="SKRIPSI DAN JURNAL">SKRIPSI DAN JURNAL</option>
              <option value="SKRIPSI">SKRIPSI</option>
              <option value="JURNAL">JURNAL</option>
            </select>
            <input placeholder="Program Studi" value={form.prodi}
              onChange={e => setForm({ ...form, prodi: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea placeholder="Judul *" value={form.judul}
              onChange={e => setForm({ ...form, judul: e.target.value })}
              rows={3}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2" />
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
        <input type="text" placeholder="Cari judul atau nama penulis..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Judul</th>
              <th className="px-4 py-3 text-left">Tipe</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 text-gray-400">Memuat data...</td></tr>
            ) : filtered.map(item => (
              <React.Fragment key={item.id}>
                <tr className={`border-b hover:bg-gray-50 ${editId === item.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">{item.no}</td>
                  <td className="px-4 py-3">{item.nama}</td>
                  <td className="px-4 py-3">{item.judul}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {item.tipe}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => editId === item.id ? setEditId(null) : handleEdit(item)}
                      className={`${editId === item.id ? 'bg-gray-400 hover:bg-gray-500' : 'bg-yellow-400 hover:bg-yellow-500'} text-white px-3 py-1 rounded text-xs transition`}>
                      {editId === item.id ? 'Tutup' : 'Edit'}
                    </button>
                    <button onClick={() => handleHapus(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition">
                      Hapus
                    </button>
                  </td>
                </tr>

                {editId === item.id && (
                  <tr id={`edit-row-${item.id}`}>
                    <td colSpan="5" className="px-4 py-4 bg-blue-50 border-b-2 border-blue-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">No.</label>
                          <input value={editForm.no}
                            onChange={e => setEditForm({ ...editForm, no: e.target.value })}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Nama Penulis *</label>
                          <input value={editForm.nama}
                            onChange={e => setEditForm({ ...editForm, nama: e.target.value })}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Tipe</label>
                          <select value={editForm.tipe}
                            onChange={e => setEditForm({ ...editForm, tipe: e.target.value })}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="SKRIPSI DAN JURNAL">SKRIPSI DAN JURNAL</option>
                            <option value="SKRIPSI">SKRIPSI</option>
                            <option value="JURNAL">JURNAL</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Program Studi</label>
                          <input value={editForm.prodi}
                            onChange={e => setEditForm({ ...editForm, prodi: e.target.value })}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-gray-500 mb-1 block">Judul *</label>
                          <textarea value={editForm.judul}
                            onChange={e => setEditForm({ ...editForm, judul: e.target.value })}
                            rows={3}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <button onClick={() => handleSimpanEdit(item.id)}
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
    </div>
  )
}

export default AdminSkripsiJurnal