# 循環大挑戰：人類與昆蟲的送氧比較

這是一套可直接部署到 GitHub Pages 的國中生物互動教材，透過動畫、滑桿模擬、路線挑戰與測驗，協助學生理解：

- 人類的閉鎖式循環
- 昆蟲的開放式循環
- 人類由血液與紅血球運送氧氣
- 昆蟲由氣門、氣管與微氣管運送氧氣
- 體型大小、活動強度與環境氧氣對供氧效率的影響

## 功能

1. **概念動畫**：並排比較人類與昆蟲的氧氣運送路線。
2. **體型實驗室**：調整體型、活動強度與氧氣濃度，即時查看供氧效率與缺氧比例。
3. **挑戰任務**：依正確順序完成送氧路線，並設計一隻巨型昆蟲。
4. **學習檢測**：五題單選題與即時解說。
5. **響應式設計**：支援桌面、平板與手機。

## 本機使用

下載或解壓縮後，直接用瀏覽器開啟 `index.html` 即可。

也可使用簡易本機伺服器：

```bash
python3 -m http.server 8000
```

再開啟：

```text
http://localhost:8000
```

## 部署到 GitHub Pages

1. 在 GitHub 建立新的 Repository。
2. 上傳本專案所有檔案。
3. 進入 Repository 的 **Settings**。
4. 點選左側 **Pages**。
5. 在 **Build and deployment** 中選擇：
   - Source：`Deploy from a branch`
   - Branch：`main`
   - Folder：`/ (root)`
6. 按下 **Save**。
7. 等待 GitHub 建立網站，即可取得公開網址。

## 檔案結構

```text
circulation-learning-game/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## 教學提醒

本教材中的秒數、效率與缺氧比例為簡化的教學模擬值，用於呈現趨勢，不代表特定物種的真實測量結果。真實生物的體型與生理表現還會受到外骨骼、代謝率、環境、演化與行為等因素影響。


## 圖像素材與授權

專案已將素材下載到 `assets/`，不依賴外部網站：

- `human-circulatory-system.webp`：改作自 LadyofHats 的 *Circulatory System no tags.svg*，Wikimedia Commons 標示為 Public Domain。
- `insect-cockroach.webp`：改作自 Pearson Scott Foresman 的 *Cockroach (PSF).svg*，Wikimedia Commons 標示為 Public Domain。

素材僅用於教育示意。專案頁尾已保留來源說明。
