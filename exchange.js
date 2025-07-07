tell application "Notes"
	set notesList to every note
	repeat with n in notesList
		set noteName to the name of n
		set noteBody to the body of n
		
		-- Clean the filename to be safe
		set safeName to do shell script "echo " & quoted form of noteName & " | tr -cd '[:alnum:]_-'" 
		
		-- Set export path to Desktop
		set folderPath to (POSIX path of (path to desktop)) & "ExportedNotes/"
		set filePath to folderPath & safeName & ".txt"
		
		-- Create folder (once)
		do shell script "mkdir -p " & quoted form of folderPath
		
		-- Write the body using text file methods (avoids shell echo issues)
		set fileRef to open for access POSIX file filePath with write permission
		set eof of fileRef to 0
		write noteBody to fileRef as «class utf8»
		close access fileRef
	end repeat
end tell
