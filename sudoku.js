//let data = "000010020000300400005006007089000000056000300700005008000040010007200000060008009";
//let data = "003050009400000000080007100000600800300090002000001070504030020060000000032000005";
//let data = "000000000000000001001023040000500020002041600070000000006034702030800060900050030";
//let data = "050000000000600000001708000000032000008500400000000000006000073400000000000010002";
let data = "000000000000000001000001234000000000002056070040087500003109020504300000610040003";

let color_data = Array.apply(null, Array(81)).map(function () { return 0; });

let colors = ['#fff', '#ccf', '#0f0', '#ff0'];

function transpose() {
  let data2 = "";
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      data2 = data2 + data[i + j * 9];
    }
  }
  data = data2;
  draw();
}

let gridsize = 48;
let margin = 8;

function onLoad() {
  let canvas = document.getElementById('mycanvas');
  canvas.width = gridsize * 9 + margin * 2;
  canvas.height = gridsize * 9 + margin * 2;
  draw();
}

function show_error(msg) {
  document.getElementById('error_message').innerHTML = msg;
}

function show_numbers(msg) {
  let str = "123456789<BR>";
  for (let i = 1; i < 10; i++) {
    str += data.split(String(i)).length - 1;
  }
  document.getElementById('numbers').innerHTML = str;
}

function draw_hidden(pos, num, ctx) {
  let ix = pos % 9;
  let iy = Math.floor(pos / 9);
  let sx = ix * gridsize + (num % 3) * 14 + 9 + margin;
  let sy = iy * gridsize + Math.floor(num / 3) * 14 + 9 + margin;
  ctx.beginPath();
  ctx.arc(sx, sy, 8, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.stroke();
}


function draw_circle(pos, num, ctx) {
  let ix = pos % 9;
  let iy = Math.floor(pos / 9);
  let sx = ix * gridsize + (num % 3) * 14 + 9 + margin;
  let sy = iy * gridsize + Math.floor(num / 3) * 14 + 9 + margin;
  ctx.beginPath();
  ctx.arc(sx, sy, 8, 0, Math.PI * 2, false);
  ctx.stroke();
}

function draw_line(pos1, num1, pos2, num2, ctx) {
  let ix = pos1 % 9;
  let iy = Math.floor(pos1 / 9);
  let sx = ix * gridsize + (num1 % 3) * 14 + 9 + margin;
  let sy = iy * gridsize + Math.floor(num1 / 3) * 14 + 9 + margin;
  let ix2 = pos2 % 9;
  let iy2 = Math.floor(pos2 / 9);
  let sx2 = ix2 * gridsize + (num2 % 3) * 14 + 9 + margin;
  let sy2 = iy2 * gridsize + Math.floor(num2 / 3) * 14 + 9 + margin;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx2, sy2);
  ctx.stroke();
}

// 純希少数字チェック
function is_puretwo(v) {
  if (data.split(String(v)).length != 3) {
    return false;
  }
  let i1 = data.indexOf(String(v));
  let i2 = data.indexOf(String(v), i1 + 1);
  let c1 = Math.floor((i1 % 9) / 3);
  let r1 = Math.floor((Math.floor(i1 / 9)) / 3);
  let c2 = Math.floor((i2 % 9) / 3);
  let r2 = Math.floor((Math.floor(i2 / 9)) / 3);
  if (c1 == c2) return false;
  if (r1 == r2) return false;
  return true;
}

// ビットカウント
function bit_count(n) {
  n = n - ((n >> 1) & 0x55555555)
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
  return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
}

//ユニット内一択探索(hidden single)

function unit_single(g, pos, list) {
  let x1 = (g[0] ^ g[1] ^ g[2]);
  let x2 = (g[3] ^ g[4] ^ g[5]);
  let x3 = (g[6] ^ g[7] ^ g[8]);
  let a1 = (g[0] & g[1] & g[2]);
  let a2 = (g[3] & g[4] & g[5]);
  let a3 = (g[6] & g[7] & g[8]);
  let o1 = (g[0] | g[1] | g[2]);
  let o2 = (g[3] | g[4] | g[5]);
  let o3 = (g[6] | g[7] | g[8]);
  let b1 = x1 ^ a1;
  let b2 = x2 ^ a2;
  let b3 = x3 ^ a3;
  let c1 = b1 & (511 ^ (o2 | o3));
  let c2 = b2 & (511 ^ (o3 | o1));
  let c3 = b3 & (511 ^ (o1 | o2));
  let b = c1 | c2 | c3;
  if (b == 0) return;
  let v = b;
  while (v) {
    let b3 = v & (-v);
    v ^= b3;
    let n = bit_count(b3 - 1);
    let a = [];
    for (let i = 0; i < 9; i++) {
      if (b3 & g[i]) {
        a.push(pos[i], n);
      }
    }
    list.push(a);
  }
}

