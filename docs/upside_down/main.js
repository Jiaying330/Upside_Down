title = "UPSIDE DOWN";
3
description = `
[Tap]     Jump
[Hold]    Rise
[Release] Change Zone
`;

characters = [
// player
 `
 b  b
 b  b
bbbbbb
bb b b
bb b b
bbbbbb
`,`
RRRRRR
RR R R
RR R R
RRRRRR
 R  R
 R  R
 `,`
 ll
 ll
 ll
 ll
 ll
 `,
 //bullet
 `
 l rrrr
 l rrrrr
 l rrrrr
 l rrrr
 `,
 //coin_1 e
 `
 LLLL
LyyyyL
LyyyyL
LyyyyL
LyyyyL
 LLLL
 `,//coin_2 f
 `
  LLLL
 Ly  yL
 Ly  yL
 Ly  yL
 Ly  yL
  LLLL
 `,
 //大炮 g
 `
  rr
 rrrr
yrrrry
y    y
y    y
 `
];

const G = {
  WIDTH: 250,
  HEIGHT: 200 
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  theme: "pixel",
  isReplayEnabled: true,
  isPlayingBgm: true,
  seed: 3,
};

/**
 * @type { {pos: Vector, width: number}[] }
 */
let floors;
let nextFloorDist;

/**
 * type {{
 * pos: Vector,
 * vx: number
 * }[]
 * }
 */
let bullets;
let nextBulletDist;
let coins_1;
let nextCoinDist_1;
let coins_2;
let nextCoinDist_2;

/**
 * type {{
 * pos: Vector,
 * vx: number,
 * speed: number,
 * angle: number,
 * fireTick: number
 * }[]
 * }
 */
let booms;
let nextBoomDist;

/**
 * @typedef {{
 * pos: Vector,
 * vy: number
 * }} Player
 */

/**
 * @type { Player }
 */
