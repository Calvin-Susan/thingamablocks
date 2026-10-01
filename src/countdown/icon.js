import { SVG, Path, Circle, Rect } from '@wordpress/primitives';

import { GB_ICON_CLASS } from '../shared/gb';

// A stopwatch.
export const countdownIcon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		className={ GB_ICON_CLASS }
		aria-hidden="true"
	>
		<Path d="M9.5 2h5v1.5h-5zM18.03 6.91l1.06-1.06 1.06 1.06-1.06 1.06z" />
		<Path d="M12 5a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z" />
		<Path d="M11.25 8.5h1.5v5h-1.5z" />
		<Circle cx="12" cy="13.5" r="1.25" />
	</SVG>
);

export const variationIcons = {
	boxes: (
		<SVG
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 48 48"
			className={ GB_ICON_CLASS }
			aria-hidden="true"
		>
			<Path d="M4 16h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2Zm0 2v12h8V18H4ZM16 16h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2Zm0 2v12h8V18h-8ZM28 16h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2Zm0 2v12h8V18h-8ZM40 16h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2Zm0 2v12h4V18h-4Z" />
			<Rect x="5" y="21" width="6" height="4" />
			<Rect x="17" y="21" width="6" height="4" />
			<Rect x="29" y="21" width="6" height="4" />
		</SVG>
	),
	inline: (
		<SVG
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 48 48"
			className={ GB_ICON_CLASS }
			aria-hidden="true"
		>
			<Rect x="4" y="22" width="8" height="4" rx="1" />
			<Rect x="15" y="20" width="6" height="8" rx="1" />
			<Rect x="24" y="20" width="6" height="8" rx="1" />
			<Rect x="33" y="20" width="6" height="8" rx="1" />
			<Rect x="42" y="20" width="4" height="8" rx="1" />
		</SVG>
	),
	colons: (
		<SVG
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 48 48"
			className={ GB_ICON_CLASS }
			aria-hidden="true"
		>
			<Rect x="3" y="15" width="10" height="14" rx="1.5" />
			<Rect x="19" y="15" width="10" height="14" rx="1.5" />
			<Rect x="35" y="15" width="10" height="14" rx="1.5" />
			<Circle cx="16" cy="19" r="1.25" />
			<Circle cx="16" cy="25" r="1.25" />
			<Circle cx="32" cy="19" r="1.25" />
			<Circle cx="32" cy="25" r="1.25" />
			<Rect x="4" y="32" width="8" height="2" />
			<Rect x="20" y="32" width="8" height="2" />
			<Rect x="36" y="32" width="8" height="2" />
		</SVG>
	),
};
