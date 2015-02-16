

これは、Pickles 2 Desktop Tool のヘルプコンテンツです。

<?php
$children = $px->site()->get_children();
foreach( $children as $child ){
?>
- <?php print $px->mk_link( $child ); ?>
<?php
}
?>
