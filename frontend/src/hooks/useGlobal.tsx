import { createContext, useCallback, useContext, useState } from 'react'

import {
  IForm,
  IIncidentSeverity,
  IIncidentStatus,
  IIncidentType,
  IOrganisation,
  IOrganisationDetail
} from '@/types/models'

const useGlobalProvider = () => {
  const [organisation, setOrganisation] = useState<IOrganisation>()
  const [statusList, setStatusList] = useState<IIncidentStatus[]>([])
  const [severityList, setSeverityList] = useState<IIncidentSeverity[]>([])
  const [forms, setForms] = useState<IForm[]>([])
  const [incidentTypes, setIncidentTypes] = useState<IIncidentType[]>([])
  const [organisationDetails, setOrganisationDetails] = useState<IOrganisationDetail[]>([])

  const setCurrentOrganisation = useCallback((organisationDetail: IOrganisationDetail) => {
    setOrganisation(organisationDetail.organisation)
    setStatusList(organisationDetail.statusList)
    setSeverityList(organisationDetail.severityList)
    setForms(organisationDetail.forms)
    setIncidentTypes(organisationDetail.incidentTypes)
  }, [])

  return {
    organisationDetails,
    setOrganisationDetails,
    setCurrentOrganisation,
    organisation,
    setOrganisation,
    setStatusList,
    statusList,
    severityList,
    setSeverityList,
    forms,
    setForms,
    incidentTypes,
    setIncidentTypes
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
