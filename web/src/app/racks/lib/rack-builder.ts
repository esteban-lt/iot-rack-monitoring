// Procedural industrial pallet rack.
// Units: meters. Y up. Front (aisle side) faces +Z. Origin: base center, floor level.
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Object3D,
} from 'three';

export type MaterialName = 'Frame_Steel' | 'Beam_Orange' | 'Shelf_Deck' | 'Cargo_Box' | 'Sensor_Body' | 'Sensor_Status';

export interface RackParams {
  levels: number;
  uprights: number;        // posts across the width; 2 = one bay
  autoUprights: boolean;   // derive `uprights` from width and maxBeamLength
  maxBeamLength: number;
  height: number;
  width: number;
  depth: number;
  postSize: number;
  firstLevel: number;      // top of the first level beams above the floor
  sensorPost: number;      // 1 = leftmost post seen from the aisle
  sensorSide: 'front' | 'back';
  sensorHeight: number | null;   // null = just below the top
  cargoType: 'auto' | 'boxes' | 'pallets';
  cargoDensity: number;    // 0..1 share of cargo positions that are occupied
  includeCargo: boolean;
  colors: Record<MaterialName, string>;
}

export type ResolvedRackParams = RackParams & { sensorHeight: number };

export const DEFAULTS: RackParams = {
  levels: 4,
  uprights: 2,
  autoUprights: false,
  maxBeamLength: 2.7,
  height: 2.4,
  width: 1.8,
  depth: 0.9,
  postSize: 0.08,
  firstLevel: 0.2,
  sensorPost: 2,
  sensorSide: 'front',
  sensorHeight: null,
  cargoType: 'auto',
  cargoDensity: 1,
  includeCargo: true,
  colors: {
    Frame_Steel: '#79828d',
    Beam_Orange: '#f26a1b',
    Shelf_Deck: '#a4acb5',
    Cargo_Box: '#c09a68',
    Sensor_Body: '#33404f',
    Sensor_Status: '#2fd673',
  },
};

// Secondary dimensions, in meters unless noted
export const DETAIL = {
  chamfer: 0.004,
  slotPitch: 0.075,
  slotHeight: 0.032,
  slotWidthRatio: 0.32,
  slotRelief: 0.002,
  slotShade: 0.42,
  braceRatio: 0.4,
  braceMargin: 0.12,
  footPlateThickness: 0.008,
  footPlateXRatio: 1.9,
  footPlateZRatio: 1.5,
  boltRadius: 0.011,
  boltHeight: 0.01,
  beamHeight: 0.1,
  beamDepth: 0.05,
  bracketThickness: 0.008,
  bracketExtra: 0.05,
  deckThickness: 0.02,
  deckDrop: 0.004,
  deckPanelTarget: 0.6,
  deckGap: 0.006,
  deckBarSize: 0.03,
  sensorScale: 1.5,        // enlarged so the LED reads at card size
  sensorDrop: 0.22,
  cargoSeed: 7,
  cargoMaxHeight: 0.9,
  palletWidth: 1.0,
  palletDepth: 1.2,
  palletHeight: 0.144,
  palletGap: 0.06,
  palletMinClear: 0.7,     // 'auto' switches to pallets from this clearance
  palletLoadMax: 1.5,
  palletLayer: 0.32,
  maxUprights: 10,
  cargoBoxTarget: 0.45,
  minBay: 0.4,
  cargoChamfer: 0.006,
};

const MATERIAL_SPECS: Record<MaterialName, { metalness: number; roughness: number; vertexColors?: boolean; emissive?: boolean }> = {
  Frame_Steel: { metalness: 0.25, roughness: 0.55, vertexColors: true },
  Beam_Orange: { metalness: 0.1, roughness: 0.6 },
  Shelf_Deck: { metalness: 0.3, roughness: 0.5 },
  Cargo_Box: { metalness: 0, roughness: 0.9, vertexColors: true },
  Sensor_Body: { metalness: 0.1, roughness: 0.65 },
  Sensor_Status: { metalness: 0, roughness: 0.4, emissive: true },
};

export const MATERIAL_NAMES = Object.keys(MATERIAL_SPECS) as MaterialName[];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const maxUprights = (params: Pick<RackParams, 'width' | 'postSize'>, wanted = Infinity) => {
  const fit = Math.floor((params.width - params.postSize) / (params.postSize + DETAIL.minBay)) + 1;
  return Math.max(2, Math.min(wanted, fit));
};

