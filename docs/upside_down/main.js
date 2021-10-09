title = "UPSIDE DOWN";
3
description = `
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
 `,`
 l rrrr
 l rrrrr
 l rrrrr
 l rrrr
 `
];

const G = {
  WIDTH: 250,
  HEIGHT: 150
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  isReplayEnabled: true,
  isPlayingBgm: true,
  seed: 1,
};

/**
 * @type { {pos: Vector, width: number}[] }
 */
let floors;
let nextFloorDist;

/** @type {Vector[]} */
let coins;

/**
 * type {{
 * pos: Vector,
 * vx: number
 * }[]
 * }
 */
let bullets;
let nextBulletDist;

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
  // display middle bar
  color("light_yellow");
  rect(0, 60, 250, 40);

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
    
  }

  const scr = difficulty;
  nextFloorDist -= scr;

  // if(player_1.pos.y < G.HEIGHT * 0.5) {
  //   zone = 0;
  // } else {
  //   zone = 1;
  // }
  if (zone == 0) {// if the player is at zone 0
    if (isJumping) {
      if (input.isJustPressed) {
        play("jump");
        play("hit");
        player_1.vy = -2 * sqrt(difficulty);
      }
      const pp = vec(player_1.pos);
      player_1.vy += (input.isPressed ? 0.05 : 0.2) * difficulty;
      player_1.pos.y -= player_1.vy;
      const op = vec(player_1.pos).sub(pp).div(9);
      color("white");
      times(9, () => {
        pp.add(op);
        box(pp, 6);
      });
    } else {
      if (input.isJustPressed) {
        play("jump");
        player_1.vy = 2 * sqrt(difficulty);
        isJumping = true;
      }
    }
  } else { // if the player is at zone 1
    if (isJumping) {
      if (input.isJustPressed) {
        play("jump");
        play("hit");
        player_1.vy = -2 * sqrt(difficulty);
      }
      const pp = vec(player_1.pos);
      player_1.vy += (input.isPressed ? 0.05 : 0.2) * difficulty;
      player_1.pos.y += player_1.vy;
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

  if(player_1.pos.y <= G.HEIGHT * 0.5) {
    zone = 0;
  } else {
    zone = 1;
  }

  // bullets
  nextBulletDist += scr;
  if (nextBulletDist > 250) {
    bullets.push({ pos: vec(0, rndi(10,50)), vx: rnd(1, difficulty) * 0.3});
    nextBulletDist -= rnd(50, 80) / sqrt(difficulty);
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
    return b.pos.x > 250
  });

  // check out of bound
  if(player_2.pos.y < 0 || player_1.pos.y > 150) {
    play("explosion");
    end();
  }
}
