import { randomBytes } from 'node:crypto';
import { writeFile, chmod } from 'node:fs/promises';
import net from 'node:net';
const path = new URL('../.env', import.meta.url);
const free = port => new Promise(resolve => {
  const server = net.createServer();
  server.once('error', () => resolve(false));
  server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)));
});
let port = 3307;
while (!(await free(port))) { if (++port > 3399) throw new Error('No free local MySQL port'); }
try {
  await writeFile(path, `MYSQL_DATABASE=expiry_dev\nMYSQL_USER=expiry_app\nMYSQL_PASSWORD=${randomBytes(32).toString('hex')}\nMYSQL_ROOT_PASSWORD=${randomBytes(32).toString('hex')}\nMYSQL_HOST_PORT=${port}\n`, { flag: 'wx', mode: 0o600 });
  await chmod(path, 0o600);
  console.log(`Private ignored .env created; loopback port ${port}; credentials not printed.`);
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('Existing .env preserved.');
}
