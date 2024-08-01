import { createContext, useCallback, useContext, useState } from 'react'

import { IForm, IOrganisation, IOrganisationDetail } from '@/types/models'

const useGlobalProvider = () => {
  const [organisation, setOrganisation] = useState<IOrganisation>()
  const [forms, setForms] = useState<IForm[]>([])
  const [organisationDetails, setOrganisationDetails] = useState<IOrganisationDetail[]>([])

  const setCurrentOrganisation = useCallback((organisationDetail: IOrganisationDetail) => {
    setOrganisation(organisationDetail.organisation)
    setForms(organisationDetail.forms)
  }, [])

  return {
    organisationDetails,
    setOrganisationDetails,
    setCurrentOrganisation,
    organisation,
    setOrganisation,
    forms,
    setForms
  }
}

// Create a type from the return values of _useDataProvider
type GlobalContextType = ReturnType<typeof useGlobalProvider>

// Main context provider
const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

type Props = {
  children?: React.ReactNode
}

// Provides data for a single spreadsheet component
export const GlobalProvider: React.FC<Props> = ({ children }) => {
  const value = useGlobalProvider()
  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
}

const useGlobal = () => {
  const context = useContext(GlobalContext)

  if (context === undefined) {
    throw new Error('Global context is undefined')
  }

  return context
}

export default useGlobal
