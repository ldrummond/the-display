/*************************************
 * 
 * 
 * 
 * 
*************************************/

/*-><*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dpi = window.devicePixelRatio; 
// const dpi = 1; 
let inner_width = 0;
let inner_height = 0;
let body_height = 0;
let ants = []
const ant_speed = 10;
const edge_boundary = 20;
const poem_el = document.getElementById("poem");
const text_color = 'white';
const text_stroke = 'black';

onResize(); 
window.addEventListener('resize', onResize, true);

// TODO: Fix high dpi
function onResize() {
  inner_width = window.innerWidth;
  inner_height = window.innerHeight;
  body_height = document.body.getBoundingClientRect().height;
  canvas.width = inner_width * dpi;
  canvas.height = body_height * dpi;
  // canvas.style.width = inner_width + 'px';
  // canvas.style.height = body_height + 'px';
  ctx.scale(dpi, dpi); 
}

const states = {
  SEARCHING: "SEARCHING",
  FETCHING: "FETCHING",
  RETURNING: "RETURNING"
}

class Ant {
  constructor() {
    this.state = states.SEARCHING;
    this.x = inner_width * 3 / 4;
    this.y = inner_height / 2;
    this.direction = Math.PI * 2 * Math.random();
  }

  isOutOfBounds() {
    return (
      this.x < edge_boundary ||
      this.y < edge_boundary ||
      this.x > inner_width - edge_boundary ||
      this.y > inner_height - edge_boundary
    )
  }
  
  update() {
    // if(this.isOutOfBounds()) this.direction =
    this.x += Math.cos(this.direction) * ant_speed;
    this.y += Math.sin(this.direction) * ant_speed;

    // Search for chunk
    switch(this.state) {
      case states.SEARCHING:
        

    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.direction);
    ctx.fillRect(0, 0, 6, 4);
    ctx.restore();

    switch(this.state) {
      case "SEARCHING":
      case "RETURNING":
    }
  }
}

const makeAnt = function() {
  return new Ant();
}

setInterval(() => {
  if(ants.length < 12) {
    addAnt();
  }
}, 1200);

function addAnt() {
  const new_ant = makeAnt();
  ants.push(new_ant);
}

let previous_time; 
let fps = 10;

startAnimation();

function startAnimation() {
  previous_time = Date.now(); 
  requestAnimationFrame(tick);
}

function tick() {
  let now = Date.now(); 

  if((now - previous_time) > (1000 / fps)) {
    previous_time = now;  
    // do stuff
    // console.log('tick', ants);
    ants.forEach(ant => {
      ant.update();
    });
    ants.forEach(ant => {
      ant.draw();
    });
  }

  requestAnimationFrame(tick);
}

ctx.fillStyle = text_color;
ctx.strokeStyle = text_stroke;

matchHTMLText('p');

drawNest();

function drawNest() {
  const center_x = inner_width / 2 + inner_width / 4;
  const center_y = inner_height / 2;
  const num_spindles = Math.floor(Math.random() * 4) + 3;
  const spindle_width = 20;
  const spindle_length = inner_width * 1 / 5;
  const rings = Math.floor(Math.random() * 2) + 1;

  ctx.save();
  ctx.translate(center_x, center_y)
  const start_angle = Math.random() * Math.PI;
  ctx.rotate(start_angle);

  // draw spindles
  for (let i = 0; i < num_spindles; i++) {
    const rotation_rad = (Math.PI * 2) / num_spindles;
    ctx.rotate(rotation_rad);
    ctx.fillRect(0, -spindle_width / 2, spindle_length, spindle_width);
    ctx.beginPath();
    ctx.arc(spindle_length , 0, Math.random() * spindle_width + spindle_width, 0, Math.PI * 2);
    ctx.fill();
  }

  // draw rings
  for (let i = 0; i < rings; i++) {
    ctx.beginPath();
    ctx.lineWidth = Math.random() * spindle_width * 1.5 + spindle_width;
    ctx.arc(0, 0, Math.random() * spindle_length, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore()
}

function matchHTMLText(selector) {
  const text_el             = document.querySelector(selector);
  const el_styles           = getComputedStyle(text_el);
  const el_rect             = text_el.getBoundingClientRect();
  const el_font             = el_styles.fontFamily;
  const el_font_size        = el_styles.fontSize;
  const el_letter_spacing   = el_styles.letterSpacing;
  const el_margin           = el_styles.marginBottom.split("px")[0];
  const el_vertical_spacing = parseInt(el_styles.lineHeight.split("px")[0]);
  ctx.textBaseline = 'middle';
  ctx.font = el_font_size + ' ' + el_font;
  ctx.letterSpacing = el_letter_spacing; 
  const el_spans = text_el.querySelectorAll("span");

  el_spans.forEach((span_el, i) => {
    const wrapped_txt = wrapText(ctx, span_el.textContent, el_rect.width);
    wrapped_txt.forEach((line, li) => {
      ctx.fillText(line, el_rect.left, el_rect.top + window.scrollY + el_margin * (i + li));
    })
  })

  text_el.style.color = 'rgba(0, 0, 0, 0)';
}

function wrapText(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
          currentLine += " " + word;
      } else {
          lines.push(currentLine);
          currentLine = word;
      }
  }
  lines.push(currentLine);
  return lines;
}

function xyToIndex(x, y, width) {
  return Math.floor(width * y) + x; 
}

function indexToXY(index, width) {
  return { x: index % width, y: Math.floor(index / width) }
}

convertTextToBits();

function convertTextToBits() {
  const capture_width = canvas.width;
  const capture_height = canvas.height;

  const image_data = ctx.getImageData(0, 0, capture_width, capture_height);
  
  ctx.fillStyle = text_color;

  const active_pixels = {};
  const sourceBuffer32 = new Uint32Array(image_data.data.buffer);
  for (let i = 0; i < sourceBuffer32.length; i++) {
    const is_not_black = sourceBuffer32[i] != (0,0,0,0);
    if(is_not_black) {
      active_pixels[i] = 'active';
    }
  }
  
  // ctx.clearRect(0, 0, capture_width, capture_height);
  // Object.entries(active_pixels).forEach(([index, value]) => {
  //   const {x, y} = indexToXY(index, capture_width);
  //   ctx.fillRect(x / dpi, y / dpi, 1 / dpi, 1 / dpi);
  // })

  // function redrawBits(ran) {
  //   active_pixels.forEach(({x, y}) => {
  //     if(Math.random() < ran) {
  //       const ranx = (Math.random() - 0.5) * 100;
  //       const rany = (Math.random() - 0.5) * 100;
  //       ctx.fillRect(x / dpi + ranx, y / dpi + rany, 1 / dpi, 1 / dpi);
  //     }
  //     else {
  //       ctx.fillRect(x / dpi, y / dpi, 1 / dpi, 1 / dpi);
  //     }
  
  //     // console.log(x, y);
  //   })
  // }
  // let ran = 0.1;
  // redrawBits(0);

  // setInterval(() => {
  //   ran += 0.1; 
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   redrawBits(ran);
  // }, 2000);
}