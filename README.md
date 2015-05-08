不符合食品資訊資料視覺化
=======================  

目標 :   
1. 製作工具以視覺化方式呈現食藥署不符合食品資訊資料集  
2. 探索資料集內容，提供未來改進建議

開發環境 :   
1. 視覺化工具 : d3.js
2. 網頁框架 : SUSY, Compass, Grunt

使用 :  
1. Go to http://data.moi.gov.tw/MoiOD/Data/DataDetail.aspx?oid=F4478CE5-7A72-4B14-B91A-F4701758328F  
   and download 村里戶數人口數單一年齡人口數. The suffix indicate the updating date of data set.  
   e.g. -10309 = 103 year (2014), September.  
2. Unzip data set into a folder.  
3. Put tidyDemography.R in the same folder.  
4. Start R or R.Studio.  
5. To load script: source("tidyDemography.R", encoding="UTF-8")  
6. To generate demography in g0v format : g0vDemo().  
   This script will automatically detect csv files in the same folder and processes all of them.  
   Please make sure there are only legitimite csv files in the same folder.  
7. To generate tidy demography: tidyDataSet <- tidyDemo(regionDemoFileName).  
   This function will return a data set for exploratory data analysis.
   CAUTION : This function takes a lot of time.
8. plotTidyDemo(tidyDataSet) will create a simply demography plot by ages and save it as png file.  

