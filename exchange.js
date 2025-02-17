index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="0e7c09ae-108b-" appName="teamapp_benefits_1662658221"
| bin _time span=1s 
| stats count as TPS, count(eval(statusCde="SUCCESS")) as Successes, count(eval(statusCde="FAILURE")) as Failures, count(eval(statusCde="WARNING")) as Warnings by _time
| eventstats max(TPS) as Peak_TPS, avg(TPS) as Average_TPS
| bin _time span=1h
| stats sum(TPS) as Transactions_Per_Hour, max(TPS) as Peak_Transactions_Per_Hour, sum(Successes) as Success_Transactions, sum(Failures) as Failed_Transactions, sum(Warnings) as Warning_Transactions by _time
| eventstats max(Peak_Transactions_Per_Hour) as Peak_Usage, sum(Transactions_Per_Hour) as Total_Transactions
| stats first(_time) as Peak_Hour, last(_time) as Typical_Hour, max(Peak_Usage) as Peak_Usage, max(Peak_TPS) as Peak_TPS, avg(Average_TPS) as Average_TPS, sum(Total_Transactions) as Total_Transactions, sum(Success_Transactions) as Total_Success, sum(Failed_Transactions) as Total_Failures, sum(Warning_Transactions) as Total_Warnings
| eval Peak_Hour=strftime(Peak_Hour, "%H:00 - %H:59"), 
       Typical_Hour=strftime(Typical_Hour, "%H:00 - %H:59")
