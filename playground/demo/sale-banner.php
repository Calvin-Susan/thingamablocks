<?php
/**
 * Demo section: sale banner with an inline countdown.
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
<!-- wp:generateblocks/element {"uniqueId":"0c6f5938","tagName":"section","styles":{"display":"flex","flexWrap":"wrap","alignItems":"center","justifyContent":"center","columnGap":"1.5rem","rowGap":"0.75rem","paddingTop":"0.875rem","paddingRight":"1.5rem","paddingBottom":"0.875rem","paddingLeft":"1.5rem","backgroundColor":"var(\u002d\u002daccent, #1e73be)","color":"var(\u002d\u002dbase-3, #ffffff)","textAlign":"center"},"css":".gb-element-0c6f5938{align-items:center;background-color:var(\u002d\u002daccent,#1e73be);color:var(\u002d\u002dbase-3,#ffffff);column-gap:1.5rem;display:flex;flex-wrap:wrap;justify-content:center;row-gap:0.75rem;text-align:center;padding:0.875rem 1.5rem}","htmlAttributes":{"id":"sale-banner","aria-label":"<?php echo thingamablocks_pattern_json_string( __( 'Sale', 'thingamablocks' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON-encoded. ?>"}} -->
<section class="gb-element-0c6f5938" id="sale-banner" aria-label="<?php echo esc_attr__( 'Sale', 'thingamablocks' ); ?>"><!-- wp:generateblocks/text {"uniqueId":"256ffd17","tagName":"p","styles":{"marginBottom":"0","color":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-text-256ffd17{color:var(\u002d\u002dbase-3,#ffffff);margin-bottom:0}"} -->
<p class="gb-text gb-text-256ffd17"><strong><?php echo esc_html__( 'Flash sale:', 'thingamablocks' ); ?></strong> <?php /* translators: %s: the discount, e.g. "20%". */ echo esc_html( sprintf( __( '%s off everything', 'thingamablocks' ), '20%' ) ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:thingamablocks/countdown {"padNumbers":false,"hideEmptyUnits":true,"endAction":"hide","hideOnEnd":["sale-banner"]} -->
<!-- wp:generateblocks/element {"uniqueId":"c2a96aa2","tagName":"div","styles":{"display":"inline-flex","flexWrap":"wrap","alignItems":"baseline","columnGap":"0.5rem","color":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-element-c2a96aa2{align-items:baseline;color:var(\u002d\u002dbase-3,#ffffff);column-gap:0.5rem;display:inline-flex;flex-wrap:wrap}","htmlAttributes":{"data-countdown-part":"timer"}} -->
<div class="gb-element-c2a96aa2" data-countdown-part="timer"><!-- wp:generateblocks/text {"uniqueId":"8f5dd1de","tagName":"span","styles":{"color":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-text-8f5dd1de{color:var(\u002d\u002dbase-3,#ffffff)}","htmlAttributes":[]} -->
<span class="gb-text gb-text-8f5dd1de"><?php echo esc_html__( 'Ends in', 'thingamablocks' ); ?></span>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/element {"uniqueId":"19b570f5","tagName":"div","styles":{"display":"inline-flex","alignItems":"baseline","columnGap":"0.125rem"},"css":".gb-element-19b570f5{align-items:baseline;column-gap:0.125rem;display:inline-flex}","htmlAttributes":{"data-countdown-unit":"days"}} -->
<div class="gb-element-19b570f5" data-countdown-unit="days"><!-- wp:generateblocks/text {"uniqueId":"90686b6f","tagName":"span","styles":{"display":"inline","fontVariantNumeric":"tabular-nums","fontWeight":"700"},"css":".gb-text-90686b6f{display:inline;font-variant-numeric:tabular-nums;font-weight:700}","htmlAttributes":{"data-countdown-part":"days"}} -->
<span class="gb-text gb-text-90686b6f" data-countdown-part="days">00</span>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"4741f3ca","tagName":"span","styles":{"color":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-text-4741f3ca{color:var(\u002d\u002dbase-3,#ffffff)}","htmlAttributes":{"aria-hidden":"true"}} -->
<span class="gb-text gb-text-4741f3ca" aria-hidden="true"><?php echo esc_html_x( 'd', 'short for days in a countdown', 'thingamablocks' ); ?></span>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"5e1c7a01","tagName":"span","styles":{"position":"absolute","width":"1px","height":"1px","overflow":"hidden","clipPath":"inset(50%)","whiteSpace":"nowrap"},"css":".gb-text-5e1c7a01{clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}"} -->
<span class="gb-text gb-text-5e1c7a01"><?php echo esc_html__( 'days', 'thingamablocks' ); ?></span>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"2f9fe71d","tagName":"div","styles":{"display":"inline-flex","alignItems":"baseline","columnGap":"0.125rem"},"css":".gb-element-2f9fe71d{align-items:baseline;column-gap:0.125rem;display:inline-flex}","htmlAttributes":{"data-countdown-unit":"hours"}} -->
<div class="gb-element-2f9fe71d" data-countdown-unit="hours"><!-- wp:generateblocks/text {"uniqueId":"0b8de03a","tagName":"span","styles":{"display":"inline","fontVariantNumeric":"tabular-nums","fontWeight":"700"},"css":".gb-text-0b8de03a{display:inline;font-variant-numeric:tabular-nums;font-weight:700}","htmlAttributes":{"data-countdown-part":"hours"}} -->
<span class="gb-text gb-text-0b8de03a" data-countdown-part="hours">00</span>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"0b59a59e","tagName":"span","styles":{"color":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-text-0b59a59e{color:var(\u002d\u002dbase-3,#ffffff)}","htmlAttributes":{"aria-hidden":"true"}} -->
<span class="gb-text gb-text-0b59a59e" aria-hidden="true"><?php echo esc_html_x( 'h', 'short for hours in a countdown', 'thingamablocks' ); ?></span>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"5e1c7a02","tagName":"span","styles":{"position":"absolute","width":"1px","height":"1px","overflow":"hidden","clipPath":"inset(50%)","whiteSpace":"nowrap"},"css":".gb-text-5e1c7a02{clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}"} -->
<span class="gb-text gb-text-5e1c7a02"><?php echo esc_html__( 'hours', 'thingamablocks' ); ?></span>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"ed5e4a09","tagName":"div","styles":{"display":"inline-flex","alignItems":"baseline","columnGap":"0.125rem"},"css":".gb-element-ed5e4a09{align-items:baseline;column-gap:0.125rem;display:inline-flex}","htmlAttributes":{"data-countdown-unit":"minutes"}} -->
<div class="gb-element-ed5e4a09" data-countdown-unit="minutes"><!-- wp:generateblocks/text {"uniqueId":"9ab64b41","tagName":"span","styles":{"display":"inline","fontVariantNumeric":"tabular-nums","fontWeight":"700"},"css":".gb-text-9ab64b41{display:inline;font-variant-numeric:tabular-nums;font-weight:700}","htmlAttributes":{"data-countdown-part":"minutes"}} -->
<span class="gb-text gb-text-9ab64b41" data-countdown-part="minutes">00</span>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"4d7a4346","tagName":"span","styles":{"color":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-text-4d7a4346{color:var(\u002d\u002dbase-3,#ffffff)}","htmlAttributes":{"aria-hidden":"true"}} -->
<span class="gb-text gb-text-4d7a4346" aria-hidden="true"><?php echo esc_html_x( 'm', 'short for minutes in a countdown', 'thingamablocks' ); ?></span>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"5e1c7a03","tagName":"span","styles":{"position":"absolute","width":"1px","height":"1px","overflow":"hidden","clipPath":"inset(50%)","whiteSpace":"nowrap"},"css":".gb-text-5e1c7a03{clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}"} -->
<span class="gb-text gb-text-5e1c7a03"><?php echo esc_html__( 'minutes', 'thingamablocks' ); ?></span>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"a34ea921","tagName":"div","styles":{"display":"inline-flex","alignItems":"baseline","columnGap":"0.125rem"},"css":".gb-element-a34ea921{align-items:baseline;column-gap:0.125rem;display:inline-flex}","htmlAttributes":{"data-countdown-unit":"seconds"}} -->
<div class="gb-element-a34ea921" data-countdown-unit="seconds"><!-- wp:generateblocks/text {"uniqueId":"1da2476d","tagName":"span","styles":{"display":"inline","fontVariantNumeric":"tabular-nums","fontWeight":"700"},"css":".gb-text-1da2476d{display:inline;font-variant-numeric:tabular-nums;font-weight:700}","htmlAttributes":{"data-countdown-part":"seconds"}} -->
<span class="gb-text gb-text-1da2476d" data-countdown-part="seconds">00</span>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"0c8216d3","tagName":"span","styles":{"color":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-text-0c8216d3{color:var(\u002d\u002dbase-3,#ffffff)}","htmlAttributes":{"aria-hidden":"true"}} -->
<span class="gb-text gb-text-0c8216d3" aria-hidden="true"><?php echo esc_html_x( 's', 'short for seconds in a countdown', 'thingamablocks' ); ?></span>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"5e1c7a04","tagName":"span","styles":{"position":"absolute","width":"1px","height":"1px","overflow":"hidden","clipPath":"inset(50%)","whiteSpace":"nowrap"},"css":".gb-text-5e1c7a04{clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px}"} -->
<span class="gb-text gb-text-5e1c7a04"><?php echo esc_html__( 'seconds', 'thingamablocks' ); ?></span>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element --></div>
<!-- /wp:generateblocks/element -->
<!-- /wp:thingamablocks/countdown -->

<!-- wp:generateblocks/text {"uniqueId":"2399c217","tagName":"a","styles":{"display":"inline-flex","paddingTop":"0.4rem","paddingRight":"0.9rem","paddingBottom":"0.4rem","paddingLeft":"0.9rem","borderTopLeftRadius":"999px","borderTopRightRadius":"999px","borderBottomRightRadius":"999px","borderBottomLeftRadius":"999px","backgroundColor":"var(\u002d\u002dbase-3, #ffffff)","color":"var(\u002d\u002daccent, #1e73be)","fontWeight":"600","fontSize":"0.875rem","textDecoration":"none","\u0026:is(:hover, :focus)":{"backgroundColor":"var(\u002d\u002dbase-2, #f7f8f9)","color":"var(\u002d\u002daccent, #1e73be)"}},"css":".gb-text-2399c217{background-color:var(\u002d\u002dbase-3,#ffffff);color:var(\u002d\u002daccent,#1e73be);display:inline-flex;font-size:0.875rem;font-weight:600;text-decoration:none;border-radius:999px;padding:0.4rem 0.9rem}.gb-text-2399c217:is(:hover,:focus){background-color:var(\u002d\u002dbase-2,#f7f8f9);color:var(\u002d\u002daccent,#1e73be)}","htmlAttributes":{"href":"#"}} -->
<a class="gb-text gb-text-2399c217" href="#"><?php echo esc_html__( 'Shop the sale', 'thingamablocks' ); ?></a>
<!-- /wp:generateblocks/text --></section>
<!-- /wp:generateblocks/element -->
