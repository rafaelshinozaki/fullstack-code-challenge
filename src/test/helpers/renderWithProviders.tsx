import { render } from '@testing-library/react'
import {
  MemoryRouter,
  RouterProvider,
  createMemoryRouter,
} from 'react-router-dom'
import type { ReactElement } from 'react'

/**
 * Renders a component inside a MemoryRouter.
 * Use for components that use Link / NavLink but no URL params.
 */
export function renderInRouter(ui: ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

/**
 * Renders a page component inside a createMemoryRouter so that
 * useParams() and useLocation() receive real values.
 *
 * @param element   — The page element to render
 * @param pattern   — The route pattern, e.g. '/quiz/:quizId'
 * @param pathname  — The actual URL,      e.g. '/quiz/test-quiz'
 * @param state     — Optional router location state (for Results page)
 */
export function renderAtRoute(
  element: ReactElement,
  pattern: string,
  pathname: string,
  state?: unknown,
) {
  const router = createMemoryRouter([{ path: pattern, element }], {
    initialEntries: [state != null ? { pathname, state } : pathname],
  })
  return render(<RouterProvider router={router} />)
}
