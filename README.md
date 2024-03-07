# Pathcord

## 概要
オンラインプログラミング学習サービス[Parogate Path](https://path.progate.com)の
Discordコミニティで利用されているBotのJavascriptバージョンです。
現在運用されているものはPythonで動作しています。
こちらが完成しだいJavaScriptに移行されます。

## 機能
#### チェックマークがついているものが実装されている機能です。
- [x] 勉強部屋(ボイスチャンネル)の作成
- [x] 勉強開始時間の記録
- [x] 勉強終了時間の記録
- [ ] 勉強時間のランキング化
- [ ] 勉強部屋の人数制限
- [ ] 勉強部屋のロック
- [ ] 勉強部屋への招待

## 使い方
カレントディレクトリに`config.json`というファイルを作成したら、そのファイルに以下をコピペしてください。
```json
{
  "clientId": "your-bot-id-here",
  "token": "your-bot-token-here"
}
```
`clientId`と`token`を入力したら、
`deploy-commands.js`を一回走らせたあと`index.js`で起動してください。