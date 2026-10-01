import { SVG, Path, Rect } from '@wordpress/primitives';

import { GB_ICON_CLASS } from '../shared/gb';

// A button with a chevron, and a drawer below it.
export const dropdownIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		className={ GB_ICON_CLASS }
		aria-hidden="true"
	>
		<Path d="M4 3h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm.5 1.5v3h15v-3h-15Z" />
		<Path d="M15.5 5.25h2.5L16.75 6.5z" />
		<Path d="M4 11h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Zm.5 1.5v7h15v-7h-15Z" />
		<Rect x="6" y="14" width="9" height="1.5" rx="0.75" />
		<Rect x="6" y="16.75" width="6" height="1.5" rx="0.75" />
	</SVG>
);

const variationIcon = ( children ) => (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 48 48"
		className={ GB_ICON_CLASS }
		aria-hidden="true"
	>
		<Rect x="6" y="6" width="36" height="9" rx="2" />
		{ children }
	</SVG>
);

export const variationIcons = {
	downloads: variationIcon(
		<>
			<Rect
				x="6"
				y="19"
				width="36"
				height="24"
				rx="2"
				fillOpacity="0.25"
			/>
			<Path d="M11 24h14v2H11zM11 28h8v1.5h-8zM11 33h14v2H11zM11 37h8v1.5h-8z" />
			<Path d="M35 24v6l-2.5-2.5-1 1L36 33l4.5-4.5-1-1L37 30v-6z" />
		</>
	),
	links: variationIcon(
		<>
			<Rect
				x="6"
				y="19"
				width="36"
				height="24"
				rx="2"
				fillOpacity="0.25"
			/>
			<Path d="M11 25h22v2H11zM11 30.5h18v2H11zM11 36h20v2H11z" />
		</>
	),
	panel: variationIcon(
		<>
			<Rect
				x="6"
				y="19"
				width="36"
				height="24"
				rx="2"
				fillOpacity="0.25"
			/>
			<Path d="M11 24h16v3H11zM11 30h26v1.5H11zM11 33.5h22v1.5H11z" />
			<Rect x="11" y="37" width="10" height="3" rx="1" />
		</>
	),
};
