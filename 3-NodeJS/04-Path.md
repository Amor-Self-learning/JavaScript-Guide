# Module 4: Path

The `path` module provides utilities for working with file and directory paths. It handles platform-specific differences between Windows and POSIX systems.

---

## 4.1 Module Import

```javascript
// CommonJS
const path = require('path');

// ES Modules
import path from 'path';
import { join, resolve, basename } from 'path';
```

---

## 4.2 Path Joining and Resolving

### path.join()

Joins path segments using the platform-specific separator:

```javascript
// Basic joining
path.join('folder', 'subfolder', 'file.txt');
// POSIX: 'folder/subfolder/file.txt'
// Windows: 'folder\\subfolder\\file.txt'

// Handles .. and . correctly
path.join('folder', '..', 'other', 'file.txt');
// 'other/file.txt'

path.join('folder', '.', 'file.txt');
// 'folder/file.txt'

// Ignores empty strings
path.join('folder', '', 'file.txt');
// 'folder/file.txt'

// Common pattern with __dirname
const configPath = path.join(__dirname, 'config', 'settings.json');
const dataPath = path.join(__dirname, '..', 'data', 'users.json');
```

### path.resolve()

Resolves a sequence of paths to an absolute path:

```javascript
// Returns absolute path
path.resolve('folder', 'file.txt');
// '/current/working/directory/folder/file.txt'

// Absolute path resets resolution
path.resolve('/tmp', 'file.txt');
// '/tmp/file.txt'

path.resolve('/root', '/home', 'file.txt');
// '/home/file.txt' (last absolute wins)

// Common patterns
const projectRoot = path.resolve(__dirname, '..');
const configFile = path.resolve(__dirname, 'config.json');

// Get absolute path from relative
const absolute = path.resolve('./relative/path');
```

### join vs resolve

```javascript
// join: concatenates paths
path.join('/a', '/b', 'c');
// '/a/b/c'

// resolve: treats each as potential absolute
path.resolve('/a', '/b', 'c');
// '/b/c' (starts from /b)

// Use join for building relative paths
const relativePath = path.join('src', 'components', 'Button.js');

// Use resolve for getting absolute paths
const absolutePath = path.resolve(__dirname, 'src', 'index.js');
```

---

## 4.3 Path Components

### path.basename()

Returns the last portion of a path (filename):

```javascript
path.basename('/home/user/docs/file.txt');
// 'file.txt'

// Remove extension
path.basename('/home/user/docs/file.txt', '.txt');
// 'file'

// Works with directories too
path.basename('/home/user/docs');
// 'docs'

path.basename('/home/user/docs/');
// 'docs'
```

### path.dirname()

Returns the directory portion of a path:

```javascript
path.dirname('/home/user/docs/file.txt');
// '/home/user/docs'

path.dirname('/home/user/docs');
// '/home/user'

path.dirname('/home/user/docs/');
// '/home/user'

// Get parent directory
const parent = path.dirname(__dirname);
```

### path.extname()

Returns the file extension:

```javascript
path.extname('file.txt');
// '.txt'

path.extname('file.tar.gz');
// '.gz' (only last extension)

path.extname('file');
// '' (no extension)

path.extname('.gitignore');
// '' (dot files have no extension)

path.extname('path/to/file.js');
// '.js'

// Get extension without dot
const ext = path.extname('file.txt').slice(1);
// 'txt'
```

### path.parse()

Parses path into an object with all components:

```javascript
path.parse('/home/user/docs/file.txt');
// {
//   root: '/',
//   dir: '/home/user/docs',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// Windows path
path.parse('C:\\Users\\docs\\file.txt');
// {
//   root: 'C:\\',
//   dir: 'C:\\Users\\docs',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// Usage
const parsed = path.parse('/path/to/file.txt');
console.log(parsed.name);  // 'file'
console.log(parsed.ext);   // '.txt'
```

### path.format()

Builds a path from an object (opposite of parse):

```javascript
path.format({
  root: '/',
  dir: '/home/user/docs',
  base: 'file.txt'
});
// '/home/user/docs/file.txt'

// dir and base override root and name/ext
path.format({
  root: '/',
  dir: '/custom/dir',
  name: 'file',
  ext: '.txt'
});
// '/custom/dir/file.txt'

// Change extension
const parsed = path.parse('/path/to/file.txt');
parsed.base = '';  // Must clear base
parsed.ext = '.md';
path.format(parsed);
// '/path/to/file.md'
```

---

## 4.4 Path Manipulation

### path.normalize()

Normalizes a path, resolving `.` and `..`:

```javascript
path.normalize('/home/user/../admin/./docs');
// '/home/admin/docs'

path.normalize('folder//subfolder///file.txt');
// 'folder/subfolder/file.txt'

path.normalize('./current/./path/../other');
// 'current/other'

// Doesn't convert to absolute
path.normalize('relative/path');
// 'relative/path'
```

### path.relative()

Returns the relative path from one path to another:

