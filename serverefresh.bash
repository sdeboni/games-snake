#!/bin/bash

while inotifywait -qq -e attrib *.html *.css *.js; do
                                 # you might have to replace attrib in the
                                 # above line with move_self or some other
                                 # event -- see blogpost
 OWID=$(xdotool getwindowfocus)  # record which window is active right now
 RWID=$(xdotool search --name "$(<serverefresh.title)" | head -1)
                                 # the text file serverefresh.title contains
                                 # the title of the browser window to be
                                 # refreshed -- can be changed on the fly
 if [ -z "$RWID" ]; then
  echo "No such window!"         # warn if no window with that title found
  continue
 fi
 xdotool windowactivate $RWID    # activate (=click) window with title
 xdotool key F5                  # send F5 keypress
 xdotool windowactivate $OWID    # re-activate previously active window
done
