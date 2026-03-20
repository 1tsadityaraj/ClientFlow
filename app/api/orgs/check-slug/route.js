import { prisma } from "@/lib/prisma.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  
  if (!slug) {
    return Response.json({ error: 'Slug required' }, { status: 400 })
  }

  const existing = await prisma.org.findUnique({
    where: { slug }
  })

  return Response.json({ available: !existing })
}
