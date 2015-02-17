


Pickles2 Desktop Tool のGUI編集機能は、個別に設計された小さな部品 __ドキュメントモジュール__ を組み合わせて構築するインターフェイスです。

ここでは、ドキュメントモジュールのテンプレートを定義する方法について説明します。


<!-- autoindex -->



## ディレクトリとファイルの構成

### モジュールの単位



### モジュール1つあたりのファイル構成





## モジュールをプロジェクトに登録する

モジュールの定義ができたら、コンフィグ画面からモジュールとして登録します。

### Config 画面を開く

サブメニュー内にある `Config` を開きます。

### Px2DT Config にディレクトリを登録

Pickles2 Desktop Tool の設定ファイルは、JSON形式です。次の例を参考に、`paths_module_template` 欄に、モジュールのパスを設定してください。

```
{
    "paths_module_template": {
        "SELF": "./px-files/resources/module_templates/"
    }
}
```

モジュールのセットは、1つのプロジェクトにつき複数登録することができます。

Px2DTコンフィグは、`./px-files/px2dtconfig.json` に保存されます。




