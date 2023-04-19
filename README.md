# Hrsw-Twlog

## プログラム使い方

1. [Node.js](https://nodejs.org/ja/download/)をインストールする

2. コマンドプロンプトを起動する

3. コマンドをタイプする
  
    1. インストール 
    ```shell
    cd crawler
    npm install
    ```

    2. 実行
    ```shell
    // 多日
    node crawler.js --from (date[YYYY-MM-DD]) --to (date[YYYY-MM-DD]) --user (username)
    // 一日
    node crawler.js --from (date[YYYY-MM-DD]) --user (username)

    Example:
    node crawler.js --from 2023-04-01 --to 2023-04-02 --user hirasawa
    node crawler.js --from 2023-04-01 --user hirasawa
    ```
    (実行結果は ```Twitter/___.md``` ファイルに記録される)

---

## Web

1. [Node.js](https://nodejs.org/ja/download/)をインストールする

2. コマンドプロンプトを起動する

3. コマンドをタイプする
  
    1. インストール 
    ```shell
    npm install
    ```

    2.1. サーバーを起動する
    ```shell
    npm run doc:dev
    ```

    2.2. プロダクション向けビルド
    ```shell
    npm run doc:build
    ```
