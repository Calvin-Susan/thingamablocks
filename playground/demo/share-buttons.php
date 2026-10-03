<?php
/**
 * Demo section: share buttons for the page (Icons layout).
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
<!-- wp:thingamablocks/share -->
<!-- wp:generateblocks/element {"uniqueId":"bb20ac93","tagName":"div","globalClasses":["tmb-share__row"],"metadata":{"name":"Row"}} -->
<div class="tmb-share__row"><!-- wp:generateblocks/text {"uniqueId":"f2ef4975","tagName":"p","globalClasses":["tmb-share__label"],"htmlAttributes":{"data-share-part":"label"},"metadata":{"name":"Label"}} -->
<p class="gb-text tmb-share__label" data-share-part="label"><?php echo esc_html__( 'Share:', 'thingamablocks' ); ?></p>
<!-- /wp:generateblocks/text -->

<!-- wp:generateblocks/element {"uniqueId":"be5f39f8","tagName":"ul","globalClasses":["tmb-share__list"],"htmlAttributes":{"data-share-part":"list"},"metadata":{"name":"Buttons"}} -->
<ul class="tmb-share__list" data-share-part="list"><!-- wp:generateblocks/element {"uniqueId":"015f2f83","tagName":"li","globalClasses":["tmb-share__item"],"metadata":{"name":"X"}} -->
<li class="tmb-share__item"><!-- wp:generateblocks/text {"uniqueId":"e9cca646","tagName":"a","globalClasses":["tmb-share__button"],"htmlAttributes":{"data-share-network":"x","href":"#"},"iconOnly":true,"metadata":{"name":"Button"}} -->
<a class="tmb-share__button" data-share-network="x" href="#"><span class="gb-shape"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"></path></svg></span></a>
<!-- /wp:generateblocks/text --></li>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"82dc19ff","tagName":"li","globalClasses":["tmb-share__item"],"metadata":{"name":"LinkedIn"}} -->
<li class="tmb-share__item"><!-- wp:generateblocks/text {"uniqueId":"20c86914","tagName":"a","globalClasses":["tmb-share__button"],"htmlAttributes":{"data-share-network":"linkedin","href":"#"},"iconOnly":true,"metadata":{"name":"Button"}} -->
<a class="tmb-share__button" data-share-network="linkedin" href="#"><span class="gb-shape"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg></span></a>
<!-- /wp:generateblocks/text --></li>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"78cb6bd5","tagName":"li","globalClasses":["tmb-share__item"],"metadata":{"name":"Facebook"}} -->
<li class="tmb-share__item"><!-- wp:generateblocks/text {"uniqueId":"bde82b9a","tagName":"a","globalClasses":["tmb-share__button"],"htmlAttributes":{"data-share-network":"facebook","href":"#"},"iconOnly":true,"metadata":{"name":"Button"}} -->
<a class="tmb-share__button" data-share-network="facebook" href="#"><span class="gb-shape"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"></path></svg></span></a>
<!-- /wp:generateblocks/text --></li>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"8a5b2bc8","tagName":"li","globalClasses":["tmb-share__item"],"metadata":{"name":"Email"}} -->
<li class="tmb-share__item"><!-- wp:generateblocks/text {"uniqueId":"e18b57bd","tagName":"a","globalClasses":["tmb-share__button"],"htmlAttributes":{"data-share-network":"email","href":"#"},"iconOnly":true,"metadata":{"name":"Button"}} -->
<a class="tmb-share__button" data-share-network="email" href="#"><span class="gb-shape"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M2.25 4.5h19.5c.69 0 1.25.56 1.25 1.25v12.5c0 .69-.56 1.25-1.25 1.25H2.25C1.56 19.5 1 18.94 1 18.25V5.75c0-.69.56-1.25 1.25-1.25Zm.75 2.72v10.28h18V7.22l-8.52 5.9a.85.85 0 0 1-.96 0L3 7.22Zm17.1-.72H3.9L12 11.35 20.1 6.5Z"></path></svg></span></a>
<!-- /wp:generateblocks/text --></li>
<!-- /wp:generateblocks/element -->

<!-- wp:generateblocks/element {"uniqueId":"b120cbdf","tagName":"li","globalClasses":["tmb-share__item"],"metadata":{"name":"Copy link"}} -->
<li class="tmb-share__item"><!-- wp:generateblocks/text {"uniqueId":"7736cba2","tagName":"button","globalClasses":["tmb-share__button"],"htmlAttributes":{"data-share-network":"copy"},"iconOnly":true,"metadata":{"name":"Button"}} -->
<button class="tmb-share__button" data-share-network="copy"><span class="gb-shape"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M9.47 14.53a.75.75 0 0 1 0-1.06l4-4a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0Zm-.53 2.65-1.77 1.77a2.62 2.62 0 0 1-3.71-3.71l1.77-1.77a.75.75 0 1 0-1.06-1.06l-1.77 1.77a4.12 4.12 0 1 0 5.83 5.83l1.77-1.77a.75.75 0 0 0-1.06-1.06ZM20.6 3.4a4.12 4.12 0 0 0-5.83 0l-1.77 1.77a.75.75 0 0 0 1.06 1.06l1.77-1.77a2.62 2.62 0 0 1 3.71 3.71l-1.77 1.77a.75.75 0 1 0 1.06 1.06l1.77-1.77a4.12 4.12 0 0 0 0-5.83Z"></path></svg></span></button>
<!-- /wp:generateblocks/text --></li>
<!-- /wp:generateblocks/element --></ul>
<!-- /wp:generateblocks/element --></div>
<!-- /wp:generateblocks/element -->
<!-- /wp:thingamablocks/share -->