import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/InsiteXPage'

export const generateMetadata = () => fixedPageMetadata('insitex')

export default function Page() {
  return <FixedPage pageId="insitex" View={View} />
}
