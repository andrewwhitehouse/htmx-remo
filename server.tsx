import {type Context, Hono} from 'hono'; import {serveStatic} from 'hono/bun';
const app = new Hono();

app.use('/*', serveStatic({root: './'}));

app.get('/version', (c: Context) => {
// Return a Response whose body contains
// the version of Bun running on the server.
return c.text(Bun.version);
});

export default app;