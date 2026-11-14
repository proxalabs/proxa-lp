import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/ProxaLabsPage'

export const generateMetadata = () => fixedPageMetadata('proxalab')

export default function Page() {
  return <FixedPage pageId="proxalab" View={View} />
}
