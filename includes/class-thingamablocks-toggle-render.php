<?php
/**
 * Front-end rendering for the Toggle block.
 *
 * The Toggle's visible parts are ordinary GenerateBlocks blocks saved as static
 * HTML. This class wraps them and adds the accessibility attributes and state
 * on the server, so the markup is correct before any JavaScript runs and an
 * editor can't accidentally remove role="switch" or aria-checked.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders the Toggle block.
 */
class Thingamablocks_Toggle_Render {
	/**
	 * Actions the block understands. Anything else falls back to "none".
	 */
	const ACTIONS = array( 'showHide', 'colorScheme', 'toggleClass', 'none' );

	/**
	 * The attribute that marks a GenerateBlocks block as a toggle part.
	 */
	const PART = 'data-toggle-part';

	/**
	 * Set on parts once a toggle has claimed them, so an outer toggle doesn't
	 * re-process the parts of a toggle nested inside it.
	 */
	const OWNED = 'data-toggle-owned';

	/**
	 * Render callback.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Saved inner-block HTML.
	 * @return string
	 */
	public static function render( $attributes, $content ) {
		$config = self::config( $attributes );
		$is_on  = 'on' === $config['defaultState'];

		$content = self::decorate_parts( $content, $config, $is_on );

		$wrapper = array(
			'class'           => 'tmb-toggle ' . ( $is_on ? 'is-on' : 'is-off' ),
			'data-tmb-toggle' => wp_json_encode( $config ),
		);

		// The block is dynamic, so the HTML anchor has to be printed here.
		if ( ! empty( $attributes['anchor'] ) ) {
			$wrapper['id'] = $attributes['anchor'];
		}

		return sprintf(
			'%1$s<div %2$s>%3$s</div>%4$s',
			self::initial_visibility_css( $config, $is_on ),
			get_block_wrapper_attributes( $wrapper ),
			$content,
			self::restore_state_script( $config, $is_on, (string) ( $attributes['anchor'] ?? '' ) )
		);
	}

	/**
	 * Clean the attributes into the config the front-end script reads.
	 *
	 * @param array $attributes Block attributes.
	 * @return array
	 */
	public static function config( $attributes ) {
		$action = $attributes['action'] ?? 'showHide';

		if ( ! in_array( $action, self::ACTIONS, true ) ) {
			$action = 'none';
		}

		$config = array(
			'action'       => $action,
			'defaultState' => 'on' === ( $attributes['defaultState'] ?? 'off' ) ? 'on' : 'off',
			'persist'      => ! empty( $attributes['persist'] ),
			'group'        => self::clean_group( $attributes['group'] ?? '' ),
			'ariaLabel'    => sanitize_text_field( $attributes['ariaLabel'] ?? '' ),
		);

		if ( 'showHide' === $action ) {
			$animation = $attributes['animation'] ?? 'fade';

			$config['showWhenOff'] = self::clean_selectors( $attributes['showWhenOff'] ?? array() );
			$config['showWhenOn']  = self::clean_selectors( $attributes['showWhenOn'] ?? array() );
			$config['animation']   = in_array( $animation, array( 'none', 'fade', 'slide' ), true ) ? $animation : 'none';
		}

		if ( 'toggleClass' === $action ) {
			$config['classTargets'] = self::clean_selectors( $attributes['classTargets'] ?? array() );
			$config['classNames']   = self::clean_class_names( $attributes['classNames'] ?? '' );
			$config['classMode']    = 'removeWhenOn' === ( $attributes['classMode'] ?? '' ) ? 'removeWhenOn' : 'addWhenOn';
		}

		if ( 'colorScheme' === $action ) {
			// The colour scheme is page-wide, so every colour-scheme toggle shares one state.
			$config['group']        = 'color-scheme';
			$config['persist']      = true;
			$config['followSystem'] = ! isset( $attributes['followSystem'] ) || ! empty( $attributes['followSystem'] );
			$config['htmlClass']    = self::clean_class_names( $attributes['htmlClass'] ?? '' );
		}

		return $config;
	}

