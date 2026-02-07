# 4.5 Spread and Rest

The spread (`...`) and rest (`...`) operators use the same syntax but serve opposite purposes. Spread expands elements, while rest collects them.

### Spread Operator with Objects

The spread operator unpacks object properties into a new object or combines multiple objects.

**Basic Object Spreading:**

```javascript
const person = {
  name: 'Alice',
  age: 30
};

// Create a copy
const personCopy = { ...person };

console.log(personCopy); // { name: 'Alice', age: 30 }
console.log(personCopy === person); // false (different objects)
```

**Combining Objects:**

```javascript
const basicInfo = {
  name: 'Bob',
  age: 25
};

const contactInfo = {
  email: 'bob@example.com',
  phone: '555-0123'
};

// Merge objects
const completeProfile = { ...basicInfo, ...contactInfo };

console.log(completeProfile);
// {
//   name: 'Bob',
//   age: 25,
//   email: 'bob@example.com',
//   phone: '555-0123'
// }
```

**Overriding Properties:**

```javascript
const defaults = {
  theme: 'light',
  fontSize: 14,
  language: 'en'
};

const userPreferences = {
  theme: 'dark',
  fontSize: 16
};

// Later properties override earlier ones
const finalSettings = { ...defaults, ...userPreferences };

console.log(finalSettings);
// { theme: 'dark', fontSize: 16, language: 'en' }

// Order matters!
const reversedSettings = { ...userPreferences, ...defaults };
console.log(reversedSettings);
// { theme: 'light', fontSize: 14, language: 'en' }
```

**Adding or Modifying Properties:**

```javascript
const user = {
  id: 1,
  name: 'Charlie',
  email: 'charlie@example.com'
};

// Add new properties
const userWithTimestamp = {
  ...user,
  createdAt: new Date(),
  isActive: true
};

console.log(userWithTimestamp);
// {
//   id: 1,
//   name: 'Charlie',
//   email: 'charlie@example.com',
//   createdAt: [current date],
//   isActive: true
// }

// Modify existing property
const updatedUser = {
  ...user,
  name: 'Charles' // Override name
};

console.log(updatedUser);
// { id: 1, name: 'Charles', email: 'charlie@example.com' }
```

**Conditional Spreading:**

```javascript
const baseConfig = {
  host: 'localhost',
  port: 3000
};

const isProduction = false;

const config = {
  ...baseConfig,
  ...(isProduction && {
    host: 'example.com',
    ssl: true
  })
};

console.log(config);
// { host: 'localhost', port: 3000 }
// (production settings not added because isProduction is false)
```

**Nested Object Spreading:**

```javascript
const user = {
  name: 'Diana',
  address: {
    street: '123 Main St',
    city: 'Boston'
  }
};

// CAREFUL: This is a shallow copy
const userCopy = { ...user };

userCopy.address.city = 'New York';

console.log(user.address.city);     // 'New York' (original modified!)
console.log(userCopy.address.city); // 'New York'

// To properly copy nested objects, use deep spreading
const properCopy = {
  ...user,
  address: { ...user.address }
};

properCopy.address.city = 'Seattle';

console.log(user.address.city);       // 'New York' (unchanged)
console.log(properCopy.address.city); // 'Seattle'
```

### Rest Properties

The rest operator collects remaining properties into a new object. It's the opposite of spread.

**Basic Rest in Objects:**

```javascript
const person = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  city: 'New York',
  country: 'USA'
};

// Destructure some properties, collect the rest
const { firstName, lastName, ...details } = person;

console.log(firstName); // 'John'
console.log(lastName);  // 'Doe'
console.log(details);   // { age: 30, city: 'New York', country: 'USA' }
```

**Rest in Function Parameters:**

```javascript
// Collect all properties except specific ones
function updateUser(userId, { name, email, ...otherUpdates }) {
  console.log(`Updating user ${userId}`);
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Other updates:', otherUpdates);
}

updateUser(123, {
  name: 'Alice',
  email: 'alice@example.com',
  age: 28,
  city: 'Boston',
  preferences: { theme: 'dark' }
});
// Updating user 123
// Name: Alice
// Email: alice@example.com
// Other updates: { age: 28, city: 'Boston', preferences: { theme: 'dark' } }
```

**Filtering Object Properties:**

```javascript
// Remove unwanted properties
function removePrivateFields(obj) {
  const { password, ssn, creditCard, ...publicData } = obj;
  return publicData;
}

const user = {
  name: 'Bob',
  email: 'bob@example.com',
  password: 'secret',
  ssn: '123-45-6789',
  age: 35
};

const safeUser = removePrivateFields(user);
console.log(safeUser); // { name: 'Bob', email: 'bob@example.com', age: 35 }
```

**Combining Spread and Rest:**

```javascript
const original = {
  id: 1,
  name: 'Product',
  price: 99.99,
  category: 'Electronics',
  stock: 50
};

// Extract some fields, modify others, keep the rest
function transformProduct(product) {
  const { id, name, ...rest } = product;
  
  return {
    productId: id,
    productName: name.toUpperCase(),
    ...rest,
    lastModified: new Date()
  };
}

console.log(transformProduct(original));
// {
//   productId: 1,
//   productName: 'PRODUCT',
//   price: 99.99,
//   category: 'Electronics',
//   stock: 50,
//   lastModified: [current date]
// }
```

