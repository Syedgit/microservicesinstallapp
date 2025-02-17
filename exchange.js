
1️⃣ Peak Transactions Per Second (Peak TPS)
spl
Copy
Edit
index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="123" appName="teamapp_benefits_1662658221"
| bin _time span=1s
| stats count as TPS by _time
| stats max(TPS) as Peak_TPS
🔹 This finds the highest number of transactions per second (TPS).

2️⃣ Average Transactions Per Second (Average TPS)
spl
Copy
Edit
index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="123" appName="teamapp_benefits_1662658221"
| bin _time span=1s
| stats count as TPS by _time
| stats avg(TPS) as Average_TPS
🔹 This calculates the average TPS over the time range.

3️⃣ Peak Hour (Hour with Highest Transactions)
spl
Copy
Edit
index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="123" appName="teamapp_benefits_1662658221"
| bin _time span=1h
| stats count as Transactions by _time
| sort -Transactions
| head 1
| eval Peak_Hour=strftime(_time, "%H:00 - %H:59")
| table Peak_Hour, Transactions
🔹 This finds the hour with the highest transaction count.

4️⃣ Typical Hour (Hour with Median Transactions)
spl
Copy
Edit
index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="123" appName="teamapp_benefits_1662658221"
| bin _time span=1h
| stats count as Transactions by _time
| eventstats median(Transactions) as Median_Transactions
| eval AbsDiff=abs(Transactions - Median_Transactions)
| sort AbsDiff
| head 1
| eval Typical_Hour=strftime(_time, "%H:00 - %H:59")
| table Typical_Hour, Transactions
🔹 This finds the hour closest to the median transaction volume.

5️⃣ Peak Usage (Highest Transactions in One Hour)
spl
Copy
Edit
index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="123" appName="teamapp_benefits_1662658221"
| bin _time span=1h
| stats count as Transactions by _time
| stats max(Transactions) as Peak_Usage
🔹 This gets the highest number of transactions in any hour.

6️⃣ Transactions Per Hour
spl
Copy
Edit
index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="123" appName="teamapp_benefits_1662658221"
| bin _time span=1h
| stats count as Transactions_Per_Hour by _time
| table _time, Transactions_Per_Hour
