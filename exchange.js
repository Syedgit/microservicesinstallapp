index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="0e7c09ae-108b-" appName="teamapp_benefits_1662658221"
| fillnull "~" name, statusCde, statusMsg, jsonPayload.totalApiResponseTime
| bin _time span=1s 
| stats count(status) as TPS by _time 
| eventstats avg(TPS) as Average_TPS max(TPS) as Peak_TPS
| bin _time span=1h
| stats sum(TPS) as Transactions_Per_Hour, max(TPS) as Peak_Transactions_Per_Hour, avg(TPS) as Avg_Transactions_Per_Hour by _time
| stats 
    max(Peak_Transactions_Per_Hour) as Peak_Usage, 
    avg(Avg_Transactions_Per_Hour) as Average_TPS, 
    max(Peak_TPS) as Peak_TPS, 
    sum(Transactions_Per_Hour) as Total_Transactions,
    first(_time) as Peak_Hour,
    last(_time) as Typical_Hour
| eval Peak_Hour=strftime(Peak_Hour, "%H:00 - %H:59"), 
       Typical_Hour=strftime(Typical_Hour, "%H:00 - %H:59")
