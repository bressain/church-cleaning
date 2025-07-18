import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		dir: './src',
		include: ['**/*.test.integration.ts'],
		globals: true,
		globalSetup: './test/init-integration-globals.ts',
		setupFiles: './test/init-integration.ts',
		fileParallelism: false,
	},
})
