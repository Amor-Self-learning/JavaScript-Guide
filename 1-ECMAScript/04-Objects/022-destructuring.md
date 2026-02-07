# 4.4 Destructuring

Destructuring is a JavaScript expression that allows you to extract values from arrays or properties from objects into distinct variables. It provides a concise and readable way to unpack values.

### Object Destructuring

Object destructuring extracts properties from objects and assigns them to variables.

**Basic Syntax:**

```javascript
const person = {
  name: 'Alice',
  age: 30,
  city: 'New York'
};

// Traditional approach
const name = person.name;
const age = person.age;

// Destructuring approach
const { name, age, city } = person;

console.log(name); // 'Alice'
console.log(age);  // 30
console.log(city); // 'New York'
```

**Extracting Specific Properties:**

```javascript
const user = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'secret123',
  role: 'admin'
};

// Extract only what you need
const { username, email } = user;

console.log(username); // 'john_doe'
console.log(email);    // 'john@example.com'
// password and role are not extracted
```

### Nested Destructuring

Destructuring can be used with nested objects to extract deeply nested values.

**Single-Level Nesting:**

```javascript
const student = {
  name: 'Emma',
  grades: {
    math: 95,
    science: 88,
    english: 92
  }
};

// Destructure nested object
const { name, grades: { math, science } } = student;

console.log(name);    // 'Emma'
console.log(math);    // 95
console.log(science); // 88
// Note: 'grades' is not assigned as a variable
```

**Multi-Level Nesting:**

```javascript
const company = {
  name: 'Tech Corp',
  location: {
    country: 'USA',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      zip: '94102'
    }
  }
};

// Deep nested destructuring
const {
  location: {
    country,
    address: { city, zip }
  }
} = company;

console.log(country); // 'USA'
console.log(city);    // 'San Francisco'
console.log(zip);     // '94102'
```

**Complex Nested Structures:**

```javascript
const data = {
  user: {
    profile: {
      personal: {
        firstName: 'John',
        lastName: 'Smith'
      },
      contact: {
        email: 'john.smith@email.com',
        phone: '555-0123'
      }
    },
    settings: {
      theme: 'dark',
      notifications: true
    }
  }
};

// Extract deeply nested values
const {
  user: {
    profile: {
      personal: { firstName, lastName },
      contact: { email }
    },
    settings: { theme }
  }
} = data;

console.log(firstName); // 'John'
console.log(lastName);  // 'Smith'
console.log(email);     // 'john.smith@email.com'
console.log(theme);     // 'dark'
```

### Default Values

Default values can be assigned to variables in case the property doesn't exist in the object.

**Basic Default Values:**

```javascript
const config = {
  host: 'localhost',
  port: 3000
};

// Assign default values
const { host, port, protocol = 'http' } = config;

console.log(host);     // 'localhost'
console.log(port);     // 3000
console.log(protocol); // 'http' (default value used)
```

**Default Values with Nested Objects:**

```javascript
const options = {
  timeout: 5000
};

// Default values for nested properties
const {
  timeout,
  retry = {
    attempts: 3,
    delay: 1000
  }
} = options;

console.log(timeout);        // 5000
console.log(retry.attempts); // 3 (default object used)
console.log(retry.delay);    // 1000
```

**Handling `undefined` vs Missing Properties:**

```javascript
const obj = {
  a: undefined,
  b: null,
  c: 0,
  d: ''
};

const { a = 'default-a', b = 'default-b', c = 'default-c', d = 'default-d', e = 'default-e' } = obj;

console.log(a); // 'default-a' (undefined triggers default)
console.log(b); // null (null doesn't trigger default)
console.log(c); // 0 (0 doesn't trigger default)
console.log(d); // '' (empty string doesn't trigger default)
console.log(e); // 'default-e' (missing property triggers default)
```

### Rest in Destructuring

The rest operator (`...`) collects remaining properties into a new object.

**Basic Rest Pattern:**

```javascript
const person = {
  name: 'Bob',
  age: 25,
  city: 'Boston',
  country: 'USA',
  occupation: 'Engineer'
};

// Extract some properties, collect the rest
const { name, age, ...otherInfo } = person;

console.log(name);      // 'Bob'
console.log(age);       // 25
console.log(otherInfo); // { city: 'Boston', country: 'USA', occupation: 'Engineer' }
```

