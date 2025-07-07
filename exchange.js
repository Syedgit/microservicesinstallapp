use framework "Foundation"
use scripting additions

on stripHTML(theHTML)
	set theNSString to current application's NSString's stringWithString:theHTML
	set regexPattern to "<[^>]+>"
	set options to current application's NSRegularExpressionSearch
	set range to {location:0, |length|:theNSString's |length|()}
	set cleanString to theNSString's stringByReplacingOccurrencesOfString:regexPattern withString:"" options:options range:range
	return cleanString as string
end stripHTML

-- Collect notes
tell application "Notes"
	set notesList to every note
	set allCleanNotes to {}
	repeat with n in notesList
		set noteName to the name of n
		set noteBody to the body of n
		set end of allCleanNotes to {noteName, noteBody}
	end repeat
end tell

-- Export clean files
repeat with noteData in allCleanNotes
	set noteName to item 1 of noteData
	set noteBody to item 2 of noteData
	
	-- Fallback if title is empty
	if noteName is "" then
		set noteName to "untitled_" & (random number from 100000 to 999999) as string
	end if
	
	-- Remove HTML from body
	set cleanText to stripHTML(noteBody)
	
	-- Clean file name
	set safeName to do shell script "echo " & quoted form of noteName & " | tr -cd '[:alnum:]_-'"
	
	-- Paths
	set folderPath to (POSIX path of (path to desktop)) & "ExportedNotesClean/"
	set filePath to folderPath & safeName & ".txt"
	
	-- Make folder
	do shell script "mkdir -p " & quoted form of folderPath
	
	try
		-- Write to file safely
		set fileDescriptor to open for access (POSIX file filePath) with write permission
		set eof of fileDescriptor to 0
		write cleanText to fileDescriptor as «class utf8»
		close access fileDescriptor
	on error errMsg number errNum
		try
			close access (POSIX file filePath)
		end try
		log "Error writing note: " & noteName & " — " & errMsg
	end try
end repeat
