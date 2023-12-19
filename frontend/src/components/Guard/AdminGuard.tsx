import { useEffect, useState } from 'react'

import useAuth from '@/hooks/useAuth'

interface Props {
  children: React.ReactElement
}

const AdminGuard: React.FC<Props> = ({ children }) => {
  const [redirect, setRedirect] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setRedirect(true)
      return
    }
    if (!user.isSuperAdmin) {
      setRedirect(true)
      return
    }
  }, [user])

  if (redirect) {
    return <>Not authorized</>
  }

  return children
}

export default AdminGuard
