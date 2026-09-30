import { SVG, Path, Circle } from '@wordpress/primitives';

// GenerateBlocks colours block icons with this class, so ours match its blocks.
const GB_ICON_CLASS = 'gblocks-block-icon';

// A pill switch in the "on" position.
export const toggleIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={ GB_ICON_CLASS } aria-hidden="true">
		<Path d="M7 6.5h10a5.5 5.5 0 0 1 0 11H7a5.5 5.5 0 0 1 0-11Zm0 1.5a4 4 0 0 0 0 8h10a4 4 0 0 0 0-8H7Z" />
		<Circle cx="17" cy="12" r="3" />
	</SVG>
);

// Icons for the starting layouts in the variation picker.
export const variationIcons = {
	'switch-labels': (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={ GB_ICON_CLASS } aria-hidden="true">
			<Path d="M4 22h8v4H4zM36 22h8v4h-8z" />
			<Path d="M20 17h8a7 7 0 0 1 0 14h-8a7 7 0 0 1 0-14Zm0 2a5 5 0 0 0 0 10h8a5 5 0 0 0 0-10h-8Z" />
			<Circle cx="28" cy="24" r="4" />
		</SVG>
	),
	segmented: (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={ GB_ICON_CLASS } aria-hidden="true">
			<Path d="M10 15h28a9 9 0 0 1 0 18H10a9 9 0 0 1 0-18Zm0 2a7 7 0 0 0 0 14h28a7 7 0 0 0 0-14H10Z" />
			<Path d="M25 19h13a5 5 0 0 1 0 10H25z" />
		</SVG>
	),
	switch: (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={ GB_ICON_CLASS } aria-hidden="true">
			<Path d="M15 14h18a10 10 0 0 1 0 20H15a10 10 0 0 1 0-20Zm0 2a8 8 0 0 0 0 16h18a8 8 0 0 0 0-16H15Z" />
			<Circle cx="33" cy="24" r="6" />
		</SVG>
	),
	'dark-mode': (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={ GB_ICON_CLASS } aria-hidden="true">
			<Path d="M15 14h18a10 10 0 0 1 0 20H15a10 10 0 0 1 0-20Zm0 2a8 8 0 0 0 0 16h18a8 8 0 0 0 0-16H15Z" />
			<Path d="M36.5 27.5a6 6 0 0 1-7-7 6 6 0 1 0 7 7Z" />
			<Circle cx="15" cy="24" r="2.5" />
		</SVG>
	),
};
