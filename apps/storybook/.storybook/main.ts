import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-native-web-vite';
import remarkGfm from 'remark-gfm';

const require = createRequire(import.meta.url);

// react-native → react-native-web + un TurboModuleRegistry vacío (ver el shim).
// Va como plugin `pre` y como plugin de esbuild para ganarle al alias del
// framework tanto en el código fuente como en el pre-bundle de dependencias.
const RN_SHIM = fileURLToPath(new URL('./react-native-web-shim.js', import.meta.url));

const config: StorybookConfig = {
  stories: ['../docs/**/*.mdx', '../../../packages/ui/src/**/*.stories.@(ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      // Tablas de Markdown (GFM) en los MDX.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
  ],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {},
  },
  viteFinal: (vite) => {
    vite.plugins = [
      {
        name: 'beefficient:react-native-shim',
        enforce: 'pre',
        resolveId: (id) => (id === 'react-native' ? RN_SHIM : null),
      },
      ...(vite.plugins ?? []),
    ];
    vite.optimizeDeps ??= {};
    vite.optimizeDeps.esbuildOptions ??= {};
    vite.optimizeDeps.esbuildOptions.plugins = [
      {
        name: 'beefficient:react-native-shim',
        setup: (build) => build.onResolve({ filter: /^react-native$/ }, () => ({ path: RN_SHIM })),
      },
      ...(vite.optimizeDeps.esbuildOptions.plugins ?? []),
    ];
    // react-native-svg (web) importa el registro de assets de React Native, que
    // RN 0.88 ya no instala y que además es CommonJS. react-native-web trae uno
    // equivalente en ESM.
    vite.resolve ??= {};
    vite.resolve.alias = [
      ...(Array.isArray(vite.resolve.alias)
        ? vite.resolve.alias
        : Object.entries(vite.resolve.alias ?? {}).map(([find, replacement]) => ({ find, replacement }))),
      {
        find: '@react-native/assets-registry/registry',
        replacement: require.resolve('react-native-web/dist/modules/AssetRegistry/index.js'),
      },
    ];
    return vite;
  },
};

export default config;
