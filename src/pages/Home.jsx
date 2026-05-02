function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-blue-800 mb-3">
          Selamat Datang
        </h2>
        <p className="text-gray-600">
          Sistem Informasi Perpustakaan Prodi Antropologi Sosial UNKHAIR
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="font-bold text-lg text-blue-800 mb-1">Katalog Buku</h3>
          <p className="text-gray-500 text-sm">Cari dan temukan buku yang tersedia</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-bold text-lg text-blue-800 mb-1">Peminjaman</h3>
          <p className="text-gray-500 text-sm">Kelola peminjaman dan pengembalian buku</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-3">👤</div>
          <h3 className="font-bold text-lg text-blue-800 mb-1">Anggota</h3>
          <p className="text-gray-500 text-sm">Manajemen data anggota perpustakaan</p>
        </div>
      </div>
    </div>
  )
}

export default Home