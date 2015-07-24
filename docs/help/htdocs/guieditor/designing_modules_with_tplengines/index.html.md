
Twig テンプレートエンジンを用いたモジュールを定義することができます。

<!-- autoindex -->

## 条件

次の条件が満たされる場合に、Twigテンプレートモジュールであると解釈されます。

- `info.json` に `interface` が定義されていること。
- `template.html.twig` が設置されていること。

## interface の定義

coming soon.


## テンプレートの書式

Twigテンプレートエンジンの書式に従います。詳しくは <a href="http://twig.sensiolabs.org/" target="_blank">Twigの公式ドキュメント</a> を参照してください。

次のサンプルは、`main` と名付けられた入力フィールドのコードを出力する例です。

```
<div>
{{ main }}
</div>
```

特殊な値として、環境変数 `_ENV` が渡されます。

```
{% if _ENV.mode == 'canvas' %}
<div>ここは、編集画面でのみ出力されるコードです。</div>
{% else %}

{% if _ENV.mode == 'finalize' %}
<div>ここは、編集画面では出力されないコードです。</div>
{% else %}
```


