tell application "Notes"
	set notesList to every note
	repeat with n in notesList
		set noteName to the name of n
		set noteBody to the body of n
		
		-- Clean filename to remove special characters
		set safeName to do shell script "echo " & quoted form of noteName & " | tr -cd '[:alnum:]_-'" 
		
		-- Set export path to Desktop
		set filePath to (POSIX path of (path to desktop)) & "ExportedNotes/" & safeName & ".txt"
		
		-- Create folder and write the note body to the file
		do shell script "mkdir -p ~/Desktop/ExportedNotes && echo " & quoted form of noteBody & " > " & quoted form of filePath
	end repeat
end tell
