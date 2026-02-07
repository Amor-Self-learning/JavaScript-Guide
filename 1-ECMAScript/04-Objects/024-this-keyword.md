# 4.6 `this` Keyword

The `this` keyword in JavaScript refers to the object that is currently executing the code. Its value depends on how and where a function is called.

### Global Context

In the global execution context, `this` refers to the global object.

**In Browser Environment:**

```javascript
console.log(this); // Window object

this.globalVar = 'I am global';
console.log(window.globalVar); // 'I am global'

var anotherVar = 'Also global';
console.log(this.anotherVar); // 'Also global'
```

**In Node.js Environment:**

```javascript
console.log(this); // {} (empty object in module scope)

// In the global scope (outside module)
// this would refer to the global object
```

**Global Functions:**

```javascript
function showThis() {
  console.log(this);
}

showThis(); // Window object (browser) or global object (Node.js)
```

### Function Context

In regular functions, `this` depends on how the function is called, not where it's defined.

**Simple Function Call:**

```javascript
function regularFunction() {
  console.log(this);
}

regularFunction(); // Window (non-strict) or undefined (strict mode)
```

**Function Call Variations:**

```javascript
function greet(greeting) {
  console.log(greeting + ', ' + this.name);
}

// Direct call - this is undefined (strict mode) or global (non-strict)
greet('Hello'); // Error in strict mode or "Hello, undefined" in non-strict

// Assigned to variable
const greetFunc = greet;
greetFunc('Hi'); // Same behavior as direct call
```

### Method Context

When a function is called as a method of an object, `this` refers to that object.

**Basic Method Call:**

```javascript
const person = {
  name: 'Alice',
  age: 30,
  greet: function() {
    console.log(`Hello, I'm ${this.name} and I'm ${this.age} years old.`);
  }
};

person.greet(); // "Hello, I'm Alice and I'm 30 years old."
// this === person
```

**Method with Nested Properties:**

```javascript
const user = {
  firstName: 'John',
  lastName: 'Doe',
  fullName: function() {
    return this.firstName + ' ' + this.lastName;
  },
  getInfo: function() {
    return {
      name: this.fullName(),
      description: `User: ${this.firstName}`
    };
  }
};

console.log(user.fullName()); // 'John Doe'
console.log(user.getInfo()); // { name: 'John Doe', description: 'User: John' }
```

**Losing `this` Context:**

```javascript
const person = {
  name: 'Bob',
  sayName: function() {
    console.log(this.name);
  }
};

person.sayName(); // 'Bob' (this === person)

// Losing context when assigned to variable
const sayNameFunc = person.sayName;
sayNameFunc(); // undefined (this is global/undefined)

// Losing context in callbacks
setTimeout(person.sayName, 1000); // undefined (after 1 second)
```

**Nested Objects:**

```javascript
const company = {
  name: 'Tech Corp',
  department: {
    name: 'Engineering',
    manager: {
      name: 'Alice',
      introduce: function() {
        console.log(`I'm ${this.name}`);
      }
    }
  }
};

company.department.manager.introduce(); // "I'm Alice"
// this refers to the immediate parent (manager object)
```

### Constructor Context

When a function is used as a constructor with the `new` keyword, `this` refers to the newly created object.

**Basic Constructor:**

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.greet = function() {
    console.log(`Hello, I'm ${this.name}`);
  };
}

const alice = new Person('Alice', 30);
const bob = new Person('Bob', 25);

alice.greet(); // "Hello, I'm Alice"
bob.greet();   // "Hello, I'm Bob"

console.log(alice.name); // 'Alice'
console.log(bob.name);   // 'Bob'
```

**What `new` Does:**

```javascript
function User(username) {
  // 1. new creates empty object: this = {}
  // 2. Sets prototype: this.__proto__ = User.prototype
  // 3. Executes function body
  this.username = username;
  this.isActive = true;
  // 4. Returns this (implicitly)
}

const user1 = new User('john_doe');
console.log(user1); // User { username: 'john_doe', isActive: true }
```

**Forgetting `new` Keyword:**

```javascript
function Person(name) {
  this.name = name;
}

// Without new - this refers to global object
const wrongPerson = Person('Charlie');
console.log(wrongPerson); // undefined (function doesn't return anything)
console.log(window.name); // 'Charlie' (accidentally created global variable!)

