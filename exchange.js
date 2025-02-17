index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="0e7c09ae-108b-" appName="teamapp_benefits_1662658221"
| fillnull value="UNKNOWN" statusCde
| bin _time span=1s 
| stats count as TPS by _time, statusCde
| eventstats max(TPS) as Peak_TPS, avg(TPS) as Average_TPS by statusCde
| bin _time span=1h
| stats sum(TPS) as Transactions_Per_Hour, max(TPS) as Peak_Transactions_Per_Hour by _time, statusCde
| eventstats max(Peak_Transactions_Per_Hour) as Peak_Usage by statusCde
| eval Hour=strftime(_time, "%H") 
| stats max(Peak_TPS) as Peak_TPS, avg(Average_TPS) as Average_TPS, max(Peak_Usage) as Peak_Usage, max(Transactions_Per_Hour) as "#Transactions_Per_Hour", first(_time) as Peak_Hours, last(_time) as Typical_Hours by statusCde
| eval Peak_Hours=strftime(Peak_Hours, "%I %p"), Typical_Hours=strftime(Typical_Hours, "%I %p")
