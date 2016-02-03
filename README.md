# Pickles 2 Desktop Tool

[Pickles2](http://pickles2.pxt.jp/) をベースに、ウェブサイトを編集するGUI編集環境を提供します。

## Install

Copy `Pickles2DesktopTool.app` to your Application Folder.


## for developer

### Initial Setup

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

### Boot(develop)

```
$ npm start
```


### Build

```
$ php docs/help/htdocs/.px_execute.php /?PX=publish.run
$ npm run build
```

`./build/` にZIPファイルが出力されます。


## Author

Tomoya Koyanagi <tomk79@gmail.com>