// With new - this refers to new object
const correctPerson = new Person('Diana');
console.log(correctPerson); // Person { name: 'Diana' }
```

**Constructor with Return Value:**

```javascript
function CustomObject(value) {
  this.value = value;
  
  // Returning object overrides the default behavior
  return { customValue: value * 2 };
}

const obj = new CustomObject(5);
console.log(obj); // { customValue: 10 } (returned object is used)

function AnotherObject(value) {
  this.value = value;
  
  // Returning primitive doesn't override
  return 42;
}

const obj2 = new AnotherObject(10);
console.log(obj2); // AnotherObject { value: 10 } (primitive return ignored)
```

### Arrow Functions and `this`

Arrow functions don't have their own `this` binding. They inherit `this` from the enclosing lexical context.

**Basic Arrow Function Behavior:**

```javascript
const obj = {
  name: 'Regular Object',
  regularFunc: function() {
    console.log('Regular:', this.name);
  },
  arrowFunc: () => {
    console.log('Arrow:', this.name);
  }
};

obj.regularFunc(); // 'Regular: Regular Object'
obj.arrowFunc();   // 'Arrow: undefined' (inherits global this)
```

**Arrow Functions in Methods:**

```javascript
const person = {
  name: 'Alice',
  hobbies: ['reading', 'gaming', 'cooking'],
  
  showHobbies: function() {
    this.hobbies.forEach(function(hobby) {
      // Regular function - this is undefined/global
      console.log(this.name + ' likes ' + hobby); // Error or wrong output
    });
  },
  
  showHobbiesArrow: function() {
    this.hobbies.forEach((hobby) => {
      // Arrow function - this inherited from showHobbiesArrow
      console.log(this.name + ' likes ' + hobby); // Works correctly!
    });
  }
};

// person.showHobbies(); // Error or "undefined likes reading"
person.showHobbiesArrow();
// Alice likes reading
// Alice likes gaming
// Alice likes cooking
```

**Common Use Case - Callbacks:**

```javascript
const counter = {
  count: 0,
  
  // Using regular function (problematic)
  startRegular: function() {
    setInterval(function() {
      this.count++; // this is global/undefined, not counter
      console.log(this.count);
    }, 1000);
  },
  
  // Using arrow function (correct)
  startArrow: function() {
    setInterval(() => {
      this.count++; // this is counter object
      console.log(this.count);
    }, 1000);
  },
  
  // Using bind (alternative solution)
  startBind: function() {
    setInterval(function() {
      this.count++;
      console.log(this.count);
    }.bind(this), 1000);
  }
};

counter.startArrow(); // 1, 2, 3, 4... (works correctly)
```

**Arrow Functions and Constructors:**

```javascript
// Arrow functions CANNOT be used as constructors
const Person = (name) => {
  this.name = name;
};

// const p = new Person('Alice'); // TypeError: Person is not a constructor
```

**Nested Arrow Functions:**

```javascript
const obj = {
  name: 'Outer',
  
  method: function() {
    console.log('Method this:', this.name); // 'Outer'
    
    const inner1 = () => {
      console.log('Arrow 1 this:', this.name); // 'Outer' (inherited)
      
      const inner2 = () => {
        console.log('Arrow 2 this:', this.name); // 'Outer' (inherited)
      };
      
      inner2();
    };
    
    inner1();
  }
};

obj.method();
// Method this: Outer
// Arrow 1 this: Outer
// Arrow 2 this: Outer
```

### Explicit Binding (`call`, `apply`, `bind`)

JavaScript provides methods to explicitly set the value of `this` in a function call.

**`call()` Method:**

```javascript
function greet(greeting, punctuation) {
  console.log(greeting + ', ' + this.name + punctuation);
}

const person1 = { name: 'Alice' };
const person2 = { name: 'Bob' };

// call(thisArg, arg1, arg2, ...)
greet.call(person1, 'Hello', '!'); // "Hello, Alice!"
greet.call(person2, 'Hi', '.'); // "Hi, Bob."
```

**`apply()` Method:**

```javascript
function introduce(greeting, age, city) {
  console.log(`${greeting}, I'm ${this.name}, ${age} years old from ${city}`);
}

const person = { name: 'Charlie' };

