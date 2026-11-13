"use client";

import {
  Environment,
  Lightformer,
  PerformanceMonitor,
  RoundedBox,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Scene settings                                                      */
/* ------------------------------------------------------------------ */

const CAMERA_Z = 10;
const FOV = 40;
const HALF_TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

/** Distant shapes scroll a little slower than the page, near ones a little faster. */
const PARALLAX_PER_UNIT_OF_DEPTH = 0.035;
/** Screens narrower than this (width ÷ height) use the phone placements. */
const PHONE_ASPECT = 0.85;

/** Page sections the shapes are attached to — these are the `id`s in the HTML. */
const SECTION_IDS = [
  "top",
  "about",
  "photography",
  "development",
  "next",
  "contact",
  "footer",
] as const;
type SectionId = (typeof SECTION_IDS)[number];

type MaterialName = "chrome" | "satin" | "ember" | "bone" | "wire";
type SimpleShape = "knot" | "ring" | "gem" | "octa" | "orb" | "pill" | "cage";
type ShapeName = SimpleShape | "camera" | "code" | "brackets";

type Placement = {
  /** The section this shape travels with. */
  section: SectionId;
  /** Across the screen: 0 is the left edge, 1 is the right edge. */
  x: number;
  /** Down from the top of the section, in screen-heights. Negative sits above it. */
  y: number;
  scale: number;
};

type Floater = {
  shape: ShapeName;
  material: MaterialName;
  /** Depth. Negative is further from the camera. */
  z: number;
  /** Turning speed. 0 keeps the shape facing forward and gently swaying. */
  spin: number;
  /** Where it sits on desktop and landscape screens. */
  wide: Placement;
  /** Where it sits on phones and portrait tablets. Left out = hidden there. */
  phone?: Placement;
};

const at = (
  section: SectionId,
  x: number,
  y: number,
  scale: number,
): Placement => ({
  section,
  x,
  y,
  scale,
});

/**
 * The floating shapes. Each one is pinned to a spot in a page section that has
 * no text behind it, so it frames the content instead of sitting on top of it.
 * Add, remove or move entries to change the background.
 */
const FLOATERS: Floater[] = [
  // Hero
  {
    shape: "knot",
    material: "chrome",
    z: 0.4,
    spin: 0.35,
    wide: at("top", 0.85, 0.46, 1.25),
    phone: at("top", 0.81, 0.225, 0.72),
  },
  {
    shape: "cage",
    material: "wire",
    z: -6.5,
    spin: 0.15,
    wide: at("top", 0.51, 0.49, 2.6),
    phone: at("top", 0.5, 0.5, 1.56),
  },
  {
    shape: "camera",
    material: "satin",
    z: 0.8,
    spin: 0,
    wide: at("top", 0.55, 0.24, 0.62),
    phone: at("top", 0.275, 0.165, 0.4),
  },
  {
    shape: "code",
    material: "ember",
    z: -1,
    spin: 0,
    wide: at("top", 0.93, 0.16, 0.5),
  },
  {
    shape: "orb",
    material: "ember",
    z: -1.5,
    spin: 0,
    wide: at("top", 0.71, 0.15, 0.18),
    phone: at("top", 0.75, 0.1, 0.12),
  },
  {
    shape: "octa",
    material: "bone",
    z: 1.2,
    spin: 0.6,
    wide: at("top", 0.035, 0.93, 0.42),
    phone: at("top", 0.04, 0.96, 0.26),
  },

  // About
  {
    shape: "ring",
    material: "satin",
    z: -2.2,
    spin: 0.5,
    wide: at("about", 0, 0.62, 0.95),
    phone: at("about", 0.84, 0.055, 0.38),
  },
  {
    shape: "octa",
    material: "ember",
    z: 0.4,
    spin: 0.5,
    wide: at("about", 0.375, 0.2, 0.3),
  },
  {
    shape: "gem",
    material: "chrome",
    z: -3,
    spin: 0.3,
    wide: at("about", 1, 0.9, 1.15),
  },

  // Photography
  {
    shape: "brackets",
    material: "satin",
    z: -1.2,
    spin: 0,
    wide: at("photography", 0.55, 0.26, 0.9),
    phone: at("photography", 0.78, -0.01, 0.42),
  },

  // Development
  {
    shape: "cage",
    material: "wire",
    z: -7,
    spin: 0.12,
    wide: at("development", 0.3, -0.02, 2.2),
  },
  {
    shape: "pill",
    material: "ember",
    z: -3.5,
    spin: 0.4,
    wide: at("development", 0.9, 0, 0.6),
  },
  {
    shape: "code",
    material: "ember",
    z: -1,
    spin: 0,
    wide: at("development", 0.56, 0.24, 0.55),
    phone: at("development", 0.8, 0, 0.32),
  },
  {
    shape: "gem",
    material: "satin",
    z: 0.5,
    spin: 0.5,
    wide: at("development", 0.99, 0.95, 0.5),
  },

  // Next
  {
    shape: "ring",
    material: "chrome",
    z: -1.5,
    spin: 0.35,
    wide: at("next", 0.56, 0.25, 0.8),
    phone: at("next", 0.82, 0, 0.4),
  },
  {
    shape: "orb",
    material: "bone",
    z: -2,
    spin: 0,
    wide: at("next", 0.97, 0.08, 0.22),
  },

  // Contact — the camera, the knot and the cage return to close the page
  {
    shape: "cage",
    material: "wire",
    z: -6.5,
    spin: 0.15,
    wide: at("contact", 0.5, 0.45, 2.4),
    phone: at("contact", 0.5, 0.5, 1.4),
  },
  {
    shape: "knot",
    material: "chrome",
    z: 0.4,
    spin: 0.35,
    wide: at("contact", 0.84, 0.36, 1.1),
    phone: at("contact", 0.8, -0.005, 0.42),
  },
  {
    shape: "camera",
    material: "satin",
    z: 0.8,
    spin: 0,
    wide: at("contact", 0.73, 0.15, 0.5),
    phone: at("contact", 0.52, 0, 0.3),
  },
  {
    shape: "orb",
    material: "ember",
    z: -1.5,
    spin: 0,
    wide: at("contact", 0.7, 0.52, 0.16),
  },

  // Footer
  {
    shape: "octa",
    material: "bone",
    z: 1.2,
    spin: 0.6,
    wide: at("footer", 0.05, 0.25, 0.42),
    phone: at("footer", 0.08, 0.03, 0.25),
  },
  {
    shape: "ring",
    material: "satin",
    z: -2,
    spin: 0.3,
    wide: at("footer", 0.95, 0.3, 0.7),
  },
];

type Input = {
  /** Page scroll position in pixels. */
  scrollY: number;
  /** Pointer position, -1 to 1 on both axes. */
  x: number;
  y: number;
};

type SectionBoxes = Partial<Record<SectionId, { top: number }>>;

/** Small seeded random generator, so the scene looks the same on every visit. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Materials and shapes                                                */
/* ------------------------------------------------------------------ */

function Surface({
  name,
  flat = false,
}: {
  name: MaterialName;
  flat?: boolean;
}) {
  switch (name) {
    case "chrome":
      return (
        <meshStandardMaterial
          color="#d2d2da"
          metalness={1}
          roughness={0.12}
          flatShading={flat}
        />
      );
    case "satin":
      return (
        <meshStandardMaterial
          color="#7c7c86"
          metalness={1}
          roughness={0.38}
          flatShading={flat}
        />
      );
    case "ember":
      return (
        <meshStandardMaterial
          color="#ff6a3d"
          metalness={0.3}
          roughness={0.32}
          emissive="#ff3d00"
          emissiveIntensity={0.18}
          flatShading={flat}
        />
      );
    case "bone":
      return (
        <meshStandardMaterial
          color="#ebe5d9"
          metalness={0.05}
          roughness={0.6}
          flatShading={flat}
        />
      );
    case "wire":
      return (
        <meshBasicMaterial
          color="#f3efe8"
          wireframe
          transparent
          opacity={0.14}
        />
      );
  }
}

function Geometry({ shape }: { shape: SimpleShape }) {
  switch (shape) {
    case "knot":
      return <torusKnotGeometry args={[0.7, 0.25, 140, 20]} />;
    case "ring":
      return <torusGeometry args={[0.8, 0.26, 24, 72]} />;
    case "gem":
      return <icosahedronGeometry args={[1, 0]} />;
    case "octa":
      return <octahedronGeometry args={[1, 0]} />;
    case "orb":
      return <sphereGeometry args={[1, 32, 24]} />;
    case "pill":
      return <capsuleGeometry args={[0.42, 1.1, 8, 24]} />;
    case "cage":
      return <icosahedronGeometry args={[1, 1]} />;
  }
}

/** A small stylised camera — a nod to the photography. */
function CameraModel() {
  const silver = (
    <meshStandardMaterial color="#c4c4cc" metalness={1} roughness={0.3} />
  );
  const leather = (
    <meshStandardMaterial color="#111114" metalness={0.1} roughness={0.85} />
  );

  return (
    <group rotation={[0.12, -0.5, 0.06]}>
      {/* Body: silver top and base plates around a black grip */}
      <RoundedBox
        args={[2, 0.74, 0.7]}
        radius={0.07}
        smoothness={4}
        position={[0, -0.13, 0]}
      >
        {leather}
      </RoundedBox>
      <RoundedBox
        args={[2.03, 0.34, 0.73]}
        radius={0.09}
        smoothness={4}
        position={[0, 0.41, 0]}
      >
        {silver}
      </RoundedBox>
      <RoundedBox
        args={[2.03, 0.12, 0.73]}
        radius={0.05}
        smoothness={4}
        position={[0, -0.55, 0]}
      >
        {silver}
      </RoundedBox>
      <RoundedBox
        args={[0.66, 0.24, 0.56]}
        radius={0.08}
        smoothness={4}
        position={[0, 0.68, 0]}
      >
        {silver}
      </RoundedBox>
      {/* Viewfinder window, shutter button and dial */}
      <mesh position={[-0.66, 0.41, 0.37]}>
        <boxGeometry args={[0.3, 0.16, 0.02]} />
        <meshStandardMaterial color="#06070c" metalness={1} roughness={0.08} />
      </mesh>
      <mesh position={[0.7, 0.63, 0.02]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 32]} />
        <Surface name="ember" />
      </mesh>
      <mesh position={[-0.68, 0.62, 0.02]}>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 32]} />
        <Surface name="chrome" />
      </mesh>
      {/* Lens */}
      <mesh position={[0, -0.06, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.47, 0.52, 0.5, 64]} />
        <meshStandardMaterial
          color="#1b1b20"
          metalness={0.9}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, -0.06, 0.84]}>
        <torusGeometry args={[0.43, 0.045, 20, 64]} />
        <Surface name="ember" />
      </mesh>
      <mesh position={[0, -0.06, 0.76]} scale={[1, 1, 0.32]}>
        <sphereGeometry args={[0.4, 48, 32]} />
        <meshStandardMaterial color="#0a0c14" metalness={1} roughness={0.04} />
      </mesh>
    </group>
  );
}

