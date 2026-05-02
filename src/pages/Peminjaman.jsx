function Peminjaman() {
  const dataPeminjaman = [
    {
      id: 1,
      nama: "Ahmad Fauzi",
      buku: "Pengantar Antropologi",
      tanggalPinjam: "2026-04-20",
      tanggalKembali: "2026-05-04",
      status: "Dipinjam"
    },
    {
      id: 2,
      nama: "Siti Rahmawati",
      buku: "Antropologi Budaya",
      tanggalPinjam: "2026-04-25",
      tanggalKembali: "2026-05-09",
      status: "Dipinjam"
    },
    {
      id: 3,
      nama: "Budi Santoso",
      buku: "Manusia dan Kebudayaan",
      tanggalPinjam: "2026-04-10",
      tanggalKembali: "2026-04-24",
      status: "Dikembalikan"
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">
        Data Peminjaman
      </h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Nama Anggota</th>
              <th className="px-4 py-3 text-left">Judul Buku</th>
              <th className="px-4 py-3 text-left">Tgl Pinjam</th>
              <th className="px-4 py-3 text-left">Tgl Kembali</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {dataPeminjaman.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{item.id}</td>
                <td className="px-4 py-3">{item.nama}</td>
                <td className="px-4 py-3">{item.buku}</td>
                <td className="px-4 py-3">{item.tanggalPinjam}</td>
                <td className="px-4 py-3">{item.tanggalKembali}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === "Dipinjam"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Peminjaman