function draw_hidden_single(pm, ctx) {
  let b = Array(9);
  let n = Array(9);
  list = [];
  for (let c = 0; c < 9; c++) {
    for (let i = 0; i < 9; i++) {
      n[i] = c + i * 9;
      b[i] = pm[n[i]];
    }
    unit_single(b, n, list);
  }
  for (let r = 0; r < 9; r++) {
    for (let i = 0; i < 9; i++) {
      n[i] = i + r * 9;
      b[i] = pm[n[i]];
    }
    unit_single(b, n, list);
  }
  for (let bi of [0, 3, 6, 27, 30, 33, 54, 57, 60]) {
    n[0] = bi + 0;
    n[1] = bi + 1;
    n[2] = bi + 2;
    n[3] = bi + 9;
    n[4] = bi + 10;
    n[5] = bi + 11;
    n[6] = bi + 18;
    n[7] = bi + 19;
    n[8] = bi + 20;
    for (let i = 0; i < 9; i++) {
      b[i] = pm[n[i]];
    }
    unit_single(b, n, list);
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = '#F99';
  for (let i = 0; i < list.length; i++) {
    let c1 = list[i][0];
    let p1 = list[i][1];
    draw_hidden(c1, p1, ctx);
  }
}

//セル内二択探索
function cell_alt(pm, list) {
  for (let i = 0; i < 81; i++) {
    if (bit_count(pm[i]) != 2) {
      continue;
    }
    let v = pm[i];
    let c1 = v & (-v);
    v ^= c1;
    let c2 = v & (-v);
    let n1 = bit_count(c1 - 1)
    let n2 = bit_count(c2 - 1)
    list.push([i, n1, i, n2])
  }
}

function i2b(v) {
  let s = "";
  for (let i = 0; i < 9; i++) {
    if (v & (1 << i)) {
      s += "1";
    } else {
      s += "0";
    }
  }
  return s;
}

//ユニット内二択
function add_alt(b, pos, list) {
  let b0_3a = (b[0] ^ b[1]) & ~(b[2] | b[3]);
  let b0_3b = (b[2] ^ b[3]) & ~(b[0] | b[1]);
  let b0_3_1 = b0_3a | b0_3b;

  // 0..3が2ビット
  let b0_3_0 = ~(b[0] | b[1] | b[2] | b[3]); // 0-3が0
  let b0_3c = ~(b[0] ^ b[1] ^ b[2] ^ b[3]);  // 0か2か4
  let b0_3d = (b[0] & b[1] & b[2] & b[3]);   // 4
  let b0_3_2 = b0_3c & (~b0_3d) & (~b0_3_0);

  // 4..7が1ビット
  let b4_7a = (b[4] ^ b[5]) & ~(b[6] | b[7]);
  let b4_7b = (b[6] ^ b[7]) & ~(b[4] | b[5]);
  let b4_7_1 = b4_7a | b4_7b;

  // 4..7が2ビット
  let b4_7_0 = ~(b[4] | b[5] | b[6] | b[7]); // 0-3が0
  let b4_7c = ~(b[4] ^ b[5] ^ b[6] ^ b[7]);  // 0か2か4
  let b4_7d = (b[4] & b[5] & b[6] & b[7]);   // 4
  let b4_7_2 = b4_7c & (~b4_7d) & (~b4_7_0);

  let b2 = (b0_3_2 & b4_7_0 & ~b[8])    // 2, 0, 0
    | (b0_3_1 & b4_7_1 & ~b[8])  // 1,1,0
    | (b0_3_1 & b4_7_0 & b[8])   // 1,0,1
    | (b0_3_0 & b4_7_1 & b[8])   // 0,1,1
    | (b0_3_0 & b4_7_2 & ~b[8]); // 0,2,0
  if (b2 == 0) return;
  let v = b2;
  while (v) {
    let b3 = v & (-v);
    v ^= b3;
    let n = bit_count(b3 - 1);
    let a = [];
    for (let i = 0; i < 9; i++) {
      if (b3 & b[i]) {
        a.push(pos[i], n);
      }
    }
    list.push(a);
  }
}

function unit_alt(pm, list) {
  let b = Array(9);
  let n = Array(9);
  for (let c = 0; c < 9; c++) {
    for (let i = 0; i < 9; i++) {
      n[i] = c + i * 9;
      b[i] = pm[n[i]];
    }
    add_alt(b, n, list);
  }
  for (let r = 0; r < 9; r++) {
    for (let i = 0; i < 9; i++) {
      n[i] = i + r * 9;
      b[i] = pm[n[i]];
    }
    add_alt(b, n, list);
  }
  for (let bi of [0, 3, 6, 27, 30, 33, 54, 57, 60]) {
    n[0] = bi + 0;
    n[1] = bi + 1;
    n[2] = bi + 2;
    n[3] = bi + 9;
    n[4] = bi + 10;
    n[5] = bi + 11;
    n[6] = bi + 18;
    n[7] = bi + 19;
    n[8] = bi + 20;
    for (let i = 0; i < 9; i++) {
      b[i] = pm[n[i]];
    }
    add_alt(b, n, list);
  }
}

function draw_alts(pm, ctx) {
  list = [];
  cell_alt(pm, list);
  unit_alt(pm, list);
  let n = list.length;
  let alt_colors = ['#000', '#F00', '#0F0', '#00F', '#990', '#F0F', '#0FF'];
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    let c1 = list[i][0];
    let p1 = list[i][1];
    let c2 = list[i][2];
    let p2 = list[i][3];
    ctx.strokeStyle = alt_colors[i % alt_colors.length];
    draw_circle(c1, p1, ctx);
    draw_circle(c2, p2, ctx);
    draw_line(c1, p1, c2, p2, ctx);
  }
}

