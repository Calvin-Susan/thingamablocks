import { SVG, Path, Rect, Circle } from '@wordpress/primitives';

import { GB_ICON_CLASS } from '../shared/gb';

// A strip with items sliding left.
export const marqueeIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={ GB_ICON_CLASS } aria-hidden="true">
		<Path d="M2 6.5h20V8H2zM2 16h20v1.5H2z" />
		<Rect x="3" y="10" width="4" height="4" rx="1" />
		<Rect x="10" y="10" width="4" height="4" rx="1" />
		<Rect x="17" y="10" width="4" height="4" rx="1" />
		<Path d="M6 19.5 3.5 21 6 22.5z" />
	</SVG>
);

export const variationIcons = {
	logos: (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={ GB_ICON_CLASS } aria-hidden="true">
			<Circle cx="7" cy="24" r="4" />
			<Rect x="13" y="22" width="8" height="4" rx="2" />
			<Rect x="25" y="20" width="8" height="8" rx="2" />
			<Rect x="35" y="22" width="10" height="4" rx="2" />
		</SVG>
	),
	messages: (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={ GB_ICON_CLASS } aria-hidden="true">
			<Path d="M2 16h44v16H2zm2 2v12h40V18z" />
			<Rect x="6" y="22" width="14" height="4" rx="1" />
			<Path d="M24 21.5 25 24l2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
			<Rect x="30" y="22" width="12" height="4" rx="1" />
		</SVG>
	),
	headline: (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={ GB_ICON_CLASS } aria-hidden="true">
			<Path d="M2 17h6v14H6v-6H4v6H2zm2 2v4h2v-4zM11 17h7v2h-5v4h4v2h-4v4h5v2h-7zM21 17h2v12h5v2h-7z" />
			<Path d="M34 19.5 35.5 23l3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" />
			<Path d="M42 17h4v14h-4z" opacity=".4" />
		</SVG>
	),
	quotes: (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={ GB_ICON_CLASS } aria-hidden="true">
			<Path d="M12 4h24v12H12zm2 2v8h20V6zM12 18h24v12H12zm2 2v8h20v-8zM12 32h24v12H12zm2 2v8h20v-8z" />
			<Path d="M40 20l3-4 3 4z" />
		</SVG>
	),
};
