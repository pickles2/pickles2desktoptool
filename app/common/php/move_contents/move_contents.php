<?php

require_once(__DIR__.'/../../../../vendor/autoload.php');

if( !extension_loaded( 'mbstring' ) ){
	trigger_error('mbstring not loaded.');
}
if( is_callable('mb_internal_encoding') ){
	mb_internal_encoding('UTF-8');
	@ini_set( 'mbstring.internal_encoding' , 'UTF-8' );
	@ini_set( 'mbstring.http_input' , 'UTF-8' );
	@ini_set( 'mbstring.http_output' , 'UTF-8' );
}
@ini_set( 'default_charset' , 'UTF-8' );
if( is_callable('mb_detect_order') ){
	@ini_set( 'mbstring.detect_order' , 'UTF-8,SJIS-win,eucJP-win,SJIS,EUC-JP,JIS,ASCII' );
	mb_detect_order( 'UTF-8,SJIS-win,eucJP-win,SJIS,EUC-JP,JIS,ASCII' );
}
@header_remove('X-Powered-By');

$count = count($_SERVER['argv']);
$count = $count-1;
$arg = $_SERVER['argv'][$count];
$arg = base64_decode( $arg );
$arg = json_decode( $arg );

$px2moveContents = new tomk79\pickles2\moveContents\main($arg->entryScript, array(
	'php'=>array(
		'bin'=>$arg->php->bin,
		'ini'=>$arg->php->ini,
		'extension_dir'=>$arg->php->extension_dir
	)
));

echo "starting move contents..."."\n";
$result = $px2moveContents->run($arg->path_csv);
echo "done."."\n";
exit();
