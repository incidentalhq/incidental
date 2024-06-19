import { render, screen, waitFor } from '@testing-library/react'

import { withAllTheProviders } from '@/utils/tests'

import Dashboard from './Dashboard'

describe('<Dashboard />', async () => {
  it('should render', async () => {
    render(withAllTheProviders(<Dashboard />))

    await waitFor(async () => {
      const rows = await screen.findAllByTestId('incident-row')
      expect(rows.length).toBe(1)
    })
  })
})
