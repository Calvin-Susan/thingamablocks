import { SVG, Path, Rect } from '@wordpress/primitives';

import { GB_ICON_CLASS } from '../shared/gb';

// Three steps joined by chevrons.
export const breadcrumbsIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		className={ GB_ICON_CLASS }
		aria-hidden="true"
	>
		<Rect x="2" y="10.25" width="5" height="3.5" rx="1" />
		<Path d="m8.5 9.5 2.5 2.5-2.5 2.5-1-1 1.5-1.5-1.5-1.5z" />
		<Rect x="12" y="10.25" width="4" height="3.5" rx="1" />
		<Path d="m17.25 9.5 2.5 2.5-2.5 2.5-1-1 1.5-1.5-1.5-1.5z" />
		<Rect x="20.5" y="10.25" width="1.5" height="3.5" rx="0.5" />
	</SVG>
);

const variationIcon = ( children ) => (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 48 48"
		className={ GB_ICON_CLASS }
		aria-hidden="true"
	>
		{ children }
	</SVG>
);

export const variationIcons = {
	chevrons: variationIcon(
		<>
			<Rect x="4" y="22" width="10" height="4" rx="1" />
			<Path d="m17 20 4 4-4 4-1.4-1.4 2.6-2.6-2.6-2.6z" />
			<Rect x="24" y="22" width="8" height="4" rx="1" />
			<Path d="m35 20 4 4-4 4-1.4-1.4 2.6-2.6-2.6-2.6z" />
			<Rect x="41" y="22" width="4" height="4" rx="1" />
		</>
	),
	slashes: variationIcon(
		<>
			<Rect x="4" y="22" width="10" height="4" rx="1" />
			<Path d="m19.5 18 1.7.6-4.2 11.4-1.7-.6z" />
			<Rect x="24" y="22" width="8" height="4" rx="1" />
			<Path d="m37.5 18 1.7.6-4.2 11.4-1.7-.6z" />
			<Rect x="41" y="22" width="4" height="4" rx="1" />
		</>
	),
	pills: variationIcon(
		<>
			<Rect
				x="3"
				y="19"
				width="14"
				height="10"
				rx="5"
				fillOpacity="0.35"
			/>
			<Path d="m20 21 3 3-3 3-1.2-1.2 1.8-1.8-1.8-1.8z" />
			<Rect x="26" y="19" width="19" height="10" rx="5" />
		</>
	),
};
