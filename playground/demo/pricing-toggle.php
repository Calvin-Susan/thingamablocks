<?php
/**
 * Demo section: pricing table with a monthly/annual toggle.
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
<!-- wp:generateblocks/element {"uniqueId":"1991a3d6","tagName":"section","styles":{"display":"flex","flexDirection":"column","alignItems":"center","rowGap":"2rem","paddingTop":"4rem","paddingRight":"1.5rem","paddingBottom":"4rem","paddingLeft":"1.5rem"},"css":".gb-element-1991a3d6{align-items:center;display:flex;flex-direction:column;row-gap:2rem;padding:4rem 1.5rem}"} -->
<section class="gb-element-1991a3d6"><!-- wp:generateblocks/element {"uniqueId":"542ca7c1","tagName":"div","styles":{"textAlign":"center","maxWidth":"40rem"},"css":".gb-element-542ca7c1{max-width:40rem;text-align:center}"} -->
<div class="gb-element-542ca7c1"><!-- wp:generateblocks/text {"uniqueId":"4455ed0b","tagName":"h2","styles":{"marginBottom":"0.5rem"},"css":".gb-text-4455ed0b{margin-bottom:0.5rem}"} -->
<h2 class="gb-text gb-text-4455ed0b"><?php echo esc_html__( 'Simple, honest pricing', 'thingamablocks' ); ?></h2>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"3bb6e105","tagName":"p","styles":{"color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"0"},"css":".gb-text-3bb6e105{color:var(\u002d\u002dcontrast-2,#575760);margin-bottom:0}"} -->
<p class="gb-text gb-text-3bb6e105"><?php echo esc_html__( 'Pick a plan. Switch to annual billing and get two months free.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element -->

<!-- wp:thingamablocks/toggle {"group":"billing","ariaLabel":"<?php echo thingamablocks_pattern_json_string( __( 'Billing period', 'thingamablocks' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON-encoded. ?>","showWhenOff":["pricing-monthly"],"showWhenOn":["pricing-annual"]} -->
<!-- wp:generateblocks/element {"uniqueId":"079154d0","tagName":"div","styles":{"display":"inline-flex","alignItems":"center","columnGap":"0.25rem","paddingTop":"0.25rem","paddingRight":"0.25rem","paddingBottom":"0.25rem","paddingLeft":"0.25rem","borderTopLeftRadius":"999px","borderTopRightRadius":"999px","borderBottomRightRadius":"999px","borderBottomLeftRadius":"999px","borderTopWidth":"1px","borderRightWidth":"1px","borderBottomWidth":"1px","borderLeftWidth":"1px","borderTopStyle":"solid","borderRightStyle":"solid","borderBottomStyle":"solid","borderLeftStyle":"solid","borderTopColor":"var(\u002d\u002dbase, #f0f0f0)","borderRightColor":"var(\u002d\u002dbase, #f0f0f0)","borderBottomColor":"var(\u002d\u002dbase, #f0f0f0)","borderLeftColor":"var(\u002d\u002dbase, #f0f0f0)","backgroundColor":"var(\u002d\u002dbase-2, #f7f8f9)"},"css":".gb-element-079154d0{align-items:center;background-color:var(\u002d\u002dbase-2,#f7f8f9);column-gap:0.25rem;display:inline-flex;border:1px solid var(\u002d\u002dbase,#f0f0f0);border-radius:999px;padding:0.25rem}","htmlAttributes":{"role":"group"}} -->
<div class="gb-element-079154d0" role="group"><!-- wp:generateblocks/text {"uniqueId":"468f498d","tagName":"button","styles":{"paddingTop":"0.5em","paddingRight":"1.25em","paddingBottom":"0.5em","paddingLeft":"1.25em","borderTopLeftRadius":"999px","borderTopRightRadius":"999px","borderBottomRightRadius":"999px","borderBottomLeftRadius":"999px","borderTopWidth":"0","borderRightWidth":"0","borderBottomWidth":"0","borderLeftWidth":"0","borderTopStyle":"none","borderRightStyle":"none","borderBottomStyle":"none","borderLeftStyle":"none","borderTopColor":"transparent","borderRightColor":"transparent","borderBottomColor":"transparent","borderLeftColor":"transparent","backgroundColor":"transparent","color":"var(\u002d\u002dcontrast-2, #575760)","fontSize":"0.9375rem","fontWeight":"600","lineHeight":"1.2","cursor":"pointer","transition":"background-color 0.2s ease, color 0.2s ease","\u0026:hover":{"backgroundColor":"var(\u002d\u002dbase, #f0f0f0)","color":"var(\u002d\u002dcontrast, #222222)"},"\u0026[data-active=\u0022true\u0022], \u0026[data-active=\u0022true\u0022]:hover":{"backgroundColor":"var(\u002d\u002daccent, #1e73be)","color":"var(\u002d\u002dbase-3, #ffffff)"},"\u0026:focus-visible":{"outlineWidth":"2px","outlineStyle":"solid","outlineColor":"var(\u002d\u002daccent, #1e73be)","outlineOffset":"3px"}},"css":".gb-text-468f498d{background-color:transparent;color:var(\u002d\u002dcontrast-2,#575760);cursor:pointer;font-size:0.9375rem;font-weight:600;line-height:1.2;transition:background-color 0.2s ease,color 0.2s ease;border:0 none transparent;border-radius:999px;padding:0.5em 1.25em}.gb-text-468f498d:focus-visible{outline-color:var(\u002d\u002daccent,#1e73be);outline-offset:3px;outline-style:solid;outline-width:2px}.gb-text-468f498d:hover{background-color:var(\u002d\u002dbase,#f0f0f0);color:var(\u002d\u002dcontrast,#222222)}.gb-text-468f498d[data-active=\u0022true\u0022],.gb-text-468f498d[data-active=\u0022true\u0022]:hover{background-color:var(\u002d\u002daccent,#1e73be);color:var(\u002d\u002dbase-3,#ffffff)}","htmlAttributes":{"data-toggle-part":"off","type":"button","data-active":"true","aria-pressed":"true"}} -->
<button class="gb-text gb-text-468f498d" data-toggle-part="off" type="button" data-active="true" aria-pressed="true"><?php echo esc_html__( 'Monthly', 'thingamablocks' ); ?></button>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"adb42397","tagName":"button","styles":{"paddingTop":"0.5em","paddingRight":"1.25em","paddingBottom":"0.5em","paddingLeft":"1.25em","borderTopLeftRadius":"999px","borderTopRightRadius":"999px","borderBottomRightRadius":"999px","borderBottomLeftRadius":"999px","borderTopWidth":"0","borderRightWidth":"0","borderBottomWidth":"0","borderLeftWidth":"0","borderTopStyle":"none","borderRightStyle":"none","borderBottomStyle":"none","borderLeftStyle":"none","borderTopColor":"transparent","borderRightColor":"transparent","borderBottomColor":"transparent","borderLeftColor":"transparent","backgroundColor":"transparent","color":"var(\u002d\u002dcontrast-2, #575760)","fontSize":"0.9375rem","fontWeight":"600","lineHeight":"1.2","cursor":"pointer","transition":"background-color 0.2s ease, color 0.2s ease","\u0026:hover":{"backgroundColor":"var(\u002d\u002dbase, #f0f0f0)","color":"var(\u002d\u002dcontrast, #222222)"},"\u0026[data-active=\u0022true\u0022], \u0026[data-active=\u0022true\u0022]:hover":{"backgroundColor":"var(\u002d\u002daccent, #1e73be)","color":"var(\u002d\u002dbase-3, #ffffff)"},"\u0026:focus-visible":{"outlineWidth":"2px","outlineStyle":"solid","outlineColor":"var(\u002d\u002daccent, #1e73be)","outlineOffset":"3px"}},"css":".gb-text-adb42397{background-color:transparent;color:var(\u002d\u002dcontrast-2,#575760);cursor:pointer;font-size:0.9375rem;font-weight:600;line-height:1.2;transition:background-color 0.2s ease,color 0.2s ease;border:0 none transparent;border-radius:999px;padding:0.5em 1.25em}.gb-text-adb42397:focus-visible{outline-color:var(\u002d\u002daccent,#1e73be);outline-offset:3px;outline-style:solid;outline-width:2px}.gb-text-adb42397:hover{background-color:var(\u002d\u002dbase,#f0f0f0);color:var(\u002d\u002dcontrast,#222222)}.gb-text-adb42397[data-active=\u0022true\u0022],.gb-text-adb42397[data-active=\u0022true\u0022]:hover{background-color:var(\u002d\u002daccent,#1e73be);color:var(\u002d\u002dbase-3,#ffffff)}","htmlAttributes":{"data-toggle-part":"on","type":"button","data-active":"false","aria-pressed":"false"}} -->
<button class="gb-text gb-text-adb42397" data-toggle-part="on" type="button" data-active="false" aria-pressed="false"><?php echo esc_html__( 'Annual', 'thingamablocks' ); ?></button>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element -->
<!-- /wp:thingamablocks/toggle -->

<!-- wp:generateblocks/element {"uniqueId":"59cab578","tagName":"div","styles":{"width":"100%","maxWidth":"64rem"},"css":".gb-element-59cab578{max-width:64rem;width:100%}"} -->
<div class="gb-element-59cab578"><!-- wp:generateblocks/element {"uniqueId":"928c09e9","tagName":"div","styles":{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(15rem, 1fr))","columnGap":"1.5rem","rowGap":"1.5rem"},"css":".gb-element-928c09e9{column-gap:1.5rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));row-gap:1.5rem}","htmlAttributes":{"id":"pricing-monthly"}} -->
<div class="gb-element-928c09e9" id="pricing-monthly"><!-- wp:generateblocks/element {"uniqueId":"f93322fd","tagName":"div","styles":{"display":"flex","flexDirection":"column","rowGap":"0.75rem","paddingTop":"2rem","paddingRight":"2rem","paddingBottom":"2rem","paddingLeft":"2rem","borderTopLeftRadius":"0.75rem","borderTopRightRadius":"0.75rem","borderBottomRightRadius":"0.75rem","borderBottomLeftRadius":"0.75rem","borderTopWidth":"1px","borderRightWidth":"1px","borderBottomWidth":"1px","borderLeftWidth":"1px","borderTopStyle":"solid","borderRightStyle":"solid","borderBottomStyle":"solid","borderLeftStyle":"solid","borderTopColor":"var(\u002d\u002dbase, #f0f0f0)","borderRightColor":"var(\u002d\u002dbase, #f0f0f0)","borderBottomColor":"var(\u002d\u002dbase, #f0f0f0)","borderLeftColor":"var(\u002d\u002dbase, #f0f0f0)","backgroundColor":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-element-f93322fd{background-color:var(\u002d\u002dbase-3,#ffffff);display:flex;flex-direction:column;row-gap:0.75rem;border:1px solid var(\u002d\u002dbase,#f0f0f0);border-radius:0.75rem;padding:2rem}"} -->
<div class="gb-element-f93322fd"><!-- wp:generateblocks/text {"uniqueId":"65b66613","tagName":"h3","styles":{"fontSize":"1.25rem","marginBottom":"0"},"css":".gb-text-65b66613{font-size:1.25rem;margin-bottom:0}"} -->
<h3 class="gb-text gb-text-65b66613"><?php echo esc_html__( 'Starter', 'thingamablocks' ); ?></h3>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"c54007a1","tagName":"p","styles":{"color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"0.5rem"},"css":".gb-text-c54007a1{color:var(\u002d\u002dcontrast-2,#575760);margin-bottom:0.5rem}"} -->
<p class="gb-text gb-text-c54007a1"><?php echo esc_html__( 'Everything you need to get going.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"88ef931c","tagName":"p","styles":{"fontSize":"2.5rem","fontWeight":"700","lineHeight":"1","marginBottom":"0",".price-period":{"fontSize":"1rem","fontWeight":"400","color":"var(\u002d\u002dcontrast-2, #575760)"}},"css":".gb-text-88ef931c{font-size:2.5rem;font-weight:700;line-height:1;margin-bottom:0}.gb-text-88ef931c .price-period{color:var(\u002d\u002dcontrast-2,#575760);font-size:1rem;font-weight:400}"} -->
<p class="gb-text gb-text-88ef931c">$19<span class="price-period"> <?php echo esc_html__( '/ month', 'thingamablocks' ); ?></span></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"597e9425","tagName":"p","styles":{"fontSize":"0.875rem","color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"1rem"},"css":".gb-text-597e9425{color:var(\u002d\u002dcontrast-2,#575760);font-size:0.875rem;margin-bottom:1rem}"} -->
<p class="gb-text gb-text-597e9425"><?php echo esc_html__( 'Billed monthly. Cancel any time.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"f69d285f","tagName":"a","styles":{"display":"inline-flex","justifyContent":"center","marginTop":"auto","paddingTop":"0.75rem","paddingRight":"1.25rem","paddingBottom":"0.75rem","paddingLeft":"1.25rem","borderTopLeftRadius":"0.375rem","borderTopRightRadius":"0.375rem","borderBottomRightRadius":"0.375rem","borderBottomLeftRadius":"0.375rem","backgroundColor":"var(\u002d\u002dcontrast, #222222)","color":"var(\u002d\u002dbase-3, #ffffff)","textDecoration":"none","fontWeight":"600","\u0026:is(:hover, :focus)":{"opacity":"0.9","color":"var(\u002d\u002dbase-3, #ffffff)"}},"css":".gb-text-f69d285f{background-color:var(\u002d\u002dcontrast,#222222);color:var(\u002d\u002dbase-3,#ffffff);display:inline-flex;font-weight:600;justify-content:center;margin-top:auto;text-decoration:none;border-radius:0.375rem;padding:0.75rem 1.25rem}.gb-text-f69d285f:is(:hover,:focus){color:var(\u002d\u002dbase-3,#ffffff);opacity:0.9}","htmlAttributes":{"href":"#"}} -->
<a class="gb-text gb-text-f69d285f" href="#"><?php echo esc_html__( 'Choose Starter', 'thingamablocks' ); ?></a>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"a06dac57","tagName":"div","styles":{"display":"flex","flexDirection":"column","rowGap":"0.75rem","paddingTop":"2rem","paddingRight":"2rem","paddingBottom":"2rem","paddingLeft":"2rem","borderTopLeftRadius":"0.75rem","borderTopRightRadius":"0.75rem","borderBottomRightRadius":"0.75rem","borderBottomLeftRadius":"0.75rem","borderTopWidth":"2px","borderRightWidth":"2px","borderBottomWidth":"2px","borderLeftWidth":"2px","borderTopStyle":"solid","borderRightStyle":"solid","borderBottomStyle":"solid","borderLeftStyle":"solid","borderTopColor":"var(\u002d\u002daccent, #1e73be)","borderRightColor":"var(\u002d\u002daccent, #1e73be)","borderBottomColor":"var(\u002d\u002daccent, #1e73be)","borderLeftColor":"var(\u002d\u002daccent, #1e73be)","backgroundColor":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-element-a06dac57{background-color:var(\u002d\u002dbase-3,#ffffff);display:flex;flex-direction:column;row-gap:0.75rem;border:2px solid var(\u002d\u002daccent,#1e73be);border-radius:0.75rem;padding:2rem}"} -->
<div class="gb-element-a06dac57"><!-- wp:generateblocks/text {"uniqueId":"f0961ac9","tagName":"h3","styles":{"fontSize":"1.25rem","marginBottom":"0"},"css":".gb-text-f0961ac9{font-size:1.25rem;margin-bottom:0}"} -->
<h3 class="gb-text gb-text-f0961ac9"><?php echo esc_html__( 'Pro', 'thingamablocks' ); ?></h3>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"bd6543f2","tagName":"p","styles":{"color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"0.5rem"},"css":".gb-text-bd6543f2{color:var(\u002d\u002dcontrast-2,#575760);margin-bottom:0.5rem}"} -->
<p class="gb-text gb-text-bd6543f2"><?php echo esc_html__( 'For growing teams that need more.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"d210ca39","tagName":"p","styles":{"fontSize":"2.5rem","fontWeight":"700","lineHeight":"1","marginBottom":"0",".price-period":{"fontSize":"1rem","fontWeight":"400","color":"var(\u002d\u002dcontrast-2, #575760)"}},"css":".gb-text-d210ca39{font-size:2.5rem;font-weight:700;line-height:1;margin-bottom:0}.gb-text-d210ca39 .price-period{color:var(\u002d\u002dcontrast-2,#575760);font-size:1rem;font-weight:400}"} -->
<p class="gb-text gb-text-d210ca39">$49<span class="price-period"> <?php echo esc_html__( '/ month', 'thingamablocks' ); ?></span></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"9e399701","tagName":"p","styles":{"fontSize":"0.875rem","color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"1rem"},"css":".gb-text-9e399701{color:var(\u002d\u002dcontrast-2,#575760);font-size:0.875rem;margin-bottom:1rem}"} -->
<p class="gb-text gb-text-9e399701"><?php echo esc_html__( 'Billed monthly. Cancel any time.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"299f9ff5","tagName":"a","styles":{"display":"inline-flex","justifyContent":"center","marginTop":"auto","paddingTop":"0.75rem","paddingRight":"1.25rem","paddingBottom":"0.75rem","paddingLeft":"1.25rem","borderTopLeftRadius":"0.375rem","borderTopRightRadius":"0.375rem","borderBottomRightRadius":"0.375rem","borderBottomLeftRadius":"0.375rem","backgroundColor":"var(\u002d\u002daccent, #1e73be)","color":"var(\u002d\u002dbase-3, #ffffff)","textDecoration":"none","fontWeight":"600","\u0026:is(:hover, :focus)":{"opacity":"0.9","color":"var(\u002d\u002dbase-3, #ffffff)"}},"css":".gb-text-299f9ff5{background-color:var(\u002d\u002daccent,#1e73be);color:var(\u002d\u002dbase-3,#ffffff);display:inline-flex;font-weight:600;justify-content:center;margin-top:auto;text-decoration:none;border-radius:0.375rem;padding:0.75rem 1.25rem}.gb-text-299f9ff5:is(:hover,:focus){color:var(\u002d\u002dbase-3,#ffffff);opacity:0.9}","htmlAttributes":{"href":"#"}} -->
<a class="gb-text gb-text-299f9ff5" href="#"><?php echo esc_html__( 'Choose Pro', 'thingamablocks' ); ?></a>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"d183539f","tagName":"div","styles":{"display":"flex","flexDirection":"column","rowGap":"0.75rem","paddingTop":"2rem","paddingRight":"2rem","paddingBottom":"2rem","paddingLeft":"2rem","borderTopLeftRadius":"0.75rem","borderTopRightRadius":"0.75rem","borderBottomRightRadius":"0.75rem","borderBottomLeftRadius":"0.75rem","borderTopWidth":"1px","borderRightWidth":"1px","borderBottomWidth":"1px","borderLeftWidth":"1px","borderTopStyle":"solid","borderRightStyle":"solid","borderBottomStyle":"solid","borderLeftStyle":"solid","borderTopColor":"var(\u002d\u002dbase, #f0f0f0)","borderRightColor":"var(\u002d\u002dbase, #f0f0f0)","borderBottomColor":"var(\u002d\u002dbase, #f0f0f0)","borderLeftColor":"var(\u002d\u002dbase, #f0f0f0)","backgroundColor":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-element-d183539f{background-color:var(\u002d\u002dbase-3,#ffffff);display:flex;flex-direction:column;row-gap:0.75rem;border:1px solid var(\u002d\u002dbase,#f0f0f0);border-radius:0.75rem;padding:2rem}"} -->
<div class="gb-element-d183539f"><!-- wp:generateblocks/text {"uniqueId":"d26ef27a","tagName":"h3","styles":{"fontSize":"1.25rem","marginBottom":"0"},"css":".gb-text-d26ef27a{font-size:1.25rem;margin-bottom:0}"} -->
<h3 class="gb-text gb-text-d26ef27a"><?php echo esc_html__( 'Business', 'thingamablocks' ); ?></h3>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"9702d05d","tagName":"p","styles":{"color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"0.5rem"},"css":".gb-text-9702d05d{color:var(\u002d\u002dcontrast-2,#575760);margin-bottom:0.5rem}"} -->
<p class="gb-text gb-text-9702d05d"><?php echo esc_html__( 'Advanced controls and priority support.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"a5ae2ea4","tagName":"p","styles":{"fontSize":"2.5rem","fontWeight":"700","lineHeight":"1","marginBottom":"0",".price-period":{"fontSize":"1rem","fontWeight":"400","color":"var(\u002d\u002dcontrast-2, #575760)"}},"css":".gb-text-a5ae2ea4{font-size:2.5rem;font-weight:700;line-height:1;margin-bottom:0}.gb-text-a5ae2ea4 .price-period{color:var(\u002d\u002dcontrast-2,#575760);font-size:1rem;font-weight:400}"} -->
<p class="gb-text gb-text-a5ae2ea4">$99<span class="price-period"> <?php echo esc_html__( '/ month', 'thingamablocks' ); ?></span></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"083fb492","tagName":"p","styles":{"fontSize":"0.875rem","color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"1rem"},"css":".gb-text-083fb492{color:var(\u002d\u002dcontrast-2,#575760);font-size:0.875rem;margin-bottom:1rem}"} -->
<p class="gb-text gb-text-083fb492"><?php echo esc_html__( 'Billed monthly. Cancel any time.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"3d6c1e33","tagName":"a","styles":{"display":"inline-flex","justifyContent":"center","marginTop":"auto","paddingTop":"0.75rem","paddingRight":"1.25rem","paddingBottom":"0.75rem","paddingLeft":"1.25rem","borderTopLeftRadius":"0.375rem","borderTopRightRadius":"0.375rem","borderBottomRightRadius":"0.375rem","borderBottomLeftRadius":"0.375rem","backgroundColor":"var(\u002d\u002dcontrast, #222222)","color":"var(\u002d\u002dbase-3, #ffffff)","textDecoration":"none","fontWeight":"600","\u0026:is(:hover, :focus)":{"opacity":"0.9","color":"var(\u002d\u002dbase-3, #ffffff)"}},"css":".gb-text-3d6c1e33{background-color:var(\u002d\u002dcontrast,#222222);color:var(\u002d\u002dbase-3,#ffffff);display:inline-flex;font-weight:600;justify-content:center;margin-top:auto;text-decoration:none;border-radius:0.375rem;padding:0.75rem 1.25rem}.gb-text-3d6c1e33:is(:hover,:focus){color:var(\u002d\u002dbase-3,#ffffff);opacity:0.9}","htmlAttributes":{"href":"#"}} -->
<a class="gb-text gb-text-3d6c1e33" href="#"><?php echo esc_html__( 'Choose Business', 'thingamablocks' ); ?></a>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element --></div>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"f0d62cc1","tagName":"div","styles":{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(15rem, 1fr))","columnGap":"1.5rem","rowGap":"1.5rem"},"css":".gb-element-f0d62cc1{column-gap:1.5rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));row-gap:1.5rem}","htmlAttributes":{"id":"pricing-annual"}} -->
<div class="gb-element-f0d62cc1" id="pricing-annual"><!-- wp:generateblocks/element {"uniqueId":"e839d772","tagName":"div","styles":{"display":"flex","flexDirection":"column","rowGap":"0.75rem","paddingTop":"2rem","paddingRight":"2rem","paddingBottom":"2rem","paddingLeft":"2rem","borderTopLeftRadius":"0.75rem","borderTopRightRadius":"0.75rem","borderBottomRightRadius":"0.75rem","borderBottomLeftRadius":"0.75rem","borderTopWidth":"1px","borderRightWidth":"1px","borderBottomWidth":"1px","borderLeftWidth":"1px","borderTopStyle":"solid","borderRightStyle":"solid","borderBottomStyle":"solid","borderLeftStyle":"solid","borderTopColor":"var(\u002d\u002dbase, #f0f0f0)","borderRightColor":"var(\u002d\u002dbase, #f0f0f0)","borderBottomColor":"var(\u002d\u002dbase, #f0f0f0)","borderLeftColor":"var(\u002d\u002dbase, #f0f0f0)","backgroundColor":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-element-e839d772{background-color:var(\u002d\u002dbase-3,#ffffff);display:flex;flex-direction:column;row-gap:0.75rem;border:1px solid var(\u002d\u002dbase,#f0f0f0);border-radius:0.75rem;padding:2rem}"} -->
<div class="gb-element-e839d772"><!-- wp:generateblocks/text {"uniqueId":"dc8e37b9","tagName":"h3","styles":{"fontSize":"1.25rem","marginBottom":"0"},"css":".gb-text-dc8e37b9{font-size:1.25rem;margin-bottom:0}"} -->
<h3 class="gb-text gb-text-dc8e37b9"><?php echo esc_html__( 'Starter', 'thingamablocks' ); ?></h3>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"3a142a65","tagName":"p","styles":{"color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"0.5rem"},"css":".gb-text-3a142a65{color:var(\u002d\u002dcontrast-2,#575760);margin-bottom:0.5rem}"} -->
<p class="gb-text gb-text-3a142a65"><?php echo esc_html__( 'Everything you need to get going.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"bf9cec55","tagName":"p","styles":{"fontSize":"2.5rem","fontWeight":"700","lineHeight":"1","marginBottom":"0",".price-period":{"fontSize":"1rem","fontWeight":"400","color":"var(\u002d\u002dcontrast-2, #575760)"}},"css":".gb-text-bf9cec55{font-size:2.5rem;font-weight:700;line-height:1;margin-bottom:0}.gb-text-bf9cec55 .price-period{color:var(\u002d\u002dcontrast-2,#575760);font-size:1rem;font-weight:400}"} -->
<p class="gb-text gb-text-bf9cec55">$190<span class="price-period"> <?php echo esc_html__( '/ year', 'thingamablocks' ); ?></span></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"8cff8c63","tagName":"p","styles":{"fontSize":"0.875rem","color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"1rem"},"css":".gb-text-8cff8c63{color:var(\u002d\u002dcontrast-2,#575760);font-size:0.875rem;margin-bottom:1rem}"} -->
<p class="gb-text gb-text-8cff8c63"><?php echo esc_html__( 'Two months free, billed yearly.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"e0435c79","tagName":"a","styles":{"display":"inline-flex","justifyContent":"center","marginTop":"auto","paddingTop":"0.75rem","paddingRight":"1.25rem","paddingBottom":"0.75rem","paddingLeft":"1.25rem","borderTopLeftRadius":"0.375rem","borderTopRightRadius":"0.375rem","borderBottomRightRadius":"0.375rem","borderBottomLeftRadius":"0.375rem","backgroundColor":"var(\u002d\u002dcontrast, #222222)","color":"var(\u002d\u002dbase-3, #ffffff)","textDecoration":"none","fontWeight":"600","\u0026:is(:hover, :focus)":{"opacity":"0.9","color":"var(\u002d\u002dbase-3, #ffffff)"}},"css":".gb-text-e0435c79{background-color:var(\u002d\u002dcontrast,#222222);color:var(\u002d\u002dbase-3,#ffffff);display:inline-flex;font-weight:600;justify-content:center;margin-top:auto;text-decoration:none;border-radius:0.375rem;padding:0.75rem 1.25rem}.gb-text-e0435c79:is(:hover,:focus){color:var(\u002d\u002dbase-3,#ffffff);opacity:0.9}","htmlAttributes":{"href":"#"}} -->
<a class="gb-text gb-text-e0435c79" href="#"><?php echo esc_html__( 'Choose Starter', 'thingamablocks' ); ?></a>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"2d7e0a75","tagName":"div","styles":{"display":"flex","flexDirection":"column","rowGap":"0.75rem","paddingTop":"2rem","paddingRight":"2rem","paddingBottom":"2rem","paddingLeft":"2rem","borderTopLeftRadius":"0.75rem","borderTopRightRadius":"0.75rem","borderBottomRightRadius":"0.75rem","borderBottomLeftRadius":"0.75rem","borderTopWidth":"2px","borderRightWidth":"2px","borderBottomWidth":"2px","borderLeftWidth":"2px","borderTopStyle":"solid","borderRightStyle":"solid","borderBottomStyle":"solid","borderLeftStyle":"solid","borderTopColor":"var(\u002d\u002daccent, #1e73be)","borderRightColor":"var(\u002d\u002daccent, #1e73be)","borderBottomColor":"var(\u002d\u002daccent, #1e73be)","borderLeftColor":"var(\u002d\u002daccent, #1e73be)","backgroundColor":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-element-2d7e0a75{background-color:var(\u002d\u002dbase-3,#ffffff);display:flex;flex-direction:column;row-gap:0.75rem;border:2px solid var(\u002d\u002daccent,#1e73be);border-radius:0.75rem;padding:2rem}"} -->
<div class="gb-element-2d7e0a75"><!-- wp:generateblocks/text {"uniqueId":"9d215a2c","tagName":"h3","styles":{"fontSize":"1.25rem","marginBottom":"0"},"css":".gb-text-9d215a2c{font-size:1.25rem;margin-bottom:0}"} -->
<h3 class="gb-text gb-text-9d215a2c"><?php echo esc_html__( 'Pro', 'thingamablocks' ); ?></h3>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"80287e63","tagName":"p","styles":{"color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"0.5rem"},"css":".gb-text-80287e63{color:var(\u002d\u002dcontrast-2,#575760);margin-bottom:0.5rem}"} -->
<p class="gb-text gb-text-80287e63"><?php echo esc_html__( 'For growing teams that need more.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"73966f85","tagName":"p","styles":{"fontSize":"2.5rem","fontWeight":"700","lineHeight":"1","marginBottom":"0",".price-period":{"fontSize":"1rem","fontWeight":"400","color":"var(\u002d\u002dcontrast-2, #575760)"}},"css":".gb-text-73966f85{font-size:2.5rem;font-weight:700;line-height:1;margin-bottom:0}.gb-text-73966f85 .price-period{color:var(\u002d\u002dcontrast-2,#575760);font-size:1rem;font-weight:400}"} -->
<p class="gb-text gb-text-73966f85">$490<span class="price-period"> <?php echo esc_html__( '/ year', 'thingamablocks' ); ?></span></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"a9e7ff24","tagName":"p","styles":{"fontSize":"0.875rem","color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"1rem"},"css":".gb-text-a9e7ff24{color:var(\u002d\u002dcontrast-2,#575760);font-size:0.875rem;margin-bottom:1rem}"} -->
<p class="gb-text gb-text-a9e7ff24"><?php echo esc_html__( 'Two months free, billed yearly.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"44a44cdf","tagName":"a","styles":{"display":"inline-flex","justifyContent":"center","marginTop":"auto","paddingTop":"0.75rem","paddingRight":"1.25rem","paddingBottom":"0.75rem","paddingLeft":"1.25rem","borderTopLeftRadius":"0.375rem","borderTopRightRadius":"0.375rem","borderBottomRightRadius":"0.375rem","borderBottomLeftRadius":"0.375rem","backgroundColor":"var(\u002d\u002daccent, #1e73be)","color":"var(\u002d\u002dbase-3, #ffffff)","textDecoration":"none","fontWeight":"600","\u0026:is(:hover, :focus)":{"opacity":"0.9","color":"var(\u002d\u002dbase-3, #ffffff)"}},"css":".gb-text-44a44cdf{background-color:var(\u002d\u002daccent,#1e73be);color:var(\u002d\u002dbase-3,#ffffff);display:inline-flex;font-weight:600;justify-content:center;margin-top:auto;text-decoration:none;border-radius:0.375rem;padding:0.75rem 1.25rem}.gb-text-44a44cdf:is(:hover,:focus){color:var(\u002d\u002dbase-3,#ffffff);opacity:0.9}","htmlAttributes":{"href":"#"}} -->
<a class="gb-text gb-text-44a44cdf" href="#"><?php echo esc_html__( 'Choose Pro', 'thingamablocks' ); ?></a>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"3e71fa49","tagName":"div","styles":{"display":"flex","flexDirection":"column","rowGap":"0.75rem","paddingTop":"2rem","paddingRight":"2rem","paddingBottom":"2rem","paddingLeft":"2rem","borderTopLeftRadius":"0.75rem","borderTopRightRadius":"0.75rem","borderBottomRightRadius":"0.75rem","borderBottomLeftRadius":"0.75rem","borderTopWidth":"1px","borderRightWidth":"1px","borderBottomWidth":"1px","borderLeftWidth":"1px","borderTopStyle":"solid","borderRightStyle":"solid","borderBottomStyle":"solid","borderLeftStyle":"solid","borderTopColor":"var(\u002d\u002dbase, #f0f0f0)","borderRightColor":"var(\u002d\u002dbase, #f0f0f0)","borderBottomColor":"var(\u002d\u002dbase, #f0f0f0)","borderLeftColor":"var(\u002d\u002dbase, #f0f0f0)","backgroundColor":"var(\u002d\u002dbase-3, #ffffff)"},"css":".gb-element-3e71fa49{background-color:var(\u002d\u002dbase-3,#ffffff);display:flex;flex-direction:column;row-gap:0.75rem;border:1px solid var(\u002d\u002dbase,#f0f0f0);border-radius:0.75rem;padding:2rem}"} -->
<div class="gb-element-3e71fa49"><!-- wp:generateblocks/text {"uniqueId":"78139668","tagName":"h3","styles":{"fontSize":"1.25rem","marginBottom":"0"},"css":".gb-text-78139668{font-size:1.25rem;margin-bottom:0}"} -->
<h3 class="gb-text gb-text-78139668"><?php echo esc_html__( 'Business', 'thingamablocks' ); ?></h3>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"f51ecae6","tagName":"p","styles":{"color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"0.5rem"},"css":".gb-text-f51ecae6{color:var(\u002d\u002dcontrast-2,#575760);margin-bottom:0.5rem}"} -->
<p class="gb-text gb-text-f51ecae6"><?php echo esc_html__( 'Advanced controls and priority support.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"f53da795","tagName":"p","styles":{"fontSize":"2.5rem","fontWeight":"700","lineHeight":"1","marginBottom":"0",".price-period":{"fontSize":"1rem","fontWeight":"400","color":"var(\u002d\u002dcontrast-2, #575760)"}},"css":".gb-text-f53da795{font-size:2.5rem;font-weight:700;line-height:1;margin-bottom:0}.gb-text-f53da795 .price-period{color:var(\u002d\u002dcontrast-2,#575760);font-size:1rem;font-weight:400}"} -->
<p class="gb-text gb-text-f53da795">$990<span class="price-period"> <?php echo esc_html__( '/ year', 'thingamablocks' ); ?></span></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"26cdc70a","tagName":"p","styles":{"fontSize":"0.875rem","color":"var(\u002d\u002dcontrast-2, #575760)","marginBottom":"1rem"},"css":".gb-text-26cdc70a{color:var(\u002d\u002dcontrast-2,#575760);font-size:0.875rem;margin-bottom:1rem}"} -->
<p class="gb-text gb-text-26cdc70a"><?php echo esc_html__( 'Two months free, billed yearly.', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/text {"uniqueId":"2262fb22","tagName":"a","styles":{"display":"inline-flex","justifyContent":"center","marginTop":"auto","paddingTop":"0.75rem","paddingRight":"1.25rem","paddingBottom":"0.75rem","paddingLeft":"1.25rem","borderTopLeftRadius":"0.375rem","borderTopRightRadius":"0.375rem","borderBottomRightRadius":"0.375rem","borderBottomLeftRadius":"0.375rem","backgroundColor":"var(\u002d\u002dcontrast, #222222)","color":"var(\u002d\u002dbase-3, #ffffff)","textDecoration":"none","fontWeight":"600","\u0026:is(:hover, :focus)":{"opacity":"0.9","color":"var(\u002d\u002dbase-3, #ffffff)"}},"css":".gb-text-2262fb22{background-color:var(\u002d\u002dcontrast,#222222);color:var(\u002d\u002dbase-3,#ffffff);display:inline-flex;font-weight:600;justify-content:center;margin-top:auto;text-decoration:none;border-radius:0.375rem;padding:0.75rem 1.25rem}.gb-text-2262fb22:is(:hover,:focus){color:var(\u002d\u002dbase-3,#ffffff);opacity:0.9}","htmlAttributes":{"href":"#"}} -->
<a class="gb-text gb-text-2262fb22" href="#"><?php echo esc_html__( 'Choose Business', 'thingamablocks' ); ?></a>
<!-- /wp:generateblocks/text --></div>
<!-- /wp:generateblocks/element --></div>
<!-- /wp:generateblocks/element --></div>
<!-- /wp:generateblocks/element --></section>
<!-- /wp:generateblocks/element -->