// apply(thisArg, [argsArray])
introduce.apply(person, ['Hello', 30, 'New York']);
// "Hello, I'm Charlie, 30 years old from New York"
```

**`call()` vs `apply()`:**

```javascript
function sum(a, b, c) {
  return a + b + c + this.base;
}

const obj = { base: 10 };

// call - arguments passed individually
console.log(sum.call(obj, 1, 2, 3)); // 16 (1+2+3+10)

// apply - arguments passed as array
console.log(sum.apply(obj, [1, 2, 3])); // 16 (1+2+3+10)

// Practical use of apply with Math.max
const numbers = [5, 2, 9, 1, 7];
console.log(Math.max.apply(null, numbers)); // 9
```

**`bind()` Method:**

```javascript
function greet(greeting) {
  console.log(greeting + ', ' + this.name);
}

const person = { name: 'Diana' };

// bind returns a NEW function with this permanently set
const greetDiana = greet.bind(person);

greetDiana('Hello'); // "Hello, Diana"
greetDiana('Hi');    // "Hi, Diana"

// Original function unchanged
greet('Hey'); // "Hey, undefined" (this is global)
```

**Partial Application with `bind()`:**

```javascript
function multiply(a, b) {
  return a * b;
}

// Pre-set first argument
const double = multiply.bind(null, 2);
const triple = multiply.bind(null, 3);

console.log(double(5)); // 10 (2 * 5)
console.log(triple(5)); // 15 (3 * 5)
```

**Fixing Lost Context with `bind()`:**

```javascript
const person = {
  name: 'Emma',
  sayName: function() {
    console.log(this.name);
  }
};

// Problem: lost context
setTimeout(person.sayName, 1000); // undefined

// Solution 1: bind
setTimeout(person.sayName.bind(person), 1000); // 'Emma'

// Solution 2: arrow function
setTimeout(() => person.sayName(), 1000); // 'Emma'

// Solution 3: wrapper function
setTimeout(function() { person.sayName(); }, 1000); // 'Emma'
```

**Chaining Bind Calls:**

```javascript
function show() {
  console.log(this.value);
}

const obj1 = { value: 'First' };
const obj2 = { value: 'Second' };

const bound1 = show.bind(obj1);
const bound2 = bound1.bind(obj2); // Trying to rebind

bound1(); // 'First'
bound2(); // 'First' (still uses obj1! Cannot rebind)
```

**Explicit Binding with Arrow Functions:**

```javascript
const arrowFunc = () => {
  console.log(this.value);
};

const obj = { value: 'Test' };

// Arrow functions ignore call/apply/bind
arrowFunc.call(obj);  // undefined (uses lexical this)
arrowFunc.apply(obj); // undefined
const boundArrow = arrowFunc.bind(obj);
boundArrow(); // undefined

// Arrow functions inherit this from where they're defined
const container = {
  value: 'Container',
  getArrow: function() {
    return () => console.log(this.value);
  }
};

const myArrow = container.getArrow();
myArrow(); // 'Container' (inherited from getArrow's this)
myArrow.call({ value: 'Other' }); // Still 'Container' (cannot be changed)
```

### `this` in Event Handlers

In event handlers, `this` typically refers to the element that triggered the event.

**DOM Event Handlers:**

```javascript
// HTML: <button id="myButton">Click Me</button>

const button = document.getElementById('myButton');

// Regular function - this is the button element
button.addEventListener('click', function() {
  console.log(this); // <button id="myButton">
  console.log(this.textContent); // "Click Me"
  this.style.backgroundColor = 'blue';
});
```

**Arrow Functions in Event Handlers:**

```javascript
const button = document.getElementById('myButton');

// Arrow function - this is NOT the button
button.addEventListener('click', () => {
  console.log(this); // Window or whatever this was in outer scope
  // this.style.backgroundColor = 'blue'; // Won't work as expected!
});
```

**Using `this` in Object Methods as Event Handlers:**

```javascript
const app = {
  count: 0,
  buttonElement: document.getElementById('myButton'),
  
  init: function() {
    // Problem: this will be the button, not app
    this.buttonElement.addEventListener('click', this.handleClick);
    
    // Solution 1: bind
    // this.buttonElement.addEventListener('click', this.handleClick.bind(this));
    
    // Solution 2: arrow function
    // this.buttonElement.addEventListener('click', () => this.handleClick());
  },
  
  handleClick: function() {
    this.count++; // If not bound correctly, this.count is undefined
    console.log('Count:', this.count);
  }
};

