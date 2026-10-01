/**
 * What a video URL is. Mirrors Thingamablocks_Video_Background::classify()
 * (the server's check is the one that counts; this one explains it in the
 * editor).
 *
 * @param {string}   url   URL.
 * @param {string[]} hosts Extra Bunny hostnames from Settings.
 * @return {{type?: string, id?: string, hash?: string, error?: string}} Result.
 */
export function classify( url, hosts = [] ) {
	const value = String( url || '' ).trim();
	let parsed;

	if ( ! value || /[\s<>"'\\]/.test( value ) ) {
		return { error: 'invalid' };
	}

	try {
		parsed = new URL( value );
	} catch {
		return { error: 'invalid' };
	}

	// A port, even :443 (which URL() drops), isn't accepted, as on the server.
	if (
		'https:' !== parsed.protocol ||
		parsed.username ||
		parsed.password ||
		parsed.port ||
		/^https:\/\/[^/?#]*:\d/i.test( value )
	) {
		return { error: 'https' };
	}

	const host = parsed.hostname.toLowerCase();
	const path = parsed.pathname;
	const queryHash = parsed.searchParams.get( 'h' ) || '';
	const vimeo = ( id, hash ) => ( {
		type: 'vimeo',
		id,
		hash: /^[a-f0-9]{1,32}$/.test( hash ) ? hash : '',
	} );

	if ( 'vimeo.com' === host || 'www.vimeo.com' === host ) {
		const match = path.match( /^\/(\d+)(?:\/([a-f0-9]+))?\/?$/ );
		return match
			? vimeo( match[ 1 ], match[ 2 ] || queryHash )
			: { error: 'vimeo-page' };
	}

	if ( 'player.vimeo.com' === host ) {
		const match = path.match( /^\/video\/(\d+)\/?$/ );

		if ( match ) {
			return vimeo( match[ 1 ], queryHash );
		}

		return /^\/(progressive_redirect|external)\//.test( path )
			? { type: 'file' }
			: { error: 'vimeo-page' };
	}

	if ( host.endsWith( '.vimeocdn.com' ) ) {
		return { type: 'file' };
	}

	if (
		[
			'iframe.mediadelivery.net',
			'video.bunnycdn.com',
			'player.mediadelivery.net',
		].includes( host )
	) {
		return { error: 'bunny-embed' };
	}

	if ( ! host.endsWith( '.b-cdn.net' ) && ! hosts.includes( host ) ) {
		return {
			error: /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/.test(
				host
			)
				? 'youtube'
				: 'host',
		};
	}

	if ( /\.m3u8$/i.test( path ) ) {
		return { error: 'hls' };
	}

	if ( ! /\.(mp4|webm|m4v|mov)$/i.test( path ) ) {
		return { error: 'not-video' };
	}

	return { type: 'file' };
}
