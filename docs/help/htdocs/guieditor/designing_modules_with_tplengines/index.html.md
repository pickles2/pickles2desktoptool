
Twig テンプレートエンジンを用いたモジュールを定義することができます。

<!-- autoindex -->

## 条件

次の条件が満たされる場合に、Twigテンプレートモジュールであると解釈されます。

- `info.json` に `interface` が定義されていること。
- `template.html.twig` が設置されていること。

## UI要素の定義 (interface)

`info.json` に、`interface` をキーに、次のように定義します。

```
{
	"name": "Sample Module",
	"areaSizeDetection": "shallow",
	"interface": {
		"fields": {
			"text1-1":{
				"fieldType": "input",
				"type":"multitext",
				"rows":4
			},
			"text1-2":{
				"fieldType": "input",
				"type":"multitext",
				"rows":4
			},
			"loop":{
				"fieldType":"loop"
			}
		},
		"subModule":{
			"loop":{
				"fields":{
					"text2-1":{
						"fieldType": "input",
						"type":"multitext",
						"rows":4
					} ,
					"text2-2":{
						"fieldType": "input",
						"type":"multitext",
						"rows":4
					}
				}
			}
		}
	}
}
```

`interface` には、`fields` と、`subModule` の2つのオブジェクトを格納します。

`interface.fields[$fieldName]` に、フィールドを定義します。
フィールドの種類を `interface.fields[$fieldName].fieldType` に定義します。

フィールドの種類は、`input`、`module`、`loop` のいずれかです。それ以外の値は通常のフィールドと同じです。

`fieldType` が `loop` の場合、`interface.subModule` に、サブモジュールを登録します。
loopフィールドの `name` と、 `interface.subModule[$subModuleName]` とで関連付けられます。`interface.subModule[$subModuleName][$loopFieldName]` 以下は、`interface.fields` の書き方と同じです。

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
{% endif %}

{% if _ENV.mode == 'finalize' %}
<div>ここは、編集画面では出力されないコードです。</div>
{% endif %}
```


