# Usage

## app.png を設置

1024 * 1024 サイズの PNG画像を作成し、このディレクトリの `app.png` を上書きします。

## コマンドを実行

```
$ cd {$thisDirectory}
$ sh png2icns.sh
```

この操作によって、 `app.icns` と `app_for_Windows.icns` が生成されます。

## Mac OSX のプレビューを使って、Windowsアイコンを作成

- `app_for_Windows.icns` を プレビュー で開きます。
- ファイル -> 書き出す...
- フォーマットを選ぶプルダウンメニューを、Optionキーを押しながらクリックします。
- 「Microsoft アイコン」という選択肢が出現するので、これを選択します。
- 「保存」ボタンをクリックし、 `app_for_Windows.ico` を上書き保存します。
