import { fileURLToPath, URL } from 'node:url';
import { defineProject } from 'vitest/config';

export default defineProject({
	test: {
		environment: 'node',
		globals: true,
		// Include unit tests co-located with source files and integration tests in tests/ folder
		include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
		// Exclude node_modules and dist
		exclude: ['**/node_modules/**', '**/dist/**']
	},
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	}
});
