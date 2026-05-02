function Login() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-800 text-center mb-2">
          Login
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Perpustakaan Prodi Antropologi Sosial UNKHAIR
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="Masukkan email..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="Masukkan password..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button className="w-full bg-blue-800 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          Masuk
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Belum punya akun? Hubungi admin perpustakaan.
        </p>
      </div>
    </div>
  )
}

export default Login