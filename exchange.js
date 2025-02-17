index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="0e7c09ae-108b-" appName="teamapp_benefits_1662658221"
| fillnull value="UNKNOWN" statusCde
| bin _time span=1s 
| stats count as TPS by _time, statusCde
| eventstats max(TPS) as Peak_TPS, avg(TPS) as Average_TPS
| bin _time span=1h
| stats sum(TPS) as Transactions_Per_Hour by _time, statusCde
| eventstats max(Transactions_Per_Hour) as Peak_Usage
| eval Hour=strftime(_time, "%H")
| stats max(Peak_TPS) as Peak_TPS, avg(Average_TPS) as Average_TPS, max(Peak_Usage) as Peak_Usage, max(Transactions_Per_Hour) as "#Transactions_Per_Hour", first(Hour) as Peak_Hours, last(Hour) as Typical_Hours
| eval Peak_Hours=strftime(Peak_Hours*3600, "%I %p"), Typical_Hours=strftime(Typical_Hours*3600, "%I %p")
