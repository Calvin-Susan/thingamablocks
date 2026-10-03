import { SVG, Path, Rect } from '@wordpress/primitives';

import { GB_ICON_CLASS } from '../shared/gb';

// A list with indented sub-items.
export const tocIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		className={ GB_ICON_CLASS }
		aria-hidden="true"
	>
		<Rect x="3" y="4" width="18" height="2.5" rx="1" />
		<Rect x="7" y="9" width="14" height="2.5" rx="1" />
		<Rect x="7" y="14" width="14" height="2.5" rx="1" />
		<Rect x="3" y="19" width="12" height="2.5" rx="1" />
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
	list: variationIcon(
		<>
			<Rect x="6" y="8" width="20" height="3" rx="1" />
			<Rect x="6" y="16" width="32" height="3" rx="1" />
			<Rect x="12" y="23" width="26" height="3" rx="1" />
			<Rect x="12" y="30" width="22" height="3" rx="1" />
			<Rect x="6" y="37" width="30" height="3" rx="1" />
		</>
	),
	line: variationIcon(
		<>
			<Rect x="8" y="8" width="2" height="32" />
			<Path d="M8 22h3v6H8z" />
			<Rect x="14" y="10" width="26" height="3" rx="1" />
			<Rect x="14" y="17" width="22" height="3" rx="1" />
			<Rect x="14" y="24" width="24" height="3" rx="1" />
			<Rect x="20" y="31" width="18" height="3" rx="1" />
		</>
	),
};
