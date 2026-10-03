import { SVG, Path, Circle } from '@wordpress/primitives';

import { GB_ICON_CLASS } from '../shared/gb';

// Three connected dots.
export const shareIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		className={ GB_ICON_CLASS }
		aria-hidden="true"
	>
		<Circle cx="18" cy="5" r="3" />
		<Circle cx="6" cy="12" r="3" />
		<Circle cx="18" cy="19" r="3" />
		<Path d="m8.6 13.5 6.8 4-1 1.7-6.8-4zm5.8-8.7 1 1.7-6.8 4-1-1.7z" />
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
	icons: variationIcon(
		<>
			<Circle cx="9" cy="24" r="5" />
			<Circle cx="20" cy="24" r="5" />
			<Circle cx="31" cy="24" r="5" />
			<Circle cx="42" cy="24" r="4" />
		</>
	),
	pills: variationIcon(
		<>
			<Path d="M4 19h17a5 5 0 0 1 0 10H4a5 5 0 0 1 0-10z" />
			<Path d="M28 19h14a5 5 0 0 1 0 10H28a5 5 0 0 1 0-10z" />
		</>
	),
	brand: variationIcon(
		<>
			<Circle cx="9" cy="24" r="5" />
			<Circle
				cx="20"
				cy="24"
				r="5"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<Circle cx="31" cy="24" r="5" />
			<Circle
				cx="42"
				cy="24"
				r="4"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			/>
		</>
	),
};
