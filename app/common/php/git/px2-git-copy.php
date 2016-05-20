<?php
/**
 * px2-git
 */
// namespace tomk79\pickles2\git;
namespace tomk79\pickles2\git_copy;

/**
 * px2-git
 */
class main{

	private $git;
	private $req;
	private $command_php = 'php';
	private $path_entry_script;
	private $path_homedir;
	private $path_controot;
	private $path_docroot;
	private $path_git_home;

	/**
	 * constructor
	 *
	 * @param string $px Pickles 2 オブジェクト または entry_script のパス
	 * @param array $options オプション
	 */
	public function __construct( $px, $options = array() ){
		$this->fs = new \tomk79\filesystem();
		$this->git = new \PHPGit\Git();
		if( strlen($options['bin']) ){
			$this->git->setBin( $options['bin'] );
		}
		$this->req = new \tomk79\request();

		if( is_string($px) && is_file($px) ){
			$this->path_entry_script = $px;
			$this->command_php = 'php';
			$this->path_homedir = json_decode( $this->execute_px2('/?PX=api.get.path_homedir') );
			$this->path_controot = json_decode( $this->execute_px2('/?PX=api.get.path_controot') );
			$this->path_docroot = json_decode( $this->execute_px2('/?PX=api.get.path_docroot') );
		}elseif( is_object($px) ){
			$this->path_entry_script = $_SERVER['SCRIPT_FILENAME'];
			$this->command_php = $px->conf()->commands->php;
			$this->path_homedir = $px->get_path_homedir();
			$this->path_controot = $px->get_path_controot();
			$this->path_docroot = $px->get_path_docroot();
		}else{
			echo '[ERROR] px2-git gets illegal option.'."\n";
			echo __FILE__.' ('.__LINE__.')'."\n";
			exit(1);
		}

		// finding Repository path
		$base_path = $this->path_entry_script;
		while(1){
			if( @is_dir($base_path.'/.git/') ){
				$this->path_git_home = $base_path;
				break;
			}
			if( $base_path == dirname($base_path).'/' ){
				// not found
				break;
			}
			$base_path = dirname($base_path).'/';
		}
		// var_dump($this->path_git_home);
		$this->git->setRepository( $this->path_git_home );


	}

	/**
	 * git リポジトリのパスを取得
	 * @return string git リポジトリのパス
	 */
	public function get_path_git_home(){
		return $this->path_git_home;
	}

	/**
	 * gitリポジトリを初期化する
	 * @param  string $path	リポジトリを作成するディレクトリ
	 * @param  array  $options オプション
	 * `array('shared' => true, 'bare' => true)`
	 * @return bool			result
	 */
	public function init($path,  $options = array()){
		if( file_exists( $path.'/.git' ) ){
			return false;
		}
		// var_dump($path);
		// var_dump($options);
		$res = $this->git->init($path, $options);
		$this->path_git_home = $path;
		$this->git->setRepository( $this->path_git_home );
		// var_dump($res);
		return $res;
	}

	/**
	 * git log
	 * @return array result
	 */
	public function log(){
		// $logs = array();
		$logs = $this->git->log();
		// var_dump($logs);
		return $logs;
	}

	/**
	 * git status
	 * @return array result
	 */
	public function status(){
		// ↓px2-sitemapexcel に処理させるため、一度アクセスしておく
		$res = $this->execute_px2('/');
		// var_dump( $res );
		// $status = array();
		$status = $this->git->status();
		// var_dump($status);
		return $status;
	}

	/**
	 * git status (サイトマップに限る)
	 * @return array result
	 */
	public function status_sitemap(){
		$status = $this->status();
		$realpath_sitemap = $this->fs->get_realpath($this->path_homedir.'sitemaps/');
		// var_dump( $realpath_sitemap );
		// var_dump( realpath($this->path_git_home) );
		foreach( $status['changes'] as $idx=>$file ){
			$realpath_file = $this->fs->get_realpath($this->path_git_home.'/'.$file['file']);
			if( !preg_match( '/^'.preg_quote($realpath_sitemap, '/').'/', $realpath_file ) ){
				unset($status['changes'][$idx]);
			}
			// var_dump($realpath_file);
		}
		// var_dump($status);
		return $status;
	}

	/**
	 * git show
	 * @return array result
	 */
	public function show(){
		// ↓px2-sitemapexcel に処理させるため、一度アクセスしておく
		$res = $this->execute_px2('/');
		// var_dump( $res );
		// $result = array();
		$result = $this->git->show();
		// var_dump($result);
		return $result;
	}

	/**
	 * git branch
	 * @return array result
	 */
	public function branch(){
		// ↓px2-sitemapexcel に処理させるため、一度アクセスしておく
		$res = $this->execute_px2('/');
		// var_dump( $res );
		// $result = array();
		$result = $this->git->branch();
		// var_dump($result);
		return $result;
	}

	/**
	 * git ls-tree
	 * @return array result
	 */
	public function tree(){
		// ↓px2-sitemapexcel に処理させるため、一度アクセスしておく
		$res = $this->execute_px2('/');
		// var_dump( $res );
		// $tree = array();
		$tree = $this->git->tree();
		// var_dump($tree);
		return $tree;
	}

	/**
	 * commit sitemap
	 * @param string $commit_message コミットメッセージ
	 * @return array result
	 */
	public function commit_sitemap($commit_message = ''){
		$status_sitemap = $this->status_sitemap();
		foreach( $status_sitemap['changes'] as $idx=>$file ){
			$realpath_file = $this->fs->get_realpath($this->path_git_home.'/'.$file['file']);
			if( $file['work_tree'] == 'D' ){
				$this->git->rm($realpath_file, array());
			}else{
				$this->git->add($realpath_file, array());
			}
		}

		try {
			// throw new \Exception("Some error message");
			$res = $this->git->commit(
				trim('update Sitemap: '.$commit_message),
				array()
			);
		} catch(\Exception $e) {
			echo "\n\n\n";
			echo '---- PHPGit Exception: code '.$e->getCode().';'."\n";
			echo $e->getFile();
			echo ' (Line: '.$e->getLine().')'."\n";
			echo( $e->getMessage() );
			echo "\n";
			// var_dump( $e->getTrace() );
			// echo "\n";
			echo '---------- / PHPGit Exception'."\n";
		}
		// var_dump(__LINE__);
		// var_dump($res);

		return $res;
	}


	/**
	 * コマンドを実行し、標準出力値を返す
	 * @param array|string $commands コマンドのパラメータを要素として持つ配列(または文字列)
	 * @return string コマンドの標準出力値
	 */
	private function execute_px2( $commands ){
		set_time_limit(60*10);
		$cmd = array(
			'"'.addslashes($this->command_php).'"',
			'"'.addslashes($this->path_entry_script).'"',
			'--command-php',
			'"'.addslashes($this->command_php).'"',
		);
		if( is_array($commands) ){
			foreach( $commands as $row ){
				$param = '"'.addslashes($row).'"';
				array_push( $cmd, $param );
			}
		}elseif( is_string($commands) ){
			array_push( $cmd, '"'.addslashes($commands).'"' );
		}
		$cmd = implode( ' ', $cmd );
		ob_start();
		passthru( $cmd );
		$bin = ob_get_clean();
		set_time_limit(30);
		return $bin;
	}

}
