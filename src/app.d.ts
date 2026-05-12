// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  /**
   * Global constant that is true during SSR.
   */
  const __STATIC__: boolean;
}

declare module 'svelte/elements' {
  interface HTMLAttributes<T> {
    /**
     * Marker attribute for the svelte-static-regions plugin.
     * Elements carrying this attribute will be rendered to static HTML at
     * build time and stripped of this attribute in the final output.
     */
    static?: true;
  }
}

export {};
