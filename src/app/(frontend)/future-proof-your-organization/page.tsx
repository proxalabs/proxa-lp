import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/FutureProofPage'

export const generateMetadata = () => fixedPageMetadata('futureproof')

export default function Page() {
  return <FixedPage pageId="futureproof" View={View} />
}
