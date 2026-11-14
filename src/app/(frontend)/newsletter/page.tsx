import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/NewsletterPage'

export const generateMetadata = () => fixedPageMetadata('newsletter')

export default function Page() {
  return <FixedPage pageId="newsletter" View={View} />
}
