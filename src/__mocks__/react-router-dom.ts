import { vi } from 'vitest'

export default {
  ...vi.importActual('react-router-dom'),
  useParams: vi.fn(),
}
