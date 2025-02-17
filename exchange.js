index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="123" appName="teamapp_benefits_1662658221"
| bin _time span=1s 
| stats count as TPS by _time
| eventstats max(TPS) as Peak_TPS, avg(TPS) as Average_TPS
| bin _time span=1h
| stats sum(TPS) as Transactions_Per_Hour, max(TPS) as Peak_Transactions_Per_Hour by _time
| eventstats max(Peak_Transactions_Per_Hour) as Peak_Usage, sum(Transactions_Per_Hour) as Total_Transactions, 
        max(Peak_TPS) as Peak_TPS, avg(Average_TPS) as Average_TPS
| stats first(_time) as Peak_Hour, last(_time) as Typical_Hour, 
        max(Peak_Usage) as Peak_Usage, max(Peak_TPS) as Peak_TPS, 
        avg(Average_TPS) as Average_TPS, sum(Total_Transactions) as Total_Transactions
| eval Peak_Hour=strftime(Peak_Hour, "%H:00 - %H:59"), 
       Typical_Hour=strftime(Typical_Hour, "%H:00 - %H:59")
