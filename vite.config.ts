import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
    plugins: [
        nodePolyfills(),
        dts({ rollupTypes: false }),
    ],
    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'src/carmentis-sdk-templating.ts'),
            name: 'CarmentisSDKTemplating',
            formats: ['es', 'cjs'],
            fileName: (format) => `carmentis-sdk-templating.${format === 'es' ? 'js' : 'cjs'}`,
        },
        sourcemap: false,
    },
})