/** The characters </> built from rounded bars — a nod to the code. */
function CodeGlyph({ material }: { material: MaterialName }) {
  const radius = 0.11;
  const length = 0.62;
  const angle = THREE.MathUtils.degToRad(55);
  const offset = (length / 2) * Math.cos(angle);

  const bar = (
    key: string,
    x: number,
    y: number,
    rotation: number,
    size = length,
  ) => (
    <mesh key={key} position={[x, y, 0]} rotation={[0, 0, rotation]}>
      <capsuleGeometry args={[radius, size, 8, 20]} />
      <Surface name={material} />
    </mesh>
  );

  return (
    <group rotation={[0.1, 0.35, 0]}>
      {bar("open-top", -0.85, offset, -angle)}
      {bar("open-bottom", -0.85, -offset, angle)}
      {bar("slash", 0, 0, -0.36, 1.25)}
      {bar("close-top", 0.85, offset, angle)}
      {bar("close-bottom", 0.85, -offset, -angle)}
    </group>
  );
}

/** Viewfinder corner marks with a focus point in the middle. */
function Brackets({ material }: { material: MaterialName }) {
  const width = 2.4;
  const height = 1.6;
  const arm = 0.5;
  const thickness = 0.06;
  const corners: Array<[number, number]> = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
  ];

  return (
    <group rotation={[0.08, 0.4, -0.06]}>
      {corners.map(([sx, sy]) => (
        <group key={`${sx}${sy}`}>
          <mesh position={[sx * (width / 2 - arm / 2), (sy * height) / 2, 0]}>
            <boxGeometry args={[arm, thickness, thickness]} />
            <Surface name={material} />
          </mesh>
          <mesh position={[(sx * width) / 2, sy * (height / 2 - arm / 2), 0]}>
            <boxGeometry args={[thickness, arm, thickness]} />
            <Surface name={material} />
          </mesh>
        </group>
      ))}
      <mesh>
        <torusGeometry args={[0.13, 0.016, 12, 48]} />
        <Surface name="ember" />
      </mesh>
    </group>
  );
}

