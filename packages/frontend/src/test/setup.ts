import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with @testing-library/jest-dom's matchers
expect.extend(matchers as never)

// Clean up after each test
afterEach(() => {
  cleanup()
})  