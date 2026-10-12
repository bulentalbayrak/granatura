import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CompaniesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'super_admin') {
    redirect('/auth/login')
  }

  const { data: companies, error } = await supabase
    .from('companies')
    .select('*, organizations(name)')
    .order('created_at', { ascending: false })

  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, name, code')
    .order('name')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Companies (Şirketler)</h1>

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Yeni Şirket Ekle</h2>
        <form action={async (formData) => {
          'use server'
          const supabase = await createClient()
          const name = formData.get('name') as string
          const organization_id = formData.get('organization_id') as string
          let slug = (formData.get('slug') as string)?.trim()

          if (!slug) {
            slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          }

          const { error } = await supabase
            .from('companies')
            .insert({
              name,
              slug,
              code: formData.get('code') ? parseInt(formData.get('code') as string) : null,
              organization_id,
            })

          if (error) {
            console.error(error)
            throw new Error(error.message)
          }

          const { redirect } = await import('next/navigation')
          redirect('/en/dashboard/companies')
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Organizasyon</label>
              <select name="organization_id" required className="w-full border rounded px-3 py-2 bg-default-50 text-default-900">
                <option value="">Seçiniz</option>
                {organizations?.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {org.code && `(${org.code})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şirket Adı</label>
              <input name="name" type="text" required className="w-full border rounded px-3 py-2" placeholder="Örn: ABC Mobilya A.Ş." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kod (4 haneli)</label>
              <input
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                className="w-full border rounded px-3 py-2"
                placeholder="1001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (opsiyonel)</label>
              <input name="slug" type="text" className="w-full border rounded px-3 py-2" placeholder="abc-mobilya" />
            </div>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
              Şirket Ekle
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Mevcut Şirketler</h2>
        {error && <p className="text-red-500">Hata: {error.message}</p>}
        {!companies || companies.length === 0 ? (
          <p>Henüz şirket yok.</p>
        ) : (
          <ul className="space-y-2">
            {companies.map((company) => (
              <li key={company.id} className="border p-3 rounded">
                <strong>{company.name}</strong> — {company.slug} {company.code && `(Kod: ${company.code})`}
                <div className="text-sm text-gray-500">
                  Organizasyon: {company.organizations?.name}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}