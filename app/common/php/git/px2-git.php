<?php

require_once(__DIR__.'/../../../../vendor/autoload.php');
require_once(__DIR__.'/px2-git-copy.php');

class px2git{
	/** px2-git object */
	private $px2git;

	/** method */
	private $method;

	/** entryScript path */
	private $entryScript;

	/**
	 * constructor
	 */
	public function __construct(){
		// var_dump($_SERVER['argv']);
		$count = count($_SERVER['argv']);
		// var_dump($count);
		$count = $count-1;
		// var_dump($count);
		$arg = $_SERVER['argv'][$count];
		$arg = base64_decode( $arg );
		$arg = json_decode( $arg );
		// var_dump($arg);

		$this->entryScript = $arg->entryScript;
		$this->method = $arg->method;
		$this->px2git = new \tomk79\pickles2\git_copy\main( $this->entryScript );
	}

	/**
	 * px2-git を実行する
	 * @return void no return.
	 */
	public function execute(){
		$result = '';
		switch( $this->method ){
			case 'status':
			case 'status_sitemap':
			case 'commit_sitemap':
				$result = $this->px2git->{$this->method}();
				return $result;
				break;
		}
		return $result;
	}
}



$obj = new px2git();
$rtn = $obj->execute();
@header('Content-type: application/json');
print json_encode($rtn);
exit();
