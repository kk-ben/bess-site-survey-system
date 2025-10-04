import { render, screen } from '@testing-library/react'
import { Modal } from '../../components/common/Modal'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen={true} onClose={() => { }}>
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
