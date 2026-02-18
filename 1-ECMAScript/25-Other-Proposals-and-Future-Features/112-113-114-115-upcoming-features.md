# Future Features & Proposals

## Table of Contents

- [25.1 Pattern Matching (Stage 1)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#251-pattern-matching-stage-1)
    - [Match Expression](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#match-expression)
    - [Pattern Syntax](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#pattern-syntax)
- [25.2 Records and Tuples (Stage 2)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#252-records-and-tuples-stage-2)
    - [Immutable Data Structures](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#immutable-data-structures)
    - [Deep Equality](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#deep-equality)
- [25.3 Pipeline Operator (Stage 2)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#253-pipeline-operator-stage-2)
    - [Function Chaining with `|>`](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#function-chaining-with-)
- [25.4 Throw Expressions (Stage 2)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#254-throw-expressions-stage-2)
    - [`throw` as Expression](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#throw-as-expression)

---

**Note:** These are proposals in various stages of the TC39 process. Syntax and behavior may change before final standardization. Use Babel or TypeScript to experiment with these features.

**TC39 Process Stages:**

- **Stage 0**: Strawperson - Initial idea
- **Stage 1**: Proposal - Formal proposal with champion
- **Stage 2**: Draft - Precise syntax, semantics
- **Stage 3**: Candidate - Spec complete, needs implementation feedback
- **Stage 4**: Finished - Ready for inclusion in standard

---

## 25.1 Pattern Matching (Stage 1)

Pattern matching provides a more expressive way to handle conditional logic and destructuring.

### Match Expression

The `match` expression matches a value against patterns and executes corresponding code.

#### Basic Match Syntax

```javascript
// Proposed syntax (not yet available)
const result = match (value) {
  when (pattern) -> expression
  when (pattern) -> expression
  default -> expression
}

// Example: Simple value matching
const result = match (statusCode) {
  when (200) -> 'Success'
  when (404) -> 'Not Found'
  when (500) -> 'Server Error'
  default -> 'Unknown Status'
};

// Example: Multiple patterns
const message = match (code) {
  when (200 | 201 | 204) -> 'Success'
  when (400 | 401 | 403) -> 'Client Error'
  when (500 | 502 | 503) -> 'Server Error'
  default -> 'Unknown'
};

// Current JavaScript equivalent
let result;
switch (statusCode) {
  case 200:
    result = 'Success';
    break;
  case 404:
    result = 'Not Found';
    break;
  case 500:
    result = 'Server Error';
    break;
  default:
    result = 'Unknown Status';
}

// Or with object lookup
const statusMessages = {
  200: 'Success',
  404: 'Not Found',
  500: 'Server Error'
};
const result = statusMessages[statusCode] || 'Unknown Status';
```

#### Destructuring Patterns

```javascript
// Match with destructuring
const describe = match (shape) {
  when ({ type: 'circle', radius }) -> `Circle with radius ${radius}`
  when ({ type: 'rectangle', width, height }) -> `Rectangle ${width}x${height}`
  when ({ type: 'square', side }) -> `Square ${side}x${side}`
  default -> 'Unknown shape'
};

// Example usage
describe({ type: 'circle', radius: 5 });
// "Circle with radius 5"

describe({ type: 'rectangle', width: 10, height: 20 });
// "Rectangle 10x20"

// Current equivalent
function describe(shape) {
  if (shape.type === 'circle') {
    return `Circle with radius ${shape.radius}`;
  } else if (shape.type === 'rectangle') {
    return `Rectangle ${shape.width}x${shape.height}`;
  } else if (shape.type === 'square') {
    return `Square ${shape.side}x${shape.side}`;
  }
  return 'Unknown shape';
}
```

#### Array Pattern Matching

```javascript
// Match array patterns
const process = match (arr) {
  when ([]) -> 'Empty array'
  when ([x]) -> `Single element: ${x}`
  when ([x, y]) -> `Two elements: ${x}, ${y}`
  when ([first, ...rest]) -> `First: ${first}, Rest: ${rest.length} items`
  default -> 'Array'
};

// Example
process([]);           // "Empty array"
process([1]);          // "Single element: 1"
process([1, 2]);       // "Two elements: 1, 2"
process([1, 2, 3, 4]); // "First: 1, Rest: 3 items"

// Current equivalent
function process(arr) {
  if (arr.length === 0) {
    return 'Empty array';
  } else if (arr.length === 1) {
    return `Single element: ${arr[0]}`;
  } else if (arr.length === 2) {
    return `Two elements: ${arr[0]}, ${arr[1]}`;
  } else {
    const [first, ...rest] = arr;
    return `First: ${first}, Rest: ${rest.length} items`;
  }
  return 'Array';
}
```

#### Guards (Conditional Patterns)

```javascript
// Match with guards (when clauses)
const categorize = match (num) {
  when (n) if (n < 0) -> 'Negative'
  when (n) if (n === 0) -> 'Zero'
  when (n) if (n > 0 && n < 10) -> 'Single digit'
  when (n) if (n >= 10 && n < 100) -> 'Double digit'
  default -> 'Large number'
};

// Example
categorize(-5);  // "Negative"
categorize(0);   // "Zero"
categorize(7);   // "Single digit"
categorize(42);  // "Double digit"
categorize(999); // "Large number"

// Current equivalent
function categorize(num) {
  if (num < 0) return 'Negative';
  if (num === 0) return 'Zero';
  if (num > 0 && num < 10) return 'Single digit';
  if (num >= 10 && num < 100) return 'Double digit';
  return 'Large number';
}
```

### Pattern Syntax

Different types of patterns available in match expressions.

#### Literal Patterns

```javascript
// Exact value matching
const result = match (value) {
  when (42) -> 'The answer'
  when ('hello') -> 'Greeting'
  when (true) -> 'Boolean true'
  when (null) -> 'Null value'
  when (undefined) -> 'Undefined value'
  default -> 'Something else'
};
```

#### Type Patterns

```javascript
// Match by type
const describe = match (value) {
  when (Number) -> `Number: ${value}`
  when (String) -> `String: ${value}`
  when (Boolean) -> `Boolean: ${value}`
  when (Array) -> `Array with ${value.length} items`
  when (Object) -> 'Object'
  default -> 'Unknown type'
};

// Example
describe(42);           // "Number: 42"
describe('hello');      // "String: hello"
describe([1, 2, 3]);    // "Array with 3 items"

// Current equivalent using typeof/instanceof
function describe(value) {
  if (typeof value === 'number') return `Number: ${value}`;
  if (typeof value === 'string') return `String: ${value}`;
  if (typeof value === 'boolean') return `Boolean: ${value}`;
  if (Array.isArray(value)) return `Array with ${value.length} items`;
  if (typeof value === 'object') return 'Object';
  return 'Unknown type';
}
```

#### Object Patterns

```javascript
// Nested object matching
const processUser = match (user) {
  when ({ role: 'admin', verified: true }) -> 
    'Full admin access'
  
  when ({ role: 'admin', verified: false }) -> 
    'Admin access pending verification'
  
  when ({ role: 'user', premium: true }) -> 
    'Premium user'
  
  when ({ role: 'user' }) -> 
    'Standard user'
  
  default -> 
    'Guest'
};

// Nested destructuring
const getAddress = match (person) {
  when ({ address: { city, country } }) -> 
    `${city}, ${country}`
  
  when ({ address: { city } }) -> 
    city
  
  default -> 
    'No address'
};
```

#### Range Patterns

```javascript
// Range matching (proposed syntax)
const classify = match (age) {
  when (0..12) -> 'Child'
  when (13..19) -> 'Teenager'
  when (20..64) -> 'Adult'
  when (65..) -> 'Senior'
  default -> 'Invalid age'
};

// Current equivalent
function classify(age) {
  if (age >= 0 && age <= 12) return 'Child';
  if (age >= 13 && age <= 19) return 'Teenager';
  if (age >= 20 && age <= 64) return 'Adult';
  if (age >= 65) return 'Senior';
  return 'Invalid age';
}
```

#### Real-World Examples

```javascript
// Example 1: HTTP Response Handler
const handleResponse = match (response) {
  when ({ status: 200, data }) -> 
    ({ success: true, data })
  
  when ({ status: 201, data }) -> 
    ({ success: true, created: true, data })
  
  when ({ status: 400, error }) -> 
    ({ success: false, error: 'Bad Request', message: error })
  
  when ({ status: 401 }) -> 
    ({ success: false, error: 'Unauthorized', redirect: '/login' })
  
  when ({ status: 404 }) -> 
    ({ success: false, error: 'Not Found' })
  
  when ({ status: code }) if (code >= 500) -> 
    ({ success: false, error: 'Server Error', retry: true })
  
  default -> 
    ({ success: false, error: 'Unknown Error' })
};

// Example 2: Redux Reducer
const reducer = (state, action) => match (action) {
  when ({ type: 'INCREMENT' }) -> 
    ({ ...state, count: state.count + 1 })
  
  when ({ type: 'DECREMENT' }) -> 
    ({ ...state, count: state.count - 1 })
  
  when ({ type: 'SET_VALUE', payload }) -> 
    ({ ...state, count: payload })
  
  when ({ type: 'RESET' }) -> 
    ({ count: 0 })
  
  default -> 
    state
};

// Example 3: Command Parser
const parseCommand = match (input) {
  when ({ command: 'add', args: [x, y] }) -> 
    x + y
  
  when ({ command: 'subtract', args: [x, y] }) -> 
    x - y
  
  when ({ command: 'multiply', args: [x, y] }) -> 
    x * y
  
  when ({ command: 'divide', args: [x, y] }) if (y !== 0) -> 
    x / y
  
  when ({ command: 'divide', args: [x, 0] }) -> 
    throw new Error('Division by zero')
  
  default -> 
    throw new Error('Unknown command')
};
```

---

## 25.2 Records and Tuples (Stage 2)

Records and Tuples are deeply immutable data structures with value semantics.

### Immutable Data Structures

Records are immutable objects; Tuples are immutable arrays.

#### Record Syntax

```javascript
// Record syntax (proposed)
const person = #{
  name: 'Alice',
  age: 30,
  address: #{
    city: 'New York',
    country: 'USA'
  }
};

// Records are deeply immutable
person.age = 31; // TypeError: Cannot assign to read only property

// Create new record with changes
const older = #{ ...person, age: 31 };

console.log(person.age); // 30
console.log(older.age);  // 31

// Records can only contain primitives, other records, and tuples
const valid = #{
  number: 42,
  string: 'hello',
  boolean: true,
  record: #{ nested: 'value' },
  tuple: #[1, 2, 3]
};

// Invalid - cannot contain objects/arrays
const invalid = #{
  object: { mutable: 'data' },     // Error
  array: [1, 2, 3],                // Error
  function: () => {}               // Error
};
```

#### Tuple Syntax

```javascript
// Tuple syntax (proposed)
const coordinates = #[40.7128, -74.0060];

// Tuples are immutable
coordinates[0] = 40.7589; // TypeError: Cannot assign to read only property
coordinates.push(100);    // TypeError: coordinates.push is not a function

// Create new tuple with changes
const newCoordinates = #[40.7589, ...coordinates.slice(1)];

console.log(coordinates);    // #[40.7128, -74.0060]
console.log(newCoordinates); // #[40.7589, -74.0060]

// Tuples can only contain primitives, records, and tuples
const validTuple = #[
  1,
  'string',
  true,
  #{ key: 'value' },
  #[1, 2, 3]
];

// Invalid - cannot contain mutable objects
const invalidTuple = #[
  { mutable: 'object' },  // Error
  [1, 2, 3],             // Error
  new Date()             // Error
];
```

#### Working with Records and Tuples

```javascript
// Accessing properties (same as objects/arrays)
const person = #{
  name: 'Alice',
  age: 30,
  hobbies: #['reading', 'coding']
};

console.log(person.name);        // "Alice"
console.log(person.hobbies[0]);  // "reading"

// Spread syntax
const updated = #{
  ...person,
  age: 31,
  city: 'Boston'
};

// Nested updates (need to spread each level)
const withNewHobby = #{
  ...person,
  hobbies: #[...person.hobbies, 'gaming']
};

// Destructuring works
const { name, age } = person;
const [first, second] = person.hobbies;

// Object methods work
console.log(Object.keys(person));     // ['name', 'age', 'hobbies']
console.log(Object.values(person));   // ['Alice', 30, #['reading', 'coding']]

// Array methods work
const doubled = person.hobbies.map(h => h.toUpperCase());
// Returns regular array, not tuple
```

#### Updating Records and Tuples

```javascript
// Shallow update
const person = #{ name: 'Alice', age: 30 };
const updated = #{ ...person, age: 31 };

// Deep update helper
function updateRecord(record, path, value) {
  if (path.length === 0) return value;
  
  const [head, ...tail] = path;
  return #{
    ...record,
    [head]: updateRecord(record[head], tail, value)
  };
}

const nested = #{
  user: #{
    profile: #{
      name: 'Alice',
      age: 30
    }
  }
};

const updated = updateRecord(nested, ['user', 'profile', 'age'], 31);
// #{
//   user: #{
//     profile: #{
//       name: 'Alice',
//       age: 31
//     }
//   }
// }

// Tuple updates
const tuple = #[1, 2, 3, 4, 5];

const withoutFirst = #[...tuple.slice(1)];     // #[2, 3, 4, 5]
const withoutLast = #[...tuple.slice(0, -1)];  // #[1, 2, 3, 4]
const updated = #[
  ...tuple.slice(0, 2),
  99,
  ...tuple.slice(3)
];  // #[1, 2, 99, 4, 5]
```

### Deep Equality

Records and Tuples use value equality instead of reference equality.

#### Equality Comparison

```javascript
// Objects use reference equality
const obj1 = { x: 1, y: 2 };
const obj2 = { x: 1, y: 2 };
console.log(obj1 === obj2);  // false (different references)

// Records use value equality
const rec1 = #{ x: 1, y: 2 };
const rec2 = #{ x: 1, y: 2 };
console.log(rec1 === rec2);  // true (same values)

// Deep equality
const deep1 = #{
  a: 1,
  b: #{
    c: 2,
    d: #[3, 4]
  }
};

const deep2 = #{
  a: 1,
  b: #{
    c: 2,
    d: #[3, 4]
  }
};

console.log(deep1 === deep2);  // true

// Works in Sets and Maps
const set = new Set();
set.add(#{ x: 1 });
set.add(#{ x: 1 });  // Same value, not added twice
console.log(set.size);  // 1

const map = new Map();
const key1 = #{ id: 1 };
const key2 = #{ id: 1 };

map.set(key1, 'value1');
console.log(map.get(key2));  // "value1" (same key!)
```

#### Use Cases

```javascript
// 1. React state (automatic memoization)
function Counter() {
  const [state, setState] = useState(#{
    count: 0,
    history: #[]
  });
  
  const increment = () => {
    setState(#{
      count: state.count + 1,
      history: #[...state.history, state.count]
    });
  };
  
  // Record equality enables automatic optimization
  return <div>{state.count}</div>;
}

// 2. Redux state (immutability by default)
const initialState = #{
  users: #[],
  posts: #[],
  ui: #{
    loading: false,
    error: null
  }
};

function reducer(state = initialState, action) {
  match (action) {
    when ({ type: 'ADD_USER', payload }) ->
      #{ ...state, users: #[...state.users, payload] }
    
    when ({ type: 'SET_LOADING', payload }) ->
      #{ ...state, ui: #{ ...state.ui, loading: payload } }
    
    default ->
      state
  }
}

// 3. Configuration objects
const config = #{
  api: #{
    baseURL: 'https://api.example.com',
    timeout: 5000,
    headers: #{
      'Content-Type': 'application/json'
    }
  },
  features: #{
    darkMode: true,
    analytics: false
  }
};

// Config is guaranteed immutable
// Can safely share across modules

// 4. Caching with complex keys
const cache = new Map();

function expensiveOperation(params) {
  const key = #{ ...params };  // Record as cache key
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = compute(params);
  cache.set(key, result);
  return result;
}

// Same parameters always hit cache
expensiveOperation({ x: 1, y: 2 });
expensiveOperation({ x: 1, y: 2 });  // Cache hit!
```

#### Conversion Between Objects and Records

```javascript
// Convert object to record (proposed)
const obj = { x: 1, y: 2 };
const rec = Record(obj);  // #{ x: 1, y: 2 }

// Convert record to object
const record = #{ x: 1, y: 2 };
const object = Object(record);  // { x: 1, y: 2 }

// Deep conversion
function toRecord(value) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  
  if (Array.isArray(value)) {
    return Tuple(...value.map(toRecord));
  }
  
  const entries = Object.entries(value).map(([k, v]) => [k, toRecord(v)]);
  return Record(Object.fromEntries(entries));
}

const nested = {
  a: 1,
  b: {
    c: 2,
    d: [3, 4]
  }
};

const nestedRecord = toRecord(nested);
// #{ a: 1, b: #{ c: 2, d: #[3, 4] } }
```

---

## 25.3 Pipeline Operator (Stage 2)

The pipeline operator `|>` enables cleaner function chaining.

### Function Chaining with `|>`

Pipeline operator passes the result of one expression as an argument to the next.

#### Basic Pipeline

```javascript
// Proposed syntax
const result = value
  |> function1
  |> function2
  |> function3;

// Equivalent to
const result = function3(function2(function1(value)));

// Example: String processing
const processText = text
  |> trim
  |> toLowerCase
  |> removeSpecialChars
  |> capitalize;

// Current equivalent
const processText = capitalize(
  removeSpecialChars(
    toLowerCase(
      trim(text)
    )
  )
);

// Or with intermediate variables
const trimmed = trim(text);
const lower = toLowerCase(trimmed);
const cleaned = removeSpecialChars(lower);
const final = capitalize(cleaned);
```

#### Arrow Functions in Pipeline

```javascript
// With arrow functions
const result = value
  |> (x => x * 2)
  |> (x => x + 10)
  |> (x => Math.sqrt(x));

// Example: Data transformation
const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 }
];

const result = users
  |> (arr => arr.filter(u => u.age > 25))
  |> (arr => arr.map(u => u.name))
  |> (arr => arr.join(', '));

// "Alice, Charlie"

// Current equivalent
const result = users
  .filter(u => u.age > 25)
  .map(u => u.name)
  .join(', ');
```

#### Partial Application with Pipeline

```javascript
// Hack pipe (F#-style) - requires partial application
const add = x => y => x + y;
const multiply = x => y => x * y;

const result = 5
  |> add(10)
  |> multiply(2)
  |> Math.sqrt;

// Result: Math.sqrt(multiply(2)(add(10)(5)))
// 5 + 10 = 15
// 15 * 2 = 30
// sqrt(30) ≈ 5.48

// Smart pipe (Babel proposal) - auto-wraps in arrow
const result = 5
  |> add(10, %)      // % is placeholder
  |> multiply(2, %)
  |> Math.sqrt(%);

// Example: HTTP request pipeline
const data = '/api/users'
  |> fetch(%)
  |> await %
  |> %.json()
  |> await %
  |> %.filter(u => u.active)
  |> %.map(u => u.name);

// Current equivalent
const response = await fetch('/api/users');
const json = await response.json();
const active = json.filter(u => u.active);
const data = active.map(u => u.name);
```

#### Real-World Examples

```javascript
// Example 1: Text processing
function processArticle(text) {
  return text
    |> removeHtml
    |> normalizeWhitespace
    |> splitIntoParagraphs
    |> (paragraphs => paragraphs.filter(p => p.length > 0))
    |> (paragraphs => paragraphs.map(extractSummary))
    |> (summaries => summaries.join('\n\n'));
}

// Example 2: Validation pipeline
const validateUser = input
  |> sanitizeInput
  |> checkRequired(['name', 'email', 'age'])
  |> validateEmail('email')
  |> validateRange('age', 0, 150)
  |> (result => result.errors.length === 0 ? { valid: true, data: result.data } : { valid: false, errors: result.errors });

// Example 3: Data aggregation
const report = rawData
  |> parseCSV
  |> filterInvalidRows
  |> groupByCategory
  |> calculateTotals
  |> sortByValue
  |> formatAsTable
  |> addHeaders
  |> generatePDF;

// Example 4: Math calculations
const calculatePrice = basePrice
  |> applyDiscount(0.1)
  |> addTax(0.2)
  |> roundToCents
  |> formatCurrency('USD');

// Example 5: Async pipeline
async function fetchUserData(userId) {
  return userId
    |> fetchUser
    |> await %
    |> (user => user.id)
    |> fetchPosts
    |> await %
    |> (posts => posts.filter(p => p.published))
    |> (posts => posts.map(extractSummary))
    |> await Promise.all(%)
    |> (summaries => ({ userId, summaries }));
}
```

#### Pipeline with Side Effects

```javascript
// Tap function for side effects
const tap = fn => value => {
  fn(value);
  return value;
};

const result = data
  |> processData
  |> tap(console.log)  // Log intermediate result
  |> validateData
  |> tap(saveToDatabase)  // Save to DB
  |> formatResponse;

// Example: Debugging pipeline
const debugPipeline = value
  |> tap(x => console.log('Input:', x))
  |> transform1
  |> tap(x => console.log('After transform1:', x))
  |> transform2
  |> tap(x => console.log('After transform2:', x))
  |> transform3
  |> tap(x => console.log('Final:', x));
```

---

## 25.4 Throw Expressions (Stage 2)

Throw expressions allow `throw` to be used in expression contexts.

### `throw` as Expression

Currently, `throw` is a statement. The proposal makes it an expression.

#### Conditional Expressions

```javascript
// Currently (throws as statement)
function getUser(id) {
  if (!id) {
    throw new Error('ID is required');
  }
  return db.users.find(id);
}

// With throw expressions (proposed)
const getUser = (id) => 
  id ? db.users.find(id) : throw new Error('ID is required');

// Ternary operator
const value = condition 
  ? computeValue() 
  : throw new Error('Invalid condition');

// Example: Parameter validation
const processData = (data) =>
  data 
    ? transformData(data) 
    : throw new TypeError('Data is required');
```

#### Default Parameters

```javascript
// Currently
function createUser(name, email) {
  if (!email) {
    throw new Error('Email is required');
  }
  return { name, email };
}

// With throw expressions (proposed)
function createUser(
  name,
  email = throw new Error('Email is required')
) {
  return { name, email };
}

// Arrow function with defaults
const divide = (
  a,
  b = throw new Error('Divisor cannot be undefined')
) => b !== 0 
  ? a / b 
  : throw new Error('Division by zero');
```

#### Nullish Coalescing

```javascript
// Currently
function getConfig(config) {
  const value = config?.apiKey;
  if (!value) {
    throw new Error('API key not configured');
  }
  return value;
}

// With throw expressions (proposed)
const getConfig = (config) =>
  config?.apiKey ?? throw new Error('API key not configured');

// Example: Environment variables
const API_KEY = process.env.API_KEY 
  ?? throw new Error('API_KEY environment variable required');

const PORT = Number(process.env.PORT) 
  || throw new Error('Invalid PORT');
```

#### Logical Operators

```javascript
// With AND operator
const value = condition && computeValue() 
  || throw new Error('Computation failed');

// Example: Object property access
const userName = user?.profile?.name 
  ?? throw new Error('User name not found');

// Example: Array access
const firstItem = array[0] 
  ?? throw new Error('Array is empty');
```

#### Arrow Functions

```javascript
// Concise validation
const validate = (input) =>
  input.length > 0 
    ? input 
    : throw new ValidationError('Input cannot be empty');

// Multiple conditions
const processAge = (age) =>
  age < 0 ? throw new RangeError('Age cannot be negative') :
  age > 150 ? throw new RangeError('Age too large') :
  age;

// Example: Factory function
const createLogger = (level) =>
  level === 'debug' ? new DebugLogger() :
  level === 'info' ? new InfoLogger() :
  level === 'error' ? new ErrorLogger() :
  throw new Error(`Unknown log level: ${level}`);
```

#### Pipeline Operator Integration

```javascript
// Throw in pipeline (with throw expressions)
const result = input
  |> validate
  |> (x => x || throw new Error('Validation failed'))
  |> transform
  |> (x => x.length > 0 ? x : throw new Error('Empty result'))
  |> format;

// Example: API request pipeline
const data = userId
  |> (id => id || throw new Error('User ID required'))
  |> fetchUser
  |> await %
  |> (user => user || throw new Error('User not found'))
  |> (user => user.active || throw new Error('User is inactive'))
  |> formatUserData;
```

#### Pattern Matching Integration

```javascript
// Throw in match expressions
const processValue = match (value) {
  when (x) if (x < 0) -> throw new RangeError('Negative value')
  when (x) if (x === 0) -> 0
  when (x) if (x > 0) -> Math.sqrt(x)
  default -> throw new TypeError('Invalid value')
};

// Example: HTTP status handling
const handleStatus = match (response.status) {
  when (200) -> response.data
  when (404) -> throw new NotFoundError('Resource not found')
  when (500) -> throw new ServerError('Server error')
  when (code) if (code >= 400 && code < 500) -> 
    throw new ClientError(`Client error: ${code}`)
  default -> 
    throw new Error(`Unexpected status: ${response.status}`)
};
```

#### Real-World Examples

```javascript
// Example 1: Configuration validation
class Config {
  constructor(options) {
    this.apiUrl = options?.apiUrl 
      ?? throw new Error('API URL required');
    
    this.timeout = options?.timeout 
      ?? 5000;
    
    this.retries = options?.retries >= 0 
      ? options.retries 
      : throw new RangeError('Retries must be non-negative');
  }
}

// Example 2: Database query
const findUser = (id) =>
  id 
    ? db.users.findById(id) 
      ?? throw new NotFoundError(`User ${id} not found`)
    : throw new ValidationError('User ID required');

// Example 3: Form validation
const validateForm = (form) => ({
  name: form.name?.trim() 
    || throw new ValidationError('Name is required'),
  
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) 
    ? form.email 
    : throw new ValidationError('Invalid email'),
  
  age: form.age >= 18 
    ? form.age 
    : throw new ValidationError('Must be 18 or older')
});

// Example 4: Safe division
const safeDivide = (a, b) =>
  b !== 0 
    ? a / b 
    : throw new Error('Division by zero');

// Example 5: Object destructuring with validation
function processUser({ 
  id = throw new Error('ID required'),
  name = throw new Error('Name required'),
  email = throw new Error('Email required'),
  role = 'user'
}) {
  return { id, name, email, role };
}

// Example 6: Array operations
const firstOrThrow = (array) =>
  array.length > 0 
    ? array[0] 
    : throw new Error('Array is empty');

const lastOrThrow = (array) =>
  array.length > 0 
    ? array[array.length - 1] 
    : throw new Error('Array is empty');
```

---

## Summary

This document covered future JavaScript proposals:

**Pattern Matching (Stage 1):**

- Match expressions for conditional logic
- Destructuring patterns for objects and arrays
- Guards for conditional patterns
- Type patterns and range patterns
- Real-world examples (HTTP responses, Redux reducers, command parsers)

**Records and Tuples (Stage 2):**

- Immutable data structures with `#{}` and `#[]` syntax
- Deep immutability guarantees
- Value equality semantics
- Use cases (React state, Redux, configuration, caching)
- Conversion between objects/arrays and records/tuples

**Pipeline Operator (Stage 2):**

- Function chaining with `|>`
- Cleaner alternative to nested function calls
- Integration with async/await
- Side effects in pipelines
- Real-world examples (text processing, validation, data aggregation)

**Throw Expressions (Stage 2):**

- `throw` in expression contexts
- Use with ternary operators, default parameters, nullish coalescing
- Integration with arrow functions and pipelines
- Concise error handling patterns

These proposals aim to make JavaScript more expressive and maintainable.

---

**Tracking Proposals:**

- TC39 GitHub: https://github.com/tc39/proposals
- Stage Process: https://tc39.es/process-document/

**Experimenting:**

- Babel: Configure plugins for proposals
- TypeScript: Some proposals available in experimental mode
- Follow proposal repositories for updates

**Note:** Syntax and semantics may change as proposals evolve through the TC39 process.