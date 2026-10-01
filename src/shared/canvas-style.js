/**
 * Styles injected into the editor canvas.
 *
 * The block editor renders blocks in an iframe. A <style> rendered next to a
 * block would land in the block list, where it upsets spacing rules like
 * "> * + *", so these are portalled into the canvas <head> instead.
 *
 * Usage: `const [ canvas, canvasRef ] = useCanvas();` pass `ref: canvasRef`
 * to useBlockProps, wrap the output in <CanvasContext.Provider value={ canvas }>,
 * and render <CanvasStyle>css</CanvasStyle> anywhere inside.
 */
import {
	createContext,
	createPortal,
	useCallback,
	useContext,
	useState,
} from '@wordpress/element';

// The document the block is rendered in (the editor canvas iframe).
export const CanvasContext = createContext( null );

export function useCanvas() {
	const [ canvas, setCanvas ] = useState( null );
	const ref = useCallback(
		( node ) => setCanvas( node ? node.ownerDocument : null ),
		[]
	);

	return [ canvas, ref ];
}

/**
 * A <style> in the editor canvas's <head>.
 *
 * @param {Object} props          Props.
 * @param {string} props.children CSS.
 * @param {Object} props.rest     Extra attributes for the <style>.
 */
export function CanvasStyle( { children, ...rest } ) {
	const canvas = useContext( CanvasContext );

	if ( ! canvas || ! children ) {
		return null;
	}

	return createPortal( <style { ...rest }>{ children }</style>, canvas.head );
}
