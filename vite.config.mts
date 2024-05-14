/// <reference types="vitest" />
// Plugins
import Components from 'unplugin-vue-components/vite';
import Vue from '@vitejs/plugin-vue';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import ViteFonts from 'unplugin-fonts/vite';
import bodyParser from 'body-parser';

// Utilities
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

let initialPageRequestMark: number;

const InitialPageRequestMarker = () => ({
  name: 'initial-page-request-marker',
  configureServer(server) {
    server.middlewares.use((request, _response, next) => {
      if (request.url === '/') {
        initialPageRequestMark = Date.now();
      }
      next();
    });
  },
});

const InitialGridConstructionLatencyMeasurer = () => ({
  name: 'initial-grid-construction-latency-measurer',
  configureServer(server) {
    server.middlewares.use(bodyParser.json());

    server.middlewares.use((request, response, next) => {
      if (request.url === '/measure-initial-grid-construction-latency') {
        if (initialPageRequestMark !== undefined) {
          const completedInitialImageDataGridConstructionMark =
            +request.body.completedInitialImageDataGridConstructionMark;
          console.log(
            'Initial grid construction latency measure:',
            completedInitialImageDataGridConstructionMark -
              initialPageRequestMark
          );
          initialPageRequestMark = undefined;
        }

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ message: 'Request received' }));
      } else {
        next();
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify(),
    Components(),
    ViteFonts({
      google: {
        families: [
          {
            name: 'Roboto',
            styles: 'wght@100;300;400;500;700;900',
          },
        ],
      },
    }),
    InitialPageRequestMarker(),
    InitialGridConstructionLatencyMeasurer(),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@test': fileURLToPath(new URL('./test', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
