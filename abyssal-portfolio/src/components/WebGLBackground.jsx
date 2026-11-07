import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WebGLBackground({ activeView }) {
  const mountRef = useRef(null);
  const targetViewIndexRef = useRef(0);

  useEffect(() => {
    const viewOrder = ["beranda", "tentang", "karya", "stack", "kontak"];
    targetViewIndexRef.current = Math.max(0, viewOrder.indexOf(activeView));
  }, [activeView]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Inisialisasi Scene, Camera, dan Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#040914");
    scene.fog = new THREE.FogExp2("#040914", 0.032);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      150,
    );
    camera.position.set(0, 1.5, 16);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. Pencahayaan Bioluminescent Deep-Sea
    const ambientLight = new THREE.AmbientLight("#001A4D", 1.8);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight("#00E5FF", 5.5, 35);
    cyanPointLight.position.set(5, 6, 8);
    scene.add(cyanPointLight);

    const neonBlueLight = new THREE.PointLight("#4DB8FF", 4.0, 35);
    neonBlueLight.position.set(-7, -5, 5);
    scene.add(neonBlueLight);

    const deepIndigoLight = new THREE.DirectionalLight("#0258FF", 2.2);
    deepIndigoLight.position.set(0, 15, -10);
    scene.add(deepIndigoLight);

    // 3. Pembuatan Tekstur Glow Radial Secara Prosedural (Tanpa URL Eksternal)
    const createGlowTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.25, "rgba(0, 229, 255, 0.85)");
      gradient.addColorStop(0.6, "rgba(77, 184, 255, 0.25)");
      gradient.addColorStop(1, "rgba(4, 9, 20, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(canvas);
    };
    const glowTexture = createGlowTexture();

    // 4. Membangun Ikan Bioluminescent 3D (Articulated Cybernetic Betta/Koi)
    const fishRoot = new THREE.Group();
    scene.add(fishRoot);

    const NUM_SEGMENTS = 22;
    const segments = [];
    const dorsalRibs = [];
    const ventralRibs = [];

    // Material Bioluminescent
    const bodySolidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#001A4D"),
      emissive: new THREE.Color("#006699"),
      emissiveIntensity: 0.75,
      metalness: 0.75,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.92,
    });

    const wireframeArmorMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#00E5FF"),
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#FFFFFF"),
      transparent: true,
      opacity: 0.9,
    });

    const finMembraneMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#00E5FF"),
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    // Profil ketebalan tubuh ikan dari kepala hingga pangkal ekor
    const getBodyProfile = (t) => {
      // t: 0 (kepala) -> 1 (ekor)
      if (t < 0.18) {
        return Math.max(
          0.08,
          Math.sin((t / 0.18) * (Math.PI / 2)) * 0.88 + 0.15,
        );
      }
      const normalizedTail = Math.max(0, Math.min(1, 1 - (t - 0.18) / 0.82));
      return Math.pow(normalizedTail, 1.35) * 0.95 + 0.06;
    };

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const t = i / (NUM_SEGMENTS - 1);
      const rawRadius = getBodyProfile(t);
      const radius =
        Number.isFinite(rawRadius) && rawRadius > 0 ? rawRadius : 0.1;
      const segGroup = new THREE.Group();

      // Segmen Inti Vertebrae
      const segGeo = new THREE.SphereGeometry(radius, 16, 12);
      segGeo.scale(0.68, 1.28, 1.15);

      const solidMesh = new THREE.Mesh(segGeo, bodySolidMat);
      const wireMesh = new THREE.Mesh(segGeo, wireframeArmorMat);
      wireMesh.scale.setScalar(1.04);

      segGroup.add(solidMesh);
      segGroup.add(wireMesh);

      // Node Energi Internal Bioluminescent
      if (i % 2 === 0 && i < NUM_SEGMENTS - 3) {
        const coreGeo = new THREE.OctahedronGeometry(radius * 0.42, 0);
        const coreMesh = new THREE.Mesh(coreGeo, coreGlowMat);
        segGroup.add(coreMesh);
      }

      // Mata Bioluminescent & Pelindung Kepala pada Segmen Ke-2
      if (i === 2) {
        const eyeGeo = new THREE.SphereGeometry(0.16, 12, 12);
        const eyeMat = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(radius * 0.62, 0.22, 0.25);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(-radius * 0.62, 0.22, 0.25);

        // Halo bercahaya di sekitar mata
        const eyeHaloMat = new THREE.SpriteMaterial({
          map: glowTexture,
          color: "#00E5FF",
          transparent: true,
          blending: THREE.AdditiveBlending,
        });
        const leftHalo = new THREE.Sprite(eyeHaloMat);
        leftHalo.scale.set(0.9, 0.9, 1);
        leftEye.add(leftHalo);

        const rightHalo = new THREE.Sprite(eyeHaloMat);
        rightHalo.scale.set(0.9, 0.9, 1);
        rightEye.add(rightHalo);

        segGroup.add(leftEye);
        segGroup.add(rightEye);
      }

      // Sirip Pektoral Mengambang yang Anggun (Khas Betta / Koi) pada Segmen Ke-4
      if (i === 4) {
        const createPectoralFin = (side) => {
          const finGroup = new THREE.Group();
          const finShape = new THREE.BufferGeometry();
          const vertices = new Float32Array([
            0,
            0,
            0,
            side * 2.5,
            0.5,
            -0.9,
            side * 3.1,
            -0.8,
            -2.2,
            0,
            -0.4,
            -0.6,
            side * 3.1,
            -0.8,
            -2.2,
            side * 1.4,
            -1.6,
            -2.7,
          ]);
          finShape.setAttribute(
            "position",
            new THREE.BufferAttribute(vertices, 3),
          );
          finShape.computeVertexNormals();

          const finMesh = new THREE.Mesh(finShape, finMembraneMat);
          const finWire = new THREE.Mesh(finShape, wireframeArmorMat);
          finGroup.add(finMesh);
          finGroup.add(finWire);
          finGroup.position.set(side * radius * 0.55, -0.15, 0);
          return finGroup;
        };

        const leftPectoral = createPectoralFin(1);
        const rightPectoral = createPectoralFin(-1);
        segGroup.userData.leftPectoral = leftPectoral;
        segGroup.userData.rightPectoral = rightPectoral;
        segGroup.add(leftPectoral);
        segGroup.add(rightPectoral);
      }

      // Sirip Punggung (Dorsal Fin) Mengalir
      if (i >= 3 && i <= 18) {
        const finHeight = Math.max(
          0.2,
          Math.sin(((i - 3) / 15) * Math.PI) * 2.25 + 0.35,
        );
        const ribGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, radius * 1.05, 0),
          new THREE.Vector3(0, radius * 1.05 + finHeight, -0.65),
        ]);
        const ribLine = new THREE.Line(
          ribGeo,
          new THREE.LineBasicMaterial({
            color: "#00E5FF",
            transparent: true,
            opacity: 0.75,
          }),
        );
        // Bilah membran tipis di setiap tulang sirip
        const vaneGeo = new THREE.PlaneGeometry(0.28, finHeight);
        vaneGeo.translate(0, radius * 1.05 + finHeight * 0.5, -0.32);
        vaneGeo.rotateY(Math.PI / 2);
        const vaneMesh = new THREE.Mesh(vaneGeo, finMembraneMat);

        segGroup.add(ribLine);
        segGroup.add(vaneMesh);
        dorsalRibs.push({ vaneMesh, ribLine, baseHeight: finHeight, index: i });
      }

      // Sirip Bawah (Ventral Fin)
      if (i >= 7 && i <= 17) {
        const vHeight = Math.max(
          0.15,
          Math.sin(((i - 7) / 10) * Math.PI) * 1.45 + 0.25,
        );
        const vGeo = new THREE.PlaneGeometry(0.26, vHeight);
        vGeo.translate(0, -(radius * 1.05 + vHeight * 0.5), -0.25);
        vGeo.rotateY(Math.PI / 2);
        const vMesh = new THREE.Mesh(vGeo, finMembraneMat);
        segGroup.add(vMesh);
        ventralRibs.push({ vMesh, index: i });
      }

      // Ekor Veil Bertingkat (Caudal Veil Tail) pada Segmen Terakhir
      if (i === NUM_SEGMENTS - 1) {
        const tailGroup = new THREE.Group();
        const NUM_TAIL_RAYS = 13;
        const tailRays = [];

        for (let r = 0; r < NUM_TAIL_RAYS; r++) {
          const rayRatio = r / (NUM_TAIL_RAYS - 1) - 0.5; // -0.5 ke 0.5
          const spreadAngle = rayRatio * Math.PI * 0.68;
          const rayLength = (1 - Math.abs(rayRatio) * 0.35) * 4.4;

          const rayPlaneGeo = new THREE.PlaneGeometry(0.45, rayLength, 1, 6);
          rayPlaneGeo.translate(0, -rayLength * 0.5, 0);
          const rayMesh = new THREE.Mesh(rayPlaneGeo, finMembraneMat);
          const rayWire = new THREE.Mesh(rayPlaneGeo, wireframeArmorMat);
          rayMesh.add(rayWire);

          rayMesh.rotation.x = -Math.PI / 2;
          rayMesh.rotation.z = spreadAngle;
          tailGroup.add(rayMesh);
          tailRays.push({
            mesh: rayMesh,
            baseSpread: spreadAngle,
            ratio: rayRatio,
          });
        }

        segGroup.userData.tailRays = tailRays;
        segGroup.add(tailGroup);
      }

      fishRoot.add(segGroup);
      segments.push(segGroup);
    }

    // Lampu Pembawa Bioluminescent yang melekat pada kepala ikan
    const fishHeadLight = new THREE.PointLight("#00E5FF", 6.5, 18);
    fishRoot.add(fishHeadLight);

    // 5. Jejak Partikel Bioluminescent & Plankton Abyssal
    const PARTICLE_COUNT = 750;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);

    const palette = [
      new THREE.Color("#00E5FF"),
      new THREE.Color("#4DB8FF"),
      new THREE.Color("#FFFFFF"),
      new THREE.Color("#0055B3"),
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 55;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35 - 4;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      speeds[i] = 0.008 + Math.random() * 0.025;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.42,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Cincin Sonar Kedalaman & Grid Holografik Abyssal
    const sonarGroup = new THREE.Group();
    sonarGroup.position.set(0, -8.5, -5);
    scene.add(sonarGroup);

    for (let r = 1; r <= 4; r++) {
      const ringGeo = new THREE.RingGeometry(r * 4.5, r * 4.5 + 0.06, 64);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: "#00E5FF",
        transparent: true,
        opacity: 0.14 / r,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      sonarGroup.add(new THREE.Mesh(ringGeo, ringMat));
    }

    // 7. Interaksi Mouse & Sentuhan Halus
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        pointer.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // 8. Loop Animasi Utama (Kinematika Tulang Belakang Ikan & Kamera Dinamis)
    let animationFrameId;

    // Fungsi posisi jalur berenang Lissajous 3D
    const getSwimPoint = (timeOffset, mouseX, mouseY) => {
      const x =
        Math.sin(timeOffset * 0.55) * 6.2 +
        Math.cos(timeOffset * 0.27) * 2.1 +
        mouseX * 2.8;
      const y =
        Math.sin(timeOffset * 0.85) * 2.1 +
        Math.cos(timeOffset * 0.4) * 1.1 +
        mouseY * 1.8;
      const z =
        Math.cos(timeOffset * 0.55) * 4.2 +
        Math.sin(timeOffset * 0.3) * 1.8 -
        1.5;
      return new THREE.Vector3(x, y, z);
    };

    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      // Jika 'time' undefined pada frame pertama, gunakan performance.now()
      const currentTimestamp = time || performance.now();
      const elapsedTime = currentTimestamp * 0.001;

      // Interpolasi posisi kursor
      pointer.x += (pointer.targetX - pointer.x) * 0.04;
      pointer.y += (pointer.targetY - pointer.y) * 0.04;

      // Pergeseran kamera sinematik lembut saat pengguna berpindah menu SPA
      const viewOffset = targetViewIndexRef.current;
      const targetCamX = pointer.x * 1.6 + (viewOffset - 2) * 0.65;
      const targetCamY =
        1.2 + pointer.y * 1.1 + Math.sin(elapsedTime * 0.4) * 0.3;
      const targetCamZ = 15.5 - (viewOffset % 2) * 1.2;

      camera.position.x += (targetCamX - camera.position.x) * 0.03;
      camera.position.y += (targetCamY - camera.position.y) * 0.03;
      camera.position.z += (targetCamZ - camera.position.z) * 0.03;
      camera.lookAt(0, 0, -1);

      // Update setiap segmen tulang belakang ikan dengan undulasi gelombang S
      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const seg = segments[i];
        const timeLag = elapsedTime - i * 0.075;
        const basePos = getSwimPoint(timeLag, pointer.x, pointer.y);
        const nextPos = getSwimPoint(timeLag + 0.04, pointer.x, pointer.y);

        // Arah gerak maju
        const tangent = new THREE.Vector3()
          .subVectors(nextPos, basePos)
          .normalize();
        const sideVec = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Amplitudo kibasan tubuh meningkat dari kepala ke ekor
        const slitherAmp = Math.pow(i / NUM_SEGMENTS, 1.25) * 0.48;
        const slitherWave = Math.sin(elapsedTime * 5.2 - i * 0.45) * slitherAmp;

        basePos.addScaledVector(sideVec, slitherWave);
        seg.position.copy(basePos);

        // Orientasikan segmen menghadap segmen di depannya
        if (i === 0) {
          const lookTarget = new THREE.Vector3().addVectors(basePos, tangent);
          seg.lookAt(lookTarget);
          fishHeadLight.position.copy(basePos);
        } else {
          seg.lookAt(segments[i - 1].position);
        }

        // Animasi kepakan sirip pektoral di segmen ke-4
        if (i === 4 && seg.userData.leftPectoral) {
          const flap = Math.sin(elapsedTime * 4.2) * 0.38;
          seg.userData.leftPectoral.rotation.y = flap - 0.25;
          seg.userData.leftPectoral.rotation.z =
            Math.cos(elapsedTime * 4.2) * 0.15;
          seg.userData.rightPectoral.rotation.y = -flap + 0.25;
          seg.userData.rightPectoral.rotation.z =
            -Math.cos(elapsedTime * 4.2) * 0.15;
        }

        // Animasi ayunan ekor Veil di segmen terakhir
        if (i === NUM_SEGMENTS - 1 && seg.userData.tailRays) {
          seg.userData.tailRays.forEach((ray, idx) => {
            const wave = Math.sin(elapsedTime * 5.5 - idx * 0.35) * 0.32;
            ray.mesh.rotation.y = wave;
            ray.mesh.rotation.z =
              ray.baseSpread + Math.cos(elapsedTime * 3.8 + idx * 0.2) * 0.08;
          });
        }
      }

      // Gelombang halus pada sirip punggung (Dorsal)
      dorsalRibs.forEach((rib) => {
        rib.vaneMesh.rotation.z =
          Math.sin(elapsedTime * 6.0 - rib.index * 0.5) * 0.22;
      });

      // Update partikel plankton bioluminescent naik ke permukaan secara perlahan
      const posAttr = particleGeo.attributes.position;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let py = posAttr.getY(i);
        let px = posAttr.getX(i);
        py += speeds[i];
        px += Math.sin(elapsedTime * 0.5 + i) * 0.005;

        if (py > 18) py = -18;
        posAttr.setY(i, py);
        posAttr.setX(i, px);
      }
      posAttr.needsUpdate = true;

      // Rotasi perlahan pada cincin sonar dasar laut
      sonarGroup.rotation.y = elapsedTime * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    />
  );
}