**Rest with Nested Destructuring:**

```javascript
const product = {
  id: 101,
  name: 'Laptop',
  specs: {
    cpu: 'Intel i7',
    ram: '16GB',
    storage: '512GB SSD',
    display: '15.6 inch',
    weight: '1.8kg'
  },
  price: 1299
};

// Combine nested destructuring with rest
const {
  id,
  specs: { cpu, ram, ...otherSpecs },
  ...productRest
} = product;

console.log(id);         // 101
console.log(cpu);        // 'Intel i7'
console.log(ram);        // '16GB'
console.log(otherSpecs); // { storage: '512GB SSD', display: '15.6 inch', weight: '1.8kg' }
console.log(productRest);// { name: 'Laptop', price: 1299 }
```

**Practical Use Cases:**

```javascript
// Extracting API response data
function processUserData(userData) {
  const { id, username, ...settings } = userData;
  
  console.log(`User ${username} (ID: ${id})`);
  console.log('Settings:', settings);
}

processUserData({
  id: 42,
  username: 'alice',
  theme: 'dark',
  language: 'en',
  notifications: true
});
// User alice (ID: 42)
// Settings: { theme: 'dark', language: 'en', notifications: true }

// Removing sensitive data
function sanitizeUser(user) {
  const { password, ssn, creditCard, ...safeData } = user;
  return safeData;
}

const rawUser = {
  name: 'John',
  email: 'john@example.com',
  password: 'secret123',
  ssn: '123-45-6789',
  age: 30
};

console.log(sanitizeUser(rawUser));
// { name: 'John', email: 'john@example.com', age: 30 }
```

### Renaming During Destructuring

You can assign properties to variables with different names using the colon (`:`) syntax.

**Basic Renaming:**

```javascript
const user = {
  name: 'Alice',
  age: 28,
  email: 'alice@example.com'
};

// Rename variables during destructuring
const { name: userName, age: userAge, email: userEmail } = user;

console.log(userName);  // 'Alice'
console.log(userAge);   // 28
console.log(userEmail); // 'alice@example.com'
// Note: 'name', 'age', 'email' are NOT defined
```

**Renaming with Default Values:**

```javascript
const settings = {
  theme: 'light',
  language: 'en'
};

// Combine renaming and default values
const {
  theme: selectedTheme = 'dark',
  language: lang = 'en',
  fontSize: size = 14
} = settings;

console.log(selectedTheme); // 'light'
console.log(lang);          // 'en'
console.log(size);          // 14 (default used)
```

**Renaming in Nested Destructuring:**

```javascript
const response = {
  status: 200,
  data: {
    user: {
      id: 1,
      info: {
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  }
};

// Rename nested properties
const {
  status: httpStatus,
  data: {
    user: {
      id: userId,
      info: { firstName: first, lastName: last }
    }
  }
} = response;

console.log(httpStatus); // 200
console.log(userId);     // 1
console.log(first);      // 'John'
console.log(last);       // 'Doe'
```

**Practical Example - Avoiding Naming Conflicts:**

```javascript
// When fetching data from multiple sources
const localUser = { name: 'LocalUser', id: 1 };
const remoteUser = { name: 'RemoteUser', id: 2 };

const { name: localName, id: localId } = localUser;
const { name: remoteName, id: remoteId } = remoteUser;

console.log(localName, localId);   // 'LocalUser' 1
console.log(remoteName, remoteId); // 'RemoteUser' 2
```

**Function Parameters with Destructuring:**

```javascript
// Rename and provide defaults in function parameters
function createUser({ 
  name: userName, 
  email: userEmail, 
  role: userRole = 'guest' 
}) {
  return {
    userName,
    userEmail,
    userRole,
    createdAt: new Date()
  };
}

const newUser = createUser({ 
  name: 'Bob', 
  email: 'bob@example.com' 
});

console.log(newUser);
// {
//   userName: 'Bob',
//   userEmail: 'bob@example.com',
//   userRole: 'guest',
//   createdAt: [current date]
// }
```

---
