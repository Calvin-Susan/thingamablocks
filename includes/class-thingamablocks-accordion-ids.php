<?php
/**
 * Unique HTML IDs for GenerateBlocks Pro Accordions in a Query Loop.
 *
 * GB Pro saves fixed IDs on an accordion's toggle and content
 * ("gb-accordion-toggle-<uniqueId>", "gb-accordion-content-<uniqueId>"), and
 * its front-end script links them with aria-controls / aria-labelledby. In a
 * GenerateBlocks Query Loop every loop item renders the same blocks, so the
 * IDs repeat: invalid HTML, and the ARIA links all point at the first item.
 *
 * In a loop item (one with GenerateBlocks' loopIndex context), each toggle's
 * and content's ID gets the loop post's ID added ("gb-accordion-toggle-
 * 6904a3ed-24534"), along with any accordion ID in its aria-controls or
 * aria-labelledby. Other loop types (GB Pro's custom field and option loops)
 * give every row the same post ID, so they get the row number too
 * ("-24534-3"). GB Pro's script finds the parts by class and copies the
 * IDs it finds into the ARIA attributes, so it follows along. Outside a
 * loop nothing changes.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Makes accordion IDs unique per Query Loop item.
 */
class Thingamablocks_Accordion_Ids {

	const TOGGLE     = 'generateblocks-pro/accordion-toggle';
	const CONTENT    = 'generateblocks-pro/accordion-content';
	const LOOP_INDEX = 'generateblocks/loopIndex';
	const QUERY_TYPE = 'generateblocks/queryType';

	/**
	 * Hook in.
	 */
	public static function init() {
		add_filter( 'register_block_type_args', array( __CLASS__, 'uses_context' ), 10, 2 );
		add_filter( 'render_block_' . self::TOGGLE, array( __CLASS__, 'render' ), 10, 3 );
		add_filter( 'render_block_' . self::CONTENT, array( __CLASS__, 'render' ), 10, 3 );
	}

	/**
	 * Let the toggle and content see which loop item they're in (WordPress
	 * only passes a block the context it asks for).
	 *
	 * @param array  $args Block type arguments.
	 * @param string $name Block name.
	 * @return array
	 */
	public static function uses_context( $args, $name ) {
		if ( self::TOGGLE === $name || self::CONTENT === $name ) {
			$args['uses_context'] = array_values(
				array_unique( array_merge( (array) ( $args['uses_context'] ?? array() ), array( 'postId', self::LOOP_INDEX, self::QUERY_TYPE ) ) )
			);
		}

		return $args;
	}

	/**
	 * In a loop item, add the loop post's ID to the part's IDs.
	 *
	 * @param string        $content  Rendered block.
	 * @param array         $block    Parsed block.
	 * @param WP_Block|null $instance Block instance.
	 * @return string
	 */
	public static function render( $content, $block, $instance = null ) {
		if ( ! $instance instanceof WP_Block || empty( $instance->context[ self::LOOP_INDEX ] ) ) {
			return $content;
		}

		$context = $instance->context;
		$suffix  = '-' . absint( $context['postId'] ?? 0 );

		if ( 'WP_Query' !== ( $context[ self::QUERY_TYPE ] ?? '' ) ) {
			$suffix .= '-' . absint( $context[ self::LOOP_INDEX ] );
		}

		$tags = new WP_HTML_Tag_Processor( $content );

		// The block's own element (GB may print a <style> before it).
		if ( ! $tags->next_tag( empty( $block['attrs']['tagName'] ) ? 'div' : $block['attrs']['tagName'] ) ) {
			return $content;
		}

		$id = $tags->get_attribute( 'id' );

		if ( is_string( $id ) && '' !== $id ) {
			$tags->set_attribute( 'id', $id . $suffix );
		}

		// Saved by hand (GB Pro's script adds them itself): only accordion IDs.
		foreach ( array( 'aria-controls', 'aria-labelledby' ) as $name ) {
			$value = $tags->get_attribute( $name );

			if ( is_string( $value ) && '' !== $value ) {
				$tags->set_attribute( $name, (string) preg_replace( '/(?<![\w-])gb-accordion-(?:toggle|content)-[\w-]+/', '$0' . $suffix, $value ) );
			}
		}

		return $tags->get_updated_html();
	}
}

Thingamablocks_Accordion_Ids::init();
