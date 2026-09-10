/** Minimal uncompressed ZIP writer: portable, no runtime dependencies. */
import fs from 'node:fs';
import path from 'node:path';

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const item = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Cannot bundle symlink: ${item}`);
    if (entry.isDirectory()) return files(item);
    return entry.isFile() ? [item] : [];
  });
}
export function bundle(root, output) {
  root = path.resolve(root); output = path.resolve(output);
  if (output === root || output.startsWith(root + path.sep)) throw new Error('Output must be outside the skill directory');
  const local = [], central = []; let offset = 0;
  const sourceFiles = files(root);
  if (sourceFiles.length > 65535) throw new Error('Archive has too many entries');
  for (const source of sourceFiles) {
    const name = Buffer.from('oh-my-figma/' + path.relative(root, source).split(path.sep).join('/'));
    const data = fs.readFileSync(source), crc = crc32(data);
    if (data.length > 0xffffffff) throw new Error('Archive entry too large');
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(33, 12); // 1980-01-01, reproducible archive metadata
    header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(name.length, 26);
    const index = Buffer.alloc(46);
    index.writeUInt32LE(0x02014b50); index.writeUInt16LE(20, 4); index.writeUInt16LE(20, 6);
    index.writeUInt16LE(0x800, 8); index.writeUInt16LE(33, 14);
    index.writeUInt32LE(crc, 16); index.writeUInt32LE(data.length, 20); index.writeUInt32LE(data.length, 24);
    index.writeUInt16LE(name.length, 28); index.writeUInt32LE(offset, 42);
    local.push(header, name, data); central.push(index, name); offset += header.length + name.length + data.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(sourceFiles.length, 8); end.writeUInt16LE(sourceFiles.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, Buffer.concat([...local, directory, end]), { flag: 'wx' });
}