export const wantedUprights = (params: RackParams) =>
  params.autoUprights
    ? Math.ceil((params.width - params.postSize) / (params.maxBeamLength + params.postSize)) + 1
    : params.uprights;

export const resolveParams = (input: Partial<RackParams> = {}): ResolvedRackParams => {
  const params = { ...DEFAULTS, ...input, colors: { ...DEFAULTS.colors, ...input.colors } };
  const levels = Math.max(1, Math.round(params.levels));
  const uprights = maxUprights(params, clamp(Math.round(wantedUprights(params)), 2, DETAIL.maxUprights));

  return {
    ...params,
    levels,
    uprights,
    sensorPost: clamp(Math.round(params.sensorPost), 1, uprights),
    sensorHeight: params.sensorHeight == null
      ? params.height - DETAIL.sensorDrop
      : clamp(params.sensorHeight, 0.2, params.height - 0.12),
    cargoDensity: clamp(params.cargoDensity, 0, 1),
  };
};

// Even spacing: every level (including the top one) gets the same clearance
export const levelLayout = (input: Partial<RackParams>) => {
  const params = resolveParams(input);
  const spacing = (params.height - params.firstLevel) / params.levels;
  const heights = Array.from({ length: params.levels }, (_, i) => +(params.firstLevel + i * spacing).toFixed(6));
  return { spacing, heights };
};

const shelfName = (i: number) => `Shelf_${String(i + 1).padStart(2, '0')}`;
const cargoName = (i: number) => `Cargo_${String(i + 1).padStart(2, '0')}`;