function FloaterMesh({ floater }: { floater: Floater }) {
  switch (floater.shape) {
    case "camera":
      return <CameraModel />;
    case "code":
      return <CodeGlyph material={floater.material} />;
    case "brackets":
      return <Brackets material={floater.material} />;
    default:
      return (
        <mesh>
          <Geometry shape={floater.shape} />
          <Surface
            name={floater.material}
            flat={floater.shape === "gem" || floater.shape === "octa"}
          />
        </mesh>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Dust: tiny soft points that give the space some depth               */
/* ------------------------------------------------------------------ */

/** Height of the repeating column of dust, in world units. */
const DUST_TRACK = 28;
/** How far the dust drifts for every screen-height the page scrolls. */
const DUST_TRAVEL_PER_SCREEN = 3.2;

/** Keeps a value inside the repeating track so the dust loops forever. */
function wrap(value: number) {
  return (
    ((((value + DUST_TRACK / 2) % DUST_TRACK) + DUST_TRACK) % DUST_TRACK) -
    DUST_TRACK / 2
  );
}

function Dust({
  screens,
  still,
  count = 110,
}: {
  /** How many screen-heights the page has scrolled. */
  screens: RefObject<number>;
  still: boolean;
  count?: number;
}) {
  const points = useRef<THREE.Points>(null);

  const { home, positions, sprite } = useMemo(() => {
    const random = seeded(11);
    const home = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      home[i * 3] = (random() * 2 - 1) * 12;
      home[i * 3 + 1] = (random() * 2 - 1) * (DUST_TRACK / 2);
      home[i * 3 + 2] = -9 + random() * 14;
    }

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d");
    if (context) {
      const glow = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      glow.addColorStop(0, "rgba(255,255,255,1)");
      glow.addColorStop(0.35, "rgba(255,255,255,0.45)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, 64, 64);
    }

    return {
      home,
      positions: home.slice(),
      sprite: new THREE.CanvasTexture(canvas),
    };
  }, [count]);

  useEffect(() => () => sprite.dispose(), [sprite]);

  useFrame(({ clock }) => {
    const attribute = points.current?.geometry.getAttribute("position");
    if (!attribute) return;
    const time = still ? 0 : clock.elapsedTime;
    const travel = screens.current * DUST_TRAVEL_PER_SCREEN;
    for (let i = 0; i < count; i++) {
      attribute.setXYZ(
        i,
        home[i * 3] + Math.sin(time * 0.12 + i) * 0.35,
        wrap(home[i * 3 + 1] + travel + Math.cos(time * 0.1 + i * 1.7) * 0.3),
        home[i * 3 + 2],
      );
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        color="#ffd9c4"
        size={0.085}
        sizeAttenuation
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Page input: scroll, pointer and where each section sits             */
/* ------------------------------------------------------------------ */

/**
 * The canvas ignores pointer events so the page stays fully interactive;
 * scroll and pointer position are read from the window instead.
 */
function usePageInput() {
  const input = useRef<Input>({ scrollY: 0, x: 0, y: 0 });
  const boxes = useRef<SectionBoxes>({});
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const measure = () => {
      for (const id of SECTION_IDS) {
        const element = document.getElementById(id);
        if (!element) continue;
        boxes.current[id] = {
          top: element.getBoundingClientRect().top + window.scrollY,
        };
      }
      invalidate();
    };
    const onScroll = () => {
      input.current.scrollY = window.scrollY;
      invalidate();
    };
    const onPointer = (event: PointerEvent) => {
      input.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      input.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    measure();
    onScroll();

    // Sections move when the page changes height (photos loading, filters, resizing).
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [invalidate]);

  return { input, boxes };
}

/* ------------------------------------------------------------------ */
/* The floating field                                                  */
/* ------------------------------------------------------------------ */

function Field({ still }: { still: boolean }) {
  const { input, boxes } = usePageInput();
  const rig = useRef<THREE.Group>(null);
  const nodes = useRef<Array<THREE.Group | null>>([]);
  const scroll = useRef<number | null>(null);
  const screens = useRef(0);

  const width = useThree((state) => state.size.width);
  const screen = useThree((state) => state.size.height);
  const aspect = width / screen;
  const phone = aspect < PHONE_ASPECT;

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = still ? 0 : clock.elapsedTime;
    const { scrollY, x, y } = input.current;

    // The shapes trail the page very slightly, which makes them feel like they float.
    const scrolled =
      scroll.current === null || still
        ? scrollY
        : THREE.MathUtils.damp(scroll.current, scrollY, 9, dt);
    scroll.current = scrolled;
    screens.current = scrolled / screen;

    FLOATERS.forEach((floater, index) => {
      const node = nodes.current[index];
      if (!node) return;

      const place = phone ? floater.phone : floater.wide;
      const box = place && boxes.current[place.section];
      if (!place || !box) {
        node.visible = false;
        return;
      }

      // Distance from the middle of the screen, in pixels.
      const parallax = still ? 1 : 1 + floater.z * PARALLAX_PER_UNIT_OF_DEPTH;
      const fromCentre =
        (box.top + place.y * screen - scrolled - screen / 2) * parallax;

      // Shapes well outside the screen are skipped entirely.
      node.visible = Math.abs(fromCentre) < screen * 1.1;
      if (!node.visible) return;

      const phase = index * 1.618;
      const halfHeight = (CAMERA_Z - floater.z) * HALF_TAN;

      node.position.set(
        (place.x * 2 - 1) * halfHeight * aspect +
          Math.cos(time * 0.33 + phase) * 0.12,
        (-fromCentre / (screen / 2)) * halfHeight +
          Math.sin(time * 0.5 + phase) * 0.2,
        floater.z,
      );

      if (floater.spin > 0) {
        node.rotation.set(
          phase +
            time * floater.spin * 0.42 +
            screens.current * floater.spin * 1.4,
          phase * 0.7 + time * floater.spin * 0.55,
          Math.sin(time * 0.3 + phase) * 0.2,
        );
      } else {
        // Recognisable objects stay facing the viewer and only sway.
        node.rotation.set(
          Math.sin(time * 0.45 + phase) * 0.16,
          Math.sin(time * 0.35 + phase) * 0.45,
          Math.sin(time * 0.3 + phase) * 0.08,
        );
      }
    });

    // The whole field leans a little towards the pointer for a sense of depth.
    if (rig.current && !still) {
      rig.current.rotation.y = THREE.MathUtils.damp(
        rig.current.rotation.y,
        x * 0.1,
        3,
        dt,
      );
      rig.current.rotation.x = THREE.MathUtils.damp(
        rig.current.rotation.x,
        y * 0.06,
        3,
        dt,
      );
    }
  });

  return (
    <group ref={rig}>
      {FLOATERS.map((floater, index) => {
        const place = phone ? floater.phone : floater.wide;
        if (!place) return null;
        return (
          <group
            key={index}
            ref={(node) => {
              nodes.current[index] = node;
            }}
            scale={place.scale}
            visible={false}
          >
            <FloaterMesh floater={floater} />
          </group>
        );
      })}
      <Dust screens={screens} still={still} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * True while the scene cannot be seen: the browser tab is in the background,
 * or the menu or photo viewer covers the page. Rendering stops meanwhile.
 */
function useScenePaused() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () =>
      setPaused(document.hidden || root.classList.contains("is-locked"));
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return paused;
}

export default function Scene({ onReady }: { onReady?: () => void }) {
  const still = usePrefersReducedMotion();
  const [maxDpr, setMaxDpr] = useState(1.5);
  const [settled, setSettled] = useState(false);
  const paused = useScenePaused();

  // With reduced motion nothing animates on its own: once the scene has been
  // drawn, the render loop stops and only runs again when the page scrolls.
  useEffect(() => {
    if (!still) return;
    const timer = window.setTimeout(() => setSettled(true), 1500);
    return () => {
      window.clearTimeout(timer);
      setSettled(false);
    };
  }, [still]);

  return (
    <Canvas
      dpr={[1, maxDpr]}
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={paused ? "never" : still && settled ? "demand" : "always"}
      onCreated={onReady}
      style={{ pointerEvents: "none" }}
    >
      {/* Drop to a lower resolution if the device struggles to keep up. */}
      <PerformanceMonitor onDecline={() => setMaxDpr(1)} />

      <fog attach="fog" args={["#08080a", 9, 25]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 6]} intensity={1.8} color="#fff0de" />
      <directionalLight
        position={[-6, -3, 2]}
        intensity={1.1}
        color="#ff6a3d"
      />

      {/* A small photo studio that the metal surfaces reflect. */}
      <Environment resolution={128}>
        <color attach="background" args={["#0e0e12"]} />
        {/* Large softbox overhead */}
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#ffffff"
          position={[0, 7, 6]}
          scale={[13, 6, 1]}
          target={[0, 0, 0]}
        />
        {/* Warm strip on the left, cool strip on the right */}
        <Lightformer
          form="rect"
          intensity={9}
          color="#ff6a3d"
          position={[-8, 0, 3]}
          scale={[1.6, 10, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={6}
          color="#7f9bff"
          position={[8, -1, 4]}
          scale={[1.6, 9, 1]}
          target={[0, 0, 0]}
        />
        {/* Ring light behind the camera, warm bounce from the floor, rim from behind */}
        <Lightformer
          form="ring"
          intensity={2.5}
          color="#fff3e4"
          position={[0, 0, 10]}
          scale={5}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#ff9a6b"
          position={[0, -8, 2]}
          scale={[12, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="#ffffff"
          position={[0, 3, -9]}
          scale={[10, 3, 1]}
          target={[0, 0, 0]}
        />
      </Environment>

      <Field still={still} />
    </Canvas>
  );
}
