# 5.3 Property Inheritance

Property inheritance determines how properties are accessed and distinguished between an object's own properties and those inherited through the prototype chain.

### Own Properties vs Inherited Properties

JavaScript distinguishes between properties defined directly on an object (own properties) and properties inherited from the prototype chain.

**Understanding Own Properties:**

```javascript
function Person(name, age) {
  this.name = name; // Own property
  this.age = age;   // Own property
}

Person.prototype.species = 'Human'; // Inherited property

Person.prototype.greet = function() { // Inherited property (method)
  console.log('Hello, I am ' + this.name);
};

const alice = new Person('Alice', 30);

// Own properties (defined on instance)
console.log(alice.name); // 'Alice' (own)
console.log(alice.age);  // 30 (own)

// Inherited properties (from prototype)
console.log(alice.species); // 'Human' (inherited)
console.log(typeof alice.greet); // 'function' (inherited)

// Check where properties come from
console.log(alice.hasOwnProperty('name'));    // true
console.log(alice.hasOwnProperty('age'));     // true
console.log(alice.hasOwnProperty('species')); // false (inherited)
console.log(alice.hasOwnProperty('greet'));   // false (inherited)
```

### `hasOwnProperty()`

The `hasOwnProperty()` method determines whether an object has a property as its own (not inherited).

**Basic Usage:**

```javascript
const obj = {
  ownProp: 'I am own',
  anotherOwn: 42
};

console.log(obj.hasOwnProperty('ownProp'));      // true
console.log(obj.hasOwnProperty('anotherOwn'));   // true
console.log(obj.hasOwnProperty('toString'));     // false (inherited from Object.prototype)
console.log(obj.hasOwnProperty('nonExistent'));  // false
```

### `Object.hasOwn()`

`Object.hasOwn()` is a modern alternative to `hasOwnProperty()` introduced in ES2022, providing a more reliable way to check for own properties.

**Basic Usage:**

```javascript
const obj = {
  name: 'Alice',
  age: 30
};

// Modern way (ES2022+)
console.log(Object.hasOwn(obj, 'name')); // true
console.log(Object.hasOwn(obj, 'age'));  // true
console.log(Object.hasOwn(obj, 'toString')); // false

// Old way (still works)
console.log(obj.hasOwnProperty('name')); // true
```

### Property Enumeration and Inheritance

Different methods enumerate properties differently, especially regarding inherited properties.

**Enumeration Methods Comparison:**

```javascript
function Parent(x) {
  this.x = x;
}

Parent.prototype.parentMethod = function() {};

function Child(x, y) {
  Parent.call(this, x);
  this.y = y;
}

Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
Child.prototype.childMethod = function() {};

const obj = new Child(1, 2);
obj.z = 3;

// Non-enumerable property
Object.defineProperty(obj, 'hidden', {
  value: 'secret',
  enumerable: false
});

console.log('=== for...in (enumerable own + inherited) ===');
for (let key in obj) {
  console.log(key);
}
// Output: x, y, z, parentMethod, childMethod

console.log('\n=== Object.keys (enumerable own only) ===');
console.log(Object.keys(obj));
// Output: ['x', 'y', 'z']

console.log('\n=== Object.getOwnPropertyNames (all own, including non-enumerable) ===');
console.log(Object.getOwnPropertyNames(obj));
// Output: ['x', 'y', 'z', 'hidden']
```

### Shadowing Properties

Property shadowing occurs when an object has an own property with the same name as an inherited property, effectively hiding the inherited property.

**Basic Shadowing:**

```javascript
function Person() {}
Person.prototype.name = 'Default Name';

const alice = new Person();

// Access prototype property
console.log(alice.name); // 'Default Name'
console.log(alice.hasOwnProperty('name')); // false

// Create own property (shadows prototype)
alice.name = 'Alice';

console.log(alice.name); // 'Alice' (own property)
console.log(alice.hasOwnProperty('name')); // true

// Prototype property is unchanged
console.log(Person.prototype.name); // 'Default Name'

// Other instances still use prototype
const bob = new Person();
console.log(bob.name); // 'Default Name'

// Delete own property to reveal prototype property
delete alice.name;
console.log(alice.name); // 'Default Name' (back to prototype)
console.log(alice.hasOwnProperty('name')); // false
```

---
