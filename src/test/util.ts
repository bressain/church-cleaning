import { vi } from 'vitest'
import type { Connection } from '../db/common'

export function createMockConnection(): Connection {
	return {
		all: vi.fn(),
		exec: vi.fn(),
		get: vi.fn(),
		run: vi.fn(),
		close: vi.fn(),
	}
}
