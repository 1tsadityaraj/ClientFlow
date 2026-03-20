"use client"
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Breadcrumb({ project }) {
  const pathname = usePathname()
  
  const crumbs = []
  
  if (pathname === '/dashboard') {
    crumbs.push({ label: 'Overview' })
  } else if (pathname.includes('/projects/')) {
    crumbs.push({ label: 'Projects', href: '/dashboard' })
    crumbs.push({ label: project?.name || 'Project' })
  } else if (pathname.includes('/members')) {
    crumbs.push({ label: 'Members' })
  } else if (pathname.includes('/settings')) {
    crumbs.push({ label: 'Settings' })
  } else if (pathname.includes('/activity')) {
    crumbs.push({ label: 'Activity' })
  } else if (pathname.includes('/chat')) {
    crumbs.push({ label: 'Team Chat' })
  }

  if (crumbs.length === 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '0 24px', paddingTop: 16 }}>
      {crumbs.map((crumb, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span style={{ color: '#6b6b8a', fontSize: 12 }}>›</span>}
          {crumb.href ? (
            <Link href={crumb.href} 
              style={{ color: '#6b6b8a', fontSize: 12, textDecoration: 'none' }}>
              {crumb.label}
            </Link>
          ) : (
            <span style={{ color: '#9090b0', fontSize: 12, fontWeight: 600 }}>
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </div>
  )
}
