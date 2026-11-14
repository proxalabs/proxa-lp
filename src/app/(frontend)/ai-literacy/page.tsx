import FixedPage from '@/components/FixedPage'
import { fixedPageMetadata } from '@/lib/data/sitePages'
import View from '@/views/LiteracyPage'

export const generateMetadata = () => fixedPageMetadata('literacy')

export default function Page() {
  return <FixedPage pageId="literacy" View={View} />
}
