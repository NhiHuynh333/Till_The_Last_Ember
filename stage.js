// Base class (Stage 1 & 2 giữ nguyên kiểu boolean)
class StageBox01 {
  constructor(x, y, w, h, label) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.completed = false; // trạng thái tick
  }

  setCompleted(val) {
    this.completed = val;
  }

  display() {
    stroke("#ffffffb2");
    fill("#111");
    rect(this.x, this.y, this.w, this.h);

    // Checkbox
    let cbSize = this.h * 0.6;
    let cbX = this.x + 10;
    let cbY = this.y + this.h / 2 - cbSize / 2;
    rect(cbX, cbY, cbSize, cbSize);

    // Nếu completed → vẽ dấu ✓ (Stage 1,2)
    if (this.completed) {
      stroke("#bdbdbdff");
      strokeWeight(3);
      noFill();
      line(cbX + cbSize * 0.2, cbY + cbSize * 0.5,
           cbX + cbSize * 0.4, cbY + cbSize * 0.75);
      line(cbX + cbSize * 0.4, cbY + cbSize * 0.75,
           cbX + cbSize * 0.8, cbY + cbSize * 0.25);
    }

    // Label
    noStroke();
    fill(255);
    textFont('Archivo');
    textSize(16);
    textAlign(LEFT, CENTER);
    text(this.label, cbX + cbSize + 10, this.y + this.h / 2);
  }
}

// StageBox3 riêng → có tickAlpha
class StageBox03 extends StageBox01 {
  constructor(x, y, w, h, label) {
    super(x, y, w, h, label);
    this.tickAlpha = 0; // alpha cho fade in
  }

  setTickAlpha(val) {
    this.tickAlpha = constrain(val, 0, 255);
  }

  display() {
    stroke("#ffffffb2");
    fill("#111");
    rect(this.x, this.y, this.w, this.h);

    let cbSize = this.h * 0.6;
    let cbX = this.x + 10;
    let cbY = this.y + this.h / 2 - cbSize / 2;
    rect(cbX, cbY, cbSize, cbSize);

    // Tick fade theo alpha
    if (this.tickAlpha > 0) {
      stroke(189, 189, 189, this.tickAlpha);
      strokeWeight(3);
      noFill();
      line(cbX + cbSize * 0.2, cbY + cbSize * 0.5,
           cbX + cbSize * 0.4, cbY + cbSize * 0.75);
      line(cbX + cbSize * 0.4, cbY + cbSize * 0.75,
           cbX + cbSize * 0.8, cbY + cbSize * 0.25);
    }

    // Label
    noStroke();
    fill(255);
    textFont('Archivo');
    textSize(16);
    textAlign(LEFT, CENTER);
    text(this.label, cbX + cbSize + 10, this.y + this.h / 2);
  }
}

class StageBox02 extends StageBox01 {}
