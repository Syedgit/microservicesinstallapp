use framework "Foundation"
use scripting additions

on stripHTML(theHTML)
	set theNSString to current application's NSString's stringWithString:theHTML
	set regexPattern to "<[^>]+>"
	set stripped to theNSString's stringByReplacingOccurrencesOfString:regexPattern withString:"" options:(current application's NSRegularExpressionSearch) range:{0, theNSString's |length|()}
	return stripped as string
end stripHTML

tell application "Notes"
	set notesList to every note
	repeat with n in notesList
		set noteName to the name of n
		set noteBody to the body of n
		set cleanText to stripHTML(noteBody)
		
		set safeName to do shell script "echo " & quoted form of noteName & " | tr -cd '[:alnum:]_-'"
		
		set folderPath to (POSIX path of (path to desktop)) & "ExportedNotesClean/"
		set filePath to folderPath & safeName & ".txt"
		
		do shell script "mkdir -p " & quoted form of folderPath
		
		set fileRef to open for access POSIX file filePath with write permission
		set eof of fileRef to 0
		write cleanText to fileRef as «class utf8»
		close access fileRef
	end repeat
end tell
