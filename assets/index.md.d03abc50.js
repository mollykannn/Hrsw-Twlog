import{_ as e,c as r,o as t,V as a}from"./chunks/framework.0e451ef3.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"index.md"}'),l={name:"index.md"},i=a('<p>こんにちは、Mollyです👋</p><p>このプログラムは毎日0時に起動する、昨日<a href="https://twitter.com/hirasawa" target="_blank" rel="noreferrer">ヒラサワ</a>のTWを取る。</p><p>Twitterに取るは面倒だから、このプログラムは<a href="https://nitter.net" target="_blank" rel="noreferrer">Nitter</a>に取る。</p><p>最近仕事が忙しいので、バグ修正は少し遅い🙇🏻‍♀️。</p><p>プログラムは<a href="https://github.com/mollykannn/Hrsw-Twlog" target="_blank" rel="noreferrer">こちら</a>。</p><p>(日本語はまだ勉強中なので、間違っていたらすみません 🙇🏻‍♀️。)</p><hr><p>大家好👋</p><p>這是一個爬蟲程式，會在每天00:00(日本時間)左右截取前一天<a href="https://twitter.com/hirasawa" target="_blank" rel="noreferrer">hirasawa</a>的tweet。</p><p>直接在Twitter裡截取有點麻煩，這裡的截取源是<a href="https://nitter.net" target="_blank" rel="noreferrer">Nitter</a>。</p><p>因為最近一直也很忙碌所以fix bug進度可能會比較慢🙇🏻‍♀️。</p><p>程式在<a href="https://github.com/mollykannn/Hrsw-Twlog" target="_blank" rel="noreferrer">這裡</a>，也可以用來爬其他用戶/指定時間。</p><hr><h4 id="更新" tabindex="-1">更新: <a class="header-anchor" href="#更新" aria-label="Permalink to &quot;更新:&quot;">​</a></h4><ul><li>9/5 <ul><li>久違的更新...之前有一段時間twitter改了search的邏輯，令到<a href="https://github.com/zedeus/nitter/issues/852" target="_blank" rel="noreferrer">Nitter的search壞掉了</a>。後來我把每天運行的cron改為在首頁截取，避開了使用search。雖然現在Nitter的search已經沒有問題，但這邊還是繼續使用首頁截取吧，感覺之後會壞掉的機率很大。</li><li>修正斷行顯示問題</li></ul></li><li>23/4 <ul><li>轉了nitter的URL</li><li>還未想到好一點的Timeline顯示方法，先hold一下...</li></ul></li><li>19/4 <ul><li>Crawler改進了一點點</li></ul></li><li>15/4 <ul><li>搜尋欄位的Filter再改進一下</li><li>加了DatePicker方便搜尋</li><li>Sidebar由最近-&gt;最遠排序</li></ul></li><li>10/4 <ul><li>搜尋欄位使用了<a href="https://github.com/azu/kuromojin" target="_blank" rel="noreferrer">kuromojin</a>分詞，現在檔案少了一點。</li><li>刪除service worker</li><li>修正相片名稱</li></ul></li></ul><h4 id="預定需要更新的項目" tabindex="-1">預定需要更新的項目: <a class="header-anchor" href="#預定需要更新的項目" aria-label="Permalink to &quot;預定需要更新的項目:&quot;">​</a></h4><ul><li>Timeline顯示問題修正</li></ul>',17),n=[i];function o(s,h,p,c,_,u){return t(),r("div",null,n)}const m=e(l,[["render",o]]);export{d as __pageData,m as default};
