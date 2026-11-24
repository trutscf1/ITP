export const name = "storage" as const;
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import bucketRoute from './routes/bucket.ts'

const app = new Hono()

app.route("/bucket", bucketRoute)

serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
