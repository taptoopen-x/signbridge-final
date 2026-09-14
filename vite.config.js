import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
            },
            includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
            manifest: {
                name: 'SignBridge - AI Two-Way ISL Communication',
                short_name: 'SignBridge',
                description: 'AI-Powered Two-Way Indian Sign Language Communication System',
                theme_color: '#0B1220',
                background_color: '#0B1220',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
    server: {
        host: true,
        port: 5173
    }
});