function calc_pm() {
  let pm = Array.apply(null, Array(81)).map(function () { return 511; }); // ペンシルマーク
  for (let i = 0; i < 81; i++) {
    let v = Number(data[i]);
    if (v == 0) {
      continue;
    }
    pm[i] = 0;
    let r = Math.floor(i / 9);
    let c = i % 9;
    let mask = (511 ^ (1 << (v - 1)));
    let ix = Math.floor(c / 3) * 3;
    let iy = Math.floor(r / 3) * 3;
    let bi = ix + iy * 9;
    pm[bi] &= mask;
    pm[bi + 1] &= mask;
    pm[bi + 2] &= mask;
    pm[bi + 9] &= mask;
    pm[bi + 10] &= mask;
    pm[bi + 11] &= mask;
    pm[bi + 18] &= mask;
    pm[bi + 19] &= mask;
    pm[bi + 20] &= mask;
    for (let j = 0; j < 9; j++) {
      pm[j + r * 9] &= mask;
      pm[c + j * 9] &= mask;
    }
  }
  return pm;
}

function draw_pm(pm, ctx) {
  ctx.fillStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#00A3D9';
  ctx.font = '10px "Century Gothic"';
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      v = pm[i + j * 9];
      for (let k = 0; k < 9; k++) {
        if ((v & (1 << k))) {
          let kx = i * gridsize + (k % 3) * 14 + 6 + margin;
          let ky = (j) * gridsize + Math.floor(k / 3) * 14 + 13 + margin;
          ctx.fillText(String(k + 1), kx, ky);
        }
      }
    }
  }
}

function draw_grid(ctx) {
  let m = margin;
  let mx = margin;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.strokeStyle = '#aaa';
    ctx.moveTo(0 + mx, i * gridsize + m);
    ctx.lineTo(mx + 9 * gridsize, i * gridsize + m);
    ctx.stroke();
    ctx.moveTo(mx + i * gridsize, m);
    ctx.lineTo(mx + i * gridsize, 9 * gridsize + m);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.moveTo(mx, i * gridsize * 3 + m);
    ctx.lineTo(mx + 9 * gridsize, i * gridsize * 3 + m);
    ctx.moveTo(mx + i * gridsize * 3, m);
    ctx.lineTo(mx + i * gridsize * 3, 9 * gridsize + m);
    ctx.stroke();
  }
}

