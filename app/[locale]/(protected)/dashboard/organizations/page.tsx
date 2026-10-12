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
            .insert({
              name,
              slug,
              code: formData.get('code') ? parseInt(formData.get('code') as string) : null,
              tax_office: formData.get('tax_office') as string || null,
              tax_number: formData.get('tax_number') as string || null,
              address: formData.get('address') as string || null,
              phone: formData.get('phone') as string || null,
              mersis_no: formData.get('mersis_no') as string || null,
              email: formData.get('email') as string || null,
            })

          if (error) {
            console.error(error)
            throw new Error(error.message)
          }

          const { redirect } = await import('next/navigation')
          redirect('/en/dashboard/organizations')
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Müşteri Adı</label>
              <input name="name" type="text" required className="w-full border rounded px-3 py-2" placeholder="Örn: ABC Mobilya" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kod (4 haneli)</label>
              <input
		name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                required
                className="w-full border rounded px-3 py-2"
                placeholder="1001"
		onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 4)
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (opsiyonel)</label>
              <input name="slug" type="text" className="w-full border rounded px-3 py-2" placeholder="abc-mobilya" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vergi Dairesi</label>
              <input name="tax_office" type="text" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vergi Numarası</label>
              <input name="tax_number" type="text" maxLength={10} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adres</label>
              <textarea name="address" className="w-full border rounded px-3 py-2" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon</label>
              <input name="phone" type="text" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">MERSİS No</label>
              <input name="mersis_no" type="text" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <input name="email" type="email" className="w-full border rounded px-3 py-2" />
            </div>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
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
                <strong>{org.name}</strong> — {org.slug} {org.code && `(Kod: ${org.code})`}
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