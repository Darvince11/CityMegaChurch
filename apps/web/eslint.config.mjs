import { defineConfig } from 'eslint/config';
import cdpConfig from '@cdp/eslint-config';

export default defineConfig([{ ignores: ['.next/**', '.next-*/**'] }, ...cdpConfig]);
