<?php

require_once(__DIR__.'/../../../../vendor/autoload.php');

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
		$this->px2git = new tomk79\pickles2\git\main( $this->entryScript );
	}

	/**
	 * px2-git を実行する
	 * @return void no return.
	 */
	public function execute(){
		switch( $this->method ){
			case 'commit_sitemap':
				$this->px2git->commit_sitemap();
				break;
		}
		return;
	}
}



$obj = new px2git();
$obj->execute();
exit();