function draw_numbers(ctx) {
  // ヒント数字の入力
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#00A3D9';
  ctx.font = '40px "Century Gothic"';
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (data[i + j * 9] != "0") {
        let v = parseInt(data[i + j * 9]);
        if (is_puretwo(v)) {
          ctx.fillStyle = '#F00';
        } else {
          ctx.fillStyle = '#000';
        }
        ctx.fillText(data[i + j * 9], i * gridsize + 12, (j + 1) * gridsize);
      }
    }
  }

}

function draw() {
  let canvas = document.getElementById('mycanvas');
  let h = canvas.height;
  let w = canvas.width;
  let ctx = canvas.getContext('2d');
  let m = margin;
  let mx = margin;

  ctx.beginPath();
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      ctx.fillStyle = colors[color_data[i + j * 9]];
      let x = i * gridsize + mx;
      let y = j * gridsize + m;
      ctx.fillRect(x, y, gridsize, gridsize);
    }
  }
  ctx.stroke();
  draw_numbers(ctx);
  draw_grid(ctx);
  pm = calc_pm()
  if (document.getElementById("show_alt").checked) {
    draw_alts(pm, ctx);
  }
  draw_hidden_single(pm, ctx);
  document.getElementById('rawdata').value = data;
  draw_pm(pm, ctx);
  show_numbers();
  show_error("");
}

function inputdata() {
  data = document.getElementById('rawdata').value;
  data = data.replace(/\./g,'0');
  draw();
}

function check_checked() {
  for (let i = 1; i < 4; i++) {
    if (document.getElementById('cb_rbox' + i).checked) return 'cb_rbox';
    if (document.getElementById('cb_cbox' + i).checked) return 'cb_cbox';
  }
  for (let i = 1; i < 10; i++) {
    if (document.getElementById('cb_rline' + i).checked) return 'cb_rline';
    if (document.getElementById('cb_cline' + i).checked) return 'cb_cline';
  }
  return;
}

function clear_checkbox() {
  for (let i = 1; i < 4; i++) {
    document.getElementById('cb_rbox' + i).checked = false;
    document.getElementById('cb_cbox' + i).checked = false;
  }
  for (let i = 1; i < 10; i++) {
    document.getElementById('cb_rline' + i).checked = false;
    document.getElementById('cb_cline' + i).checked = false;
  }
}

function perm_check(name, num) {
  let b1 = -1;
  let b2 = -1;
  for (let i = 1; i < num + 1; i++) {
    if (document.getElementById(name + i).checked) {
      if (b1 == -1) {
        b1 = i - 1;
      } else if (b2 == -1) {
        b2 = i - 1;
      } else {
        show_error("二つ以上チェックしないでください");
        clear_checkbox();
        return;
      }
    }
  }
  if (b2 == -1) {
    show_error("二つチェックしてください");
    clear_checkbox();
    return;
  }
  if (parseInt(b1 / 3) != parseInt(b2 / 3)) {
    clear_checkbox();
    show_error("同じボックスに属さない行、列は入れ替えられません");
    return;
  }
  clear_checkbox();
  return [b1, b2];
}

function perm_rbox_sub(b) {
  let a = new Array(3);
  a[0] = data.slice(0, 27);
  a[1] = data.slice(27, 54);
  a[2] = data.slice(54, 81);
  let tmp = a[b[0]];
  a[b[0]] = a[b[1]];
  a[b[1]] = tmp;
  data = a[0] + a[1] + a[2];
}

function perm_rbox() {
  let b = perm_check('cb_rbox', 3);
  if (b == undefined) return;
  perm_rbox_sub(b);
  draw();
}

function perm_cbox() {
  let b = perm_check('cb_cbox', 3);
  if (b == undefined) return;
  transpose();
  perm_rbox_sub(b);
  transpose();
  draw();
}