### Shallow vs Deep Copying

Understanding the difference between shallow and deep copying is crucial when working with objects.

**Shallow Copy Behavior:**

```javascript
const original = {
  name: 'Alice',
  age: 30,
  hobbies: ['reading', 'gaming'],
  address: {
    city: 'New York',
    country: 'USA'
  }
};

// Shallow copy using spread
const shallowCopy = { ...original };

// Modify primitive value (safe)
shallowCopy.name = 'Bob';
console.log(original.name); // 'Alice' (unchanged)
console.log(shallowCopy.name); // 'Bob'

// Modify nested object (NOT safe)
shallowCopy.address.city = 'Boston';
console.log(original.address.city); // 'Boston' (changed!)
console.log(shallowCopy.address.city); // 'Boston'

// Modify array (NOT safe)
shallowCopy.hobbies.push('cooking');
console.log(original.hobbies); // ['reading', 'gaming', 'cooking'] (changed!)
```

**Why Shallow Copy Shares References:**

```javascript
const obj = {
  primitive: 42,
  reference: { nested: 'value' }
};

const copy = { ...obj };

console.log(obj.reference === copy.reference); // true (same reference!)
console.log(obj.primitive === copy.primitive); // true (but this is safe because it's a primitive)
```

**Manual Deep Copy:**

```javascript
const original = {
  name: 'Charlie',
  scores: [85, 90, 78],
  details: {
    age: 25,
    address: {
      city: 'Seattle',
      zip: '98101'
    }
  }
};

// Manual deep copy (one level at a time)
const deepCopy = {
  ...original,
  scores: [...original.scores],
  details: {
    ...original.details,
    address: { ...original.details.address }
  }
};

// Now modifications are safe
deepCopy.scores.push(95);
deepCopy.details.address.city = 'Portland';

console.log(original.scores); // [85, 90, 78] (unchanged)
console.log(original.details.address.city); // 'Seattle' (unchanged)
console.log(deepCopy.scores); // [85, 90, 78, 95]
console.log(deepCopy.details.address.city); // 'Portland'
```

**Using `JSON` for Deep Copy:**

```javascript
const original = {
  name: 'Diana',
  age: 28,
  hobbies: ['painting', 'yoga'],
  address: {
    city: 'Austin',
    state: 'TX'
  }
};

// Quick deep copy using JSON (with limitations)
const deepCopy = JSON.parse(JSON.stringify(original));

deepCopy.address.city = 'Dallas';
deepCopy.hobbies.push('reading');

console.log(original.address.city); // 'Austin' (unchanged)
console.log(original.hobbies); // ['painting', 'yoga'] (unchanged)
console.log(deepCopy.address.city); // 'Dallas'
console.log(deepCopy.hobbies); // ['painting', 'yoga', 'reading']
```

**Limitations of JSON Deep Copy:**

```javascript
const complex = {
  date: new Date(),
  regex: /test/i,
  func: function() { return 'hello'; },
  undef: undefined,
  symbol: Symbol('sym'),
  nan: NaN,
  infinity: Infinity
};

const copied = JSON.parse(JSON.stringify(complex));

console.log(copied);
// {
//   date: '2024-01-15T10:30:00.000Z' (converted to string!)
//   regex: {} (converted to empty object!)
//   // func: missing (functions are not copied!)
//   // undef: missing (undefined is not copied!)
//   // symbol: missing (symbols are not copied!)
//   nan: null (NaN becomes null!)
//   infinity: null (Infinity becomes null!)
// }
```

**Best Practices:**

```javascript
// For simple objects with primitives only: use spread
const simpleObj = { a: 1, b: 2, c: 3 };
const copy1 = { ...simpleObj }; // ✓ Safe

// For objects with one level of nesting: manual deep spread
const oneLevel = { 
  x: 1, 
  nested: { y: 2 } 
};
const copy2 = { 
  ...oneLevel, 
  nested: { ...oneLevel.nested } 
}; // ✓ Safe

// For complex nested objects without special types: JSON method
const complex = {
  a: { b: { c: { d: 1 } } }
};
const copy3 = JSON.parse(JSON.stringify(complex)); // ✓ Works

// For objects with functions, dates, etc.: use a library
// lodash: _.cloneDeep(obj)
// structuredClone (modern browsers): structuredClone(obj)
```

**Modern Alternative - `structuredClone`:**

```javascript
const original = {
  date: new Date(),
  array: [1, 2, 3],
  nested: {
    deep: {
      value: 'test'
    }
  },
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3])
};

// Modern deep clone (Node.js 17+, modern browsers)
const deepCopy = structuredClone(original);

deepCopy.nested.deep.value = 'modified';
deepCopy.array.push(4);

console.log(original.nested.deep.value); // 'test' (unchanged)
console.log(original.array); // [1, 2, 3] (unchanged)
console.log(deepCopy.nested.deep.value); // 'modified'
console.log(deepCopy.array); // [1, 2, 3, 4]
```

---
