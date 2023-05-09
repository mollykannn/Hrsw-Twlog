こんにちは、Mollyです👋

このプログラムは毎日0時に起動する、昨日[ヒラサワ](https://twitter.com/hirasawa)のTWを取る。

Twitterに取るは面倒だから、このプログラムは[Nitter](https://nitter.net)に取る。

最近仕事が忙しいので、バグ修正は少し遅い🙇🏻‍♀️。

プログラムは[こちら](https://github.com/mollykannn/Hrsw-Twlog)。

(日本語はまだ勉強中なので、間違っていたらすみません 🙇🏻‍♀️。)

---

大家好👋

這是一個爬蟲程式，會在每天00:00(日本時間)左右截取前一天[hirasawa](https://twitter.com/hirasawa)的tweet。

直接在Twitter裡截取有點麻煩，這裡的截取源是[Nitter](https://nitter.net)。

因為最近一直也很忙碌所以fix bug進度可能會比較慢🙇🏻‍♀️。

程式在[這裡](https://github.com/mollykannn/Hrsw-Twlog)，也可以用來爬其他用戶/指定時間。

---
#### 更新:
- 9/5
  - 久違的更新...之前有一段時間twitter改了search的邏輯，令到[Nitter的search壞掉了](https://github.com/zedeus/nitter/issues/852)。後來我把每天運行的cron改為在首頁截取，避開了使用search。雖然現在Nitter的search已經沒有問題，但這邊還是繼續使用首頁截取吧，感覺之後會壞掉的機率很大。
  - 修正斷行顯示問題
- 23/4
  - 轉了nitter的URL
  - 還未想到好一點的Timeline顯示方法，先hold一下...
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