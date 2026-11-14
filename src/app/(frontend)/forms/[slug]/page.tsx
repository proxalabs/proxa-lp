import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import CmsForm from '@/components/CmsForm'
import { getPublicForm } from '@/lib/data/forms'
import { buildMetadata } from '@/lib/seo'
import { SITE_NAME } from '@/lib/site'

import '@/components/ArticleLayout.css'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const form = await getPublicForm(slug)
  if (!form) return { title: `Form not found · ${SITE_NAME}` }
  return buildMetadata({ title: `${form.title} · ${SITE_NAME}`, description: form.intro, path: `/forms/${form.slug}` })
}

// Hosted page for a CMS form at /forms/<slug>.
export default async function Page({ params }: Props) {
  const { slug } = await params
  const form = await getPublicForm(slug)
  if (!form) notFound()

  return (
    <div className="proxa-article">
      <section className="shell blog-index">
        <h1 className="blog-title">{form.title}</h1>
        {form.intro && <p className="blog-sub">{form.intro}</p>}
        <CmsForm form={form} />
      </section>
    </div>
  )
}
