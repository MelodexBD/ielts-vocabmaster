// GitHub Pages has no server-side routing: any path that is not a real file returns 404.html.
// Serving the app as 404.html lets deep links like /books/Reading/10 (and the old
// signup.html / admin.html links) load the React app, which then shows the right page.
import { copyFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
console.log('Copied dist/index.html to dist/404.html for client-side routing.');
