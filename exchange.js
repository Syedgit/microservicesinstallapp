use framework "Foundation"
use scripting additions

on stripHTML(theHTML)
	set theNSString to current application's NSString's stringWithString:theHTML
	set options to current application's NSRegularExpressionSearch
	set range to {location:0, |length|:theNSString's |length|()}
	set regexPattern to "<[^>]+>"
	set stripped to theNSString's stringByReplacingOccurrencesOfString:regexPattern withString:"" options:options range:range
	return stripped as string
end stripHTML

-- Start Notes processing
tell application "Notes"
	set notesList to every note
	set allCleanNotes to {} -- Store cleaned note data
	repeat with n in notesList
		set noteName to the name of n
		set noteBody to the body of n
		set end of allCleanNotes to {noteName, noteBody}
	end repeat
end tell

-- Process and write clean text files outside the Notes block
repeat with itemData in allCleanNotes
	set noteName to item 1 of itemData
	set noteBody to item 2 of itemData
	set cleanText to stripHTML(noteBody)
	
	-- Clean file name
	set safeName to do shell script "echo " & quoted form of noteName & " | tr -cd '[:alnum:]_-'"
	set folderPath to (POSIX path of (path to desktop)) & "ExportedNotesClean/"
	set filePath to folderPath & safeName & ".txt"
	
	do shell script "mkdir -p " & quoted form of folderPath
	
	set fileRef to open for access POSIX file filePath with write permission
	set eof of fileRef to 0
	write cleanText to fileRef as «class utf8»
	close access fileRef
end repeat
