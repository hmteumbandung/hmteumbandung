import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/PublicLayout'
import { Loading } from '@/components/ui'
import Home from '@/pages/Home'

const About = lazy(() => import('@/pages/About'))
const Cabinet = lazy(() => import('@/pages/Cabinet'))
const Departments = lazy(() => import('@/pages/Departments'))
const News = lazy(() => import('@/pages/News'))
const NewsDetail = lazy(() => import('@/pages/NewsDetail'))
const Events = lazy(() => import('@/pages/Events'))
const Academic = lazy(() => import('@/pages/Academic'))
const Services = lazy(() => import('@/pages/Services'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const AdminApp = lazy(() => import('@/pages/admin/AdminApp'))

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="tentang" element={<About />} />
          <Route path="kabinet" element={<Cabinet />} />
          <Route path="departemen" element={<Departments />} />
          <Route path="departemen/:slug" element={<Departments />} />
          <Route path="berita" element={<News />} />
          <Route path="berita/:slug" element={<NewsDetail />} />
          <Route path="kegiatan" element={<Events />} />
          <Route path="akademik" element={<Academic />} />
          <Route path="layanan" element={<Services />} />
          <Route path="kontak" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/*" element={<AdminApp />} />
      </Routes>
    </Suspense>
  )
}
