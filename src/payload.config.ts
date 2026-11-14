import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { ActivityLog } from './collections/ActivityLog'
import { Authors } from './collections/Authors'
import { CaseStudies } from './collections/CaseStudies'
import { Categories } from './collections/Categories'
import { Files } from './collections/Files'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { RateLimits } from './collections/RateLimits'
import { Users } from './collections/Users'
import { Videos } from './collections/Videos'
import { contactEndpoint } from './endpoints/contact'
import { eventRegisterEndpoint } from './endpoints/eventRegister'
import { gatedFileEndpoint } from './endpoints/gatedFile'
import { newsletterEndpoint } from './endpoints/newsletter'
import { submitFormEndpoint } from './endpoints/submitForm'
import { Navigation } from './globals/Navigation'
import { sitePageGlobals } from './globals/sitePages'
import { plugins } from './plugins'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Gmail / Google Workspace SMTP, as the site has always used. Without SMTP_EMAIL
// (local development) Payload writes outgoing email to the server log instead.
const email = process.env.SMTP_EMAIL
  ? nodemailerAdapter({
      defaultFromAddress: process.env.FROM_EMAIL || process.env.SMTP_EMAIL,
      defaultFromName: process.env.FROM_NAME || 'Proxa Labs Website',
      transportOptions: {
        service: 'gmail',
        auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
      },
    })
  : undefined

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Proxa Labs CMS' },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Posts, CaseStudies, Videos, Pages, Authors, Categories, Media, Files, Leads, Users, ActivityLog, RateLimits],
  globals: [Navigation, ...sitePageGlobals],
  plugins,
  // Public form endpoints, under /api. They replace the Firebase Cloud Functions.
  endpoints: [contactEndpoint, newsletterEndpoint, eventRegisterEndpoint, submitFormEndpoint, gatedFileEndpoint],
  editor: lexicalEditor(),
  // Scheduled publishing: check the queue every minute, inside this server.
  // (For a serverless host, drop autoRun and call /api/payload-jobs/run on a timer.)
  jobs: {
    autoRun: [{ cron: '* * * * *', queue: 'default', limit: 25 }],
    tasks: [],
  },
  email,
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp,
})
