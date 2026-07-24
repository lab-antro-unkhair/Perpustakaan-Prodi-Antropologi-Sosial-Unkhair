import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const PER_PAGE = 12

function Katalog() {
  const [search, setSearch] = useState('')
  const [dataBuku, setDataBuku] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchBuku()
  }, [page, search])

  async function fetchBuku() {
    setLoading(true)

    let query = supabase
      .from('buku')
      .select('*', { count: 'exact' })
      .order('no_induk', { ascending: true })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

    if (search) {
      query = supabase
        .from('buku')
        .select('*', { count: 'exact' })
        .or(`judul.ilike.%${search}%,pengarang.ilike.%${search}%`)
        .order('no_induk', { ascending: true })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    }

    const { data, count, error } = await query

    if (!error) {
      setDataBuku(data || [])
      setTotal(count || 0)
    }
    setLoading(false)
  }

  function handleSearch(e) {
    setSearch(e.target.value)
    setPage(1)
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Katalog Buku</h2>

      {/* Search */}
      <div className="mb-6 flex gap-3 items-center">
        <input
          type="text"
          placeholder="Cari judul atau pengarang..."
          value={search}
          onChange={handleSearch}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-400 text-sm">{total} buku ditemukan</span>
      </div>

      {/* Grid buku */}
      {loading ? (
        <p className="text-gray-400 text-center py-10">Memuat data buku...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataBuku.length > 0 ? dataBuku.map((buku) => (
            <div key={buku.id} className="bg-white rounded-xl shadow p-5">
  {buku.cover_url ? (
    <img src={buku.cover_url} alt={buku.judul}
      className="w-full h-48 object-cover rounded-lg mb-3" />
  ) : (
    <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-4xl">
      📖
    </div>
  )}
  <h3 className="font-bold text-blue-800 mb-1">{buku.judul}</h3>
              <p className="text-gray-500 text-sm mb-1">{buku.pengarang}</p>
              <p className="text-gray-400 text-xs mb-3">{buku.penerbit}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                buku.stok > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {buku.stok > 0 ? `Tersedia (${buku.stok})` : "Tidak Tersedia"}
              </span>
            </div>
          )) : (
            <p className="text-gray-400 col-span-3 text-center py-10">
              Buku tidak ditemukan.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 disabled:opacity-40 transition"
          >
            ← Sebelumnya
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span key={`dot-${p}`} className="text-gray-400">...</span>
                )}
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-lg text-sm transition ${
                    page === p
                      ? 'bg-blue-800 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {p}
                </button>
              </>
            ))
          }

          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 disabled:opacity-40 transition"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  )
}

export default Katalog