function perm_rline_sub(b) {
  let a = data.split("");
  for (let k = 0; k < 9; k++) {
    let i = k + b[0] * 9;
    let j = k + b[1] * 9;
    let t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  data = a.join("");
}

function perm_rline() {
  let b = perm_check('cb_rline', 9);
  if (b == undefined) return;
  perm_rline_sub(b);
  draw();
}

function perm_cline() {
  let b = perm_check('cb_cline', 9);
  if (b == undefined) return;
  transpose();
  perm_rline_sub(b);
  transpose();
  draw();
}

function perm() {
  let cb = check_checked();
  if (cb == undefined) return;
  switch (cb) {
    case 'cb_rline':
      perm_rline();
      break;
    case 'cb_cline':
      perm_cline();
      break;
    case 'cb_rbox':
      perm_rbox();
      break;
    case 'cb_cbox':
      perm_cbox();
      break;
  }
}

document.onkeydown = function (e) {
  if (e.keyCode == 83) perm();
  if (e.keyCode == 84) {
    transpose();
    show_error("転置しました");
  }
  if (e.keyCode == 78) perm_num();
  if (e.keyCode == 67) clear_color();
  if (e.keyCode == 82) renumbering();
  if (e.keyCode == "A".charCodeAt(0)) {
    document.getElementById("show_alt").checked = !document.getElementById("show_alt").checked;
    draw();
  }
}

function onClickCanvas(x, y) {
  let c = get_checked("color");
  let canvas = document.getElementById("mycanvas");
  let rect = canvas.getBoundingClientRect();
  let delm = document.documentElement, dbody = document.body;
  let sx = delm.scrollLeft || dbody.scrollLeft;
  let sy = delm.scrollTop || dbody.scrollTop;
  x = x - rect.left - sx;
  y = y - rect.top - sy;
  x = Math.floor(x / gridsize);
  y = Math.floor(y / gridsize);
  if (x < 0) x = 0;
  if (x > 8) x = 8;
  if (y < 0) y = 0;
  if (y > 8) y = 8;
  i = x + y * 9;
  if (color_data[i] == c) {
    color_data[i] = 0;
  } else {
    color_data[i] = c;
  }
  draw();
}

function clear_color() {
  for (let i = 0; i < 81; i++) {
    color_data[i] = 0;
  }
  draw();
}

function get_checked(name) {
  let r = document.getElementsByName(name);
  for (let i = 0; i < r.length; i++) {
    if (r[i].checked) {
      return i;
    }
  }
}

function renumbering() {
  b = data.split("");
  let a = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  let index = 0;
  for (let i = 0; i < 81; i++) {
    if (b[i] == '0') continue;
    let c = b[i] - '0' - 1;
    if (a[c] == 0) {
      index = index + 1;
      a[c] = index;
    }
    b[i] = String.fromCharCode(a[c] + 48);
  }
  data = b.join("");
  draw();
  show_error("数字をリナンバリングしました");
}

function perm_num() {
  let r1 = document.getElementsByName("num1");
  let num1 = -1
  for (let i = 0; i < r1.length; i++) {
    if (r1[i].checked) {
      num1 = i;
    }
  }
  let r2 = document.getElementsByName("num2");
  let num2 = -1
  for (let i = 0; i < r2.length; i++) {
    if (r2[i].checked) {
      num2 = i;
    }
  }
  if (num1 == -1 || num2 == -1) {
    show_error("数字が正しく選択されていません。");
    return;
  }
  if (num1 == num2) {
    show_error("同じ数字は選択できません。");
    return;
  }
  s1 = (num1 + 1).toString();
  s2 = (num2 + 1).toString();
  data = data.split(s1).join("x");
  data = data.split(s2).join(s1);
  data = data.split("x").join(s2);
  draw();
  show_error("数字を入れ替えました。");
}

function inputua() {
  let a = document.getElementById("uasets").value.split(" ");
  a.forEach(
    function adds(v) {
      if (v != "") {
        let i = Number(v);
        c = get_checked("color");
        color_data[i] = c;
      }
    }
  );
  draw();
}

function inputbits() {
  let a = document.getElementById("bitset").value.split("");
  let c = get_checked("color");
  for (let i = 0; i < 81; i++) {
    let v = Number(a[i]);
    if (v != 0) {
      color_data[i] = c;
    }
  }
  draw();
}