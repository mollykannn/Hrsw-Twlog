大家好👋

這時一個爬蟲程式，會在每天00:00(日本時間)左右截取前一天[hirasawa](https://twitter.com/hirasawa)的tweet。

直接在Twitter裡截取有點麻煩，這裡的截取源是[Nitter](https://nitter.it)。

因為最近一直也很忙碌所以fix bug進度可能會比較慢。

程式在[這裡](https://github.com/mollykannn/Hrsw-Twlog)，也可以用來爬其他用戶/指定時間。

---
#### 更新:
- 19/4
  - Crawler改進了一點點
- 15/4 
  - 搜尋欄位的Filter再改進一下
  - 加了DatePicker方便搜尋
  - Sidebar由最近->最遠排序
- 10/4 
  - 搜尋欄位使用了[kuromojin](https://github.com/azu/kuromojin)分詞，現在檔案少了一點。
  - 刪除service worker
  - 修正相片名稱
#### 預定需要更新的項目:

- Timeline顯示問題修正
- ~~增加DatePicker方便搜尋資料~~
- 爬蟲程式改回typescript方便debug
- ~~搜尋欄位需作出改善~~