import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { useApp } from '@/context/AppContext'
import ProfilePage from '@/pages/Profile'
import { renderInRouter } from '@/test/helpers/renderWithProviders'
import { makeAppContext, mockProfile } from '@/test/fixtures'

vi.mock('@/context/AppContext', () => ({ useApp: vi.fn() }))

// ─── Helpers ───────────────────────────────────────────────────────────────────

function render(overrides = {}) {
  vi.mocked(useApp).mockReturnValue(makeAppContext(overrides))
  return renderInRouter(<ProfilePage />)
}

// ─── Not logged in — creation form ────────────────────────────────────────────

describe('ProfilePage — not logged in', () => {
  beforeEach(() => {
    vi.mocked(useApp).mockReturnValue(makeAppContext({ profile: null }))
  })

  it('renders the "Create Your Profile" heading', () => {
    renderInRouter(<ProfilePage />)
    expect(screen.getByText('Create Your Profile')).toBeInTheDocument()
  })

  it('renders the username input', () => {
    renderInRouter(<ProfilePage />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderInRouter(<ProfilePage />)
    expect(
      screen.getByRole('button', { name: /create profile/i }),
    ).toBeInTheDocument()
  })

  it('shows a "required" error on submit with empty input', () => {
    renderInRouter(<ProfilePage />)
    fireEvent.click(screen.getByRole('button', { name: /create profile/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Username is required.')
  })

  it('shows a "too short" error for a 1-character username', () => {
    renderInRouter(<ProfilePage />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: /create profile/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('at least 2 characters')
  })

  it('shows an error for invalid characters', () => {
    renderInRouter(<ProfilePage />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'user<script>' },
    })
    fireEvent.blur(screen.getByRole('textbox'))
    expect(screen.getByRole('alert')).toHaveTextContent('letters, numbers')
  })

  it('calls login with trimmed username on valid submit', () => {
    const login = vi.fn()
    render({ profile: null, login })
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '  sarah  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create profile/i }))
    expect(login).toHaveBeenCalledWith('sarah')
  })

  it('does not call login when username is too short', () => {
    const login = vi.fn()
    render({ profile: null, login })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } })
    fireEvent.click(screen.getByRole('button', { name: /create profile/i }))
    expect(login).not.toHaveBeenCalled()
  })

  it('shows live character count', () => {
    renderInRouter(<ProfilePage />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'hello' },
    })
    expect(screen.getByText('5/20')).toBeInTheDocument()
  })
})

// ─── Logged in — profile view ─────────────────────────────────────────────────

describe('ProfilePage — logged in', () => {
  it('renders the username', () => {
    render({ profile: mockProfile })
    expect(screen.getByText(mockProfile.username)).toBeInTheDocument()
  })

  it('renders the "Reset Profile" button', () => {
    render({ profile: mockProfile })
    expect(
      screen.getByRole('button', { name: /reset profile/i }),
    ).toBeInTheDocument()
  })

  it('shows a confirmation dialog when Reset is clicked', () => {
    render({ profile: mockProfile })
    fireEvent.click(screen.getByRole('button', { name: /reset profile/i }))
    expect(
      screen.getByRole('button', { name: /yes, reset everything/i }),
    ).toBeInTheDocument()
  })

  it('hides the confirmation dialog when Cancel is clicked', () => {
    render({ profile: mockProfile })
    fireEvent.click(screen.getByRole('button', { name: /reset profile/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(
      screen.queryByRole('button', { name: /yes, reset everything/i }),
    ).not.toBeInTheDocument()
  })

  it('calls logout when the confirmation is accepted', () => {
    const logout = vi.fn()
    render({ profile: mockProfile, logout })
    fireEvent.click(screen.getByRole('button', { name: /reset profile/i }))
    fireEvent.click(screen.getByRole('button', { name: /yes, reset everything/i }))
    expect(logout).toHaveBeenCalledOnce()
  })

  it('renders a link to Dashboard', () => {
    render({ profile: mockProfile })
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })
})