	/**
	 * Add roles, state and keyboard access to the inner GenerateBlocks parts.
	 *
	 * Parts are marked in the editor with data-toggle-part="switch|on|off" (the
	 * "Toggle part" panel, stored in the block's HTML attributes).
	 *
	 * @param string $content Inner HTML.
	 * @param array  $config  Toggle config.
	 * @param bool   $is_on   Initial state.
	 * @return string
	 */
	private static function decorate_parts( $content, $config, $is_on ) {
		if ( ! class_exists( 'WP_HTML_Tag_Processor' ) || '' === trim( $content ) ) {
			return $content;
		}

		$controls   = self::controls_attribute( $config );
		$has_switch = self::has_switch( $content );
		$processor  = new WP_HTML_Tag_Processor( $content );

		while ( $processor->next_tag() ) {
			if ( null !== $processor->get_attribute( self::OWNED ) ) {
				continue;
			}

			// A segmented control's group gets the toggle's label as its name.
			if ( 'group' === $processor->get_attribute( 'role' ) ) {
				$processor->set_attribute( self::OWNED, '' );

				if ( $config['ariaLabel'] && null === $processor->get_attribute( 'aria-label' ) ) {
					$processor->set_attribute( 'aria-label', $config['ariaLabel'] );
				}
			}

			$part = $processor->get_attribute( self::PART );

			if ( ! is_string( $part ) ) {
				continue;
			}

			$processor->set_attribute( self::OWNED, '' );

			$is_button = 'BUTTON' === $processor->get_tag();

			if ( 'switch' === $part ) {
				$processor->set_attribute( 'role', 'switch' );
				$processor->set_attribute( 'aria-checked', $is_on ? 'true' : 'false' );
				self::make_operable( $processor, $is_button, $controls );

				if ( $config['ariaLabel'] && null === $processor->get_attribute( 'aria-label' ) ) {
					$processor->set_attribute( 'aria-label', $config['ariaLabel'] );
				}
			} elseif ( 'on' === $part || 'off' === $part ) {
				$active = ( 'on' === $part ) === $is_on;
				$processor->set_attribute( 'data-active', $active ? 'true' : 'false' );

				/*
				 * Next to a switch, plain-text labels are a mouse convenience: the
				 * switch is the control. Without a switch, the on/off parts are the
				 * controls, so they must work as buttons for keyboard and screen readers.
				 */
				if ( $is_button || ! $has_switch ) {
					$processor->set_attribute( 'aria-pressed', $active ? 'true' : 'false' );
					self::make_operable( $processor, $is_button, $controls );

					if ( ! $is_button ) {
						$processor->set_attribute( 'role', 'button' );
					}
				}
			}
		}

		return $processor->get_updated_html();
	}

	/**
	 * Make a part keyboard-operable and point it at what it controls.
	 *
	 * @param WP_HTML_Tag_Processor $processor Processor on the part's tag.
	 * @param bool                  $is_button Whether it's a <button>.
	 * @param string                $controls  aria-controls value.
	 */
	private static function make_operable( $processor, $is_button, $controls ) {
		if ( $is_button ) {
			// Stop a button inside a form from submitting it.
			$processor->set_attribute( 'type', 'button' );
		} else {
			$processor->set_attribute( 'tabindex', '0' );
		}

		if ( $controls ) {
			$processor->set_attribute( 'aria-controls', $controls );
		}
	}

