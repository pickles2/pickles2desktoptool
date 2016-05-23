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
	private $px;
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
		$this->px = $px;

		if( is_string($this->px) && is_file($this->px) ){
			$this->path_entry_script = $this->px;
			$this->command_php = 'php';
			$this->path_homedir = json_decode( $this->execute_px2('/?PX=api.get.path_homedir') );
			$this->path_controot = json_decode( $this->execute_px2('/?PX=api.get.path_controot') );
			$this->path_docroot = json_decode( $this->execute_px2('/?PX=api.get.path_docroot') );
		}elseif( is_object($this->px) ){
			$this->path_entry_script = $_SERVER['SCRIPT_FILENAME'];
			$this->command_php = $this->px->conf()->commands->php;
			$this->path_homedir = $this->px->get_path_homedir();
			$this->path_controot = $this->px->get_path_controot();
			$this->path_docroot = $this->px->get_path_docroot();
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
	 * git log (特定ページのコンテンツに限る)
	 * @return array result
	 */
	public function log_contents($page_path){
		// $logs = array();
		$contents_path_info = $this->get_contents_path_info($page_path);
		$logs1 = $this->git->log(null, $contents_path_info['realpath_content'], array());
		$logs2 = $this->git->log(null, $contents_path_info['realpath_files'], array());
		$logs = array_merge($logs1, $logs2);
		usort($logs, function($a, $b){
			$adate = @strtotime( $a['date'] );
			$bdate = @strtotime( $b['date'] );
			if( $adate > $bdate ){
				return -1;
			}elseif( $adate < $bdate ){
				return 1;
			}
			return 0;
		});
		$logs_hash_done = array();
		foreach( $logs as $key=>$row ){
			if( $logs_hash_done[$row['hash']] ){
				unset( $logs[$key] );
				continue;
			}
			$logs_hash_done[$row['hash']] = true;
		}
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
		$status['div'] = array(
			'sitemaps' => array(),
			'themes' => array(),
			'contents' => array(),
			'other' => $status['changes']
		);

		$realpath_homedir = $this->fs->get_realpath($this->path_homedir);
		$realpath_controot = $this->fs->get_realpath($this->path_docroot.'/'.$this->path_controot);
		$realpath_sitemap = $this->fs->get_realpath($this->path_homedir.'sitemaps/');
		$realpath_theme = $this->fs->get_realpath($this->path_homedir.'themes/');
		foreach( $status['div']['other'] as $idx=>$file ){
			$realpath_file = $this->fs->get_realpath($this->path_git_home.'/'.$file['file']);
			if( preg_match( '/^'.preg_quote($realpath_sitemap, '/').'/', $realpath_file ) ){
				array_push($status['div']['sitemaps'], $file);
				unset($status['div']['other'][$idx]);
				continue;
			}elseif( preg_match( '/^'.preg_quote($realpath_theme, '/').'/', $realpath_file ) ){
				array_push($status['div']['themes'], $file);
				unset($status['div']['other'][$idx]);
				continue;
			}elseif( preg_match( '/^'.preg_quote($realpath_homedir, '/').'/', $realpath_file ) ){
				continue;
			}elseif( preg_match( '/^'.preg_quote($realpath_controot, '/').'/', $realpath_file ) ){
				array_push($status['div']['contents'], $file);
				unset($status['div']['other'][$idx]);
				continue;
			}
			// var_dump($realpath_file);
			continue;
		}

		// var_dump($status);
		return $status;
	}

	/**
	 * git status (特定ページのコンテンツに限る)
	 * @param  string $page_path ページのパス または ID
	 * @return array result
	 */
	public function status_contents( $page_path ){
		$status = $this->status();
		$rtn = array(
			'branch'=>$status['branch'],
			'changes'=>array()
		);
		$realpath_controot = $this->fs->get_realpath($this->path_docroot.'/'.$this->path_controot);
		if( is_string($this->px) && is_file($this->px) ){
			$page_path = json_decode( $this->execute_px2('/?PX=api.get.href&linkto='.urlencode($page_path)) );
			$page_info = json_decode( $this->execute_px2('/?PX=api.get.page_info&path='.urlencode($page_path)) );
			$realpath_content = $realpath_controot.'/'.$page_info->content;
			$realpath_files = json_decode( $this->execute_px2($page_path.'?PX=api.get.realpath_files') );
		}elseif( is_object($this->px) ){
			$page_path = $this->px->href($page_path);
			$page_info = $this->px->get_page_info($page_path);
			$realpath_content = $realpath_controot.'/'.$page_info['content'];
			$realpath_files = $this->px->realpath_files();
		}else{
			return false;
		}
		// var_dump( $realpath_content );
		$realpath_content = $this->fs->get_realpath( $realpath_content );
		$realpath_files = $this->fs->get_realpath( $realpath_files.'/' );
		// var_dump( $realpath_content );
		// var_dump( $realpath_files );
		foreach( $status['div']['contents'] as $idx=>$file ){
			$realpath_file = $this->fs->get_realpath($this->path_git_home.'/'.$file['file']);
			if( preg_match( '/^'.preg_quote($realpath_content, '/').'/', $realpath_file ) ){
				array_push($rtn['changes'], $file);
				unset($status['div']['contents'][$idx]);
				continue;
			}
			if( preg_match( '/^'.preg_quote($realpath_files, '/').'/', $realpath_file ) ){
				array_push($rtn['changes'], $file);
				unset($status['div']['contents'][$idx]);
				continue;
			}
			// var_dump($realpath_file);
		}
		// var_dump($rtn);
		return $rtn;
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
	 * commit sitemaps
	 * @param string $commit_message コミットメッセージ
	 * @return array result
	 */
	public function commit_sitemaps($commit_message = ''){
		$status = $this->status();
		if( !count($status['div']['sitemaps']) ){
			// コミットすべきファイルがありません。
			return true;
		}

		foreach( $status['div']['sitemaps'] as $idx=>$file ){
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
				trim(''.$commit_message),
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
	 * commit contents
	 * @param string $page_path コミットするコンテンツのページパス
	 * @param string $commit_message コミットメッセージ
	 * @return array result
	 */
	public function commit_contents($page_path, $commit_message = ''){
		$status = $this->status_contents($page_path);
		if( !count($status['changes']) ){
			// コミットすべきファイルがありません。
			return true;
		}

		foreach( $status['changes'] as $idx=>$file ){
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
				trim(''.$commit_message),
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
	 * ページパスから、コンテンツのパス情報一式を得る
	 * @param  string $page_path ページのパス
	 * @return array             コンテンツのパス情報一式
	 */
	private function get_contents_path_info($page_path){
		$ary = array();
		$ary['page_path'] = $page_path;
		$ary['realpath_controot'] = $this->fs->get_realpath($this->path_docroot.'/'.$this->path_controot);
		if( is_string($this->px) && is_file($this->px) ){
			$ary['page_path'] = json_decode( $this->execute_px2('/?PX=api.get.href&linkto='.urlencode($ary['page_path'])) );
			$ary['page_info'] = json_decode( $this->execute_px2('/?PX=api.get.page_info&path='.urlencode($ary['page_path'])) );
			$ary['realpath_content'] = $ary['realpath_controot'].'/'.$ary['page_info']->content;
			$ary['realpath_files'] = json_decode( $this->execute_px2($ary['page_path'].'?PX=api.get.realpath_files') );
		}elseif( is_object($this->px) ){
			$ary['page_path'] = $this->px->href($ary['page_path']);
			$ary['page_info'] = $this->px->get_page_info($ary['page_path']);
			$ary['realpath_content'] = $ary['realpath_controot'].'/'.$ary['page_info']['content'];
			$ary['realpath_files'] = $this->px->realpath_files();
		}else{
			return false;
		}
		// var_dump( $realpath_content );
		$ary['realpath_content'] = $this->fs->get_realpath( $ary['realpath_content'] );
		$ary['realpath_files'] = $this->fs->get_realpath( $ary['realpath_files'].'/' );
		return $ary;
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