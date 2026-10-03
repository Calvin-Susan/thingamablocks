<?php
/**
 * Demo section: a table of contents of the demo page's headings, in the
 * Sidebar line style.
 *
 * Demo content for the local test site (rendered by playground/blueprint.json),
 * not part of the plugin: block markup exported from the editor.
 *
 * @package Thingamablocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!-- wp:thingamablocks/toc -->
<!-- wp:generateblocks/text {"uniqueId":"9d148adf","tagName":"p","globalClasses":["tmb-toc__title"],"metadata":{"name":"Title"}} -->
<p class="gb-text tmb-toc__title"><?php echo esc_html__( 'On this page', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/element {"uniqueId":"ab203919","tagName":"ul","globalClasses":["tmb-toc__list","tmb-toc__list\u002d\u002dline"],"htmlAttributes":{"data-toc-part":"list"},"metadata":{"name":"List"}} -->
<ul class="tmb-toc__list tmb-toc__list--line" data-toc-part="list"><!-- wp:generateblocks/element {"uniqueId":"db6f8aba","tagName":"li","globalClasses":["tmb-toc__item"],"htmlAttributes":{"data-toc-part":"item"},"metadata":{"name":"Item (each heading)"}} -->
<li class="tmb-toc__item" data-toc-part="item"><!-- wp:generateblocks/text {"uniqueId":"ad5ff966","tagName":"a","globalClasses":["tmb-toc__link","tmb-toc__link\u002d\u002dline"],"htmlAttributes":{"data-toc-part":"link","href":"#"},"metadata":{"name":"Link"}} -->
<a class="gb-text tmb-toc__link tmb-toc__link--line" data-toc-part="link" href="#"><?php echo esc_html__( 'Heading', 'thingamablocks' ); ?></a>
<!-- /wp:generateblocks/text --></li>
<!-- /wp:generateblocks/element --></ul>
<!-- /wp:generateblocks/element -->
<!-- /wp:thingamablocks/toc -->