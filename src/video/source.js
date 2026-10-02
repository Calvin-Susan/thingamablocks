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
		// A Direct Play / embed link: pick out the video ID, to help build the MP4 address.
		const match = path.match( /^\/(?:play|embed)\/\d+\/([0-9a-f-]{36})/i );

		return { error: 'bunny-embed', id: match ? match[ 1 ] : '' };
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

/**
 * Turn any link from a Bunny Stream video's "Video and asset links" that
 * carries the library's hostname (HLS playlist, thumbnail, preview animation,
 * another MP4 size) into the MP4 address the background plays:
 * https://{library hostname}/{video ID}/play_{size}p.mp4. Needs "MP4
 * fallback" switched on for the library.
 *
 * @param {string}   url   Pasted URL.
 * @param {string[]} hosts Extra Bunny hostnames from Settings.
 * @param {number}   size  720 for the main video, 480 for phones.
 * @return {string} The MP4 address, or '' if it isn't such a link.
 */
export function bunnyMp4( url, hosts = [], size = 720 ) {
	let parsed;

	try {
		parsed = new URL( String( url || '' ).trim() );
	} catch {
		return '';
	}

	const host = parsed.hostname.toLowerCase();
	const match = parsed.pathname.match(
		/^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(?:playlist\.m3u8|thumbnail[\w.-]*\.(?:jpg|jpeg|webp|png)|preview\.webp|play_\d+p\.mp4)$/i
	);

	if (
		'https:' !== parsed.protocol ||
		! match ||
		! ( host.endsWith( '.b-cdn.net' ) || hosts.includes( host ) )
	) {
		return '';
	}

	return `https://${ host }/${ match[ 1 ].toLowerCase() }/play_${ size }p.mp4`;
}