```javascript
path.relative('/home/user/docs', '/home/user/images');
// '../images'

path.relative('/home/user', '/home/user/docs/file.txt');
// 'docs/file.txt'

path.relative('/a/b/c', '/a/b/c');
// ''

path.relative('/a/b', '/x/y');
// '../../x/y'

// Common usage: make paths relative to project root
const projectRoot = '/home/user/project';
const filePath = '/home/user/project/src/index.js';
path.relative(projectRoot, filePath);
// 'src/index.js'
```

### path.isAbsolute()

Checks if a path is absolute:

```javascript
// POSIX
path.isAbsolute('/home/user');    // true
path.isAbsolute('./relative');    // false
path.isAbsolute('relative');      // false
path.isAbsolute('../parent');     // false

// Windows
path.isAbsolute('C:\\Users');     // true
path.isAbsolute('\\\\server');    // true (UNC path)
path.isAbsolute('relative');      // false
```

---

## 4.5 Platform Specifics

### path.sep

Platform-specific path separator:

```javascript
path.sep;
// POSIX: '/'
// Windows: '\\'

// Split path into segments
const segments = filePath.split(path.sep);

// Build path with separator
const customPath = ['folder', 'file.txt'].join(path.sep);
```

### path.delimiter

Platform-specific path delimiter (for PATH env variable):

```javascript
path.delimiter;
// POSIX: ':'
// Windows: ';'

// Parse PATH environment variable
const paths = process.env.PATH.split(path.delimiter);
console.log(paths);
// ['/usr/bin', '/usr/local/bin', ...]
```

### path.posix and path.win32

Use specific platform's implementation:

```javascript
// Always use POSIX paths (URLs, etc.)
path.posix.join('folder', 'file.txt');
// 'folder/file.txt' (even on Windows)

// Always use Windows paths
path.win32.join('folder', 'file.txt');
// 'folder\\file.txt' (even on POSIX)

// Useful for cross-platform path handling
function toUrl(filePath) {
  // Convert to forward slashes for URLs
  return filePath.split(path.sep).join(path.posix.sep);
}
```

---

## 4.6 Common Patterns

### Get Filename Without Extension

```javascript
function getFileNameWithoutExt(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

getFileNameWithoutExt('/path/to/file.txt');
// 'file'

getFileNameWithoutExt('document.tar.gz');
// 'document.tar'
```

### Change File Extension

```javascript
function changeExtension(filePath, newExt) {
  const parsed = path.parse(filePath);
  return path.format({
    ...parsed,
    base: undefined,  // Must clear base
    ext: newExt.startsWith('.') ? newExt : '.' + newExt
  });
}

changeExtension('/path/to/file.txt', '.md');
// '/path/to/file.md'

changeExtension('script.js', 'ts');
// 'script.ts'
```

### Ensure Path Has Extension

```javascript
function ensureExtension(filePath, ext) {
  if (path.extname(filePath) === '') {
    return filePath + (ext.startsWith('.') ? ext : '.' + ext);
  }
  return filePath;
}

ensureExtension('config', '.json');
// 'config.json'

ensureExtension('config.json', '.json');
// 'config.json'
```

### Safe Path Joining (Prevent Path Traversal)

```javascript
function safePath(baseDir, userPath) {
  // Resolve the full path
  const fullPath = path.resolve(baseDir, userPath);
  
  // Ensure it's still within baseDir
  if (!fullPath.startsWith(path.resolve(baseDir) + path.sep)) {
    throw new Error('Path traversal attempt detected');
  }
  
  return fullPath;
}

// ✅ Safe
safePath('/uploads', 'user/file.txt');
// '/uploads/user/file.txt'

// ❌ Throws error (path traversal)
safePath('/uploads', '../etc/passwd');
// Error: Path traversal attempt detected
```

### Normalize URL Path

```javascript
function normalizeUrlPath(urlPath) {
  // Use posix for URLs
  return path.posix.normalize(urlPath);
}

normalizeUrlPath('/api//users/../posts');
// '/api/posts'
```

---

## 4.7 Summary

| Method | Description | Example |
|--------|-------------|---------|
| `join()` | Join path segments | `join('a', 'b')` → `'a/b'` |
| `resolve()` | Resolve to absolute path | `resolve('a')` → `'/cwd/a'` |
| `basename()` | Get filename | `basename('/a/b.txt')` → `'b.txt'` |
| `dirname()` | Get directory | `dirname('/a/b.txt')` → `'/a'` |
| `extname()` | Get extension | `extname('f.txt')` → `'.txt'` |
| `parse()` | Parse path to object | Returns `{root, dir, base, ext, name}` |
| `format()` | Object to path | Opposite of parse |
| `normalize()` | Clean up path | `normalize('a//b/../c')` → `'a/c'` |
| `relative()` | Get relative path | `relative('/a', '/a/b')` → `'b'` |
| `isAbsolute()` | Check if absolute | `isAbsolute('/a')` → `true` |

| Property | POSIX | Windows |
|----------|-------|---------|
| `sep` | `/` | `\\` |
| `delimiter` | `:` | `;` |

---

**End of Module 4: Path**

Next: **Module 5 — HTTP and HTTPS** (Creating servers, making requests)
