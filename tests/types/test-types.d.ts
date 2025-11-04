/**
 * Type definitions for Browser MCP test framework
 */

declare global {
  function describe(name: string, fn: () => void | Promise<void>): void;
  function test(name: string, fn: () => void | Promise<void>): void;
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;
  
  // Node.js process global
  var process: {
    env: {
      [key: string]: string | undefined;
    };
    exit(code?: number): never;
    argv: string[];
  };
  
  // Node.js require/module
  var require: {
    main: any;
  };
  
  var module: {
    [key: string]: any;
  };
}

export {};
