index IN ("digital_apigee", "ed_pharmacy_services") CVSEVENT=EXIT experienceId="0e7c09ae-108b-4e5f-97d4-cb117bac1cb4" appName="teamapp_benefits_1662658221"| fillnull "~" name,statusCde, statusMsg, jsonPayload.totalApiResponseTime
| stats count(status) as Volume, count(eval(status="SUCCESS")) as Successes, count(eval(status="WARNING")) as Warnings, count(eval(status="FAILURE")) as Failures, perc75(jsonPayload.totalApiResponseTime) AS RespTime75th, perc50(jsonPayload.totalApiResponseTime) AS RespTime50th, perc90(jsonPayload.totalApiResponseTime) AS RespTime90th, perc95(jsonPayload.totalApiResponseTime) AS RespTime95th, perc99(jsonPayload.totalApiResponseTime) AS RespTime99th ,avg(jsonPayload.totalApiResponseTime) as Average max(jsonPayload.totalApiResponseTime) as max_respTime


Peak TPS
Average TPS
Peak Hours
Typical Hours
Peak Usage
#transactions/per hour
