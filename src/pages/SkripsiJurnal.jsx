import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const PER_PAGE = 12

function SkripsiJurnal() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchData()
  }, [page, search])

  async function fetchData() {
    setLoading(true)

    let query = supabase
      .from('skripsi_jurnal')
      .select('*', { count: 'exact' })
      .order('no', { ascending: true })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

    if (search) {
      query = supabase
        .from('skripsi_jurnal')
        .select('*', { count: 'exact' })
        .or(`judul.ilike.%${search}%,nama.ilike.%${search}%`)
        .order('no', { ascending: true })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    }

    const { data, count, error } = await query
    if (!error) {
      setData(data || [])
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
      <h2 className="text-2xl font-bold text-blue-800 mb-2">Katalog Skripsi & Jurnal</h2>
      <p className="text-gray-500 text-sm mb-6">Prodi Antropologi Sosial UNKHAIR</p>

      {/* Search */}
      <div className="mb-6 flex gap-3 items-center">
        <input
          type="text"
          placeholder="Cari judul atau nama penulis..."
          value={search}
          onChange={handleSearch}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-400 text-sm">{total} ditemukan</span>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-400 text-center py-10">Memuat data...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {data.length > 0 ? data.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow p-5 flex gap-4 items-start">
              <div className="text-3xl pt-1">
                {item.tipe?.includes('JURNAL') && !item.tipe?.includes('SKRIPSI') ? '📄' : '🎓'}
              </div>
              <div className="flex-1">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  item.tipe?.includes('JURNAL') && !item.tipe?.includes('SKRIPSI')
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.tipe}
                </span>
                <h3 className="font-bold text-blue-800 mt-2 mb-1">{item.judul}</h3>
                <p className="text-gray-600 text-sm mb-1">✍️ {item.nama}</p>
                <p className="text-gray-400 text-xs">{item.prodi}</p>
              </div>
              <div className="text-gray-400 text-sm font-medium">#{item.no}</div>
            </div>
          )) : (
            <p className="text-gray-400 text-center py-10">Data tidak ditemukan.</p>
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

export default SkripsiJurnal