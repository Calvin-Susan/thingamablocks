import { SVG, Path, Rect, Circle } from '@wordpress/primitives';

import { GB_ICON_CLASS } from '../shared/gb';

// A magnifying glass.
export const searchIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		className={ GB_ICON_CLASS }
		aria-hidden="true"
	>
		<Path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24-1.42 1.42-4.24-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />
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
	bar: variationIcon(
		<>
			<Rect
				x="4"
				y="17"
				width="28"
				height="14"
				rx="2"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<Rect x="35" y="17" width="9" height="14" rx="2" />
		</>
	),
	pill: variationIcon(
		<>
			<Rect
				x="4"
				y="16"
				width="40"
				height="16"
				rx="8"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<Circle cx="36" cy="24" r="5" />
		</>
	),
	underline: variationIcon(
		<>
			<Rect x="4" y="30" width="40" height="2.5" rx="1.25" />
			<Circle
				cx="38"
				cy="22"
				r="3.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<Rect x="6" y="21" width="16" height="2" rx="1" />
		</>
	),
	expand: variationIcon(
		<>
			<Circle
				cx="38"
				cy="12"
				r="5"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<Rect
				x="8"
				y="22"
				width="36"
				height="14"
				rx="2"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
		</>
	),
};
