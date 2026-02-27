import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');

await esbuild.build({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    outfile: 'out/extension.js',
    external: ['vscode'],
    sourcemap: !production,
    minify: production,
    logLevel: 'info',
});
