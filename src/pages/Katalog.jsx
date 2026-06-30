import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Katalog() {
  const [search, setSearch] = useState('')
  const [dataBuku, setDataBuku] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuku()
  }, [])

  async function fetchBuku() {
    setLoading(true)
    const { data, error } = await supabase
      .from('buku')
      .select('*')
      .order('no_induk', { ascending: true })

    if (error) {
      console.error('Error fetching buku:', error)
    } else {
      setDataBuku(data)
    }
    setLoading(false)
  }

  const filteredBuku = dataBuku.filter(buku =>
    buku.judul?.toLowerCase().includes(search.toLowerCase()) ||
    buku.pengarang?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">
        Katalog Buku
      </h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari judul atau pengarang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-10">Memuat data buku...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuku.length > 0 ? filteredBuku.map((buku) => (
            <div key={buku.id} className="bg-white rounded-xl shadow p-5">
              <div className="text-3xl mb-3">📖</div>
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
    </div>
  )
}

export default Katalog