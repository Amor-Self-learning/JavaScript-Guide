# 29.1 Gamepad Input

The Gamepad API provides access to game controllers and joysticks. This chapter covers gamepad detection, button and axis reading, and input handling.

---

## 29.1.1 Basic Usage

### Detect Gamepads

```javascript
window.addEventListener('gamepadconnected', (event) => {
  console.log('Gamepad connected:', event.gamepad.id);
  console.log('Index:', event.gamepad.index);
  console.log('Buttons:', event.gamepad.buttons.length);
  console.log('Axes:', event.gamepad.axes.length);
});

window.addEventListener('gamepaddisconnected', (event) => {
  console.log('Gamepad disconnected:', event.gamepad.id);
});
```

---

## 29.1.2 Get Gamepads

### Poll for Gamepads

```javascript
function getGamepads() {
  return navigator.getGamepads().filter(gp => gp !== null);
}

// Must poll - state doesn't update automatically
function gameLoop() {
  const gamepads = getGamepads();
  
  for (const gamepad of gamepads) {
    processGamepad(gamepad);
  }
  
  requestAnimationFrame(gameLoop);
}
```

---

## 29.1.3 Read Buttons

### Button State

```javascript
function processButtons(gamepad) {
  for (let i = 0; i < gamepad.buttons.length; i++) {
    const button = gamepad.buttons[i];
    
    if (button.pressed) {
      console.log('Button', i, 'pressed');
      console.log('Value:', button.value);  // 0-1 for analog
    }
  }
}
```

### Standard Gamepad Mapping

```javascript
// Standard mapping (Xbox-style)
const BUTTONS = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  L3: 10,  // Left stick press
  R3: 11,  // Right stick press
  UP: 12,
  DOWN: 13,
  LEFT: 14,
  RIGHT: 15,
  HOME: 16
};

function isButtonPressed(gamepad, button) {
  return gamepad.buttons[button]?.pressed || false;
}

if (isButtonPressed(gamepad, BUTTONS.A)) {
  jump();
}
```

---

## 29.1.4 Read Axes

### Axis Values

```javascript
function processAxes(gamepad) {
  // Standard mapping:
  // 0: Left stick X (-1 left, +1 right)
  // 1: Left stick Y (-1 up, +1 down)
  // 2: Right stick X
  // 3: Right stick Y
  
  const leftX = gamepad.axes[0];
  const leftY = gamepad.axes[1];
  const rightX = gamepad.axes[2];
  const rightY = gamepad.axes[3];
  
  console.log('Left stick:', leftX, leftY);
  console.log('Right stick:', rightX, rightY);
}
```

### Deadzone Handling

```javascript
function applyDeadzone(value, deadzone = 0.1) {
  if (Math.abs(value) < deadzone) {
    return 0;
  }
  
  // Normalize remaining range
  const sign = Math.sign(value);
  const normalized = (Math.abs(value) - deadzone) / (1 - deadzone);
  return sign * normalized;
}

const leftX = applyDeadzone(gamepad.axes[0]);
const leftY = applyDeadzone(gamepad.axes[1]);
```

---

## 29.1.5 Vibration

### Haptic Feedback

```javascript
function vibrate(gamepad, duration = 200, intensity = 1.0) {
  if (gamepad.vibrationActuator) {
    gamepad.vibrationActuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration,
      weakMagnitude: intensity,
      strongMagnitude: intensity
    });
  }
}
```

---

## 29.1.6 Complete Example

### Gamepad Manager

```javascript
class GamepadManager {
  constructor() {
    this.gamepads = new Map();
    this.previousState = new Map();
    
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepads.set(e.gamepad.index, e.gamepad);
      this.onConnect?.(e.gamepad);
    });
    
    window.addEventListener('gamepaddisconnected', (e) => {
      this.gamepads.delete(e.gamepad.index);
      this.onDisconnect?.(e.gamepad);
    });
  }
  
  update() {
    const current = navigator.getGamepads();
    
    for (const gamepad of current) {
      if (!gamepad) continue;
      
      const prev = this.previousState.get(gamepad.index) || {
        buttons: [],
        axes: []
      };
      
      // Check button changes
      for (let i = 0; i < gamepad.buttons.length; i++) {
        const wasPressed = prev.buttons[i];
        const isPressed = gamepad.buttons[i].pressed;
        
        if (isPressed && !wasPressed) {
          this.onButtonDown?.(gamepad.index, i);
        } else if (!isPressed && wasPressed) {
          this.onButtonUp?.(gamepad.index, i);
        }
      }
      
      // Store current state
      this.previousState.set(gamepad.index, {
        buttons: gamepad.buttons.map(b => b.pressed),
        axes: [...gamepad.axes]
      });
    }
  }
  
  getAxes(gamepadIndex, deadzone = 0.1) {
    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (!gamepad) return null;
    
    return {
      leftX: this.applyDeadzone(gamepad.axes[0], deadzone),
      leftY: this.applyDeadzone(gamepad.axes[1], deadzone),
      rightX: this.applyDeadzone(gamepad.axes[2], deadzone),
      rightY: this.applyDeadzone(gamepad.axes[3], deadzone)
    };
  }
  
  applyDeadzone(value, deadzone) {
    if (Math.abs(value) < deadzone) return 0;
    const sign = Math.sign(value);
    return sign * (Math.abs(value) - deadzone) / (1 - deadzone);
  }
  
  isPressed(gamepadIndex, buttonIndex) {
    const gamepad = navigator.getGamepads()[gamepadIndex];
    return gamepad?.buttons[buttonIndex]?.pressed || false;
  }
}

// Usage
const gamepadManager = new GamepadManager();
gamepadManager.onButtonDown = (gp, btn) => console.log('Pressed:', btn);

function gameLoop() {
  gamepadManager.update();
  
  const axes = gamepadManager.getAxes(0);
  if (axes) {
    movePlayer(axes.leftX, axes.leftY);
  }
  
  requestAnimationFrame(gameLoop);
}

gameLoop();
```

---

## 29.1.7 Summary

### Methods

| Method | Description |
|--------|-------------|
| `navigator.getGamepads()` | Get all gamepads |

### Gamepad Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Gamepad identifier |
| `index` | Number | Gamepad index |
| `connected` | Boolean | Connection status |
| `mapping` | String | 'standard' or '' |
| `buttons` | Array | Button states |
| `axes` | Array | Axis values |
| `timestamp` | Number | Last update time |

### Button Properties

| Property | Type | Description |
|----------|------|-------------|
| `pressed` | Boolean | Is pressed |
| `touched` | Boolean | Is touched |
| `value` | Number | 0-1 analog value |

### Events

| Event | When |
|-------|------|
| `gamepadconnected` | Gamepad connected |
| `gamepaddisconnected` | Gamepad disconnected |

### Best Practices

1. **Poll gamepad state** in animation frame
2. **Apply deadzone** to axes
3. **Track button changes** for press/release events
4. **Check mapping** property for standard layout
5. **Handle multiple gamepads**
6. **Test with various controllers**

---

**End of Chapter 29.1: Gamepad Input**

This completes the device APIs group. Next: **Group 30 — Screen Orientation API**.
