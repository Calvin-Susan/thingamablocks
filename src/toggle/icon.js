import { SVG, Path, Circle } from '@wordpress/primitives';

// A pill switch in the "on" position.
export const toggleIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
		<Path d="M7 6.5h10a5.5 5.5 0 0 1 0 11H7a5.5 5.5 0 0 1 0-11Zm0 1.5a4 4 0 0 0 0 8h10a4 4 0 0 0 0-8H7Z" />
		<Circle cx="17" cy="12" r="3" />
	</SVG>
);