// Proper implementation
const betterApp = {
  count: 0,
  buttonElement: document.getElementById('myButton'),
  
  init: function() {
    this.buttonElement.addEventListener('click', this.handleClick.bind(this));
  },
  
  handleClick: function(event) {
    this.count++;
    console.log('Count:', this.count);
    console.log('Clicked element:', event.currentTarget); // Access element via event
  }
};

betterApp.init();
```

**Inline Event Handlers:**

```html
<!-- HTML with inline handler -->
<button onclick="handleClick()">Click Me</button>

<script>
// this in inline handlers refers to the element
function handleClick() {
  console.log(this); // Window (function called in global context)
}

// To access element, use:
// <button onclick="handleClick.call(this)">Click Me</button>
// Now this inside handleClick will be the button
</script>
```

**Multiple Event Handlers:**

```javascript
const element = document.getElementById('myElement');

const handler = {
  name: 'Handler Object',
  
  onClick: function(event) {
    console.log('Clicked by:', this.name);
    console.log('Element:', event.currentTarget);
  },
  
  onHover: function(event) {
    console.log('Hovered by:', this.name);
  }
};

// Must bind to preserve this context
element.addEventListener('click', handler.onClick.bind(handler));
element.addEventListener('mouseenter', handler.onHover.bind(handler));
```

### `this` in Strict Mode

Strict mode changes how `this` behaves in certain contexts.

**Global Context in Strict Mode:**

```javascript
'use strict';

console.log(this); // undefined (in function context)

function showThis() {
  console.log(this);
}

showThis(); // undefined (not Window!)
```

**Non-Strict vs Strict Mode:**

```javascript
// Non-strict mode
function nonStrict() {
  console.log(this); // Window or global object
}

nonStrict();

// Strict mode
function strictMode() {
  'use strict';
  console.log(this); // undefined
}

strictMode();
```

**Method Calls (Same in Both Modes):**

```javascript
'use strict';

const obj = {
  method: function() {
    console.log(this);
  }
};

obj.method(); // obj (same as non-strict mode)
```

**Accidental Global Assignment Prevention:**

```javascript
'use strict';

function Person(name) {
  this.name = name; // TypeError if called without 'new'
}

// Person('Alice'); // TypeError: Cannot set property 'name' of undefined

const person = new Person('Alice'); // Works fine
console.log(person.name); // 'Alice'
```

**Strict Mode in Different Scopes:**

```javascript
// Non-strict outer scope
function outer() {
  console.log('Outer this:', this); // Window/global
  
  function inner() {
    'use strict';
    console.log('Inner this:', this); // undefined
  }
  
  inner();
}

outer();
```

### Common Pitfalls and Solutions

Understanding common `this` pitfalls helps avoid bugs and write better code.

**Pitfall 1: Losing Context in Callbacks**

```javascript
// Problem
const user = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    this.tasks.forEach(function(task) {
      console.log(this.name + ' needs to do: ' + task); // this is undefined!
    });
  }
};

// Solution 1: Arrow function
const user1 = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    this.tasks.forEach((task) => {
      console.log(this.name + ' needs to do: ' + task); // Works!
    });
  }
};

// Solution 2: Bind
const user2 = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    this.tasks.forEach(function(task) {
      console.log(this.name + ' needs to do: ' + task);
    }.bind(this)); // Bind this to the callback
  }
};

// Solution 3: Store this in variable
const user3 = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    const self = this; // Store reference
    this.tasks.forEach(function(task) {
      console.log(self.name + ' needs to do: ' + task); // Use stored reference
    });
  }
};

// Solution 4: forEach thisArg parameter
const user4 = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    this.tasks.forEach(function(task) {
      console.log(this.name + ' needs to do: ' + task);
    }, this); // Pass this as second argument
  }
};
```

**Pitfall 2: Method Assignment**

```javascript
// Problem
const person = {
  name: 'Bob',
  greet: function() {
    console.log('Hello, ' + this.name);
  }
};

const greet = person.greet;
greet(); // "Hello, undefined" - lost context!

