import kaboom from "kaboom"

kaboom({
  background: [0,59,89],
  width: 800,
  height: 600,
  stretch: true
})

loadSound("music", "sounds/music.mp3")

loadSound("score", "sounds/score.mp3")

loadSound("upgrade", "sounds/upgrade.mp3")

loadSprite("ufo", "sprites/ufo.png")

loadSprite("alien", "sprites/alien.png")

loadSprite("bot", "sprites/bot.png")

for (let step = 1; step <= 15; step++) {
  let name = "c"
  let image_type = "png"
  loadSprite((name+step), ("sprites/"+name+step+"."+image_type))
}

for (let step = 1; step <= 50; step++) {
  let name = "ws"
  let image_type = "png"
  loadSprite((name+step), ("sprites/"+name+step+"."+image_type))
}

for (let step = 1; step <= 3; step++) {
  let name = "leftbird"
  let image_type = "png"
  loadSprite((name+step), ("sprites/"+name+step+"."+image_type))
  name = "rightbird"
  loadSprite((name+step), ("sprites/"+name+step+"."+image_type))
}

function animate() {
  return {
    update() {
      if (this.pause) {
        return
      }
      for (let step = 0; step < (this.tot_num_img); step++) {
        if (this.update_counter > (this.transition_delay * this.frame_num) && this.update_counter <= (this.transition_delay * (this.frame_num + 1))) {
          this.use(sprite(this.name+`${this.frame_num}`))
          this.frame_num += 1
        }
      }
      this.update_counter += 1
      if (this.frame_num > this.tot_num_img) {
          this.frame_num = 1
          this.update_counter = 0
        }
      },
    animate() {
			  this.pause = false
    }
  }
}

const bgmusic = play("music", {
	  loop: true,
  })
volume(0.5)
bgmusic.play()

function addButton(txt, p, f) {

	const btn = add([
	  text(txt),
    pos(p),
		area({ cursor: "pointer", }),
		scale(.5),
    z(3),
		origin("center"),
	])

	btn.onClick(f)

	btn.onUpdate(() => {
		if (btn.isHovering()) {
			btn.color = rgb(
				rand(0,255),
				rand(0,255),
				rand(0,255),
			)
			btn.scale = vec2(1.2)
		} else {
			btn.scale = vec2(1)
			btn.color = rgb(255,255,255)
		}
	})
}

var session_total = 0
var player_dir = "leftbird"
var unlocked = 250
var score = 0
var score_check = 0
var hardmode = false
var player_img = "ufo"

scene("start", () => {
  score = 0
  const warp = add([
	  sprite("ws1"),
	  pos(center()),
    origin("center"),
    scale(2.2),
    opacity(.88),
    z(2),
    
    animate(),
    {
      pause: false,
      name: "ws",
      tot_num_img: 50,
      frame_num: 1,
      transition_delay: 3,
      update_counter: 0
    }
  ])
  
  addButton( "Survival", (center().sub(vec2(0,height()/6))), () => {
    cursor("none")
    play("upgrade", { volume: 0.05 })
    go("game")
  })

  addButton( "Hard Mode", (width()/2,2*height()/3), () => {
    cursor("none")
    play("upgrade", { volume: 0.05 })
    hardmode = true
    go("game")
  })
  
})

