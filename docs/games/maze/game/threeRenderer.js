import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export class ThreeRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x050608);
    
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050608, 0.08);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0.5, 0);

    // Post processing for Neon Glow
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3,  // strength (reduced significantly)
      0.5,  // radius
      0.8   // threshold (higher so only bright things bloom)
    );
    this.composer.addPass(bloomPass);

    // Resize listener
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8); // Brighter ambient
    this.scene.add(ambient);
    
    // Player PointLight
    this.playerLight = new THREE.PointLight(0xffddaa, 3.0, 15); // Warmer, brighter light
    this.scene.add(this.playerLight);

    // Entity Map
    this.entityMeshes = new Map();
  }

  buildMaze(maze, gridW, gridH) {
    // Clear old maze
    if (this.mazeGroup) {
      this.scene.remove(this.mazeGroup);
    }
    this.mazeGroup = new THREE.Group();
    this.scene.add(this.mazeGroup);

    // Textures
    const texLoader = new THREE.TextureLoader();
    
    this.wallTex = texLoader.load('wall_tex.jpg');
    this.wallTex.wrapS = THREE.RepeatWrapping;
    this.wallTex.wrapT = THREE.RepeatWrapping;
    this.wallTex.repeat.set(1, 3);
    
    this.floorTex = texLoader.load('floor_tex.jpg');
    this.floorTex.wrapS = THREE.RepeatWrapping;
    this.floorTex.wrapT = THREE.RepeatWrapping;
    this.floorTex.repeat.set(gridW / 2, gridH / 2);
    
    this.trapTex = texLoader.load('trap_tex.jpg');
    this.trapTex.wrapS = THREE.RepeatWrapping;
    this.trapTex.wrapT = THREE.RepeatWrapping;
    
    this.keyTex = texLoader.load('key_tex.jpg');
    this.keyTex.wrapS = THREE.RepeatWrapping;
    this.keyTex.wrapT = THREE.RepeatWrapping;
    
    this.doorTex = texLoader.load('door_tex.jpg');
    this.checkpointTex = texLoader.load('checkpoint_tex.jpg');
    this.portalTex = texLoader.load('portal_tex.jpg');

    // Materials
    const floorMat = new THREE.MeshStandardMaterial({ 
      map: this.floorTex,
      color: 0x999999, // Brighten to show texture
      roughness: 0.9,
      metalness: 0.1
    });
    const wallMat = new THREE.MeshStandardMaterial({
      map: this.wallTex,
      color: 0xd0d0d0,
      roughness: 0.9,
      metalness: 0.1
    });
    // Neon edge lines for walls (less opacity since we want rocky texture to pop)
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x58a6ff, transparent: true, opacity: 0.15 });

    const wallGeo = new THREE.BoxGeometry(1, 3, 1);
    const floorGeo = new THREE.PlaneGeometry(gridW, gridH);

    // Add floor
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(gridW / 2, 0, gridH / 2);
    this.mazeGroup.add(floor);
    
    // Floor Grid
    const gridHelper = new THREE.GridHelper(Math.max(gridW, gridH), Math.max(gridW, gridH), 0x222233, 0x111122);
    gridHelper.position.set(gridW / 2, 0.01, gridH / 2);
    this.mazeGroup.add(gridHelper);

    // Add Ceiling
    const ceil = new THREE.Mesh(floorGeo, floorMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(gridW / 2, 3, gridH / 2); // Ceiling is now at height 3
    this.mazeGroup.add(ceil);

    // Instanced mesh for walls is faster
    let wallCount = 0;
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        if (maze[y][x] === 1) wallCount++;
      }
    }

    const iMesh = new THREE.InstancedMesh(wallGeo, wallMat, wallCount);
    let i = 0;
    const dummy = new THREE.Object3D();
    
    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        if (maze[y][x] === 1) {
          dummy.position.set(x + 0.5, 1.5, y + 0.5); // Y is 1.5 because height is 3
          dummy.updateMatrix();
          iMesh.setMatrixAt(i++, dummy.matrix);
        }
      }
    }
    this.mazeGroup.add(iMesh);
  }

  // Convert Hex string to Three Color
  getColor(c) {
    if (!c) return 0xffffff;
    return parseInt(c.replace('#', '0x'), 16);
  }

  updateEntities(keys, checkpoints, doors, portals, traps, exit) {
    const activeIds = new Set();

    // Helper to create/update sprites or meshes
    const updateMesh = (id, type, x, y, colorStr, extra) => {
      activeIds.add(id);
      let mesh = this.entityMeshes.get(id);
      
      const colorHex = this.getColor(colorStr);

      if (!mesh) {
        if (type === 'door') {
          const geo = new THREE.BoxGeometry(1, 1, 1);
          const mat = new THREE.MeshStandardMaterial({ map: this.doorTex, color: colorHex, emissive: colorHex, emissiveIntensity: 0.3 });
          mesh = new THREE.Mesh(geo, mat);
          
          if (extra && extra.reqKeys > 0) {
            // Add key requirement sprite
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = extra.color || '#ffffff';
            ctx.font = 'bold 80px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(extra.reqKeys.toString(), 64, 64);
            const tex = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(0.5, 0.5, 1);
            sprite.position.set(0, 0.6, 0); // Above the door
            mesh.add(sprite);
          }
        } else if (type === 'trap') {
          const geo = new THREE.BoxGeometry(0.8, 0.1, 0.8);
          const mat = new THREE.MeshStandardMaterial({ map: this.trapTex, color: colorHex, emissive: colorHex, emissiveIntensity: 1.0 });
          mesh = new THREE.Mesh(geo, mat);
        } else if (type === 'key') {
          const geo = new THREE.OctahedronGeometry(0.15, 0);
          const mat = new THREE.MeshStandardMaterial({ map: this.keyTex, color: colorHex, emissive: colorHex, emissiveIntensity: 2.0 });
          mesh = new THREE.Mesh(geo, mat);
        } else if (type === 'checkpoint') {
          const geo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16);
          const mat = new THREE.MeshStandardMaterial({ map: this.checkpointTex, color: colorHex, emissive: colorHex, emissiveIntensity: 1.5 });
          mesh = new THREE.Mesh(geo, mat);
        } else if (type === 'portal') {
          const geo = new THREE.TorusGeometry(0.3, 0.05, 16, 32);
          const mat = new THREE.MeshStandardMaterial({ map: this.portalTex, color: colorHex, emissive: colorHex, emissiveIntensity: 3.0 });
          mesh = new THREE.Mesh(geo, mat);
          mesh.rotation.x = Math.PI / 2;
        } else if (type === 'exit') {
          const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
          const mat = new THREE.MeshStandardMaterial({ color: 0x2ea043, emissive: 0x2ea043, emissiveIntensity: 2.0, wireframe: true });
          mesh = new THREE.Mesh(geo, mat);
        }
        
        this.scene.add(mesh);
        this.entityMeshes.set(id, mesh);
      }

      // Update positions & states
      if (type === 'door') {
        // extra is door object
        mesh.position.set(x, 0.5 - extra.openPct, y);
      } else if (type === 'key') {
        mesh.position.set(x, 0.4 + Math.sin(Date.now()*0.005)*0.05, y);
        mesh.rotation.y += 0.02;
      } else if (type === 'trap') {
        if (extra.type === 'SPIKE') {
          mesh.position.set(x, 0.05 + extra.spikePct * 0.4, y);
          mesh.scale.set(1, 1 + extra.spikePct * 3, 1);
        } else {
          mesh.position.set(x, 0.05, y);
        }
        
        let intensity = 0.5;
        if (extra.state === 'ARMED' || extra.state === 'WARNING') {
          intensity = 2.0 + Math.sin(Date.now()*0.02)*1.5;
        } else if (extra.state === 'LETHAL' || extra.state === 'OPEN') {
          intensity = 3.0;
        } else if (extra.type === 'POISON') {
          intensity = 1.0 + Math.sin(Date.now()*0.005 + extra.gasPhase)*0.5;
        } else if (extra.type === 'FREEZE') {
          intensity = 1.0 + Math.sin(Date.now()*0.003 + extra.crystalSpin)*0.5;
          mesh.rotation.y += 0.01;
        }
        
        mesh.material.emissiveIntensity = intensity;
        if (mesh.children.length > 0) mesh.children[0].intensity = intensity * 2;
      } else if (type === 'portal') {
        mesh.position.set(x, 0.5, y);
        mesh.rotation.z -= 0.05;
        // scale based on cooldown
        const sc = extra.cooldown > 0 ? 0.2 : 1.0;
        mesh.scale.set(sc,sc,sc);
      } else if (type === 'checkpoint') {
        mesh.position.set(x, 0.02, y);
        mesh.material.emissiveIntensity = extra.active ? 1.0 : 0.2;
      } else if (type === 'exit') {
        mesh.position.set(x, 0.5, y);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.02;
      }
    };

    let idx = 0;
    for (const d of doors) updateMesh(`door_${idx++}`, 'door', d.x + 0.5, d.y + 0.5, d.color, d);
    idx = 0;
    for (const k of keys) {
      if (!k.collected) updateMesh(`key_${idx}`, 'key', k.x + 0.5, k.y + 0.5, k.color, k);
      idx++;
    }
    idx = 0;
    const TRAP_COLORS = {
      'PIT': '#ff5500',
      'MINE': '#ff0000',
      'SLOW': '#aaaa00',
      'POISON': '#00ff00',
      'SPIKE': '#888888',
      'FREEZE': '#00ffff'
    };
    for (const t of traps) updateMesh(`trap_${idx++}`, 'trap', t.x + 0.5, t.y + 0.5, TRAP_COLORS[t.type] || '#ffffff', t);
    idx = 0;
    for (const p of portals) updateMesh(`portal_${idx++}`, 'portal', p.x + 0.5, p.y + 0.5, p.color, p);
    idx = 0;
    for (const c of checkpoints) updateMesh(`cp_${idx++}`, 'checkpoint', c.x + 0.5, c.y + 0.5, c.active ? '#58a6ff' : '#444444', c);
    
    updateMesh(`exit`, 'exit', exit.x + 0.5, exit.y + 0.5, '#2ea043', exit);

    // Remove inactive
    for (const [id, mesh] of this.entityMeshes.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        this.entityMeshes.delete(id);
      }
    }

    // Animate Textures
    const now = Date.now();
    if (this.wallTex) {
      this.wallTex.offset.y = Math.sin(now * 0.001) * 0.05;
      this.wallTex.offset.x = Math.cos(now * 0.001) * 0.05;
    }
    if (this.floorTex) {
      this.floorTex.offset.x = (now * 0.0002) % 1;
      this.floorTex.offset.y = (now * 0.0001) % 1;
    }
    if (this.trapTex) {
      this.trapTex.rotation = now * 0.0005;
    }
    if (this.keyTex) {
      this.keyTex.offset.y = (now * 0.001) % 1;
    }
  }

  updateParticles(particles) {
    if (!this.particleSystem) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(2000 * 3), 3));
      geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(2000 * 3), 3));
      
      const mat = new THREE.PointsMaterial({ 
        size: 0.08, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending 
      });
      
      this.particleSystem = new THREE.Points(geo, mat);
      this.scene.add(this.particleSystem);
    }

    const pos = this.particleSystem.geometry.attributes.position.array;
    const col = this.particleSystem.geometry.attributes.color.array;
    
    let i = 0;
    const T = window._TILE;
    for (const p of particles._active) {
      if (p.life <= 0) continue;
      
      // Particles are in world pixel coordinates in original game, convert to grid
      const px = p.x / T;
      const py = p.y / T;
      // We don't have z in old particles, let's use a parabola based on life for bounce
      const pz = 0.1 + Math.sin(p.life * Math.PI) * 0.4;

      pos[i*3] = px;
      pos[i*3+1] = pz;
      pos[i*3+2] = py;

      const cHex = this.getColor(p.color);
      col[i*3] = ((cHex >> 16) & 255) / 255;
      col[i*3+1] = ((cHex >> 8) & 255) / 255;
      col[i*3+2] = (cHex & 255) / 255;
      
      i++;
    }
    
    this.particleSystem.geometry.setDrawRange(0, i);
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
    this.particleSystem.geometry.attributes.color.needsUpdate = true;
  }

  render(player, dt, maze, gridW, gridH, keys, checkpoints, doors, portals, traps, exit, particles) {
    // Sync camera to player
    const bob = player.moving ? Math.sin(player.walkCycle) * 0.03 : Math.sin(player.breathe) * 0.01;
    this.camera.position.set(player.x, 0.5 + bob, player.y);
    
    // player.facing is angle in XZ plane.
    // In Three.js, looking down -Z axis is default.
    // We want to look at position (x + cos, 0, y + sin)
    const targetX = player.x + Math.cos(player.facing);
    const targetZ = player.y + Math.sin(player.facing);
    this.camera.lookAt(targetX, 0.5 + bob, targetZ);

    this.playerLight.position.copy(this.camera.position);

    // Update game objects
    this.updateEntities(keys, checkpoints, doors, portals, traps, exit);
    this.updateParticles(particles);

    // Render via composer for bloom
    this.composer.render(dt);
  }
}
