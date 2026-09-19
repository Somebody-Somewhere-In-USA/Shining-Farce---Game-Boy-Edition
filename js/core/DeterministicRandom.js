(function (G) {
  "use strict";
  // Same 32-bit LCG as the existing serialized recruitment stream.
  const isSeed = value => Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
  function create(seed) {
    if (!isSeed(seed)) throw new Error("Invalid deterministic seed");
    return { state: seed };
  }
  function step(seed) {
    if (!isSeed(seed)) throw new Error("Invalid deterministic seed");
    return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  }
  function integer(rng, minimum, maximum) {
    if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) || minimum > maximum) throw new Error("Invalid random range");
    rng.state = step(rng.state);
    return minimum + Math.floor((rng.state / 4294967296) * (maximum - minimum + 1));
  }
  function seedFromId(id) {
    let seed = 2166136261;
    for (const character of String(id)) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
    return seed;
  }
  G.core.DeterministicRandom = { create, step, integer, seedFromId, isSeed };
}(window.GBTRPG));
