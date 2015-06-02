


<?php
$children = $px->site()->get_children();
foreach( $children as $child ){
?>
- <?php print $px->mk_link( $child )."\n"; ?>
<?php
}
?>