// Solution 1: Call as method
person.greet(); // "Hello, Bob"

// Solution 2: Bind
const boundGreet = person.greet.bind(person);
boundGreet(); // "Hello, Bob"

// Solution 3: Wrapper function
const wrappedGreet = () => person.greet();
wrappedGreet(); // "Hello, Bob"
```

**Pitfall 3: Nested Functions**

```javascript
// Problem
const obj = {
  value: 42,
  
  outerMethod: function() {
    console.log('Outer:', this.value); // 42
    
    function innerFunction() {
      console.log('Inner:', this.value); // undefined - lost context!
    }
    
    innerFunction();
  }
};

obj.outerMethod();

// Solution: Arrow function for inner function
const obj2 = {
  value: 42,
  
  outerMethod: function() {
    console.log('Outer:', this.value); // 42
    
    const innerFunction = () => {
      console.log('Inner:', this.value); // 42 - inherited context!
    };
    
    innerFunction();
  }
};

obj2.outerMethod();
```

**Pitfall 4: setTimeout/setInterval**

```javascript
// Problem
const timer = {
  seconds: 0,
  
  start: function() {
    setInterval(function() {
      this.seconds++; // this is global/undefined!
      console.log(this.seconds);
    }, 1000);
  }
};

// Solution 1: Arrow function
const timer1 = {
  seconds: 0,
  
  start: function() {
    setInterval(() => {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
};

// Solution 2: Bind
const timer2 = {
  seconds: 0,
  
  start: function() {
    setInterval(function() {
      this.seconds++;
      console.log(this.seconds);
    }.bind(this), 1000);
  }
};

// Solution 3: Store this
const timer3 = {
  seconds: 0,
  
  start: function() {
    const self = this;
    setInterval(function() {
      self.seconds++;
      console.log(self.seconds);
    }, 1000);
  }
};
```

**Pitfall 5: Class Methods as Callbacks**

```javascript
// Problem
class Button {
  constructor(label) {
    this.label = label;
  }
  
  click() {
    console.log('Button clicked:', this.label);
  }
}

const myButton = new Button('Submit');
const element = document.getElementById('btn');

// This won't work correctly
// element.addEventListener('click', myButton.click); // this.label is undefined

// Solution 1: Bind in constructor
class Button1 {
  constructor(label) {
    this.label = label;
    this.click = this.click.bind(this); // Bind in constructor
  }
  
  click() {
    console.log('Button clicked:', this.label);
  }
}

// Solution 2: Arrow function
class Button2 {
  constructor(label) {
    this.label = label;
  }
  
  // Class field with arrow function
  click = () => {
    console.log('Button clicked:', this.label);
  }
}

// Solution 3: Wrapper
const myButton3 = new Button('Submit');
element.addEventListener('click', () => myButton3.click());
```

**Pitfall 6: Destructuring Methods**

```javascript
// Problem
const user = {
  name: 'Charlie',
  getName: function() {
    return this.name;
  }
};

const { getName } = user;
console.log(getName()); // undefined - lost context!

// Solution 1: Don't destructure
console.log(user.getName()); // 'Charlie'

// Solution 2: Bind during destructuring
const { getName: boundGetName } = user;
const finalGetName = boundGetName.bind(user);
console.log(finalGetName()); // 'Charlie'

// Solution 3: Use arrow function wrapper
const user2 = {
  name: 'Charlie',
  getName: function() {
    return this.name;
  }
};

const getNameWrapper = () => user2.getName();
console.log(getNameWrapper()); // 'Charlie'
```

**Best Practices Summary:**

```javascript
// 1. Use arrow functions for callbacks when you need to preserve this
const obj1 = {
  method() {
    setTimeout(() => {
      // this refers to obj1
    }, 1000);
  }
};

// 2. Bind methods in constructor for event handlers
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    // this always refers to the component
  }
}

// 3. Store this in a variable when arrow functions aren't available
const obj2 = {
  method() {
    const self = this;
    someCallback(function() {
      // use self instead of this
    });
  }
};

// 4. Use call/apply/bind when you need explicit control
function greet() {
  console.log(this.name);
}
greet.call({ name: 'Alice' });

// 5. Remember: arrow functions inherit this, regular functions get their own
```

---