scene("game", () => {
  if (score_check === 1) {
    score += score_check
    session_total += score_check
    if (score === 60 || score === 100 || session_total === 250) {
      play("upgrade", { volume: 0.1 })
    } else {
      play("score", { volume: 0.2 })
    }
  }
  score_check = 0
  let SCALE = .25
  let td = 6
  let ws = 3
  let ufog = 0.0005
  if (score >= 20 && score < 40) {
    td = 5
  }
  if (score >= 40 && score < 60) {
    td = 4
    ws = 2
    ufog = 0.001
  }
  if (score >= 60 && score < 80) {
    td = 3
    ws = 2
    ufog = 0.001
  }
  if (score >= 80) {
    td = 3
    ws = 1
    ufog = 0.0015
  }
  if (score >= 100 || hardmode) {
    td = 2.5
    ws = 1
    ufog = 0.0015
  }

  const scoreLabel = add([
      text(score),
      scale(.7),
      color(255,255,255),
      pos(7, 7),
      z(10)
  ])

  const player = add([
    sprite(player_img),
    pos(center()),
    origin("center"),
    scale(0.25),
    z(20),
    rotate(0),
    area(),
    "player",
    animate(),
    {
      pause: true,
      name: player_dir,
      tot_num_img: 3,
      frame_num: 1,
      transition_delay: 3,
      update_counter: 0
    }
  ])

  if (session_total >= unlocked) {
    player.pause = false
  }

  const coll_check = add([
    sprite("ufo"),
    pos(center()),
    origin("center"),
    scale(.2),
    z(1),
    opacity(0),
    area(),
    "coll_check"
  ])

  const rings = add([
	  sprite("c1"),
	  pos(center()),
    origin("center"),
    color(250,250,210),
    scale(1),
    z(3),
    opacity(.1),
    animate(),
    {
      pause: false,
      name: "c",
      tot_num_img: 15,
      frame_num: 2,
      transition_delay: td,
      update_counter: 0
    }
  ])

  const warp = add([
	  sprite("ws1"),
	  pos(center()),
    origin("center"),
    scale(2.2),
    opacity(.88),
    z(2),
    
    animate(),
    {
      pause: false,
      name: "ws",
      tot_num_img: 50,
      frame_num: 1,
      transition_delay: ws,
      update_counter: 0
    }
  ])

  let SCALE_DIR = 1

  onUpdate(() => {
    if (rings.frame_num === 1) {
      go("end")
    }
    coll_check.pos = rings.pos
    if (rings.frame_num === 2) {
      rings.opacity = .1
      rings.pos.x = rand(width()/8,7*width()/8)
      rings.pos.y = rand(height()/8,7*height()/8)
    }
    if (rings.opacity < 1) {
      if (rings.transition_delay === 6) {
        rings.opacity += .01
      }
      if (rings.transition_delay === 5) {
        rings.opacity += .015
      }
      if (rings.transition_delay === 4) {
        rings.opacity += .02
      }
      if (rings.transition_delay === 3) {
        rings.opacity += .04
      }
      if (rings.transition_delay === 2.5) {
        rings.opacity += .06
      }
    }
    if (rings.frame_num >= 14) {
      player.onCollide("coll_check", (coll_check) => {
        destroy(coll_check)
        if (session_total >= unlocked) {
          player_img = player_dir+"1"
        }
        score_check = 1
        go("game")      
      })
    }
    player.moveTo(mousePos())
    player.angle = ((-0.225)*player.pos.x) + 90
    if (session_total >= unlocked) {
      if (player.pos.x >= width()/2) {
        player_dir = "rightbird"
        player.name = player_dir
      }
      else {
        player_dir = "leftbird"
        player.name = player_dir
      }
    }
    if (SCALE_DIR === 1) {
      SCALE += ufog
    }
    if (SCALE_DIR === -1) {
      SCALE -= ufog
    }
    if (SCALE >= 0.25) {
      SCALE_DIR = -1
    }
    if (SCALE <= 0.2) {
      SCALE_DIR = 1
    }
    player.use(scale(SCALE))
  })
  //debug.inspect = true 
})

scene("end", () => { 
  if (score >= 60 && score < 100 && player_img != "bot") {
    player_img = "alien"
  }
  
  if (score >= 100) {
    player_img = "bot"
  }

  if (session_total >= unlocked) {
    player_img = player_dir+"1"
  }
  
  const warp = add([
	  sprite("ws1"),
	  pos(center()),
    origin("center"),
    scale(2.2),
    opacity(.88),
    z(2),
    animate(),
    {
      pause: false,
      name: "ws",
      tot_num_img: 50,
      frame_num: 1,
      transition_delay: 2,
      update_counter: 0
    }
  ])

  const player = add([
    sprite(player_img),
    pos(center()),
    origin("center"),
    scale(0.25),
    z(20),
    rotate(0),
    area(),
    "player",
    animate(),
    {
      pause: true,
      name: player_dir,
      tot_num_img: 3,
      frame_num: 1,
      transition_delay: 4,
      update_counter: 0
    }
  ])

  if (session_total >= unlocked) {
    player.pause = false
  }
  
  const scoreLabel = add([
    text(score),
    scale(1),
    color(255,255,255),
    pos(width()/2,2*height()/3),
    origin("center"),
    z(10)
  ])

  addButton( "Anotha One", center(), () => {
    score = 0
    if (session_total >= unlocked) {
      player_img = player_dir+"1"
    }
    go("game")
  })

  onUpdate(() => {
    cursor("none")
    player.moveTo(mousePos())
    player.angle = ((-0.225)*player.pos.x) + 90
    if (session_total >= unlocked) {
      if (player.pos.x >= width()/2) {
        player_dir = "rightbird"
        player.name = player_dir
      }
      else {
        player_dir = "leftbird"
        player.name = player_dir
      }
    }
  })
})

function begin() {
  go("start");
};

begin()