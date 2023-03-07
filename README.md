# me-xyit

Canvas animations using math expressions - no libraries or frameworks. Based on tixy.land

This started out as a re-implementation of tixy (https://tixy.land/) by Martin Kleppe @aemkei 

with several new features and better display control.

## Input fields:

- XCount - The # of columns of dots. Use '*' to calculate a reasonable value
- YCount - The # of rows of dots. Use '*' to calculate a reasonable value
- Radius - The max radius of each dot. Use '*' to calculate a reasonable value
- Draw type - The method used to draw a dot. It will toggle between 'Radius' and 'Color'
- Save - Save current expr to the preset list
- Preset buttons - Each button is a preset. click to use. right-click to delete

## The function(x,y,i,t) expression

This is the expression used to draw the dots. The expression will return a float
from 0 to 1 to determine the size. Positive is white, negative is red. Hit the enter key 
to generate a url.  The parameters to the function are:
- x ...... The column of the dot
- y ...... The row index of the dot
- i ...... The overall index of the dot
- t ...... The time in seconds. use this to animate

Hit 'enter' in the input to create a url of the current state

https://craig-fitzgerald.com/toys/xyit/