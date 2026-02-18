# Design Patterns - Behavioral Patterns

## Table of Contents

- [Observer Pattern (Pub/Sub)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#observer-pattern-pubsub)
- [Iterator Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#iterator-pattern)
- [Strategy Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#strategy-pattern)
- [Command Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#command-pattern)
- [Chain of Responsibility](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#chain-of-responsibility)
- [State Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#state-pattern)
- [Template Method Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#template-method-pattern)
- [Mediator Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#mediator-pattern)
- [Memento Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#memento-pattern)
- [Visitor Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#visitor-pattern)

---

## Behavioral Patterns

Behavioral patterns are concerned with algorithms and the assignment of responsibilities between objects. They describe patterns of communication between objects.

---

## Observer Pattern (Pub/Sub)

The Observer Pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified.

### Basic Observer

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }
  
  update(data) {
    console.log(`${this.name} received:`, data);
  }
}

// Usage
const subject = new Subject();

const observer1 = new Observer('Observer 1');
const observer2 = new Observer('Observer 2');
const observer3 = new Observer('Observer 3');

subject.subscribe(observer1);
subject.subscribe(observer2);
subject.subscribe(observer3);

subject.notify('Hello Observers!');
// Observer 1 received: Hello Observers!
// Observer 2 received: Hello Observers!
// Observer 3 received: Hello Observers!

subject.unsubscribe(observer2);
subject.notify('Second notification');
// Observer 1 received: Second notification
// Observer 3 received: Second notification
```

### Event Emitter Pattern

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }
  
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }
  
  off(event, listenerToRemove) {
    if (!this.events[event]) return this;
    
    this.events[event] = this.events[event].filter(
      listener => listener !== listenerToRemove
    );
    return this;
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return false;
    
    this.events[event].forEach(listener => {
      listener.apply(this, args);
    });
    return true;
  }
  
  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }
  
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

// Usage
const emitter = new EventEmitter();

emitter.on('data', (data) => {
  console.log('Data received:', data);
});

emitter.on('data', (data) => {
  console.log('Another listener:', data);
});

emitter.once('connect', () => {
  console.log('Connected! (only once)');
});

emitter.emit('data', { id: 1, name: 'Alice' });
// Data received: { id: 1, name: 'Alice' }
// Another listener: { id: 1, name: 'Alice' }

emitter.emit('connect'); // Connected! (only once)
emitter.emit('connect'); // (nothing - listener removed)

console.log('Listeners for "data":', emitter.listenerCount('data')); // 2
```

### Pub/Sub Pattern

```javascript
class PubSub {
  constructor() {
    this.subscribers = {};
    this.subId = 0;
  }
  
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = {};
    }
    
    const token = `sub_${this.subId++}`;
    this.subscribers[event][token] = callback;
    
    // Return unsubscribe function
    return () => this.unsubscribe(token);
  }
  
  unsubscribe(token) {
    for (const event in this.subscribers) {
      if (this.subscribers[event][token]) {
        delete this.subscribers[event][token];
        return true;
      }
    }
    return false;
  }
  
  publish(event, data) {
    if (!this.subscribers[event]) return;
    
    Object.values(this.subscribers[event]).forEach(callback => {
      callback(data);
    });
  }
}

// Usage
const pubsub = new PubSub();

// Subscribe
const unsubscribe1 = pubsub.subscribe('userLoggedIn', (user) => {
  console.log('User logged in:', user.name);
});

const unsubscribe2 = pubsub.subscribe('userLoggedIn', (user) => {
  console.log('Sending welcome email to:', user.email);
});

const unsubscribe3 = pubsub.subscribe('userLoggedOut', (user) => {
  console.log('User logged out:', user.name);
});

// Publish
pubsub.publish('userLoggedIn', { name: 'Alice', email: 'alice@example.com' });
// User logged in: Alice
// Sending welcome email to: alice@example.com

// Unsubscribe
unsubscribe1();

pubsub.publish('userLoggedIn', { name: 'Bob', email: 'bob@example.com' });
// Sending welcome email to: bob@example.com (first subscriber removed)

pubsub.publish('userLoggedOut', { name: 'Alice' });
// User logged out: Alice
```

### Real-World Example: Store

```javascript
class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }
  
  getState() {
    return { ...this.state };
  }
  
  setState(newState) {
    const prevState = this.state;
    this.state = { ...this.state, ...newState };
    this.notify({ prevState, state: this.state });
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  notify(update) {
    this.listeners.forEach(listener => listener(update));
  }
}

// Usage
const store = new Store({ count: 0, user: null });

const unsubscribe1 = store.subscribe(({ prevState, state }) => {
  console.log('Store updated:');
  console.log('  Previous:', prevState);
  console.log('  Current:', state);
});

const unsubscribe2 = store.subscribe(({ state }) => {
  if (state.count !== undefined) {
    console.log(`Count is now: ${state.count}`);
  }
});

store.setState({ count: 1 });
// Store updated:
//   Previous: { count: 0, user: null }
//   Current: { count: 1, user: null }
// Count is now: 1

store.setState({ user: { name: 'Alice' } });
// Store updated:
//   Previous: { count: 1, user: null }
//   Current: { count: 1, user: { name: 'Alice' } }

unsubscribe1();
store.setState({ count: 2 });
// Count is now: 2 (first subscriber removed)
```

---

## Iterator Pattern

The Iterator Pattern provides a way to access elements of a collection sequentially without exposing its underlying representation.

### Basic Iterator

```javascript
class ArrayIterator {
  constructor(array) {
    this.array = array;
    this.index = 0;
  }
  
  hasNext() {
    return this.index < this.array.length;
  }
  
  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    return this.array[this.index++];
  }
  
  reset() {
    this.index = 0;
  }
}

// Usage
const iterator = new ArrayIterator([1, 2, 3, 4, 5]);

while (iterator.hasNext()) {
  console.log(iterator.next());
}
// 1, 2, 3, 4, 5

iterator.reset();
console.log(iterator.next()); // 1
```

### ES6 Iterator Protocol

```javascript
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }
  
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    const step = this.step;
    
    return {
      next() {
        if (current <= end) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
}

// Usage
const range = new Range(1, 10, 2);

for (const num of range) {
  console.log(num); // 1, 3, 5, 7, 9
}

// Can be spread
console.log([...range]); // [1, 3, 5, 7, 9]

// Can use Array.from
console.log(Array.from(range)); // [1, 3, 5, 7, 9]
```

### Generator Iterator

```javascript
class Collection {
  constructor() {
    this.items = [];
  }
  
  add(item) {
    this.items.push(item);
  }
  
  // Forward iterator
  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }
  
  // Reverse iterator
  *reverse() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      yield this.items[i];
    }
  }
  
  // Filter iterator
  *filter(predicate) {
    for (const item of this.items) {
      if (predicate(item)) {
        yield item;
      }
    }
  }
  
  // Map iterator
  *map(transformer) {
    for (const item of this.items) {
      yield transformer(item);
    }
  }
}

// Usage
const collection = new Collection();
collection.add(1);
collection.add(2);
collection.add(3);
collection.add(4);
collection.add(5);

// Forward iteration
console.log('Forward:', [...collection]); // [1, 2, 3, 4, 5]

// Reverse iteration
console.log('Reverse:', [...collection.reverse()]); // [5, 4, 3, 2, 1]

// Filter
console.log('Even:', [...collection.filter(x => x % 2 === 0)]); // [2, 4]

// Map
console.log('Squared:', [...collection.map(x => x * x)]); // [1, 4, 9, 16, 25]
```

### Tree Iterator

```javascript
class TreeNode {
  constructor(value) {
    this.value = value;
    this.children = [];
  }
  
  addChild(child) {
    this.children.push(child);
  }
  
  // Depth-first traversal
  *depthFirst() {
    yield this.value;
    for (const child of this.children) {
      yield* child.depthFirst();
    }
  }
  
  // Breadth-first traversal
  *breadthFirst() {
    const queue = [this];
    
    while (queue.length > 0) {
      const node = queue.shift();
      yield node.value;
      queue.push(...node.children);
    }
  }
}

// Usage
const root = new TreeNode(1);
const child1 = new TreeNode(2);
const child2 = new TreeNode(3);
const child3 = new TreeNode(4);
const child4 = new TreeNode(5);
const child5 = new TreeNode(6);

root.addChild(child1);
root.addChild(child2);
child1.addChild(child3);
child1.addChild(child4);
child2.addChild(child5);

/*
    1
   / \
  2   3
 / \   \
4   5   6
*/

console.log('Depth-first:', [...root.depthFirst()]);
// [1, 2, 4, 5, 3, 6]

console.log('Breadth-first:', [...root.breadthFirst()]);
// [1, 2, 3, 4, 5, 6]
```

---

## Strategy Pattern

The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable.

### Basic Strategy

```javascript
// Strategy interface
class PaymentStrategy {
  pay(amount) {
    throw new Error('pay method must be implemented');
  }
}

// Concrete strategies
class CreditCardStrategy extends PaymentStrategy {
  constructor(cardNumber, cvv) {
    super();
    this.cardNumber = cardNumber;
    this.cvv = cvv;
  }
  
  pay(amount) {
    console.log(`Paid $${amount} using Credit Card ${this.cardNumber}`);
    return { success: true, method: 'credit_card' };
  }
}

class PayPalStrategy extends PaymentStrategy {
  constructor(email) {
    super();
    this.email = email;
  }
  
  pay(amount) {
    console.log(`Paid $${amount} using PayPal account ${this.email}`);
    return { success: true, method: 'paypal' };
  }
}

class CryptoStrategy extends PaymentStrategy {
  constructor(walletAddress) {
    super();
    this.walletAddress = walletAddress;
  }
  
  pay(amount) {
    console.log(`Paid $${amount} using Crypto wallet ${this.walletAddress}`);
    return { success: true, method: 'crypto' };
  }
}

// Context
class ShoppingCart {
  constructor() {
    this.items = [];
    this.paymentStrategy = null;
  }
  
  addItem(item) {
    this.items.push(item);
  }
  
  setPaymentStrategy(strategy) {
    this.paymentStrategy = strategy;
  }
  
  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
  
  checkout() {
    if (!this.paymentStrategy) {
      throw new Error('Payment strategy not set');
    }
    
    const total = this.getTotal();
    return this.paymentStrategy.pay(total);
  }
}

// Usage
const cart = new ShoppingCart();
cart.addItem({ name: 'Book', price: 10 });
cart.addItem({ name: 'Pen', price: 2 });

// Pay with credit card
cart.setPaymentStrategy(new CreditCardStrategy('1234-5678-9012-3456', '123'));
cart.checkout(); // Paid $12 using Credit Card...

// Pay with PayPal
cart.setPaymentStrategy(new PayPalStrategy('user@example.com'));
cart.checkout(); // Paid $12 using PayPal...
```

### Validation Strategy

```javascript
class Validator {
  constructor() {
    this.strategies = [];
  }
  
  addStrategy(strategy) {
    this.strategies.push(strategy);
    return this;
  }
  
  validate(data) {
    const errors = [];
    
    for (const strategy of this.strategies) {
      const error = strategy.validate(data);
      if (error) {
        errors.push(error);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Validation strategies
class RequiredStrategy {
  constructor(field) {
    this.field = field;
  }
  
  validate(data) {
    if (!data[this.field] || data[this.field].trim() === '') {
      return `${this.field} is required`;
    }
    return null;
  }
}

class EmailStrategy {
  constructor(field) {
    this.field = field;
  }
  
  validate(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data[this.field])) {
      return `${this.field} must be a valid email`;
    }
    return null;
  }
}

class MinLengthStrategy {
  constructor(field, minLength) {
    this.field = field;
    this.minLength = minLength;
  }
  
  validate(data) {
    if (data[this.field] && data[this.field].length < this.minLength) {
      return `${this.field} must be at least ${this.minLength} characters`;
    }
    return null;
  }
}

class RangeStrategy {
  constructor(field, min, max) {
    this.field = field;
    this.min = min;
    this.max = max;
  }
  
  validate(data) {
    const value = data[this.field];
    if (value < this.min || value > this.max) {
      return `${this.field} must be between ${this.min} and ${this.max}`;
    }
    return null;
  }
}

// Usage
const validator = new Validator();
validator
  .addStrategy(new RequiredStrategy('username'))
  .addStrategy(new MinLengthStrategy('username', 3))
  .addStrategy(new RequiredStrategy('email'))
  .addStrategy(new EmailStrategy('email'))
  .addStrategy(new RequiredStrategy('age'))
  .addStrategy(new RangeStrategy('age', 18, 100));

const result1 = validator.validate({
  username: 'ab',
  email: 'invalid-email',
  age: 15
});

console.log(result1);
// { isValid: false, errors: [...] }

const result2 = validator.validate({
  username: 'alice',
  email: 'alice@example.com',
  age: 25
});

console.log(result2);
// { isValid: true, errors: [] }
```

### Sorting Strategy

```javascript
class Sorter {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  sort(data) {
    return this.strategy.sort([...data]);
  }
}

// Sorting strategies
class BubbleSortStrategy {
  sort(data) {
    console.log('Using Bubble Sort');
    const arr = [...data];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    
    return arr;
  }
}

class QuickSortStrategy {
  sort(data) {
    console.log('Using Quick Sort');
    return this.quickSort([...data]);
  }
  
  quickSort(arr) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    
    return [...this.quickSort(left), ...middle, ...this.quickSort(right)];
  }
}

class NativeSortStrategy {
  sort(data) {
    console.log('Using Native Sort');
    return [...data].sort((a, b) => a - b);
  }
}

// Usage
const data = [64, 34, 25, 12, 22, 11, 90];
const sorter = new Sorter(new BubbleSortStrategy());

console.log(sorter.sort(data)); // Using Bubble Sort

sorter.setStrategy(new QuickSortStrategy());
console.log(sorter.sort(data)); // Using Quick Sort

sorter.setStrategy(new NativeSortStrategy());
console.log(sorter.sort(data)); // Using Native Sort
```

---

## Command Pattern

The Command Pattern encapsulates a request as an object, allowing you to parameterize clients with different requests, queue or log requests, and support undoable operations.

### Basic Command

```javascript
// Receiver
class Light {
  turnOn() {
    console.log('Light is ON');
  }
  
  turnOff() {
    console.log('Light is OFF');
  }
}

// Command interface
class Command {
  execute() {
    throw new Error('execute must be implemented');
  }
  
  undo() {
    throw new Error('undo must be implemented');
  }
}

// Concrete commands
class TurnOnCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  
  execute() {
    this.light.turnOn();
  }
  
  undo() {
    this.light.turnOff();
  }
}

class TurnOffCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  
  execute() {
    this.light.turnOff();
  }
  
  undo() {
    this.light.turnOn();
  }
}

// Invoker
class RemoteControl {
  constructor() {
    this.history = [];
  }
  
  execute(command) {
    command.execute();
    this.history.push(command);
  }
  
  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
    }
  }
}

// Usage
const light = new Light();
const remote = new RemoteControl();

const turnOn = new TurnOnCommand(light);
const turnOff = new TurnOffCommand(light);

remote.execute(turnOn);  // Light is ON
remote.execute(turnOff); // Light is OFF
remote.undo();           // Light is ON
remote.undo();           // Light is OFF
```

### Text Editor with Undo/Redo

```javascript
class TextEditor {
  constructor() {
    this.content = '';
  }
  
  getContent() {
    return this.content;
  }
  
  setContent(content) {
    this.content = content;
  }
  
  insert(text, position) {
    this.content = 
      this.content.slice(0, position) + 
      text + 
      this.content.slice(position);
  }
  
  delete(start, length) {
    this.content = 
      this.content.slice(0, start) + 
      this.content.slice(start + length);
  }
}

// Commands
class InsertCommand {
  constructor(editor, text, position) {
    this.editor = editor;
    this.text = text;
    this.position = position;
  }
  
  execute() {
    this.editor.insert(this.text, this.position);
  }
  
  undo() {
    this.editor.delete(this.position, this.text.length);
  }
}

class DeleteCommand {
  constructor(editor, start, length) {
    this.editor = editor;
    this.start = start;
    this.length = length;
    this.deletedText = '';
  }
  
  execute() {
    this.deletedText = this.editor.getContent()
      .slice(this.start, this.start + this.length);
    this.editor.delete(this.start, this.length);
  }
  
  undo() {
    this.editor.insert(this.deletedText, this.start);
  }
}

// Command Manager with Undo/Redo
class CommandManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }
  
  execute(command) {
    // Remove any commands after current index
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    command.execute();
    this.history.push(command);
    this.currentIndex++;
  }
  
  undo() {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].undo();
      this.currentIndex--;
    }
  }
  
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.history[this.currentIndex].execute();
    }
  }
  
  canUndo() {
    return this.currentIndex >= 0;
  }
  
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
}

// Usage
const editor = new TextEditor();
const manager = new CommandManager();

manager.execute(new InsertCommand(editor, 'Hello', 0));
console.log(editor.getContent()); // "Hello"

manager.execute(new InsertCommand(editor, ' World', 5));
console.log(editor.getContent()); // "Hello World"

manager.execute(new DeleteCommand(editor, 5, 6));
console.log(editor.getContent()); // "Hello"

manager.undo();
console.log(editor.getContent()); // "Hello World"

manager.undo();
console.log(editor.getContent()); // "Hello"

manager.redo();
console.log(editor.getContent()); // "Hello World"
```

### Macro Command

```javascript
class MacroCommand {
  constructor() {
    this.commands = [];
  }
  
  add(command) {
    this.commands.push(command);
    return this;
  }
  
  execute() {
    this.commands.forEach(command => command.execute());
  }
  
  undo() {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

// Usage
const light1 = new Light();
const light2 = new Light();
const light3 = new Light();

const allLightsOn = new MacroCommand();
allLightsOn
  .add(new TurnOnCommand(light1))
  .add(new TurnOnCommand(light2))
  .add(new TurnOnCommand(light3));

const remote = new RemoteControl();
remote.execute(allLightsOn);
// Light is ON (x3)

remote.undo();
// Light is OFF (x3)
```

---

## Chain of Responsibility

The Chain of Responsibility Pattern passes a request along a chain of handlers. Each handler decides either to process the request or pass it to the next handler.

### Basic Chain

```javascript
class Handler {
  constructor() {
    this.nextHandler = null;
  }
  
  setNext(handler) {
    this.nextHandler = handler;
    return handler; // Enable chaining
  }
  
  handle(request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

// Concrete handlers
class AuthenticationHandler extends Handler {
  handle(request) {
    if (!request.authenticated) {
      console.log('Authentication failed');
      return { error: 'Not authenticated' };
    }
    console.log('Authentication passed');
    return super.handle(request);
  }
}

class AuthorizationHandler extends Handler {
  handle(request) {
    if (!request.authorized) {
      console.log('Authorization failed');
      return { error: 'Not authorized' };
    }
    console.log('Authorization passed');
    return super.handle(request);
  }
}

class ValidationHandler extends Handler {
  handle(request) {
    if (!request.data || !request.data.name) {
      console.log('Validation failed');
      return { error: 'Invalid data' };
    }
    console.log('Validation passed');
    return super.handle(request);
  }
}

class ProcessHandler extends Handler {
  handle(request) {
    console.log('Processing request:', request.data);
    return { success: true, data: request.data };
  }
}

// Usage
const auth = new AuthenticationHandler();
const authz = new AuthorizationHandler();
const validation = new ValidationHandler();
const process = new ProcessHandler();

auth.setNext(authz).setNext(validation).setNext(process);

// Test 1: Full request
const result1 = auth.handle({
  authenticated: true,
  authorized: true,
  data: { name: 'Alice' }
});
console.log('Result:', result1);
// Authentication passed
// Authorization passed
// Validation passed
// Processing request: { name: 'Alice' }
// Result: { success: true, data: { name: 'Alice' } }

// Test 2: Not authenticated
const result2 = auth.handle({
  authenticated: false,
  authorized: true,
  data: { name: 'Bob' }
});
console.log('Result:', result2);
// Authentication failed
// Result: { error: 'Not authenticated' }
```

### Middleware Chain

```javascript
class MiddlewareChain {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  async execute(context) {
    let index = 0;
    
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(context, next);
      }
    };
    
    await next();
  }
}

// Middleware functions
async function loggingMiddleware(context, next) {
  console.log(`[LOG] ${context.method} ${context.url}`);
  await next();
}

async function authMiddleware(context, next) {
  if (!context.headers.authorization) {
    context.status = 401;
    context.body = 'Unauthorized';
    return;
  }
  console.log('[AUTH] User authenticated');
  await next();
}

async function timingMiddleware(context, next) {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`[TIMING] Request took ${duration}ms`);
}

async function responseMiddleware(context, next) {
  await next();
  context.body = context.body || 'Success';
  console.log(`[RESPONSE] ${context.status || 200} - ${context.body}`);
}

// Usage
const chain = new MiddlewareChain();
chain
  .use(loggingMiddleware)
  .use(timingMiddleware)
  .use(authMiddleware)
  .use(responseMiddleware);

const context = {
  method: 'GET',
  url: '/api/users',
  headers: { authorization: 'Bearer token123' }
};

chain.execute(context);
// [LOG] GET /api/users
// [AUTH] User authenticated
// [RESPONSE] 200 - Success
// [TIMING] Request took 2ms
```

### Support Ticket System

```javascript
class SupportHandler {
  constructor(level, name) {
    this.level = level;
    this.name = name;
    this.nextHandler = null;
  }
  
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }
  
  handle(ticket) {
    if (ticket.priority <= this.level) {
      console.log(`${this.name} handling ticket: ${ticket.description}`);
      return true;
    }
    
    if (this.nextHandler) {
      console.log(`${this.name} escalating to next level`);
      return this.nextHandler.handle(ticket);
    }
    
    console.log('No handler available for this priority');
    return false;
  }
}

// Usage
const juniorSupport = new SupportHandler(1, 'Junior Support');
const seniorSupport = new SupportHandler(2, 'Senior Support');
const manager = new SupportHandler(3, 'Manager');
const director = new SupportHandler(4, 'Director');

juniorSupport
  .setNext(seniorSupport)
  .setNext(manager)
  .setNext(director);

// Test tickets
juniorSupport.handle({ priority: 1, description: 'Password reset' });
// Junior Support handling ticket: Password reset

juniorSupport.handle({ priority: 2, description: 'Account locked' });
// Junior Support escalating to next level
// Senior Support handling ticket: Account locked

juniorSupport.handle({ priority: 4, description: 'System outage' });
// Junior Support escalating to next level
// Senior Support escalating to next level
// Manager escalating to next level
// Director handling ticket: System outage
```

---

## State Pattern

The State Pattern allows an object to alter its behavior when its internal state changes.

### Basic State

```javascript
// State interface
class State {
  handle(context) {
    throw new Error('handle must be implemented');
  }
}

// Concrete states
class RedState extends State {
  handle(context) {
    console.log('Red Light - STOP');
    context.setState(new GreenState());
  }
}

class YellowState extends State {
  handle(context) {
    console.log('Yellow Light - CAUTION');
    context.setState(new RedState());
  }
}

class GreenState extends State {
  handle(context) {
    console.log('Green Light - GO');
    context.setState(new YellowState());
  }
}

// Context
class TrafficLight {
  constructor() {
    this.state = new RedState();
  }
  
  setState(state) {
    this.state = state;
  }
  
  change() {
    this.state.handle(this);
  }
}

// Usage
const light = new TrafficLight();
light.change(); // Red Light - STOP
light.change(); // Green Light - GO
light.change(); // Yellow Light - CAUTION
light.change(); // Red Light - STOP
```

### Document State Machine

```javascript
class Document {
  constructor() {
    this.content = '';
    this.state = new DraftState();
  }
  
  setState(state) {
    this.state = state;
    console.log(`State changed to: ${state.constructor.name}`);
  }
  
  publish() {
    this.state.publish(this);
  }
  
  review() {
    this.state.review(this);
  }
  
  approve() {
    this.state.approve(this);
  }
  
  reject() {
    this.state.reject(this);
  }
}

class DocumentState {
  publish(document) {
    console.log('Cannot publish in this state');
  }
  
  review(document) {
    console.log('Cannot review in this state');
  }
  
  approve(document) {
    console.log('Cannot approve in this state');
  }
  
  reject(document) {
    console.log('Cannot reject in this state');
  }
}

class DraftState extends DocumentState {
  review(document) {
    console.log('Submitting for review...');
    document.setState(new ReviewState());
  }
}

class ReviewState extends DocumentState {
  approve(document) {
    console.log('Approving document...');
    document.setState(new ApprovedState());
  }
  
  reject(document) {
    console.log('Rejecting document...');
    document.setState(new DraftState());
  }
}

class ApprovedState extends DocumentState {
  publish(document) {
    console.log('Publishing document...');
    document.setState(new PublishedState());
  }
}

class PublishedState extends DocumentState {
  // Published is final state
}

// Usage
const doc = new Document();

doc.review();   // Submitting for review...
doc.approve();  // Approving document...
doc.publish();  // Publishing document...
doc.review();   // Cannot review in this state
```

### Vending Machine

```javascript
class VendingMachine {
  constructor(inventory) {
    this.inventory = inventory;
    this.currentItem = null;
    this.currentMoney = 0;
    this.state = new ReadyState();
  }
  
  setState(state) {
    this.state = state;
  }
  
  selectItem(item) {
    this.state.selectItem(this, item);
  }
  
  insertMoney(amount) {
    this.state.insertMoney(this, amount);
  }
  
  dispense() {
    this.state.dispense(this);
  }
  
  cancel() {
    this.state.cancel(this);
  }
}

class VendingMachineState {
  selectItem(machine, item) {
    console.log('Invalid operation in this state');
  }
  
  insertMoney(machine, amount) {
    console.log('Invalid operation in this state');
  }
  
  dispense(machine) {
    console.log('Invalid operation in this state');
  }
  
  cancel(machine) {
    console.log('Invalid operation in this state');
  }
}

class ReadyState extends VendingMachineState {
  selectItem(machine, item) {
    if (machine.inventory[item] > 0) {
      console.log(`Selected: ${item}`);
      machine.currentItem = item;
      machine.setState(new ItemSelectedState());
    } else {
      console.log(`${item} is out of stock`);
    }
  }
}

class ItemSelectedState extends VendingMachineState {
  insertMoney(machine, amount) {
    machine.currentMoney += amount;
    console.log(`Inserted $${amount}. Total: $${machine.currentMoney}`);
    
    const itemPrice = 2.50; // Simplified pricing
    
    if (machine.currentMoney >= itemPrice) {
      machine.setState(new DispensingState());
      machine.dispense();
    }
  }
  
  cancel(machine) {
    console.log(`Cancelled. Refunding $${machine.currentMoney}`);
    machine.currentMoney = 0;
    machine.currentItem = null;
    machine.setState(new ReadyState());
  }
}

class DispensingState extends VendingMachineState {
  dispense(machine) {
    console.log(`Dispensing ${machine.currentItem}`);
    machine.inventory[machine.currentItem]--;
    
    const itemPrice = 2.50;
    const change = machine.currentMoney - itemPrice;
    
    if (change > 0) {
      console.log(`Change: $${change.toFixed(2)}`);
    }
    
    machine.currentMoney = 0;
    machine.currentItem = null;
    machine.setState(new ReadyState());
  }
}

// Usage
const machine = new VendingMachine({
  'Coke': 5,
  'Pepsi': 3,
  'Water': 10
});

machine.selectItem('Coke');
machine.insertMoney(1.00);
machine.insertMoney(1.00);
machine.insertMoney(1.00);
// Selected: Coke
// Inserted $1. Total: $1
// Inserted $1. Total: $2
// Inserted $1. Total: $3
// Dispensing Coke
// Change: $0.50
```

---

## Template Method Pattern

The Template Method Pattern defines the skeleton of an algorithm, letting subclasses override specific steps without changing the algorithm's structure.

### Basic Template Method

```javascript
class DataProcessor {
  // Template method
  process() {
    this.loadData();
    this.validateData();
    this.processData();
    this.saveData();
  }
  
  loadData() {
    throw new Error('loadData must be implemented');
  }
  
  validateData() {
    console.log('Validating data...');
  }
  
  processData() {
    throw new Error('processData must be implemented');
  }
  
  saveData() {
    console.log('Saving data...');
  }
}

// Concrete implementations
class CSVProcessor extends DataProcessor {
  loadData() {
    console.log('Loading CSV file...');
    this.data = 'csv,data,here';
  }
  
  processData() {
    console.log('Processing CSV data...');
    this.result = this.data.split(',');
  }
}

class JSONProcessor extends DataProcessor {
  loadData() {
    console.log('Loading JSON file...');
    this.data = '{"name":"Alice"}';
  }
  
  processData() {
    console.log('Processing JSON data...');
    this.result = JSON.parse(this.data);
  }
}

// Usage
const csvProcessor = new CSVProcessor();
csvProcessor.process();
// Loading CSV file...
// Validating data...
// Processing CSV data...
// Saving data...

const jsonProcessor = new JSONProcessor();
jsonProcessor.process();
// Loading JSON file...
// Validating data...
// Processing JSON data...
// Saving data...
```

### Game Template

```javascript
class Game {
  // Template method
  play() {
    this.initialize();
    this.startPlay();
    this.endPlay();
  }
  
  initialize() {
    console.log('Game initialized');
  }
  
  startPlay() {
    throw new Error('startPlay must be implemented');
  }
  
  endPlay() {
    throw new Error('endPlay must be implemented');
  }
}

class Chess extends Game {
  startPlay() {
    console.log('Chess game started');
    console.log('Moving pieces...');
  }
  
  endPlay() {
    console.log('Chess game ended');
  }
}

class Football extends Game {
  initialize() {
    super.initialize();
    console.log('Setting up field...');
  }
  
  startPlay() {
    console.log('Football game started');
    console.log('Kicking ball...');
  }
  
  endPlay() {
    console.log('Football game ended');
  }
}

// Usage
const chess = new Chess();
chess.play();
// Game initialized
// Chess game started
// Moving pieces...
// Chess game ended

const football = new Football();
football.play();
// Game initialized
// Setting up field...
// Football game started
// Kicking ball...
// Football game ended
```

### Report Generator

```javascript
class ReportGenerator {
  generate() {
    this.fetchData();
    this.formatHeader();
    this.formatBody();
    this.formatFooter();
    return this.output;
  }
  
  fetchData() {
    console.log('Fetching data...');
    this.data = { title: 'Report', items: [1, 2, 3] };
  }
  
  formatHeader() {
    throw new Error('formatHeader must be implemented');
  }
  
  formatBody() {
    throw new Error('formatBody must be implemented');
  }
  
  formatFooter() {
    throw new Error('formatFooter must be implemented');
  }
}

class PDFReport extends ReportGenerator {
  constructor() {
    super();
    this.output = '';
  }
  
  formatHeader() {
    this.output += `PDF Header: ${this.data.title}\n`;
  }
  
  formatBody() {
    this.output += 'PDF Body:\n';
    this.data.items.forEach(item => {
      this.output += `  - Item ${item}\n`;
    });
  }
  
  formatFooter() {
    this.output += 'PDF Footer\n';
  }
}

class HTMLReport extends ReportGenerator {
  constructor() {
    super();
    this.output = '';
  }
  
  formatHeader() {
    this.output += `<h1>${this.data.title}</h1>\n`;
  }
  
  formatBody() {
    this.output += '<ul>\n';
    this.data.items.forEach(item => {
      this.output += `  <li>Item ${item}</li>\n`;
    });
    this.output += '</ul>\n';
  }
  
  formatFooter() {
    this.output += '<footer>End of Report</footer>\n';
  }
}

// Usage
const pdfReport = new PDFReport();
console.log(pdfReport.generate());

const htmlReport = new HTMLReport();
console.log(htmlReport.generate());
```

---

## Mediator Pattern

The Mediator Pattern defines an object that encapsulates how a set of objects interact, promoting loose coupling.

### Basic Mediator

```javascript
class Mediator {
  constructor() {
    this.colleagues = [];
  }
  
  register(colleague) {
    this.colleagues.push(colleague);
    colleague.setMediator(this);
  }
  
  send(message, sender) {
    this.colleagues.forEach(colleague => {
      if (colleague !== sender) {
        colleague.receive(message, sender);
      }
    });
  }
}

class Colleague {
  constructor(name) {
    this.name = name;
    this.mediator = null;
  }
  
  setMediator(mediator) {
    this.mediator = mediator;
  }
  
  send(message) {
    console.log(`${this.name} sends: ${message}`);
    this.mediator.send(message, this);
  }
  
  receive(message, sender) {
    console.log(`${this.name} receives from ${sender.name}: ${message}`);
  }
}

// Usage
const mediator = new Mediator();

const colleague1 = new Colleague('Alice');
const colleague2 = new Colleague('Bob');
const colleague3 = new Colleague('Charlie');

mediator.register(colleague1);
mediator.register(colleague2);
mediator.register(colleague3);

colleague1.send('Hello everyone!');
// Alice sends: Hello everyone!
// Bob receives from Alice: Hello everyone!
// Charlie receives from Alice: Hello everyone!

colleague2.send('Hi Alice!');
// Bob sends: Hi Alice!
// Alice receives from Bob: Hi Alice!
// Charlie receives from Bob: Hi Alice!
```

### Chat Room Mediator

```javascript
class ChatRoom {
  constructor() {
    this.users = new Map();
  }
  
  register(user) {
    this.users.set(user.name, user);
    user.setChatRoom(this);
  }
  
  sendMessage(message, from, to) {
    if (to) {
      // Direct message
      const recipient = this.users.get(to);
      if (recipient) {
        recipient.receive(message, from);
      }
    } else {
      // Broadcast to all except sender
      this.users.forEach(user => {
        if (user.name !== from) {
          user.receive(message, from);
        }
      });
    }
  }
  
  showUsers() {
    console.log('Users in chat:', Array.from(this.users.keys()).join(', '));
  }
}

class User {
  constructor(name) {
    this.name = name;
    this.chatRoom = null;
  }
  
  setChatRoom(chatRoom) {
    this.chatRoom = chatRoom;
  }
  
  send(message, to = null) {
    console.log(`[${this.name}] Sending: ${message}`);
    this.chatRoom.sendMessage(message, this.name, to);
  }
  
  receive(message, from) {
    console.log(`[${this.name}] Received from ${from}: ${message}`);
  }
}

// Usage
const chatRoom = new ChatRoom();

const alice = new User('Alice');
const bob = new User('Bob');
const charlie = new User('Charlie');

chatRoom.register(alice);
chatRoom.register(bob);
chatRoom.register(charlie);

chatRoom.showUsers();

alice.send('Hello everyone!');
// [Alice] Sending: Hello everyone!
// [Bob] Received from Alice: Hello everyone!
// [Charlie] Received from Alice: Hello everyone!

bob.send('Hi Alice!', 'Alice');
// [Bob] Sending: Hi Alice!
// [Alice] Received from Bob: Hi Alice!
```

### Air Traffic Control

```javascript
class ControlTower {
  constructor() {
    this.aircraft = new Map();
  }
  
  register(plane) {
    this.aircraft.set(plane.id, plane);
    plane.setControlTower(this);
    console.log(`${plane.id} registered with control tower`);
  }
  
  requestLanding(plane) {
    console.log(`${plane.id} requests landing`);
    
    // Check if runway is clear
    const isRunwayClear = ![...this.aircraft.values()]
      .some(p => p !== plane && p.status === 'landing');
    
    if (isRunwayClear) {
      plane.receivePermission('Landing approved');
      return true;
    } else {
      plane.receivePermission('Hold position, runway busy');
      return false;
    }
  }
  
  requestTakeoff(plane) {
    console.log(`${plane.id} requests takeoff`);
    plane.receivePermission('Takeoff approved');
  }
  
  reportPosition(plane, position) {
    console.log(`${plane.id} at position ${position}`);
  }
}

class Aircraft {
  constructor(id) {
    this.id = id;
    this.controlTower = null;
    this.status = 'airborne';
  }
  
  setControlTower(tower) {
    this.controlTower = tower;
  }
  
  requestLanding() {
    this.status = 'landing';
    this.controlTower.requestLanding(this);
  }
  
  requestTakeoff() {
    this.status = 'taking off';
    this.controlTower.requestTakeoff(this);
  }
  
  reportPosition(position) {
    this.controlTower.reportPosition(this, position);
  }
  
  receivePermission(message) {
    console.log(`${this.id} receives: ${message}`);
  }
}

// Usage
const tower = new ControlTower();

const flight1 = new Aircraft('Flight 001');
const flight2 = new Aircraft('Flight 002');

tower.register(flight1);
tower.register(flight2);

flight1.reportPosition('10 miles north');
flight1.requestLanding();

flight2.requestLanding(); // Should wait
```

---

## Memento Pattern

The Memento Pattern captures and externalizes an object's internal state without violating encapsulation, allowing the object to be restored to this state later.

### Basic Memento

```javascript
// Memento
class Memento {
  constructor(state) {
    this.state = state;
    this.timestamp = new Date();
  }
  
  getState() {
    return this.state;
  }
  
  getTimestamp() {
    return this.timestamp;
  }
}

// Originator
class TextEditor {
  constructor() {
    this.content = '';
  }
  
  type(text) {
    this.content += text;
  }
  
  getContent() {
    return this.content;
  }
  
  save() {
    return new Memento(this.content);
  }
  
  restore(memento) {
    this.content = memento.getState();
  }
}

// Caretaker
class History {
  constructor() {
    this.mementos = [];
  }
  
  push(memento) {
    this.mementos.push(memento);
  }
  
  pop() {
    return this.mementos.pop();
  }
  
  isEmpty() {
    return this.mementos.length === 0;
  }
}

// Usage
const editor = new TextEditor();
const history = new History();

editor.type('Hello');
history.push(editor.save());

editor.type(' World');
history.push(editor.save());

editor.type('!');
console.log('Current:', editor.getContent()); // "Hello World!"

// Undo
editor.restore(history.pop());
console.log('After undo:', editor.getContent()); // "Hello World"

// Undo again
editor.restore(history.pop());
console.log('After undo:', editor.getContent()); // "Hello"
```

### Game State Memento

```javascript
class GameState {
  constructor(level, score, health) {
    this.level = level;
    this.score = score;
    this.health = health;
  }
}

class Game {
  constructor() {
    this.level = 1;
    this.score = 0;
    this.health = 100;
  }
  
  play() {
    this.score += 100;
    console.log(`Playing... Score: ${this.score}`);
  }
  
  levelUp() {
    this.level++;
    this.health = 100;
    console.log(`Level up! Now at level ${this.level}`);
  }
  
  takeDamage(amount) {
    this.health -= amount;
    console.log(`Took damage! Health: ${this.health}`);
  }
  
  save() {
    console.log('Saving game...');
    return new GameState(this.level, this.score, this.health);
  }
  
  load(state) {
    console.log('Loading game...');
    this.level = state.level;
    this.score = state.score;
    this.health = state.health;
  }
  
  display() {
    console.log(`Level: ${this.level}, Score: ${this.score}, Health: ${this.health}`);
  }
}

class SaveManager {
  constructor() {
    this.saves = [];
  }
  
  save(state) {
    this.saves.push(state);
    console.log(`Saved state #${this.saves.length}`);
  }
  
  load(index) {
    if (index >= 0 && index < this.saves.length) {
      return this.saves[index];
    }
    return null;
  }
  
  list() {
    this.saves.forEach((state, index) => {
      console.log(`Save #${index + 1}: Level ${state.level}, Score ${state.score}`);
    });
  }
}

// Usage
const game = new Game();
const saveManager = new SaveManager();

game.play();
game.levelUp();
game.display(); // Level: 2, Score: 100, Health: 100

saveManager.save(game.save()); // Save point 1

game.play();
game.takeDamage(50);
game.display(); // Level: 2, Score: 200, Health: 50

saveManager.save(game.save()); // Save point 2

game.play();
game.takeDamage(60);
game.display(); // Level: 2, Score: 300, Health: -10 (dead)

// Load previous save
saveManager.list();
game.load(saveManager.load(0));
game.display(); // Level: 2, Score: 100, Health: 100
```

---

## Visitor Pattern

The Visitor Pattern lets you add further operations to objects without having to modify them, by separating the algorithm from the objects on which it operates.

### Basic Visitor

```javascript
// Element classes
class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }
  
  accept(visitor) {
    return visitor.visitEmployee(this);
  }
}

class Department {
  constructor(name) {
    this.name = name;
    this.employees = [];
  }
  
  addEmployee(employee) {
    this.employees.push(employee);
  }
  
  accept(visitor) {
    return visitor.visitDepartment(this);
  }
}

// Visitors
class SalaryReportVisitor {
  visitEmployee(employee) {
    return `${employee.name}: $${employee.salary}`;
  }
  
  visitDepartment(department) {
    let report = `Department: ${department.name}\n`;
    department.employees.forEach(emp => {
      report += `  ${emp.accept(this)}\n`;
    });
    return report;
  }
}

class BonusCalculatorVisitor {
  visitEmployee(employee) {
    return employee.salary * 0.1; // 10% bonus
  }
  
  visitDepartment(department) {
    let total = 0;
    department.employees.forEach(emp => {
      total += emp.accept(this);
    });
    return total;
  }
}

// Usage
const engineering = new Department('Engineering');
engineering.addEmployee(new Employee('Alice', 100000));
engineering.addEmployee(new Employee('Bob', 120000));

const salaryReport = new SalaryReportVisitor();
console.log(engineering.accept(salaryReport));
// Department: Engineering
//   Alice: $100000
//   Bob: $120000

const bonusCalc = new BonusCalculatorVisitor();
console.log('Total bonuses:', engineering.accept(bonusCalc));
// Total bonuses: 22000
```

### File System Visitor

```javascript
class File {
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }
  
  accept(visitor) {
    visitor.visitFile(this);
  }
}

class Directory {
  constructor(name) {
    this.name = name;
    this.children = [];
  }
  
  add(child) {
    this.children.push(child);
  }
  
  accept(visitor) {
    visitor.visitDirectory(this);
    this.children.forEach(child => child.accept(visitor));
  }
}

class SizeCalculatorVisitor {
  constructor() {
    this.totalSize = 0;
  }
  
  visitFile(file) {
    this.totalSize += file.size;
  }
  
  visitDirectory(directory) {
    // Just traverse, size calculated from files
  }
  
  getTotal() {
    return this.totalSize;
  }
}

class DisplayVisitor {
  constructor() {
    this.indent = 0;
  }
  
  visitFile(file) {
    console.log(`${' '.repeat(this.indent)}📄 ${file.name} (${file.size}KB)`);
  }
  
  visitDirectory(directory) {
    console.log(`${' '.repeat(this.indent)}📁 ${directory.name}/`);
    this.indent += 2;
  }
}

// Usage
const root = new Directory('root');

const docs = new Directory('documents');
docs.add(new File('resume.pdf', 100));
docs.add(new File('letter.pdf', 50));

const photos = new Directory('photos');
photos.add(new File('vacation.jpg', 2000));

root.add(docs);
root.add(photos);
root.add(new File('readme.txt', 5));

const display = new DisplayVisitor();
root.accept(display);

const sizeCalc = new SizeCalculatorVisitor();
root.accept(sizeCalc);
console.log(`Total size: ${sizeCalc.getTotal()}KB`);
```

---

## Summary

This document covered Behavioral Design Patterns:

- **Observer Pattern**: One-to-many dependency (Event emitters, Pub/Sub, Store)
- **Iterator Pattern**: Sequential access to collections (Array iterator, ES6 iterators, generators, tree traversal)
- **Strategy Pattern**: Interchangeable algorithms (Payment strategies, validation, sorting)
- **Command Pattern**: Encapsulating requests (Basic commands, undo/redo, macro commands)
- **Chain of Responsibility**: Passing requests along a chain (Authentication chain, middleware, support tickets)
- **State Pattern**: Behavior changes with state (Traffic light, document workflow, vending machine)
- **Template Method**: Algorithm skeleton with customizable steps (Data processors, games, reports)
- **Mediator**: Centralized communication (Basic mediator, chat room, air traffic control)
- **Memento**: State capture and restore (Text editor, game saves)
- **Visitor**: Operations on object structures (Salary reports, file system traversal)

These patterns help manage complex behaviors and communication between objects.

---

**Related Topics:**

- Functional Patterns
- Async Patterns
- Event-Driven Architecture
- State Machines