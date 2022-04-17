export function drawBar(g: Phaser.GameObjects.Graphics, value: number, max: number, tilewidth: number, color: number) {
  g.clear();
  g.lineStyle(1, 0xffffff, 0.2);
  g.beginPath();
  g.moveTo(1, -0.5);
  g.lineTo(tilewidth - 1, -0.5);
  g.strokePath();
  if (value / max <= 0.4) {
    g.lineStyle(1, color); // Optionally have a different color when life is below threshold
  } else {
    g.lineStyle(1, color);
  }
  g.beginPath();
  g.moveTo(1, -0.5);
  g.lineTo(1 + Math.ceil((value / max) * (tilewidth - 2)), -0.5);
  g.strokePath();
}

export function drawBorder(g: Phaser.GameObjects.Graphics, tilewidth: number) {
  g.clear();
  g.lineStyle(1, 0xffffff, 0.2);
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(tilewidth, 0);
  g.lineTo(tilewidth, tilewidth);
  g.lineTo(0, tilewidth);
  g.lineTo(0, 0);
  g.closePath();
  g.strokePath();
}

export function drawTile(g: Phaser.GameObjects.Graphics, tilewidth: number) {
  g.clear();
  g.fillStyle(0xffffff, 0.2);
  g.fillRect(0, 0, tilewidth, tilewidth);
}
