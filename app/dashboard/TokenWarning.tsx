'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export function TokenWarning() {
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/meta/token')
      .then((r) => r.json())
      .then((data) => {
        if (!data.valid) {
          setWarning('Meta access token is invalid or expired. Update your META_ACCESS_TOKEN.')
        } else if (data.daysUntilExpiry !== null && data.daysUntilExpiry <= 7) {
          setWarning(
            `Meta access token expires in ${data.daysUntilExpiry} day${data.daysUntilExpiry === 1 ? '' : 's'}. Refresh it soon.`
          )
        }
      })
      .catch(() => {})
  }, [])

  if (!warning) return null

  return (
    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2.5 rounded-lg text-sm dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {warning}
    </div>
  )
}
