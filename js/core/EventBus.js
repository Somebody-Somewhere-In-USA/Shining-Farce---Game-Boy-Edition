(function (G) {
  "use strict";

  class EventBus {
    constructor() {
      this.listeners = new Map();
    }

    on(eventName, listener) {
      if (!this.listeners.has(eventName)) {
        this.listeners.set(eventName, new Set());
      }

      this.listeners.get(eventName).add(listener);
      return () => this.listeners.get(eventName)?.delete(listener);
    }

    emit(eventName, payload) {
      // A presentation subscriber cannot interrupt an already committed transaction.
      [...(this.listeners.get(eventName) || [])].forEach((listener) => {
        try { listener(payload); } catch (error) { console.error("Event listener failed: " + eventName, error); }
      });
    }
  }

  G.core.EventBus = EventBus;
}(window.GBTRPG));
