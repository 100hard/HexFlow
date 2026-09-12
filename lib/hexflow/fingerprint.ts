/**
 * HexFlow Deterministic Fingerprinting
 * Reference: 03_EXECUTION_MODEL.md (Section 4, 5, 6)
 * 
 * Computes: hash(normalizedGraphInputs + normalizedConfiguration)
 * Excludes transient UI states (x, y coordinates, zoom, open tabs, etc.)
 */

function sortKeysDeep(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortKeysDeep);
  }
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, any>, key) => {
      // Exclude transient properties
      if (["position", "selected", "dragging", "width", "height", "x", "y"].includes(key)) {
        return result;
      }
      result[key] = sortKeysDeep(obj[key]);
      return result;
    }, {});
}

// Simple fast deterministic 32-bit FNV-1a hash
function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function computeNodeFingerprint(
  nodeType: string | undefined,
  config: Record<string, any>,
  resolvedInputs: Record<string, any>
): string {
  const normalized = {
    type: nodeType || "unknown",
    config: sortKeysDeep(config || {}),
    inputs: sortKeysDeep(resolvedInputs || {}),
  };
  const serialized = JSON.stringify(normalized);
  return fnv1a(serialized);
}
