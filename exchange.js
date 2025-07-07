osascript -e '
tell application "Notes"
	set notesList to every note
	repeat with n in notesList
		set noteName to the name of n
		set noteText to the body of n
		set filePath to (POSIX path of (path to desktop)) & noteName & ".txt"
		do shell script "echo " & quoted form of noteText & " > " & quoted form of filePath
	end repeat
end tell'



osascript <<EOF
tell application "Notes"
	set noteList to every note
	repeat with n in noteList
		display dialog name of n
	end repeat
end tell
EOF
