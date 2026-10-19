export * from './dto/auth';
export * from './dto/camp-content';
export * from './errors/domain-error';
// Export the same validator error class used by the shared schemas, including
// when a consumer loads this package through CommonJS from an ES module.
export { ZodError } from 'zod';
