/**
 * Package the plugin for upload: dist/toggle-for-generateblocks.zip
 *
 * The zip contains a single top-level folder, toggle-for-generateblocks/, with
 * only what WordPress needs at runtime: the main plugin file, readme.txt,
 * includes/, patterns/, build/ (and LICENSE if there is one). Source files, node_modules
 * and dev tooling stay out.
 *
 * Run through `npm run zip`, which builds first. Uses the system `zip` command.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SLUG = 'toggle-for-generateblocks';
const root = resolve( dirname( fileURLToPath( import.meta.url ) ), '..' );
const distDir = join( root, 'dist' );
const zipPath = join( distDir, `${ SLUG }.zip` );

const required = [ `${ SLUG }.php`, 'readme.txt', 'includes', 'patterns', 'build' ];
const optional = [ 'LICENSE' ];

function fail( message ) {
	console.error( `\nzip: ${ message }\n` );
	process.exit( 1 );
}

if ( ! existsSync( join( root, 'build', 'toggle', 'block.json' ) ) ) {
	fail( 'build/ is missing or incomplete. Run `npm run build` first (or use `npm run zip`, which builds for you).' );
}

const missing = required.filter( ( entry ) => ! existsSync( join( root, entry ) ) );

if ( missing.length ) {
	fail( `missing required file(s): ${ missing.join( ', ' ) }` );
}

const stage = mkdtempSync( join( tmpdir(), `${ SLUG }-` ) );
const pluginDir = join( stage, SLUG );

try {
	mkdirSync( pluginDir );

	[ ...required, ...optional.filter( ( entry ) => existsSync( join( root, entry ) ) ) ].forEach(
		( entry ) => cpSync( join( root, entry ), join( pluginDir, entry ), { recursive: true } )
	);

	mkdirSync( distDir, { recursive: true } );
	rmSync( zipPath, { force: true } );

	execFileSync( 'zip', [ '-rq', '-X', zipPath, SLUG, '-x', '*.DS_Store' ], {
		cwd: stage,
		stdio: 'inherit',
	} );
} catch ( error ) {
	// process.exit() would skip a finally block, so clean up here before failing.
	rmSync( stage, { recursive: true, force: true } );
	fail( error.code === 'ENOENT' ? 'the `zip` command was not found on this system.' : error.message );
}

rmSync( stage, { recursive: true, force: true } );

console.log( `Created ${ zipPath }` );
