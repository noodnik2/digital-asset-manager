import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

// App imports mockServices directly; tests run against the real mock service state.
// Each test file gets an isolated module scope so state resets between files.

describe('App', () => {
  it('renders the library pane as the default active pane', async () => {
    render(<App />)
    await screen.findByRole('main')
    expect(screen.getByRole('main')).toHaveClass('pane--active')
  })

  it('renders the working-set pane alongside the library', async () => {
    render(<App />)
    await screen.findByRole('main')
    expect(screen.getByRole('complementary')).toBeInTheDocument()
  })

  it('⌘2 switches active pane to working set', async () => {
    render(<App />)
    await screen.findByRole('main')
    fireEvent.keyDown(document, { key: '2', metaKey: true })
    expect(screen.getByRole('complementary')).toHaveClass('pane--active')
    expect(screen.getByRole('main')).not.toHaveClass('pane--active')
  })

  it('⌘1 switches active pane back to library', async () => {
    render(<App />)
    await screen.findByRole('main')
    fireEvent.keyDown(document, { key: '2', metaKey: true })
    fireEvent.keyDown(document, { key: '1', metaKey: true })
    expect(screen.getByRole('main')).toHaveClass('pane--active')
    expect(screen.getByRole('complementary')).not.toHaveClass('pane--active')
  })

  it('ignores keydown without meta modifier', async () => {
    render(<App />)
    await screen.findByRole('main')
    fireEvent.keyDown(document, { key: '2', metaKey: false })
    expect(screen.getByRole('main')).toHaveClass('pane--active')
  })

  it('ignores unrelated meta-key combos', async () => {
    render(<App />)
    await screen.findByRole('main')
    fireEvent.keyDown(document, { key: '3', metaKey: true })
    expect(screen.getByRole('main')).toHaveClass('pane--active')
  })

  it('clicking a pane makes it active', async () => {
    render(<App />)
    await screen.findByRole('main')
    fireEvent.click(screen.getByRole('complementary'))
    expect(screen.getByRole('complementary')).toHaveClass('pane--active')
  })

  it('removes keydown listener on unmount', async () => {
    const spy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(<App />)
    await screen.findByRole('main')
    unmount()
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
    spy.mockRestore()
  })
})
