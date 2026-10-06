// vite.config.js
import { defineConfig } from "file:///C:/Users/win10/Desktop/corefusion/CF/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/win10/Desktop/corefusion/CF/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import { reticle } from "file:///C:/Users/win10/Desktop/corefusion/CF/frontend/node_modules/@reticlehq/vite-plugin/dist/index.js";
var API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET || "http://localhost:8000";
var BASE_PATH = process.env.VITE_BASE_PATH || "/";
var vite_config_default = defineConfig({
  base: BASE_PATH,
  plugins: [reticle({ captureNetworkBodies: true }), react()],
  build: {
    target: "esnext",
    minify: "esbuild",
    chunkSizeWarningLimit: 1e3,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"]
        }
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"]
  },
  server: {
    port: 5173,
    watch: {
      ignored: ["**/public/**"]
    },
    proxy: {
      // Frontend code calls relative paths like `/api/v1/services`.
      // In dev, Vite forwards those to the FastAPI backend below, so no
      // CORS configuration is needed. In production, point your reverse
      // proxy (nginx, etc.) at the backend the same way -- see README.
      "/api": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, status_code: 503, message: "Backend service offline. Start backend with uvicorn on port 8000." }));
            }
          });
        }
      },
      "/uploads": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(503, { "Content-Type": "text/plain" });
              res.end("Backend storage service offline");
            }
          });
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    css: true,
    // e2e/ holds Playwright specs, not Vitest ones — same `*.spec.js` naming
    // convention, different `test`/`expect` runtime (Playwright's, not
    // Vitest's), so it must never be collected here. Extends (not replaces)
    // Vitest's own default exclude list.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "e2e/**"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx3aW4xMFxcXFxEZXNrdG9wXFxcXGNvcmVmdXNpb25cXFxcQ0ZcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHdpbjEwXFxcXERlc2t0b3BcXFxcY29yZWZ1c2lvblxcXFxDRlxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvd2luMTAvRGVza3RvcC9jb3JlZnVzaW9uL0NGL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcblxyXG5pbXBvcnQgeyByZXRpY2xlIH0gZnJvbSAnQHJldGljbGVocS92aXRlLXBsdWdpbic7XHJcbi8vIEJhY2tlbmQgdGFyZ2V0IGZvciB0aGUgZGV2LXNlcnZlciBwcm94eS4gT3ZlcnJpZGUgd2l0aDpcclxuLy8gICBWSVRFX0FQSV9QUk9YWV9UQVJHRVQ9aHR0cDovL2xvY2FsaG9zdDo4MDAwIG5wbSBydW4gZGV2XHJcbmNvbnN0IEFQSV9QUk9YWV9UQVJHRVQgPSBwcm9jZXNzLmVudi5WSVRFX0FQSV9QUk9YWV9UQVJHRVQgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCc7XHJcbmNvbnN0IEJBU0VfUEFUSCA9IHByb2Nlc3MuZW52LlZJVEVfQkFTRV9QQVRIIHx8ICcvJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogQkFTRV9QQVRILFxyXG4gIHBsdWdpbnM6IFtyZXRpY2xlKHsgY2FwdHVyZU5ldHdvcmtCb2RpZXM6IHRydWUgfSkscmVhY3QoKV0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICBtaW5pZnk6ICdlc2J1aWxkJyxcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTczLFxyXG4gICAgd2F0Y2g6IHtcclxuICAgICAgaWdub3JlZDogWycqKi9wdWJsaWMvKionXSxcclxuICAgIH0sXHJcbiAgICBwcm94eToge1xyXG4gICAgICAvLyBGcm9udGVuZCBjb2RlIGNhbGxzIHJlbGF0aXZlIHBhdGhzIGxpa2UgYC9hcGkvdjEvc2VydmljZXNgLlxyXG4gICAgICAvLyBJbiBkZXYsIFZpdGUgZm9yd2FyZHMgdGhvc2UgdG8gdGhlIEZhc3RBUEkgYmFja2VuZCBiZWxvdywgc28gbm9cclxuICAgICAgLy8gQ09SUyBjb25maWd1cmF0aW9uIGlzIG5lZWRlZC4gSW4gcHJvZHVjdGlvbiwgcG9pbnQgeW91ciByZXZlcnNlXHJcbiAgICAgIC8vIHByb3h5IChuZ2lueCwgZXRjLikgYXQgdGhlIGJhY2tlbmQgdGhlIHNhbWUgd2F5IC0tIHNlZSBSRUFETUUuXHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogQVBJX1BST1hZX1RBUkdFVCxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJlOiAocHJveHkpID0+IHtcclxuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXMgJiYgIXJlcy5oZWFkZXJzU2VudCkge1xyXG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAzLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IGZhbHNlLCBzdGF0dXNfY29kZTogNTAzLCBtZXNzYWdlOiAnQmFja2VuZCBzZXJ2aWNlIG9mZmxpbmUuIFN0YXJ0IGJhY2tlbmQgd2l0aCB1dmljb3JuIG9uIHBvcnQgODAwMC4nIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgJy91cGxvYWRzJzoge1xyXG4gICAgICAgIHRhcmdldDogQVBJX1BST1hZX1RBUkdFVCxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJlOiAocHJveHkpID0+IHtcclxuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXMgJiYgIXJlcy5oZWFkZXJzU2VudCkge1xyXG4gICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAzLCB7ICdDb250ZW50LVR5cGUnOiAndGV4dC9wbGFpbicgfSk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZCgnQmFja2VuZCBzdG9yYWdlIHNlcnZpY2Ugb2ZmbGluZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHRlc3Q6IHtcclxuICAgIGdsb2JhbHM6IHRydWUsXHJcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcclxuICAgIHNldHVwRmlsZXM6IFsnLi9zcmMvdGVzdC9zZXR1cC5qcyddLFxyXG4gICAgY3NzOiB0cnVlLFxyXG4gICAgLy8gZTJlLyBob2xkcyBQbGF5d3JpZ2h0IHNwZWNzLCBub3QgVml0ZXN0IG9uZXMgXHUyMDE0IHNhbWUgYCouc3BlYy5qc2AgbmFtaW5nXHJcbiAgICAvLyBjb252ZW50aW9uLCBkaWZmZXJlbnQgYHRlc3RgL2BleHBlY3RgIHJ1bnRpbWUgKFBsYXl3cmlnaHQncywgbm90XHJcbiAgICAvLyBWaXRlc3QncyksIHNvIGl0IG11c3QgbmV2ZXIgYmUgY29sbGVjdGVkIGhlcmUuIEV4dGVuZHMgKG5vdCByZXBsYWNlcylcclxuICAgIC8vIFZpdGVzdCdzIG93biBkZWZhdWx0IGV4Y2x1ZGUgbGlzdC5cclxuICAgIGV4Y2x1ZGU6IFtcclxuICAgICAgJyoqL25vZGVfbW9kdWxlcy8qKicsICcqKi9kaXN0LyoqJywgJyoqL2N5cHJlc3MvKionLFxyXG4gICAgICAnKiovLntpZGVhLGdpdCxjYWNoZSxvdXRwdXQsdGVtcH0vKionLFxyXG4gICAgICAnKiove2thcm1hLHJvbGx1cCx3ZWJwYWNrLHZpdGUsdml0ZXN0LGplc3QsYXZhLGJhYmVsLG55YyxjeXByZXNzLHRzdXAsYnVpbGR9LmNvbmZpZy4qJyxcclxuICAgICAgJ2UyZS8qKicsXHJcbiAgICBdLFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVVLFNBQVMsb0JBQW9CO0FBQ3BXLE9BQU8sV0FBVztBQUVsQixTQUFTLGVBQWU7QUFHeEIsSUFBTSxtQkFBbUIsUUFBUSxJQUFJLHlCQUF5QjtBQUM5RCxJQUFNLFlBQVksUUFBUSxJQUFJLGtCQUFrQjtBQUVoRCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTLENBQUMsUUFBUSxFQUFFLHNCQUFzQixLQUFLLENBQUMsR0FBRSxNQUFNLENBQUM7QUFBQSxFQUN6RCxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUix1QkFBdUI7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFFBQ25EO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLEVBQ3BEO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxTQUFTLENBQUMsY0FBYztBQUFBLElBQzFCO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFdBQVcsQ0FBQyxVQUFVO0FBQ3BCLGdCQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssS0FBSyxRQUFRO0FBQ25DLGdCQUFJLE9BQU8sQ0FBQyxJQUFJLGFBQWE7QUFDM0Isa0JBQUksVUFBVSxLQUFLLEVBQUUsZ0JBQWdCLG1CQUFtQixDQUFDO0FBQ3pELGtCQUFJLElBQUksS0FBSyxVQUFVLEVBQUUsU0FBUyxPQUFPLGFBQWEsS0FBSyxTQUFTLG9FQUFvRSxDQUFDLENBQUM7QUFBQSxZQUM1STtBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxXQUFXLENBQUMsVUFBVTtBQUNwQixnQkFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLEtBQUssUUFBUTtBQUNuQyxnQkFBSSxPQUFPLENBQUMsSUFBSSxhQUFhO0FBQzNCLGtCQUFJLFVBQVUsS0FBSyxFQUFFLGdCQUFnQixhQUFhLENBQUM7QUFDbkQsa0JBQUksSUFBSSxpQ0FBaUM7QUFBQSxZQUMzQztBQUFBLFVBQ0YsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVksQ0FBQyxxQkFBcUI7QUFBQSxJQUNsQyxLQUFLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtMLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFBc0I7QUFBQSxNQUFjO0FBQUEsTUFDcEM7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
