import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import AutoImportComponents from './plugins/auto-import-components'


export default defineConfig({
  plugins: [
    tailwindcss(),
    AutoImportComponents(),
    AutoImport({
      imports: [
        {
          'lit': [
            'html',
            'css',
            'LitElement',
            'nothing',
            'render'
          ],
          'lit/decorators.js': [
            'customElement',
            'property',
            'state',
            'query',
          ],
          'lit/directives/map.js': [
            'map',
          ],
          'lit/directives/ref.js': [
            'createRef',
            'ref'
          ],
          '@lit/task': [
            'Task',
            'TaskStatus',
          ],
          '@lit/context': [
            'provide',
            'consume',
            'createContext',
          ],
          '@lit-labs/router': [
            'Router',
            'Routes',
          ],
        }
      ],
      dirs: [
        './src/utils',
        './src/libs',
        './src/contexts',
        './src/components',
        './src/mixins',
        './src/directives'
      ],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
})
