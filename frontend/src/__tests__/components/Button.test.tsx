import { render, screen } from '@testing-library/react'
import { Button } from '../../components/common/Button'

describe('Button', () => {
  it('renders', () => {
    render(<Button>Test</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