	/**
	 * Whether the toggle's own parts include a switch (ignoring nested toggles,
	 * whose parts are already marked as owned).
	 *
	 * @param string $content Inner HTML.
	 * @return bool
	 */
	private static function has_switch( $content ) {
		$processor = new WP_HTML_Tag_Processor( $content );

		while ( $processor->next_tag() ) {
			if ( 'switch' === $processor->get_attribute( self::PART ) && null === $processor->get_attribute( self::OWNED ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Space-separated IDs for aria-controls. Only plain IDs count; class or
	 * attribute selectors can't be referenced by aria-controls.
	 *
	 * @param array $config Toggle config.
	 * @return string
	 */
	private static function controls_attribute( $config ) {
		return Thingamablocks_Sanitize::ids_attribute(
			array_merge(
				$config['showWhenOff'] ?? array(),
				$config['showWhenOn'] ?? array(),
				$config['classTargets'] ?? array()
			)
		);
	}

	/**
	 * The targets that start hidden in a given state. An element listed on
	 * both sides stays visible.
	 *
	 * @param array $config Toggle config.
	 * @param bool  $is_on  State.
	 * @return array
	 */
	private static function hidden_targets( $config, $is_on ) {
		if ( 'showHide' !== $config['action'] ) {
			return array();
		}

		$hidden = $is_on ? $config['showWhenOff'] : $config['showWhenOn'];
		$shown  = $is_on ? $config['showWhenOn'] : $config['showWhenOff'];

		return array_diff( $hidden, $shown );
	}

	/**
	 * Hide the targets that start hidden before the script runs, so a pricing
	 * table doesn't flash both plans on load. The script removes this rule
	 * once it has taken over.
	 *
	 * @param array $config Toggle config.
	 * @param bool  $is_on  Initial state.
	 * @return string
	 */
	private static function initial_visibility_css( $config, $is_on ) {
		return Thingamablocks_Sanitize::hide_style( self::hidden_targets( $config, $is_on ), 'tmb-toggle-initial' );
	}

	/**
	 * For a toggle that remembers the visitor's choice: a tiny script printed
	 * right after it that applies the saved state before the page is first
	 * drawn, so the other pricing plan (or the switch's knob) doesn't flash and
	 * jump when the main script takes over. Only for storage keys the server
	 * can work out (a group, an HTML anchor, or the colour scheme).
	 *
	 * @param array  $config Toggle config.
	 * @param bool   $is_on  Server-rendered state.
	 * @param string $anchor HTML anchor.
	 * @return string
	 */
	private static function restore_state_script( $config, $is_on, $anchor ) {
		if ( 'colorScheme' === $config['action'] ) {
			$key = ''; // The <head> script has already applied the scheme; read it from <html>.
		} elseif ( '' !== $config['group'] ) {
			// Any member of a group may be the one that remembers the choice
			// (the script honours it for all of them), so every member restores it.
			$key = 'group:' . $config['group'];
		} elseif ( ! $config['persist'] ) {
			return '';
		} elseif ( '' !== $anchor ) {
			$key = 'id:' . $anchor;
		} else {
			return '';
		}

		$args = wp_json_encode(
			array( $key, $is_on, Thingamablocks_Sanitize::hide_rules( self::hidden_targets( $config, ! $is_on ) ) ),
			JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES
		);

		// Mirrors paint() in src/toggle/view.js, which takes over on DOMContentLoaded.
		// Does nothing if the main script got there first (an optimiser delaying
		// inline scripts): it has already applied the state and removed the styles.
		$script = '(function(k,o,c){var x=document.currentScript,w=x&&x.previousElementSibling,d=document.documentElement,s=null,a;'
			. 'if(!w||w.tmbToggle||!w.classList.contains("tmb-toggle"))return;'
			. 'if(k){try{s=localStorage.getItem("tmb-toggle:"+k)}catch(e){}}'
			. 'else{a=d.getAttribute("data-color-scheme");s=a==="dark"?"on":a==="light"?"off":null}'
			. 'if(s!=="on"&&s!=="off"||(s==="on")===o)return;'
			. 'var n=s==="on",t=w.previousElementSibling;'
			. 'w.classList.toggle("is-on",n);w.classList.toggle("is-off",!n);'
			. 'w.querySelectorAll("[data-toggle-part]").forEach(function(p){if(p.closest(".tmb-toggle")!==w)return;'
			. 'var r=p.getAttribute("data-toggle-part"),v;if(r==="switch"){p.setAttribute("aria-checked",n?"true":"false");return}'
			. 'if(r!=="on"&&r!=="off")return;v=(r==="on")===n?"true":"false";p.setAttribute("data-active",v);'
			. 'if(p.hasAttribute("aria-pressed"))p.setAttribute("aria-pressed",v)});'
			. 'if(!t||!t.classList.contains("tmb-toggle-initial")){if(!c)return;t=document.createElement("style");t.className="tmb-toggle-initial";w.before(t)}'
			. 't.textContent=c})(' . substr( $args, 1, -1 ) . ')';

		return wp_get_inline_script_tag( $script );
	}

	/**
	 * Kept for code calling these on the Toggle class; see Thingamablocks_Sanitize.
	 *
	 * @param string $selector ID or selector.
	 * @return string
	 */
	public static function to_css_selector( $selector ) {
		return Thingamablocks_Sanitize::to_css_selector( $selector );
	}

	/**
	 * See Thingamablocks_Sanitize::selectors().
	 *
	 * @param mixed $selectors Selectors.
	 * @return array
	 */
	public static function clean_selectors( $selectors ) {
		return Thingamablocks_Sanitize::selectors( $selectors );
	}

	/**
	 * See Thingamablocks_Sanitize::class_names().
	 *
	 * @param string $class_names Class names.
	 * @return string
	 */
	public static function clean_class_names( $class_names ) {
		return Thingamablocks_Sanitize::class_names( $class_names );
	}

	/**
	 * Clean a sync group name the same way the editor does: lowercase letters,
	 * numbers, dashes and underscores. "color-scheme" is reserved for dark mode.
	 *
	 * @param string $group Group name.
	 * @return string
	 */
	public static function clean_group( $group ) {
		$group = is_string( $group ) ? strtolower( trim( $group ) ) : '';
		$group = trim( preg_replace( '/[^a-z0-9_-]+/', '-', $group ), '-' );

		return 'color-scheme' === $group ? '' : $group;
	}
}
