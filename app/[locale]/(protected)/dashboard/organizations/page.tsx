import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OrganizationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'super_admin') {
    redirect('/auth/login')
  }

  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Organizations (Müşteriler)</h1>

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Yeni Müşteri Ekle</h2>
        <form action={async (formData) => {
          'use server'
          const supabase = await createClient()
          const name = formData.get('name') as string
          let slug = (formData.get('slug') as string)?.trim()

          if (!slug) {
            slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          }

          // Aynı slug varsa sonuna rastgele sayı ekle
          const { data: existing } = await supabase
            .from('organizations')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

          if (existing) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`
          }

          const { error } = await supabase
            .from('organizations')
            .insert({ name, slug })

          if (error) {
            console.error(error)
            throw new Error(error.message)
          }

          const { redirect } = await import('next/navigation')
          redirect('/dashboard/organizations')
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Müşteri Adı</label>
              <input
                name="name"
                type="text"
                required
                className="w-full border rounded px-3 py-2"
                placeholder="Örn: ABC Mobilya"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (opsiyonel)</label>
              <input
                name="slug"
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="abc-mobilya"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            >
              Müşteri Ekle
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Mevcut Müşteriler</h2>
        {error && <p className="text-red-500">Hata: {error.message}</p>}
        {!organizations || organizations.length === 0 ? (
          <p>Henüz müşteri yok.</p>
        ) : (
          <ul className="space-y-2">
            {organizations.map((org) => (
              <li key={org.id} className="border p-3 rounded">
                <strong>{org.name}</strong> — {org.slug}
                <span className="text-sm text-gray-500 ml-2">
                  ({new Date(org.created_at).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}