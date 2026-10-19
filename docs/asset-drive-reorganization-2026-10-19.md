# 設計素材庫整理紀錄

日期：2026-10-19

## 原則

- Google Drive 根資料夾由 `Adobe Stock` 改名為 `設計素材庫`。
- 第一階段只移動與重新命名資料夾，不刪除、不覆蓋、不合併素材。
- `Birthday Card` / `BirthdayCard` 與 `名片` / `BizCard` 暫時分開，待內容比對後再決定是否合併。
- 檔案本身保留原名，讓 Adobe Stock 編號與既有連結仍可追溯。

## 目標結構

```text
設計素材庫
├── 00_待整理
├── 01_圖示
├── 02_介面素材
├── 03_行銷節慶
├── 04_印刷版型
├── 05_圖片
├── 06_動態素材
├── 90_封存
└── _待刪除
```

## 搬移與改名對照

| Google Drive ID | 原路徑 | 新路徑 |
|---|---|---|
| `1kwTkwmwIBvvnQyjJQBceH8uleqJMN2aC` | `ICONs` | `01_圖示/一般圖示` |
| `1B8Cpf-BxiHdkUn1EmEUhjQvDIdBgk5ke` | `Logistic Icon` | `01_圖示/物流圖示` |
| `1-YNAqQvvV6d4huBAHw8Dnj2ajtIike6g` | `00_待整理_2026-10-15/英文設計字母` | `01_圖示/設計字母` |
| `1EF88aHlgeq9osfNFaxbeUZM38elcMGRg` | `UI` | `02_介面素材/介面元件` |
| `1DS7-dlHadObP3dp-f4DFrHw66vhtdYDg` | `00_待整理_2026-10-15/UI Kit` | `02_介面素材/介面套件` |
| `1gSKgdS8qxLVasQ-C1_D-wQmx_3f1dGp-` | `00_待整理_2026-10-15/Social Post` | `03_行銷節慶/社群貼文` |
| `1WZvoYUBc09jFc5OPlfVZMQiigQV_QYDS` | `Social Post Template` | `03_行銷節慶/社群貼文範本` |
| `1VNDT03JG2hl9bvnEk_IYY8MDMGglYX6b` | `00_待整理_2026-10-15/Birthday Card` | `03_行銷節慶/生日卡片` |
| `19NGM_oItfs-2bn4zKE8OkWut3dI6eJS1` | `00_待整理_2026-10-15/已上傳到 DGHM>GoogleDrive/BirthdayCard` | `03_行銷節慶/生日卡片（待合併）` |
| `1GvxfH55k-67qzT3rvr3o8hxYUN0L_45m` | `Christmas` | `03_行銷節慶/聖誕節` |
| `1rvKeZ6UWXzgiucLV62Z0f9eG8BgfjURB` | `Mid-Autumn Festival` | `03_行銷節慶/中秋節` |
| `11JDPQKZ6pmI6FXk4vFuD0aPpyjGdXTuU` | `00_待整理_2026-10-15/名片` | `04_印刷版型/名片` |
| `1HFl4PsYCdwxOUYKdoV2EsSFctuDfbiaN` | `BizCard` | `04_印刷版型/名片素材（待合併）` |
| `1eUvTmPqpTgdaEgdmzR3n8xYSVxI7eW4k` | `00_待整理_2026-10-15/A4 DM` | `04_印刷版型/A4單張` |
| `13xLfCKpDkfQWUWay3152n5jy_tiHwMLj` | `00_待整理_2026-10-15/三折頁` | `04_印刷版型/三折頁` |
| `1p4SCIsApFSX1DrfL4YtYPjDGzl_5v3XY` | `00_待整理_2026-10-15/易拉展大海報` | `04_印刷版型/展場海報` |
| `1SmQ4H6rB0KpcIF-cfteBbAyNzySD4hnZ` | `Abstract` | `05_圖片/抽象背景` |
| `1OyWZR3L3nUehINCGDVEbwSBJmf95zn4M` | `00_待整理_2026-10-15/冷鏈` | `05_圖片/冷鏈` |
| `1-U8ecI8emKiDk5gVwsN2ESeqn6TQ6uzI` | `00_待整理_2026-10-15/客服` | `05_圖片/客服` |
| `1cEi0Y3pGyV5AmobZ_iUQM_BjTbofaFlv` | `Images` | `05_圖片/圖庫圖片` |
| `16PBa87oq_dlkOFzsPspUDv0U-wBMqjTl` | `Pic` | `05_圖片/專案圖片` |

## 檔名第二階段建議

先產出重複檔名與缺乏語意的檔名清單，再逐批處理。建議保留 `AdobeStock_編號`，並只在前方補用途，例如：

```text
物流_冷鏈_AdobeStock_123456789.ai
社群_生日_AdobeStock_987654321.psd
```

沒有 Adobe Stock 編號的自製素材可採：

```text
用途_主題_版本_YYYYMMDD.ext
```
