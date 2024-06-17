import {render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import { expect, describe, it } from "vitest"
import App from "./App"

describe('<App />', async () => {

  it("Should show login", async () => {
    render(<App />)

    const loginSelector = await screen.findByTestId("login-selector")
    expect(loginSelector).toBeInTheDocument()
  })
})