// Flat-shaded, indexed geometry with an optional per-vertex shade
const createBuilder = (useColor: boolean) => {
  const pos: number[] = [], nor: number[] = [], col: number[] = [], idx: number[] = [];
  const a = new Vector3(), b = new Vector3(), n = new Vector3(), c = new Vector3();

  const poly = (verts: Vector3[], center: Vector3, shade = 1) => {
    a.subVectors(verts[1], verts[0]);
    b.subVectors(verts[2], verts[0]);
    n.crossVectors(a, b);
    if (n.lengthSq() < 1e-16) return;
    n.normalize();
    c.set(0, 0, 0);
    for (const v of verts) c.add(v);
    c.multiplyScalar(1 / verts.length).sub(center);
    let list = verts;
    if (n.dot(c) < 0) { list = verts.slice().reverse(); n.negate(); }
    const base = pos.length / 3;
    const s = Math.round(clamp(shade, 0, 1) * 255);
    for (const v of list) {
      pos.push(v.x, v.y, v.z);
      nor.push(n.x, n.y, n.z);
      if (useColor) col.push(s, s, s, 255);
    }
    for (let k = 1; k < list.length - 1; k++) idx.push(base, base + k, base + k + 1);
  };

  // Box centered on the matrix origin, with all 12 edges chamfered by `ch`
  const box = (sx: number, sy: number, sz: number, ch: number, M: Matrix4, shade = 1) => {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2;
    const cc = clamp(ch, 0, Math.min(sx, sy, sz) * 0.3);
    const V = (x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(M);
    const center = V(0, 0, 0);
    const vx = (i: number, j: number, k: number) => V(i * hx, j * (hy - cc), k * (hz - cc));
    const vy = (i: number, j: number, k: number) => V(i * (hx - cc), j * hy, k * (hz - cc));
    const vz = (i: number, j: number, k: number) => V(i * (hx - cc), j * (hy - cc), k * hz);
    const S = [-1, 1];
    for (const i of S) poly([vx(i, -1, -1), vx(i, 1, -1), vx(i, 1, 1), vx(i, -1, 1)], center, shade);
    for (const j of S) poly([vy(-1, j, -1), vy(1, j, -1), vy(1, j, 1), vy(-1, j, 1)], center, shade);
    for (const k of S) poly([vz(-1, -1, k), vz(1, -1, k), vz(1, 1, k), vz(-1, 1, k)], center, shade);
    if (cc > 0) {
      for (const i of S) for (const k of S) poly([vx(i, -1, k), vx(i, 1, k), vz(i, 1, k), vz(i, -1, k)], center, shade);
      for (const j of S) for (const k of S) poly([vy(-1, j, k), vy(1, j, k), vz(1, j, k), vz(-1, j, k)], center, shade);
      for (const i of S) for (const j of S) poly([vx(i, j, -1), vx(i, j, 1), vy(i, j, 1), vy(i, j, -1)], center, shade);
      for (const i of S) for (const j of S) for (const k of S) poly([vx(i, j, k), vy(i, j, k), vz(i, j, k)], center, shade);
    }
  };

  // Prism around local Y (bolt heads, cable gland)
  const prism = (radius: number, height: number, segments: number, M: Matrix4, shade = 1) => {
    const V = (x: number, y: number, z: number) => new Vector3(x, y, z).applyMatrix4(M);
    const center = V(0, 0, 0);
    const top: Vector3[] = [], bottom: Vector3[] = [];
    for (let s = 0; s < segments; s++) {
      const t = (s / segments) * Math.PI * 2;
      top.push(V(Math.cos(t) * radius, height / 2, Math.sin(t) * radius));
      bottom.push(V(Math.cos(t) * radius, -height / 2, Math.sin(t) * radius));
    }
    for (let s = 0; s < segments; s++) {
      const s2 = (s + 1) % segments;
      poly([bottom[s], bottom[s2], top[s2], top[s]], center, shade);
    }
    poly(top, center, shade);
    poly(bottom, center, shade);
  };

  const toGeometry = () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(pos, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    if (useColor) geometry.setAttribute('color', new BufferAttribute(new Uint8Array(col), 4, true));
    geometry.setIndex(new BufferAttribute(pos.length / 3 > 65535 ? new Uint32Array(idx) : new Uint16Array(idx), 1));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  };

  return { poly, box, prism, toGeometry, count: () => pos.length / 3 };
};

type Builder = ReturnType<typeof createBuilder>;
type Random = (() => number) & { flip?: boolean };

interface Bay {
  cx: number;
  beamLen: number;
  deckSpan: number;
  panelCount: number;
  panelW: number;
}

const mulberry32 = (seed: number): Random => {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const createMaterials = (colors: Record<MaterialName, string>) =>
  Object.fromEntries(MATERIAL_NAMES.map((name) => {
    const spec = MATERIAL_SPECS[name];
    const material = new MeshStandardMaterial({
      name,
      color: new Color(colors[name]),
      metalness: spec.metalness,
      roughness: spec.roughness,
      vertexColors: !!spec.vertexColors,
    });
    if (spec.emissive) material.emissive = new Color(colors[name]);
    return [name, material];
  })) as Record<MaterialName, MeshStandardMaterial>;

export const buildRack = (input: Partial<RackParams> = {}) => {
  const P = resolveParams(input);
  const D = DETAIL;
  const { levels, height: H, width: W, depth: Dp, postSize: p, uprights } = P;
  const { spacing, heights } = levelLayout(P);
  const mats = createMaterials(P.colors);

  const at = (x: number, y: number, z: number) => new Matrix4().makeTranslation(x, y, z);
  const mesh = (name: string, builder: Builder, material: MeshStandardMaterial) => {
    const m = new Mesh(builder.toGeometry(), material);
    m.name = name;
    return m;
  };

  // Slots stand out by slotRelief, so the post face is pulled in by the same amount:
  // the overall depth stays exactly `depth`.
  const zFace = Dp / 2 - D.slotRelief;
  const xPost = W / 2 - p / 2;
  const zPost = zFace - p / 2;
  const uprightX = Array.from({ length: uprights }, (_, u) => -xPost + (u * 2 * xPost) / (uprights - 1));
  const zInner = zFace - D.beamDepth;

  const root = new Group();
  root.name = 'Rack_Root';

  // Frame: posts, perforations, side bracing, foot plates
  const frame = new Group();
  frame.name = 'Frame';
  const fb = createBuilder(true);

  uprightX.forEach((ux, u) => {
    const first = u === 0, last = u === uprights - 1;
    for (const sz of [-1, 1]) {
      fb.box(p, H, p, D.chamfer, at(ux, H / 2, sz * zPost));
      // perforations as one dark quad each, floating slotRelief off the face
      const zq = sz * (zFace + D.slotRelief), hw = (p * D.slotWidthRatio) / 2, hh = D.slotHeight / 2;
      for (let y = 0.06; y <= H - 0.04; y += D.slotPitch) {
        fb.poly([new Vector3(ux - hw, y - hh, zq), new Vector3(ux + hw, y - hh, zq),
                 new Vector3(ux + hw, y + hh, zq), new Vector3(ux - hw, y + hh, zq)], new Vector3(ux, y, 0), D.slotShade);
      }
      // foot plate: grows only toward neighbouring bays, so the footprint stays width x depth
      const reach = p * (D.footPlateXRatio - 0.5), flush = p / 2 - 0.001;
      const xMin = ux - (first ? flush : reach), xMax = ux + (last ? flush : reach);
      const pz = p * D.footPlateZRatio, t = D.footPlateThickness;
      fb.box(xMax - xMin, t, pz, D.chamfer, at((xMin + xMax) / 2, t / 2, sz * (zFace - 0.001 - pz / 2)));
      for (const dir of [-1, 1]) {
        if ((dir < 0 && first) || (dir > 0 && last)) continue;
        for (const zIn of [0.3, 1.2]) {
          fb.prism(D.boltRadius, D.boltHeight, 6,
            at(ux + dir * 0.95 * p, t + D.boltHeight / 2, sz * (zFace - zIn * p)), 0.8);
        }
      }
    }
    // side bracing: horizontals at each node, diagonals zig-zag between them
    const b = p * D.braceRatio;
    const y0 = D.braceMargin, y1 = H - D.braceMargin;
    const panels = Math.max(1, Math.round((y1 - y0) / (2 * zPost)));
    const nodeY = (k: number) => y0 + (k * (y1 - y0)) / panels;
    for (let k = 0; k <= panels; k++) {
      fb.box(b, b, 2 * zPost, 0, at(ux, nodeY(k), 0));
    }
    for (let k = 0; k < panels; k++) {
      const dir = k % 2 === 0 ? 1 : -1;
      const dy = nodeY(k + 1) - nodeY(k), dz = dir * 2 * zPost;
      const M = at(ux, (nodeY(k) + nodeY(k + 1)) / 2, 0)
        .multiply(new Matrix4().makeRotationX(-Math.atan2(dy, dz)));
      fb.box(b * 0.8, b, Math.hypot(dy, dz), 0, M);
    }
  });
  frame.add(mesh('Frame_Structure', fb, mats.Frame_Steel));
  root.add(frame);

  // Shelves: one group per level, origin at the top of its beams
  const bays: Bay[] = [];
  for (let u = 0; u < uprights - 1; u++) {
    const beamLen = uprightX[u + 1] - uprightX[u] - p;
    const deckSpan = beamLen - 2 * (D.bracketThickness + 0.002);
    const panelCount = Math.max(1, Math.round(deckSpan / D.deckPanelTarget));
    bays.push({
      cx: (uprightX[u] + uprightX[u + 1]) / 2, beamLen, deckSpan, panelCount,
      panelW: (deckSpan - (panelCount - 1) * D.deckGap) / panelCount,
    });
  }

  heights.forEach((y, i) => {
    const shelf = new Group();
    shelf.name = shelfName(i);
    shelf.position.y = y;
    shelf.userData = { level: i + 1, height: y };

    const bb = createBuilder(false);
    const db = createBuilder(false);
    const deckY = -D.deckDrop - D.deckThickness / 2;
    const barY = -D.deckDrop - D.deckThickness - D.deckBarSize / 2;
    for (const bay of bays) {
      for (const sz of [-1, 1]) {
        bb.box(bay.beamLen, D.beamHeight, D.beamDepth, D.chamfer,
          at(bay.cx, -D.beamHeight / 2, sz * (zFace - D.beamDepth / 2)));
        for (const sx of [-1, 1]) {
          bb.box(D.bracketThickness, D.beamHeight + D.bracketExtra, p * 0.96, 0,
            at(bay.cx + sx * (bay.beamLen / 2 - D.bracketThickness / 2), -D.beamHeight / 2, sz * zPost));
        }
      }
      for (let k = 0; k < bay.panelCount; k++) {
        const x = bay.cx - bay.deckSpan / 2 + bay.panelW / 2 + k * (bay.panelW + D.deckGap);
        db.box(bay.panelW, D.deckThickness, 2 * zInner, D.chamfer, at(x, deckY, 0));
      }
      const seams = bay.panelCount > 1
        ? Array.from({ length: bay.panelCount - 1 },
            (_, k) => bay.cx - bay.deckSpan / 2 + (k + 1) * (bay.panelW + D.deckGap) - D.deckGap / 2)
        : [bay.cx];
      for (const x of seams) db.box(D.deckBarSize, D.deckBarSize, 2 * zInner, 0, at(x, barY, 0));
    }
    shelf.add(mesh(`${shelf.name}_Beams`, bb, mats.Beam_Orange));
    shelf.add(mesh(`${shelf.name}_Deck`, db, mats.Shelf_Deck));
    root.add(shelf);
  });

  // SensorNode: enclosure + status LED. Local +Z always points away from the rack.
  const sensor = new Group();
  sensor.name = 'SensorNode';
  const s = D.sensorScale;
  const sensorHalf = (0.1 * s) / 2;
  const sensorX = clamp(uprightX[P.sensorPost - 1], -W / 2 + sensorHalf, W / 2 - sensorHalf);
  const sensorSide = P.sensorSide === 'back' ? -1 : 1;
  sensor.position.set(sensorX, P.sensorHeight, (sensorSide * Dp) / 2);
  if (sensorSide < 0) sensor.rotation.y = Math.PI;
  const sb = createBuilder(false);
  sb.box(0.1 * s, 0.17 * s, 0.006 * s, 0.002, at(0, 0, 0.003 * s));
  sb.box(0.085 * s, 0.14 * s, 0.045 * s, 0.006 * s, at(0, 0, (0.006 + 0.0225) * s));
  sb.prism(0.007 * s, 0.03 * s, 8, at(0, -(0.07 + 0.012) * s, 0.028 * s));
  sensor.add(mesh('SensorNode_Body', sb, mats.Sensor_Body));
  const lb = createBuilder(false);
  lb.box(0.062 * s, 0.026 * s, 0.006 * s, 0.002 * s, at(0, 0.038 * s, (0.006 + 0.045 + 0.002) * s));
  sensor.add(mesh('SensorNode_LED', lb, mats.Sensor_Status));
  root.add(sensor);

  // Cargo: loose boxes or loaded pallets, one mesh per level
  const cargo = new Group();
  cargo.name = 'Cargo';
  if (P.includeCargo && P.cargoDensity > 0) {
    const rotY = (r: number) => new Matrix4().makeRotationY(r);
    const tape = (cb: Builder, T: Matrix4, halfW: number, halfD: number) => cb.poly(
      [new Vector3(-halfW, 0, -halfD), new Vector3(halfW, 0, -halfD), new Vector3(halfW, 0, halfD), new Vector3(-halfW, 0, halfD)]
        .map((v) => v.applyMatrix4(T)),
      new Vector3(0, -1, 0).applyMatrix4(T), 0.7);

    const addBoxes = (cb: Builder, bay: Bay, clear: number, rnd: Random, occupied: () => boolean) => {
      const usableX = bay.deckSpan - 0.04, usableZ = 2 * zInner - 0.05;
      if (usableX < 0.25) return;
      const maxH = Math.min(clear, D.cargoMaxHeight);
      const ideal = usableX / Math.max(D.cargoBoxTarget, maxH * 0.85);
      const count = Math.max(1, rnd.flip ? Math.ceil(ideal) : Math.floor(ideal));
      const slotW = usableX / count;
      for (let k = 0; k < count; k++) {
        const bw = slotW * (0.66 + 0.2 * rnd());
        const bd = usableZ * (0.55 + 0.33 * rnd());
        const bh = maxH * (0.45 + 0.5 * rnd());
        const x = bay.cx - usableX / 2 + slotW * (k + 0.5) + (rnd() - 0.5) * (slotW - bw) * 0.4;
        const z = (rnd() - 0.5) * (usableZ - bd) * 0.5;
        const rot = (rnd() - 0.5) * 0.1;
        const shade = 0.86 + 0.14 * rnd();
        const stack = [[bw, bh, bd, 0]];
        if (rnd() < 0.4 && bh < maxH * 0.6) {
          stack.push([bw * 0.72, Math.min(maxH - bh, bh * 0.75), bd * 0.72, bh]);
        }
        if (!occupied()) continue;
        for (const [w, h, d, baseY] of stack) {
          cb.box(w, h, d, D.cargoChamfer, at(x, -D.deckDrop + baseY + h / 2, z).multiply(rotY(rot)), shade);
          tape(cb, at(x, -D.deckDrop + baseY + h + 0.001, z).multiply(rotY(rot)), w / 2 - D.cargoChamfer, Math.min(0.05, d * 0.2) / 2);
        }
      }
    };

    const addPallets = (cb: Builder, bay: Bay, clear: number, rnd: Random, occupied: () => boolean, count: number) => {
      const usableX = bay.deckSpan - 0.04;
      const pw = D.palletWidth, pd = Math.min(D.palletDepth, Dp - 0.06), ph = D.palletHeight;
      const board = 0.022, runner = ph - 2 * board;
      const pitch = usableX / count;
      for (let k = 0; k < count; k++) {
        const x = bay.cx - usableX / 2 + pitch * (k + 0.5) + (rnd() - 0.5) * Math.min(0.06, pitch - pw);
        const base = at(x, 0.001, 0).multiply(rotY((rnd() - 0.5) * 0.04));
        const wood = 0.58 + 0.1 * rnd();
        const loadMax = Math.min(clear - ph - 0.05, D.palletLoadMax);
        const loadH = loadMax * (0.5 + 0.5 * rnd());
        const layers = clamp(Math.round(loadH / D.palletLayer), 1, 5);
        const single = layers > 1 && rnd() < 0.3;
        const picks = Array.from({ length: layers * 2 }, () => [rnd(), rnd(), rnd()]);
        if (!occupied()) continue;
        const part = (w: number, h: number, d: number, px: number, py: number, pz: number, shade: number, ch = 0) =>
          cb.box(w, h, d, ch, base.clone().multiply(at(px, py, pz)), shade);
        for (const pz of [-pd / 2 + 0.05, 0, pd / 2 - 0.05]) part(pw, board, 0.1, 0, board / 2, pz, wood);
        for (const px of [-pw / 2 + 0.05, 0, pw / 2 - 0.05]) part(0.1, runner, pd, px, board + runner / 2, 0, wood * 0.92);
        const topD = (pd - 4 * 0.03) / 5;
        for (let t = 0; t < 5; t++) part(pw, board, topD, 0, ph - board / 2, -pd / 2 + topD / 2 + t * (topD + 0.03), wood);
        if (loadMax < 0.12) continue;
        const lh = loadH / layers, half = (pw - 0.04) / 2;
        for (let l = 0; l < layers; l++) {
          const top = l === layers - 1;
          for (let b = 0; b < 2; b++) {
            if (top && single && b === 1) continue;
            const [r1, r2, r3] = picks[l * 2 + b];
            const bw = half - 0.01, bd = pd - 0.06 - r1 * 0.05;
            const px = (b - 0.5) * half + (r2 - 0.5) * 0.012, pz = (r3 - 0.5) * 0.03;
            part(bw, lh - 0.004, bd, px, ph + l * lh + lh / 2, pz, 0.86 + 0.14 * r1, D.cargoChamfer);
            if (top) tape(cb, base.clone().multiply(at(px, ph + (l + 1) * lh - 0.001, pz)), bw / 2 - D.cargoChamfer, 0.025);
          }
        }
      }
    };

    heights.forEach((y, i) => {
      const clear = (i < levels - 1 ? spacing - D.beamHeight : spacing) - 0.03;
      if (clear < 0.06) return;
      const cb = createBuilder(true);
      bays.forEach((bay, bi) => {
        const rnd = mulberry32(D.cargoSeed + i * 101 + bi * 13);
        rnd.flip = (i + bi) % 2 === 0;
        // separate stream: density never reshuffles sizes
        const pick = mulberry32(D.cargoSeed * 977 + i * 31 + bi * 7);
        const occupied = () => pick() < P.cargoDensity;
        const fit = Math.floor((bay.deckSpan - 0.04 + D.palletGap) / (D.palletWidth + D.palletGap));
        const wanted = P.cargoType === 'pallets' || (P.cargoType === 'auto' && clear >= D.palletMinClear);
        if (wanted && fit >= 1 && clear >= D.palletHeight + 0.2) addPallets(cb, bay, clear, rnd, occupied, fit);
        else addBoxes(cb, bay, clear, rnd, occupied);
      });
      if (!cb.count()) return;
      const m = mesh(cargoName(i), cb, mats.Cargo_Box);
      m.position.y = y;
      m.userData = { level: i + 1 };
      cargo.add(m);
    });
  }
  root.add(cargo);

  root.userData = { levelHeights: heights };
  return root;
};

export const rackMaterials = (root: Object3D) => {
  const materials = new Set<MeshStandardMaterial>();
  root.traverse((object) => {
    if ((object as Mesh).isMesh) materials.add((object as Mesh).material as MeshStandardMaterial);
  });
  return [...materials];
};

// Free GPU memory of a rack that is about to be replaced
export const disposeRack = (root: Object3D) => {
  root.traverse((object) => {
    if ((object as Mesh).isMesh) (object as Mesh).geometry.dispose();
  });
  rackMaterials(root).forEach((material) => material.dispose());
};
