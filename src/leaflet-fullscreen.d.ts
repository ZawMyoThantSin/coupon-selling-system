import 'leaflet';

declare module 'leaflet' {
  namespace control {
    function fullscreen(options?: FullscreenOptions): Control.Fullscreen;
  }

  namespace Control {
    interface Fullscreen extends Control {
      toggle(): void;
    }
  }

  interface FullscreenOptions {
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    title?: string;
    titleCancel?: string;
    forceSeparateButton?: boolean;
    forcePseudoFullscreen?: boolean;
    fullscreenElement?: boolean;
  }
}
