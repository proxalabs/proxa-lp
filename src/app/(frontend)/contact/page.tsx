import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/ContactPage'

// CMS edits refresh this page at once; the timer is only a backstop.
export const revalidate = 3600

export const generateMetadata = () => fixedPageMetadata('contact')

export default function Page() {
  return <FixedPage pageId="contact" View={View} />
}
