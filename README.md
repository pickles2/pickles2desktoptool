# Pickles 2 Desktop Tool

[Pickles2](http://pickles2.pxt.jp/) をベースに、ウェブサイトを編集するGUI編集環境を提供します。

<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PL5ZUBZrE-CkDSYUvVZNDCILrzGhRG2U8L" frameborder="0" allowfullscreen></iframe>

## Install

Copy `Pickles2DesktopTool.app` to your Application Folder.


## for developer

### Initial Setup for develop

```
$ git clone https://github.com/pickles2/pickles2desktoptool.git
$ cd pickles2desktoptool
$ npm install
$ composer install
```

### update submodules changes

```
$ npm run submodules-update
```

### Boot for develop

```
$ npm start
```


### Build application

```
$ php docs/help/htdocs/.px_execute.php /?PX=publish.run
$ npm run build
```

`./build/` にZIPファイルが出力されます。


## ライセンス - License

MIT License


## 作者 - Author

- (C)Tomoya Koyanagi <tomk79@gmail.com>
- website: <http://www.pxt.jp/>
- Twitter: @tomk79 <http://twitter.com/tomk79/>
