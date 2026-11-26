import { Link } from 'react-router-dom'
import { useSEO } from '@/lib/seo'

export default function NotFound() {
  useSEO({ title: 'Halaman tidak ditemukan', noindex: true })
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-navy-950 px-4 pt-16 text-center text-white">
      <div className="grid-bg absolute inset-0" aria-hidden="true" />
      <div className="relative">
        <p className="text-7xl font-extrabold text-cyan-400">404</p>
        <h1 className="mt-3 text-2xl text-white">Sinyal terputus: halaman tidak ditemukan</h1>
        <p className="mt-2 text-navy-200">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
        <Link to="/" className="btn-primary mt-6">Kembali ke Beranda</Link>
      </div>
    </section>
  )
}
