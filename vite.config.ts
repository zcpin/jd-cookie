import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import {resolve} from "path";
import {viteStaticCopy} from "vite-plugin-static-copy";
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            imports: ['vue'],
            dts: true,
        }),
        viteStaticCopy({
            targets: [
                {
                    src: "src/manifest.json",
                    dest: "",
                    transform: async (contents) => {
                        const manifest = JSON.parse(contents.toString())
                        manifest.background.service_worker = "assets/background.js"
                        manifest.content_scripts[0].js = ["assets/content.js"]
                        return JSON.stringify(manifest, null, 2)
                    }
                },
                {
                    src: "src/assets/images/*",
                    dest: "assets/images/"
                },
            ]
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),

    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        rollupOptions: {
            input: {
                panel: resolve(__dirname, 'public/index.html'),
                background: resolve(__dirname, 'src/background.ts'),
                content: resolve(__dirname, 'src/content.ts'),
            },
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`
            }
        },
        emptyOutDir: true,
        outDir: resolve(__dirname, 'dist')
    }
})