let player_1;
let player_2;
let zone = 0;
let isJumping = true;
function update() {
  // // display middle bar
  color("light_yellow");
  rect(0, 100, 250, 1);

  // initiate variables
  if (!ticks) {
    floors = [
      { pos: vec(70, 10), width: 90},
      { pos: vec(150, 50), width: 90},
    ];
    nextFloorDist = 0;
    player_1 = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
      vy: 0
    };
    player_2 = {
      pos: vec(player_1.pos.x, player_1.pos.y + 10),
      vy: 0
    };
    bullets = [];
    nextBulletDist = 0;

    booms = [];
    nextBoomDist = 0;

    coins_1 = [];
    nextCoinDist_1 = 0;

    coins_2 = [];
    nextCoinDist_2 = 0;
  }
  const scr = difficulty;
  nextFloorDist -= scr;
  if (isJumping) {
    if(input.isJustPressed) {
      play("jump");
      play("hit");
      player_1.vy = -2 * sqrt(difficulty);
    }
    const pp = vec(player_1.pos);
    if (input.isPressed) {
      player_1.vy += 0.005 * difficulty;
      if (zone == 0) {
        player_1.pos.y -= player_1.vy;
      } else {
        player_1.pos.y += player_1.vy;
      }
    } else {
      player_1.vy += 0.2 * difficulty;
      if (zone == 0) {
        player_1.pos.y -= player_1.vy;
      } else {
        player_1.pos.y += player_1.vy;
      }
    }
    const op = vec(player_1.pos).sub(pp).div(9);
    
    color("white");
    times(9, () => {
      pp.add(op);
       box(pp, 6);
    });
  } else {
    if (input.isJustPressed) {
      play("jump");
      player_1.vy = -2 * sqrt(difficulty);
      isJumping = true;
    }
  }
  
  //check which zone
  if (input.isJustReleased) {
    if(player_1.pos.y < G.HEIGHT * 0.5) {
    zone = 0;
    } else {
    zone = 1;
    }
  }
  
  // generate moving floor
  if (nextFloorDist < 0) {
    const width = rnd(40, 80);
    floors.push({
      pos: vec(200 + width / 2, rndi(10, 50)),
      width
    });
    nextFloorDist += width + rnd(10, 30);
  }
  remove(floors, (f) => {
    f.pos.x -= scr;
    color("light_black");
    const c = box(f.pos, f.width, 4).isColliding.rect;
    if(player_1.vy > 0 && c.white) {
      player_1.pos.y = f.pos.y + 5;
      isJumping = false;
      player_1.vy = 0;
    }
    return f.pos.x < -f.width / 2;
  });

  // player standing on floor
  color("transparent");
  if (!isJumping) {
    if(!box(player_1.pos.x, player_1.pos.y + 4, 9, 2).isColliding.rect.light_black) {
      isJumping = true;
    }
  }

   // display player
  color("black");
  char("a", player_1.pos);
  color("black");
  char("c", vec(player_1.pos.x-1, player_1.pos.y + 4));
  player_2.pos = vec(player_1.pos.x, player_1.pos.y + 10);
  color("black");
  char("b", player_2.pos);

  // bullets
  nextBulletDist += scr;
  if (nextBulletDist > 250) {
    bullets.push({ pos: vec(0, rndi(10,100)), vx: rnd(1, difficulty) * 0.3});
    nextBulletDist -= rnd(100, 300) / sqrt(difficulty);
  }

  color("black");
  remove(bullets, (b) => {
    b.pos.x += b.vx + scr;
    const c = char("d", b.pos).isColliding.char;
    if(c.a || c.b) {
      color("red");
      particle(b.pos);
      end();
    }
    return b.pos.x > 250;
  });

  // booms
  nextBulletDist += scr;

  // coins
  nextCoinDist_1 -= scr;
  if (nextCoinDist_1 < 0) {
    coins_1.push ({ pos: vec(250, rndi(10, 100)), vx: rnd(1, difficulty) * 0.2});
    nextCoinDist_1 += rnd(70, 200) / sqrt(difficulty);
  }

  color("black");
  remove(coins_1, (c) => {
    c.pos.x -= c.vx + scr;
    const con = char("e", c.pos).isColliding.char;
    if(con.a || con.b) {
      play("coin");
      addScore(1);
      return true;
    }
    return c.pos.x < -1;
  });

  nextCoinDist_2 -= scr;
  if (nextCoinDist_2 < 0) {
    coins_2.push ({ pos: vec(250, rndi(100, 190)), vx: rnd(1, difficulty) * 0.2});
    nextCoinDist_2 += rnd(30, 60) / sqrt(difficulty);
  }

  color("black");
  remove(coins_2, (c) => {
    c.pos.x -= c.vx + scr;
    const con = char("f", c.pos).isColliding.char;
    if(con.a || con.b) {
      play("coin");
      addScore(3);
      return true;
    }
    return c.pos.x < -1;
  });

  //bomb
  nextBoomDist -= scr;
  if(nextBoomDist < 0) {
    const vx = rnd() < 0.5 ? -1 : 1;
    booms.push({ 
      pos: vec(rndi(10, 240), 195), 
      vx, 
      speed: rnd(1, 1.5) * sqrt(difficulty), 
      angle: -PI/2, 
      fireTick: rnd(50, 400) / difficulty
    });
    nextBoomDist += rnd(100, 500) / sqrt(difficulty);
  }

  color("black");
  remove(booms, (b) => {
    if(b.fireTick > 0) {
      console.log("b.fireTick: " + b.fireTick);
      // b.pos.x += b.vx * 0.1 * sqrt(difficulty);
      const b_angle = b.pos.angleTo(player_1.pos);
      b.angle = b_angle;
      b.fireTick--;
      const c = char("g", b.pos);
    } else {
      play("laser");
      b.pos.add(vec(b.speed, 0).rotate(b.angle));
      const c = char("g", b.pos).isColliding.char;
      const c_1 = char("g", b.pos).isColliding.rect;
      if(c.a || c.b || c_1.light_yellow) {
        play("explosion");
        particle(b.pos);
        if(c.a || c.b) {
          end();
        }
        return true;
      }
    }
  });

  // check out of bound
  if(player_2.pos.y < 0 || player_1.pos.y > G.HEIGHT) {
    play("explosion");
    end();
  }
}
