## 6.2 Class Features

### Static Methods

```javascript
class MathUtils {
  static add(a, b) {
    return a + b;
  }
  
  static factorial(n) {
    if (n <= 1) return 1;
    return n * MathUtils.factorial(n - 1);
  }
}

console.log(MathUtils.add(5, 3)); // 8
console.log(MathUtils.factorial(5)); // 120
```

**Static Factory Methods:**

```javascript
class User {
  constructor(name, email, role) {
    this.name = name;
    this.email = email;
    this.role = role;
  }
  
  static createAdmin(name, email) {
    return new User(name, email, 'admin');
  }
  
  static createGuest() {
    return new User('Guest', 'guest@example.com', 'guest');
  }
  
  static fromJSON(json) {
    const data = JSON.parse(json);
    return new User(data.name, data.email, data.role);
  }
}

const admin = User.createAdmin('Alice', 'alice@example.com');
const guest = User.createGuest();
```

### Static Properties

```javascript
class DatabaseConnection {
  static activeConnections = 0;
  static maxConnections = 10;
  static connections = [];
  
  constructor(database) {
    if (DatabaseConnection.activeConnections >= DatabaseConnection.maxConnections) {
      throw new Error('Maximum connections reached');
    }
    
    this.database = database;
    DatabaseConnection.activeConnections++;
    DatabaseConnection.connections.push(this);
  }
  
  disconnect() {
    DatabaseConnection.activeConnections--;
    const index = DatabaseConnection.connections.indexOf(this);
    if (index > -1) {
      DatabaseConnection.connections.splice(index, 1);
    }
  }
  
  static getStats() {
    return {
      active: this.activeConnections,
      max: this.maxConnections
    };
  }
}
```

### Instance Properties

```javascript
class Rectangle {
  width = 0;
  height = 0;
  color = 'black';
  
  constructor(width, height, color) {
    this.width = width;
    this.height = height;
    if (color) this.color = color;
  }
}
```

### Private Fields

```javascript
class BankAccount {
  #balance = 0;
  #pin;
  
  constructor(initialBalance, pin) {
    this.#balance = initialBalance;
    this.#pin = pin;
  }
  
  getBalance(pin) {
    if (pin !== this.#pin) {
      throw new Error('Invalid PIN');
    }
    return this.#balance;
  }
  
  deposit(amount, pin) {
    if (pin !== this.#pin) {
      throw new Error('Invalid PIN');
    }
    this.#balance += amount;
  }
  
  withdraw(amount, pin) {
    if (pin !== this.#pin) {
      throw new Error('Invalid PIN');
    }
    if (amount > this.#balance) {
      throw new Error('Insufficient funds');
    }
    this.#balance -= amount;
  }
}

const account = new BankAccount(1000, '1234');
console.log(account.getBalance('1234')); // 1000
// console.log(account.#balance); // SyntaxError
```

### Private Methods

```javascript
class PasswordManager {
  #passwords = new Map();
  #masterKey;
  
  constructor(masterPassword) {
    this.#masterKey = this.#deriveKey(masterPassword);
  }
  
  #deriveKey(password) {
    // Simplified key derivation
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
    }
    return Math.abs(hash).toString(16);
  }
  
  #encrypt(text) {
    // Simplified encryption
    return text.split('').reverse().join('') + '_encrypted';
  }
  
  #decrypt(encrypted) {
    return encrypted.replace('_encrypted', '').split('').reverse().join('');
  }
  
  addPassword(service, password) {
    const encrypted = this.#encrypt(password);
    this.#passwords.set(service, encrypted);
  }
  
  getPassword(service) {
    const encrypted = this.#passwords.get(service);
    if (!encrypted) throw new Error('Password not found');
    return this.#decrypt(encrypted);
  }
}
```

### Public Fields

```javascript
class Car {
  make = '';
  model = '';
  year = 0;
  features = [];
  
  constructor(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
  }
  
  addFeature(feature) {
    this.features.push(feature);
  }
}
```

### Static Blocks

```javascript
class Config {
  static apiUrl;
  static environment;
  
  static {
    const env = 'production';
    
    if (env === 'production') {
      this.apiUrl = 'https://api.production.com';
      this.environment = 'production';
    } else {
      this.apiUrl = 'https://api.dev.com';
      this.environment = 'development';
    }
  }
}

console.log(Config.apiUrl);
```

---

