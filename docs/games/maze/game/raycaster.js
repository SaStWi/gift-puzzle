import { drawPortal, drawKey, drawTrap, drawCheckpoint, drawExit, drawDoor } from './drawWorld.js';

export function renderRaycaster(ctx, W, H, maze, gridW, gridH, player, keys, checkpoints, doors, portals, traps, exit, particles, gt) {
  
  // Floor and ceiling
  ctx.fillStyle = '#0f1115'; // Ceiling
  ctx.fillRect(0, 0, W, H / 2);
  ctx.fillStyle = '#1c2028'; // Floor
  ctx.fillRect(0, H / 2, W, H / 2);

  const RAY_W = 640;
  const stripW = W / RAY_W;
  const ZBuffer = new Float32Array(RAY_W);

  const posX = player.x;
  const posY = player.y;
  const dirX = Math.cos(player.facing);
  const dirY = Math.sin(player.facing);
  
  const fovRatio = 0.66;
  const planeX = -dirY * fovRatio;
  const planeY = dirX * fovRatio;

  const bob = player.moving ? Math.sin(player.walkCycle) * 0.05 : Math.sin(player.breathe) * 0.02;
  const pitch = bob * H; 

  for (let x = 0; x < RAY_W; x++) {
    const cameraX = 2 * x / RAY_W - 1;
    const rayDirX = dirX + planeX * cameraX;
    const rayDirY = dirY + planeY * cameraX;

    let mapX = Math.floor(posX);
    let mapY = Math.floor(posY);
    let sideDistX, sideDistY;
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);
    let perpWallDist;
    let stepX, stepY;
    let hit = 0;
    let side = 0; 
    let doorHit = null;

    if (rayDirX < 0) { stepX = -1; sideDistX = (posX - mapX) * deltaDistX; } 
    else             { stepX = 1;  sideDistX = (mapX + 1.0 - posX) * deltaDistX; }
    if (rayDirY < 0) { stepY = -1; sideDistY = (posY - mapY) * deltaDistY; } 
    else             { stepY = 1;  sideDistY = (mapY + 1.0 - posY) * deltaDistY; }

    while (hit === 0) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX; mapX += stepX; side = 0;
      } else {
        sideDistY += deltaDistY; mapY += stepY; side = 1;
      }
      
      if (mapX < 0 || mapX >= gridW || mapY < 0 || mapY >= gridH) {
        hit = 1; break;
      }

      if (maze[mapY][mapX] === 1) {
        hit = 1;
      } else {
        for (const d of doors) {
           if (Math.floor(d.x) === mapX && Math.floor(d.y) === mapY && d.openPct < 1) {
              hit = 1; doorHit = d; break;
           }
        }
      }
    }

    if (side === 0) perpWallDist = (sideDistX - deltaDistX);
    else            perpWallDist = (sideDistY - deltaDistY);

    ZBuffer[x] = perpWallDist;

    const lineHeight = Math.floor(H / perpWallDist);
    const drawStart = -lineHeight / 2 + H / 2 + pitch;

    if (doorHit) {
       ctx.fillStyle = side === 1 ? shadeColor(doorHit.color, -30) : doorHit.color;
    } else {
       const baseC = side === 1 ? [28, 32, 40] : [52, 59, 71]; 
       const fog = Math.min(1, perpWallDist / 12);
       const r = Math.floor(baseC[0] * (1 - fog) + 15 * fog);
       const g = Math.floor(baseC[1] * (1 - fog) + 17 * fog);
       const b = Math.floor(baseC[2] * (1 - fog) + 21 * fog);
       ctx.fillStyle = `rgb(${r},${g},${b})`;
    }

    ctx.fillRect(x * stripW, Math.max(0, drawStart), stripW + 0.8, Math.min(H, lineHeight));
    
    // Grid lines for blocks
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x * stripW, Math.max(0, drawStart), stripW + 0.8, 3);
    ctx.fillRect(x * stripW, Math.min(H, drawStart + lineHeight) - 3, stripW + 0.8, 3);
  }

  // Draw Sprites
  const sprites = [];
  
  for (const k of keys) {
     if (!k.collected) sprites.push({ type: 'key', obj: k, x: k.x + 0.5, y: k.y + 0.5 });
  }
  for (const p of portals) {
     sprites.push({ type: 'portal', obj: p, x: p.x + 0.5, y: p.y + 0.5 });
  }
  for (const c of checkpoints) {
     sprites.push({ type: 'checkpoint', obj: c, x: c.x + 0.5, y: c.y + 0.5 });
  }
  sprites.push({ type: 'exit', obj: exit, x: exit.x + 0.5, y: exit.y + 0.5 });
  for (const t of traps) {
     sprites.push({ type: 'trap', obj: t, x: t.x + 0.5, y: t.y + 0.5 });
  }
  for (const p of particles._active) {
     if (p.life > 0) {
        sprites.push({ type: 'particle', obj: p, x: p.x / window._TILE, y: p.y / window._TILE });
     }
  }

  sprites.forEach(s => { s.dist = (posX - s.x)**2 + (posY - s.y)**2; });
  sprites.sort((a, b) => b.dist - a.dist);

  const invDet = 1.0 / (planeX * dirY - dirX * planeY);
  const T = window._TILE;

  for (const s of sprites) {
    const spriteX = s.x - posX;
    const spriteY = s.y - posY;

    const transformX = invDet * (dirY * spriteX - dirX * spriteY);
    const transformY = invDet * (-planeY * spriteX + planeX * spriteY);

    if (transformY > 0.1) {
      const spriteScreenX = Math.floor((W / 2) * (1 + transformX / transformY));
      const spriteHeight = Math.abs(Math.floor(H / transformY));
      const spriteWidth = spriteHeight; // mostly square aspect ratio
      
      const rayIdx = Math.floor(spriteScreenX / stripW);
      // Check if sprite is visible on screen and not completely occluded behind a wall
      if (spriteScreenX > -spriteWidth && spriteScreenX < W + spriteWidth) {
         let visible = false;
         // Check occlusion by sampling the center ZBuffer
         if (rayIdx >= 0 && rayIdx < RAY_W) {
            if (transformY < ZBuffer[rayIdx] + 0.5) visible = true;
         } else {
            visible = true; // off edge of screen slightly, allow draw
         }
         
         if (visible) {
             ctx.save();
             
             let vMove = 0;
             if (s.type === 'key' || s.type === 'portal') vMove = -spriteHeight * 0.1;
             if (s.type === 'trap' || s.type === 'checkpoint' || s.type === 'exit') vMove = spriteHeight * 0.4;
             
             ctx.translate(spriteScreenX, H/2 + pitch + vMove);
             
             const scale = spriteHeight / T;
             ctx.scale(scale, scale);
             ctx.translate(-T/2, -T/2);
             
             if (s.type === 'key') drawKey(ctx, s.obj, T);
             else if (s.type === 'portal') drawPortal(ctx, s.obj, T, gt);
             else if (s.type === 'checkpoint') drawCheckpoint(ctx, s.obj, T, gt);
             else if (s.type === 'exit') drawExit(ctx, s.obj, T, gt);
             else if (s.type === 'trap') drawTrap(ctx, s.obj, T, gt);
             else if (s.type === 'particle') {
                 ctx.translate(T/2, T/2); 
                 ctx.globalAlpha = s.obj.life / s.obj.maxLife;
                 ctx.globalCompositeOperation = 'screen';
                 ctx.fillStyle = s.obj.color;
                 ctx.shadowColor = s.obj.glow ? (s.obj.glowColor || s.obj.color) : 'transparent';
                 ctx.shadowBlur = s.obj.glow ? 15 : 0;
                 if (s.obj.shape === 'spark') {
                   ctx.beginPath();
                   ctx.ellipse(0, 0, s.obj.r * 2.5, s.obj.r * 0.5, Math.atan2(s.obj.vy, s.obj.vx), 0, Math.PI*2);
                   ctx.fill();
                 } else {
                   ctx.beginPath();
                   ctx.arc(0, 0, s.obj.r, 0, Math.PI*2);
                   ctx.fill();
                 }
             }
             ctx.restore();
         }
      }
    }
  }
}

function shadeColor(color, percent) {
    if (!color) return '#000';
    let r,g,b;
    if (color.length === 4) {
      r = parseInt(color[1]+color[1], 16);
      g = parseInt(color[2]+color[2], 16);
      b = parseInt(color[3]+color[3], 16);
    } else if (color.length === 7) {
      r = parseInt(color.substring(1,3),16);
      g = parseInt(color.substring(3,5),16);
      b = parseInt(color.substring(5,7),16);
    } else {
      return color;
    }
    
    r = parseInt(r * (100 + percent) / 100);
    g = parseInt(g * (100 + percent) / 100);
    b = parseInt(b * (100 + percent) / 100);
    r = (r<255)?r:255;  
    g = (g<255)?g:255;  
    b = (b<255)?b:255;
    r = (r>0)?r:0;
    g = (g>0)?g:0;
    b = (b>0)?b:0;
    
    let RR = ((r.toString(16).length==1)?"0"+r.toString(16):r.toString(16));
    let GG = ((g.toString(16).length==1)?"0"+g.toString(16):g.toString(16));
    let BB = ((b.toString(16).length==1)?"0"+b.toString(16):b.toString(16));
    return "#"+RR+GG+BB;
}
